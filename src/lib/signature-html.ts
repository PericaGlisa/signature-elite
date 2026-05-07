import { EKO_LOGO_BASE64 } from "./logo-base64";
import type { SignatureData } from "./signature-types";
import { withUtm } from "./utm";

const NAVY = "#2A3F8F";
const NAVY_DEEP = "#1B2A6B";
const GREEN = "#3FA055";
const GREEN_DEEP = "#2F7D40";
const MUTED = "#6B7280";
const TEXT = "#1F2937";
const BORDER = "#E5E7EB";
const SOFT_BG = "#F9FAFB";

const ICON = {
  phone: "https://api.iconify.design/material-symbols/call-outline-rounded.svg?color=%232A3F8F",
  mobile: "https://api.iconify.design/material-symbols/smartphone-outline.svg?color=%232A3F8F",
  email: "https://api.iconify.design/material-symbols/mail-outline-rounded.svg?color=%232A3F8F",
  web: "https://api.iconify.design/material-symbols/language.svg?color=%232A3F8F",
  pin: "https://api.iconify.design/material-symbols/location-on-outline-rounded.svg?color=%232A3F8F",
  warehouse:
    "https://api.iconify.design/material-symbols/warehouse-outline-rounded.svg?color=%232A3F8F",
  whatsapp: "https://api.iconify.design/ic/baseline-whatsapp.svg?color=%233FA055",
  linkedin: "https://api.iconify.design/mdi/linkedin.svg?color=%232A3F8F",
  instagram: "https://api.iconify.design/mdi/instagram.svg?color=%232A3F8F",
  facebook: "https://api.iconify.design/mdi/facebook.svg?color=%232A3F8F",
  youtube: "https://api.iconify.design/mdi/youtube.svg?color=%232A3F8F",
  calendar: "https://api.iconify.design/material-symbols/calendar-month-outline-rounded.svg?color=%232A3F8F",
};

function contactRow(iconUrl: string, content: string) {
  return `<tr>
    <td style="padding:5px 12px 5px 0;vertical-align:middle;width:22px;line-height:0;">
      <img src="${iconUrl}" width="20" height="20" alt="" style="display:block;border:0;opacity:0.95;" />
    </td>
    <td style="padding:5px 0;vertical-align:middle;font-family:Inter,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:${TEXT};letter-spacing:0.1px;">
      ${content}
    </td>
  </tr>`;
}

function socialBadge(url: string, iconUrl: string, alt: string) {
  return `<a href="${url}" aria-label="${alt}" title="${alt}" style="display:inline-block;text-decoration:none;margin-right:10px;line-height:0;" target="_blank" rel="noopener"><img src="${iconUrl}" width="22" height="22" alt="${alt}" style="display:inline-block;border:0;vertical-align:middle;" /></a>`;
}


