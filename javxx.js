/*
 * Local editable adapter
 * Site: javxx
 *
 * This file is intentionally local-first (no remote SOURCE_URL / no eval).
 */

const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const SITE = 'https://javxx.com';
const baseHeaders = {
  'User-Agent': UA,
  'Referer': SITE + '/',
  'Origin': SITE,
};
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

const _0x16c2=['length','javxx','&page=','.vid-items\x20>\x20div.item','Mozilla/5.0\x20(Windows\x20NT\x2010.0;\x20Win64;\x20x64)\x20AppleWebKit/537.36\x20(KHTML,\x20like\x20Gecko)\x20Chrome/91.0.4472.124\x20Safari/537.36','attr','text','parse','ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=','indexOf','site','get','默认分组','load','https://javxx.com','/cn/new','charCodeAt','indices','.image\x20>\x20img','push','https://surrit.store/','#video-files\x20div','href','?page=','G9zhUyphqPWZGWzZ','stream','find','https://surrit.store/stream?src=javxx&poster=&token=','WordArray','vtt','.title','enc','cache','.duration','page','split'];const _0x6c31=function(_0x16c2d2,_0x6c313f){_0x16c2d2=_0x16c2d2-0x0;let _0x250374=_0x16c2[_0x16c2d2];return _0x250374;};const cheerio=createCheerio();const CryptoJS=createCryptoJS();let appConfig={'ver':0x135256c,'title':_0x6c31('0x1'),'site':_0x6c31('0xe')};let header={'User-Agent':_0x6c31('0x4')};async function getConfig(){let _0x3aa1fe=appConfig;_0x3aa1fe['tabs']=await getTabs();return jsonify(_0x3aa1fe);}async function getTabs(){let _0x106712=[{'name':'热门','ext':{'url':appConfig[_0x6c31('0xa')]+'/cn/hot'},'ui':0x1},{'name':'最新','ext':{'url':appConfig[_0x6c31('0xa')]+_0x6c31('0xf')},'ui':0x1},{'name':'最近','ext':{'url':appConfig['site']+'/cn/recent'},'ui':0x1},{'name':'有码','ext':{'url':appConfig['site']+'/cn/censored'},'ui':0x1},{'name':'无码','ext':{'url':appConfig['site']+'/cn/uncensored'},'ui':0x1}];return _0x106712;}async function getCards(_0x91361f){_0x91361f=argsify(_0x91361f);let _0x508064=[];let {page=0x1,url}=_0x91361f;if(page>0x1){url+=_0x6c31('0x17')+page;}const {data}=await $fetch['get'](url,{'headers':header});const _0x500adc=cheerio[_0x6c31('0xd')](data);_0x500adc(_0x6c31('0x3'))['each']((_0x1d85c4,_0x16085d)=>{const _0x487bb6=_0x500adc(_0x16085d)['find'](_0x6c31('0x1e'))['attr'](_0x6c31('0x16'));const _0x3602ec=_0x500adc(_0x16085d)[_0x6c31('0x1a')](_0x6c31('0x1e'))[_0x6c31('0x6')]();const _0x1c67eb=_0x500adc(_0x16085d)['find'](_0x6c31('0x12'))['attr']('src');_0x508064[_0x6c31('0x13')]({'vod_id':_0x487bb6,'vod_name':_0x3602ec,'vod_pic':_0x1c67eb,'vod_duration':_0x500adc(_0x16085d)['find'](_0x6c31('0x21'))[_0x6c31('0x6')](),'ext':{'url':_0x487bb6}});});return jsonify({'list':_0x508064});}async function getTracks(_0x32698e){_0x32698e=argsify(_0x32698e);let _0x1dcf36=[];let _0x4c967f=appConfig[_0x6c31('0xa')]+_0x32698e['url'];const {data}=await $fetch['get'](_0x4c967f,{'headers':header});const _0x21a5d9=cheerio['load'](data);let _0x1ebadc=_0x21a5d9(_0x6c31('0x15'))[_0x6c31('0x5')]('data-url');let _0xd9a016=_0x530c11(_0x1ebadc);let _0x327fce=_0xd9a016['split']('/')['pop']()[_0x6c31('0x23')]('?')[0x0];let _0x4ff658=_0xf4ed2f(_0x327fce);let _0x2ae2de=(await $fetch[_0x6c31('0xb')](_0x6c31('0x1b')+_0x4ff658,{'headers':header}))['data'];let _0x2201d3=JSON[_0x6c31('0x7')](_0x2ae2de)['result']['media'];let _0x538426=_0x4e8251(_0x2201d3);let _0x1cfc3c=JSON[_0x6c31('0x7')](_0x538426)[_0x6c31('0x19')];let _0x20cc3e=JSON['parse'](_0x538426)[_0x6c31('0x1d')];_0x1dcf36[_0x6c31('0x13')]({'name':'播放','ext':{'playUrl':_0x1cfc3c,'subtitle':_0x20cc3e}});function _0x34fb95(_0x2967d4){var _0x1f16ef={'ascii':function(){return _0x6c31('0x8');},'indices':function(){if(!this['cache']){this['cache']={};var _0x151205=_0x1f16ef['ascii']();for(var _0xacd154=0x0;_0xacd154<_0x151205[_0x6c31('0x0')];_0xacd154++){var _0x4758a2=_0x151205[_0xacd154];this['cache'][_0x4758a2]=_0xacd154;}}return this[_0x6c31('0x20')];}};var _0x2d5ded=_0x1f16ef[_0x6c31('0x11')](),_0xdfc16d=_0x2967d4[_0x6c31('0x9')]('='),_0x328af4=_0xdfc16d>-0x1,_0x180c79=_0x328af4?_0xdfc16d:_0x2967d4[_0x6c31('0x0')],_0x274444=-0x1,_0xc1e44a='';while(_0x274444<_0x180c79){var _0x2287c4=_0x2d5ded[_0x2967d4[++_0x274444]]<<0x12|_0x2d5ded[_0x2967d4[++_0x274444]]<<0xc|_0x2d5ded[_0x2967d4[++_0x274444]]<<0x6|_0x2d5ded[_0x2967d4[++_0x274444]];if(_0x2287c4!==0x0){_0xc1e44a+=String['fromCharCode'](_0x2287c4>>>0x10&0xff,_0x2287c4>>>0x8&0xff,_0x2287c4&0xff);}}if(_0x328af4){_0xc1e44a=_0xc1e44a['slice'](0x0,_0xdfc16d-_0x2967d4['length']);}return _0xc1e44a;}function _0x530c11(_0x27e7a6){const _0x1309ed=_0x34fb95(_0x27e7a6);const _0x5ad9a0=_0x6c31('0x18');let _0xfb9e87='';for(let _0x434d6f=0x0;_0x434d6f<_0x1309ed[_0x6c31('0x0')];_0x434d6f++){const _0x19c2c8=_0x5ad9a0[_0x434d6f%_0x5ad9a0['length']];const _0x2d8938=String['fromCharCode'](_0x1309ed[_0x6c31('0x10')](_0x434d6f)^_0x19c2c8['charCodeAt'](0x0));_0xfb9e87+=_0x2d8938;}return decodeURIComponent(_0xfb9e87);}function _0xf4ed2f(_0x5194ac,_0x75e664='ym1eS4t0jTLakZYQ'){let _0x238c2f=[];for(let _0x41e220=0x0;_0x41e220<_0x5194ac[_0x6c31('0x0')];_0x41e220++){const _0x11779e=_0x75e664['charCodeAt'](_0x41e220%_0x75e664['length']);const _0x18e5aa=_0x5194ac[_0x6c31('0x10')](_0x41e220)^_0x11779e;_0x238c2f[_0x6c31('0x13')](_0x18e5aa);}const _0x28b535=CryptoJS['lib'][_0x6c31('0x1c')]['create'](Uint8Array['from'](_0x238c2f));return CryptoJS[_0x6c31('0x1f')]['Base64']['stringify'](_0x28b535);}function _0x4e8251(_0x3851c9,_0x4a50ea='ym1eS4t0jTLakZYQ'){const _0x2dc3f5=_0x34fb95(_0x3851c9);let _0x2270a4='';for(let _0x11bc9d=0x0;_0x11bc9d<_0x2dc3f5['length'];_0x11bc9d++){_0x2270a4+=String['fromCharCode'](_0x2dc3f5[_0x6c31('0x10')](_0x11bc9d)^_0x4a50ea[_0x6c31('0x10')](_0x11bc9d%_0x4a50ea[_0x6c31('0x0')]));}return decodeURIComponent(_0x2270a4);}return jsonify({'list':[{'title':_0x6c31('0xc'),'tracks':_0x1dcf36}]});}async function getPlayinfo(_0x33f203){_0x33f203=argsify(_0x33f203);const _0x31ca8c=_0x33f203['playUrl'];return jsonify({'urls':[_0x31ca8c],'headers':[{'User-Agent':header['User-Agent'],'origin':'https://surrit.store','referer':_0x6c31('0x14')}]});}async function search(_0x12c789){_0x12c789=argsify(_0x12c789);let _0x5a3d4b=_0x12c789['keyword']||'';let _0x262037=_0x12c789[_0x6c31('0x22')]||0x1;let _0x337eda=[];let _0x47e4a1=appConfig['site']+'/cn/search/?keyword='+encodeURIComponent(_0x5a3d4b)+_0x6c31('0x2')+_0x262037;const {data}=await $fetch[_0x6c31('0xb')](_0x47e4a1,{'headers':header});const _0x4d4208=cheerio[_0x6c31('0xd')](data);_0x4d4208(_0x6c31('0x3'))['each']((_0x4d46d9,_0x29f1f6)=>{const _0x5d5aaa=_0x4d4208(_0x29f1f6)[_0x6c31('0x1a')](_0x6c31('0x1e'))[_0x6c31('0x5')](_0x6c31('0x16'));const _0x1dada8=_0x4d4208(_0x29f1f6)['find']('.title')['text']();const _0x522f68=_0x4d4208(_0x29f1f6)['find']('.image\x20>\x20img')['attr']('src');_0x337eda[_0x6c31('0x13')]({'vod_id':_0x5d5aaa,'vod_name':_0x1dada8,'vod_pic':_0x522f68,'vod_duration':_0x4d4208(_0x29f1f6)['find']('.duration')[_0x6c31('0x6')](),'ext':{'url':_0x5d5aaa}});});return jsonify({'list':_0x337eda});}

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
    name: String(cfg.title || 'javxx'),
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
