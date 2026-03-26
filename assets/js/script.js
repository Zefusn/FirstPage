const quoteTextEl = document.getElementById('quote-text');
const quoteAuthorEl = document.getElementById('quote-author');
const cardEl = document.getElementById('card');

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
    { content: '保持好奇，慢慢变好。', author: '未知' },
    { content: '行动是成功的阶梯，行动越多，登得越高。', author: '未知' },
    { content: '每一个不曾起舞的日子，都是对生命的辜负。', author: '尼采' },
    { content: '生活不是缺少美，而是缺少发现美的眼睛。', author: '罗丹' },
    { content: '成功不是终点，失败也不是终结，只有勇气才是永恒。', author: '丘吉尔' },
    { content: '路漫漫其修远兮，吾将上下而求索。', author: '屈原' },
    { content: '山重水复疑无路，柳暗花明又一村。', author: '陆游' },
    { content: '天行健，君子以自强不息。', author: '《周易》' },
    { content: '地势坤，君子以厚德载物。', author: '《周易》' },
    { content: '海纳百川，有容乃大。', author: '林则徐' }
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
      const author = data.from_who || data.from || '未知';
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

function enableCardTilt() {
  if (!cardEl) {
    return;
  }

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  if (prefersReducedMotion || !finePointer) {
    cardEl.style.transform = 'none';
    return;
  }

  let rafId = null;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  const maxTilt = 2.2;
  const ease = 0.12;

  const render = () => {
    currentRotateX += (targetRotateX - currentRotateX) * ease;
    currentRotateY += (targetRotateY - currentRotateY) * ease;

    const isSettled =
      Math.abs(targetRotateX - currentRotateX) < 0.01 &&
      Math.abs(targetRotateY - currentRotateY) < 0.01;

    if (isSettled) {
      currentRotateX = targetRotateX;
      currentRotateY = targetRotateY;
    }

    cardEl.style.transform = `rotateX(${currentRotateX.toFixed(2)}deg) rotateY(${currentRotateY.toFixed(2)}deg)`;

    if (!isSettled) {
      rafId = window.requestAnimationFrame(render);
    } else {
      if (targetRotateX === 0 && targetRotateY === 0) {
        cardEl.classList.remove('is-tilting');
      }
      rafId = null;
    }
  };

  const queueRender = () => {
    if (rafId === null) {
      rafId = window.requestAnimationFrame(render);
    }
  };

  cardEl.addEventListener('pointermove', event => {
    const rect = cardEl.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left) / rect.width;
    const offsetY = (event.clientY - rect.top) / rect.height;

    targetRotateY = (offsetX - 0.5) * maxTilt * 2;
    targetRotateX = (0.5 - offsetY) * maxTilt * 2;

    cardEl.classList.add('is-tilting');
    queueRender();
  });

  cardEl.addEventListener('pointerleave', () => {
    targetRotateX = 0;
    targetRotateY = 0;
    queueRender();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  loadBackgroundImage();
  getDailyQuote();
  enableCardTilt();
});
