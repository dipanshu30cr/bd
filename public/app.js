const $ = (s) => document.querySelector(s);
const view = $('#view');
const esc = (s = '') => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const PLACEHOLDER = '/img/placeholder.svg';
let cfg = {};

/* Theme */
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  try { localStorage.setItem('theme', t); } catch (e) {}
  document.querySelectorAll('#themes button').forEach((b) => b.classList.toggle('on', b.dataset.t === t));
}
let saved = 'aurora'; try { saved = localStorage.getItem('theme') || 'aurora'; } catch (e) {}
setTheme(saved);
$('#themes').onclick = (e) => { const b = e.target.closest('button'); if (b) setTheme(b.dataset.t); };

/* Particle engine: confetti, bursts, fireworks, poppers, sparkle trail */
const cv = $('#confetti'), cx = cv.getContext('2d');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
let parts = [], running = false;
const fit = () => { cv.width = innerWidth; cv.height = innerHeight; };
addEventListener('resize', fit); fit();
const themeCols = () => { const cs = getComputedStyle(document.documentElement); return ['--a', '--b', '--c'].map((v) => cs.getPropertyValue(v).trim()); };
const pick = (a) => a[Math.floor(Math.random() * a.length)];
function loop() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter((p) => p.life > 0 && p.y < cv.height + 30);
  for (const p of parts) {
    if (p.drag) { p.vx *= p.drag; p.vy *= p.drag; }
    p.vy += p.g; p.x += p.vx + (p.sway ? Math.sin(p.y / 30) : 0); p.y += p.vy; p.r += p.vr; p.life--;
    cx.save(); cx.globalAlpha = Math.min(1, p.life / 25); cx.translate(p.x, p.y); cx.rotate(p.r); cx.fillStyle = p.c;
    if (p.round) { cx.beginPath(); cx.arc(0, 0, p.w / 2, 0, 6.283); cx.fill(); } else cx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    cx.restore();
  }
  if (parts.length) requestAnimationFrame(loop); else { running = false; cx.clearRect(0, 0, cv.width, cv.height); }
}
const add = (list) => { parts.push(...list); if (!running) { running = true; requestAnimationFrame(loop); } };

function confetti() {
  const cols = themeCols();
  add(Array.from({ length: 140 }, () => ({
    x: Math.random() * cv.width, y: -20 - Math.random() * cv.height * 0.6, w: 6 + Math.random() * 6, h: 10 + Math.random() * 8,
    vx: -1 + Math.random() * 2, vy: 2 + Math.random() * 3.5, g: 0, r: Math.random() * 6, vr: -0.2 + Math.random() * 0.4,
    c: pick(cols), life: 9999, sway: true
  })));
}
function burst(x, y, cols = themeCols(), n = 34) {
  add(Array.from({ length: n }, () => {
    const a = Math.random() * 6.283, s = 2 + Math.random() * 6;
    return { x, y, w: 5 + Math.random() * 5, h: 8 + Math.random() * 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 2, g: 0.22, drag: 0.985,
      r: Math.random() * 6, vr: -0.3 + Math.random() * 0.6, c: pick(cols), life: 70 + Math.random() * 30 };
  }));
}
function fireworks(x, y) {
  if (calm) return;
  const cols = themeCols().concat('#ffffff'), base = pick(cols);
  add(Array.from({ length: 56 }, (_, i) => {
    const a = (i / 56) * 6.283, s = 3 + Math.random() * 2.5;
    return { x, y, w: 4, h: 4, round: true, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.05, drag: 0.965, r: 0, vr: 0,
      c: Math.random() < 0.7 ? base : pick(cols), life: 60 + Math.random() * 20 };
  }));
}
function popper() {
  const cols = themeCols();
  [[0, 1], [innerWidth, -1]].forEach(([x, dir]) => add(Array.from({ length: 70 }, () => {
    const a = -Math.PI / 2 + dir * (0.15 + Math.random() * 0.5), s = 9 + Math.random() * 10;
    return { x, y: innerHeight, w: 6 + Math.random() * 5, h: 10 + Math.random() * 6, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0.28, drag: 0.975,
      r: Math.random() * 6, vr: -0.3 + Math.random() * 0.6, c: pick(cols), life: 140 + Math.random() * 40 };
  })));
}

