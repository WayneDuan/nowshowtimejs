const jsonify = (data) => JSON.stringify(data);
const argsify = (str) => {
    if (typeof str === 'string') { try { return JSON.parse(str); } catch(e) { return str; } }
    return str;
};

if (typeof $config_str === 'undefined') {
    var $config_str = '{}';
}

const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA ='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'

let appConfig = {
    ver: 20240413,
    title: 'aowu',
    site: 'https://www.aowu.tv',
    tabs: [
        {
            name: '新番',
            ext: {
                id: 20,
            },
        },
        {
            name: '番剧',
            ext: {
                id: 21,
            },
        },
        {
            name: '剧场',
            ext: {
                id: 22,
            },
        },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { id, page = 1 } = ext

    const url = 'https://www.aowu.tv/index.php/ds_api/vod'
    const time = Math.round(new Date() / 1000)
    const key = md5('DS' + time + 'DCC147D11943AF75')
    const body = {
        type: id,
        class: '',
        area: '',
        lang: '',
        version: '',
        state: '',
        letter: '',
        page: page,
        time: time,
        key: key,
    }

    const { data } = await $fetch.post(url, body, {
        headers: {
            'User-Agent': UA,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    })

    const cardList = argsify(data).list
    cardList.forEach((e) => {
        let name = e.vod_name
        let pic = e.vod_pic
        let remarks = e.vod_remarks
        let id = e.vod_id
        cards.push({
            vod_id: id.toString(),
            vod_name: name,
            vod_pic: pic,
            vod_remarks: remarks || '',
            ext: {
                url: appConfig.site + e.url,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let list = []
    let url =SITE + '/' + ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    try {
        let from = []
        $('.anthology-tab .swiper-slide').each((i, e) => {
            let name = $(e).clone().children('i, span').remove().end().text().trim()
            let count = $(e).find('.badge').text().trim()
            from.push(`${name}(${count})`)
        })

        $('.anthology-list-box').each((i, e) => {
            const play_from = from[i]
            let videos = $(e).find('li a')
            let tracks = []
            videos.each((i, e) => {
                const name = $(e).text()
                const href = $(e).attr('href')
                tracks.push({
                    name: name,
                    pan: '',
                    ext: {
                        url: `${appConfig.site}${href}`,
                    },
                })
            })
            list.push({
                title: play_from,
                tracks,
            })
        })
    } catch (error) {
        $print(error)
    }

    return jsonify({
        list: list,
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    const url = ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    try {
        const $ = cheerio.load(data)
        const config = JSON.parse($('script:contains(player_)').html().replace('var player_aaaa=', ''))
        let purl = config.url
        if (config.encrypt == 2) purl = unescape(base64Decode(purl))
        const artPlayer = appConfig.site + `/player/?url=${purl}`
        const { data: artRes } = await $fetch.get(artPlayer, {
            headers: {
                'User-Agent': UA,
                Referer: url,
            },
        })

        if (artRes) {
            function decryptAES(ciphertext, key) {
                try {
                    const rawData = CryptoJS.enc.Base64.parse(ciphertext)
                    const iv = CryptoJS.lib.WordArray.create(rawData.words.slice(0, 4))
                    const encrypted = CryptoJS.lib.WordArray.create(rawData.words.slice(4))
                    const decrypted = CryptoJS.AES.decrypt({ ciphertext: encrypted }, CryptoJS.enc.Utf8.parse(key), {
                        iv: iv,
                        mode: CryptoJS.mode.CBC,
                        padding: CryptoJS.pad.Pkcs7,
                    })
                    return decrypted.toString(CryptoJS.enc.Utf8)
                } catch (e) {
                    $print(e)
                    return null
                }
            }
            const sessionKey = artRes.match(/const sessionKey\s=\s"([^"]+)"/)[1]
            const encryptedUrl = artRes.match(/const encryptedUrl\s=\s"([^"]+)"/)[1]
            const realUrl = decryptAES(encryptedUrl, sessionKey)

            return jsonify({ urls: [realUrl] })
        }
    } catch (error) {
        $print(error)
    }

    return jsonify({ urls: [] })
}

async function _showtimeSearch(ext) {
    try {
        ext = argsify(ext)
        let cards = []

        let text = encodeURIComponent(ext.text)
        let page = ext.page || 1
        if (page > 1) {
            return jsonify({
                list: cards,
            })
        }
   
        let url = appConfig.site + `/search/-------------.html?wd=${text}`

       
        let searchRes = await $fetch.get(url, {
            headers: {
                'user-agent': UA,
                // cookie: cookie,
            },
        })
        let html = searchRes.data

        const $ = cheerio.load(html)

        $('.vod-detail').each((_, element) => {
            const href = $(element).find('.detail-info > a').attr('href')
            const title = $(element).find('.detail-pic img').attr('alt')
            const cover = $(element).find('.detail-pic img').attr('data-src')
            const subTitle = $(element).find('.slide-info-remarks.cor5').text()
            cards.push({
                vod_id: href,
                vod_name: title,
                vod_pic: cover,
                vod_remarks: subTitle,
                ext: {
                    url: appConfig.site + href,
                },
            })
        })

        return jsonify({
            list: cards,
        })
    } catch (error) {
        $print(error)
    }
}

function generatePHPSESSID() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const length = 26
    let sessionId = ''

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length)
        sessionId += characters[randomIndex]
    }

    return sessionId
}

function md5(text) {
    return CryptoJS.MD5(text).toString()
}

function base64Decode(text) {
    return CryptoJS.enc.Utf8.stringify(CryptoJS.enc.Base64.parse(text))
}

function __NST_SITE() {
    return (typeof appConfig !== 'undefined' && appConfig && appConfig.site) ? appConfig.site : '';
}

// === hkdoll.js compatible API ===

async function getWebsiteInfo() {
    return {
        name: appConfig.title,
        description: appConfig.title,
        icon: __NST_SITE() + '/favicon.ico',
        homepage: __NST_SITE(),
    };
}

async function getCategories() {
    return (appConfig.tabs || []).map((tab, index) => ({
        id: String(index + 1),
        name: tab.name,
        ext: tab.ext,
    }));
}

async function getVideosByCategory(categoryId, page) {
    const categories = await getCategories();
    const category = categories.find((item) => item.id === String(categoryId));
    if (!category) return [];
    const extObj = Object.assign({}, (category && category.ext) ? category.ext : {}, { page: page || 1 });
    const raw = await getCards(JSON.stringify(extObj));
    const result = JSON.parse(raw);
    return (result.list || []).map(item => ({
        id: item.vod_id,
        title: item.vod_name,
        cover: item.vod_pic,
        url: item.ext.url,
        description: item.vod_remarks || '',
        createTime: Date.now(),
    }));
}

async function getVideoList(page, categoryUrl) {
    const extObj = { url: categoryUrl, page: page || 1 };
    const raw = await getCards(JSON.stringify(extObj));
    const result = JSON.parse(raw);
    return (result.list || []).map(item => ({
        id: item.vod_id,
        title: item.vod_name,
        cover: item.vod_pic,
        url: item.ext.url,
        description: item.vod_remarks || '',
        createTime: Date.now(),
    }));
}

async function getVideoDetail(videoId,url) {
    const extObj = { url: url, id: videoId };
    const raw = await getTracks(JSON.stringify(extObj));
    const result = JSON.parse(raw);
    const tracklist = result.list || [];
    const resolutions = [];
    for (const source of tracklist) {
        for (const track of (source.tracks || [])) {
            resolutions.push({
                id: source.title + '_' + track.name,
                name: source.title + ' - ' + track.name,
                url: JSON.stringify(track.ext || {}),
            });
        }
    }
    return {
        id: videoId,
        title: tracklist[0] ? (tracklist[0].title || '') : '',
        cover: '',
        description: '',
        resolutions,
    };
}

async function getPlayUrl(episodeUrl) {
    let ext;
    try { ext = JSON.parse(episodeUrl) } catch(e) { ext = { url: episodeUrl } }
    const raw = await getPlayinfo(JSON.stringify(ext));
    const result = JSON.parse(raw);
    return (result.urls || [])[0] || '';
}

async function search(keyword) {
    const ext = JSON.stringify({ text: keyword, page: 1 });
    const raw = await _showtimeSearch(ext);
    const result = JSON.parse(raw);
    return (result.list || []).map(item => ({
        id: item.vod_id,
        title: item.vod_name,
        cover: item.vod_pic,
        url: item.vod_id,
        description: item.vod_remarks || '',
        createTime: Date.now(),
    }));
}

module.exports = {
    getWebsiteInfo,
    getCategories,
    getVideosByCategory,
    getVideoList,
    getVideoDetail,
    getPlayUrl,
    search,
};
