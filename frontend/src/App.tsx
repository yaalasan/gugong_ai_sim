import { useState, useEffect, useRef, useCallback } from "react";

// ─── Fonts ────────────────────────────────────────────────────────────────────
const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;600;700&family=Ma+Shan+Zheng&family=Share+Tech+Mono&display=swap";
document.head.appendChild(fontLink);

// ─── Styles ───────────────────────────────────────────────────────────────────
const style = document.createElement("style");
style.textContent = `
:root {
  --crimson:    #8B0000;
  --crimson-mid:#B22222;
  --crimson-lt: #CC3333;
  --gold:       #C8960C;
  --gold-lt:    #E8B84B;
  --gold-pale:  #F5D98B;
  --jade:       #2D6A4F;
  --ink:        #0D0A06;
  --ink-mid:    #1A1208;
  --ink-lt:     #2A1E10;
  --paper:      #F2E8D0;
  --paper-dim:  #BFB090;
  --smoke:      rgba(200,150,12,0.08);
}
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
html,body{height:100%;overflow:hidden;background:var(--ink);}
/* ── Ming Mentor Chat ── */
.chat-wrap{
  display:flex;
  flex-direction:column;
  gap:10px;
  min-height:420px;
}
.chat-scroll{
  flex:1;
  min-height:260px;
  max-height:420px;
  overflow-y:auto;
  padding:10px;
  background:rgba(0,0,0,0.28);
  border:1px solid rgba(200,150,12,0.12);
  border-radius:4px;
  display:flex;
  flex-direction:column;
  gap:10px;
}
.chat-scroll::-webkit-scrollbar{width:3px;}
.chat-scroll::-webkit-scrollbar-thumb{background:rgba(200,150,12,0.3);border-radius:2px;}

.chat-msg{
  padding:10px 12px;
  border-radius:4px;
  line-height:1.55;
  white-space:pre-wrap;
  font-size:11px;
}
.chat-msg.user{
  background:rgba(139,0,0,0.22);
  border:1px solid rgba(204,51,51,0.25);
  color:var(--paper);
}
.chat-msg.assistant{
  background:rgba(200,150,12,0.08);
  border:1px solid rgba(200,150,12,0.18);
  color:var(--paper);
}
.chat-role{
  font-size:9px;
  letter-spacing:0.12em;
  color:var(--gold);
  opacity:0.7;
  margin-bottom:5px;
}
.chat-input{
  width:100%;
  min-height:84px;
  resize:vertical;
  background:rgba(10,5,0,0.8);
  border:1px solid rgba(200,150,12,0.25);
  border-radius:4px;
  padding:10px 12px;
  color:var(--paper);
  font-family:'Share Tech Mono',monospace;
  font-size:11px;
  outline:none;
}
.chat-input:focus{
  border-color:rgba(200,150,12,0.65);
}
.chat-actions{
  display:flex;
  gap:8px;
}
.chat-hint{
  font-size:8px;
  color:rgba(200,150,12,0.35);
  line-height:1.5;
}
/* ── Root layout ── */
.root {
  font-family:'Share Tech Mono',monospace;
  background: var(--ink);
  color: var(--paper);
  height:100vh;
  display:grid;
  grid-template-rows: 64px 1fr;
  grid-template-columns: 360px 1fr 320px;
  overflow:hidden;
  position:relative;
}

/* ── Background texture ── */
.root::before {
  content:'';
  position:fixed;inset:0;
  background:
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(139,0,0,0.08) 0%, transparent 70%),
    repeating-linear-gradient(0deg,   transparent, transparent 59px, rgba(200,150,12,0.04) 60px),
    repeating-linear-gradient(90deg,  transparent, transparent 59px, rgba(200,150,12,0.04) 60px);
  pointer-events:none;
  z-index:0;
}

/* ── Header ── */
.header {
  grid-column: 1 / -1;
  display:flex;align-items:center;gap:16px;
  padding:0 28px;
  background: linear-gradient(180deg, #1A0A04 0%, #120802 100%);
  border-bottom: 2px solid var(--gold);
  box-shadow: 0 4px 32px rgba(200,150,12,0.2);
  position:relative;z-index:10;
}
.header::before, .header::after {
  content:'';
  position:absolute;bottom:-6px;
  width:60px;height:4px;
  background:var(--crimson);
}
.header::before{left:28px;}
.header::after{right:28px;}

.header-emblem {
  width:40px;height:40px;
  background: radial-gradient(circle, var(--gold-lt), var(--gold));
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:22px;
  box-shadow:0 0 20px rgba(200,150,12,0.5), inset 0 1px 0 rgba(255,255,255,0.3);
  flex-shrink:0;
  animation: emblem-glow 4s ease-in-out infinite;
}
@keyframes emblem-glow {
  0%,100%{box-shadow:0 0 20px rgba(200,150,12,0.5);}
  50%{box-shadow:0 0 36px rgba(200,150,12,0.9), 0 0 60px rgba(200,150,12,0.3);}
}

.header-titles { display:flex;flex-direction:column;gap:2px; }
.header-zh {
  font-family:'Ma Shan Zheng',serif;
  font-size:20px;color:var(--gold-lt);
  letter-spacing:0.25em;
  text-shadow:0 0 20px rgba(200,150,12,0.7);
}
.header-en {
  font-size:9px;letter-spacing:0.18em;
  color:var(--gold);opacity:0.7;
  text-transform:uppercase;
}

.header-divider {
  width:1px;height:36px;
  background:linear-gradient(180deg,transparent,var(--gold),transparent);
  margin:0 8px;opacity:0.4;
}

.header-dynasty {
  font-family:'Noto Serif SC',serif;
  font-size:11px;color:var(--paper-dim);
  letter-spacing:0.1em;
}

.header-right { margin-left:auto;display:flex;align-items:center;gap:20px; }
.header-status {
  display:flex;align-items:center;gap:8px;
  font-size:10px;letter-spacing:0.1em;
  color:var(--gold);opacity:0.7;
}
.status-orb {
  width:8px;height:8px;border-radius:50%;
  background:var(--gold);
  box-shadow:0 0 8px var(--gold);
  animation:orb-blink 1.6s ease-in-out infinite;
}
.status-orb.active{background:#ff6644;box-shadow:0 0 12px #ff6644;}
@keyframes orb-blink{0%,100%{opacity:1;}50%{opacity:0.3;}}

/* ── Panels ── */
.panel {
  padding:16px 14px;
  background: linear-gradient(180deg, rgba(26,12,4,0.95), rgba(18,8,2,0.98));
  display:flex;flex-direction:column;gap:14px;
  overflow-y:auto;
  position:relative;z-index:1;
}
.panel-left  { border-right:1px solid rgba(200,150,12,0.2); }
.panel-right { border-left: 1px solid rgba(200,150,12,0.2); }

.panel::-webkit-scrollbar{width:3px;}
.panel::-webkit-scrollbar-thumb{background:rgba(200,150,12,0.3);border-radius:2px;}

/* Section card */
.section {
  background: rgba(200,150,12,0.04);
  border:1px solid rgba(200,150,12,0.15);
  border-radius:4px;
  padding:12px 14px;
  position:relative;
}
.section::before {
  content:'';
  position:absolute;top:0;left:12px;right:12px;height:1px;
  background:linear-gradient(90deg,transparent,var(--gold),transparent);
  opacity:0.4;
}
.section-title {
  font-family:'Noto Serif SC',serif;
  font-size:10px;font-weight:600;
  letter-spacing:0.2em;
  color:var(--gold-lt);
  margin-bottom:12px;
  display:flex;align-items:center;gap:8px;
}
.section-title::before {
  content:'◆';font-size:7px;color:var(--crimson-lt);
}

/* Sliders */
.slider-row{margin-bottom:12px;}
.slider-label{
  display:flex;justify-content:space-between;
  font-size:10px;color:var(--paper-dim);
  margin-bottom:5px;letter-spacing:0.04em;
}
.slider-val{
  font-family:'Noto Serif SC',serif;
  font-size:12px;color:var(--gold-lt);font-weight:600;
}
input[type=range]{
  -webkit-appearance:none;width:100%;height:2px;
  background:rgba(200,150,12,0.2);border-radius:1px;outline:none;cursor:pointer;
}
input[type=range]::-webkit-slider-thumb{
  -webkit-appearance:none;
  width:12px;height:12px;border-radius:50%;
  background:var(--gold-lt);
  box-shadow:0 0 8px rgba(200,150,12,0.8);
  transition:box-shadow 0.2s;
}
input[type=range]:hover::-webkit-slider-thumb{
  box-shadow:0 0 16px rgba(200,150,12,1), 0 0 32px rgba(200,150,12,0.4);
}

/* Select */
.sim-select{
  width:100%;
  background:rgba(10,5,0,0.8);
  border:1px solid rgba(200,150,12,0.3);
  border-radius:3px;
  padding:7px 10px;
  color:var(--gold-lt);
  font-family:'Share Tech Mono',monospace;
  font-size:11px;outline:none;cursor:pointer;
  letter-spacing:0.05em;
}
.sim-select:focus{border-color:rgba(200,150,12,0.7);}

/* Buttons */
.btn-row{display:flex;gap:8px;}
.btn{
  flex:1;padding:10px 0;
  border-radius:3px;
  font-family:'Noto Serif SC',serif;
  font-size:11px;font-weight:600;
  letter-spacing:0.15em;
  cursor:pointer;border:none;
  transition:all 0.2s;
  position:relative;overflow:hidden;
}
.btn-start{
  background:linear-gradient(135deg, var(--crimson), var(--crimson-mid));
  border:1px solid var(--crimson-lt);
  color:var(--gold-pale);
  text-shadow:0 1px 4px rgba(0,0,0,0.5);
  box-shadow:0 2px 12px rgba(139,0,0,0.4);
}
.btn-start:hover{
  background:linear-gradient(135deg,var(--crimson-mid),var(--crimson-lt));
  box-shadow:0 4px 20px rgba(139,0,0,0.7);
}
.btn-start.active{
  background:linear-gradient(135deg,#4a2000,#7a3800);
  border-color:var(--gold);color:var(--gold-lt);
  box-shadow:0 2px 16px rgba(200,150,12,0.4);
}
.btn-reset{
  background:rgba(200,150,12,0.08);
  border:1px solid rgba(200,150,12,0.25);
  color:var(--gold);
}
.btn-reset:hover{
  background:rgba(200,150,12,0.15);
  box-shadow:0 2px 12px rgba(200,150,12,0.2);
}

/* Metrics */
.metrics-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;}
.metric-card{
  background:rgba(0,0,0,0.4);
  border:1px solid rgba(200,150,12,0.1);
  border-radius:3px;padding:8px 10px;
}
.metric-label{font-size:8px;color:rgba(200,150,12,0.5);letter-spacing:0.1em;margin-bottom:3px;}
.metric-val{
  font-family:'Noto Serif SC',serif;
  font-size:16px;font-weight:700;color:var(--gold-lt);
}
.metric-val.danger{color:#ff5533;}
.metric-val.warn{color:#ffaa22;}
.metric-unit{font-size:8px;color:rgba(200,150,12,0.5);margin-left:2px;}

/* Risk bar */
.risk-wrap{margin-top:10px;}
.risk-labels{display:flex;justify-content:space-between;font-size:9px;color:rgba(200,150,12,0.5);margin-bottom:4px;}
.risk-bg{height:5px;background:rgba(200,150,12,0.1);border-radius:2px;overflow:hidden;}
.risk-fill{height:100%;border-radius:2px;transition:width 0.3s,background 0.3s;}

/* ── Center canvas ── */
.canvas-wrap {
  position:relative;overflow:hidden;
  background:
    radial-gradient(ellipse 60% 40% at 50% 100%, rgba(139,0,0,0.12) 0%, transparent 70%),
    radial-gradient(ellipse 100% 60% at 50% 50%, rgba(200,150,12,0.03) 0%, transparent 80%),
    var(--ink);
  display:flex;flex-direction:column;
  align-items:center;justify-content:flex-end;
  padding-bottom:0;
  z-index:1;
}

/* Decorative corners */
.corner{position:absolute;width:24px;height:24px;border-color:rgba(200,150,12,0.35);border-style:solid;}
.corner.tl{top:10px;left:10px;border-width:2px 0 0 2px;}
.corner.tr{top:10px;right:10px;border-width:2px 2px 0 0;}
.corner.bl{bottom:0;left:10px;border-width:0 0 2px 2px;}
.corner.br{bottom:0;right:10px;border-width:0 2px 2px 0;}

.canvas-badge {
  position:absolute;top:14px;left:50%;transform:translateX(-50%);
  font-family:'Noto Serif SC',serif;
  font-size:9px;letter-spacing:0.2em;
  color:rgba(200,150,12,0.4);
  border:1px solid rgba(200,150,12,0.15);
  padding:3px 14px;border-radius:2px;
  background:rgba(0,0,0,0.3);
  white-space:nowrap;
}

/* Structures */
.stage {
  width:100%;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:80px;
  padding:0 40px;
  flex:1;
}
.struct-col{display:flex;flex-direction:column;align-items:center;gap:6px;}
.struct-label{
  font-family:'Ma Shan Zheng',serif;
  font-size:13px;color:var(--gold);
  letter-spacing:0.15em;
  text-shadow:0 0 12px rgba(200,150,12,0.5);
  opacity:0.7;
}
.struct-sublabel{font-size:8px;color:rgba(200,150,12,0.35);letter-spacing:0.12em;margin-top:-4px;}

/* Ground */
.ground-platform {
  width:100%;height:14px;
  background:linear-gradient(90deg,
    transparent 0%, rgba(139,0,0,0.4) 20%,
    rgba(200,150,12,0.5) 50%,
    rgba(139,0,0,0.4) 80%, transparent 100%);
  border-top:2px solid rgba(200,150,12,0.6);
  box-shadow:0 -6px 30px rgba(200,150,12,0.15);
}

/* Concrete */
.concrete {
  background:linear-gradient(180deg,rgba(80,40,20,0.5),rgba(50,20,10,0.7));
  border:1px solid rgba(150,80,30,0.5);
  border-radius:2px;
  box-shadow:0 0 20px rgba(139,0,0,0.2), inset 0 1px 0 rgba(255,200,100,0.1);
  position:relative;overflow:hidden;
}
.concrete::before{
  content:'';position:absolute;inset:0;
  background:
    repeating-linear-gradient(0deg,transparent,transparent 19px,rgba(200,100,30,0.07) 20px),
    repeating-linear-gradient(90deg,transparent,transparent 19px,rgba(200,100,30,0.07) 20px);
}
.concrete-roof{
  width:110%;margin-left:-5%;
  height:14px;
  background:linear-gradient(180deg,var(--crimson),var(--crimson-mid));
  border-radius:2px 2px 0 0;
  box-shadow:0 -4px 16px rgba(139,0,0,0.5);
  position:relative;
}
.concrete-roof::after{
  content:'';position:absolute;
  bottom:-4px;left:0;right:0;height:4px;
  background:var(--gold);opacity:0.4;
}

/* Pagoda / Dougong */
.dougong-stack{display:flex;flex-direction:column;align-items:center;}
.dougong-layer{
  border-radius:1px;
  position:relative;
}
.dougong-conn{
  width:4px;
  background:repeating-linear-gradient(180deg,
    rgba(200,150,12,0.7) 0px,rgba(200,150,12,0.7) 3px,
    transparent 3px,transparent 6px);
  margin:0 auto;
}
.dougong-tip{
  width:12px;height:12px;
  background:radial-gradient(circle,var(--gold-lt),var(--gold));
  border-radius:50%;
  box-shadow:0 0 12px rgba(200,150,12,0.8);
  margin:0 auto 4px;
  animation:tip-pulse 2s ease-in-out infinite;
}
@keyframes tip-pulse{
  0%,100%{box-shadow:0 0 12px rgba(200,150,12,0.8);}
  50%{box-shadow:0 0 24px rgba(200,150,12,1), 0 0 40px rgba(200,150,12,0.4);}
}

/* ── Wave chart ── */
.chart-area {
  border-top:1px solid rgba(200,150,12,0.15);
  background:rgba(8,4,0,0.9);
  padding:10px 18px 8px;
  display:flex;flex-direction:column;gap:6px;
  height:190px;
  position:relative;z-index:1;
}
.chart-header{display:flex;justify-content:space-between;align-items:center;}
.chart-title{
  font-family:'Noto Serif SC',serif;
  font-size:9px;letter-spacing:0.18em;color:rgba(200,150,12,0.5);
}
.chart-legend{display:flex;gap:14px;font-size:9px;}
.leg-item{display:flex;align-items:center;gap:5px;}
.leg-dot{width:10px;height:2px;border-radius:1px;}
canvas.wc{width:100%;flex:1;display:block;min-height:0;}

/* ── ML Panel ── */
.ml-section { }
.ml-input-row{margin-bottom:10px;}
.ml-input-label{font-size:9px;color:var(--paper-dim);letter-spacing:0.06em;margin-bottom:4px;}
.ml-input{
  width:100%;
  background:rgba(0,0,0,0.5);
  border:1px solid rgba(200,150,12,0.2);
  border-radius:3px;
  padding:6px 10px;
  color:var(--gold-lt);
  font-family:'Share Tech Mono',monospace;
  font-size:11px;outline:none;
  transition:border-color 0.2s;
}
.ml-input:focus{border-color:rgba(200,150,12,0.6);}
.ml-input::placeholder{color:rgba(200,150,12,0.25);}

.btn-predict{
  width:100%;padding:10px;
  background:linear-gradient(135deg,rgba(139,0,0,0.6),rgba(100,0,0,0.8));
  border:1px solid var(--crimson-lt);
  border-radius:3px;
  color:var(--gold-pale);
  font-family:'Noto Serif SC',serif;
  font-size:11px;font-weight:600;letter-spacing:0.15em;
  cursor:pointer;transition:all 0.2s;
  margin-bottom:12px;
}
.btn-predict:hover{
  background:linear-gradient(135deg,var(--crimson),var(--crimson-mid));
  box-shadow:0 4px 20px rgba(139,0,0,0.5);
}
.btn-predict:disabled{opacity:0.5;cursor:not-allowed;}

/* ML result */
.ml-result{
  background:rgba(0,0,0,0.5);
  border:1px solid rgba(200,150,12,0.2);
  border-radius:4px;
  padding:12px;
  font-size:10px;
  line-height:1.7;
  color:var(--paper-dim);
  min-height:80px;
  white-space:pre-wrap;
  letter-spacing:0.03em;
}
.ml-result.loading{
  color:rgba(200,150,12,0.5);
  animation:ml-pulse 1.2s ease-in-out infinite;
}
@keyframes ml-pulse{0%,100%{opacity:0.5;}50%{opacity:1;}}

.ml-score-row{
  display:flex;align-items:center;gap:10px;
  margin-top:10px;padding-top:10px;
  border-top:1px solid rgba(200,150,12,0.1);
}
.ml-score-label{font-size:9px;color:rgba(200,150,12,0.5);flex-shrink:0;}
.ml-score-bar-bg{flex:1;height:6px;background:rgba(200,150,12,0.1);border-radius:3px;overflow:hidden;}
.ml-score-bar-fill{height:100%;border-radius:3px;transition:width 0.8s ease;}
.ml-score-val{font-family:'Noto Serif SC',serif;font-size:13px;font-weight:700;flex-shrink:0;}

/* Divider */
.gold-divider{
  height:1px;
  background:linear-gradient(90deg,transparent,rgba(200,150,12,0.3),transparent);
  margin:2px 0;
}

/* Tooltip badge */
.struct-active-badge{
  position:absolute;bottom:20px;left:50%;transform:translateX(-50%);
  font-size:8px;letter-spacing:0.12em;
  color:rgba(200,150,12,0.4);
  white-space:nowrap;
}
`;
document.head.appendChild(style);