/* Sparkle trail behind the mouse, fireworks on a click anywhere */
let lastT = 0;
addEventListener('pointermove', (e) => {
  if (calm || e.pointerType !== 'mouse') return;
  const t = performance.now(); if (t - lastT < 45) return; lastT = t;
  add([{ x: e.clientX, y: e.clientY, w: 5, h: 5, round: true, vx: (Math.random() - 0.5) * 0.8, vy: 0.4 + Math.random() * 0.6, g: 0.02, r: 0, vr: 0, c: pick(themeCols()), life: 28 }]);
});
addEventListener('click', (e) => { if (!e.target.closest('button,a,input,canvas,.balloon,.rcard,.jar')) fireworks(e.clientX, e.clientY); });

/* Happy Birthday melody (public domain), played with the browser's synth */
const NOTES = [[261.63, .75], [261.63, .25], [293.66, 1], [261.63, 1], [349.23, 1], [329.63, 2],
  [261.63, .75], [261.63, .25], [293.66, 1], [261.63, 1], [392, 1], [349.23, 2],
  [261.63, .75], [261.63, .25], [523.25, 1], [440, 1], [349.23, 1], [329.63, 1], [293.66, 2],
  [466.16, .75], [466.16, .25], [440, 1], [349.23, 1], [392, 1], [349.23, 2]];
let audio = null, playing = false;
function song(btn) {
  if (playing) return;
  playing = true;
  const ac = audio = audio || new (window.AudioContext || window.webkitAudioContext)();
  if (ac.resume) ac.resume();
  let t = ac.currentTime + 0.05;
  NOTES.forEach(([f, b]) => {
    const o = ac.createOscillator(), g = ac.createGain(), d = b * 0.5;
    o.type = 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.25, t + 0.03); g.gain.exponentialRampToValueAtTime(0.001, t + d * 0.95);
    o.connect(g); g.connect(ac.destination); o.start(t); o.stop(t + d);
    t += d;
  });
  btn.textContent = 'Playing...';
  setTimeout(() => { playing = false; btn.textContent = 'Play the song'; confetti(); }, (t - ac.currentTime) * 1000);
}

/* Images hide themselves if the file is missing */
const img = (src, alt = '', extra = '') => `<img src="${esc(src)}" alt="${esc(alt)}" ${extra} onerror="this.onerror=null;this.style.display='none'">`;

/* Drawn-in-code teddy, cake and balloons */
const teddy = () => `<svg class="teddy" viewBox="0 0 120 140"><g class="tb">
<ellipse cx="38" cy="132" rx="15" ry="8" fill="#b9835a"/><ellipse cx="82" cy="132" rx="15" ry="8" fill="#b9835a"/>
<ellipse cx="60" cy="100" rx="34" ry="34" fill="#c4915f"/><ellipse cx="60" cy="106" rx="20" ry="22" fill="#e6c9a0"/>
<ellipse cx="27" cy="95" rx="9" ry="16" fill="#b9835a" transform="rotate(20 27 95)"/>
<g class="wave"><ellipse cx="93" cy="95" rx="9" ry="16" fill="#b9835a" transform="rotate(-20 93 95)"/></g>
<circle cx="30" cy="26" r="15" fill="#b9835a"/><circle cx="30" cy="26" r="8" fill="#e6c9a0"/>
<circle cx="90" cy="26" r="15" fill="#b9835a"/><circle cx="90" cy="26" r="8" fill="#e6c9a0"/>
<circle cx="60" cy="52" r="34" fill="#c4915f"/><ellipse cx="60" cy="64" rx="15" ry="11" fill="#e6c9a0"/>
<ellipse cx="60" cy="59" rx="5" ry="3.5" fill="#4a2f1e"/>
<path d="M60 62v4M54 68q6 4 12 0" stroke="#4a2f1e" stroke-width="2" fill="none" stroke-linecap="round"/>
<g class="eyes"><circle cx="46" cy="47" r="4" fill="#4a2f1e"/><circle cx="74" cy="47" r="4" fill="#4a2f1e"/></g>
<circle cx="37" cy="60" r="5" fill="#ff8fa3" opacity=".5"/><circle cx="83" cy="60" r="5" fill="#ff8fa3" opacity=".5"/>
<path d="M48 84l12 6-12 6zM72 84l-12 6 12 6z" fill="var(--b)"/><circle cx="60" cy="90" r="4" fill="var(--a)"/>
</g></svg>`;

