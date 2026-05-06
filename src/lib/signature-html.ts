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
  star: "https://api.iconify.design/material-symbols/star-rounded.svg?color=%23F59E0B",
  certificate: "https://api.iconify.design/material-symbols/verified-outline-rounded.svg?color=%233FA055",
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
  const waMessage = d.whatsappMessage ? encodeURIComponent(d.whatsappMessage) : "";
  const logoSrc = d.logoUrl && d.logoUrl.trim() !== "" ? d.logoUrl : EKO_LOGO_BASE64;

  // vCard download data URI
  const vcardStr = buildVCard(d);
  const vcardBase64 = btoa(
    encodeURIComponent(vcardStr).replace(
      /%([0-9A-F]{2})/g,
      (_, p1) => String.fromCharCode(Number.parseInt(p1, 16)),
    ),
  );
  const vcardDataUrl = `data:text/vcard;charset=utf-8;base64,${vcardBase64}`;

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

  const sloganBlock = d.slogan
    ? `<div style="font-family:Georgia,'Times New Roman',serif;font-style:italic;font-size:12.5px;color:${GREEN_DEEP};margin-top:6px;letter-spacing:0.2px;">"${d.slogan}"</div>`
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

  // Secondary CTA
  const secondaryCtaBlock =
    d.showSecondaryCta && d.secondaryCtaLabel && d.secondaryCtaUrl
      ? `<tr><td style="padding-top:10px;">
          <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:separate;"><tr>
            <td style="background:#ffffff;border:1.5px solid ${GREEN_DEEP};border-radius:6px;">
              <a href="${withUtm(d.secondaryCtaUrl, d, "secondary-cta")}" style="display:inline-block;padding:8px 16px;font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:600;color:${GREEN_DEEP};text-decoration:none;letter-spacing:0.4px;text-transform:uppercase;">
                ${d.secondaryCtaLabel}&nbsp;&nbsp;→
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

  const disclaimer =
    d.showDisclaimer && d.legalDisclaimer
      ? `<tr><td style="padding-top:14px;">
        <div style="font-family:Inter,Arial,sans-serif;font-size:9.5px;line-height:1.55;color:${MUTED};max-width:540px;letter-spacing:0.1px;">
          ${d.legalDisclaimer}
        </div>
      </td></tr>`
      : "";

  // QR block (compact, lives next to logo)
  const qrBlock =
    d.showQr && qrDataUrl
      ? `<div style="margin-top:14px;padding:8px;background:#ffffff;border:1px solid ${BORDER};border-radius:8px;display:inline-block;">
          <img src="${qrDataUrl}" width="84" height="84" alt="vCard QR" style="display:block;" />
          <div style="font-family:Inter,Arial,sans-serif;font-size:8px;color:${MUTED};text-align:center;margin-top:4px;letter-spacing:1px;text-transform:uppercase;font-weight:600;">Skeniraj vCard</div>
        </div>`
      : "";

  // vCard download button
  const vcardDownloadBlock = `<div style="margin-top:14px;">
    <a href="${vcardDataUrl}" style="display:inline-block;padding:7px 14px;background:${GREEN_DEEP};border-radius:6px;font-family:Inter,Arial,sans-serif;font-size:11px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:0.3px;text-transform:uppercase;">
      Sačuvaj kontakt ↓
    </a>
  </div>`;

  // Department / position line
  const positionLine =
    d.position +
    (d.department ? ` <span style="color:${MUTED};font-weight:400;">· ${d.department}</span>` : "");

  return `<!--[if !mso]><!-->
