// @ts-nocheck

/* =============================================================
   elvhack · shader wallpapers — runtime
   -------------------------------------------------------------
   Each wallpaper is a fragment program drawn over a single full-
   screen quad. Shared uniforms:

     u_res         — canvas size in px
     u_time        — seconds since boot
     u_mouse       — smoothed pointer (uv, y-up)
     u_mouseRaw    — raw pointer (uv, y-up)
     u_press       — held mouse / touch (0..1, smoothed)
     u_ripples[8]  — vec3(x, y, age_s); age<0 = empty slot
     u_rippleCount — int

   Per-wallpaper interaction model (final):

     01 aurora  — drift only. cursor warps the field. no clicks.
     02 liquid  — drag warps; HOLD deepens; CLICK ripples.
     03 cells   — cell under cursor lifts. no clicks.
     04 flux    — cursor injects warm dye. no clicks.
     05 lattice — cells near cursor wake; CLICK rings the grid.
   ============================================================= */

const canvas = document.getElementById("bg");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const isCompactViewport = () => window.matchMedia("(max-width: 820px)").matches;
const gl = canvas.getContext("webgl", {
	antialias: false,
	premultipliedAlpha: false,
	powerPreference: "high-performance",
});
if (!gl) {
	document.body.innerHTML =
		"<div style='padding:40px;font-family:monospace;color:#fff'>WebGL unavailable.</div>";
	throw new Error("no webgl");
}

/* ---------- Shared GLSL ---------- */
const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const COMMON = `
precision highp float;
uniform vec2  u_res;
uniform float u_time;
uniform vec2  u_mouse;
uniform vec2  u_mouseRaw;
uniform float u_press;
uniform vec3  u_ripples[8];
uniform int   u_rippleCount;

#define PI 3.141592653589793

float hash11(float p){ return fract(sin(p*127.1)*43758.5453); }
float hash21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
vec2  hash22(vec2 p){ return fract(sin(vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3))))*43758.5453); }

float vnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f*f*(3.0 - 2.0*f);
  return mix(mix(a,b,u.x), mix(c,d,u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for(int i=0; i<5; i++){ v += a*vnoise(p); p = p*2.02 + 17.13; a *= 0.5; }
  return v;
}

// integrated ripple contribution
float rippleField(vec2 uv, float speed, float decay, float freq){
  float r = 0.0;
  for(int i=0; i<8; i++){
    if(i >= u_rippleCount) break;
    vec3 rp = u_ripples[i];
    if(rp.z < 0.0) continue;
    float d = distance(uv, rp.xy);
    float t = rp.z;
    float wave = sin(d*freq - t*speed) * exp(-d*4.0 - t*decay);
    wave *= smoothstep(0.0, 0.08, t);
    r += wave;
  }
  return r;
}

// cosine palette (Iñigo Quilez) — 3 RGB knobs + phase
vec3 cospal(float t, vec3 a, vec3 b, vec3 c, vec3 d){
  return a + b*cos(6.28318*(c*t + d));
}
`;

/* ---------- 01 · AURORA ----------
   Richer chromatic field (per request). The base is FBM driven, but
   color now comes from a layered cosine palette (broad warm/cool axis)
   PLUS a second hue rotation driven by a slower noise — so we get
   navy → violet → magenta → coral → amber → teal → cyan transitions
   appearing in different parts of the canvas at the same time.
   No click ripples (per spec). Cursor is a soft attractor only. */
