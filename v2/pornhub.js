/*
 * Local editable adapter
 * Site: Pornhub
 *
 * This file is intentionally local-first (no remote SOURCE_URL / no eval).
 */

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

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SITE = '';
let appConfig = {
    ver: 1,
    title: 'pornhub',
    site: 'https://cn.pornhub.com',
    tabs: [
        {
            name: 'home',
            ext: {
                id: 'sy',
            },
            ui: 1,
        },
        {
            name: 'newest',
            ext: {
                id: 'cm',
            },
            ui: 1,
        },
        {
            name: 'most viewed',
            ext: {
                id: 'mv',
            },
            ui: 1,
        },
        {
            name: 'hottest',
            ext: {
                id: 'ht',
            },
            ui: 1,
        },
        {
            name: 'top rated',
            ext: {
                id: 'tr',
            },
            ui: 1,
        },
    ],
}

async function getConfig() {
    return jsonify(appConfig)
}

async function getCards(ext) {
  ext = argsify(ext)
  const cards = []
  const { page = 1, id } = ext

  let url = `${appConfig.site}/video?`
  if (id && id !== 'sy') url = `${appConfig.site}/video?o=${id}`
  if (Number(page) > 1) url += (url.includes('?') && !url.endsWith('?') ? '&' : '') + `page=${page}`

  const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
  const $ = cheerio.load(data)

  const toAbs = (u) => {
    const s = String(u || '').trim()
    if (!s) return ''
    if (/^https?:\/\//i.test(s)) return s
    return appConfig.site + s
  }
  console.log($('li[class=" withKebabMenu"]').first().html())
  $('li[class=" withKebabMenu"]').each((_, el) => {
    const root = $(el)

    const href = root.find('a.linkVideoThumb').attr('href')
      || root.find('span.title a').attr('href')
      || ''

    const title = root.find('span.title a').attr('title')
      || root.find('span.title a').text().trim()
      || root.find('img').attr('alt')
      || ''

    const cover = root.find('img').attr('src')
      || root.find('img').attr('data-image')
      || ''

    const views = root.find('span.views var').first().text().trim()
    const duration = root.find('var.duration').first().text().trim()

    if (!href || !title) return
    cards.push({
      vod_id: href,
      vod_name: title,
      vod_pic: toAbs(cover),
      vod_remarks: views,
      vod_duration: duration,
      ext: { url: toAbs(href) },
    })
  })

  return jsonify({ list: cards })
}

async function search(ext) {
  ext = argsify(ext)
  const text = encodeURIComponent(ext.text || '')
  const page = Number(ext.page || 1)
  const url = `${appConfig.site}/video/search?search=${text}&page=${page}`

  const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })
  const $ = cheerio.load(data)
  const cards = []
  const toAbs = (u) => /^https?:\/\//i.test(String(u || '')) ? String(u) : (appConfig.site + String(u || ''))

   $('li[class=" withKebabMenu"]').each((_, el) => {
    const root = $(el)
    const href = root.find('a.linkVideoThumb').attr('href')
      || root.find('span.title a').attr('href')
      || ''
    const title = root.find('span.title a').attr('title')
      || root.find('span.title a').text().trim()
      || root.find('img').attr('alt')
      || ''
    const cover = root.find('img').attr('src')
      || root.find('img').attr('data-image')
      || ''
    const views = root.find('span.views var').first().text().trim()
    const duration = root.find('var.duration').first().text().trim()

    if (!href || !title) return
    cards.push({
      vod_id: href,
      vod_name: title,
      vod_pic: toAbs(cover),
      vod_remarks: views,
      vod_duration: duration,
      ext: { url: toAbs(href) },
    })
  })

  return jsonify({ list: cards })
}

