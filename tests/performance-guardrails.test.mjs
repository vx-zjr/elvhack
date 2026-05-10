import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const baseLayout = readFileSync("src/layouts/Base.astro", "utf8");
const runtime = readFileSync("src/scripts/shader-stage.ts", "utf8");

test("content pages avoid broad eager speculative loading", () => {
	assert.doesNotMatch(baseLayout, /"prerender"\s*:/);
	assert.doesNotMatch(baseLayout, /"eagerness":\s*"immediate"/);
});

test("home shader has explicit power and lifecycle guardrails", () => {
	assert.match(runtime, /powerPreference:\s*"low-power"/);
	assert.match(runtime, /TARGET_FRAME_MS/);
	assert.match(runtime, /isPageActive/);
	assert.match(runtime, /\.prerendering/);
	assert.match(runtime, /prerenderingchange/);
});
