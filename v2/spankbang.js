/*
 * Local editable adapter
 * Site: SpankBang
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
const SITE = 'https://jp.spankbang.com';
const baseHeaders = {
  'User-Agent': UA,
  'Referer': SITE + '/',
  'Origin': SITE,
};
const cheerio = createCheerio()
let appConfig = {
	ver: 1,
	title: 'spankbang',
	site: 'https://jp.spankbang.com',
	tabs: [
		{
			name: '最新',
			ui: 1,
			ext: {
				id: 'new_videos',
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
	let { page = 1, id } = ext

	const url = appConfig.site + `/${id}/${page}`

	const { data } = await $fetch.get(url, {
		headers: {
			'User-Agent': UA,
		},
	})
	if (data.includes('Just a moment...')) {
		$utils.openSafari(url, UA)
	}

	const $ = cheerio.load(data)

	const videos = $('.video-item')

	videos.each((_, e) => {
		const href = $(e).find('a.thumb').attr('href')
		const title = $(e).find('img.cover').attr('alt')
		const cover = $(e).find('img.cover').attr('data-src')
		let obj = {
			vod_id: href,
			vod_name: title,
			vod_pic: cover,
			ui: 1,
			ext: {
				url: `${appConfig.site}${href}`,
			},
		}

		cards.push(obj)
	})

	return jsonify({
		list: cards,
	})
}
async function getTracks(ext) {
	ext = argsify(ext)
	let url = ext.url
	let tracks = []

	const { data } = await $fetch.get(url, {
		headers: {
			'User-Agent': UA,
		},
	})
	
	// 从script标签中提取stream_data信息
	const streamDataMatch = data.match(/var stream_data\s*=\s*({[^;]+});/)
	if (streamDataMatch && streamDataMatch[1]) {
		try {
			// 将单引号转换为双引号以便JSON解析
			const jsonString = streamDataMatch[1].replace(/'/g, '"')
			const streamData = JSON.parse(jsonString)
			
			// 处理不同分辨率的视频源
			const qualityOrder = ['240p', '320p', '480p', '720p', '1080p', '4k']
			
			qualityOrder.forEach(quality => {
				if (streamData[quality] && Array.isArray(streamData[quality]) && streamData[quality].length > 0) {
					const videoUrl = streamData[quality][0]
					tracks.push({
						name: quality.toUpperCase(),
						pan: '',
						ext: {
							url: videoUrl,
							type: 'mp4'
						}
					})
				}
			})
			
			// 处理m3u8格式的流
			if (streamData.m3u8 && streamData.m3u8.length > 0) {
				tracks.push({
					name: 'M3U8 (自适应)',
					pan: '',
					ext: {
						url: streamData.m3u8[0],
						type: 'm3u8'
					}
				})
			}
			
			if (tracks.length > 0) {
				let defaultUrl = ''
				let defaultType = 'mp4'
				
				if (streamData.main && streamData.main.length > 0) {
					defaultUrl = streamData.main[0]
				} else if (tracks.length > 0) {
					defaultUrl = tracks[0].ext.url
					defaultType = tracks[0].ext.type
				}
				
				if (defaultUrl) {
					tracks.unshift({
						name: '自动',
						pan: '',
						ext: {
							url: defaultUrl,
							type: defaultType
						}
					})
				}
			}
			
		} catch (error) {
			// 静默处理错误
		}
	}

	return jsonify({
		list: [
			{
				title: '视频质量',
				tracks,
			},
		],
	})
}

async function getPlayinfo(ext) {
	ext = argsify(ext)
	const url = ext.url
	const type = ext.type || 'mp4'

	return jsonify({ 
		urls: [url],
		type: type
	})
}
async function search(ext) {
	ext = argsify(ext)
	let cards = []

	let text = encodeURIComponent(ext.text)
	let page = ext.page || 1
	let url = `${appConfig.site}/s/${text}/${page}/`
	const { data } = await $fetch.get(url, {
		headers: {
			'User-Agent': UA,
		},
	})
	const $ = cheerio.load(data)

	const videos = $('.js-video-item') 

	videos.each((_, e) => {
    const href = $(e).find('a[href*="/video/"]').attr('href')
    
    const title = $(e).find('img').attr('alt')
    
    const cover = $(e).find('img').attr('data-src') || $(e).find('img').attr('src')
    
    let obj = {
        vod_id: href,
        vod_name: title,
        vod_pic: cover,
        ui: 1,
        ext: {
            url: `${appConfig.site}${href}`,
        },
    }
    cards.push(obj)
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
    name: String(cfg.title || 'SpankBang'),
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
