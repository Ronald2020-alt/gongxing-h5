# 躬行先锋 · 海报生成器

记录杉杉奥莱一线大型节点中的文化践行瞬间，替代 PPT 手动替换，让 HR 同事在手机上「填完即出图」。

- **形态**：纯前端 H5 网页应用（无后端、无数据库）
- **出图**：1080×2340 竖版 PNG（9:19.5 手机全屏比例）
- **使用**：公网部署后，把链接发到员工微信群即可打开使用

---

## 一、功能特性

- **5 套版式**：经典致敬 / 左岸文艺 / 中央聚焦 / 金色典藏 / 渐变沉浸，统一「躬行先锋」主 KV
- **主标题（主 KV）自定义**：
  - 文字模式：标题文字可改（5 字以内），支持 4 种字体（马善政楷书 / 黑体 / 宋体 / 楷体）
  - IP 形象模式：内置 10 款「躬行先锋」标题 IP 可选，也支持上传自己的 PNG 透明底 IP
- **企业 Logo 自定义**：默认杉杉商业集团白色 Logo，可上传替换 + 缩放大小
- **二维码自定义**：默认杉杉妙言视频号二维码，可上传替换 + 缩放，说明文字可改（默认「扫码了解更多」）
- **节点/节日维度**：顶部致敬语随节日变化，支持自定义
- **照片处理**：先自动裁切、后手势微调（拖动定位 + 双指/滚轮缩放）
- **底部城市页脚**：24 城列表半透明小字排布
- 所有数据仅在浏览器本地处理，不会上传

## 二、目录结构

```
gongxing-poster/
├── index.html
├── styles.css
├── script.js
├── assets/
│   ├── html-to-image.js   # 导出库（本地化，离线可用）
│   ├── logo_default.png   # 默认企业 Logo（杉杉商业集团）
│   ├── qrcode_default.png # 默认二维码（杉杉妙言视频号）
│   ├── sample.jpg         # 示例照片
│   └── ip/ip1~ip10.png    # 10 款「躬行先锋」标题 IP（透明底）
├── README.md
└── valet.json
```

## 三、快速开始（本地预览）

```bash
cd gongxing-poster
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080
```

## 四、公网部署方案（三选一，推荐方案一）

### 方案一：Nginx 静态托管（公司自有服务器）

```bash
# 上传整个 gongxing-poster 目录到服务器，如 /var/www/gongxing-poster
yum install -y nginx
# 新增 /etc/nginx/conf.d/gongxing.conf
server {
    listen 80;
    server_name gongxing.xxx.com;
    root /var/www/gongxing-poster;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
    location ~* \.(css|js|png|jpg|woff2)$ { expires 7d; add_header Cache-Control "public"; }
}
nginx -t && systemctl restart nginx
# 域名解析 + HTTPS（certbot --nginx -d gongxing.xxx.com）
```

### 方案二：对象存储/OSS + CDN（零服务器）
上传目录到阿里云 OSS / 腾讯云 COS → 开启静态网站托管 → 索引文档 `index.html` → 绑定域名 + CDN。

### 方案三：静态托管平台（最快验证）
整个目录拖到 Vercel / Netlify / GitHub Pages 即得公网链接。

## 五、使用说明（给 HR 同事）

1. 上传人物照片（单张竖版，单人/双人主角）
2. 选择节点/节日（决定顶部致敬语，可自定义）
3. 选择主标题形态：文字（可改标题 + 字体）或 IP 形象（10 款可选 / 上传自己的 PNG）
4. 填写：文艺主文案、门店、部门/岗位、姓名、画面主要内容
5. （可选）替换企业 Logo 和二维码，调整大小
6. 选择版式 → 点「调整构图」微调照片 → 点「生成并下载海报」

## 六、技术说明与依赖

| 依赖 | 说明 |
|------|------|
| `assets/html-to-image.js` | 海报导出库，已本地化，离线可用 |
| Ma Shan Zheng 字体 | 主 KV 书法字体，走 jsdelivr CDN；失败时降级系统楷体 |
| 系统字体 | 黑体/宋体/楷体为系统字体，导出时由本机渲染 |

> 字体本地化：如需 100% 离线，把 `@fontsource/ma-shan-zheng` 下载到 `assets/fonts/`，并改 `index.html` 中的字体 `<link>` 为本地路径。

## 七、常见问题

- **导出无反应**：确认已上传照片；建议使用近两年 Chrome/Safari。
- **iPhone 无法选图**：已修复（采用原生 label 触发），请用最新版重新部署。
- **字体显示为楷体**：网络无法访问 jsdelivr，属正常降级，不影响出图。
- **照片模糊**：上传清晰原图（短边建议 ≥ 1080px）。
