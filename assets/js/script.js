const card=document.getElementById('card');

let currentX = 0, currentY = 0;
let velocityX = 0, velocityY = 0;
let targetX = 0, targetY = 0;

const stiffness = 0.08;
const damping = 0.82;

function animate(){
  const forceX = (targetX - currentX) * stiffness;
  const forceY = (targetY - currentY) * stiffness;

  velocityX = (velocityX + forceX) * damping;
  velocityY = (velocityY + forceY) * damping;

  currentX += velocityX;
  currentY += velocityY;

  card.style.transform = `scale(${window.innerWidth<768?1:0.85}) rotateY(${currentX}deg) rotateX(${currentY}deg)`;

  card.style.setProperty('--mx', (50 - currentX * 1.6) + '%');
  card.style.setProperty('--my', (50 - currentY * 1.6) + '%');

  requestAnimationFrame(animate);
}
animate();

document.addEventListener('mousemove',e=>{
  const max = 12;
  targetX = Math.max(-max, Math.min(max, (window.innerWidth/2 - e.clientX)/60));
  targetY = Math.max(-max, Math.min(max, -(window.innerHeight/2 - e.clientY)/60));
});

document.addEventListener('mouseleave',()=>{
  targetX = 0;
  targetY = 0;
});

/* ===== 移动端触摸补充 ===== */
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

if(isMobile){
  document.addEventListener('touchmove',e=>{
    const max = 10;
    targetX = Math.max(-max, Math.min(max, (window.innerWidth/2 - e.touches[0].clientX)/60));
    targetY = Math.max(-max, Math.min(max, -(window.innerHeight/2 - e.touches[0].clientY)/60));
  });

  document.addEventListener('touchend',()=>{
    targetX = 0;
    targetY = 0;
  });
}

/* 背景图 */
fetch("https://bing.biturl.top/?resolution=1920&format=json")
.then(res=>res.json())
.then(data=>{
  const img=new Image();
  img.crossOrigin="Anonymous";
  img.src=data.url;
  document.body.style.backgroundImage=`url(${data.url})`;

  img.onload=()=>{
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d');
    canvas.width=60; canvas.height=60;
    ctx.drawImage(img,0,0,60,60);

    let r=0,g=0,b=0,count=0;
    let r2=0,g2=0,b2=0;

    const pixels=ctx.getImageData(0,0,60,60).data;
    for(let i=0;i<pixels.length;i+=4){
      const pr=pixels[i], pg=pixels[i+1], pb=pixels[i+2];
      r+=pr; g+=pg; b+=pb;
      if(i%8===0){ r2+=pr; g2+=pg; b2+=pb; }
      count++;
    }

    r=Math.floor(r/count); g=Math.floor(g/count); b=Math.floor(b/count);
    r2=Math.floor(r2/(count/2)); g2=Math.floor(g2/(count/2)); b2=Math.floor(b2/(count/2));

    document.documentElement.style.setProperty('--accent',`${r},${g},${b}`);
    document.documentElement.style.setProperty('--accent2',`${r2},${g2},${b2}`);

    const brightness=(r*0.299 + g*0.587 + b*0.114);

    if(brightness>160){
      document.body.classList.add('light-bg');
    }else{
      document.body.classList.add('dark-bg');
    }
  };
});

/* 每日一句 */
function getDailyQuote() {
  // 备选名言列表，当API调用失败时使用
  const fallbackQuotes = [
    { content: "保持好奇，慢慢变好", author: "未知" },
    { content: "行动是成功的阶梯，行动越多，登得越高", author: "未知" },
    { content: "每一个不曾起舞的日子，都是对生命的辜负", author: "尼采" },
    { content: "生活不是缺少美，而是缺少发现美的眼睛", author: "罗丹" },
    { content: "成功不是终点，失败也不是终结，只有勇气才是永恒", author: "丘吉尔" }
  ];

  // 尝试从API获取名言
  fetch("https://api.quotable.io/random")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    console.log('获取名言成功:', data);
    document.getElementById('quote-text').textContent = `"${data.content}"`;
    document.getElementById('quote-author').textContent = `- ${data.author}`;
  })
  .catch(error => {
    console.error('获取每日一句失败:', error);
    // 使用备选名言
    const randomQuote = fallbackQuotes[Math.floor(Math.random() * fallbackQuotes.length)];
    document.getElementById('quote-text').textContent = `"${randomQuote.content}"`;
    document.getElementById('quote-author').textContent = `- ${randomQuote.author}`;
  });
}

// 页面加载完成后获取名言
document.addEventListener('DOMContentLoaded', getDailyQuote);