export function buildSignatureHtml(d: SignatureData, qrDataUrl?: string): string {
  const phoneClean = (n: string) => n.replace(/[^\d+]/g, "");
  const wa = d.whatsapp ? phoneClean(d.whatsapp).replace(/^\+/, "") : "";
  const logoSrc = d.logoUrl && d.logoUrl.trim() !== "" ? d.logoUrl : EKO_LOGO_BASE64;

  const socialHtml = [
    d.social.linkedin && socialBadge(withUtm(d.social.linkedin, d, "linkedin"), ICON.linkedin, "LinkedIn"),
    d.social.instagram && socialBadge(withUtm(d.social.instagram, d, "instagram"), ICON.instagram, "Instagram"),
    d.social.facebook && socialBadge(withUtm(d.social.facebook, d, "facebook"), ICON.facebook, "Facebook"),
    d.social.youtube && socialBadge(withUtm(d.social.youtube, d, "youtube"), ICON.youtube, "YouTube"),
  ]
    .filter(Boolean)
    .join("");

  // Identity column
  const photoBlock = d.photoUrl
    ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-bottom:14px;"><tr><td style="line-height:0;">
        <img src="${d.photoUrl}" width="76" height="76" alt="${d.fullName}" style="display:block;border-radius:50%;border:2px solid ${GREEN};object-fit:cover;" />
      </td></tr></table>`
    : "";

  // OEM / partner trust badges
  const oemBlock =
    d.showOemBadges && d.oemPartners
      ? `<div style="margin-top:10px;font-family:Inter,Arial,sans-serif;font-size:10px;color:${MUTED};letter-spacing:0.2px;line-height:1.5;">
          <span style="display:block;margin-bottom:4px;">${d.oemLabel || "Partner brendovi:"}</span>
          ${d.oemPartners
            .split(",")
            .map((p) => p.trim())
            .filter(Boolean)
            .map(
              (p) =>
                `<span style="display:inline-block;background:${SOFT_BG};border:1px solid ${BORDER};border-radius:4px;padding:2px 6px;margin-right:4px;margin-bottom:4px;font-size:10px;font-weight:600;color:${NAVY_DEEP};white-space:nowrap;">${p}</span>`,
            )
            .join("")}
        </div>`
      : "";

  // Web links — multiple
  const webContent = [
    d.website &&
      `<a href="${withUtm(`https://${d.website.replace(/^https?:\/\//, "")}`, d, "website")}" style="color:${TEXT};text-decoration:none;">${d.website}</a>`,
    d.website2 &&
      `<a href="${withUtm(`https://${d.website2.replace(/^https?:\/\//, "")}`, d, "website2")}" style="color:${TEXT};text-decoration:none;">${d.website2}</a>`,
  ]
    .filter(Boolean)
    .join(`<span style="color:${BORDER};margin:0 8px;">|</span>`);

  // Primary CTA
  const ctaBlock =
    d.showCta && d.ctaLabel && d.ctaUrl
      ? `<tr><td style="padding-top:14px;">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:separate;"><tr>
            <td style="background:${GREEN_DEEP};border-radius:6px;">
              <a href="${withUtm(d.ctaUrl, d, "cta")}" style="display:inline-block;padding:9px 18px;font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.4px;text-transform:uppercase;">
                ${d.ctaLabel}&nbsp;&nbsp;→
              </a>
            </td>
          </tr></table>
        </td></tr>`
      : "";

  const bannerAlt = d.bannerLink ? "Promotivni banner" : "Banner";
  const bannerBlock =
    d.showBanner && d.bannerUrl
      ? `<tr><td style="padding-top:16px;">
        ${d.bannerLink ? `<a href="${withUtm(d.bannerLink, d, "banner")}" target="_blank" rel="noopener" aria-label="${bannerAlt}">` : ""}
        <img src="${d.bannerUrl}" alt="${bannerAlt}" style="display:block;max-width:420px;width:100%;height:auto;border-radius:8px;border:0;" />
        ${d.bannerLink ? `</a>` : ""}
      </td></tr>`
      : "";

  return `<!--[if !mso]><!-->
<style type="text/css">
  @media screen and (max-width:520px) {
    .eko-sig-root { width:100%!important; }
    .eko-sig-left { display:block!important; width:100%!important; max-width:100%!important; min-width:0!important; border-right:none!important; border-bottom:1px solid ${BORDER}!important; padding-right:0!important; padding-bottom:14px!important; margin-bottom:14px!important; text-align:center!important; }
    .eko-sig-right { display:block!important; width:100%!important; padding-left:0!important; }
    .eko-sig-left img { margin:0 auto; }
    .eko-sig-cta { display:block!important; text-align:center!important; }
  }
</style>
<!--<![endif]-->
<table cellpadding="0" cellspacing="0" border="0" role="presentation" class="eko-sig-root" style="border-collapse:collapse;font-family:Inter,Arial,Helvetica,sans-serif;background:#ffffff;width:100%;max-width:620px;">
  <tr><td style="padding:0;">

    <!-- TOP ACCENT BAR -->
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;">
      <tr><td style="height:3px;background:${NAVY};line-height:0;font-size:0;">&nbsp;</td>
          <td style="height:3px;width:80px;background:${GREEN};line-height:0;font-size:0;">&nbsp;</td></tr>
    </table>

    <!-- MAIN BODY -->
    <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;padding:18px 0 4px 0;">
      <tr><td style="padding-top:18px;">
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;">
          <tr>
            <!-- LEFT: Logo -->
            <td class="eko-sig-left" style="padding-right:18px;vertical-align:top;border-right:1px solid ${BORDER};width:30%;min-width:140px;max-width:180px;">
              <img src="${logoSrc}" width="160" alt="${d.company}" style="display:block;border:0;max-width:100%;height:auto;" />
            </td>

            <!-- RIGHT: Identity + Contact -->
            <td class="eko-sig-right" style="padding-left:18px;vertical-align:top;width:70%;">
              ${photoBlock}

              <div style="font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:700;color:${NAVY_DEEP};line-height:1.15;letter-spacing:-0.4px;">
                ${d.fullName}
              </div>
              <div style="font-family:Inter,Arial,sans-serif;font-size:11px;font-weight:600;color:${GREEN_DEEP};letter-spacing:1.6px;text-transform:uppercase;margin-top:6px;">
                ${d.position}
              </div>
              <div style="font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;color:${NAVY};margin-top:8px;letter-spacing:0.1px;">
                ${d.company}
              </div>
              ${oemBlock}

              <!-- Divider -->
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;margin:14px 0 10px 0;">
                <tr><td style="height:1px;background:${BORDER};line-height:0;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Contact -->
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
                ${d.phone ? contactRow(ICON.phone, `<a href="tel:${phoneClean(d.phone)}" style="color:${TEXT};text-decoration:none;"><strong style="font-weight:600;color:${NAVY_DEEP};">T</strong>&nbsp;&nbsp;${d.phone}</a>`) : ""}
                ${d.mobile ? contactRow(ICON.mobile, `<a href="tel:${phoneClean(d.mobile)}" style="color:${TEXT};text-decoration:none;"><strong style="font-weight:600;color:${NAVY_DEEP};">M</strong>&nbsp;&nbsp;${d.mobile}</a>`) : ""}
                ${wa ? contactRow(ICON.whatsapp, `<a href="https://wa.me/${wa}" style="color:${TEXT};text-decoration:none;">WhatsApp&nbsp;&nbsp;${d.whatsapp}</a>`) : ""}
                ${d.email ? contactRow(ICON.email, `<a href="mailto:${d.email}" style="color:${GREEN_DEEP};text-decoration:none;font-weight:600;">${d.email}</a>`) : ""}
                ${webContent ? contactRow(ICON.web, webContent) : ""}
                ${d.address || d.city ? contactRow(ICON.pin, `${d.address}${d.address && d.city ? ", " : ""}${d.city}`) : ""}
                ${d.warehouse || d.warehouseCity ? contactRow(ICON.warehouse, `<span style="color:${MUTED};font-size:11px;letter-spacing:0.3px;font-weight:600;">Veleprodaja i magacin:</span>&nbsp;${d.warehouse}${d.warehouse && d.warehouseCity ? ", " : ""}${d.warehouseCity}`) : ""}
              </table>

              <!-- Booking / Calendly -->
              ${d.showBooking && d.bookingUrl
                ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:14px;"><tr>
                    <td style="padding:5px 12px 5px 0;vertical-align:middle;width:22px;line-height:0;">
                      <img src="${ICON.calendar}" width="20" height="20" alt="" style="display:block;border:0;opacity:0.95;" />
                    </td>
                    <td style="padding:5px 0;vertical-align:middle;font-family:Inter,Arial,Helvetica,sans-serif;font-size:13px;line-height:1.45;color:${TEXT};letter-spacing:0.1px;">
                      <a href="${withUtm(d.bookingUrl, d, "booking")}" style="color:${NAVY_DEEP};text-decoration:none;font-weight:600;">${d.bookingLabel || "Zakaži konsultaciju"}</a>
                    </td>
                  </tr></table>`
                : ""}

              <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
                ${ctaBlock}
                ${d.showSocial && socialHtml ? `<tr><td style="padding-top:14px;">${socialHtml}</td></tr>` : ""}
                ${bannerBlock}
              </table>
            </td>
          </tr>
        </table>
      </td></tr>
    </table>

  </td></tr>
</table>`;
}

export function buildVCard(d: SignatureData): string {
  const parts = d.fullName.trim().split(/\s+/);
  const first = parts[0] ?? "";
  const last = parts.slice(1).join(" ");
  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${d.fullName}`,
    `N:${last};${first};;;`,
    `ORG:${d.company}`,
    `TITLE:${d.position}`,
    d.phone && `TEL;TYPE=WORK,VOICE:${d.phone}`,
    d.mobile && `TEL;TYPE=CELL:${d.mobile}`,
    d.email && `EMAIL;TYPE=WORK:${d.email}`,
    d.website && `URL:https://${d.website.replace(/^https?:\/\//, "")}`,
    d.website2 && `URL:https://${d.website2.replace(/^https?:\/\//, "")}`,
    (d.address || d.city) && `ADR;TYPE=WORK:;;${d.address};${d.city};;;`,
    "END:VCARD",
  ].filter(Boolean);
  return lines.join("\r\n");
}