// ─── Physics ──────────────────────────────────────────────────────────────────
function computeResponse(t, magnitude, freq, damping) {
  const A = magnitude / 9;
  const omega = 2 * Math.PI * freq;
  const ground = A * Math.sin(omega * t);
  const omegaN = omega * 1.2;
  const zeta = damping;
  const r = omega / omegaN;
  const denom = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
  const H = denom > 0.001 ? 1 / denom : 8;
  const phi = Math.atan2(2 * zeta * r, 1 - r * r);
  const concrete = A * Math.min(H, 4) * 0.25 * Math.sin(omega * t - phi);
  const dougong  = concrete * (0.35 + damping * 0.2);
  return { ground, concrete, dougong };
}

// ─── WaveChart ────────────────────────────────────────────────────────────────
function WaveChart({ history }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d");
    const W = c.offsetWidth, H = c.offsetHeight;
    c.width = W * devicePixelRatio; c.height = H * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    ctx.clearRect(0, 0, W, H);
    const mid = H / 2;
    ctx.strokeStyle = "rgba(200,150,12,0.06)"; ctx.lineWidth = 1;
    [1,2,3].forEach(i => {
      ctx.beginPath(); ctx.moveTo(0, H/4*i); ctx.lineTo(W, H/4*i); ctx.stroke();
    });
    ctx.strokeStyle = "rgba(200,150,12,0.15)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
    if (history.length < 2) return;
    const draw = (key, color, glow) => {
      ctx.shadowColor = color; ctx.shadowBlur = glow ? 10 : 0;
      ctx.strokeStyle = color; ctx.lineWidth = glow ? 2 : 1.5;
      ctx.beginPath();
      history.forEach((d, i) => {
        const x = (i / (history.length - 1)) * W;
        const y = mid - d[key] * H * 0.38;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      });
      ctx.stroke(); ctx.shadowBlur = 0;
    };
    draw("ground",   "rgba(200,150,12,0.45)", false);
    draw("concrete", "rgba(200,80,40,0.9)",   true);
    draw("dougong",  "rgba(232,184,75,0.9)",  true);
  }, [history]);
  return <canvas ref={ref} className="wc" />;
}

