/*
 * Local editable adapter
 * Site: KanAV
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

//来自“夢”
const cheerio = createCheerio();
const CryptoJS = createCryptoJS();

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SITE = 'https://kanav.info';
const baseHeaders = {
  'User-Agent': UA,
  'Referer': SITE + '/',
  'Origin': SITE,
};
let appConfig = {
  ver: 1,
  title: 'KanAV',
  site: 'https://kanav.info',
  tabs: [
    {
      name: '中文字幕',
      ui: 1,
      ext: {
        id: 1,
      },
    },
    {
      name: '日韩有码',
      ui: 1,
      ext: {
        id: 2,
      },
    },
    {
      name: '日韩无码',
      ui: 1,
      ext: {
        id: 3,
      },
    },
    {
      name: '国产AV',
      ui: 1,
      ext: {
        id: 4,
      },
    },
    {
      name: '自拍泄密',
      ui: 1,
      ext: {
        id: 30,
      },
    },
    {
      name: '探花约炮',
      ui: 1,
      ext: {
        id: 31,
      },
    },
    {
      name: '主播录制',
      ui: 1,
      ext: {
        id: 32,
      },
    },
    {
      name: '动漫番剧',
      ui: 1,
      ext: {
        id: 20,
      },
    },
  ],
};

async function getConfig() {
  return JSON.stringify(appConfig);
}

async function getCards(ext) {
  let cards = [];
  let { id, page = 1 } = JSON.parse(ext);

  let url = `${appConfig.site}/index.php/vod/type/id/${id}/page/${page}.html`;

  const { data } = await $fetch.get(url, {
    headers: {
      'User-Agent': UA,
    },
  });

  const $ = cheerio.load(data);

  $('.post-list .col-md-3').each((_, element) => {
    const videoItem = $(element).find('.video-item');
    const entryTitle = $(element).find('.entry-title');
    const vodUrl = entryTitle.find('a').attr('href');
    const vodPic = videoItem.find('.featured-content-image a img').attr('data-original');
    const vodName = entryTitle.find('a').text().trim();
    const remark = videoItem.find('span.model-view-left').text().trim();
    const duration = videoItem.find('span.model-view').text().trim();
    const fullText = entryTitle.text().trim();
    const pubdate = fullText.replace(vodName, '').trim();

    cards.push({
      vod_id: vodUrl,
      vod_name: vodName,
      vod_pic: vodPic,
      vod_remarks: remark,
      vod_duration: duration,
      vod_pubdate: pubdate,
      ext: {
        url: `${appConfig.site}${vodUrl}`,
      },
    });
  });

  return JSON.stringify({
    list: cards,
  });
}

async function getTracks(ext) {
  let list = [];
  let url = JSON.parse(ext).url;

  const { data } = await $fetch.get(url, {
    headers: {
      'User-Agent': UA,
    },
  });

  let tracks = [];
  list = [
    {
      title: '默认分组',
      tracks,
    },
  ];

  const $ = cheerio.load(data);
  const player = $('script:contains(player_aaaa)')
    .text()
    .replace('var player_aaaa=', '');
  const encodedUrl = JSON.parse(player).url;
  const base64Decoded = CryptoJS.enc.Base64.parse(encodedUrl).toString(CryptoJS.enc.Utf8);
  const decodedUrl = decodeURIComponent(base64Decoded);

  tracks.push({
    name: '播放',
    ext: {
      url: decodedUrl,
    },
  });

  return JSON.stringify({
    list: list,
  });
}

async function getPlayinfo(ext) {
  const playUrl = JSON.parse(ext).url;

  return JSON.stringify({
    urls: [playUrl],
    headers: [{
      'User-Agent': UA,
      'referer': 'https://kanav.ad/'
    }]
  });
}

async function search(ext) {
  ext = JSON.parse(ext);
  let cards = [];

  let text = encodeURIComponent(ext.text);
  let page = ext.page || 1;
  let url = `${appConfig.site}/index.php/vod/search/by/time_add/page/${page}/wd/${text}.html`;

  const { data } = await $fetch.get(url, {
    headers: {
      'User-Agent': UA,
    },
  });

  const $ = cheerio.load(data);

  $('.post-list .col-md-3').each((_, element) => {
    const videoItem = $(element).find('.video-item');
    const entryTitle = $(element).find('.entry-title');
    const vodUrl = entryTitle.find('a').attr('href');
    const vodPic = videoItem.find('.featured-content-image a img').attr('data-original');
    const vodName = entryTitle.find('a').text().trim();
    const remark = videoItem.find('span.model-view-left').text().trim();
    const duration = videoItem.find('span.model-view').text().trim();
    const fullText = entryTitle.text().trim();
    const pubdate = fullText.replace(vodName, '').trim();

    cards.push({
      vod_id: vodUrl,
      vod_name: vodName,
      vod_pic: vodPic,
      vod_remarks: remark,
      vod_duration: duration,
      vod_pubdate: pubdate,
      ext: {
        url: `${appConfig.site}${vodUrl}`,
      },
    });
  });

  return JSON.stringify({
    list: cards,
  });
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
    name: String(cfg.title || 'KanAV'),
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
    playCandidate = String(reqObj.playurl || reqObj.id || reqObj.url || reqObj.playUrl || reqObj.src || src);
  }

  if (/^https?:\/\//i.test(playCandidate) && !/\.m3u8(\?|$)/i.test(playCandidate) && !/\.mp4(\?|$)/i.test(playCandidate) && __NST_SOURCE__.getTracks) {
    try {
      const tracksObj = __nstParseMaybe(await __NST_SOURCE__.getTracks(JSON.stringify({ url: playCandidate, id: playCandidate }))) || {};
      const groups = Array.isArray(tracksObj.list) ? tracksObj.list : [];
      for (const group of groups) {
        const tracks = Array.isArray(group && group.tracks) ? group.tracks : [];
        for (const t of tracks) {
          const extObj = (t && t.ext && typeof t.ext === 'object') ? t.ext : null;
          const tu = String((extObj && (extObj.playurl || extObj.id || extObj.url || extObj.playUrl || extObj.src)) || t.url || '');
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
        playurl: reqObj.playurl || reqObj.playUrl || reqObj.id || reqObj.url || reqObj.src || playCandidate,
        id: reqObj.id || reqObj.url || reqObj.playUrl || reqObj.playurl || reqObj.src || playCandidate,
        url: reqObj.url || reqObj.id || reqObj.playurl || reqObj.playUrl || playCandidate,
        playUrl: reqObj.playUrl || reqObj.playurl || reqObj.id || reqObj.url || playCandidate,
        src: reqObj.src || reqObj.id || reqObj.playurl || playCandidate
      })
    : { playurl: playCandidate, id: playCandidate, url: playCandidate, playUrl: playCandidate, src: playCandidate };

  const ret = __nstParseMaybe(await __NST_SOURCE__.getPlayinfo(JSON.stringify(req))) || {};
  const urls = Array.isArray(ret.urls) ? ret.urls : [];
  if (urls.length && urls[0]) return String(urls[0]);
  const single = ret.playurl || ret.id || ret.url || ret.playUrl || ret.src || '';
  if (single) return String(single);
  return String(req.playurl || req.id || req.playUrl || req.url || playCandidate);
}

async function search(keyword, page) {
  if (!__NST_SOURCE__.search) return [];

  const ret = __nstParseMaybe(await __NST_SOURCE__.search(JSON.stringify({ text: String(keyword || ''), page: Number(page) || 1 }))) || {};
  const list = Array.isArray(ret.list) ? ret.list : [];
  return list.map(__nstNormalizeCard).filter(v => v.id && v.title);
}