async function getTracks(ext) {
  ext = argsify(ext)
  const url = String(ext.url || '')
  const tracks = []
  if (!url) return jsonify({ list: [{ title: '默认分组', tracks }] })

  const { data } = await $fetch.get(url, { headers: { 'User-Agent': UA } })

  // 更稳的 flashvars 提取（兼容换行）
  const m = data.match(/var\s+flashvars_\d+\s*=\s*(\{[\s\S]*?\});/)
  if (m && m[1]) {
    try {
      const json = JSON.parse(m[1])
      const defs = Array.isArray(json.mediaDefinitions) ? json.mediaDefinitions : []
      defs.filter(e => String(e.format || '').toLowerCase() === 'hls' && e.videoUrl).forEach(e => {
        tracks.push({
          name: String(e.quality || 'auto'),
          pan: '',
          ext: { url: String(e.videoUrl) },
        })
      })
    } catch (_) {}
  }

  return jsonify({ list: [{ title: '默认分组', tracks }] })
}



async function getPlayinfo(ext) {
    ext = argsify(ext)
    let url = String(ext.url || ext.playUrl || '')
    const pageUrl = String(ext.pageUrl || ext.referer || '')
    const quality = String(ext.quality || '')

    function isExpiredSignedUrl(u) {
        if (!u || typeof u !== 'string') return true
        const m = u.match(/[?&]validto=(\d+)/i)
        if (!m) return false
        const validTo = Number(m[1]) || 0
        const now = Math.floor(Date.now() / 1000)
        return validTo > 0 && now >= (validTo - 20)
    }

    // 对于带 validto 的临时链接，过期时尝试基于详情页重新获取最新播放地址
    if ((!url || isExpiredSignedUrl(url)) && pageUrl) {
        try {
            const tracksObj = argsify(await getTracks(JSON.stringify({ url: pageUrl })))
            const groups = Array.isArray(tracksObj.list) ? tracksObj.list : []
            let refreshed = ''
            for (const g of groups) {
                const tracks = Array.isArray(g && g.tracks) ? g.tracks : []
                let picked = null
                if (quality) picked = tracks.find((t) => String(t && t.name || '') === quality) || null
                if (!picked) picked = tracks[0] || null
                if (picked) {
                    refreshed = String((picked.ext && picked.ext.url) || picked.url || '')
                    if (refreshed) break
                }
            }
            if (refreshed) url = refreshed
        } catch (_) {}
    }

    const headers = {
        'User-Agent': UA,
        'Referer': pageUrl || appConfig.site,
    }

    return jsonify({ urls: [url], headers: [headers] })
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

  const id = card.vod_id || card.id || ext.url || card.url || '';
  const title = card.vod_name || card.title || 'Untitled';
  const cover = card.vod_pic || card.cover || '';
  const url = ext.url || card.url || card.vod_id || '';

  const descParts = [card.vod_remarks, card.vod_duration, card.description].filter(Boolean);

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

function __nstBuildCategories(tabs) {
  return (Array.isArray(tabs) ? tabs : []).map((tab, i) => {
    const ext = Object.assign({}, (tab && tab.ext && typeof tab.ext === 'object') ? tab.ext : {});
    ext._tabId = __nstTabId(tab, i);
    ext._tabIndex = i;
    return {
      id: String(i + 1),
      name: String((tab && tab.name) || ('分类' + (i + 1))),
      ext
    };
  });
}

function __nstPickTab(configObj, categoryId) {
  const tabs = Array.isArray(configObj.tabs) ? configObj.tabs : [];
  const cid = String(categoryId || '');
  return tabs.find((t, i) => __nstTabId(t, i) === cid) || tabs[0] || null;
}

function __nstPickTabFromCategories(tabs, categoryId) {
  const categories = __nstBuildCategories(tabs);
  const cid = String(categoryId || '');
  const category = categories.find((item) => item.id === cid || String(item.ext && item.ext._tabId || '') === cid) || categories[0] || null;
  if (!category) return null;

  const index = Number(category.ext && category.ext._tabIndex);
  if (!Number.isNaN(index) && tabs[index]) return tabs[index];

  return __nstPickTab({ tabs }, cid);
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
    name: String(cfg.title || 'Pornhub'),
    description: 'Converted for NowShowTime with local editable adapter',
    icon: __nstIconFromSite(homepage),
    homepage
  };
}