const FRAG_AURORA =
	COMMON +
	`
void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 d = p - m;
  float md = length(d);
  // gentle attractor toward cursor
  p -= 0.20 * d * exp(-md*1.4);

  // flowing field — three octave slices
  vec2 q = p*1.5 + vec2(u_time*0.06, -u_time*0.04);
  float n1 = fbm(q);
  float n2 = fbm(q*1.9 + n1 + vec2(u_time*0.07, 0.0));
  float n3 = fbm(p*3.4 - u_time*0.05 + n2*1.2);
  float n4 = fbm(p*0.6 + u_time*0.018);   // slow large-scale hue rotator

  // aurora bands
  float band  = smoothstep(0.30, 0.85, n2 + 0.4*n3);
  float spark = smoothstep(0.78, 0.95, n3);

  // -------- richer palette --------
  // base cool axis (navy → violet → magenta)
  vec3 base = cospal(n1 + 0.10*n4,
    vec3(0.50, 0.45, 0.55),
    vec3(0.50, 0.45, 0.55),
    vec3(1.00, 1.00, 1.00),
    vec3(0.00, 0.10, 0.20));
  base *= 0.55;
  base = mix(vec3(0.03, 0.04, 0.08), base, smoothstep(0.0, 0.6, n1));

  // warm spectrum overlay (coral → amber)
  vec3 warm = cospal(n3 + n4*0.5,
    vec3(0.75, 0.55, 0.30),
    vec3(0.45, 0.40, 0.30),
    vec3(0.40, 0.50, 0.60),
    vec3(0.10, 0.20, 0.30));

  // teal/cyan band — the elvhack accent, threaded through brightest stretches
  vec3 teal  = vec3(0.25, 0.95, 0.85);
  vec3 emer  = vec3(0.10, 0.55, 0.65);

  // compose
  vec3 col = base;
  col = mix(col, warm,  pow(band, 1.4) * 0.55);
  col = mix(col, emer,  band * 0.45);
  col = mix(col, teal,  spark * 0.85);

  // cursor glow — neutral accent, never overpowering
  col += vec3(0.30, 0.95, 0.85) * exp(-md*5.0) * 0.18;

  // grain + vignette
  float g = (hash21(gl_FragCoord.xy + u_time) - 0.5) * 0.020;
  col += g;
  float vig = smoothstep(1.10, 0.32, length((uv-0.5)*vec2(aspect,1.0)));
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 02 · LIQUID ----------
   Refractive caustics in molten copper. Mouse drags warm light;
   clicks ripple it. Click interaction RETAINED. */
const FRAG_LIQUID =
	COMMON +
	`