const flame = (x, d) => `<g transform="translate(${x} 36)"><g class="flame" style="--d:${d}s"><path d="M0 0C-7-9-4-17 0-26 4-17 7-9 0 0Z" fill="#ffb02e"/><path d="M0 0C-3-5-2-9 0-13 2-9 3-5 0 0Z" fill="#fff3b0"/></g></g>`;
const candle = (x, c) => `<rect class="candle" x="${x}" y="36" width="8" height="32" rx="3" fill="${c}"/>`;
const cake = () => `<svg class="cake" viewBox="0 0 300 290">
<ellipse cx="150" cy="268" rx="132" ry="14" fill="rgba(0,0,0,.25)"/><ellipse cx="150" cy="252" rx="130" ry="14" fill="#f4f4f8"/>
<g class="tier t1"><rect x="40" y="180" width="220" height="70" rx="10" fill="var(--b)"/><rect x="36" y="174" width="228" height="18" rx="9" fill="#fff"/>
<rect x="62" y="186" width="14" height="22" rx="7" fill="#fff"/><rect x="118" y="186" width="14" height="18" rx="7" fill="#fff"/><rect x="176" y="186" width="14" height="24" rx="7" fill="#fff"/><rect x="226" y="186" width="14" height="18" rx="7" fill="#fff"/>
<circle cx="80" cy="226" r="4" fill="var(--c)"/><circle cx="150" cy="232" r="4" fill="var(--a)"/><circle cx="214" cy="226" r="4" fill="var(--c)"/></g>
<g class="tier t2"><rect x="70" y="122" width="160" height="58" rx="10" fill="var(--a)"/><rect x="66" y="116" width="168" height="16" rx="8" fill="#fff"/>
<rect x="88" y="126" width="12" height="18" rx="6" fill="#fff"/><rect x="148" y="126" width="12" height="22" rx="6" fill="#fff"/><rect x="204" y="126" width="12" height="16" rx="6" fill="#fff"/></g>
<g class="tier t3"><rect x="100" y="70" width="100" height="52" rx="10" fill="var(--c)"/><rect x="96" y="64" width="108" height="16" rx="8" fill="#fff"/>
<rect x="112" y="74" width="12" height="18" rx="6" fill="#fff"/><rect x="176" y="74" width="12" height="16" rx="6" fill="#fff"/></g>
<g class="candles">${candle(130, '#ff8fa3')}${candle(146, '#8bd3ff')}${candle(162, '#ffe08a')}${flame(134, 0)}${flame(150, .15)}${flame(166, .3)}</g>
<g class="smokes">${[134, 150, 166].map((x, i) => `<circle class="smoke" cx="${x}" cy="34" r="5" style="--d:${i * .2}s"/>`).join('')}</g></svg>`;

const balloon = (c) => `<i class="balloon" style="--bc:${c}"></i>`;

const gift = () => `<span class="gbox"><i class="gv"></i></span><span class="glid"><i class="gv"></i><i class="bow l"></i><i class="bow r"></i></span>`;

const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/* Typewriter: the full text is already laid out (invisible), so nothing jumps */
let stopType = () => {};
function typeWish(p, text) {
  const t = p.querySelector('.tw-t'), r = p.querySelector('.tw-r');
  let i = 0, timer = null;
  const done = () => { clearInterval(timer); t.textContent = text; r.textContent = ''; p.classList.add('typed'); };
  stopType = () => clearInterval(timer);
  if (calm) return done();
  const start = setTimeout(() => {
    timer = setInterval(() => { i++; t.textContent = text.slice(0, i); r.textContent = text.slice(i); if (i >= text.length) done(); }, 28);
  }, 1700);
  stopType = () => { clearTimeout(start); clearInterval(timer); };
  p.onclick = () => { clearTimeout(start); done(); };
}

function hearts(host) {
  for (let i = 0; i < 14; i++) {
    const h = document.createElement('span');
    h.className = 'heart'; h.textContent = pick(['\u{1F496}', '\u2728', '\u{1F388}', '\u{1F389}', '\u{1F49D}']);
    h.style.cssText = `left:${40 + Math.random() * 20}%;--dx:${-90 + Math.random() * 180}px;--d:${Math.random() * 0.8}s;--sz:${16 + Math.random() * 16}px`;
    host.appendChild(h); setTimeout(() => h.remove(), 3300);
  }
}

