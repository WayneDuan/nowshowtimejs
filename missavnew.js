
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

async function getVideoDetail(videoId) {
  await ensureSession();

  const url = videoId;
  const m3u8Prefix = 'https://surrit.com/';

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

  let resolutions = [];
  let uuid = '';

  const match = html.match(/nineyu\.com\\\/([a-zA-Z0-9-]+)\\\/seek\\\/_0\.jpg/);
  if (match && match[1]) {
    uuid = match[1];
  } else {
    const uuidMatch = html.match(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/);
    if (uuidMatch) uuid = uuidMatch[0];
  }

  if (uuid) {
    const masterM3u8 = `${m3u8Prefix}${uuid}/playlist.m3u8`;
    const { data: masterData } = await $fetch.get(masterM3u8, {
      headers: {
        'User-Agent': UA,
        'Referer': url
      },
      userAgent: UA
    });
    if (isChallengeHtml(masterData)) {
      promptChallenge(url);
      throw new Error('MissAV 播放源域名返回了 Cloudflare 验证页，未拿到真实 m3u8');
    }

    if (masterData && masterData.includes('#EXTM3U')) {
      const lines = masterData.split('\n');
      lines.forEach((line, index) => {
        const current = line.trim();
        if (current.includes('video.m3u8')) {
          let label = '未知';
          const prevLine = (lines[index - 1] || '').trim();
          const resMatch = prevLine.match(/RESOLUTION=\d+x(\d+)/);

          if (resMatch) {
            label = resMatch[1] + 'p';
          } else {
            label = current.split('/')[0].toLowerCase();
          }

          resolutions.push({
            id: label,
            name: label.toUpperCase(),
            url: `${m3u8Prefix}${uuid}/${current}`,
            size: "未知"
          });
        }
      });

      resolutions.sort((a, b) => (parseInt(b.name) || 0) - (parseInt(a.name) || 0));
    }

    resolutions.unshift({
      id: 'auto',
      name: '自动',
      url: masterM3u8,
      size: "未知"
    });
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