// ─── Concrete Structure ───────────────────────────────────────────────────────
function ConcreteStructure({ disp }) {
  const px = disp * 35;
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <div className="concrete-roof" style={{
        transform:`translateX(${px * 1.1}px)`,
        transition:"transform 0.04s linear", width:94,
      }} />
      <div className="concrete" style={{
        width:86, height:180,
        transform:`translateX(${px}px) rotate(${px * 0.08}deg)`,
        transition:"transform 0.04s linear",
      }} />
    </div>
  );
}

// ─── Dougong Structure ────────────────────────────────────────────────────────
function DougongStructure({ disp }) {
  const layers = [
    { w:96,  h:20, bg:"rgba(180,120,20,0.65)", border:"rgba(220,170,30,0.7)" },
    { w:82,  h:18, bg:"rgba(160,100,15,0.6)",  border:"rgba(200,155,25,0.6)" },
    { w:68,  h:18, bg:"rgba(140,85,12,0.55)",  border:"rgba(180,140,20,0.55)" },
    { w:55,  h:16, bg:"rgba(120,70,10,0.5)",   border:"rgba(160,125,15,0.5)" },
    { w:44,  h:16, bg:"rgba(100,55,8,0.45)",   border:"rgba(140,110,12,0.45)" },
  ];
  return (
    <div className="dougong-stack">
      <div className="dougong-tip" />
      {layers.map((l, i) => {
        const phase = (i / layers.length) * Math.PI * 0.5;
        const scale = 0.35 + (i / layers.length) * 0.65;
        const px = disp * 35 * Math.sin(phase + 0.3) * scale;
        return (
          <div key={i}>
            <div className="dougong-layer" style={{
              width:l.w, height:l.h,
              background:`linear-gradient(180deg,${l.bg},rgba(0,0,0,0.2))`,
              border:`1px solid ${l.border}`,
              boxShadow:`0 0 12px rgba(200,150,12,0.12)`,
              transform:`translateX(${px}px)`,
              transition:"transform 0.05s ease-out",
            }} />
            {i < layers.length - 1 && (
              <div className="dougong-conn" style={{ height:10 }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── ML Predictor ─────────────────────────────────────────────────────────────
// ─── ML Predictor ─────────────────────────────────────────────────────────────
function MLPredictor() {
  const [form, setForm] = useState({
    buildingType: "木结构 Timber Frame",
    height: "",
    wallThickness: "",
    foundationDepth: "",
    age: "",
    location: "",
    magnitude: "",
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const predict = async () => {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("http://localhost:8000/api/predict/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          building_type: form.buildingType,
          height: parseFloat(form.height),
          wall_thickness: parseFloat(form.wallThickness),
          foundation_depth: parseFloat(form.foundationDepth),
          age: parseInt(form.age),
          location: form.location,
          magnitude: parseFloat(form.magnitude),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Server error");
      setResult(data);
    } catch (e) {
      setResult({
        error: `Analysis failed: ${e instanceof Error ? e.message : "Unknown error"}`,
      });
    }

    setLoading(false);
  };

  const scoreColor = (s: number) =>
    s >= 70 ? "#4ade80" : s >= 40 ? "#facc15" : "#f87171";

  const filled = Object.values(form).every(v => v.trim() !== "");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      <div className="section-title">🏛 AI 结构预测 · ML Predictor</div>

      {[
        ["buildingType", "Building Type", "e.g. 木结构 Timber, 砖石 Masonry"],
        ["height", "Height (m)", "e.g. 35"],
        ["wallThickness", "Wall Thickness (cm)", "e.g. 80"],
        ["foundationDepth", "Foundation Depth (m)", "e.g. 3.5"],
        ["age", "Age of Structure (yrs)", "e.g. 600"],
        ["location", "Region / Province", "e.g. Beijing, Shaanxi"],
        ["magnitude", "Design Earthquake Mw", "e.g. 7.5"],
      ].map(([key, label, ph]) => (
        <div className="ml-input-row" key={key}>
          <div className="ml-input-label">{label}</div>
          {key === "buildingType" ? (
            <select
              className="sim-select"
              value={form[key as keyof typeof form]}
              onChange={e => set(key, e.target.value)}
            >
              <option>木结构 Timber Frame</option>
              <option>斗拱 Dougong Bracket</option>
              <option>砖石 Masonry</option>
              <option>土坯 Rammed Earth</option>
              <option>混合 Composite</option>
            </select>
          ) : (
            <input
              className="ml-input"
              placeholder={ph}
              value={form[key as keyof typeof form]}
              onChange={e => set(key, e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        className="btn-predict"
        onClick={predict}
        disabled={loading || !filled}
      >
        {loading ? "占卜中… ANALYSING…" : "⚡ 预测抗震性 · PREDICT RESISTANCE"}
      </button>

      {loading && (
        <div className="ml-result loading">
          {"正在分析结构数据…\nConsulting ancient engineering wisdom…"}
        </div>
      )}

      {result && !result.error && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div className="ml-result">
            <div
              style={{
                color: "#E8B84B",
                fontFamily: "'Noto Serif SC',serif",
                fontSize: 11,
                marginBottom: 6,
              }}
            >
              {result.riskLevel} RISK
            </div>
            <div style={{ marginBottom: 8 }}>{result.summary}</div>
            <div style={{ marginBottom: 4 }}>
              <span style={{ color: "rgba(200,150,12,0.6)" }}>STRENGTHS: </span>
              {result.keyStrengths?.join(" · ")}
            </div>
            <div style={{ marginBottom: 8 }}>
              <span style={{ color: "rgba(200,150,12,0.6)" }}>RISKS: </span>
              {result.keyVulnerabilities?.join(" · ")}
            </div>
            <div style={{ color: "rgba(200,150,12,0.5)", fontSize: 9 }}>
              ▶ {result.recommendation}
            </div>
          </div>

          <div className="ml-score-row">
            <span className="ml-score-label">RESISTANCE</span>
            <div className="ml-score-bar-bg">
              <div
                className="ml-score-bar-fill"
                style={{
                  width: `${result.resistanceScore}%`,
                  background: `linear-gradient(90deg, rgba(200,150,12,0.5), ${scoreColor(result.resistanceScore)})`,
                  boxShadow: `0 0 8px ${scoreColor(result.resistanceScore)}`,
                }}
              />
            </div>
            <span
              className="ml-score-val"
              style={{ color: scoreColor(result.resistanceScore) }}
            >
              {result.resistanceScore}
            </span>
          </div>
        </div>
      )}

      {result?.error && (
        <div className="ml-result" style={{ color: "#f87171" }}>
          {result.error}
        </div>
      )}
    </div>
  );
}

// ─── Ming Mentor Chat ─────────────────────────────────────────────────────────
function MingMentorChat({
  magnitude,
  frequency,
  damping,
  structure,
}: {
  magnitude: number;
  frequency: number;
  damping: number;
  structure: string;
}) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "我是明代工程导师。Ask me about dougong, masonry, earthquake behavior, or how the current simulation parameters affect the structure.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMessage = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/chat/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: text,
          context: {
            magnitude,
            frequency,
            damping,
            structure_type: structure,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Chat request failed");
      }

      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "No reply returned.",
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: `Chat error: ${err instanceof Error ? err.message : "Unknown error"}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-wrap">
      <div className="section-title">明代导师 · Ming Mentor Chat</div>

      <div className="chat-scroll">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-msg ${msg.role}`}>
            <div className="chat-role">
              {msg.role === "user" ? "YOU" : "MING MENTOR"}
            </div>
            <div>{msg.content}</div>
          </div>
        ))}

        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-role">MING MENTOR</div>
            <div>Thinking...</div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      <textarea
        className="chat-input"
        placeholder="Ask about the current structure, the earthquake parameters, or ancient engineering logic..."
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <div className="chat-actions">
        <button className="btn btn-start" onClick={sendMessage} disabled={loading}>
          {loading ? "THINKING..." : "ASK MENTOR"}
        </button>
        <button
          className="btn btn-reset"
          onClick={() =>
            setMessages([
              {
                role: "assistant",
                content:
                  "我是明代工程导师。Ask me about dougong, masonry, earthquake behavior, or how the current simulation parameters affect the structure.",
              },
            ])
          }
          disabled={loading}
        >
          CLEAR
        </button>
      </div>

      <div className="chat-hint">
        Current context is sent automatically: magnitude, frequency, damping, and selected structure.
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [magnitude, setMagnitude] = useState(5);
  const [frequency, setFrequency] = useState(1.2);
  const [damping,   setDamping]   = useState(0.3);
  const [structure, setStructure] = useState("dougong");
  const [running,   setRunning]   = useState(false);
  const [disp,      setDisp]      = useState({ ground:0, concrete:0, dougong:0 });
  const [history,   setHistory]   = useState([]);
  const [elapsed,   setElapsed]   = useState(0);
  const rafRef   = useRef(null);
  const t0Ref    = useRef(null);
  const histRef  = useRef([]);

  const tick = useCallback((ts) => {
    if (!t0Ref.current) t0Ref.current = ts;
    const t = (ts - t0Ref.current) / 1000;
    setElapsed(t);
    const r = computeResponse(t, magnitude, frequency, damping);
    setDisp(r);
    histRef.current = [...histRef.current.slice(-220), r];
    setHistory([...histRef.current]);
    rafRef.current = requestAnimationFrame(tick);
  }, [magnitude, frequency, damping]);

  useEffect(() => {
    if (running) {
      t0Ref.current = null;
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    }
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [running, tick]);

  const reset = () => {
    setRunning(false); setDisp({ ground:0, concrete:0, dougong:0 });
    setHistory([]); histRef.current = []; setElapsed(0); t0Ref.current = null;
  };

  const curDisp = structure === "concrete" ? disp.concrete : disp.dougong;
  const risk    = Math.min(100, Math.abs(curDisp) * 80 + magnitude * 5);
  const riskCol = risk > 70 ? "#ff5533" : risk > 40 ? "#ffaa22" : "var(--gold-lt)";
  const riskLbl = risk > 70 ? "危险 CRITICAL" : risk > 40 ? "警告 MODERATE" : "安全 LOW";

  const Slider = ({ label, value, min, max, step, onChange, unit, dec=1 }) => (
    <div className="slider-row">
      <div className="slider-label">
        <span>{label}</span>
        <span className="slider-val">{value.toFixed(dec)}<span style={{ fontSize:9, opacity:0.5, marginLeft:2 }}>{unit}</span></span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(parseFloat(e.target.value))} />
    </div>
  );

  return (
    <div className="root">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-emblem">龙</div>
        <div className="header-titles">
          <div className="header-zh">故宫抗震模拟系统</div>
          <div className="header-en">Imperial Palace Seismic Resilience Simulator · Ancient Chinese Architecture</div>
        </div>
        <div className="header-divider" />
        <div className="header-dynasty">
          明清宫殿工程学 · Ming-Qing Structural Engineering
        </div>
        <div className="header-right">
          <div className="header-status">
            <div className={`status-orb ${running ? "active" : ""}`} />
            {running ? `运行中 T+${elapsed.toFixed(1)}s` : "待机 STANDBY"}
          </div>
        </div>
      </header>

      {/* ── Left Panel ── */}
      <aside className="panel panel-left">
        <div className="section">
          <div className="section-title">地震参数 · Ground Motion</div>
          <Slider label="震级 Magnitude" value={magnitude} min={0} max={9} step={0.1} onChange={setMagnitude} unit="Mw" />
          <Slider label="频率 Frequency"  value={frequency} min={0.1} max={5} step={0.1} onChange={setFrequency} unit="Hz" />
          <Slider label="阻尼 Damping"    value={damping}   min={0} max={1} step={0.01} onChange={setDamping} unit="ζ" dec={2} />
        </div>

        <div className="section">
          <div className="section-title">结构类型 · Structure</div>
          <div style={{ marginBottom:10 }}>
            <div className="slider-label" style={{ marginBottom:5 }}>建筑形式 Building Type</div>
            <select className="sim-select" value={structure} onChange={e => setStructure(e.target.value)}>
              <option value="concrete">砖石结构 · Masonry Frame</option>
              <option value="dougong">斗拱木结构 · Dougong Timber</option>
            </select>
          </div>
          <div style={{ fontSize:9, color:"rgba(200,150,12,0.35)", lineHeight:1.6 }}>
            {structure === "dougong"
              ? "斗拱系统通过多层弹性连接耗散地震能量，是中国古代建筑智慧的结晶。\nThe Dougong bracket system dissipates seismic energy through layered elastic joints."
              : "砖石结构刚性强但阻尼低，在强震下容易发生共振破坏。\nMasonry frames are stiff but low-damping, vulnerable to resonance failure."}
          </div>
        </div>

        <div className="section">
          <div className="section-title">实时数据 · Live Metrics</div>
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">位移 DISPLACEMENT</div>
              <div className={`metric-val ${Math.abs(curDisp) > 0.6 ? "danger" : Math.abs(curDisp) > 0.35 ? "warn" : ""}`}>
                {(curDisp * 100).toFixed(1)}<span className="metric-unit">cm</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-label">风险 RISK</div>
              <div className="metric-val" style={{ color:riskCol, fontSize:11 }}>{riskLbl}</div>
            </div>
            <div className="metric-card">
              <div className="metric-label">地面 GROUND</div>
              <div className="metric-val">{(Math.abs(disp.ground)*100).toFixed(1)}<span className="metric-unit">cm</span></div>
            </div>
            <div className="metric-card">
              <div className="metric-label">频率比 FREQ RATIO</div>
              <div className="metric-val">{(frequency/1.2).toFixed(2)}<span className="metric-unit">r</span></div>
            </div>
          </div>
          <div className="risk-wrap">
            <div className="risk-labels">
              <span>地震风险指数 SEISMIC RISK INDEX</span>
              <span style={{ color:riskCol }}>{risk.toFixed(0)}%</span>
            </div>
            <div className="risk-bg">
              <div className="risk-fill" style={{
                width:`${risk}%`,
                background:`linear-gradient(90deg,rgba(200,150,12,0.5),${riskCol})`,
                boxShadow:`0 0 8px ${riskCol}`,
              }} />
            </div>
          </div>
        </div>

        <div className="btn-row">
          <button className={`btn btn-start ${running ? "active" : ""}`}
            onClick={() => setRunning(r => !r)}>
            {running ? "⏸ 暂停 PAUSE" : "▶ 开始 START"}
          </button>
          <button className="btn btn-reset" onClick={reset}>↺ 重置</button>
        </div>
      </aside>

      {/* ── Center: Canvas + Chart ── */}
      <div style={{ display:"grid", gridTemplateRows:"1fr 190px", overflow:"hidden", position:"relative", zIndex:1 }}>
        <div className="canvas-wrap">
          <div className="corner tl"/><div className="corner tr"/>
          <div className="corner bl"/><div className="corner br"/>
          <div className="canvas-badge">故宫结构可视化 · IMPERIAL STRUCTURE VISUALIZATION</div>

          <div className="stage">
            {/* Masonry */}
            <div className="struct-col" style={{ opacity: structure==="concrete" ? 1 : 0.22, transition:"opacity 0.4s" }}>
              <div className="struct-label">砖石</div>
              <div className="struct-sublabel">MASONRY</div>
              <ConcreteStructure disp={disp.concrete} />
            </div>

            {/* Dougong */}
            <div className="struct-col" style={{ opacity: structure==="dougong" ? 1 : 0.22, transition:"opacity 0.4s" }}>
              <div className="struct-label">斗拱</div>
              <div className="struct-sublabel">DOUGONG</div>
              <DougongStructure disp={disp.dougong} />
            </div>
          </div>

          {/* Ground */}
          <div className="ground-platform" style={{
            transform: running ? `translateX(${disp.ground * 14}px)` : undefined,
            transition:"transform 0.04s linear", width:"100%",
          }} />
        </div>

        <div className="chart-area">
          <div className="chart-header">
            <span className="chart-title">地震波形实时图 · REAL-TIME SEISMIC WAVEFORM</span>
            <div className="chart-legend">
              {[
                ["rgba(200,150,12,0.5)","地面 Ground"],
                ["rgba(200,80,40,0.9)", "砖石 Masonry"],
                ["rgba(232,184,75,0.9)","斗拱 Dougong"],
              ].map(([c,l]) => (
                <div className="leg-item" key={l}>
                  <div className="leg-dot" style={{ background:c }} />
                  <span style={{ color:c, fontSize:9 }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
          <WaveChart history={history} />
        </div>
      </div>

      {/* ── Right ML Panel ── */}
      <aside className="panel panel-right">
  <div className="section">
    <MLPredictor />

  </div>

  <div className="section">
    <MingMentorChat
      magnitude={magnitude}
      frequency={frequency}
      damping={damping}
      structure={structure}
    />
  </div>

  <div style={{ fontSize:8, color:"rgba(200,150,12,0.2)", textAlign:"center", letterSpacing:"0.1em", marginTop:"auto", padding:"8px 0" }}>
    古代中国建筑与技术研究 · Ancient Chinese Architecture & Technology
  </div>
</aside>
    </div>
  );
}
