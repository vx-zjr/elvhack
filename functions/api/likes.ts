type PagesFunction<Env> = (context: { env: Env; request: Request }) => Promise<Response> | Response;

interface D1Database {
	prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
	all<T>(): Promise<{ results?: T[] }>;
	bind(...values: unknown[]): D1PreparedStatement;
	first<T>(): Promise<T | null>;
	run(): Promise<unknown>;
}

interface Env {
	DB: D1Database;
}

type LikeRow = {
	count: number;
	slug: string;
};

type ErrorPayload = {
	error: string;
};

const JSON_HEADERS = {
	"content-type": "application/json; charset=utf-8",
};

const MAX_SLUG_LENGTH = 200;
const SLUG_PATTERN = /^[\p{Script=Han}A-Za-z0-9/_-]+$/u;

function json<T>(payload: T, init?: ResponseInit) {
	return Response.json(payload, {
		...init,
		headers: {
			...JSON_HEADERS,
			...init?.headers,
		},
	});
}

function error(message: string, status: number) {
	return json<ErrorPayload>({ error: message }, { status });
}

function validateSlug(value: unknown) {
	if (typeof value !== "string") return "Missing slug.";

	const slug = value.trim();
	if (slug.length < 1) return "Missing slug.";
	if (slug.length > MAX_SLUG_LENGTH) return "Slug is too long.";
	if (!SLUG_PATTERN.test(slug)) return "Slug contains unsupported characters.";

	return undefined;
}

async function readJsonBody(request: Request) {
	try {
		return (await request.json()) as { slug?: unknown };
	} catch {
		return undefined;
	}
}

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) => {
	if (!env.DB) return error("D1 binding DB is not configured.", 500);

	const url = new URL(request.url);
	const slug = url.searchParams.get("slug");

	try {
		if (slug === null) {
			const result = await env.DB.prepare(
				"SELECT slug, count FROM post_likes ORDER BY count DESC",
			).all<LikeRow>();

			return json({
				likes: result.results ?? [],
			});
		}

		const validationError = validateSlug(slug);
		if (validationError) return error(validationError, 400);

		const row = await env.DB.prepare("SELECT slug, count FROM post_likes WHERE slug = ?")
			.bind(slug.trim())
			.first<LikeRow>();

		return json({
			slug: slug.trim(),
			count: row?.count ?? 0,
		});
	} catch {
		return error("Unable to read likes.", 500);
	}
};

export const onRequestPost: PagesFunction<Env> = async ({ env, request }) => {
	if (!env.DB) return error("D1 binding DB is not configured.", 500);

	const body = await readJsonBody(request);
	const slug = body?.slug;
	const validationError = validateSlug(slug);
	if (validationError) return error(validationError, 400);

	const normalizedSlug = (slug as string).trim();
	const updatedAt = new Date().toISOString();

	try {
		await env.DB.prepare(
			`INSERT INTO post_likes (slug, count, updated_at)
VALUES (?, 1, ?)
ON CONFLICT(slug) DO UPDATE SET
	count = count + 1,
	updated_at = excluded.updated_at`,
		)
			.bind(normalizedSlug, updatedAt)
			.run();

		const row = await env.DB.prepare("SELECT slug, count FROM post_likes WHERE slug = ?")
			.bind(normalizedSlug)
			.first<LikeRow>();

		return json({
			slug: normalizedSlug,
			count: row?.count ?? 1,
			liked: true,
		});
	} catch {
		return error("Unable to update likes.", 500);
	}
};
