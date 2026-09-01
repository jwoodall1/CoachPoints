const normalizeHost = (host: string) => host.toLowerCase().replace(/\.$/, '');

/** Returns a normalized HTTPS URL only when its host is explicitly allowed. */
export function safeHttpsUrl(
  value: string | null | undefined,
  allowedHosts?: readonly string[],
): string | null {
  if (!value?.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || url.username || url.password) return null;
    const host = normalizeHost(url.hostname);
    if (
      allowedHosts?.length &&
      !allowedHosts.some((allowedHost) => {
        const allowed = normalizeHost(allowedHost);
        return host === allowed || host.endsWith(`.${allowed}`);
      })
    )
      return null;
    return url.toString();
  } catch {
    return null;
  }
}

const hudlHosts = ['hudl.com'] as const;

/** Converts an allowlisted public Hudl URL into an allowlisted player URL. */
export function safeHudlEmbedUrl(value: string | null | undefined): string | null {
  const safeUrl = safeHttpsUrl(value, hudlHosts);
  if (!safeUrl) return null;
  const url = new URL(safeUrl);
  if (url.pathname.includes('/embed/')) return url.toString();
  if (url.pathname.includes('/video/'))
    url.pathname = url.pathname.replace('/video/', '/embed/video/');
  else if (url.pathname.includes('/v/'))
    url.pathname = url.pathname.replace('/v/', '/embed/v/');
  else return null;
  return url.toString();
}
