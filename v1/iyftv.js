const jsonify = (data) => JSON.stringify(data);
const argsify = (str) => {
    if (typeof str === 'string') { try { return JSON.parse(str); } catch(e) { return str; } }
    return str;
};

const cheerio = createCheerio()
const CryptoJS = createCryptoJS()

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.3'

let appConfig = {


    ver: 1,
    title: '愛壹帆',
    site: 'https://m10.iyf.tv',
    tabs: [
        {
            name: '电影',
            ext: {
                id: '3',
            },
        },
        {
            name: '电视',
            ext: {
                id: '4',
            },
        },
        {
            name: '综艺',
            ext: {
                id: '5',
            },
        },
        {
            name: '动漫',
            ext: {
                id: '6',
            },
        },
        {
            name: '短剧',
            ext: {
                id: '4,155',
            },
        },
        {
            name: '体育',
            ext: {
                id: '95',
            },
        },
        {
            name: '纪录片',
            ext: {
                id: '7',
            },
        },
    ],
}

async function getConfig() {
    await ensureKeys()
    return jsonify(appConfig)
}

async function ensureKeys() {
    if (!$cache.get('iyf-keys')) {
        await updateKeys()
    }
}

async function getCards(ext) {
    await ensureKeys()
    ext = argsify(ext)
    let keys = $cache.get('iyf-keys')
    const publicKey = JSON.parse(keys).publicKey
    let cards = []
    let { id, page = 1 } = ext

    let url = `${appConfig.site}/api/list/Search?cinema=1&page=${page}&size=36&orderby=0&desc=1&cid=0,1,${id}&isserial=-1&isIndex=-1&isfree=-1`
    let params = url.split('?')[1]
    url += `&vv=${getSignature(params)}&pub=${publicKey}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    let list = argsify(data).data.info[0].result

    list.forEach((e) => {
        cards.push({
            vod_id: e.key,
            vod_name: e.title,
            vod_pic: e.image,
            vod_remarks: e.cid,
            ext: {
                key: e.key,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    await ensureKeys()
    ext = argsify(ext)
    const publicKey = JSON.parse($cache.get('iyf-keys')).publicKey
    let tracks = []
    let key = ext.key

    let url = `${appConfig.site}/v3/video/languagesplaylist?cinema=1&vid=${key}&lsk=1&taxis=0&cid=0,1,4,133`
    let params = url.split('?')[1]
    url += `&vv=${getSignature(params)}&pub=${publicKey}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    let playlist = argsify(data).data.info[0].playList
    playlist.forEach((e) => {
        const name = e.name
        const key = e.key
        tracks.push({
            name: name,
            pan: '',
            ext: {
                key: key,
            },
        })
    })

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks,
            },
        ],
    })
}

async function getPlayinfo(ext) {
    await ensureKeys()
    ext = argsify(ext)
    const publicKey = JSON.parse($cache.get('iyf-keys')).publicKey
    let key = ext.key
    let url = `${appConfig.site}/v3/video/play?cinema=1&id=${key}&a=0&lang=none&usersign=1&region=GL.&device=1&isMasterSupport=1`
    let params = url.split('?')[1]
    url += `&vv=${getSignature(params)}&pub=${publicKey}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    let paths = argsify(data).data.info[0].flvPathList
    let playUrl = ''
    paths.forEach(async (e) => {
        if (e.isHls) {
            let link = e.result
            link += `?vv=${getSignature('')}&pub=${publicKey}`
            playUrl = link
        }
    })

    return jsonify({ urls: [playUrl] })
}

async function _showtimeSearch(ext) {
    await ensureKeys()
    ext = argsify(ext)
    let cards = []

    const text = encodeURIComponent(ext.text)
    const page = ext.page || 1
    const url = `https://rankv21.iyf.tv/v3/list/briefsearch?tags=${text}&orderby=4&page=${page}&size=10&desc=0&isserial=-1&istitle=true`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    let list = argsify(data).data.info[0].result
    list.forEach((e) => {
        cards.push({
            vod_id: e.contxt,
            vod_name: e.title,
            vod_pic: e.imgPath,
            vod_remarks: e.cid,
            ext: {
                key: e.contxt,
            },
        })
    })

    return jsonify({
        list: cards,
    })
}

async function updateKeys() {
    let baseUrl = 'https://www.iyf.tv'
    console.log('[iyftv] updateKeys: fetching', baseUrl)
    let { data } = await $fetch.get(baseUrl, {
        headers: {
            'User-Agent': UA,
        },
    })
    console.log('[iyftv] updateKeys: got data len=' + (data ? data.length : 0))
    if (!data) { console.log('[iyftv] updateKeys: empty data'); return; }
    // 用正则从原始 HTML 中提取 injectJson，不依赖 cheerio
    const match = data.match(/var\s+injectJson\s*=\s*(\{[\s\S]*?\});/)
    console.log('[iyftv] updateKeys: match=' + (match ? 'yes len=' + match[1].length : 'NO'))
    if (match) {
        let json = JSON.parse(match[1])
        let publicKey = json['config'][0]['pConfig']['publicKey']
        let privateKey = json['config'][0]['pConfig']['privateKey']
        console.log('[iyftv] updateKeys: publicKey=' + publicKey + ' privateKey.len=' + (privateKey ? privateKey.length : 0))
        let keys = {
            publicKey: publicKey,
            privateKey: privateKey,
        }
        $cache.set('iyf-keys', JSON.stringify(keys))
        console.log('[iyftv] updateKeys: keys cached')
    } else {
        console.log('[iyftv] updateKeys: injectJson not found in page')
    }
}

function getSignature(query) {
    const publicKey = JSON.parse($cache.get('iyf-keys')).publicKey
    const privateKey = getPrivateKey()
    const input = publicKey + '&' + query.toLowerCase() + '&' + privateKey

    return CryptoJS.MD5(CryptoJS.enc.Utf8.parse(input)).toString()
}

function getPrivateKey() {
    const privateKey = JSON.parse($cache.get('iyf-keys')).privateKey
    const timePublicKeyIndex = Date.now()

    return privateKey[timePublicKeyIndex % privateKey.length]
}

const SITE = appConfig.site;

// === hkdoll.js compatible API ===

async function getWebsiteInfo() {
    return {
        name: appConfig.title,
        description: appConfig.title,
        icon: SITE + '/favicon.ico',
        homepage: SITE,
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
    const extObj = { ...category.ext, page: page || 1 };
    const raw = await getCards(JSON.stringify(extObj));
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

async function getVideoList(page, categoryUrl) {
    const extObj = { url: categoryUrl, page: page || 1 };
    const raw = await getCards(JSON.stringify(extObj));
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

async function getVideoDetail(videoId) {
    const extObj = { url: videoId, id: videoId };
    const raw = await getTracks(JSON.stringify(extObj));
    const result = JSON.parse(raw);
    // getTracks returns: { list: [ { title: "线路名", tracks: [{name, pan, ext:{...}}] } ] }
    const tracklist = result.list || [];
    const resolutions = [];
    for (const source of tracklist) {
        for (const track of (source.tracks || [])) {
            if (resolutions.find(r => r.id === source.title + '_' + track.name)) continue;
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
