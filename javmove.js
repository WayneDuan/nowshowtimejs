/*
 * Local editable adapter
 * Site: JavMove
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

const cheerio = createCheerio();

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const DEFAULT_SITE_CANDIDATES = [
  'https://javmove.com',
];
function normalizeSite(raw) {
  let s = String(raw || '').trim();
  if (!s) return '';
  if (!/^https?:\/\//i.test(s)) s = 'https://' + s;
  return s.replace(/\/+$/, '');
}
function parseRuntimeConfig() {
  try { return argsify(g.$config_str) || {}; } catch (_) { return {}; }
}
function buildSiteCandidates() {
  const cfg = parseRuntimeConfig();
  const custom = [];
  if (cfg.site) custom.push(cfg.site);
  if (Array.isArray(cfg.sites)) custom.push(...cfg.sites);
  const out = [];
  for (const s of [...custom, ...DEFAULT_SITE_CANDIDATES]) {
    const normalized = normalizeSite(s);
    if (!normalized) continue;
    if (out.includes(normalized)) continue;
    out.push(normalized);
  }
  return out;
}
function isCloudflareBlockedHtml(html) {
  const text = String(html || '').toLowerCase();
  if (!text) return true;
  return text.includes('attention required')
    || text.includes('just a moment')
    || text.includes('cf-browser-verification')
    || text.includes('cloudflare');
}
let challengePromptedAt = 0;
let resolvedSitePromise = null;
let appConfig = {
  ver: 1,
  title: "JavMove",
  site: normalizeSite(parseRuntimeConfig().site) || DEFAULT_SITE_CANDIDATES[0],
  tabs: [
    {
      name: "最新AV",
      ui: 1,
      ext: { tag: "release" },
    },
    {
      name: "即将上映",
      ui: 1,
      ext: { tag: "upcoming" },
    },
  ],
};

function promptCloudflareVerification(url) {
  const now = Date.now();
  if (now - challengePromptedAt < 15000) return;
  challengePromptedAt = now;
  try { $utils.toastError('JavMove 触发 Cloudflare 验证，请在 Safari 完成后重试'); } catch (_) {}
  try { $utils.openSafari(url || appConfig.site, UA); } catch (_) {}
}

async function resolveWorkingSite() {
  const candidates = buildSiteCandidates();
  if (!candidates.length) throw new Error('javmove 未配置可用域名');

  let lastErr = '';
  for (const site of candidates) {
    try {
      const { data } = await $fetch.get(site, {
        headers: {
          'User-Agent': UA,
          Referer: site + '/',
          Origin: site,
        },
      });
      const html = String(data || '');
      if (isCloudflareBlockedHtml(html)) {
        promptCloudflareVerification(site);
        continue;
      }
      appConfig.site = site;
      return site;
    } catch (e) {
      lastErr = String((e && e.message) || e || '');
    }
  }
  if (candidates[0]) promptCloudflareVerification(candidates[0]);
  throw new Error(`javmove 所有候选域名均被 Cloudflare 或不可用: ${candidates.join(', ')}${lastErr ? ` (${lastErr})` : ''}`);
}

async function ensureWorkingSite() {
  if (!resolvedSitePromise) {
    resolvedSitePromise = resolveWorkingSite().catch((e) => {
      resolvedSitePromise = null;
      throw e;
    });
  }
  return resolvedSitePromise;
}

function assertNotBlocked(html) {
  if (isCloudflareBlockedHtml(html)) {
    promptCloudflareVerification(appConfig.site);
    throw new Error('javmove 当前请求被 Cloudflare 验证拦截，已尝试弹出 Safari 验证');
  }
}

async function getConfig() {
  await ensureWorkingSite();
  return JSON.stringify(appConfig);
}

async function getCards(ext) {
  await ensureWorkingSite();
  ext = JSON.parse(ext);
  let { tag, page = 1 } = ext;
  let url = `${appConfig.site}/${tag}?page=${page}`;
  let cards = [];

  const { data } = await $fetch.get(url, {
    headers: { "User-Agent": UA },
  });
  assertNotBlocked(data);

  const $ = cheerio.load(data);
  $("#movie-list article").each((_, element) => {
    const href = $(element).find('a[rel="bookmark"]').attr("href");
    const title = $(element).find("h2").attr("title").split(" ")[0];
    const cover =
      $(element).find(".movie-image").attr("data-srcset") ||
      $(element).find(".movie-image").attr("src");
    const pubdate = $(element).find("time").first().attr("datetime").split("T")[0];

    cards.push({
      vod_id: href,
      vod_name: title,
      vod_pic: cover,
      vod_remarks: "",
      vod_pubdate: pubdate,
      ext: {
        url: `${appConfig.site}${href}`,
        ref: url,
      },
    });
  });

  return JSON.stringify({ list: cards });
}

async function getTracks(ext) {
  await ensureWorkingSite();
  ext = JSON.parse(ext);
  let groups = [];
  let { url, ref } = ext;

  const { data } = await $fetch.get(url, {
    headers: { "User-Agent": UA, Referer: ref },
  });
  assertNotBlocked(data);

  const $ = cheerio.load(data);
  const id = $("#video-player").attr("data-id") || "";

  const promises = $(".video-format")
    .toArray()
    .map(async (element) => {
      const format = $(element).find(".video-format-header").text().trim();
      let formatGroup = { title: format, tracks: [] };

      const partElements = $(element).find(".video-source-btn");

      for (const partEl of partElements.toArray()) {
        const href = $(partEl).attr("href") || "";
        const partMatch = $(partEl).attr("title").match(/part\s*(\d+)/i);
        const partNumber = partMatch ? parseInt(partMatch[1], 10) : 0;
        const title = `part ${partNumber}`;
        let dataID;

        if (href.includes("#")) {
          dataID = id;
        } else {
          const curl = `${appConfig.site}${href}`;
          const { data: data2 } = await $fetch.get(curl, {
            headers: { "User-Agent": UA, Referer: ref },
          });
          assertNotBlocked(data2);
          const $2 = cheerio.load(data2);
          dataID = $2("#video-player").attr("data-id");
        }

        formatGroup.tracks.push({
          part: partNumber,
          name: title,
          ext: { dataID },
        });
      }

      groups.push(formatGroup);
    });

  await Promise.all(promises);

  const formatPriority = { FullHD: 1, HD: 2, SD: 3 };

  function getFormatPriority(title) {
    if (/^FullHD/i.test(title)) return formatPriority.FullHD;
    if (/^HD/i.test(title)) return formatPriority.HD;
    if (/^SD/i.test(title)) return formatPriority.SD;
    return 999;
  }

  groups.sort((a, b) => getFormatPriority(a.title) - getFormatPriority(b.title));

  groups.forEach((group) => group.tracks.sort((a, b) => a.part - b.part));

  return JSON.stringify({ list: groups });
}

async function getPlayinfo(ext) {
  await ensureWorkingSite();
  ext = JSON.parse(ext);
  const url = `${appConfig.site}/watch?token=${ext.dataID}`;

  const { data } = await $fetch.get(url, {
    headers: {
      "User-Agent": UA,
      Referer: "https://javquick.com/",
    },
  });
  assertNotBlocked(data);

  return JSON.stringify({ urls: [data] });
}

async function search(ext) {
  await ensureWorkingSite();
  ext = JSON.parse(ext);
  let text = encodeURIComponent(ext.text);
  let page = ext.page || 1;
  let url = `${appConfig.site}/search?q=${text}&page=${page}`;
  let cards = [];

  const { data } = await $fetch.get(url, {
    headers: { "User-Agent": UA },
  });
  assertNotBlocked(data);

  const $ = cheerio.load(data);
  $("#movie-list article").each((_, element) => {
    const href = $(element).find('a[rel="bookmark"]').attr("href");
    const title = $(element).find("h2").attr("title").split(" ")[0];
    const cover =
      $(element).find(".movie-image").attr("data-srcset") ||
      $(element).find(".movie-image").attr("src");
    const pubdate = $(element).find("time").first().attr("datetime").split("T")[0];

    cards.push({
      vod_id: href,
      vod_name: title,
      vod_pic: cover,
      vod_remarks: "",
      vod_pubdate: pubdate,
      ext: {
        url: `${appConfig.site}${href}`,
        ref: url,
      },
    });
  });

  return JSON.stringify({ list: cards });
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
    name: String(cfg.title || 'JavMove'),
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