function dashboard() {
  let n = 0;
  const letters = (cfg.title || '').split(' ').map((w) => `<span class="word">${[...w].map((ch) => `<span class="ch" style="--i:${n++}">${esc(ch)}</span>`).join('')}</span>`).join('<span class="sp"></span>');
  view.innerHTML = `<section class="view hero">
    <div>
      <h1 aria-label="${esc(cfg.title)}">${letters}</h1>
      <h2>${esc(cfg.name)}</h2>
      <p class="wish" aria-label="${esc(cfg.wish)}"><span class="tw-t" aria-hidden="true"></span><span class="tw-r" aria-hidden="true">${esc(cfg.wish)}</span></p>
      <p class="from">${esc(cfg.from)}</p>
      <div class="btns"><button class="pop" id="again">Celebrate again</button><button class="pop" id="popper">Party popper</button><button class="pop" id="song">Play the song</button></div>
    </div>
    <div class="frame"><img src="${esc(cfg.photo)}" alt="${esc(cfg.name)}" onerror="this.onerror=null;this.src='${PLACEHOLDER}'"></div>
  </section>
  <section class="stage" id="stage">
    <div class="tdy l">${balloon('var(--a)')}${balloon('var(--c)')}${teddy()}</div>
    <div class="cakewrap">${cake()}<span class="wishmsg">Make a wish &#10024;</span><button class="pop" id="blow">Blow the candles</button></div>
    <div class="tdy r">${balloon('var(--b)')}${teddy()}</div>
  </section>
  <section class="giftsec">
    <button class="gift" id="gift" aria-label="Open the gift">${gift()}</button>
    <p class="hint" id="hint">Tap the gift. Pop a balloon. Tap anywhere for fireworks.</p>
    <p class="surprise" id="surprise" hidden>${esc(cfg.surprise || '')}</p>
  </section>
  <section class="more">
    <p class="hint">More surprises for you</p>
    <div class="btns"><a class="pop" href="#reasons">&#128140; Reasons</a><a class="pop" href="#scratch">&#127903;&#65039; Scratch card</a><a class="pop" href="#wish">&#127982; Make a wish</a></div>
  </section>`;
  $('#again').onclick = confetti;
  $('#popper').onclick = popper;
  $('#song').onclick = (e) => song(e.currentTarget);
  $('#gift').onclick = () => {
    const g = $('#gift'); if (g.classList.contains('open')) return;
    g.classList.add('open'); $('#hint').hidden = true; $('#surprise').hidden = false;
    const r = g.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height * 0.4, themeCols(), 60); confetti(); hearts(g.parentElement);
    setTimeout(() => $('#surprise').scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' }), 500);
  };
  typeWish($('.wish'), cfg.wish || '');
  document.querySelectorAll('.tdy .balloon').forEach((b) => (b.onclick = () => {
    if (b.classList.contains('popped')) return;
    const r = b.getBoundingClientRect(), c = getComputedStyle(b).getPropertyValue('--bc').trim();
    burst(r.left + r.width / 2, r.top + r.height / 2, c && !c.startsWith('var') ? [c] : themeCols(), 26);
    b.classList.add('popped'); setTimeout(() => b.classList.remove('popped'), 4000);
  }));
  const stage = $('#stage');
  new IntersectionObserver((en, ob) => { if (en[0].isIntersecting) { stage.classList.add('go'); ob.disconnect(); } }, { threshold: 0.35 }).observe(stage);
  $('#blow').onclick = () => {
    const out = stage.classList.toggle('out');
    $('#blow').textContent = out ? 'Light them again' : 'Blow the candles';
    if (out) confetti();
  };
}

/* Floating balloons in the background */
function buildDeco() {
  const cols = ['var(--a)', 'var(--b)', 'var(--c)'];
  $('#deco').innerHTML = Array.from({ length: 9 }, (_, i) =>
    `<i class="balloon rise" style="--bc:${cols[i % 3]};left:${5 + i * 11}%;--dur:${16 + (i * 7) % 11}s;--del:${-i * 3.1}s;--s:${0.7 + (i % 4) * 0.18}"></i>`).join('') +
    Array.from({ length: 26 }, () =>
      `<b class="star" style="left:${Math.random() * 98}%;top:${Math.random() * 96}%;--s:${8 + Math.random() * 10}px;--dur:${2.5 + Math.random() * 3}s;--del:${-Math.random() * 5}s"></b>`).join('');
  buildBunting();
}
function buildBunting() {
  const cols = ['var(--a)', 'var(--b)', 'var(--c)'], n = Math.max(6, Math.floor(innerWidth / 48));
  $('#bunting').innerHTML = Array.from({ length: n }, (_, i) => `<i style="--bc:${cols[i % 3]};--i:${i}"></i>`).join('');
}
addEventListener('resize', () => $('#bunting') && buildBunting());

