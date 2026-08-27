/* ============================================================
   躬行先锋 · 海报生成器 —— 核心逻辑
============================================================ */
(function () {
  'use strict';

  const PW = 1080, PH = 2340; // 9:19.5

  // ---------- 节点 / 节日 ----------
  const NODES = [
    { id: 'default',     name: '通用 · 致敬劳动者',   l1: '致敬每一位', l2: '辛勤付出的零售劳动者', en: '' },
    { id: 'dragonboat',  name: '端午节',              l1: '致敬每一位', l2: '辛勤付出的零售劳动者', en: 'Dragon Boat Festival' },
    { id: 'spring',      name: '春节',                l1: '致敬每一位', l2: '坚守一线的零售人',     en: 'Spring Festival' },
    { id: 'midautumn',   name: '中秋节',              l1: '致敬每一位', l2: '团圆的守护者',         en: 'Mid-Autumn Festival' },
    { id: 'anniversary', name: '店庆 / 周年庆',       l1: '热烈庆祝',   l2: '杉杉奥莱周年庆',       en: 'Anniversary' },
    { id: 'double12',    name: '12.8 大促',           l1: '致敬每一位', l2: '大促背后的奋斗者',     en: '12.8 Grand Sale' },
    { id: 'custom',      name: '自定义节点',          l1: '',           l2: '',                     en: '' },
  ];

  const CITIES = '宁波 · 哈尔滨 · 郑州 · 晋中 · 南昌 · 赣州 · 兰州 · 衡阳 · 新疆 · 沈阳 · 贵阳 · 深圳 · 南宁 · 徐州 · 太原 · 天津 · 成都 · 郑州二店 · 大连 · 合肥 · 长沙 · 武汉 · 无锡 · 西安';

  const TEMPLATES = [
    { id: 1, name: '经典致敬' },
    { id: 2, name: '左岸文艺' },
    { id: 3, name: '中央聚焦' },
    { id: 4, name: '金色典藏' },
    { id: 5, name: '渐变沉浸' },
  ];

  const $ = (s) => document.querySelector(s);
  const poster = $('#poster');
  const posterWrap = $('#posterWrap');
  const previewStage = $('#previewStage');
  const pPhoto = $('#pPhoto');

  const photoState = { src: null, nw: 0, nh: 0, scale: 1, dx: 0, dy: 0, baseScale: 1 };
  let adjusting = false;

  // ---------- 节点下拉 ----------
  const nodeSelect = $('#nodeSelect');
  NODES.forEach((n) => { const o = document.createElement('option'); o.value = n.id; o.textContent = n.name; nodeSelect.appendChild(o); });

  // ---------- 模板选择 ----------
  const tplGrid = $('#tplGrid');
  TEMPLATES.forEach((t) => {
    const item = document.createElement('div');
    item.className = 'tpl-item' + (t.id === 1 ? ' active' : '');
    item.dataset.id = t.id;
    item.innerHTML = '<div class="tpl-thumb">' + thumbHTML(t.id) + '</div><div class="tpl-name">' + t.name + '</div><div class="tpl-check">✓</div>';
    item.addEventListener('click', () => selectTemplate(t.id));
    tplGrid.appendChild(item);
  });
  function thumbHTML(id) {
    const bar = (w, h, c, mt) => '<div style="width:' + w + '%;height:' + h + 'px;background:' + c + ';margin-top:' + mt + 'px;border-radius:2px;"></div>';
    const gold = '#d9b45f', white = 'rgba(255,255,255,.9)';
    let inner = '';
    if (id === 2) inner = bar(55, 4, white, 8) + bar(40, 3, 'rgba(255,255,255,.6)', 5) + bar(80, 7, white, 16) + bar(70, 7, white, 6) + bar(60, 8, gold, 22);
    else if (id === 3) inner = bar(40, 4, white, 14) + bar(90, 11, white, 12) + bar(55, 7, white, 20);
    else if (id === 4) inner = '<div style="height:calc(100% - 12px);margin:6px;border:1.5px solid rgba(217,180,95,.7);padding:8px;box-sizing:border-box;">' + bar(80, 5, white, 4) + bar(85, 9, white, 14) + bar(70, 8, gold, 20) + '</div>';
    else if (id === 5) inner = bar(80, 4, white, 10) + bar(85, 6, white, 18) + bar(70, 12, gold, 26);
    else inner = bar(55, 4, white, 8) + bar(80, 8, white, 16) + bar(65, 7, white, 6) + bar(70, 9, gold, 18);
    return '<div style="padding:0 8px;background:linear-gradient(180deg,#3a3a3e,#141416);height:100%;display:flex;flex-direction:column;align-items:center;">' + inner + '</div>';
  }
  function selectTemplate(id) {
    poster.dataset.template = id;
    document.querySelectorAll('.tpl-item').forEach((el) => el.classList.toggle('active', +el.dataset.id === id));
    fitPreview();
  }

  // ---------- 主KV：模式切换 ----------
  const kvModeSeg = $('#kvModeSeg');
  const kvTextMode = $('#kvTextMode');
  const kvIpMode = $('#kvIpMode');
  let kvMode = 'text';
  kvModeSeg.addEventListener('click', (e) => {
    const btn = e.target.closest('.seg-btn'); if (!btn) return;
    kvMode = btn.dataset.mode;
    kvModeSeg.querySelectorAll('.seg-btn').forEach((b) => b.classList.toggle('active', b === btn));
    kvTextMode.hidden = kvMode !== 'text';
    kvIpMode.hidden = kvMode !== 'ip';
    applyKvMode();
  });
  function applyKvMode() {
    $('#pKvTextWrap').style.display = kvMode === 'text' ? 'flex' : 'none';
    $('#pKvIp').hidden = kvMode !== 'ip';
  }

  // ---------- 主KV：文字 + 字体 + 字号 ----------
  const kvText = $('#kvText');
  const kvFont = $('#kvFont');
  const pKvText = $('#pKvText');
  function fitKvFont() {
    const len = (kvText.value || '').trim().length;
    const size = len <= 2 ? 220 : len === 3 ? 200 : len === 4 ? 178 : 150;
    pKvText.style.fontSize = size + 'px';
  }
  kvText.addEventListener('input', () => { pKvText.textContent = kvText.value.trim() || '躬行先锋'; fitKvFont(); });
  kvFont.addEventListener('change', () => { pKvText.dataset.font = kvFont.value; });

  // ---------- 主KV：IP 选择 ----------
  const ipGrid = $('#ipGrid');
  const pKvIp = $('#pKvIp');
  let currentIp = 0; // 0=无，1-10=内置
  for (let i = 1; i <= 10; i++) {
    const item = document.createElement('div');
    item.className = 'ip-item';
    item.dataset.id = i;
    item.innerHTML = '<img src="./assets/ip/ip' + i + '.png" alt=""><div class="ip-check">✓</div>';
    item.addEventListener('click', () => selectIp(i));
    ipGrid.appendChild(item);
  }
  function selectIp(i) {
    currentIp = i;
    document.querySelectorAll('.ip-item').forEach((el) => el.classList.toggle('active', +el.dataset.id === i));
    pKvIp.src = './assets/ip/ip' + i + '.png';
  }
  $('#ipUpload').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { pKvIp.src = ev.target.result; currentIp = -1; document.querySelectorAll('.ip-item').forEach((el) => el.classList.remove('active')); };
    r.readAsDataURL(f);
  });

  // ---------- logo ----------
  const pLogo = $('#pLogo');
  const logoScale = $('#logoScale');
  const DEFAULT_LOGO = './assets/logo_default.png';
  function applyLogo() { pLogo.style.width = (270 * parseFloat(logoScale.value)) + 'px'; }
  $('#logoInput').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { pLogo.src = ev.target.result; };
    r.readAsDataURL(f);
  });
  $('#logoReset').addEventListener('click', () => { pLogo.src = DEFAULT_LOGO; logoScale.value = 1; applyLogo(); });
  logoScale.addEventListener('input', applyLogo);

  // ---------- 二维码 ----------
  const pQrImg = $('#pQrImg');
  const qrScale = $('#qrScale');
  const qrLabel = $('#qrLabel');
  const pQrLabel = $('#pQrLabel');
  const DEFAULT_QR = './assets/qrcode_default.png';
  const QR_BASE = 176;
  function applyQr() {
    const w = QR_BASE * parseFloat(qrScale.value);
    pQrImg.style.width = w + 'px';
    pQrImg.style.height = w + 'px';
    pQrLabel.style.width = w + 'px';
  }
  $('#qrInput').addEventListener('change', (e) => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = (ev) => { pQrImg.src = ev.target.result; };
    r.readAsDataURL(f);
  });
  $('#qrReset').addEventListener('click', () => { pQrImg.src = DEFAULT_QR; qrScale.value = 1; applyQr(); });
  qrScale.addEventListener('input', applyQr);
  qrLabel.addEventListener('input', () => { pQrLabel.textContent = qrLabel.value.trim() || '扫码了解更多'; });

  // ---------- 节点切换 ----------
  const nodeCustom = $('#nodeCustom');
  nodeSelect.addEventListener('change', () => {
    const n = NODES.find((x) => x.id === nodeSelect.value);
    if (n.id === 'custom') { nodeCustom.hidden = false; }
    else { nodeCustom.hidden = true; $('#tributeLine1').value = n.l1; $('#tributeLine2').value = n.l2; $('#tributeEn').value = n.en; }
    renderTribute();
  });

  // ---------- 文案字段 ----------
  ['quote', 'shop', 'dept', 'name', 'scene', 'tributeLine1', 'tributeLine2', 'tributeEn'].forEach((f) => {
    document.getElementById(f).addEventListener('input', () => { f.startsWith('tribute') ? renderTribute() : renderText(); });
  });
  function renderTribute() {
    $('#pTributeLine1').textContent = $('#tributeLine1').value.trim();
    $('#pTributeLine2').textContent = $('#tributeLine2').value.trim();
    $('#pTributeEn').textContent = $('#tributeEn').value.trim();
  }
  function renderText() {
    const quote = $('#quote').value.trim();
    $('#pQuote').innerHTML = quote ? quote.replace(/\n/g, '<br>') : '';
    const shop = $('#shop').value.trim(), dept = $('#dept').value.trim(), name = $('#name').value.trim(), scene = $('#scene').value.trim();
    const line1 = ['', shop, dept, name].filter(Boolean).join(' ');
    const parts = [];
    if (line1) parts.push('—— ' + line1);
    if (scene) parts.push(scene);
    $('#pPerson').innerHTML = parts.join('<br>');
  }

  // ---------- 照片上传 & 自动裁切（iOS 兼容：label 原生触发） ----------
  const photoUpload = $('#photoUpload');
  const photoInput = $('#photoInput');
  photoInput.addEventListener('change', (e) => {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        photoState.src = ev.target.result;
        photoState.nw = img.naturalWidth; photoState.nh = img.naturalHeight;
        applyPhotoToDOM(); fitCover();
        photoUpload.classList.add('has-photo');
        $('#photoTip').textContent = '已上传，可在预览区「调整构图」微调';
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
  function applyPhotoToDOM() {
    pPhoto.src = photoState.src;
    pPhoto.style.width = photoState.nw + 'px';
    pPhoto.style.height = photoState.nh + 'px';
    pPhoto.style.objectFit = 'none';
    updatePhotoTransform();
  }
  function fitCover() {
    const s = Math.max(PW / photoState.nw, PH / photoState.nh);
    photoState.baseScale = s; photoState.scale = s;
    photoState.dx = (PW - photoState.nw * s) / 2;
    photoState.dy = (PH - photoState.nh * s) / 2;
    updatePhotoTransform();
  }
  function updatePhotoTransform() {
    pPhoto.style.transformOrigin = '0 0';
    pPhoto.style.transform = 'translate(' + photoState.dx + 'px,' + photoState.dy + 'px) scale(' + photoState.scale + ')';
  }

  // ---------- 预览缩放 ----------
  function fitPreview() {
    const rect = previewStage.getBoundingClientRect();
    const pad = 44;
    const s = Math.min((rect.width - pad) / PW, (rect.height - pad) / PH);
    posterWrap.style.width = PW + 'px';
    posterWrap.style.height = PH + 'px';
    posterWrap.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fitPreview);
  if (window.ResizeObserver) new ResizeObserver(fitPreview).observe(previewStage);

  // ---------- 构图微调 ----------
  const btnAdjust = $('#btnAdjust'), btnReset = $('#btnReset'), adjustHint = $('#adjustHint');
  let drag = null, pinchStart = null;
  btnAdjust.addEventListener('click', () => {
    if (!photoState.src) { alert('请先上传照片'); return; }
    adjusting = !adjusting;
    btnAdjust.classList.toggle('active', adjusting);
    btnAdjust.textContent = adjusting ? '✓ 完成' : '✂ 调整构图';
    adjustHint.hidden = !adjusting;
    posterWrap.style.touchAction = adjusting ? 'none' : '';
    posterWrap.style.cursor = adjusting ? 'grab' : '';
  });
  btnReset.addEventListener('click', () => { if (photoState.src) fitCover(); });
  posterWrap.addEventListener('pointerdown', (e) => {
    if (!adjusting) return;
    drag = { x: e.clientX, y: e.clientY, dx: photoState.dx, dy: photoState.dy };
    posterWrap.style.cursor = 'grabbing';
    posterWrap.setPointerCapture(e.pointerId);
  });
  posterWrap.addEventListener('pointermove', (e) => {
    if (!adjusting || !drag) return;
    photoState.dx = drag.dx + (e.clientX - drag.x);
    photoState.dy = drag.dy + (e.clientY - drag.y);
    updatePhotoTransform();
  });
  posterWrap.addEventListener('pointerup', () => { drag = null; posterWrap.style.cursor = 'grab'; });
  posterWrap.addEventListener('wheel', (e) => {
    if (!adjusting) return;
    e.preventDefault();
    setScale(photoState.scale * (e.deltaY < 0 ? 1.06 : 0.94), e.clientX, e.clientY);
  }, { passive: false });
  posterWrap.addEventListener('touchstart', (e) => {
    if (!adjusting || e.touches.length !== 2) return;
    pinchStart = { d: dist(e.touches), scale: photoState.scale, cx: (e.touches[0].clientX + e.touches[1].clientX) / 2, cy: (e.touches[0].clientY + e.touches[1].clientY) / 2 };
  });
  posterWrap.addEventListener('touchmove', (e) => {
    if (!adjusting || !pinchStart || e.touches.length !== 2) return;
    e.preventDefault();
    setScale(pinchStart.scale * (dist(e.touches) / pinchStart.d), pinchStart.cx, pinchStart.cy);
  }, { passive: false });
  posterWrap.addEventListener('touchend', () => { pinchStart = null; });
  function dist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function setScale(ns, cx, cy) {
    const minS = photoState.baseScale * 0.7, maxS = photoState.baseScale * 3;
    ns = Math.max(minS, Math.min(maxS, ns));
    const rect = posterWrap.getBoundingClientRect();
    const sx = PW / rect.width, sy = PH / rect.height;
    const px = (cx - rect.left) * sx, py = (cy - rect.top) * sy;
    const old = photoState.scale;
    photoState.dx = px - (px - photoState.dx) * (ns / old);
    photoState.dy = py - (py - photoState.dy) * (ns / old);
    photoState.scale = ns;
    updatePhotoTransform();
  }

  // ---------- 导出 ----------
  const btnDownload = $('#btnDownload');
  btnDownload.addEventListener('click', download);
  async function download() {
    if (!photoState.src) { alert('请先上传照片'); return; }
    btnDownload.disabled = true; btnDownload.textContent = '⏳ 生成中…';
    try {
      await document.fonts.ready;
      // 1. 固化照片
      const canvas = document.createElement('canvas');
      canvas.width = PW; canvas.height = PH;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#101012'; ctx.fillRect(0, 0, PW, PH);
      ctx.drawImage(pPhoto, photoState.dx, photoState.dy, photoState.nw * photoState.scale, photoState.nh * photoState.scale);
      const bgUrl = canvas.toDataURL('image/jpeg', 0.93);
      const orig = { src: pPhoto.src, w: pPhoto.style.width, h: pPhoto.style.height, tf: pPhoto.style.transform };
      pPhoto.style.width = PW + 'px'; pPhoto.style.height = PH + 'px';
      pPhoto.style.objectFit = 'cover'; pPhoto.style.transform = 'none';
      pPhoto.src = bgUrl;
      await new Promise((r) => { pPhoto.onload = r; if (pPhoto.complete) r(); });

      // 2. 主KV文字降级（金色渐变 -> 纯金）
      const kv = $('#pKvText');
      let kvChanged = false;
      if (kvMode === 'text') {
        kv.style.background = 'none';
        kv.style.webkitTextFillColor = '#E6C05A';
        kv.style.color = '#E6C05A';
        kvChanged = true;
      }

      // 3. 导出
      const dataUrl = await htmlToImage.toPng(poster, { width: PW, height: PH, pixelRatio: 1, cacheBust: true });

      // 4. 恢复
      if (kvChanged) { kv.style.background = ''; kv.style.webkitTextFillColor = ''; kv.style.color = ''; }
      pPhoto.src = orig.src; pPhoto.style.width = orig.w; pPhoto.style.height = orig.h;
      pPhoto.style.objectFit = 'none'; pPhoto.style.transform = orig.tf;

      // 5. 下载
      const shop = $('#shop').value.trim() || '门店', name = $('#name').value.trim() || '人物';
      const a = document.createElement('a');
      a.download = '躬行先锋_' + shop + '_' + name + '.png';
      a.href = dataUrl;
      document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      console.error(err);
      alert('生成失败：' + (err && err.message ? err.message : '未知错误'));
    } finally {
      btnDownload.disabled = false; btnDownload.textContent = '⬇ 生成并下载海报';
    }
  }

  // ---------- 初始化 ----------
  function init() {
    nodeSelect.value = 'default';
    $('#tributeLine1').value = NODES[0].l1;
    $('#tributeLine2').value = NODES[0].l2;
    $('#tributeEn').value = NODES[0].en;
    renderTribute();
    $('#quote').value = '一座商业空间的温度\n来自每一个认真工作的身影';
    $('#shop').value = '武汉门店'; $('#dept').value = '运营'; $('#name').value = '文思图';
    $('#scene').value = '客流高峰期间 协助店铺快速收银';
    renderText();
    $('#pCities').textContent = CITIES;
    pKvText.textContent = '躬行先锋';
    fitKvFont();
    applyLogo();
    applyQr();
    applyKvMode();
    fitPreview();
  }
  init();
})();