float caustic(vec2 p){
  float v = 0.0;
  vec2 i = p;
  float t = u_time*0.4;
  for(int n=0; n<4; n++){
    float fn = float(n)+1.0;
    i += vec2(cos(t/fn + i.x), sin(t/fn - i.y));
    v += 1.0/length(vec2(p.x/(sin(i.x+t)/fn), p.y/(cos(i.y+t)/fn)));
  }
  return v/4.0;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 d = p - m;
  float md = length(d);

  float rip = rippleField(uv, 7.0, 1.4, 44.0);
  vec2 g = vec2(
    rippleField(uv + vec2(0.003,0.0), 7.0, 1.4, 44.0) - rip,
    rippleField(uv + vec2(0.0,0.003), 7.0, 1.4, 44.0) - rip
  );
  vec2 warp = -g*8.0 - 0.18 * d * exp(-md*2.2) * (0.4 + u_press*0.6);

  vec2 cp = (p + warp) * 2.4;
  float c = caustic(cp);
  c = pow(clamp(c*0.55, 0.0, 1.4), 1.6);

  vec3 deep   = vec3(0.06, 0.03, 0.04);
  vec3 mid    = vec3(0.55, 0.22, 0.10);
  vec3 hot    = vec3(1.00, 0.78, 0.45);
  vec3 spark  = vec3(1.00, 0.95, 0.85);

  vec3 col = mix(deep, mid, smoothstep(0.05, 0.5, c));
  col = mix(col, hot, smoothstep(0.55, 1.05, c));
  col += spark * smoothstep(1.0, 1.4, c) * 0.9;

  col += vec3(1.0, 0.85, 0.7) * exp(-md*4.5) * (0.18 + u_press*0.25);
  col += vec3(1.0, 0.96, 0.85) * smoothstep(0.15, 0.45, abs(rip)) * 0.5;

  float vig = smoothstep(1.1, 0.35, length((uv-0.5)*vec2(aspect,1.0)));
  col *= vig;
  col += (hash21(gl_FragCoord.xy + u_time) - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 03 · CELLS ----------
   Worley voronoi cells. Cell under cursor lifts. No click ripples. */
const FRAG_CELLS =
	COMMON +
	`
vec3 voronoi(vec2 x){
  vec2 n = floor(x);
  vec2 f = fract(x);
  float F1 = 8.0, F2 = 8.0, idAcc = 0.0;
  for(int j=-1; j<=1; j++){
    for(int i=-1; i<=1; i++){
      vec2 g = vec2(float(i), float(j));
      vec2 o = hash22(n + g);
      o = 0.5 + 0.5*sin(u_time*0.45 + 6.2831*o);
      vec2 r = g + o - f;
      float d = dot(r,r);
      if(d < F1){ F2 = F1; F1 = d; idAcc = hash21(n + g); }
      else if(d < F2){ F2 = d; }
    }
  }
  return vec3(sqrt(F1), sqrt(F2), idAcc);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);

  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 d = p - m;
  p -= 0.10 * d * exp(-length(d)*2.4);

  vec3 v = voronoi(p*5.5);
  float edge = smoothstep(0.02, 0.0, v.y - v.x);
  float core = 1.0 - smoothstep(0.0, 0.55, v.x);

  vec3 vm = voronoi((u_mouse - 0.5) * vec2(aspect,1.0) * 5.5);
  float cellMatch = 1.0 - smoothstep(0.0, 0.12, abs(v.z - vm.z));

  vec3 bg     = vec3(0.04, 0.05, 0.09);
  vec3 mid    = vec3(0.10, 0.18, 0.32);
  vec3 hot    = vec3(0.78, 0.92, 1.00);
  vec3 cobalt = vec3(0.30, 0.55, 1.00);

  vec3 col = mix(bg, mid, core);
  col += cobalt * edge * 0.8;
  col += hot * cellMatch * (0.45 + u_press*0.35);

  col *= 0.98 + 0.02*sin(gl_FragCoord.y*1.6);

  float vig = smoothstep(1.05, 0.35, length((uv-0.5)*vec2(aspect,1.0)));
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 04 · FLUX ----------
   Curl-noise smoke. Mouse injects warm dye. No click ripples. */
const FRAG_FLUX =
	COMMON +
	`
vec2 curl(vec2 p){
  float e = 0.01;
  float n1 = fbm(p + vec2(e,0.0));
  float n2 = fbm(p - vec2(e,0.0));
  float n3 = fbm(p + vec2(0.0,e));
  float n4 = fbm(p - vec2(0.0,e));
  return vec2((n3-n4)/(2.0*e), -(n1-n2)/(2.0*e));
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);

  vec2 q = p;
  float dens = 0.0;
  for(int i=0; i<10; i++){
    vec2 v = curl(q*1.4 + u_time*0.12);
    q -= v*0.012;
    dens += fbm(q*2.6 + u_time*0.05) * 0.12;
  }
  float baseSmoke = smoothstep(0.4, 1.6, dens);

  float dye = 0.0;
  vec2 q2 = p;
  for(int i=0; i<8; i++){
    vec2 v = curl(q2*1.4 + u_time*0.12);
    q2 -= v*0.012;
    float dToMouse = length(q2 - m);
    dye += exp(-dToMouse*2.6) * (0.05 + 0.05*float(i));
  }
  dye = clamp(dye*0.55, 0.0, 1.4);

  vec3 base  = vec3(0.02, 0.05, 0.06);
  vec3 fog   = vec3(0.10, 0.42, 0.36);
  vec3 jade  = vec3(0.55, 0.95, 0.78);
  vec3 ember = vec3(1.00, 0.55, 0.30);
  vec3 white = vec3(1.0);

  vec3 col = base;
  col = mix(col, fog, baseSmoke);
  col = mix(col, jade, baseSmoke * baseSmoke * 0.7);
  col = mix(col, ember, smoothstep(0.2, 1.0, dye));
  col += white * pow(dye, 4.0) * 0.6;

  float vig = smoothstep(1.1, 0.45, length((uv-0.5)*vec2(aspect,1.0)));
  col *= vig;
  col += (hash21(gl_FragCoord.xy + u_time) - 0.5) * 0.02;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- 05 · LATTICE ----------
   Hex resonator. Cells near cursor wake; clicks send ring of
   activations through the grid. Click interaction RETAINED. */
const FRAG_LATTICE =
	COMMON +
	`
vec4 hexTile(vec2 p){
  vec2 r = vec2(1.0, 1.7320508);
  vec2 h = r*0.5;
  vec2 a = mod(p, r) - h;
  vec2 b = mod(p - h, r) - h;
  vec2 gv = dot(a,a) < dot(b,b) ? a : b;
  vec2 id = p - gv;
  return vec4(id, gv);
}
float hexEdge(vec2 gv){
  gv = abs(gv);
  return max(dot(gv, normalize(vec2(1.0, 1.7320508))), gv.x);
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);

  float scale = 11.0;
  vec4 hx = hexTile(p*scale);
  vec2 cellCenter = hx.xy / scale;
  vec2 gv = hx.zw;
  float ed = hexEdge(gv);
  float cellD = distance(cellCenter, m);

  float rim  = smoothstep(0.50, 0.46, ed);
  float body = smoothstep(0.42, 0.0, ed);

  float prox = exp(-cellD*4.5);
  float breath = 0.5 + 0.5*sin(u_time*0.8 + hash21(cellCenter*7.31)*6.283);

  float ring = 0.0;
  for(int i=0;i<8;i++){
    if(i >= u_rippleCount) break;
    vec3 rp = u_ripples[i];
    if(rp.z < 0.0) continue;
    vec2 rPos = (rp.xy - 0.5) * vec2(aspect, 1.0);
    float dToCenter = distance(cellCenter, rPos);
    float front = exp(-pow((dToCenter - rp.z*0.55)*7.0, 2.0));
    ring += front * exp(-rp.z*0.6);
  }

  vec3 bg     = vec3(0.02, 0.04, 0.07);
  vec3 dim    = vec3(0.06, 0.10, 0.18);
  vec3 cyan   = vec3(0.25, 0.85, 1.00);
  vec3 hot    = vec3(0.65, 0.95, 1.00);

  vec3 col = bg;
  col = mix(col, dim, body * 0.55);
  float intensity = prox * (0.6 + 0.4*breath) + ring*1.4 + u_press*prox*0.6;
  col = mix(col, cyan, body * intensity);
  col += hot * pow(intensity, 2.5) * body * 0.8;
  col += cyan * rim * (0.15 + intensity*0.9);

  col += vec3(0.04, 0.07, 0.10) * (0.5 + 0.5*sin(uv.y*220.0)) * 0.06;

  float vig = smoothstep(1.1, 0.4, length((uv-0.5)*vec2(aspect,1.0)));
  col *= vig;

  gl_FragColor = vec4(col, 1.0);
}
`;

/* ---------- Wallpaper registry ----------
   `clickable: true` = ripples allowed. Per spec: only liquid + lattice. */
const WALLPAPERS = [
	{
		id: "aurora",
		name: "Aurora",
		tag: "drift field",
		c1: "#5fffd7",
		c2: "rgba(95,255,215,0.6)",
		frag: FRAG_AURORA,
		clickable: false,
		interaction: "drift",
		desc: "Volumetric ribbons that bend toward the cursor — a slow, breathing chromatic field.",
	},
	{
		id: "liquid",
		name: "Liquid",
		tag: "molten caustics",
		c1: "#ffb060",
		c2: "rgba(255,176,96,0.6)",
		frag: FRAG_LIQUID,
		clickable: true,
		interaction: "drag · hold · click",
		desc: "Refractive copper surface. Drag to drift the light, hold to deepen the warp, click to ripple.",
	},
	{
		id: "cells",
		name: "Cells",
		tag: "voronoi lattice",
		c1: "#9bd0ff",
		c2: "rgba(155,208,255,0.6)",
		frag: FRAG_CELLS,
		clickable: false,
		interaction: "hover",
		desc: "Living voronoi cells. The cell containing your cursor lifts in pearl light.",
	},
	{
		id: "flux",
		name: "Flux",
		tag: "curl smoke",
		c1: "#ff8a4d",
		c2: "rgba(255,138,77,0.6)",
		frag: FRAG_FLUX,
		clickable: false,
		interaction: "trace",
		desc: "Curl-noise smoke field. The cursor injects warm dye that advects along the streamlines.",
	},
	{
		id: "lattice",
		name: "Lattice",
		tag: "hex resonator",
		c1: "#5fe6ff",
		c2: "rgba(95,230,255,0.6)",
		frag: FRAG_LATTICE,
		clickable: true,
		interaction: "hover · click",
		desc: "Hex tile resonator. Cells near the cursor wake; a click sends a ring of activations outward.",
	},
];

/* ---------- WebGL helpers ---------- */
function compileShader(type, src) {
	const s = gl.createShader(type);
	gl.shaderSource(s, src);
	gl.compileShader(s);
	if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
		console.error("shader compile error:", gl.getShaderInfoLog(s), "\n", src);
		throw new Error("shader compile failed");
	}
	return s;
}
function buildProgram(fragSrc) {
	const v = compileShader(gl.VERTEX_SHADER, VERT);
	const f = compileShader(gl.FRAGMENT_SHADER, fragSrc);
	const p = gl.createProgram();
	gl.attachShader(p, v);
	gl.attachShader(p, f);
	gl.bindAttribLocation(p, 0, "a_pos");
	gl.linkProgram(p);
	if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
		console.error("link error:", gl.getProgramInfoLog(p));
		throw new Error("link failed");
	}
	return {
		program: p,
		loc: {
			res: gl.getUniformLocation(p, "u_res"),
			time: gl.getUniformLocation(p, "u_time"),
			mouse: gl.getUniformLocation(p, "u_mouse"),
			mouseRaw: gl.getUniformLocation(p, "u_mouseRaw"),
			press: gl.getUniformLocation(p, "u_press"),
			ripples: gl.getUniformLocation(p, "u_ripples"),
			rippleCount: gl.getUniformLocation(p, "u_rippleCount"),
		},
	};
}

