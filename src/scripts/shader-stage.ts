type Entry = "quant" | "technology";
type Lang = "zh" | "en";
type PrerenderableDocument = Document & { prerendering?: boolean };

const canvasNode = document.getElementById("bg");
const rootNode = document.querySelector<HTMLElement>(".portal");
const panels = [...document.querySelectorAll<HTMLElement>(".portal-panel")];
const links = [...document.querySelectorAll<HTMLAnchorElement>("[data-entry]")];
const letters = [...document.querySelectorAll<HTMLElement>(".portal-letter")];
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compactQuery = window.matchMedia("(max-width: 760px)");
const TARGET_FRAME_MS = 1000 / 60;

if (
	!(canvasNode instanceof HTMLCanvasElement) ||
	!rootNode ||
	panels.length !== 2 ||
	links.length !== 2
) {
	throw new Error("portal DOM unavailable");
}

const canvas = canvasNode;
const root = rootNode;
const glContext = canvas.getContext("webgl", {
	antialias: false,
	depth: false,
	premultipliedAlpha: false,
	preserveDrawingBuffer: false,
	powerPreference: "low-power",
	stencil: false,
});

const state = {
	lastFrame: performance.now(),
	mode: 0,
	mouseX: 0.5,
	mouseY: 0.5,
	press: 0,
	pressTarget: 0,
	rawX: 0.5,
	rawY: 0.5,
	start: performance.now(),
	targetMode: 0,
};

let activeIndex = 0;
let targetIndex = 0;
let lastSwitchAt = 0;
let lastSwipeAt = 0;
let touchStartY = 0;
let touchStartX = 0;
let letterRollTimer = 0;

const rollGlyphs = ["0", "1", "7", "/", "\\", "_", ":", "+", "*", "<", ">"];

function isPageActive() {
	return !document.hidden && !(document as PrerenderableDocument).prerendering;
}

function preferredLang(): Lang {
	try {
		const stored = window.localStorage.getItem("elvhack-lang");
		if (stored === "zh" || stored === "en") return stored;
	} catch {
		// Navigation must not depend on storage.
	}
	return navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
}

function entryHref(entry: Entry, lang = preferredLang()) {
	return `/${lang}/${entry}/`;
}

function syncEntryHrefs() {
	const lang = preferredLang();
	for (const link of links) {
		const entry = link.dataset.entry as Entry;
		link.href = entryHref(entry, lang);
	}
}

function updatePanelAccessibility() {
	panels.forEach((panel, index) => {
		const isActive = index === activeIndex;
		const link = panel.querySelector<HTMLAnchorElement>("[data-entry]");
		panel.classList.toggle("is-active", isActive);
		panel.setAttribute("aria-hidden", String(!isActive));
		if (link) link.tabIndex = isActive ? 0 : -1;
	});
	root.dataset.active = String(activeIndex);
}

function setActiveIndex(index: number) {
	const next = Math.max(0, Math.min(1, index));
	if (next === activeIndex) return;
	activeIndex = next;
	targetIndex = next;
	state.targetMode = next;
	lastSwitchAt = performance.now();
	updatePanelAccessibility();
}

function switchByDelta(delta: number) {
	if (Math.abs(delta) < 18) return;
	const now = performance.now();
	if (now - lastSwitchAt < 520) return;
	setActiveIndex(delta > 0 ? 1 : 0);
}

function currentEntry() {
	return activeIndex === 0 ? "quant" : "technology";
}

function navigateCurrent() {
	const entry = currentEntry();
	const lang = preferredLang();
	const href = entryHref(entry, lang);
	try {
		window.localStorage.setItem("elvhack-lang", lang);
	} catch {
		// Navigation must not depend on storage.
	}
	if (reduceMotion) {
		window.location.href = href;
		return;
	}
	root.classList.add("is-leaving");
	window.setTimeout(() => {
		window.location.href = href;
	}, 260);
}

function setPointer(clientX: number, clientY: number) {
	const rect = canvas.getBoundingClientRect();
	state.rawX = (clientX - rect.left) / rect.width;
	state.rawY = 1 - (clientY - rect.top) / rect.height;
}

function stopLetterRoll() {
	if (letterRollTimer) window.clearTimeout(letterRollTimer);
	letterRollTimer = 0;
}

