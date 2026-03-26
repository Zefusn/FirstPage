# 个人导航页面

一个简约的个人导航页面，支持响应式设计，适配桌面和移动设备。

## 功能特点

- 🎨 **美观设计**：玻璃态效果、3D卡片倾斜效果、动态背景
- 📱 **响应式布局**：适配桌面、平板和移动设备
- 🌅 **每日一句**：从网络获取随机名言警句
- 🖼️ **动态背景**：使用Bing每日壁纸作为背景
- ⚡ **性能优化**：针对移动端和低性能设备进行了优化
- 🔧 **易于定制**：可通过修改HTML和CSS文件轻松定制内容和样式

## 技术栈

- **前端**：HTML5、CSS3、JavaScript
- **样式**：自定义CSS（无外部依赖）
- **API**：
  - 背景图：Bing每日壁纸API
  - 名言：type.fit名言API

## 项目结构

```
FirstPage/
├── index.html          # 主页面
├── assets/
│   ├── css/           # CSS文件
│   │   └── style.css  # 主样式文件
│   ├── js/            # JavaScript文件
│   │   └── script.js  # 主脚本文件
│   └── img/           # 图片文件
│       ├── avatar.jpg  # 头像（需自行添加）
│       └── favicon.ico # 网站图标（需自行添加）
└── README.md          # 项目说明
```

## 快速开始

1. **克隆仓库**
   ```bash
   git clone https://github.com/Zefusn/FirstPage.git
   cd FirstPage
   ```

2. **添加头像和图标**
   - 在 `assets/img/` 文件夹中添加 `avatar.jpg` 作为头像
   - 在 `assets/img/` 文件夹中添加 `favicon.ico` 作为网站图标

3. **修改内容**
   - 打开 `index.html` 文件，修改个人信息和链接
   - 打开 `assets/js/script.js` 文件，可根据需要调整配置

4. **本地预览**
   ```bash
   # 使用Python启动本地服务器
   python -m http.server 8000
   # 或使用Node.js
   npx serve
   ```
   然后在浏览器中访问 `http://localhost:8000`

## 部署

### 部署到GitHub Pages
1. 确保代码已推送到GitHub仓库
2. 在仓库设置中开启GitHub Pages
3. 选择 `main` 分支作为源
4. 访问生成的GitHub Pages URL

### 部署到其他服务器
1. 将所有文件上传到服务器的网站根目录
2. 确保服务器配置正确，支持静态文件访问

## 性能优化

- **移动端优化**：针对移动设备减少动画和渐变效果
- **网络优化**：添加API请求超时和错误处理
- **渲染优化**：使用硬件加速和减少DOM操作
- **资源优化**：内联关键CSS，延迟加载非关键资源

## 自定义

### 修改个人信息
编辑 `index.html` 文件，修改以下内容：
- `<div class="name">Zefusn</div>` - 个人昵称
- `<div class="footer">© 2026 Zefusn · 保持热爱，无限进步</div>` - 版权信息
- 链接按钮的文本和URL

### 修改样式
编辑 `assets/css/style.css` 文件，可调整：
- 颜色变量（`--accent`, `--accent2` 等）
- 字体大小和间距
- 动画效果
- 响应式布局规则

### 修改功能
编辑 `assets/js/script.js` 文件，可调整：
- 背景图API
- 名言API
- 动画参数
- 错误处理逻辑

## 浏览器兼容性

- ✅ Chrome
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ 移动端浏览器

## 许可证

MIT License

## 贡献

欢迎提交Issue和Pull Request！

## 致谢

- 背景图：Bing每日壁纸 API
- 名言：type.fit API
- 设计灵感：现代玻璃态UI设计趋势
