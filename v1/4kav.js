const jsonify = (data) => JSON.stringify(data);
const argsify = (str) => {
    if (typeof str === 'string') { try { return JSON.parse(str); } catch(e) { return str; } }
    return str;
};

if (typeof $config_str === 'undefined') {
    var $config_str = '{}';
}

const cheerio = createCheerio()

// tv

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1'

let lastPageCache = {
    0: 1,
    1: 1,
    2: 1,
}

let appConfig = {


    ver: 1,
    title: '4k-av',
    site: 'https://4kmp.com',
    tabs: [
        {
            name: '首頁',
            ext: {
                id: 0,
                url: 'https://4kmp.com',
            },
        },
        {
            name: '電影',
            ext: {
                id: 1,
                url: 'https://4kmp.com/movie',
            },
        },
        {
            name: '電視劇',
            ext: {
                id: 2,
                url: 'https://4kmp.com/tv',
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
    let { id, page = 1, url } = ext

    if (page > 1) {
        const lastPage = Number(lastPageCache[id] || 1)
        url += `/page-${lastPage - page + 1}.html`
    }

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data || '')
    $('#MainContent_newestlist .virow .NTMitem').each((_, element) => {
        const href = $(element).find('.title a').attr('href') || ''
        const title = ($(element).find('.title h2').text() || '').trim()
        const cover = $(element).find('.poster img').attr('src') || ''
        const subTitle = (($(element).find('label[title=分辨率]').text() || '').split('/')[0] || '').trim()
        if (!href) return
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: `${appConfig.site}${href}`,
            },
        })
    })

    if (page == 1) {
        const pageNumber = ($('#MainContent_header_nav .page-number').text() || '').trim()
        const num = Number((pageNumber.split('/')[1] || '').trim())
        if (num > 0 && id != null) {
            lastPageCache[id] = num
        }
    }

    return jsonify({
        list: cards,
    })
}

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let url = ext.url

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data || '')
    const playlist = $('#rtlist li')
    if (playlist.length > 0) {
        playlist.each((_, element) => {
            let name = ($(element).find('span').text() || '').trim()
            let playUrl = $(element).find('img').attr('src') || ''
            playUrl = playUrl.replace('screenshot.jpg', '')
            if (!playUrl) return
            tracks.push({
                name: name,
                pan: '',
                ext: {
                    url: playUrl,
                },
            })
        })
    } else {
        tracks.push({
            name: '播放',
            pan: '',
            ext: {
                url,
            },
        })
    }

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
    ext = argsify(ext)
    let url = ext.url.replace('www.', '')

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data || '')
    let playUrl = $('#MainContent_videowindow video source').attr('src') || ''

    return jsonify({ urls: [playUrl] })
}

async function _showtimeSearch(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let url = appConfig.site + `/s?q=${text}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data || '')
    $('#MainContent_newestlist .virow .NTMitem').each((_, element) => {
        const href = $(element).find('.title a').attr('href') || ''
        const title = ($(element).find('.title h2').text() || '').trim()
        const cover = $(element).find('.poster img').attr('src') || ''
        const subTitle = (($(element).find('label[title=分辨率]').text() || '').split('/')[0] || '').trim()
        if (!href) return
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: subTitle,
            ext: {
                url: `${appConfig.site}${href}`,
            },
        })
    })

    return jsonify({
        list: cards,
    })
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
