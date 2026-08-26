# 躬行先锋 · 海报生成器

记录杉杉奥莱一线大型节点中的文化践行瞬间，替代 PPT 手动替换，让 HR 同事在手机上「填完即出图」。

- **形态**：纯前端 H5 网页应用（无后端、无数据库）
- **出图**：1080×1920 竖版 PNG（9:16 + 上下渐变黑，手机端视觉全屏）
- **使用**：公网部署后，把链接发到员工微信群即可打开使用

---

## 一、功能特性

- 5 套统一「躬行先锋」主 KV 的版式（经典致敬 / 左岸文艺 / 中央聚焦 / 金色典藏 / 渐变沉浸）
- 节点/节日维度：顶部致敬语随节日变化，也支持自定义
- 照片「先自动裁切、后手势微调」：拖动定位 + 双指/滚轮缩放
- 所有数据仅在浏览器本地处理，不会上传服务器

## 二、目录结构

```
gongxing-poster/
├── index.html           # 应用入口
├── styles.css           # 界面 + 海报样式
├── script.js            # 核心逻辑（渲染/裁剪/导出）
├── assets/
│   ├── html-to-image.js # 导出库（已本地化，无需联网）
│   ├── sample.jpg       # 示例照片
│   └── export_sample.png# 导出成品示例
└── valet.json
```

## 三、快速开始（本地预览）

```bash
cd gongxing-poster
python3 -m http.server 8080
# 浏览器打开 http://127.0.0.1:8080
```

## 四、公网部署方案（三选一，推荐方案一）

> 目标是拿到一个公网网址（如 `https://gongxing.xxx.com`），发到微信群里点开即用。
> 因为应用是纯静态的，部署成本极低，任选其一即可。

### 方案一：Nginx 静态托管（公司自有服务器）

```bash
# 1. 上传整个 gongxing-poster 目录到服务器，例如 /var/www/gongxing-poster
# 2. 安装 nginx（以 CentOS/Anolis 为例）
yum install -y nginx

# 3. 新增站点配置 /etc/nginx/conf.d/gongxing.conf
server {
    listen 80;
    server_name gongxing.xxx.com;   # 换成你的域名
    root /var/www/gongxing-poster;
    index index.html;
    location / {
        try_files $uri $uri/ /index.html;
    }
    # 静态资源缓存
    location ~* \.(css|js|png|jpg|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }
}

# 4. 启动
nginx -t && systemctl restart nginx

# 5. 域名解析到服务器 IP，并用 HTTPS（建议用 certbot 免费证书）
# certbot --nginx -d gongxing.xxx.com
```

### 方案二：对象存储/OSS + CDN（零服务器，最省心）

1. 把 `gongxing-poster` 目录下的文件上传到阿里云 OSS / 腾讯云 COS 的存储桶；
2. 开启「静态网站托管」，索引文档设为 `index.html`；
3. 绑定自定义域名（或直接用 OSS 提供的默认域名）；
4. 开启 CDN 加速即可。适合没有运维、不想管服务器的场景。

### 方案三：静态托管平台（最简单，适合先验证）

把整个目录拖到 Vercel / Netlify / GitHub Pages 即可得到一个公网链接。
（注意：如公司有内网合规要求，优先用方案一/二，部署在自有环境。）

## 五、使用说明（给 HR 同事）

1. 打开链接 → 上传人物照片（单张竖版，单人/双人主角）；
2. 选择节点/节日（决定顶部致敬语，也可自定义）；
3. 填写：文艺主文案、门店、部门/岗位、姓名、画面主要内容；
4. 选择喜欢的版式；
5. 点「调整构图」微调照片位置/大小，满意后点「完成」；
6. 点「生成并下载海报」，图片自动保存到相册。

## 六、技术说明与依赖

| 依赖 | 说明 |
|------|------|
| `assets/html-to-image.js` | 海报导出库，**已本地化**，离线可用 |
| Ma Shan Zheng 字体 | 主 KV「躬行先锋」书法字体，走 jsdelivr CDN 加载；加载失败时自动降级为系统楷体 |

> **关于字体 CDN**：主 KV 书法字体当前通过 `cdn.jsdelivr.net` 加载（国内一般可用）。如需 100% 离线/内网，可把 `@fontsource/ma-shan-zheng` 字体包下载到 `assets/fonts/`，并将 `index.html` 中的字体 `<link>` 改为本地路径。

## 七、后续可扩展（可选）

- 数据留档：接入后端，保存历史海报、批量下载导出
- 真实二维码：替换右下角占位二维码为你自己的公众号二维码图
- 更多版式：在 `script.js` 的 `TEMPLATES` 与 `styles.css` 中新增模板
- 水印/品牌定制：调整 `styles.css` 顶部的 Design Token 变量

## 八、常见问题

- **导出按钮没反应**：确认已上传照片；检查浏览器是否较新（建议 Chrome/Safari 近两年版本）。
- **字体显示为普通楷体**：网络无法访问 jsdelivr，属正常降级，不影响功能；可参照第六节本地化字体。
- **照片模糊**：请上传清晰的原图（建议短边 ≥ 1080px），海报会按 1080×1920 输出。
