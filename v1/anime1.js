const cheerio = createCheerio()

let UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

let appConfig = {
    ver: 20251206,
    title: 'anime1',
    site: 'https://anime1.me',
    tabs: [
        {
            id: '1',
            name: 'list',
            ext: {},
        },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1 } = ext

    if (page > 1) return
    try {
        const url = appConfig.site + `/animelist.json`
        const { data } = await $fetch.get(url, {
            headers: {
                'User-Agent': UA,
            },
        })

        argsify(data).forEach((e) => {
            cards.push({
                vod_id: `${e[0]}`,
                vod_name: e[1],
                vod_pic: '',
                vod_remarks: e[2] || '',
                vod_pubdate: e[3] || '',
                ext: {
                    id: `${e[0]}`,
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

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let { id, href } = ext
    let url = href ? href : appConfig.site + `/?cat=${id}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)
    $('#main > article').each((_, e) => {
        let name = $(e).find('.entry-title a').text()
        let href = $(e).find('.entry-title a').attr('href')

        tracks.push({
            name,
            pan: '',
            ext: {
                href,
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
    ext = argsify(ext)
    let { href } = ext
    let api = 'https://v.anime1.me/api'
    try {
        const { data } = await $fetch.get(href, {
            headers: { 'User-Anent': UA },
        })
        const $ = cheerio.load(data)
        let apireq = $('.vjscontainer > video').attr('data-apireq')
        const apires = await $fetch.post(api, `d=${apireq}`, {
            headers: {
                'User-Agent': UA,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        let playUrl = argsify(apires.data).s[0].src
        let headers = apires.respHeaders

        let set_cookie = headers['Set-Cookie']
        let cookie = ''
        set_cookie.split(',').forEach((e) => {
            cookie += `${e.split(';')[0]}; `
        })

        playUrl = playUrl.startsWith('https:') ? playUrl : 'https:' + playUrl
        return jsonify({ urls: [playUrl], headers: [{ 'User-Agent': UA, Cookie: cookie }] })
    } catch (error) {
        $print(error)
    }
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    const text = encodeURIComponent(ext.text)
    const page = ext.page || 1
    const url = `${appConfig.site}/page/${page}?s=${text}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    try {
        const $ = cheerio.load(data)
        $('#main > article').each((_, e) => {
            let name = $(e).find('.entry-footer .cat-links a').text()
            let href = $(e).find('.entry-footer .cat-links a').attr('href')

            cards.push({
                vod_id: href,
                vod_name: name,
                vod_pic: '',
                ext: {
                    href,
                },
            })
        })
    } catch (error) {
        console.log(error)
    }

    return jsonify({
        list: cards,
    })
}
const __NST_SOURCE__ = (() => {
  const g = (typeof globalThis !== 'undefined') ? globalThis : this;

  if (typeof g.$config_str === 'undefined') g.$config_str = '{}';

  if (typeof g.argsify !== 'function') {
    g.argsify = function(v) {
      if (v == null) return {};
      if (typeof v === 'string') {
        try { return JSON.parse(v); } catch (_) { return {}; }
      }
      if (typeof v === 'object') return v;
      return {};
    };
  }

  if (typeof g.jsonify !== 'function') {
    g.jsonify = function(v) {
      try { return JSON.stringify(v); } catch (_) { return '{}'; }
    };
  }

const cheerio = createCheerio()

let UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'

let appConfig = {
    ver: 20251206,
    title: 'anime1',
    site: 'https://anime1.me',
    tabs: [
        {
            id: '1',
            name: 'list',
            ext: {},
        },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1 } = ext

    if (page > 1) return
    try {
        const url = appConfig.site + `/animelist.json`
        const { data } = await $fetch.get(url, {
            headers: {
                'User-Agent': UA,
            },
        })

        argsify(data).forEach((e) => {
            cards.push({
                vod_id: `${e[0]}`,
                vod_name: e[1],
                vod_pic: '',
                vod_remarks: e[2] || '',
                vod_pubdate: e[3] || '',
                ext: {
                    id: `${e[0]}`,
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

async function getTracks(ext) {
    ext = argsify(ext)
    let tracks = []
    let { id, href } = ext
    let url = href ? href : appConfig.site + `/?cat=${id}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)
    $('#main > article').each((_, e) => {
        let name = $(e).find('.entry-title a').text()
        let href = $(e).find('.entry-title a').attr('href')

        tracks.push({
            name,
            pan: '',
            ext: {
                href,
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
    ext = argsify(ext)
    let { href } = ext
    let api = 'https://v.anime1.me/api'
    try {
        const { data } = await $fetch.get(href, {
            headers: { 'User-Anent': UA },
        })
        const $ = cheerio.load(data)
        let apireq = $('.vjscontainer > video').attr('data-apireq')
        const apires = await $fetch.post(api, `d=${apireq}`, {
            headers: {
                'User-Agent': UA,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })

        let playUrl = argsify(apires.data).s[0].src
        let headers = apires.respHeaders

        let set_cookie = headers['Set-Cookie']
        let cookie = ''
        set_cookie.split(',').forEach((e) => {
            cookie += `${e.split(';')[0]}; `
        })

        playUrl = playUrl.startsWith('https:') ? playUrl : 'https:' + playUrl
        return jsonify({ urls: [playUrl], headers: [{ 'User-Agent': UA, Cookie: cookie }] })
    } catch (error) {
        $print(error)
    }
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    const text = encodeURIComponent(ext.text)
    const page = ext.page || 1
    const url = `${appConfig.site}/page/${page}?s=${text}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    try {
        const $ = cheerio.load(data)
        $('#main > article').each((_, e) => {
            let name = $(e).find('.entry-footer .cat-links a').text()
            let href = $(e).find('.entry-footer .cat-links a').attr('href')

            cards.push({
                vod_id: href,
                vod_name: name,
                vod_pic: '',
                ext: {
                    href,
                },
            })
        })
    } catch (error) {
        console.log(error)
    }

    return jsonify({
        list: cards,
    })
}


  return {
    getConfig: (typeof getConfig === 'function') ? getConfig : null,
    getTabs: (typeof getTabs === 'function') ? getTabs : null,
    getCards: (typeof getCards === 'function') ? getCards : null,
    getTracks: (typeof getTracks === 'function') ? getTracks : null,
    getPlayinfo: (typeof getPlayinfo === 'function') ? getPlayinfo : null,
    search: (typeof search === 'function') ? search : null
  };
})();

function __nstParseMaybe(value) {
  if (value == null) return null;
  if (typeof value === 'string') {
    try { return JSON.parse(value); } catch (_) { return null; }
  }
  if (typeof value === 'object') return value;
  return null;
}

function __nstNormalizeCard(item) {
  const card = item || {};
  const ext = (card.ext && typeof card.ext === 'object') ? card.ext : {};

  const id = card.vod_id || card.id || ext.id || ext.url || ext.href || card.url || '';
  const title = card.vod_name || card.title || 'Untitled';
  const cover = card.vod_pic || card.cover || '';
  const url = ext.url || ext.href || card.url || card.vod_id || '';

  const descParts = [
    card.vod_remarks,
    card.vod_duration,
    card.vod_pubdate,
    card.description,
  ].filter(Boolean);

  return {
    id: String(id),
    title: String(title),
    cover: String(cover || ''),
    url: String(url || ''),
    description: descParts.join(' · ')
  };
}

function __nstIconFromSite(site) {
  const raw = String(site || '').trim();
  if (!raw) return '';
  const m = raw.match(/^(https?:\/\/[^/]+)/i);
  const base = (m && m[1]) ? m[1] : raw.replace(/\/+$/, '');
  return base ? (base + '/favicon.ico') : '';
}

function __nstTabId(tab, index) {
  if (!tab) return String(index);
  if (tab.id != null) return String(tab.id);
  if (tab.ext && tab.ext.id != null) return String(tab.ext.id);
  if (tab.name != null) return String(tab.name);
  return String(index);
}

function __nstPickTab(configObj, categoryId) {
  const tabs = Array.isArray(configObj.tabs) ? configObj.tabs : [];
  const cid = String(categoryId || '');
  return tabs.find((t, i) => __nstTabId(t, i) === cid) || tabs[0] || null;
}

async function __nstGetConfigObject() {
  if (!__NST_SOURCE__.getConfig) return {};
  return __nstParseMaybe(await __NST_SOURCE__.getConfig()) || {};
}

async function __nstGetTabsArray(configObj) {
  if (Array.isArray(configObj.tabs) && configObj.tabs.length > 0) return configObj.tabs;
  if (__NST_SOURCE__.getTabs) {
    const tabObj = __nstParseMaybe(await __NST_SOURCE__.getTabs()) || {};
    if (Array.isArray(tabObj.list)) return tabObj.list;
  }
  return [];
}

async function __nstFetchCards(tab, page) {
  if (!__NST_SOURCE__.getCards) return [];

  const ext = Object.assign({}, (tab && tab.ext && typeof tab.ext === 'object') ? tab.ext : {});
  ext.page = Number(page) || 1;

  const cardsObj = __nstParseMaybe(await __NST_SOURCE__.getCards(JSON.stringify(ext))) || {};
  const list = Array.isArray(cardsObj.list) ? cardsObj.list : [];

  return list.map(__nstNormalizeCard).filter(v => v.id && v.title);
}

async function getWebsiteInfo() {
  const cfg = await __nstGetConfigObject();
  const homepage = String(cfg.site || '');
  return {
    name: String(cfg.title || 'XPTV'),
    description: 'Converted for app compatibility',
    icon: __nstIconFromSite(homepage),
    homepage
  };
}

async function getCategories() {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  return tabs.map((tab, i) => ({
    id: __nstTabId(tab, i),
    name: String((tab && tab.name) || ('分类' + (i + 1))),
    ext: (tab && tab.ext) || {}
  }));
}

async function getVideoList(page) {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  return __nstFetchCards(tabs[0] || null, page || 1);
}

async function getVideosByCategory(categoryId, page) {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  const workingCfg = Object.assign({}, cfg, { tabs });
  return __nstFetchCards(__nstPickTab(workingCfg, categoryId), page || 1);
}

async function getVideoDetail(videoId, videoUrl) {
  const srcUrl = String(videoUrl || videoId || '');
  const req = { id: String(videoId || ''), url: srcUrl, href: srcUrl };

  let tracksObj = null;
  if (__NST_SOURCE__.getTracks) {
    tracksObj = __nstParseMaybe(await __NST_SOURCE__.getTracks(JSON.stringify(req)));
  }

  const resolutions = [];
  const groups = (tracksObj && Array.isArray(tracksObj.list)) ? tracksObj.list : [];

  for (const group of groups) {
    const tracks = Array.isArray(group && group.tracks) ? group.tracks : [];
    for (const t of tracks) {
      const nm = String((t && t.name) || '自动');
      const extObj = (t && t.ext && typeof t.ext === 'object') ? t.ext : null;
      let tu = '';
      if (extObj) {
        const direct = String(
          extObj.play || extObj.playurl || extObj.id || extObj.url || extObj.href ||
          extObj.playUrl || extObj.src || t.url || ''
        );
        const keys = Object.keys(extObj);
        if (keys.length > 1 || (keys.length === 1 && !('url' in extObj || 'href' in extObj || 'playUrl' in extObj || 'src' in extObj || 'id' in extObj || 'playurl' in extObj || 'play' in extObj))) {
          try { tu = JSON.stringify(extObj); } catch (_) { tu = direct; }
        }
        if (!tu) tu = direct;
      } else {
        tu = String(t.url || '');
      }
      if (!tu) continue;
      resolutions.push({ id: nm, name: nm, url: tu, size: '' });
    }
  }

  if (!resolutions.length && srcUrl) {
    resolutions.push({ id: 'auto', name: '自动', url: srcUrl, size: '' });
  }

  return {
    id: String(videoId || srcUrl || ''),
    title: String(videoId || 'Video'),
    cover: '',
    description: '',
    resolutions
  };
}

async function getPlayUrl(episodeUrl) {
  const src = String(episodeUrl || '');
  if (!src) return src;

  let playCandidate = src;
  let reqObj = null;

  const srcObj = __nstParseMaybe(src);
  if (srcObj && typeof srcObj === 'object' && !Array.isArray(srcObj)) {
    reqObj = Object.assign({}, srcObj);
    playCandidate = String(
      reqObj.play || reqObj.playurl || reqObj.id || reqObj.url || reqObj.href ||
      reqObj.playUrl || reqObj.src || src
    );
  }

  if (/^https?:\/\//i.test(playCandidate) && !/\.(m3u8|mp4)(\?|$)/i.test(playCandidate) && __NST_SOURCE__.getTracks) {
    try {
      const tracksObj = __nstParseMaybe(await __NST_SOURCE__.getTracks(JSON.stringify({ url: playCandidate, href: playCandidate, id: playCandidate }))) || {};
      const groups = Array.isArray(tracksObj.list) ? tracksObj.list : [];
      for (const group of groups) {
        const tracks = Array.isArray(group && group.tracks) ? group.tracks : [];
        for (const t of tracks) {
          const extObj = (t && t.ext && typeof t.ext === 'object') ? t.ext : null;
          const tu = String((extObj && (extObj.play || extObj.playurl || extObj.id || extObj.url || extObj.href || extObj.playUrl || extObj.src)) || t.url || '');
          if (tu) {
            playCandidate = tu;
            break;
          }
        }
        if (playCandidate !== src) break;
      }
    } catch (_) {}
  }

  if (!__NST_SOURCE__.getPlayinfo) return playCandidate;

  const req = reqObj && typeof reqObj === 'object'
    ? Object.assign({}, reqObj, {
        play: reqObj.play || reqObj.playurl || reqObj.playUrl || reqObj.id || reqObj.url || reqObj.href || reqObj.src || playCandidate,
        playurl: reqObj.playurl || reqObj.play || reqObj.playUrl || reqObj.id || reqObj.url || reqObj.href || reqObj.src || playCandidate,
        id: reqObj.id || reqObj.url || reqObj.href || reqObj.play || reqObj.playUrl || reqObj.playurl || reqObj.src || playCandidate,
        url: reqObj.url || reqObj.href || reqObj.id || reqObj.play || reqObj.playurl || reqObj.playUrl || playCandidate,
        href: reqObj.href || reqObj.url || reqObj.id || reqObj.play || reqObj.playurl || playCandidate,
        playUrl: reqObj.playUrl || reqObj.play || reqObj.playurl || reqObj.id || reqObj.url || reqObj.href || playCandidate,
        src: reqObj.src || reqObj.id || reqObj.play || reqObj.playurl || reqObj.href || playCandidate
      })
    : { play: playCandidate, playurl: playCandidate, id: playCandidate, url: playCandidate, href: playCandidate, playUrl: playCandidate, src: playCandidate };

  const ret = __nstParseMaybe(await __NST_SOURCE__.getPlayinfo(JSON.stringify(req))) || {};
  const urls = Array.isArray(ret.urls) ? ret.urls : [];
  if (urls.length && urls[0]) return String(urls[0]);
  const single = ret.play || ret.playurl || ret.id || ret.url || ret.href || ret.playUrl || ret.src || '';
  if (single) return String(single);
  return String(req.play || req.playurl || req.id || req.playUrl || req.url || playCandidate);
}

async function search(keyword, page) {
  if (!__NST_SOURCE__.search) return [];

  const ret = __nstParseMaybe(await __NST_SOURCE__.search(JSON.stringify({ text: String(keyword || ''), page: Number(page) || 1 }))) || {};
  const list = Array.isArray(ret.list) ? ret.list : [];
  return list.map(__nstNormalizeCard).filter(v => v.id && v.title);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getWebsiteInfo,
    getCategories,
    getVideoList,
    getVideosByCategory,
    getVideoDetail,
    getPlayUrl,
    search,
  };
}
