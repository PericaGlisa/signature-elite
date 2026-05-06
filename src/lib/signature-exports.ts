import type { SignatureData } from "./signature-types";
import { buildSignatureHtml } from "./signature-html";

/** Outlook desktop expects an .htm file with proper meta + Word-friendly wrapping. */
export function buildOutlookHtm(d: SignatureData, qrDataUrl?: string): string {
  const inner = buildSignatureHtml(d, qrDataUrl);
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
<meta name="Generator" content="EKO Studio za potpise" />
<title>${d.fullName} — Email potpis</title>
<!--[if gte mso 9]>
<xml>
  <o:OfficeDocumentSettings>
    <o:AllowPNG/>
    <o:PixelsPerInch>96</o:PixelsPerInch>
  </o:OfficeDocumentSettings>
</xml>
<![endif]-->
<style type="text/css">
  body { margin:0; padding:0; -webkit-text-size-adjust:100%; -ms-text-size-adjust:100%; }
  table, td { mso-table-lspace:0pt; mso-table-rspace:0pt; border-collapse:collapse; }
  img { -ms-interpolation-mode:bicubic; border:0; outline:none; text-decoration:none; }
  a { text-decoration:none; }
</style>
</head>
<body>
${inner}
</body>
</html>`;
}

/** Gmail-friendly "flat": strips comments + minifies whitespace.
 *  Gmail strips most CSS classes but inline styles are preserved. */
export function buildGmailFlatHtml(d: SignatureData, qrDataUrl?: string): string {
  return buildSignatureHtml(d, qrDataUrl)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n\s+/g, "\n")
    .trim();
}