const quad = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, quad);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

const programs = WALLPAPERS.map((w) => ({ id: w.id, ...buildProgram(w.frag) }));
let activeIndex = 0;
let activeProgram = programs[0];

/* ---------- State ---------- */
const state = {
	mouse: { x: 0.5, y: 0.5 },
	mouseRaw: { x: 0.5, y: 0.5 },
	press: 0,
	pressTarget: 0,
	ripples: [],
	startTime: performance.now() / 1000,
	lastFrame: performance.now(),
	fpsAcc: 0,
	fpsCount: 0,
};

function resize() {
	const dpr = Math.min(window.devicePixelRatio || 1, isCompactViewport() ? 1.5 : 2);
	const w = Math.floor(window.innerWidth * dpr);
	const h = Math.floor(window.innerHeight * dpr);
	if (canvas.width !== w || canvas.height !== h) {
		canvas.width = w;
		canvas.height = h;
		gl.viewport(0, 0, w, h);
	}
	document.getElementById("diag-res").textContent = `${window.innerWidth} × ${window.innerHeight}`;
}
window.addEventListener("resize", resize);
resize();

/* ---------- Input ---------- */
function setMouse(clientX, clientY) {
	const rect = canvas.getBoundingClientRect();
	state.mouseRaw.x = (clientX - rect.left) / rect.width;
	state.mouseRaw.y = 1 - (clientY - rect.top) / rect.height;
}
canvas.addEventListener("mousemove", (e) => setMouse(e.clientX, e.clientY));
canvas.addEventListener("mousedown", (e) => {
	setMouse(e.clientX, e.clientY);
	state.pressTarget = 1;
	addRipple();
});
window.addEventListener("mouseup", () => (state.pressTarget = 0));

