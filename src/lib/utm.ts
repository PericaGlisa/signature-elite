import type { SignatureData, UtmConfig } from "./signature-types";

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function resolveCampaign(d: SignatureData): string {
  return d.utm.campaign?.trim() || slugify(d.fullName) || "signature";
}

/** Append UTM params to a URL. Skip mailto:, tel:, wa.me, and anchors. */
export function withUtm(rawUrl: string, d: SignatureData, content?: string): string {
  if (!rawUrl) return rawUrl;
  if (!d.utm.enabled) return rawUrl;
  const lower = rawUrl.toLowerCase();
  if (
    lower.startsWith("mailto:") ||
    lower.startsWith("tel:") ||
    lower.startsWith("#") ||
    lower.includes("wa.me/") ||
    lower.includes("api.whatsapp.com")
  ) {
    return rawUrl;
  }

  // Make sure it has protocol so URL() works
  const hasProtocol = /^https?:\/\//i.test(rawUrl);
  const base = hasProtocol ? rawUrl : `https://${rawUrl}`;

  let url: URL;
  try {
    url = new URL(base);
  } catch {
    return rawUrl;
  }

  const cfg: UtmConfig = d.utm;
  const params = url.searchParams;
  const setIfMissing = (k: string, v: string) => {
    if (v && !params.has(k)) params.set(k, v);
  };
  setIfMissing("utm_source", cfg.source);
  setIfMissing("utm_medium", cfg.medium);
  setIfMissing("utm_campaign", resolveCampaign(d));
  if (cfg.term) setIfMissing("utm_term", cfg.term);
  if (cfg.autoContent && content) setIfMissing("utm_content", content);

  return url.toString();
}
