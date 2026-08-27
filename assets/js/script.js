const card = document.getElementById('card');
const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const fallbackBackgroundUrl = 'assets/img/home.jpg';

let currentX = 0;
let currentY = 0;
let velocityX = 0;
let velocityY = 0;
let targetX = 0;
let targetY = 0;

const stiffness = 0.08;
const damping = 0.82;

function applyCardTransform() {
  if (!card) {
    return;
  }
  // 二级页面与移动端不做任何变换，保证文字按物理像素清晰渲染
  if (isSecondaryPage || window.innerWidth < 768) {
    card.style.transform = '';
    return;
  }
  const scale = 0.85;
  card.style.transform = `scale(${scale}) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
}

function animate() {
  const forceX = (targetX - currentX) * stiffness;
  const forceY = (targetY - currentY) * stiffness;

  velocityX = (velocityX + forceX) * damping;
  velocityY = (velocityY + forceY) * damping;

  currentX += velocityX;
  currentY += velocityY;

  if (
    Math.abs(velocityX) > 0.01 ||
    Math.abs(velocityY) > 0.01 ||
    Math.abs(targetX - currentX) > 0.01 ||
    Math.abs(targetY - currentY) > 0.01
  ) {
    applyCardTransform();
  }

  requestAnimationFrame(animate);
}

function updatePointerState(clientX, clientY, max = 8) {
  if (!card) {
    return;
  }

  const rect = card.getBoundingClientRect();
  const offsetX = (clientX - rect.left) / rect.width - 0.5;
  const offsetY = (clientY - rect.top) / rect.height - 0.5;

  targetX = Math.max(-max, Math.min(max, offsetX * max * 2));
  targetY = Math.max(-max, Math.min(max, -offsetY * max * 2));
}

function resetPointerState() {
  targetX = 0;
  targetY = 0;
}

const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
// 二级页面（body.scroll-page）：卡片固定不动，禁用 3D 倾斜跟随
const isSecondaryPage = document.body.classList.contains('scroll-page');
const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
const tiltEnabled = supportsHover && !isSecondaryPage;

if (card && tiltEnabled) {
  card.addEventListener('mousemove', e => {
    updatePointerState(e.clientX, e.clientY);
  });

  card.addEventListener('mouseleave', resetPointerState);
}

const bgImageEl = document.getElementById('bg-image');

function showBgImage(url) {
  if (!bgImageEl) {
    // 兜底：无图层元素时保持旧行为
    document.body.style.backgroundImage = `url(${url})`;
    return;
  }
  bgImageEl.style.backgroundImage = `url(${url})`;
  // 下一帧再加类名，确保浏览器先完成贴图、再平滑淡入
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      bgImageEl.classList.add('bg-visible');
    });
  });
}

function applyBackgroundImage(url, useAnonymous = true) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (useAnonymous) {
      img.crossOrigin = 'Anonymous';
    }
    img.decoding = 'async';
    img.src = url;

    img.onload = () => {
      showBgImage(url);
      updateAccentColors(img);
      resolve();
    };

    img.onerror = reject;
  });
}

function fetchBackgroundMeta(resolution) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  return fetch(`https://bing.biturl.top/?resolution=${resolution}&format=json`, {
    signal: controller.signal
  })
    .then(res => {
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .catch(error => {
      clearTimeout(timeoutId);
      throw error;
    });
}

async function loadBackgroundImage() {
  if (isMobile) {
    try {
      await applyBackgroundImage(fallbackBackgroundUrl, false);
      return;
    } catch (error) {
      console.error('移动端本地背景图加载失败:', error);
      document.body.style.backgroundColor = '#f0f0f0';
      return;
    }
  }

  const resolutions = [1920];

  for (const resolution of resolutions) {
    try {
      const data = await fetchBackgroundMeta(resolution);
      await applyBackgroundImage(data.url);
      return;
    } catch (error) {
      console.error(`获取背景图失败(${resolution})`, error);
    }
  }

  try {
    await applyBackgroundImage(fallbackBackgroundUrl, false);
  } catch (error) {
    console.error('本地背景图加载失败:', error);
    document.body.style.backgroundColor = '#f0f0f0';
  }
}

function updateAccentColors(img) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const sampleSize = isMobile ? 36 : 60;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    ctx.drawImage(img, 0, 0, sampleSize, sampleSize);

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    let r2 = 0;
    let g2 = 0;
    let b2 = 0;

    const pixels = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
    for (let i = 0; i < pixels.length; i += 4) {
      const pr = pixels[i];
      const pg = pixels[i + 1];
      const pb = pixels[i + 2];
      r += pr;
      g += pg;
      b += pb;
      if (i % 8 === 0) {
        r2 += pr;
        g2 += pg;
        b2 += pb;
      }
      count++;
    }

    r = Math.floor(r / count);
    g = Math.floor(g / count);
    b = Math.floor(b / count);
    r2 = Math.floor(r2 / (count / 2));
    g2 = Math.floor(g2 / (count / 2));
    b2 = Math.floor(b2 / (count / 2));

    document.documentElement.style.setProperty('--accent', `${r},${g},${b}`);
    document.documentElement.style.setProperty('--accent2', `${r2},${g2},${b2}`);

    const brightness = r * 0.299 + g * 0.587 + b * 0.114;
    document.body.classList.toggle('light-bg', brightness > 160);
    document.body.classList.toggle('dark-bg', brightness <= 160);
  } catch (error) {
    document.documentElement.style.setProperty('--accent', '200,200,255');
    document.documentElement.style.setProperty('--accent2', '180,220,255');
    document.body.classList.remove('dark-bg');
    document.body.classList.add('light-bg');
  }
}

