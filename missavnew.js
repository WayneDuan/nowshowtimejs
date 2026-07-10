
const UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1';
const DEFAULT_SITE_CANDIDATES = [
  'https://missav.ai',
  'https://missav.ws',
];
const cheerio = createCheerio();

let tabsCache = null;
let sessionReady = false;
let currentSite = DEFAULT_SITE_CANDIDATES[0];
let challengePromptedAt = 0;

function buildHeaders(site, extra) {
  return Object.assign({
    'User-Agent': UA,
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'ja-JP,ja;q=0.9,zh-CN;q=0.8,en-US;q=0.7,en;q=0.6',
    'Referer': site + '/',
    'Origin': site,
    'Sec-Fetch-Site': 'same-origin',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Dest': 'document',
  }, extra || {});
}

function isChallengeHtml(html) {
  const text = String(html || '').toLowerCase();
  if (!text) return true;
  return text.includes('just a moment')
    || text.includes('cf-browser-verification')
    || text.includes('cf-mitigated')
    || text.includes('cloudflare')
    || text.includes('challenge-platform')
    || text.includes('enable javascript and cookies to continue');
}

function promptChallenge(url) {
  const now = Date.now();
  if (now - challengePromptedAt < 15000) return;
  challengePromptedAt = now;
  try { $utils.toastError('MissAV 触发 Cloudflare 验证，请在 Safari 完成后重试'); } catch (_) {}
  try { $utils.openSafari(url || currentSite, UA); } catch (_) {}
}

function assertNotBlocked(html, url) {
  if (isChallengeHtml(html)) {
    promptChallenge(url || currentSite);
    throw new Error('MissAV 当前请求被 Cloudflare 验证拦截，未返回真实页面');
  }
}

async function ensureSession() {
  if (sessionReady) return;

  let lastError = '';
  for (const site of DEFAULT_SITE_CANDIDATES) {
    try {
      const { data } = await $fetch.get(site + '/', {
        headers: buildHeaders(site),
        userAgent: UA
      });
      assertNotBlocked(data, site + '/');
      currentSite = site;
      sessionReady = true;
      tabsCache = null;
      return;
    } catch (error) {
      lastError = String((error && error.message) || error || '');
    }
  }

  promptChallenge(currentSite);
  throw new Error(`MissAV 所有候选域名都被 Cloudflare 验证拦截或不可用: ${DEFAULT_SITE_CANDIDATES.join(', ')}${lastError ? ` (${lastError})` : ''}`);
}

