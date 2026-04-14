/*
 * Local editable adapter
 * Site: twivideo
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

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SITE = 'https://twivideo.net';
const baseHeaders = {
  'User-Agent': UA,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'ja-JP,ja;q=0.9,zh-CN;q=0.8,en-US;q=0.7,en;q=0.6',
  'Referer': SITE + '/',
  'Origin': SITE,
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Dest': 'document',
};
const config = argsify($config_str)
const cheerio = createCheerio()
let challengePromptedAt = 0

function isBlockedHtml(html) {
    const text = String(html || '').toLowerCase()
    if (!text) return true
    return text.includes('attention required')
        || text.includes('just a moment')
        || text.includes('cf-browser-verification')
        || text.includes('cloudflare')
}
function promptVerification(url) {
    const now = Date.now()
    if (now - challengePromptedAt < 15000) return
    challengePromptedAt = now
    try { $utils.toastError('Twivideo 触发验证，请在 Safari 完成后重试') } catch (_) {}
    try { $utils.openSafari(url || appConfig.site, UA) } catch (_) {}
}
function extractHtmlPayload(data) {
    const raw = String(data || '')
    if (!raw) return ''
    try {
        const obj = JSON.parse(raw)
        if (obj && typeof obj === 'object') {
            if (typeof obj.html === 'string') return obj.html
            if (typeof obj.data === 'string') return obj.data
            if (typeof obj.list === 'string') return obj.list
            if (typeof obj.result === 'string') return obj.result
        }
    } catch (_) {}
    return raw
}
function normalizeUrl(url) {
    const raw = String(url || '').trim()
    if (!raw) return ''
    if (/^https?:\/\//i.test(raw)) return raw
    if (raw.startsWith('/')) return appConfig.site.replace(/\/+$/, '') + raw
    return appConfig.site.replace(/\/+$/, '') + '/' + raw
}
function parseCardsFromHtml(html) {
    const cards = []
    const $ = cheerio.load(html || '')
    const seen = new Set()
    const nodes = $('div.art_li, li.art_li, article.art_li, .art-list .art_li, .item')
    nodes.each((_, e) => {
        const linkNode = $(e).find('.item_link, a.item_link, a[href]').first()
        const href = normalizeUrl(linkNode.attr('href'))
        if (!href || seen.has(href)) return
        seen.add(href)
        let img = $(e).find('.item_image img, img').first().attr('src') || $(e).find('img').first().attr('data-src') || ''
        img = normalizeUrl(img)
        const title = (linkNode.attr('data-id') || linkNode.attr('title') || $(e).find('img').first().attr('alt') || '').trim()
        cards.push({
            vod_id: href,
            vod_name: title || 'Twivideo',
            vod_pic: img,
            ext: {
                id: href,
            },
        })
    })
    return cards
}

let appConfig = {
    ver: 20250321,
    title: 'twivideo',
    site: 'https://twivideo.net/',
    tabs: [
        {
            name: '新着DL',
            ext: {
                type: '0',
                order: 'post_date',
                ty: 'p4',
            },
        },
        {
            name: 'ランキング (24時間)',
            ext: {
                type: 'ranking',
                order: '24',
                ty: 'p6',
            },
        },
        {
            name: 'ランキング (3日間)',
            ext: {
                type: 'ranking',
                order: '72',
                ty: 'p6',
            },
        },
        {
            name: 'ランキング (1週間)',
            ext: {
                type: 'ranking',
                order: '168',
                ty: 'p6',
            },
        },
        {
            name: '急上昇',
            ext: {
                type: 'trending',
                order: 'r_count',
                ty: 'p7',
            },
        },
        {
            name: '高評価',
            ext: {
                type: 'likeranking',
                order: '24',
                ty: 'p6',
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
    let { type, order, ty, page = 1 } = ext

    try {
        const url = `${appConfig.site}/templates/view_lists.php`

        let offset = (page - 1) * 50
        const { data } = await $fetch.post(
            url,
            {
                offset: offset,
                limit: 50,
                tag: 'null',
                type: type,
                order: order,
                le: 1000,
                ty: ty,
                offset_int: offset,
            },
            {
                headers: {
                    'User-Agent': UA,
                    Referer: appConfig.site + '/',
                },
            }
        )

        const html = extractHtmlPayload(data)
        if (isBlockedHtml(html)) {
            promptVerification(appConfig.site)
            throw new Error('twivideo 请求被验证页面拦截')
        }
        cards = parseCardsFromHtml(html)

        return jsonify({
            list: cards,
        })
    } catch (error) {
        $print(error)
    }
}

async function getTracks(ext) {
    ext = argsify(ext)

    let id = ext.id
    let tracks = [
        {
            name: '播放',
            pan: '',
            ext: {
                id,
            },
        },
    ]

    return jsonify({
        list: [
            {
                title: '默认分组',
                tracks: tracks,
            },
        ],
    })
}

async function getPlayinfo(ext) {
    ext = argsify(ext)
    let { id } = ext
    if (!id) id = ext.url || ext.playUrl || ext.src || ''

    return jsonify({ urls: [id], headers: [{ 'User-Agent': UA }] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    const text = encodeURIComponent(ext.text)
    const page = ext.page || 1
    const url = `${appConfig.site}/templates/ajax_twitteroauth_v2.php`

    const { data } = await $fetch.post(
        url,
        {
            url: text,
        },
        {
            headers: {
                'User-Agent': UA,
                Referer: appConfig.site + '/',
            },
        }
    )

    const html = extractHtmlPayload(data)
    if (isBlockedHtml(html)) {
        promptVerification(appConfig.site)
        throw new Error('twivideo 搜索被验证页面拦截')
    }
    cards = parseCardsFromHtml(html)

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
    name: String(cfg.title || 'twivideo'),
    description: 'Converted for NowShowTime with local editable adapter',
    icon: __nstIconFromSite(homepage),
    homepage
  };
}

async function getCategories() {
  const cfg = await __nstGetConfigObject();
  const tabs = await __nstGetTabsArray(cfg);
  return tabs.map((tab, i) => ({ id: __nstTabId(tab, i), name: String((tab && tab.name) || ('分类' + (i + 1))) }));
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
        const direct = String(extObj.playurl || extObj.id || extObj.url || extObj.playUrl || extObj.src || t.url || '');
        const keys = Object.keys(extObj);
        if (keys.length > 1 || (keys.length === 1 && !('url' in extObj || 'playUrl' in extObj || 'src' in extObj || 'id' in extObj || 'playurl' in extObj))) {
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
    playCandidate = String(reqObj.id || reqObj.url || reqObj.playUrl || reqObj.src || src);
  }

  if (/^https?:\/\//i.test(playCandidate) && !/\.m3u8(\?|$)/i.test(playCandidate) && !/\.mp4(\?|$)/i.test(playCandidate) && __NST_SOURCE__.getTracks) {
    try {
      const tracksObj = __nstParseMaybe(await __NST_SOURCE__.getTracks(JSON.stringify({ url: playCandidate, id: playCandidate }))) || {};
      const groups = Array.isArray(tracksObj.list) ? tracksObj.list : [];
      for (const group of groups) {
        const tracks = Array.isArray(group && group.tracks) ? group.tracks : [];
        for (const t of tracks) {
          const extObj = (t && t.ext && typeof t.ext === 'object') ? t.ext : null;
          const tu = String((extObj && (extObj.id || extObj.url || extObj.playUrl || extObj.src)) || t.url || '');
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
        id: reqObj.id || reqObj.url || reqObj.playUrl || reqObj.src || playCandidate,
        url: reqObj.url || reqObj.id || playCandidate,
        playUrl: reqObj.playUrl || reqObj.id || reqObj.url || playCandidate,
        src: reqObj.src || reqObj.id || playCandidate
      })
    : { id: playCandidate, url: playCandidate, playUrl: playCandidate, src: playCandidate };

  const ret = __nstParseMaybe(await __NST_SOURCE__.getPlayinfo(JSON.stringify(req))) || {};
  const urls = Array.isArray(ret.urls) ? ret.urls : [];
  if (urls.length && urls[0]) return String(urls[0]);
  const single = ret.id || ret.url || ret.playUrl || ret.src || '';
  if (single) return String(single);
  return String(req.id || req.playUrl || req.url || playCandidate);
}

async function search(keyword, page) {
  if (!__NST_SOURCE__.search) return [];

  const ret = __nstParseMaybe(await __NST_SOURCE__.search(JSON.stringify({ text: String(keyword || ''), page: Number(page) || 1 }))) || {};
  const list = Array.isArray(ret.list) ? ret.list : [];
  return list.map(__nstNormalizeCard).filter(v => v.id && v.title);
}
