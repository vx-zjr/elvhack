CREATE TABLE IF NOT EXISTS post_likes (
	slug TEXT PRIMARY KEY,
	count INTEGER NOT NULL DEFAULT 0,
	updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_post_likes_count
ON post_likes(count DESC);