function withQuery(url, key, value) {
  if (!value) return url;
  const sep = url.includes('?') ? '&' : '?';
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

async function getWebsiteInfo() {
  return {
    name: "MissAV",
    description: "MissAV - 免费高清在线视频",
    icon: currentSite + "/favicon.ico",
    homepage: currentSite
  };
}

async function getCategories() {
  if (tabsCache) return tabsCache;

  const tabs = [
    { name: '中文字幕', ext: { url: currentSite + '/dm265/ja/chinese-subtitle' } },
    { name: '无码流出', ext: { url: currentSite + '/dm817/ja/uncensored-leak' } },
    { name: '最近更新', ext: { url: currentSite + '/dm634/ja/release' } },
    { name: 'FC2', ext: { url: currentSite + '/dm541/ja/fc2' } },
    { name: '麻豆传媒', ext: { url: currentSite + '/dm34/cn/madou' } },
    { name: '无删减', ext: { url: currentSite + '/dm817/ja/uncensored-leak' } },
    { name: '中文直播', ext: { url: currentSite + '/ja/clive' } },
    { name: '中文直播', ext: { url: currentSite + '/ja/klive' } },
  ];

  tabsCache = tabs.map((tab, index) => ({
    id: String(index + 1),
    name: tab.name,
    ext: tab.ext,
  }));

  return tabsCache;
}

// 通用排序配置（给 App 渲染 UI 用）
async function getSortOptions() {
  return {
    key: 'sort',
    name: '排序',
    init: 'released_at',
    value: [
      { n: '发行日期', v: 'released_at' },
      { n: '最近更新', v: 'published_at' },
      { n: '收藏数', v: 'saved' },
      { n: '今日浏览数', v: 'today_views' },
      { n: '本周浏览数', v: 'weekly_views' },
      { n: '本月浏览数', v: 'monthly_views' },
      { n: '总浏览数', v: 'views' },
    ],
  };
}

// 注意：只保留这一个 getVideosByCategory，支持 sort
async function getVideosByCategory(categoryId, page, sort) {
  const categories = await getCategories();
  const category = categories.find((item) => item.id === String(categoryId));
  const categoryUrl = category && category.ext ? category.ext.url : currentSite + '/dm515/ja/new';
  return getVideoList(page, categoryUrl, sort);
}

// 列表支持 sort
async function getVideoList(page, categoryUrl, sort) {
  await ensureSession();

  const currentPage = page || 1;
  const sortValue = sort || 'released_at';

  let baseUrl = categoryUrl || `${currentSite}/dm515/ja/new`;
  baseUrl = withQuery(baseUrl, 'sort', sortValue);

  const url = baseUrl.includes('?') ? `${baseUrl}&page=${currentPage}` : `${baseUrl}?page=${currentPage}`;

  const { data } = await $fetch.get(url, {
    headers: buildHeaders(currentSite),
    userAgent: UA
  });
  assertNotBlocked(data, url);

  const $ = cheerio.load(data || '');
  const videos = $('.thumbnail');
  let list = [];

  videos.each((_, e) => {
    const href = $(e).find('.text-secondary').attr('href');
    const title = $(e).find('.text-secondary').text().trim().replace(/\s+/g, ' ');
    const cover = $(e).find('.w-full').attr('data-src');
    const remarks = $(e).find('.left-1').text().trim();
    const duration = $(e).find('.right-1').text().trim();

    if (!href) return;

    list.push({
      id: href,
      title: title || '未知标题',
      cover: cover || '',
      url: href,
      description: `状态: ${remarks} | 时长: ${duration}`,
      createTime: Date.now()
    });
  });

  return list;
}

function normalizePlaybackUrl(value, baseUrl) {
  const text = String(value || '').trim();
  if (!text) return '';
  if (/^https?:\/\//i.test(text)) return text;
  if (text.startsWith('//')) return 'https:' + text;
  try {
    return new URL(text, baseUrl || currentSite).toString();
  } catch (_) {
    return '';
  }
}

function pushPlaybackCandidate(list, value, baseUrl) {
  const normalized = normalizePlaybackUrl(String(value || '').replace(/\\\//g, '/'), baseUrl);
  if (!normalized) return;
  if (!/\.m3u8(?:$|[?#])/i.test(normalized)) return;
  if (!list.includes(normalized)) {
    list.push(normalized);
  }
}

function extractPlaybackCandidates(html, pageUrl) {
  const text = String(html || '');
  const candidates = [];

  const directPatterns = [
    /https?:\/\/[^"'<>\\\s]+\.m3u8(?:\?[^"'<>\\\s]*)?/ig,
    /https?:\\\/\\\/[^"'<>]+?\.m3u8(?:\\\?[^"'<>]*)?/ig
  ];
  directPatterns.forEach((pattern) => {
    const matches = text.match(pattern) || [];
    matches.forEach((item) => pushPlaybackCandidate(candidates, item, pageUrl));
  });

  const fieldPatterns = [
    /"(?:hls|playlist|playUrl|videoUrl|src|file)"\s*:\s*"([^"]+?\.m3u8[^"]*)"/ig,
    /'(?:hls|playlist|playUrl|videoUrl|src|file)'\s*:\s*'([^']+?\.m3u8[^']*)'/ig
  ];
  fieldPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      pushPlaybackCandidate(candidates, match[1], pageUrl);
    }
  });

  const uuidPatterns = [
    /nineyu\.com\\\/([a-zA-Z0-9-]+)\\\/seek\\\/_0\.jpg/ig,
    /nineyu\.com\/([a-zA-Z0-9-]+)\/seek\/_0\.jpg/ig,
    /surrit\.com\\\/([a-zA-Z0-9-]+)\\\/playlist\.m3u8/ig,
    /surrit\.com\/([a-zA-Z0-9-]+)\/playlist\.m3u8/ig
  ];
  uuidPatterns.forEach((pattern) => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const uuid = String(match[1] || '').trim();
      if (!uuid) continue;
      pushPlaybackCandidate(candidates, `https://surrit.com/${uuid}/playlist.m3u8`, pageUrl);
    }
  });

  return candidates;
}

function buildResolutionLabel(line, previousLine, index) {
  const current = String(line || '').trim();
  const prev = String(previousLine || '').trim();
  const nameMatch = prev.match(/NAME="?([^",]+)"?/i);
  if (nameMatch && nameMatch[1]) {
    return String(nameMatch[1]).trim();
  }

  const resMatch = prev.match(/RESOLUTION=\d+x(\d+)/i);
  if (resMatch && resMatch[1]) {
    return resMatch[1] + 'p';
  }

  const pathMatch = current.match(/\/([^\/?#]+)\/video\.m3u8(?:$|[?#])/i);
  if (pathMatch && pathMatch[1]) {
    return String(pathMatch[1]).trim().toUpperCase();
  }

  return `线路${index + 1}`;
}

async function resolveSurritSeekResolutions(html, pageUrl) {
  const text = String(html || '');
  const patterns = [
    /surrit\.com\\\/([a-zA-Z0-9-]+)\\\/seek\\\/_0\.jpg/i,
    /surrit\.com\/([a-zA-Z0-9-]+)\/seek\/_0\.jpg/i,
    /nineyu\.com\\\/([a-zA-Z0-9-]+)\\\/seek\\\/_0\.jpg/i,
    /nineyu\.com\/([a-zA-Z0-9-]+)\/seek\/_0\.jpg/i
  ];

  let uuid = '';
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      uuid = String(match[1]).trim();
      break;
    }
  }

  if (!uuid) {
    return [];
  }

  const m3u8Prefix = 'https://surrit.com/';
  const masterM3u8 = `${m3u8Prefix}${uuid}/playlist.m3u8`;

  try {
    const { data } = await $fetch.get(masterM3u8, {
      headers: {
        'User-Agent': UA,
        'Referer': pageUrl
      },
      userAgent: UA
    });

    if (isChallengeHtml(data)) {
      promptChallenge(pageUrl);
      throw new Error('MissAV 播放源域名返回了 Cloudflare 验证页，未拿到真实 m3u8');
    }

    const lines = String(data || '').split('\n');
    const matches = lines.filter((line) => String(line || '').includes('/video.m3u8'));
    const resolutions = [];

    matches.forEach((line) => {
      const current = String(line || '').trim();
      if (!current) return;
      const name = current.replace('/video.m3u8', '') || '线路';
      resolutions.unshift({
        id: `surrit_${resolutions.length}`,
        name: name.toUpperCase(),
        url: `${m3u8Prefix}${uuid}/${current}`,
        size: "未知"
      });
    });

    resolutions.push({
      id: 'auto',
      name: '自动',
      url: masterM3u8,
      size: "未知"
    });

    return resolutions;
  } catch (error) {
    console.log('[missavnew] surrit seek failed:', masterM3u8, String((error && error.message) || error || ''));
    return [];
  }
}

async function resolveCandidateResolutions(candidateUrl, pageUrl) {
  try {
    const { data } = await $fetch.get(candidateUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': pageUrl,
        'Origin': currentSite
      },
      userAgent: UA
    });

    if (isChallengeHtml(data)) {
      promptChallenge(pageUrl);
      throw new Error('MissAV 播放源域名返回了 Cloudflare 验证页，未拿到真实 m3u8');
    }

    const body = String(data || '');
    if (!body.includes('#EXTM3U')) {
      return [];
    }

    const lines = body.split('\n');
    const resolutions = [];

    lines.forEach((line, index) => {
      const current = String(line || '').trim();
      if (!current || current.startsWith('#')) return;
      if (!current.includes('.m3u8')) return;

      const absoluteUrl = normalizePlaybackUrl(current, candidateUrl);
      if (!absoluteUrl) return;
      if (resolutions.some((item) => item.url === absoluteUrl)) return;

      resolutions.push({
        id: `line_${resolutions.length}`,
        name: buildResolutionLabel(current, lines[index - 1] || '', resolutions.length),
        url: absoluteUrl,
        size: "未知"
      });
    });

    if (!resolutions.some((item) => item.url === candidateUrl)) {
      resolutions.unshift({
        id: 'auto',
        name: '自动',
        url: candidateUrl,
        size: "未知"
      });
    }

    return resolutions;
  } catch (error) {
    console.log('[missavnew] candidate failed:', candidateUrl, String((error && error.message) || error || ''));
    return [];
  }
}

async function getVideoDetail(videoId) {
  await ensureSession();

  const url = videoId;

  const { data } = await $fetch.get(url, {
    headers: buildHeaders(currentSite),
    userAgent: UA
  });
  assertNotBlocked(data, url);

  const html = data || '';
  const $ = cheerio.load(html);
  const title = $('h1.text-base').text().trim().replace(/\s+/g, ' ') || '视频标题';
  const cover = $('video').attr('poster') || '';
  const description = $('meta[name="description"]').attr('content') || '';

  let resolutions = await resolveSurritSeekResolutions(html, url);

  if (resolutions.length === 0) {
    const candidates = extractPlaybackCandidates(html, url);
    console.log('[missavnew] playback candidates:', candidates);

    for (const candidate of candidates) {
      const resolved = await resolveCandidateResolutions(candidate, url);
      if (resolved.length > 0) {
        resolutions = resolved;
        break;
      }
    }

    if (resolutions.length === 0) {
      resolutions = candidates.slice(0, 6).map((candidate, index) => ({
        id: `fallback_${index}`,
        name: index === 0 ? '自动' : `线路${index}`,
        url: candidate,
        size: "未知"
      }));
    }
  }

  return {
    id: videoId,
    title: title,
    cover: cover,
    description: description,
    resolutions: resolutions
  };
}

// 在所有分类下搜索
async function searchAllCategories(keyword, page) {
  await ensureSession();
  const categories = await getCategories();
  const text = encodeURIComponent(keyword);
  const currentPage = page || 1;
  let allResults = [];

  // 并发请求所有分类
  const promises = categories.map(async (cat) => {
    // 以分类的 ext.url 为基础，拼接搜索路径
    // MissAV 的搜索一般是 /cn/search/xxx?page=1，但如果分类有特殊路径，可以自定义
    // 这里假设每个分类都支持 /search/xxx
    let baseUrl = cat.ext && cat.ext.url ? cat.ext.url : currentSite + '/dm515/ja/new';
    // 取分类路径的前缀部分，拼接 search
    let searchUrl = '';
    try {
      const urlObj = new URL(baseUrl);
      // 取出路径前缀
      const pathParts = urlObj.pathname.split('/');
      // 去掉最后一段（分类名），拼接 search
      pathParts.pop();
      searchUrl = urlObj.origin + pathParts.join('/') + '/search/' + text + '?page=' + currentPage;
    } catch (e) {
      // fallback
      searchUrl = currentSite + '/search/' + text + '?page=' + currentPage;
    }

    const { data } = await $fetch.get(searchUrl, {
      headers: buildHeaders(currentSite),
      userAgent: UA
    });
    assertNotBlocked(data, searchUrl);

    const $ = cheerio.load(data || '');
    const videos = $('.thumbnail');
    let list = [];

    videos.each((_, e) => {
      const href = $(e).find('.text-secondary').attr('href');
      const title = $(e).find('.text-secondary').text().trim().replace(/\s+/g, ' ');
      const cover = $(e).find('.w-full').attr('data-src');
      const remarks = $(e).find('.left-1').text().trim();
      const duration = $(e).find('.right-1').text().trim();

      if (!href) return;

      list.push({
        id: href,
        title: title || '未知标题',
        cover: cover || '',
        url: href,
        description: `状态: ${remarks} | 时长: ${duration}`,
        createTime: Date.now(),
        category: cat.name
      });
    });
    return list;
  });

  const results = await Promise.all(promises);
  results.forEach(list => {
    allResults = allResults.concat(list);
  });
  return allResults;
}
async function search(keyword, page) {
  await ensureSession();
  return await searchAllCategories(keyword, page);
}
