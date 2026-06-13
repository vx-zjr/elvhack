import { jsonOk, requireAdmin, withErrorBoundary } from '../_shared/http';
import type { Env } from '../_shared/types';

export const onRequestGet: PagesFunction<Env> = async ({ env, request }) =>
  withErrorBoundary(async () => {
    const admin = await requireAdmin(request.headers.get('authorization'), env);
    if (!admin.ok) {
      return admin.response;
    }
    return jsonOk({ githubUsername: admin.githubUsername });
  });
