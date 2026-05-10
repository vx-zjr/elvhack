import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const component = readFileSync("src/components/home/ShaderStage.astro", "utf8");
const globalStyles = readFileSync("src/styles/global.css", "utf8");
const styles = readFileSync("src/styles/shader-stage.css", "utf8");
const runtime = readFileSync("src/scripts/shader-stage.ts", "utf8");

test("home portal uses vertical single-entry panels", () => {
	assert.match(component, /class="portal-track"/);
	assert.match(component, /class="portal-panel portal-panel--quant/);
	assert.match(component, /class="portal-panel portal-panel--technology/);
	assert.match(component, />QUANT</);
	assert.match(component, />TECH</);
	assert.doesNotMatch(component, />TECHNOLOGY</);
	assert.match(component, /class="portal-brand/);
	assert.match(component, /class="portal-letter"/);
	assert.match(component, /portal-title__slice portal-title__slice--left/);
	assert.match(component, /portal-title__slice portal-title__slice--right/);
	assert.doesNotMatch(component, /portal-title__slash/);
	assert.match(component, /portal-title__border/);
	assert.match(component, /向下滑/);
	assert.match(component, /SCROLL DOWN/);
	assert.match(component, /向上滑/);
	assert.match(component, /SCROLL UP/);
});

test("home portal has left-top typography, quiet vertical hints, and no custom cursor", () => {
	assert.doesNotMatch(styles, /portal-link--quant\s*{[^}]*border-right/s);
	assert.doesNotMatch(styles, /portal-link--quant\s*{[^}]*border-bottom/s);
	assert.doesNotMatch(styles, /portal-link::before[\s\S]*border:/);
	assert.doesNotMatch(styles, /portal-link:focus-visible::before/);
	assert.doesNotMatch(styles, /cursor:\s*none/);
	assert.doesNotMatch(styles, /hint-drift/);
	assert.doesNotMatch(component, /portal-cursor/);
	assert.match(styles, /place-items:\s*start start/);
	assert.match(styles, /writing-mode:\s*vertical-rl/);
	assert.match(styles, /portal-title__ghost/);
	assert.match(styles, /@keyframes letter-roll/);
	assert.match(styles, /@keyframes brand-cycle/);
	assert.match(styles, /@keyframes portal-slice-left/);
	assert.match(styles, /@keyframes portal-slice-right/);
	assert.doesNotMatch(styles, /@keyframes portal-slash/);
	assert.match(styles, /@keyframes portal-border-top/);
	assert.match(styles, /margin-bottom:\s*clamp\(26px,\s*3\.4vw,\s*54px\)/);
	assert.match(styles, /portal-panel--technology[\s\S]*translate3d\(6vw/);
});

test("home portal gives QUANT a blue frame while TECH keeps the accent frame", () => {
	assert.match(globalStyles, /--color-quant-frame:\s*#4aa3ff/);
	assert.match(styles, /\.portal-panel\s*{[\s\S]*--portal-frame-color:\s*var\(--color-accent\)/);
	assert.match(
		styles,
		/\.portal-panel--quant\s*{[\s\S]*--portal-frame-color:\s*var\(--color-quant-frame\)/,
	);
	assert.doesNotMatch(styles, /\.portal-panel--technology\s*{[\s\S]*--portal-frame-color:/);
	assert.match(styles, /\.portal-title__border span\s*{[\s\S]*var\(--portal-frame-color\)/);
});

test("home portal runtime supports scroll swipe keyboard switching and letter rolling", () => {
	assert.match(runtime, /activeIndex/);
	assert.match(runtime, /targetIndex/);
	assert.match(runtime, /addEventListener\(\s*"wheel"/);
	assert.match(runtime, /addEventListener\(\s*"touchstart"/);
	assert.match(runtime, /addEventListener\(\s*"touchend"/);
	assert.match(runtime, /ArrowDown/);
	assert.match(runtime, /PageUp/);
	assert.doesNotMatch(runtime, /cursorEnabled/);
	assert.doesNotMatch(runtime, /updateCursor/);
	assert.match(runtime, /setActiveIndex/);
	assert.match(runtime, /targetMode/);
	assert.match(runtime, /rollRandomLetter/);
	assert.match(runtime, /portal-letter/);
});

test("home portal keeps native link clicks and supports whole-panel entry clicks", () => {
	assert.match(runtime, /for \(const panel of panels\)/);
	assert.match(runtime, /panel\.addEventListener\("click"/);
	assert.match(runtime, /closest\("\[data-entry\]"\)/);
	assert.match(runtime, /lastSwipeAt/);
	assert.doesNotMatch(
		runtime,
		/link\.addEventListener\("click"[\s\S]*event\.preventDefault\(\);[\s\S]*navigateCurrent\(\);/,
	);
});