function rollRandomLetter() {
	const activeLetters = letters.filter((letter) => letter.closest(".portal-panel.is-active"));
	if (activeLetters.length === 0) return;
	const letter = activeLetters[Math.floor(Math.random() * activeLetters.length)];
	const glyph = rollGlyphs[Math.floor(Math.random() * rollGlyphs.length)];
	if (!letter || !glyph || letter.classList.contains("is-rolling")) return;
	letter.dataset.roll = glyph;
	letter.classList.add("is-rolling");
	window.setTimeout(() => {
		letter.classList.remove("is-rolling");
	}, 820);
}

function scheduleLetterRoll() {
	stopLetterRoll();
	if (reduceMotion || !isPageActive()) return;
	const delay = 2200 + Math.random() * 3200;
	letterRollTimer = window.setTimeout(() => {
		rollRandomLetter();
		scheduleLetterRoll();
	}, delay);
}

syncEntryHrefs();
updatePanelAccessibility();
root.dataset.active = "0";
if (document.activeElement === document.body) {
	root.focus({ preventScroll: true });
}
scheduleLetterRoll();

for (const link of links) {
	link.addEventListener("pointerdown", (event) => {
		setPointer(event.clientX, event.clientY);
		state.pressTarget = 1;
	});
	link.addEventListener("pointerup", () => {
		state.pressTarget = 0;
	});
	link.addEventListener("pointercancel", () => {
		state.pressTarget = 0;
	});
	link.addEventListener("pointerleave", () => {
		state.pressTarget = 0;
	});
	link.addEventListener("keydown", (event) => {
		if (event.key === " ") {
			event.preventDefault();
			navigateCurrent();
		}
	});
}

for (const panel of panels) {
	panel.addEventListener("click", (event) => {
		if (performance.now() - lastSwipeAt < 460) return;
		if (!(event.target instanceof Element)) return;
		if (event.target.closest("[data-entry]")) return;
		const panelIndex = panels.indexOf(panel);
		if (panelIndex !== activeIndex) return;
		navigateCurrent();
	});
}

root.addEventListener(
	"pointermove",
	(event) => {
		setPointer(event.clientX, event.clientY);
	},
	{ passive: true },
);

root.addEventListener(
	"wheel",
	(event) => {
		switchByDelta(event.deltaY);
	},
	{ passive: true },
);

root.addEventListener(
	"touchstart",
	(event) => {
		const touch = event.touches[0];
		if (!touch) return;
		touchStartY = touch.clientY;
		touchStartX = touch.clientX;
		setPointer(touch.clientX, touch.clientY);
	},
	{ passive: true },
);

root.addEventListener(
	"touchend",
	(event) => {
		const touch = event.changedTouches[0];
		if (!touch) return;
		const deltaY = touchStartY - touch.clientY;
		const deltaX = touchStartX - touch.clientX;
		if (Math.abs(deltaY) > Math.abs(deltaX) * 1.25 && Math.abs(deltaY) >= 18) {
			lastSwipeAt = performance.now();
			switchByDelta(deltaY);
		}
		state.pressTarget = 0;
	},
	{ passive: true },
);

root.addEventListener("keydown", (event) => {
	if (event.key === "ArrowDown" || event.key === "PageDown") {
		event.preventDefault();
		setActiveIndex(1);
	} else if (event.key === "ArrowUp" || event.key === "PageUp") {
		event.preventDefault();
		setActiveIndex(0);
	} else if (event.key === "Enter" && document.activeElement === root) {
		event.preventDefault();
		navigateCurrent();
	} else if (event.key === " " && document.activeElement === root) {
		event.preventDefault();
		navigateCurrent();
	}
});

document.addEventListener("visibilitychange", () => {
	if (!isPageActive()) stopLetterRoll();
	else scheduleLetterRoll();
});

document.addEventListener(
	"prerenderingchange",
	() => {
		state.start = performance.now();
		scheduleLetterRoll();
	},
	{ once: true },
);

window.addEventListener("pagehide", () => {
	stopLetterRoll();
});