<style type="text/css">
  @media screen and (max-width:520px) {
    .eko-sig-root { width:100%!important; }
    .eko-sig-left { display:block!important; width:100%!important; max-width:100%!important; min-width:0!important; border-right:none!important; border-bottom:1px solid ${BORDER}!important; padding-right:0!important; padding-bottom:14px!important; margin-bottom:14px!important; text-align:center!important; }
    .eko-sig-right { display:block!important; width:100%!important; padding-left:0!important; }
    .eko-sig-left img { margin:0 auto; }
    .eko-sig-qr { margin:14px auto 0 auto!important; }
    .eko-sig-vcard { text-align:center!important; }
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
            <!-- LEFT: Logo + QR + vCard -->
            <td class="eko-sig-left" style="padding-right:18px;vertical-align:top;border-right:1px solid ${BORDER};width:30%;min-width:140px;max-width:180px;">
              <img src="${logoSrc}" width="160" alt="${d.company}" style="display:block;border:0;max-width:100%;height:auto;" />
              ${qrBlock ? `<div class="eko-sig-qr">${qrBlock}</div>` : qrBlock}
              <div class="eko-sig-vcard">${vcardDownloadBlock}</div>
            </td>

            <!-- RIGHT: Identity + Contact -->
            <td class="eko-sig-right" style="padding-left:18px;vertical-align:top;width:70%;">
              ${photoBlock}

              <div style="font-family:Inter,Arial,sans-serif;font-size:20px;font-weight:700;color:${NAVY_DEEP};line-height:1.15;letter-spacing:-0.4px;">
                ${d.fullName}
              </div>
              <div style="font-family:Inter,Arial,sans-serif;font-size:11px;font-weight:600;color:${GREEN_DEEP};letter-spacing:1.6px;text-transform:uppercase;margin-top:6px;">
                ${positionLine}
              </div>
              <div style="font-family:Inter,Arial,sans-serif;font-size:13px;font-weight:600;color:${NAVY};margin-top:8px;letter-spacing:0.1px;">
                ${d.company}
              </div>
              ${sloganBlock}
              ${oemBlock}

              <!-- Divider -->
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" width="100%" style="border-collapse:collapse;margin:14px 0 10px 0;">
                <tr><td style="height:1px;background:${BORDER};line-height:0;font-size:0;">&nbsp;</td></tr>
              </table>

              <!-- Contact -->
              <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
                ${d.phone ? contactRow(ICON.phone, `<a href="tel:${phoneClean(d.phone)}" style="color:${TEXT};text-decoration:none;"><strong style="font-weight:600;color:${NAVY_DEEP};">T</strong>&nbsp;&nbsp;${d.phone}</a>`) : ""}
                ${d.mobile ? contactRow(ICON.mobile, `<a href="tel:${phoneClean(d.mobile)}" style="color:${TEXT};text-decoration:none;"><strong style="font-weight:600;color:${NAVY_DEEP};">M</strong>&nbsp;&nbsp;${d.mobile}</a>`) : ""}
                ${wa ? contactRow(ICON.whatsapp, `<a href="https://wa.me/${wa}${waMessage ? `?text=${waMessage}` : ""}" style="color:${TEXT};text-decoration:none;">WhatsApp&nbsp;&nbsp;${d.whatsapp}</a>`) : ""}
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

              <!-- Social proof row -->
              ${d.showSocialProof && (d.ratingText || d.certificates)
                ? `<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;margin-top:14px;"><tr><td>
                    <div style="display:inline-block;font-family:Inter,Arial,sans-serif;font-size:11px;color:${MUTED};line-height:1.4;">
                      ${d.ratingText
                        ? `<span style="display:inline-block;background:${SOFT_BG};border:1px solid ${BORDER};border-radius:4px;padding:3px 8px;margin-right:6px;white-space:nowrap;">
                            <img src="${ICON.star}" width="12" height="12" alt="" style="display:inline-block;vertical-align:middle;margin-right:3px;border:0;" />
                            <span style="color:${TEXT};font-weight:600;vertical-align:middle;">${d.ratingText}</span>
                          </span>`
                        : ""}
                      ${d.certificates
                        ? d.certificates.split(",").map(c => c.trim()).filter(Boolean).map(c =>
                            `<span style="display:inline-block;background:${SOFT_BG};border:1px solid ${BORDER};border-radius:4px;padding:3px 8px;margin-right:6px;margin-top:4px;white-space:nowrap;">
                              <img src="${ICON.certificate}" width="12" height="12" alt="" style="display:inline-block;vertical-align:middle;margin-right:3px;border:0;" />
                              <span style="color:${TEXT};font-weight:600;vertical-align:middle;">${c}</span>
                            </span>`
                          ).join("")
                        : ""}
                    </div>
                  </td></tr></table>`
                : ""}

              <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
                ${ctaBlock}
                ${secondaryCtaBlock}
                ${d.showSocial && socialHtml ? `<tr><td style="padding-top:14px;">${socialHtml}</td></tr>` : ""}
                ${bannerBlock}
              </table>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- Disclaimer (full width below) -->
      <tr><td>
        <table cellpadding="0" cellspacing="0" border="0" role="presentation" style="border-collapse:collapse;">
          ${disclaimer}
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
