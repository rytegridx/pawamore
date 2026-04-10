const DEFAULT_OG_PROXY = "https://pawamore-og-proxy.rytegrid.workers.dev";

export const OG_PROXY_BASE =
  (import.meta.env.VITE_OG_PROXY_URL as string | undefined)?.trim() || DEFAULT_OG_PROXY;

export const buildOgProductUrl = (slug: string) =>
  `${OG_PROXY_BASE}/products/${encodeURIComponent(slug)}`;

export const buildOgPageUrl = (path: string) => {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${OG_PROXY_BASE}${normalized}`;
};
