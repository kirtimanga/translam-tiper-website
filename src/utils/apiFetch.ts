import { BASE_URL } from './baseUrl';

/**
 * Centralized fetch helper that prefers same-origin requests in the browser
 * (so Next dev proxy or same-origin APIs are used and CORS is avoided), and
 * falls back to the external backend (BASE_URL) when needed. On server-side
 * or when an absolute URL is supplied, it will call the external URL directly.
 */
export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const isAbsolute = /^(https?:)?\/\//i.test(input);
  const path = isAbsolute ? input : (input.startsWith('/') ? input : `/${input}`);

  const externalUrl = isAbsolute ? path : `${BASE_URL.replace(/\/$/, '')}${path}`;
  const sameOriginUrl = path;

  const isBrowser = typeof window !== 'undefined';

  // In browser dev, prefer same-origin so Next's proxy (rewrites) can avoid CORS
  if (isBrowser) {
    try {
      const res = await fetch(sameOriginUrl, init);
      return res;
    } catch (err) {
      // same-origin failed — try external
      console.debug('apiFetch: same-origin attempt failed, trying external:',
        err instanceof Error ? err.message : String(err)
      );
    }
  }

  // Try external URL (server-side or fallback)
  try {
    const res = await fetch(externalUrl, init);
    return res;
  } catch (err) {
    console.warn('apiFetch: external API unreachable, trying same-origin fallback:',
      err instanceof Error ? err.message : String(err)
    );
  }

  // Final attempt: same-origin (if not tried earlier)
  try {
    const res2 = await fetch(sameOriginUrl, init);
    return res2;
  } catch (err) {
    // both failed — rethrow the last error
    throw err;
  }
}

export default apiFetch;
