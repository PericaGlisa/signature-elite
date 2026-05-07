import type { SignatureData } from "./signature-types";

export type QualityIssue = {
  level: "error" | "warning" | "info";
  message: string;
};

const URL_RE = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}([\/?#].*)?$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function runQualityChecks(d: SignatureData): QualityIssue[] {
  const out: QualityIssue[] = [];

  if (!d.fullName.trim()) out.push({ level: "error", message: "Ime i prezime je obavezno." });
  if (!d.position.trim()) out.push({ level: "warning", message: "Pozicija je prazna." });
  if (!d.company.trim()) out.push({ level: "error", message: "Kompanija je obavezna." });

  if (!d.email || !EMAIL_RE.test(d.email))
    out.push({ level: "error", message: "Email adresa nije validna." });

  const checkUrl = (label: string, url?: string) => {
    if (!url) return;
    if (!URL_RE.test(url)) out.push({ level: "warning", message: `${label}: URL nije validan.` });
  };
  checkUrl("Web sajt 1", d.website);
  checkUrl("Web sajt 2", d.website2);
  checkUrl("CTA link", d.ctaUrl);
  checkUrl("Banner link", d.bannerLink);
  checkUrl("Booking link", d.bookingUrl);
  checkUrl("LinkedIn", d.social.linkedin);
  checkUrl("Instagram", d.social.instagram);
  checkUrl("Facebook", d.social.facebook);
  checkUrl("YouTube", d.social.youtube);

  // Image weight (data URLs)
  const heavyAsset = (label: string, src?: string) => {
    if (!src || !src.startsWith("data:")) return;
    const bytes = Math.round((src.length * 3) / 4);
    if (bytes > 200 * 1024)
      out.push({
        level: "warning",
        message: `${label} je ${(bytes / 1024).toFixed(0)}KB — preporuka < 200KB radi brzog učitavanja.`,
      });
  };
  heavyAsset("Foto", d.photoUrl);
  heavyAsset("Logo", d.logoUrl);
  heavyAsset("Banner", d.bannerUrl);

  if (d.showCta && (!d.ctaLabel || !d.ctaUrl))
    out.push({ level: "warning", message: "CTA je uključen ali nedostaje tekst ili link." });

  if (d.showBanner && !d.bannerUrl)
    out.push({ level: "info", message: "Banner uključen, ali slika nije postavljena." });

  if (d.showBooking && !d.bookingUrl)
    out.push({ level: "warning", message: "Booking link je uključen ali URL nije postavljen." });

  if (d.showOemBadges && !d.oemPartners)
    out.push({ level: "warning", message: "OEM badge-ovi su uključeni ali lista partnera je prazna." });

  if (d.utm.enabled && !d.utm.source.trim())
    out.push({ level: "warning", message: "UTM source je prazan." });

  if (out.length === 0) out.push({ level: "info", message: "Sve provere uspešno prošle ✓" });
  return out;
}