/* ---------- Reasons ---------- */
function reasonsPage() {
  const list = cfg.reasons || [];
  if (!list.length) { view.innerHTML = '<section class="view page"><p class="sub">Add some reasons in data/config.json</p></section>'; return; }
  const order = shuffle(list.map((_, i) => i)); let pos = 0, swiped = false, x0 = null;
  view.innerHTML = `<section class="view page">
    <h2 class="ptitle">Why you're awesome</h2>
    <p class="sub">Tap the card, or swipe it, for another reason.</p>
    <div class="rcard" id="rc" role="button" tabindex="0" aria-live="polite"><span class="re" id="re"></span><strong id="rt"></strong><span class="rm" id="rm"></span></div>
    <div class="rnav"><button class="pop" id="rp" aria-label="Previous reason">&#8249;</button><span id="rn"></span><button class="pop" id="rx">Next reason &#8250;</button></div>
  </section>`;
  const rc = $('#rc');
  const show = (dir = 1) => {
    const r = list[order[pos]];
    $('#re').textContent = r.e; $('#rt').textContent = r.t; $('#rm').textContent = r.m; $('#rn').textContent = `${pos + 1} / ${list.length}`;
    rc.style.setProperty('--sx', `${dir * 40}px`); rc.style.setProperty('--sr', `${dir * 4}deg`);
    rc.classList.remove('swap'); void rc.offsetWidth; rc.classList.add('swap');
  };
  const go = (d) => {
    pos += d;
    if (pos >= list.length) { pos = 0; confetti(); } else if (pos < 0) pos = list.length - 1;
    show(d);
  };
  rc.onclick = () => { if (swiped) { swiped = false; return; } go(1); };
  rc.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') go(-1); };
  rc.onpointerdown = (e) => { x0 = e.clientX; };
  rc.onpointerup = (e) => { if (x0 !== null && Math.abs(e.clientX - x0) > 40) { swiped = true; go(e.clientX < x0 ? 1 : -1); } x0 = null; };
  rc.onpointercancel = () => { x0 = null; };
  $('#rx').onclick = () => go(1); $('#rp').onclick = () => go(-1);
  show(1);
}

/* ---------- Scratch card ---------- */
function scratchPage() {
  const sc = cfg.scratch || {};
  view.innerHTML = `<section class="view page">
    <h2 class="ptitle">Scratch &amp; win</h2>
    <p class="sub">Scratch the card with your finger to reveal your gift.</p>
    <div class="sc" id="sc"><div class="prize"><span class="pe">${esc(sc.emoji || '\u{1F381}')}</span><strong>${esc(sc.title || '')}</strong><span>${esc(sc.text || '')}</span></div><canvas id="scv" aria-label="Scratch card"></canvas></div>
    <p class="hint" id="sh">Keep scratching...</p>
    <button class="pop" id="sr" hidden>Cover it again</button>
  </section>`;
  const box = $('#sc'), c = $('#scv'), g = c.getContext('2d');
  let drawing = false, last = null, done = false, moves = 0;
  function paint() {
    const dpr = Math.min(devicePixelRatio || 1, 2.5), W = box.clientWidth, H = box.clientHeight;
    c.width = W * dpr; c.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); g.globalCompositeOperation = 'source-over';
    const gr = g.createLinearGradient(0, 0, W, H);
    gr.addColorStop(0, '#b8bec9'); gr.addColorStop(.5, '#eceff4'); gr.addColorStop(1, '#a3aab6');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.45)'; g.lineWidth = 6;
    for (let x = -H; x < W + H; x += 26) { g.beginPath(); g.moveTo(x, H); g.lineTo(x + H, 0); g.stroke(); }
    g.fillStyle = '#5b6472'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.font = '800 24px "Bricolage Grotesque", system-ui, sans-serif'; g.fillText('SCRATCH HERE', W / 2, H / 2 - 8);
    g.font = '18px system-ui, sans-serif'; g.fillText('\u2726  \u2726  \u2726', W / 2, H / 2 + 24);
  }
  const pt = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  const line = (a, b) => { g.globalCompositeOperation = 'destination-out'; g.strokeStyle = '#000'; g.lineWidth = 36; g.lineCap = g.lineJoin = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
  function check() {
    const d = g.getImageData(0, 0, c.width, c.height).data; let clear = 0, total = 0;
    for (let i = 3; i < d.length; i += 160) { total++; if (d[i] < 20) clear++; }
    if (clear / total > 0.5) reveal();
  }
  function reveal() {
    if (done) return; done = true; c.classList.add('gone'); $('#sh').textContent = 'You found it! \u{1F389}'; $('#sr').hidden = false;
    const r = box.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2, themeCols(), 70); confetti();
  }
  c.onpointerdown = (e) => { if (done) return; drawing = true; c.setPointerCapture(e.pointerId); last = pt(e); line(last, last); };
  c.onpointermove = (e) => { if (!drawing || done) return; const p = pt(e); line(last, p); last = p; if (++moves % 10 === 0) check(); };
  c.onpointerup = c.onpointercancel = () => { if (drawing) { drawing = false; if (!done) check(); } };
  $('#sr').onclick = () => { done = false; c.classList.remove('gone'); paint(); $('#sh').textContent = 'Keep scratching...'; $('#sr').hidden = true; };
  paint();
}

