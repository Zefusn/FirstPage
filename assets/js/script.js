// 性能优化：使用requestAnimationFrame进行动画
const card = document.getElementById('card');

let currentX = 0, currentY = 0;
let velocityX = 0, velocityY = 0;
let targetX = 0, targetY = 0;

const stiffness = 0.08;
const damping = 0.82;

// 优化动画性能
function animate() {
  const forceX = (targetX - currentX) * stiffness;
  const forceY = (targetY - currentY) * stiffness;

  velocityX = (velocityX + forceX) * damping;
  velocityY = (velocityY + forceY) * damping;

  currentX += velocityX;
  currentY += velocityY;

  // 性能优化：只在有变化时更新DOM
  if (Math.abs(velocityX) > 0.01 || Math.abs(velocityY) > 0.01) {
    const scale = window.innerWidth < 768 ? 1 : 0.85;
    card.style.transform = `scale(${scale}) rotateY(${currentX}deg) rotateX(${currentY}deg)`;
    card.style.setProperty('--mx', (50 - currentX * 1.6) + '%');
    card.style.setProperty('--my', (50 - currentY * 1.6) + '%');
  }

  requestAnimationFrame(animate);
}

// 延迟启动动画，提升页面加载速度
setTimeout(animate, 100);

// 事件监听器优化
document.addEventListener('mousemove', e => {
  const max = 12;
  targetX = Math.max(-max, Math.min(max, (window.innerWidth / 2 - e.clientX) / 60));
  targetY = Math.max(-max, Math.min(max, -(window.innerHeight / 2 - e.clientY) / 60));
});

document.addEventListener('mouseleave', () => {
  targetX = 0;
  targetY = 0;
});

/* ===== 移动端触摸补充 ===== */
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if (isMobile) {
  // 移动端优化：使用passive事件监听器
  document.addEventListener('touchmove', e => {
    const max = 10;
    targetX = Math.max(-max, Math.min(max, (window.innerWidth / 2 - e.touches[0].clientX) / 60));
    targetY = Math.max(-max, Math.min(max, -(window.innerHeight / 2 - e.touches[0].clientY) / 60));
  }, { passive: true });

  document.addEventListener('touchend', () => {
    targetX = 0;
    targetY = 0;
  });
}

/* 背景图 */
function loadBackgroundImage() {
  // 添加错误处理和超时
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  fetch("https://bing.biturl.top/?resolution=1920&format=json", {
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
    img.crossOrigin = "Anonymous";
    img.src = data.url;
    
    // 预加载图片
    img.onload = () => {
      document.body.style.backgroundImage = `url(${data.url})`;
      updateAccentColors(img);
    };
    
    img.onerror = () => {
      console.error('背景图片加载失败');
      // 使用默认背景色
      document.body.style.backgroundColor = '#f0f0f0';
    };
  })
  .catch(error => {
    clearTimeout(timeoutId);
    console.error('获取背景图失败:', error);
    // 使用默认背景色
    document.body.style.backgroundColor = '#f0f0f0';
  });
}

// 提取颜色分析为单独函数
function updateAccentColors(img) {
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 60; canvas.height = 60;
    ctx.drawImage(img, 0, 0, 60, 60);

    let r = 0, g = 0, b = 0, count = 0;
    let r2 = 0, g2 = 0, b2 = 0;

    const pixels = ctx.getImageData(0, 0, 60, 60).data;
    for (let i = 0; i < pixels.length; i += 4) {
      const pr = pixels[i], pg = pixels[i + 1], pb = pixels[i + 2];
      r += pr; g += pg; b += pb;
      if (i % 8 === 0) { r2 += pr; g2 += pg; b2 += pb; }
      count++;
    }

    r = Math.floor(r / count); g = Math.floor(g / count); b = Math.floor(b / count);
    r2 = Math.floor(r2 / (count / 2)); g2 = Math.floor(g2 / (count / 2)); b2 = Math.floor(b2 / (count / 2));

    document.documentElement.style.setProperty('--accent', `${r},${g},${b}`);
    document.documentElement.style.setProperty('--accent2', `${r2},${g2},${b2}`);

    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);

    if (brightness > 160) {
      document.body.classList.add('light-bg');
    } else {
      document.body.classList.add('dark-bg');
    }
  } catch (error) {
    console.error('颜色分析失败:', error);
  }
}

/* 每日一句 */
function getDailyQuote() {
  // 扩展备选名言列表
  const fallbackQuotes = [
    { content: "保持好奇，慢慢变好", author: "未知" },
    { content: "行动是成功的阶梯，行动越多，登得越高", author: "未知" },
    { content: "每一个不曾起舞的日子，都是对生命的辜负", author: "尼采" },
    { content: "生活不是缺少美，而是缺少发现美的眼睛", author: "罗丹" },
    { content: "成功不是终点，失败也不是终结，只有勇气才是永恒", author: "丘吉尔" },
    { content: "路漫漫其修远兮，吾将上下而求索", author: "屈原" },
    { content: "山重水复疑无路，柳暗花明又一村", author: "陆游" },
    { content: "天行健，君子以自强不息", author: "《周易》" },
    { content: "地势坤，君子以厚德载物", author: "《周易》" },
    { content: "海纳百川，有容乃大", author: "林则徐" }
  ];

  // 检查网络状态
  if (!navigator.onLine) {
    console.log('网络离线，使用本地备选名言');
    showFallbackQuote(fallbackQuotes);
    return;
  }

  // 尝试从API获取名言（添加超时设置）
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  fetch("https://type.fit/api/quotes", {
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
    console.log('获取名言成功:', data);
    // 从返回的名言数组中随机选择一条
    const randomIndex = Math.floor(Math.random() * data.length);
    const randomQuote = data[randomIndex];
    document.getElementById('quote-text').textContent = `"${randomQuote.text}"`;
    document.getElementById('quote-author').textContent = `- ${randomQuote.author || '未知'}`;
  })
  .catch(error => {
    clearTimeout(timeoutId);
    console.error('获取每日一句失败:', error);
    // 使用备选名言
    showFallbackQuote(fallbackQuotes);
  });
}

// 显示备选名言
function showFallbackQuote(quotes) {
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById('quote-text').textContent = `"${randomQuote.content}"`;
  document.getElementById('quote-author').textContent = `- ${randomQuote.author}`;
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', () => {
  // 并行加载资源，提升性能
  Promise.all([
    new Promise(resolve => {
      loadBackgroundImage();
      resolve();
    }),
    new Promise(resolve => {
      getDailyQuote();
      resolve();
    })
  ]).then(() => {
    console.log('页面资源加载完成');
  });
});