canvas.addEventListener(
	"touchstart",
	(e) => {
		if (e.touches.length) {
			setMouse(e.touches[0].clientX, e.touches[0].clientY);
			state.pressTarget = 1;
			addRipple();
		}
		e.preventDefault();
	},
	{ passive: false },
);
canvas.addEventListener(
	"touchmove",
	(e) => {
		if (e.touches.length) setMouse(e.touches[0].clientX, e.touches[0].clientY);
		e.preventDefault();
	},
	{ passive: false },
);
canvas.addEventListener("touchend", () => (state.pressTarget = 0));

function addRipple() {
	// gate: 01 aurora / 03 cells / 04 flux do not generate ripples
	const w = WALLPAPERS[activeIndex];
	if (!w.clickable) return;
	state.ripples.push({
		x: state.mouseRaw.x,
		y: state.mouseRaw.y,
		t0: performance.now() / 1000 - state.startTime,
	});
	if (state.ripples.length > 8) state.ripples.shift();
	if (firstInteraction) {
		firstInteraction = false;
		document.getElementById("hint").classList.add("hidden");
	}
}

let firstInteraction = true;
canvas.addEventListener(
	"mousemove",
	() => {
		if (firstInteraction) {
			firstInteraction = false;
			setTimeout(() => document.getElementById("hint").classList.add("hidden"), 800);
		}
	},
	{ once: true },
);

