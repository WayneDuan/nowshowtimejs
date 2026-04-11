const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36 Edg/131.0.0.0'

const SITE = 'https://www.7sefun.top'

let appConfig = {
    ver: 20260314,
    title: '七色番',
    site: SITE,
    tabs: [
        { name: 'TV番劇', ext: { id: '1' } },
        { name: '国漫', ext: { id: '5' } },
        { name: '剧场电影', ext: { id: '2' } },
        { name: '特摄剧', ext: { id: '4' } },
    ],
}

// 各线路解析配置
const playerConfig = {
    '2bdm': { show: '七色R线', parse: '' },
    lmm: { show: '七色A线', parse: 'https://dp.no3acg.com/player/ec.php?code=qw&if=1&from=lmm&url=' },
    H265: { show: '高清H265', parse: '' },
    CYDD1: { show: '七色C线', parse: '' },
    ndx: { show: '七色B线', parse: '' },
    funzy: { show: '日漫高清', parse: 'https://nplayer.7sefun.top/player/index.php?code=qw&url=' },
    funzycn: { show: '国语高清', parse: '' },
    funzy4K: { show: '4K超清', parse: '' },
    tsfun: { show: '特摄', parse: '' },
    sssfun: { show: '日漫流畅版', parse: 'https://www.7sefun.com/jx.php?url=' },
    sssfuncn: { show: '国语流畅', parse: '' },
    gmfun: { show: '国漫', parse: '' },
    gmfun4k: { show: '国漫4K', parse: '' },
    funzyjp: { show: '日配版', parse: '' },
    mmfun: { show: '美漫', parse: '' },
    '7sefun': { show: '七色番', parse: 'https://play.7sefun.com/?url=' },
    dplayer: { show: '七色', parse: '' },
    MIPFS: { show: 'M线', parse: '' },
    lzm3u8: { show: '备用有广告版', parse: 'https://mf.qiau.cn/json.php?url=' },
}

// ── 基础工具 ────────────────────────────────────────────

async function getWebsiteInfo() {
    return {
        name: appConfig.title,
        description: appConfig.title,
        icon: SITE + '/favicon.ico',
        homepage: SITE,
    }
}

async function getCategories() {
    return appConfig.tabs.map((tab, index) => ({
        id: String(index + 1),
        name: tab.name,
        ext: tab.ext,
    }))
}

async function getVideosByCategory(categoryId, page) {
    const categories = await getCategories()
    const category = categories.find(item => item.id === String(categoryId))
    if (!category) return []
    const id = category.ext.id
    const url = `${SITE}/vodshow/${id}--time------${page || 1}---.html`
    return _fetchVideoList(url)
}

async function getVideoList(page, categoryUrl) {
    const url = `${SITE}/vodshow/1--time------${page || 1}---.html`
    return _fetchVideoList(categoryUrl || url)
}

async function _fetchVideoList(url) {
    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data || '')
    const list = []
    $('div.video').each((_, el) => {
        const href = $(el).find('a.video-wrapper').attr('href') || ''
        const title = $(el).find('.video-name').text().trim()
        const cover = $(el).find('img.videoimg').attr('src') || ''
        const remark = $(el).find('.video-view').text().trim()
        if (!href) return
        list.push({
            id: href,
            title: title || '未知标题',
            cover,
            url: href,
            description: remark,
            createTime: Date.now(),
        })
    })
    return list
}

// ── getVideoDetail：只抓集数列表，不预解析播放地址 ──────

async function getVideoDetail(videoId) {
    // videoId 是集数页路径，如 /vod/detail/12345.html
    const url = SITE + '/' + videoId.replace(/^\//, '')
    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data || '')

    const title = $('h2.title').text().trim() || $('title').text().split('-')[0].trim() || ''
    const cover = $('img.lazyload').attr('data-src') || ''
    const desc = $('p.sketch').text().trim() || ''

    const sources = []   // 每个播放源（线路）
    const tracks = []   // 线路名称列表

    // 线路名（.chat-stream-bfq）
    $('.chat-stream .chat-header.anim').each((_, e) => {
        tracks.push($(e).find('.chat-stream-bfq').text().trim())
    })

    // 每个线路的集数列表
    $('.vod-play-list-container').each((i, e) => {
        const sourceName = tracks[i] || `线路${i + 1}`
        $(e).find('span').each((_, el) => {
            const name = $(el).find('a').text().trim()
            const href = $(el).find('a').attr('href') || ''
            if (!href) return
            sources.push({
                id: `${sourceName}_${name}`,
                name: `${sourceName} - ${name}`,
                // 存储集数播放页 URL，点击时由 getPlayUrl 解析真实地址
                url: JSON.stringify({ url: SITE + href }),
            })
        })
    })

    return {
        id: videoId,
        title,
        cover,
        description: desc,
        resolutions: sources,
    }
}

// ── getPlayUrl：点击某集时调用，解析真实播放地址 ─────────

