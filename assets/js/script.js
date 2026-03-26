const card = document.getElementById('card');
const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');

let currentX = 0;
let currentY = 0;
let velocityX = 0;
let velocityY = 0;
let targetX = 0;
let targetY = 0;

const motionEnabled = window.matchMedia('(min-width: 768px) and (hover: hover) and (pointer: fine)').matches;
const stiffness = 0.07;
const damping = 0.82;
const maxTilt = 3.2;

function applyCardTransform() {
  const scale = window.innerWidth < 768 ? 1 : 0.85;
  card.style.transform = `scale(${scale}) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
}

function animateCard() {
  const forceX = (targetX - currentX) * stiffness;
  const forceY = (targetY - currentY) * stiffness;

  velocityX = (velocityX + forceX) * damping;
  velocityY = (velocityY + forceY) * damping;

  currentX += velocityX;
  currentY += velocityY;

  if (
    Math.abs(velocityX) > 0.005 ||
    Math.abs(velocityY) > 0.005 ||
    Math.abs(targetX - currentX) > 0.005 ||
    Math.abs(targetY - currentY) > 0.005
  ) {
    applyCardTransform();
  }

  requestAnimationFrame(animateCard);
}

function updateCardTilt(clientX, clientY) {
  const rect = card.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const offsetX = (clientX - centerX) / (rect.width / 2);
  const offsetY = (clientY - centerY) / (rect.height / 2);

  targetX = Math.max(-maxTilt, Math.min(maxTilt, -offsetX * maxTilt));
  targetY = Math.max(-maxTilt, Math.min(maxTilt, offsetY * maxTilt));
}

function resetCardTilt() {
  targetX = 0;
  targetY = 0;
}

function loadBackgroundImage() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  fetch('https://bing.biturl.top/?resolution=1920&format=json', {
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
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.src = data.url;

      img.onload = () => {
        document.body.style.backgroundImage = `url(${data.url})`;
        updateAccentColors(img);
      };

      img.onerror = () => {
        console.error('背景图片加载失败');
        document.body.style.backgroundColor = '#f0f0f0';
      };
    })
    .catch(error => {
      clearTimeout(timeoutId);
      console.error('获取背景图失败:', error);
      document.body.style.backgroundColor = '#f0f0f0';
    });
}

function updateAccentColors(img) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 60;
    canvas.height = 60;
    ctx.drawImage(img, 0, 0, 60, 60);

    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    let r2 = 0;
    let g2 = 0;
    let b2 = 0;

    const pixels = ctx.getImageData(0, 0, 60, 60).data;
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
    console.error('颜色分析失败:', error);
  }
}

function getDailyQuote() {
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
  if (motionEnabled) {
    card.addEventListener('mouseenter', () => {
      card.style.willChange = 'transform';
    });

    card.addEventListener('mousemove', e => {
      updateCardTilt(e.clientX, e.clientY);
    });

    card.addEventListener('mouseleave', () => {
      resetCardTilt();
      card.style.willChange = 'auto';
    });

    requestAnimationFrame(animateCard);
  }

  loadBackgroundImage();
  getDailyQuote();
});