/* ---------- Dock ---------- */
const dockEl = document.getElementById("dock");
WALLPAPERS.forEach((w, i) => {
	const b = document.createElement("button");
	b.className = i === 0 ? "active" : "";
	b.dataset.idx = i;
	b.innerHTML = `
    <span class="num">0${i + 1}</span>
    <span class="swatch" style="--c1:${w.c1};--c2:${w.c2}"></span>
    <span class="label">${w.name}</span>
  `;
	b.addEventListener("click", () => switchTo(i));
	dockEl.appendChild(b);
});

function switchTo(i) {
	if (i === activeIndex) return;
	activeIndex = i;
	activeProgram = programs[i];
	state.ripples = [];
	[...dockEl.children].forEach((el, idx) => {
		el.classList.toggle("active", idx === i);
	});
	const w = WALLPAPERS[i];
	document.getElementById("tc-num").textContent = `0${i + 1}`;
	document.getElementById("tc-id").textContent = `// ${w.id}`;
	document.getElementById("tc-tag").textContent = `${w.tag} · v1.0`;
	document.getElementById("tc-desc").textContent = w.desc;
	document.getElementById("diag-shader").textContent = w.id;
	document.getElementById("prompt-name").textContent = w.id;
	document.getElementById("m-int").textContent = w.interaction;
	// restart name reveal animation
	const nameEl = document.getElementById("tc-name");
	nameEl.textContent = w.name;
	nameEl.style.animation = "none";
	// force reflow
	void nameEl.offsetWidth;
	nameEl.style.animation = "";
	// index bar slide
	document.getElementById("tc-bar").style.setProperty("--bar", `${i * 80}%`);
	if (reduceMotion) render(performance.now());
}
// init bar
document.getElementById("tc-bar").style.setProperty("--bar", "0%");