async function getPlayUrl(episodeUrl) {
    let ext
    try { ext = JSON.parse(episodeUrl) } catch (e) { ext = { url: episodeUrl } }

    const pageUrl = ext.url
    if (!pageUrl) return ''

    const { data } = await $fetch.get(pageUrl, { headers: { 'User-Agent': UA } })
    if (!data) { console.log('[getPlayUrl] empty response:', pageUrl); return '' }

    // 用正则提取 player_aaaa（不用 cheerio :contains，JSCore 兼容性差）
    const match = data.match(/var\s+player_aaaa\s*=\s*(\{[\s\S]*?\})\s*(?:<\/script>|var\s)/)
    if (!match) { console.log('[getPlayUrl] player_aaaa not found in', pageUrl); return '' }

    let config
    try { config = JSON.parse(match[1]) }
    catch (e) { console.log('[getPlayUrl] JSON parse error:', String(e)); return '' }

    const from = config.from || ''
    const encrypt = parseInt(config.encrypt) || 0
    const rawUrl = config.url || ''

    console.log('[getPlayUrl] from:', from, 'encrypt:', encrypt, 'rawUrl(50):', rawUrl.slice(0, 50))

    // ── Case 1: 直接 m3u8 ──
    if (rawUrl.includes('.m3u8')) return rawUrl

    // ── Case 2: encrypt=1，简单 base64 ──
    if (encrypt === 1) {
        try { return decodeURIComponent(atob(rawUrl)) } catch (e) { return rawUrl }
    }

    // ── Case 3: encrypt=2，base64 + 可能需要解析器 ──
    if (encrypt === 2) {
        let videoUrl = rawUrl
        try { videoUrl = decodeURIComponent(atob(rawUrl)) } catch (e) { }

        console.log('[getPlayUrl] decoded videoUrl:', videoUrl.slice(0, 80))

        // 已经是直链（m3u8 / mp4 / flv 等），直接返回
        if (videoUrl.match(/\.(m3u8|mp4|flv|avi|mkv|ts)(\?|$)/i)) {
            return videoUrl
        }

        const jxUrl = (playerConfig[from] || {}).parse || ''
        console.log('[getPlayUrl] jxUrl:', jxUrl)

        if (jxUrl.includes('ec.php')) {
            // ec.php 返回 AES 加密的播放地址
            const { data: jxData } = await $fetch.get(jxUrl + videoUrl, { headers: { 'User-Agent': UA } })
            if (!jxData) { console.log('[getPlayUrl] ec.php empty response'); return '' }

            const confMatch = jxData.match(/ConFig\s*=\s*(\{[\s\S]*?\})\s*,\s*box/)
            if (!confMatch) { console.log('[getPlayUrl] ConFig not found'); return '' }

            let ConFig
            try { ConFig = JSON.parse(confMatch[1]) }
            catch (e) { console.log('[getPlayUrl] ConFig parse error:', String(e)); return '' }

            const key = '2890' + ConFig.config.uid + 'tB959C'
            const iv = '2F131BE91247866E'
            const playUrl = _aesDecryptCBC(ConFig.url, key, iv)
            console.log('[getPlayUrl] AES decrypted:', playUrl.slice(0, 80))
            return playUrl
        }

        // 其他有 parse URL 的线路：拼接后交给解析器
        if (jxUrl) return jxUrl + videoUrl

        // 没有 parse 且不是直接媒体地址：尝试 index.php / art.php
        const id = (config.link || '').split('/').pop().split('-')[0]
        if (id) {
            const indexUrl = `${SITE}/addons/dp/player/index.php?key=0&id=${id}&uid=0&from=${from}&url=${videoUrl}`
            const { data: indexData } = await $fetch.get(indexUrl, { headers: { 'User-Agent': UA } })
            if (indexData) {
                const hrefMatch = indexData.match(/href="([^"]+art\.php[^"]*)"/)
                if (hrefMatch) {
                    const playerUrl = SITE + hrefMatch[1]
                    const { data: artData } = await $fetch.get(playerUrl, { headers: { 'User-Agent': UA } })
                    if (artData) {
                        const artMatch = artData.match(/config\s*=\s*(\{[\s\S]*?\})\s*if\s*\(/)
                        if (artMatch) {
                            try {
                                const artConfig = new Function('return ' + artMatch[1])()
                                if (artConfig.url) return artConfig.url
                            } catch (e) { }
                        }
                    }
                }
            }
        }

        // 最终兜底：返回解码后的 videoUrl（而非原始 base64）
        return videoUrl
    }

    return rawUrl || ''
}

// ── 搜索 ────────────────────────────────────────────────

async function search(keyword) {
    const text = encodeURIComponent(keyword)
    const url = `${SITE}/vodsearch/${text}----------1---.html`
    const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
    const $ = cheerio.load(data || '')
    const list = []
    $('div.video').each((_, el) => {
        const href = $(el).find('a.video-wrapper').attr('href') || ''
        const title = $(el).find('img.videoimg').attr('alt') || ''
        const cover = $(el).find('img.videoimg').attr('src') || ''
        const remark = $(el).find('.video-time').text().trim()
        if (!href) return
        list.push({
            id: href,
            title: title || '未知标题',
            cover,
            url: href,
            description: remark,
            createTime: Date.now(),
        })
    })
    return list
}

module.exports = {
    getWebsiteInfo,
    getCategories,
    getVideosByCategory,
    getVideoList,
    getVideoDetail,
    getPlayUrl,
    search,
}
