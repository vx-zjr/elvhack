import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

test("Workers config serves static assets and binds D1 DB", () => {
	assert.equal(existsSync("wrangler.jsonc"), false);
	assert.equal(existsSync("wrangler.toml"), true);

	const config = readFileSync("wrangler.toml", "utf8");
	assert.match(config, /name\s*=\s*"elvhack"/);
	assert.match(config, /compatibility_date\s*=\s*"2026-05-01"/);
	assert.match(config, /main\s*=\s*"\.\/src\/worker\.ts"/);
	assert.match(config, /\[assets\]/);
	assert.match(config, /directory\s*=\s*"\.\/dist"/);
	assert.match(config, /binding\s*=\s*"ASSETS"/);
	assert.match(config, /run_worker_first\s*=\s*\[\s*"\/api\/\*"\s*\]/);
	assert.match(config, /\[\[d1_databases\]\]/);
	assert.match(config, /binding\s*=\s*"DB"/);
	assert.match(config, /database_name\s*=\s*"prod-d1-tutorial"/);
	assert.match(config, /database_id\s*=\s*"588dc81a-d609-4b2f-9e92-e30c468b20d7"/);
	assert.match(config, /preview_database_id\s*=\s*"DB"/);
	assert.doesNotMatch(config, /pages_build_output_dir/);
});

test("D1 likes migration creates persistent post_likes table", () => {
	const migration = readFileSync("migrations/0001_create_post_likes.sql", "utf8");
	assert.match(migration, /CREATE TABLE IF NOT EXISTS post_likes/);
	assert.match(migration, /slug TEXT PRIMARY KEY/);
	assert.match(migration, /count INTEGER NOT NULL DEFAULT 0/);
	assert.match(migration, /updated_at TEXT NOT NULL/);
	assert.match(migration, /CREATE INDEX IF NOT EXISTS idx_post_likes_count/);
	assert.match(migration, /ON post_likes\(count DESC\)/);
});

test("likes API uses Worker and Pages-compatible D1 prepared statements", () => {
	const api = readFileSync("functions/api/likes.ts", "utf8");
	const worker = readFileSync("src/worker.ts", "utf8");
	assert.match(api, /interface Env\s*{[\s\S]*DB:\s*D1Database/);
	assert.match(api, /PagesFunction<Env>/);
	assert.match(api, /export const onRequestGet/);
	assert.match(api, /export const onRequestPost/);
	for (const source of [api, worker]) {
		assert.match(source, /INSERT INTO post_likes/);
		assert.match(source, /ON CONFLICT\(slug\) DO UPDATE SET/);
		assert.match(source, /\.prepare\(/);
		assert.match(source, /\.bind\(/);
		assert.match(source, /SELECT slug, count FROM post_likes ORDER BY count DESC/);
		assert.match(source, /Response\.json/);
		assert.doesNotMatch(source, /error\.stack/);
	}
	assert.match(worker, /ASSETS:\s*AssetFetcher/);
	assert.match(worker, /url\.pathname === "\/api\/likes"/);
	assert.match(worker, /env\.ASSETS\.fetch\(request\)/);
});