/* ---------- Wish jar ---------- */
function wishPage() {
  let wishes = []; try { wishes = JSON.parse(localStorage.getItem('wishes') || '[]'); } catch (e) {}
  const save = () => { try { localStorage.setItem('wishes', JSON.stringify(wishes.slice(-60))); } catch (e) {} };
  view.innerHTML = `<section class="view page">
    <h2 class="ptitle">Make a wish</h2>
    <p class="sub">Type your wish and send it up in a lantern. A star lands in your jar.</p>
    <div class="wrow"><input id="wi" maxlength="80" placeholder="I wish..." enterkeyhint="send" autocomplete="off" aria-label="Your wish"><button class="pop" id="wg">Send</button></div>
    <div class="sky" id="sky"></div>
    <div class="jarwrap"><div class="jarlid"></div><div class="jar" id="jar"></div></div>
    <p class="hint" id="wc"></p>
    <ul class="wl" id="wl"></ul>
    <button class="ghost" id="wx" hidden>Empty the jar</button>
  </section>`;
  const jar = $('#jar'), sky = $('#sky'), wi = $('#wi');
  const orb = (i, drop) => {
    const o = document.createElement('i');
    o.className = 'orb' + (drop ? ' drop' : '');
    o.style.cssText = `left:${6 + (i % 7) * 13 + (i * 37) % 6}%;bottom:${6 + Math.floor(i / 7) * 15}px;--od:${(i % 5) * 0.4}s`;
    jar.appendChild(o);
  };
  const render = () => {
    $('#wc').textContent = wishes.length ? `${wishes.length} wish${wishes.length > 1 ? 'es' : ''} in the jar. They stay on this phone only.` : 'The jar is empty. Make the first wish!';
    $('#wl').innerHTML = wishes.slice(-5).reverse().map((w) => `<li>${esc(w)}</li>`).join('');
    $('#wx').hidden = !wishes.length;
  };
  wishes.forEach((_, i) => orb(i, false)); render();
  const send = () => {
    const v = wi.value.trim();
    if (!v) { wi.classList.remove('shake'); void wi.offsetWidth; wi.classList.add('shake'); wi.focus(); return; }
    wi.value = ''; wi.blur();
    const l = document.createElement('div'); l.className = 'lantern';
    l.style.setProperty('--dx', `${-50 + Math.random() * 100}px`); l.innerHTML = `<i></i><span>${esc(v)}</span>`;
    sky.appendChild(l); setTimeout(() => l.remove(), 5800);
    const r = sky.getBoundingClientRect(); burst(r.left + r.width / 2, r.bottom - 40, themeCols(), 18);
    setTimeout(() => { wishes.push(v); save(); orb(wishes.length - 1, true); render(); }, 1400);
  };
  $('#wg').onclick = send; wi.onkeydown = (e) => { if (e.key === 'Enter') send(); };
  $('#wx').onclick = () => { wishes = []; save(); jar.innerHTML = ''; render(); };
}

/* ---------- Router (bottom tabs) ---------- */
const pages = { home: dashboard, reasons: reasonsPage, scratch: scratchPage, wish: wishPage };
function route() {
  const n = (location.hash || '#home').slice(1), k = pages[n] ? n : 'home';
  stopType();
  document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('on', a.dataset.v === k));
  pages[k]();
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (k === 'home') setTimeout(confetti, 500);
}
addEventListener('hashchange', route);

(async () => {
  cfg = await (await fetch('/api/config')).json();
  document.title = `${cfg.title}, ${cfg.name}`;
  buildDeco();
  route();
})();
