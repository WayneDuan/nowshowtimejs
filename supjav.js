/*
 * Local editable adapter
 * Site: SupJav
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
const SITE = 'https://supjav.com/zh';
const baseHeaders = {
  'User-Agent': UA,
};
const appConfig = {
    ver: 1,
    title: 'SupJav',
    site: 'https://supjav.com/zh',
    tabs: [
        {
            name: '热门',
            ext: {
                id: 'popular',
            },
            ui: 1,
        },
        {
            name: '有码',
            ext: {
                id: 'category/censored-jav',
            },
            ui: 1,
        },
        {
            name: '无码',
            ext: {
                id: 'category/uncensored-jav',
            },
            ui: 1,
        },
        {
            name: '素人',
            ext: {
                id: 'category/amateur',
            },
            ui: 1,
        },
        {
            name: '中文字幕',
            ext: {
                id: 'category/chinese-subtitles',
            },
            ui: 1,
        },
        {
            name: '无码破解',
            ext: {
                id: 'category/reducing-mosaic',
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
    let cards = []
    let { page = 1, id } = ext

    const url = appConfig.site + `/${id}/page/${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)
    const t1 = $('title').text()
      if (t1 === 'Just a moment...') {
        $utils.openSafari(appConfig.site, UA)
      }

    const videos = $('.post')
    videos.each((_, e) => {
        const href = $(e).find('a').attr('href')
        const title = $(e).find('a').attr('title')
        const cover = $(e).find('a img').attr('src').replace('!320x216.jpg', '')
        const remarks = $(e).find('.con .meta .date').text()

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: '',
            ext: {
                url: href,
            },
        })
    })

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

    const $ = cheerio.load(data)
    const btns = $('a.btn-server')
    btns.each((_, e) => {
        const name = $(e).text()
        const data_link = $(e).attr('data-link')
        tracks.push({
            name,
            pan: '',
            ext: {
                data: data_link,
                name,
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
    let { data, name } = ext
    if ((!data || !name) && ext && typeof ext.url === 'string') {
        const maybe = argsify(ext.url)
        if (maybe && typeof maybe === 'object') {
            data = data || maybe.data
            name = name || maybe.name
        }
    }
    if (!data || !name) return jsonify({ urls: [] })

    const param = data.split('').reverse().join('')
    const url = `https://lk1.supremejav.com/supjav.php?c=${param}`
    const res = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
            Referer: `https://lk1.supremejav.com/supjav.php?l=${data}&bg=undefined`,
        },
    })
    let playUrl = ''

    if (name === 'TV') {
        const config = res.data
            .match(/decodeURIComponent\(escape\(r\)\)\}(.*)\)/)[1]
            .replace(/["\(\)]/g, '')
            .split(',')

        const decrypted = decrypt(...config)
        playUrl = decrypted.match(/var urlPlay = '(.*?)';/)[1]

        function decrypt(h, u, n, t, e, r) {
            r = ''
            for (var i = 0, len = h.length; i < len; i++) {
                var s = ''
                while (h[i] !== n[e]) {
                    s += h[i]
                    i++
                }
                for (var j = 0; j < n.length; j++) s = s.replace(new RegExp(n[j], 'g'), j)
                r += String.fromCharCode(_0xe99c(s, e, 10) - t)
            }
            return decodeURIComponent(escape(r))
        }

        function _0xe99c(d, e, f) {
            let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/'
            var g = str.split('')
            var h = g.slice(0, e)
            var i = g.slice(0, f)
            var j = d
                .split('')
                .reverse()
                .reduce(function (a, b, c) {
                    if (h.indexOf(b) !== -1) return (a += h.indexOf(b) * Math.pow(e, c))
                }, 0)
            var k = ''
            while (j > 0) {
                k = i[j % f] + k
                j = (j - (j % f)) / f
            }
            return k || '0'
        }
    } else if (name === 'FST') {
        const $ = cheerio.load(res.data)
        $('script').each((_, e) => {
            if ($(e).text().includes('eval')) {
                const script = $(e).text().replace('eval', '')
                const result = eval(script)
                playUrl = result.match(/sources:\[\{file:"(.*?)"\}\]/)[1]
            }
        })
    } else if (name === 'ST') {
        const $ = cheerio.load(res.data)
        let robot = $('#robotlink').text()
        robot = robot.substring(0, robot.indexOf('&token=') + 7)
        $('script').each((_, e) => {
            let script = $(e).text()
            if (script.includes("getElementById('robotlink')")) {
                let token = script.split('&token=')[1].split("'")[0]
                playUrl = 'https:/' + robot + token + '&stream=1'
            }
        })
    } else if (name === 'VOE') {
        const location = res.data.match(/window\.location\.href = '(.*?)';/)[1]
        const locres = await $fetch.get(location, {
            headers: {
                'User-Agent': UA,
            },
        })
        playUrl = locres.data.match(/prompt\("Node", "(.*?)"\);/)[1]
    }

    return jsonify({ urls: [playUrl] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/page/${page}?s=${text}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const $ = cheerio.load(data)

    $('.post').each((_, e) => {
        const href = $(e).find('a').attr('href')
        const title = $(e).find('a').attr('title')
        const cover = $(e).find('a img').attr('data-original')
        const remarks = $(e).find('.con .meta .date').text()
        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: remarks,
            ext: {
                url: href,
            },
        })
    })

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
    name: String(cfg.title || 'SupJav'),
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
    if (!reqObj.url && reqObj.data) reqObj.url = reqObj.data;
    playCandidate = String(reqObj.url || reqObj.playUrl || reqObj.src || src);
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

  const req = reqObj && typeof reqObj === 'object'
    ? reqObj
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