function getDailyQuote() {
  if (!quoteTextEl || !quoteAuthorEl) {
    return;
  }

  const fallbackQuotes = [
    { content: '\u4FDD\u6301\u597D\u5947\uFF0C\u6162\u6162\u53D8\u597D\u3002', author: '\u672A\u77E5' },
    { content: '\u884C\u52A8\u662F\u6210\u529F\u7684\u9636\u68AF\uFF0C\u884C\u52A8\u8D8A\u591A\uFF0C\u767B\u5F97\u8D8A\u9AD8\u3002', author: '\u672A\u77E5' },
    { content: '\u6BCF\u4E00\u4E2A\u4E0D\u66FE\u8D77\u821E\u7684\u65E5\u5B50\uFF0C\u90FD\u662F\u5BF9\u751F\u547D\u7684\u8F9C\u8D1F\u3002', author: '\u5C3C\u91C7' },
    { content: '\u751F\u6D3B\u4E0D\u662F\u7F3A\u5C11\u7F8E\uFF0C\u800C\u662F\u7F3A\u5C11\u53D1\u73B0\u7F8E\u7684\u773C\u775B\u3002', author: '\u7F57\u4E39' },
    { content: '\u6210\u529F\u4E0D\u662F\u7EC8\u70B9\uFF0C\u5931\u8D25\u4E5F\u4E0D\u662F\u7EC8\u7ED3\uFF0C\u53EA\u6709\u52C7\u6C14\u624D\u662F\u6C38\u6052\u3002', author: '\u4E18\u5409\u5C14' },
    { content: '\u8DEF\u6F2B\u6F2B\u5176\u4FEE\u8FDC\u516E\uFF0C\u543E\u5C06\u4E0A\u4E0B\u800C\u6C42\u7D22\u3002', author: '\u5C48\u539F' },
    { content: '\u5C71\u91CD\u6C34\u590D\u7591\u65E0\u8DEF\uFF0C\u67F3\u6697\u82B1\u660E\u53C8\u4E00\u6751\u3002', author: '\u9646\u6E38' },
    { content: '\u5929\u884C\u5065\uFF0C\u541B\u5B50\u4EE5\u81EA\u5F3A\u4E0D\u606F\u3002', author: '\u300A\u5468\u6613\u300B' },
    { content: '\u5730\u52BF\u5764\uFF0C\u541B\u5B50\u4EE5\u539A\u5FB7\u8F7D\u7269\u3002', author: '\u300A\u5468\u6613\u300B' },
    { content: '\u6D77\u7EB3\u767E\u5DDD\uFF0C\u6709\u5BB9\u4E43\u5927\u3002', author: '\u6797\u5219\u5F90' }
  ];

  if (!navigator.onLine) {
    showFallbackQuote(fallbackQuotes);
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  fetch('https://v1.hitokoto.cn/?encode=json', {
    signal: controller.signal
  })
    .then(res => {
      clearTimeout(timeoutId);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      const content = data.hitokoto || fallbackQuotes[0].content;
      const author = data.from_who || data.from || '\u672A\u77E5';
      quoteTextEl.textContent = `"${content}"`;
      quoteAuthorEl.textContent = `- ${author}`;
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error('获取每日一句失败:', error);
      showFallbackQuote(fallbackQuotes);
    });
}

function showFallbackQuote(quotes) {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteTextEl.textContent = `"${randomQuote.content}"`;
  quoteAuthorEl.textContent = `- ${randomQuote.author}`;
}

window.addEventListener('DOMContentLoaded', () => {
  applyCardTransform();
  if (!isMobile && !isSecondaryPage) {
    requestAnimationFrame(animate);
  }
  loadBackgroundImage();
  getDailyQuote();
});