if (!glContext) {
	root.classList.add("webgl-fallback");
} else {
	const gl = glContext;
	const VERT = `
attribute vec2 a_pos;
void main(){ gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

	const FRAG = `
precision highp float;
uniform vec2 u_res;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_mode;
uniform float u_press;

#define PI 3.141592653589793

float hash21(vec2 p){
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float vnoise(vec2 p){
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0;
  float a = 0.5;
  for(int i = 0; i < 4; i++){
    v += a * vnoise(p);
    p = p * 2.03 + 13.17;
    a *= 0.5;
  }
  return v;
}

vec3 cospal(float t, vec3 a, vec3 b, vec3 c, vec3 d){
  return a + b * cos(6.28318 * (c * t + d));
}

vec3 quantField(vec2 uv, float aspect){
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 d = p - m;
  p -= 0.18 * d * exp(-length(d) * 1.55);

  vec2 q = p * 1.45 + vec2(u_time * 0.045, -u_time * 0.035);
  float n1 = fbm(q);
  float n2 = fbm(q * 1.8 + n1 + vec2(u_time * 0.045, 0.0));
  float n3 = fbm(p * 3.1 - u_time * 0.035 + n2);
  float band = smoothstep(0.32, 0.86, n2 + n3 * 0.35);
  float spark = smoothstep(0.78, 0.96, n3);

  vec3 base = cospal(n1 + n3 * 0.08,
    vec3(0.44, 0.43, 0.52),
    vec3(0.42, 0.38, 0.45),
    vec3(1.0, 1.0, 1.0),
    vec3(0.0, 0.12, 0.22));
  vec3 warm = vec3(0.78, 0.42, 0.28);
  vec3 cyan = vec3(0.25, 0.95, 0.84);
  vec3 col = mix(vec3(0.025, 0.03, 0.055), base * 0.55, smoothstep(0.05, 0.65, n1));
  col = mix(col, warm, pow(band, 1.35) * 0.34);
  col = mix(col, cyan, spark * 0.64);
  col += cyan * exp(-length(d) * 5.2) * (0.12 + u_press * 0.08);
  return col;
}

vec2 flow(vec2 p){
  float n = fbm(p);
  float a = n * PI * 2.0;
  return vec2(cos(a), sin(a));
}

vec3 technologyField(vec2 uv, float aspect){
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (u_mouse - 0.5) * vec2(aspect, 1.0);
  vec2 q = p;
  float smoke = 0.0;

  for(int i = 0; i < 4; i++){
    float fi = float(i);
    vec2 v = flow(q * 1.35 + vec2(u_time * 0.055 + fi * 3.1, -u_time * 0.035));
    q += v * (0.045 + fi * 0.006);
    smoke += fbm(q * 2.0 + fi * 1.7 + u_time * 0.035) * 0.22;
  }

  float body = smoothstep(0.28, 1.1, smoke);
  float dye = exp(-length(q - m) * 2.8) * (0.72 + u_press * 0.42);
  dye += exp(-length(p - m) * 7.0) * 0.35;

  vec3 base = vec3(0.018, 0.045, 0.05);
  vec3 fog = vec3(0.08, 0.32, 0.29);
  vec3 jade = vec3(0.38, 0.86, 0.66);
  vec3 ember = vec3(1.0, 0.48, 0.28);
  vec3 col = mix(base, fog, body);
  col = mix(col, jade, body * body * 0.62);
  col = mix(col, ember, smoothstep(0.18, 1.0, dye) * 0.68);
  col += vec3(1.0) * pow(clamp(dye, 0.0, 1.0), 4.0) * 0.28;
  return col;
}

void main(){
  vec2 uv = gl_FragCoord.xy / u_res;
  float aspect = u_res.x / u_res.y;
  float blend = smoothstep(0.0, 1.0, u_mode);
  vec3 col;
  if (blend <= 0.001) {
    col = quantField(uv, aspect);
  } else if (blend >= 0.999) {
    col = technologyField(uv, aspect);
  } else {
    vec3 q = quantField(uv, aspect);
    vec3 t = technologyField(uv, aspect);
    col = mix(q, t, blend);
  }

  float vig = smoothstep(1.08, 0.34, length((uv - 0.5) * vec2(aspect, 1.0)));
  col *= vig;
  col += (hash21(gl_FragCoord.xy + u_time) - 0.5) * 0.012;
  gl_FragColor = vec4(col, 1.0);
}
`;

	function compileShader(type: number, source: string) {
		const shader = gl.createShader(type);
		if (!shader) throw new Error("shader allocation failed");
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			const message = gl.getShaderInfoLog(shader) ?? "unknown shader compile error";
			gl.deleteShader(shader);
			throw new Error(message);
		}
		return shader;
	}

	const vertex = compileShader(gl.VERTEX_SHADER, VERT);
	const fragment = compileShader(gl.FRAGMENT_SHADER, FRAG);
	const program = gl.createProgram();
	if (!program) throw new Error("program allocation failed");
	gl.attachShader(program, vertex);
	gl.attachShader(program, fragment);
	gl.bindAttribLocation(program, 0, "a_pos");
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error(gl.getProgramInfoLog(program) ?? "shader link failed");
	}
	gl.deleteShader(vertex);
	gl.deleteShader(fragment);

	const loc = {
		mode: gl.getUniformLocation(program, "u_mode"),
		mouse: gl.getUniformLocation(program, "u_mouse"),
		press: gl.getUniformLocation(program, "u_press"),
		res: gl.getUniformLocation(program, "u_res"),
		time: gl.getUniformLocation(program, "u_time"),
	};

	const quad = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, quad);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

	let quality = reduceMotion ? 0.7 : 1;
	let raf = 0;
	let running = false;
	let destroyed = false;
	let slowFrames = 0;
	let fastFrames = 0;
	let nextFrameAt = 0;

	function maxDpr() {
		if (reduceMotion) return 0.75;
		return compactQuery.matches ? 0.9 : 1;
	}

	function resize(force = false) {
		const dpr = Math.max(0.55, maxDpr() * quality);
		const rect = root.getBoundingClientRect();
		const width = Math.max(1, Math.floor(rect.width * dpr));
		const height = Math.max(1, Math.floor(rect.height * dpr));
		if (force || canvas.width !== width || canvas.height !== height) {
			canvas.width = width;
			canvas.height = height;
			gl.viewport(0, 0, width, height);
		}
	}

	function tuneQuality(dt: number) {
		if (reduceMotion) return;
		if (dt > 0.034) {
			slowFrames++;
			fastFrames = 0;
		} else if (dt < 0.021) {
			fastFrames++;
			slowFrames = 0;
		} else {
			slowFrames = 0;
			fastFrames = 0;
		}

		if (slowFrames > 24 && quality > 0.68) {
			quality *= 0.86;
			slowFrames = 0;
			resize(true);
		} else if (fastFrames > 180 && quality < 0.98) {
			quality = Math.min(1, quality * 1.08);
			fastFrames = 0;
			resize(true);
		}
	}

	function render(now: number) {
		if (!reduceMotion && now < nextFrameAt) {
			if (running) raf = window.requestAnimationFrame(render);
			return;
		}
		nextFrameAt = now + TARGET_FRAME_MS;

		const dt = reduceMotion ? 1 / 60 : Math.min(0.05, (now - state.lastFrame) / 1000);
		state.lastFrame = now;
		const lerp = 1 - 0.001 ** dt;
		state.mouseX += (state.rawX - state.mouseX) * lerp * 0.55;
		state.mouseY += (state.rawY - state.mouseY) * lerp * 0.55;
		state.targetMode = targetIndex;
		state.mode += (targetIndex - state.mode) * lerp * 0.46;
		if (Math.abs(targetIndex - state.mode) < 0.001) state.mode = targetIndex;
		state.press += (state.pressTarget - state.press) * lerp * 0.7;

		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, quad);
		gl.enableVertexAttribArray(0);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.uniform2f(loc.res, canvas.width, canvas.height);
		gl.uniform1f(loc.time, reduceMotion ? 10 : (now - state.start) / 1000);
		gl.uniform2f(loc.mouse, state.mouseX, state.mouseY);
		gl.uniform1f(loc.mode, state.mode);
		gl.uniform1f(loc.press, state.press);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

		tuneQuality(dt);
		if (running) raf = window.requestAnimationFrame(render);
	}

	function drawStill() {
		resize();
		render(performance.now());
	}

	function start() {
		if (running || destroyed || reduceMotion || !isPageActive()) return;
		running = true;
		state.lastFrame = performance.now();
		nextFrameAt = 0;
		raf = window.requestAnimationFrame(render);
	}

	function stop() {
		running = false;
		if (raf) window.cancelAnimationFrame(raf);
		raf = 0;
	}

	window.addEventListener("resize", () => {
		resize();
		if (reduceMotion) drawStill();
	});
	compactQuery.addEventListener("change", () => {
		resize(true);
		if (reduceMotion) drawStill();
	});
	document.addEventListener("visibilitychange", () => {
		if (!isPageActive()) stop();
		else start();
	});
	document.addEventListener(
		"prerenderingchange",
		() => {
			state.start = performance.now();
			start();
		},
		{ once: true },
	);
	window.addEventListener("pagehide", () => {
		stop();
		destroyed = true;
		gl.getExtension("WEBGL_lose_context")?.loseContext();
	});

	resize();
	if (reduceMotion) drawStill();
	else start();
}

export {};