async function getCategories() {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  return __nstBuildCategories(tabs);
}

async function getVideoList(page) {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  return __nstFetchCards(tabs[0] || null, page || 1);
}

async function getVideosByCategory(categoryId, page) {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  return __nstFetchCards(__nstPickTabFromCategories(tabs, categoryId), page || 1);
}

async function getVideoDetail(videoId, videoUrl) {
  const srcUrl = String(videoUrl || videoId || '');
  const req = { id: String(videoId || ''), url: srcUrl };

  let tracksObj = null;
  if (__NST_SOURCE__.getTracks) tracksObj = __nstParseMaybe(await __NST_SOURCE__.getTracks(JSON.stringify(req)));

  const resolutions = [];
  const groups = (tracksObj && Array.isArray(tracksObj.list)) ? tracksObj.list : [];

  for (const group of groups) {
    const tracks = Array.isArray(group && group.tracks) ? group.tracks : [];
    for (const t of tracks) {
      const nm = String((t && t.name) || '自动');
      const extObj = (t && t.ext && typeof t.ext === 'object') ? t.ext : null;
      let tu = '';
      if (extObj) {
        const payload = Object.assign({}, extObj);
        if (!payload.pageUrl && srcUrl) payload.pageUrl = srcUrl;
        if (!payload.quality) payload.quality = nm;
        const direct = String(payload.url || payload.playUrl || payload.src || t.url || '');
        if (direct && Object.keys(payload).length <= 1) {
          tu = direct;
        } else {
          try { tu = JSON.stringify(payload); } catch (_) { tu = direct; }
        }
      } else {
        tu = String(t.url || '');
      }
      if (!tu && extObj) {
        try { tu = JSON.stringify(extObj); } catch (_) {}
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
  let playReq = null;

  const srcObj = __nstParseMaybe(src);
  if (srcObj && typeof srcObj === 'object' && !Array.isArray(srcObj)) {
    playReq = Object.assign({}, srcObj);
    playCandidate = String(playReq.url || playReq.playUrl || playReq.src || src);
  }

  if (/^https?:\/\//i.test(playCandidate) && !/\.m3u8(\?|$)/i.test(playCandidate) && !/\.mp4(\?|$)/i.test(playCandidate) && __NST_SOURCE__.getTracks) {
    try {
      const tracksObj = __nstParseMaybe(await __NST_SOURCE__.getTracks(JSON.stringify({ url: playCandidate, id: playCandidate }))) || {};
      const groups = Array.isArray(tracksObj.list) ? tracksObj.list : [];
      for (const group of groups) {
        const tracks = Array.isArray(group && group.tracks) ? group.tracks : [];
        for (const t of tracks) {
          const extObj = (t && t.ext && typeof t.ext === 'object') ? t.ext : null;
          const tu = String((extObj && (extObj.url || extObj.playUrl || extObj.src)) || t.url || '');
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

  const req = playReq && typeof playReq === 'object'
    ? Object.assign({}, playReq, {
        url: playReq.url || playReq.playUrl || playCandidate,
        playUrl: playReq.playUrl || playReq.url || playCandidate,
        src: playReq.src || playCandidate
      })
    : { url: playCandidate, playUrl: playCandidate, src: playCandidate };

  const ret = __nstParseMaybe(await __NST_SOURCE__.getPlayinfo(JSON.stringify(req))) || {};
  const urls = Array.isArray(ret.urls) ? ret.urls : [];
  if (urls.length && urls[0]) return String(urls[0]);
  const single = ret.url || ret.playUrl || ret.src || '';
  if (single) return String(single);
  return String(req.playUrl || req.url || playCandidate);
}

async function search(keyword, page) {
  if (!__NST_SOURCE__.search) return [];

  const ret = __nstParseMaybe(await __NST_SOURCE__.search(JSON.stringify({ text: String(keyword || ''), page: Number(page) || 1 }))) || {};
  const list = Array.isArray(ret.list) ? ret.list : [];
  return list.map(__nstNormalizeCard).filter(v => v.id && v.title);
}
