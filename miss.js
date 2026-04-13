/*
 * Local editable adapter
 * Site: MISSAV
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

async function getLocalInfo() {
  const appConfig = {
    ver: 1,
    name: "玩偶哥哥(本地)",
    api: "csp_wogg_local",
  }
  return jsonify(appConfig)
}
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SITE = 'https://missav.ai';
const baseHeaders = {
  'User-Agent': UA,
  'Referer': SITE + '/',
  'Origin': SITE,
  'Sec-Fetch-Site': 'same-origin',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Dest': 'document',
};
const cheerio = createCheerio()
/*
{	
    "enload": true
}
*/
let $config = argsify($config_str)

const appConfig = {
    ver: 1,
    title: 'missav',
    site: 'https://missav.ai',
    tabs: [
        {
            name: '中文字幕',
            ui: 1,
            ext: {
                id: 'dm265/cn/chinese-subtitle',
            },
        },
        {
            name: '最近更新',
            ui: 1,
            ext: {
                id: 'dm513/cn/new',
            },
        },
        {
            name: '新作上市',
            ui: 1,
            ext: {
                id: 'dm509/cn/release',
            },
        },
        {
            name: '无码流出',
            ui: 1,
            ext: {
                id: 'dm561/cn/uncensored-leak',
            },
        },
        {
            name: 'VR',
            ui: 1,
            ext: {
                id: 'dm2091/cn/genres/VR',
            },
        },
        {
            name: '今日热门',
            ui: 1,
            ext: {
                id: 'dm242/cn/today-hot',
            },
        },
        {
            name: '本週热门',
            ui: 1,
            ext: {
                id: 'dm168/cn/weekly-hot',
            },
        },
        {
            name: '本月热门',
            ui: 1,
            ext: {
                id: 'dm207/cn/monthly-hot',
            },
        },
        {
            name: 'SIRO',
            ui: 1,
            ext: {
                id: 'dm23/cn/siro',
            },
        },
        {
            name: 'LUXU',
            ui: 1,
            ext: {
                id: 'dm20/cn/luxu',
            },
        },
        {
            name: 'GANA',
            ui: 1,
            ext: {
                id: 'dm17/cn/gana',
            },
        },
        {
            name: 'PRESTIGE PREMIUM',
            ui: 1,
            ext: {
                id: 'dm14/cn/maan',
            },
        },
        {
            name: 'S-CUTE',
            ui: 1,
            ext: {
                id: 'dm23/cn/scute',
            },
        },
        {
            name: 'ARA',
            ui: 1,
            ext: {
                id: 'dm19/cn/ara',
            },
        },
        {
            name: 'FC2',
            ui: 1,
            ext: {
                id: 'dm95/cn/fc2',
            },
        },
        {
            name: 'HEYZO',
            ui: 1,
            ext: {
                id: 'dm628/cn/heyzo',
            },
        },
        {
            name: '东京热',
            ui: 1,
            ext: {
                id: 'dm29/cn/tokyohot',
            },
        },
        {
            name: '一本道',
            ui: 1,
            ext: {
                id: 'dm58345/cn/1pondo',
            },
        },
        {
            name: 'Caribbeancom',
            ui: 1,
            ext: {
                id: 'dm124158/cn/caribbeancom',
            },
        },
        {
            name: 'Caribbeancompr',
            ui: 1,
            ext: {
                id: 'dm1442/cn/caribbeancompr',
            },
        },
        {
            name: '10musume',
            ui: 1,
            ext: {
                id: 'dm58632/cn/10musume',
            },
        },
        {
            name: 'pacopacomama',
            ui: 1,
            ext: {
                id: 'dm668/cn/pacopacomama',
            },
        },
        {
            name: 'Gachinco',
            ui: 1,
            ext: {
                id: 'dm135/cn/gachinco',
            },
        },
        {
            name: 'XXX-AV',
            ui: 1,
            ext: {
                id: 'dm26/cn/xxxav',
            },
        },
        {
            name: '人妻斩',
            ui: 1,
            ext: {
                id: 'dm24/cn/marriedslash',
            },
        },
        {
            name: '顽皮 4610',
            ui: 1,
            ext: {
                id: 'dm19/cn/naughty4610',
            },
        },
        {
            name: '顽皮 0930',
            ui: 1,
            ext: {
                id: 'dm22/cn/naughty0930',
            },
        },
        {
            name: '麻豆传媒',
            ui: 1,
            ext: {
                id: 'dm34/cn/madou',
            },
        },
        {
            name: 'TWAV AV',
            ui: 1,
            ext: {
                id: 'dm17/cn/twav',
            },
        },
        {
            name: 'Furuke AV',
            ui: 1,
            ext: {
                id: 'dm15/cn/furuke',
            },
        },
    ],
}

async function getactress() {

    const url = appConfig.site + '/saved/actresses'
    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    if (data.includes('Just a moment...')) {
        $utils.openSafari(url, UA)
    }
    const $ = cheerio.load(data)
    const actresss = $('.max-w-full.p-8.text-nord4.bg-nord1.rounded-lg')
    if (actresss.length == 0) {
        $utils.openSafari(url, UA)
    }
    let list = []
    try {
        actresss.find('.space-y-4').each((_, e) => {
            const href = $(e).find('a:first').attr('href').replace(`${appConfig.site}/`, '')
            const name = $(e).find('h4').text()
            list.push({
                name: name,
                ui: 1,
                ext: {
                    id: href,
                },
            })
        })
    } catch (e) {
        $utils.toastError(`没有找到收藏的女优`)
    }
    return list
}