/* ---------- Clock ---------- */
function updateClock() {
	const d = new Date();
	const hh = String(d.getHours()).padStart(2, "0");
	const mm = String(d.getMinutes()).padStart(2, "0");
	document.getElementById("clock").textContent = `${hh}:${mm}`;
}
updateClock();
setInterval(updateClock, 30000);

/* ---------- Render loop ---------- */
const rippleBuf = new Float32Array(8 * 3);

function fmtUptime(s) {
	const seconds = Math.floor(s);
	const m = Math.floor(seconds / 60);
	const ss = seconds % 60;
	if (m < 1) return `${ss}s`;
	return `${m}m ${ss}s`;
}

function render(now) {
	const tNow = now / 1000;
	const t = reduceMotion ? 12.0 : tNow - state.startTime;
	const dt = reduceMotion ? 1 / 60 : Math.min(0.05, (now - state.lastFrame) / 1000);
	state.lastFrame = now;

	const lerpAmt = 1 - 0.001 ** dt;
	state.mouse.x += (state.mouseRaw.x - state.mouse.x) * lerpAmt * 0.55;
	state.mouse.y += (state.mouseRaw.y - state.mouse.y) * lerpAmt * 0.55;
	state.press += (state.pressTarget - state.press) * lerpAmt * 0.7;

	state.ripples = state.ripples.filter((r) => t - r.t0 < 3.0);
	for (let i = 0; i < 8; i++) {
		const r = state.ripples[i];
		if (r) {
			rippleBuf[i * 3] = r.x;
			rippleBuf[i * 3 + 1] = r.y;
			rippleBuf[i * 3 + 2] = t - r.t0;
		} else {
			rippleBuf[i * 3] = 0;
			rippleBuf[i * 3 + 1] = 0;
			rippleBuf[i * 3 + 2] = -1;
		}
	}

	gl.useProgram(activeProgram.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, quad);
	gl.enableVertexAttribArray(0);
	gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

	gl.uniform2f(activeProgram.loc.res, canvas.width, canvas.height);
	gl.uniform1f(activeProgram.loc.time, t);
	gl.uniform2f(activeProgram.loc.mouse, state.mouse.x, state.mouse.y);
	gl.uniform2f(activeProgram.loc.mouseRaw, state.mouseRaw.x, state.mouseRaw.y);
	gl.uniform1f(activeProgram.loc.press, state.press);
	gl.uniform3fv(activeProgram.loc.ripples, rippleBuf);
	gl.uniform1i(activeProgram.loc.rippleCount, state.ripples.length);

	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

	state.fpsAcc += dt;
	state.fpsCount++;
	if (state.fpsAcc >= 0.5) {
		const fps = Math.round(state.fpsCount / state.fpsAcc);
		document.getElementById("fps").textContent = `${fps} fps`;
		state.fpsAcc = 0;
		state.fpsCount = 0;
		document.getElementById("diag-up").textContent = fmtUptime(t);
		// density readout — simple: 0.4 + sin(time)*small
		document.getElementById("m-den").textContent = (0.5 + 0.18 * Math.sin(t * 0.4)).toFixed(2);
	}

	document.getElementById("m-pos").textContent =
		`${state.mouseRaw.x.toFixed(2)}, ${state.mouseRaw.y.toFixed(2)}`;

	if (!reduceMotion) requestAnimationFrame(render);
}
if (reduceMotion) render(performance.now());
else requestAnimationFrame(render);

/* ---------- Keyboard switch ---------- */
window.addEventListener("keydown", (e) => {
	if (e.key >= "1" && e.key <= "5") switchTo(Number.parseInt(e.key, 10) - 1);
	else if (e.key === "ArrowRight") switchTo((activeIndex + 1) % WALLPAPERS.length);
	else if (e.key === "ArrowLeft")
		switchTo((activeIndex - 1 + WALLPAPERS.length) % WALLPAPERS.length);
});

export {};