async function getConfig() {
    let config = { ...appConfig };
    if ($config.enload) {
        list = await getactress()
        config.tabs = config.tabs.concat(list)
    }
    return jsonify(config)
}


async function getCards(ext) {
    ext = argsify(ext)
    let cards = []
    let { page = 1, id, filters = {} } = ext

    if (id == 'saved' && $config.length == 0) {
        return jsonify({ list: [] })
    }

    let url = appConfig.site + `/${id}?page=${page}`
    
    if (filters.filters && filters.filters !== '') {
        url += `&filters=${encodeURIComponent(filters.filters)}`
    }
    
    if (filters.sort && filters.sort !== '') {
        url += `&sort=${encodeURIComponent(filters.sort)}`
    } else {
        url += `&sort=released_at`  
    }
    
    if (filters.keyword) {
        url += `&keyword=${encodeURIComponent(filters.keyword)}`
    }
    
    if (filters.actress) {
        url += `&actress=${encodeURIComponent(filters.actress)}`
    }
    
    if (filters.tag) {
        url += `&tag=${encodeURIComponent(filters.tag)}`
    }

    console.log('Requesting:', url)

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    
    if (data.includes('Just a moment...')) {
        $utils.openSafari(url, UA)
    }

   const $ = cheerio.load(data)
   
   const videos = $('.thumbnail')
   
   videos.each((_, e) => {
       const href = $(e).find('.text-secondary').attr('href')
       const title = $(e).find('.text-secondary').text().trim().replace(/\s+/g, ' ')
       const cover = $(e).find('.w-full').attr('data-src')
       const remarks = $(e).find('.left-1').text().trim()
       const duration = $(e).find('.right-1').text().trim()
       let obj = {
           vod_id: href,
           vod_name: title,
           vod_pic: cover,
           vod_remarks: remarks,
           vod_duration: duration,
   
           ext: {
               url: href,
           },
       }
        cards.push(obj)
    })

    return jsonify({
        list: cards,
        filter: [
            {
                key: 'filters',  
                name: '过滤',
                init: '',      
                value: [
                    { n: '所有', v: '' },
                    { n: '单人作品', v: 'individual' },
                    { n: '多人作品', v: 'multiple' },
                    { n: '中文字幕', v: 'chinese-subtitle' },
                ],
            },
            {
                key: 'sort',    
                name: '排序',
                init: 'released_at',  
                value: [
                    { n: '发行日期', v: 'released_at' },
                    { n: '最近更新', v: 'published_at' },
                    { n: '收藏数', v: 'saved' },
                    { n: '今日浏览数', v: 'today_views' },
                    { n: '本週浏览数', v: 'weekly_views' },
                    { n: '本月浏览数', v: 'monthly_views' },
                    { n: '总浏览数', v: 'views' },
                ],
            },
        ],
    })
}
async function getTracks(ext) {
    ext = argsify(ext)
    let url = ext.url
    let m3u8Prefix = 'https://surrit.com/'
    let m3u8Suffix = '/playlist.m3u8'
    let tracks = []

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })
    const match = data.match(/nineyu\.com\\\/(.+)\\\/seek\\\/_0\.jpg/)
    if (match && match[1]) {
        let uuid = match[1]
        const { data: data1 } = await $fetch.get(m3u8Prefix + uuid + m3u8Suffix, {
            headers: {
                'User-Agent': UA,
                'Referer': url
            }
        })
        const lines = data1.split('\n');
        const matches = lines.filter(line => line.includes('/video.m3u8'));
        matches.forEach(match => {
            const name = match.replace('/video.m3u8', '')
            tracks.unshift({
                name: name,
                pan: '',
                ext: {
                    url: `${m3u8Prefix}${uuid}/${match}`,
                }
            })
        })
        tracks.push({
            name: '自动',
            pan: '',
            ext: {
                url: m3u8Prefix + uuid + m3u8Suffix,
            }
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
    const url = ext.url

    return jsonify({ urls: [url],
        headers: [{
            'User-Agent': UA,
            'Referer': appConfig.site
        }] })
}

async function search(ext) {
    ext = argsify(ext)
    let cards = []

    let text = encodeURIComponent(ext.text)
    let page = ext.page || 1
    let url = `${appConfig.site}/cn/search/${text}?page=${page}`

    const { data } = await $fetch.get(url, {
        headers: {
            'User-Agent': UA,
        },
    })

    const $ = cheerio.load(data)

    const videos = $('.thumbnail')
    videos.each((_, e) => {
        const href = $(e).find('.text-secondary').attr('href')
        const title = $(e).find('.text-secondary').text().trim().replace(/\s+/g, ' ')
        const cover = $(e).find('.w-full').attr('data-src')
        const remarks = $(e).find('.left-1').text().trim()
        const duration = $(e).find('.right-1').text().trim()

        cards.push({
            vod_id: href,
            vod_name: title,
            vod_pic: cover,
            vod_remarks: remarks,
            vod_duration: duration,

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
    name: String(cfg.title || 'MISSAV'),
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
