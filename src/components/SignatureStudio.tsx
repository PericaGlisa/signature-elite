import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  User,
  Briefcase,
  Phone,
  Globe,
  Image as ImageIcon,
  Share2,
  Copy,
  Download,
  FileCode,
  Contact,
  CheckCircle2,
  Snowflake,
  Mail,
  Smartphone,
  Eye,
  BarChart3,
  ShieldCheck,
  AlertTriangle,
  Info,
  Calendar,
  Star,
} from "lucide-react";
import { DEFAULT_SIGNATURE, type SignatureData } from "@/lib/signature-types";
import { buildSignatureHtml, buildVCard } from "@/lib/signature-html";
import { buildOutlookHtm, buildGmailFlatHtml } from "@/lib/signature-exports";
import { runQualityChecks } from "@/lib/signature-quality";
import { resolveCampaign, withUtm } from "@/lib/utm";


export function SignatureStudio() {
  const [data, setData] = useState<SignatureData>(DEFAULT_SIGNATURE);
  const [qr, setQr] = useState<string | undefined>(undefined);
  const previewRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const update = <K extends keyof SignatureData>(k: K, v: SignatureData[K]) =>
    setData((p) => ({ ...p, [k]: v }));

  const updateSocial = (k: keyof SignatureData["social"], v: string) =>
    setData((p) => ({ ...p, social: { ...p.social, [k]: v } }));

  // Generate QR (vCard)
  useEffect(() => {
    if (!data.showQr) {
      setQr(undefined);
      return;
    }
    const vcard = buildVCard(data);
    import("qrcode")
      .then((mod) => {
        const QRCode = (mod as { default?: typeof import("qrcode") }).default ?? mod;
        return (QRCode as typeof import("qrcode")).toDataURL(vcard, {
          margin: 0,
          width: 200,
          color: { dark: "#1B2A6B", light: "#ffffff" },
          errorCorrectionLevel: "M",
        });
      })
      .then(setQr)
      .catch(() => setQr(undefined));
  }, [data]);

  const html = useMemo(() => buildSignatureHtml(data, qr), [data, qr]);

  const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const fullHtml = useMemo(() => {
    const intro = data.showIntroMessage
      ? (data.introText ?? "")
          .split("\n")
          .map(
            (l) =>
              `<p style="margin:0 0 12px 0;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.55;color:#1F2937;">${escapeHtml(l) || "&nbsp;"}</p>`,
          )
          .join("")
      : "";
    const closing =
      data.showIntroMessage && data.closingText
        ? `<p style="margin:0 0 14px 0;font-family:Inter,Arial,sans-serif;font-size:14px;line-height:1.55;color:#1F2937;">${escapeHtml(data.closingText)}</p>`
        : "";
    return `<div>${intro}${closing}${html}</div>`;
  }, [data, html]);

  const flash = (label: string) => {
    setCopied(label);
    setTimeout(() => setCopied(null), 1800);
  };

  const copyHtml = async () => {
    await navigator.clipboard.writeText(fullHtml);
    toast.success("HTML (poruka + potpis) kopiran");
    flash("html");
  };

  const copyRich = async () => {
    try {
      const plain = data.showIntroMessage
        ? `${data.introText ?? ""}\n\n${data.closingText ?? ""}\n\n${previewRef.current?.innerText ?? ""}`
        : (previewRef.current?.innerText ?? "");
      const blob = new Blob([fullHtml], { type: "text/html" });
      const text = new Blob([plain], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob, "text/plain": text }),
      ]);
      toast.success("Poruka + potpis kopirani — nalepi direktno u email");
      flash("rich");
    } catch {
      toast.error("Pretraživač ne podržava rich copy. Koristi 'Kopiraj HTML'.");
    }
  };

  const downloadHtml = () => {
    const file = `<!doctype html><html><head><meta charset="utf-8"><title>Email potpis</title></head><body>${html}</body></html>`;
    const blob = new Blob([file], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eko-potpis-${data.fullName.toLowerCase().replace(/\s+/g, "-")}.html`;
    a.click();
    toast.success("HTML fajl preuzet");
  };

  const downloadPng = async () => {
    if (!previewRef.current) return;
    try {
      const { toPng } = await import("html-to-image");
      const png = await toPng(previewRef.current, {
        pixelRatio: 2,
        backgroundColor: "#ffffff",
      });
      const a = document.createElement("a");
      a.href = png;
      a.download = `eko-potpis-${data.fullName.toLowerCase().replace(/\s+/g, "-")}.png`;
      a.click();
      toast.success("PNG slika preuzeta");
    } catch {
      toast.error("Greška pri generisanju slike");
    }
  };

  const downloadVCard = () => {
    const vcard = buildVCard(data);
    const blob = new Blob([vcard], { type: "text/vcard" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${data.fullName.replace(/\s+/g, "-")}.vcf`;
    a.click();
    toast.success("vCard preuzet");
  };

  const downloadOutlook = () => {
    const file = buildOutlookHtm(data, qr);
    const blob = new Blob([file], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `eko-potpis-${data.fullName.toLowerCase().replace(/\s+/g, "-")}-outlook.htm`;
    a.click();
    toast.success("Outlook .htm fajl preuzet");
  };

  const copyGmailFlat = async () => {
    const flat = buildGmailFlatHtml(data, qr);
    try {
      const blob = new Blob([flat], { type: "text/html" });
      const text = new Blob([previewRef.current?.innerText ?? ""], { type: "text/plain" });
      await navigator.clipboard.write([
        new ClipboardItem({ "text/html": blob, "text/plain": text }),
      ]);
      toast.success("Gmail-flat verzija kopirana");
      flash("gmail");
    } catch {
      await navigator.clipboard.writeText(flat);
      toast.success("Gmail HTML kopiran (kao tekst)");
    }
  };

  const qualityIssues = useMemo(() => runQualityChecks(data), [data]);
  const errorCount = qualityIssues.filter((i) => i.level === "error").length;
  const warnCount = qualityIssues.filter((i) => i.level === "warning").length;

  const handleImageUpload =
    (field: "photoUrl" | "bannerUrl" | "logoUrl") => (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 800 * 1024) {
        toast.error("Slika je veća od 800KB. Optimizuj je pre upload-a.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => update(field, reader.result as string);
      reader.readAsDataURL(file);
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,440px)_1fr] gap-4 sm:gap-6 lg:gap-8">
      {/* LEFT — FORM */}
      <Card className="p-0 overflow-hidden border-border/60 shadow-[var(--shadow-soft)] bg-card self-start">
        <Accordion type="multiple" defaultValue={["identity", "contact"]} className="px-2 pt-2">
          <AccordionItem value="identity" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="font-medium">Identitet</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="Ime i prezime">
                <Input value={data.fullName} onChange={(e) => update("fullName", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Pozicija">
                  <Input
                    value={data.position}
                    onChange={(e) => update("position", e.target.value)}
                  />
                </Field>
                <Field label="Sektor">
                  <Input
                    value={data.department ?? ""}
                    onChange={(e) => update("department", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Kompanija">
                <Input value={data.company} onChange={(e) => update("company", e.target.value)} />
              </Field>
              <Field label="Slogan (opciono)">
                <Input
                  value={data.slogan ?? ""}
                  onChange={(e) => update("slogan", e.target.value)}
                />
              </Field>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/40">
                <div>
                  <div className="text-sm font-medium">OEM / partner badge-ovi</div>
                  <div className="text-xs text-muted-foreground">
                    Bitzer, Danfoss, Alfa Laval...
                  </div>
                </div>
                <Switch
                  checked={data.showOemBadges}
                  onCheckedChange={(v) => update("showOemBadges", v)}
                />
              </div>
              {data.showOemBadges && (
                <>
                  <Field label="Naslov badge-ova">
                    <Input
                      value={data.oemLabel ?? ""}
                      onChange={(e) => update("oemLabel", e.target.value)}
                    />
                  </Field>
                  <Field label="Partner brendovi (odvojeni zarezom)">
                    <Input
                      value={data.oemPartners ?? ""}
                      onChange={(e) => update("oemPartners", e.target.value)}
                    />
                  </Field>
                </>
              )}

              <Field label="Foto / avatar (URL ili upload)">
                <div className="space-y-2">
                  <Input
                    placeholder="https://..."
                    value={data.photoUrl ?? ""}
                    onChange={(e) => update("photoUrl", e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload("photoUrl")}
                    className="text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-navy/10 file:text-brand-navy file:font-medium hover:file:bg-brand-navy/20"
                  />
                </div>
              </Field>
              <Field label="Logotip kompanije (URL ili upload — prazno = default EKO logo)">
                <div className="space-y-2">
                  <Input
                    placeholder="https://..."
                    value={data.logoUrl ?? ""}
                    onChange={(e) => update("logoUrl", e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload("logoUrl")}
                    className="text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-green/10 file:text-brand-green-deep file:font-medium hover:file:bg-brand-green/20"
                  />
                  {data.logoUrl && (
                    <button
                      type="button"
                      onClick={() => update("logoUrl", "")}
                      className="text-[11px] text-brand-green-deep underline"
                    >
                      Vrati default EKO logo
                    </button>
                  )}
                </div>
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green-deep flex items-center justify-center">
                  <Phone className="w-4 h-4" />
                </div>
                <span className="font-medium">Kontakt</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Telefon">
                  <Input value={data.phone} onChange={(e) => update("phone", e.target.value)} />
                </Field>
                <Field label="Mobilni">
                  <Input
                    value={data.mobile ?? ""}
                    onChange={(e) => update("mobile", e.target.value)}
                  />
                </Field>
              </div>
              <Field label="WhatsApp / Viber">
                <Input
                  value={data.whatsapp ?? ""}
                  onChange={(e) => update("whatsapp", e.target.value)}
                />
              </Field>
              <Field label="WhatsApp poruka (auto-popuna)">
                <Textarea
                  rows={2}
                  value={data.whatsappMessage ?? ""}
                  onChange={(e) => update("whatsappMessage", e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground mt-1">
                  Klik na WhatsApp link otvara chat sa već unetom porukom.
                </p>
              </Field>
              <Field label="Email">
                <Input value={data.email} onChange={(e) => update("email", e.target.value)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Web sajt 1">
                  <Input value={data.website} onChange={(e) => update("website", e.target.value)} />
                </Field>
                <Field label="Web sajt 2 (opciono)">
                  <Input
                    value={data.website2 ?? ""}
                    onChange={(e) => update("website2", e.target.value)}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-[2fr_3fr] gap-3">
                <Field label="Sedište – adresa">
                  <Input value={data.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
                <Field label="Sedište – grad / država">
                  <Input value={data.city} onChange={(e) => update("city", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-[2fr_3fr] gap-3">
                <Field label="Magacin – adresa">
                  <Input
                    value={data.warehouse ?? ""}
                    onChange={(e) => update("warehouse", e.target.value)}
                  />
                </Field>
                <Field label="Magacin – grad / država">
                  <Input
                    value={data.warehouseCity ?? ""}
                    onChange={(e) => update("warehouseCity", e.target.value)}
                  />
                </Field>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="message" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Tekst poruke (uvod)</span>
                </div>
                <SectionSwitch
                  checked={data.showIntroMessage}
                  onCheckedChange={(v) => update("showIntroMessage", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="Uvodni tekst (telo emaila iznad potpisa)">
                <Textarea
                  rows={5}
                  value={data.introText ?? ""}
                  onChange={(e) => update("introText", e.target.value)}
                />
              </Field>
              <Field label="Završni pozdrav">
                <Input
                  value={data.closingText ?? ""}
                  onChange={(e) => update("closingText", e.target.value)}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="cta" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green-deep flex items-center justify-center">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <span className="font-medium">CTA dugmad</span>
                </div>
                <SectionSwitch
                  checked={data.showCta}
                  onCheckedChange={(v) => update("showCta", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="Primarno CTA — tekst">
                <Input
                  value={data.ctaLabel ?? ""}
                  onChange={(e) => update("ctaLabel", e.target.value)}
                />
              </Field>
              <Field label="Primarno CTA — link">
                <Input
                  value={data.ctaUrl ?? ""}
                  onChange={(e) => update("ctaUrl", e.target.value)}
                />
              </Field>

              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/40">
                <div>
                  <div className="text-sm font-medium">Sekundarni CTA</div>
                  <div className="text-xs text-muted-foreground">
                    Lead magnet za hladne primaoce
                  </div>
                </div>
                <Switch
                  checked={data.showSecondaryCta}
                  onCheckedChange={(v) => update("showSecondaryCta", v)}
                />
              </div>
              {data.showSecondaryCta && (
                <>
                  <Field label="Sekundarni CTA — tekst">
                    <Input
                      value={data.secondaryCtaLabel ?? ""}
                      onChange={(e) => update("secondaryCtaLabel", e.target.value)}
                    />
                  </Field>
                  <Field label="Sekundarni CTA — link">
                    <Input
                      value={data.secondaryCtaUrl ?? ""}
                      onChange={(e) => update("secondaryCtaUrl", e.target.value)}
                    />
                  </Field>
                </>
              )}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="banner" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Banner / promocija</span>
                </div>
                <SectionSwitch
                  checked={data.showBanner}
                  onCheckedChange={(v) => update("showBanner", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="Banner slika (URL ili upload)">
                <div className="space-y-2">
                  <Input
                    placeholder="https://..."
                    value={data.bannerUrl ?? ""}
                    onChange={(e) => update("bannerUrl", e.target.value)}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload("bannerUrl")}
                    className="text-xs text-muted-foreground file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:bg-brand-navy/10 file:text-brand-navy file:font-medium hover:file:bg-brand-navy/20"
                  />
                </div>
              </Field>
              <Field label="Banner link (klikom vodi na...)">
                <Input
                  value={data.bannerLink ?? ""}
                  onChange={(e) => update("bannerLink", e.target.value)}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="social" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <Share2 className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Društvene mreže</span>
                </div>
                <SectionSwitch
                  checked={data.showSocial}
                  onCheckedChange={(v) => update("showSocial", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="LinkedIn">
                <Input
                  value={data.social.linkedin ?? ""}
                  onChange={(e) => updateSocial("linkedin", e.target.value)}
                />
              </Field>
              <Field label="Instagram">
                <Input
                  value={data.social.instagram ?? ""}
                  onChange={(e) => updateSocial("instagram", e.target.value)}
                />
              </Field>
              <Field label="Facebook">
                <Input
                  value={data.social.facebook ?? ""}
                  onChange={(e) => updateSocial("facebook", e.target.value)}
                />
              </Field>
              <Field label="YouTube">
                <Input
                  value={data.social.youtube ?? ""}
                  onChange={(e) => updateSocial("youtube", e.target.value)}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="booking" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Booking / Calendly</span>
                </div>
                <SectionSwitch
                  checked={data.showBooking}
                  onCheckedChange={(v) => update("showBooking", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="Booking link (Calendly, SavvyCal, Microsoft Booking...)">
                <Input
                  placeholder="https://calendly.com/eko-elektrofrigo..."
                  value={data.bookingUrl ?? ""}
                  onChange={(e) => update("bookingUrl", e.target.value)}
                />
              </Field>
              <Field label="Tekst linka">
                <Input
                  value={data.bookingLabel ?? ""}
                  onChange={(e) => update("bookingLabel", e.target.value)}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="social-proof" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green-deep flex items-center justify-center">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Social proof</span>
                </div>
                <SectionSwitch
                  checked={data.showSocialProof}
                  onCheckedChange={(v) => update("showSocialProof", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <Field label="Ocena / recenzije (npr. 4.9/5 — 120+ recenzija)">
                <Input
                  value={data.ratingText ?? ""}
                  onChange={(e) => update("ratingText", e.target.value)}
                />
              </Field>
              <Field label="Sertifikati (odvojeni zarezom)">
                <Input
                  placeholder="ISO 9001, HACCP, CE"
                  value={data.certificates ?? ""}
                  onChange={(e) => update("certificates", e.target.value)}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="extras" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-green/10 text-brand-green-deep flex items-center justify-center">
                    <Globe className="w-4 h-4" />
                  </div>
                  <span className="font-medium">QR & disclaimer</span>
                </div>
                <SectionSwitch
                  checked={data.showDisclaimer}
                  onCheckedChange={(v) => update("showDisclaimer", v)}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/40">
                <div>
                  <div className="text-sm font-medium">QR vCard kod</div>
                  <div className="text-xs text-muted-foreground">
                    Skeniraj telefonom — sačuvaj kontakt
                  </div>
                </div>
                <Switch checked={data.showQr} onCheckedChange={(v) => update("showQr", v)} />
              </div>
              <Field label="Pravni disclaimer">
                <Textarea
                  rows={4}
                  value={data.legalDisclaimer ?? ""}
                  onChange={(e) => update("legalDisclaimer", e.target.value)}
                />
              </Field>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="utm" className="border-border/60">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex flex-1 items-center justify-between gap-3 pr-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-navy/10 text-brand-navy flex items-center justify-center">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <span className="font-medium">Trackable linkovi (UTM)</span>
                </div>
                <SectionSwitch
                  checked={data.utm.enabled}
                  onCheckedChange={(v) => update("utm", { ...data.utm, enabled: v })}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4 space-y-3">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Automatski dodaje UTM parametre na sve linkove (web, CTA, banner, social) za
                praćenje u Google Analytics-u. Linkovi tipa <code>tel:</code>, <code>mailto:</code>{" "}
                i WhatsApp se preskaču.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="utm_source">
                  <Input
                    value={data.utm.source}
                    onChange={(e) => update("utm", { ...data.utm, source: e.target.value })}
                  />
                </Field>
                <Field label="utm_medium">
                  <Input
                    value={data.utm.medium}
                    onChange={(e) => update("utm", { ...data.utm, medium: e.target.value })}
                  />
                </Field>
              </div>
              <Field label={`utm_campaign (auto: ${resolveCampaign(data)})`}>
                <Input
                  placeholder="Ostavi prazno za auto-slug iz imena"
                  value={data.utm.campaign}
                  onChange={(e) => update("utm", { ...data.utm, campaign: e.target.value })}
                />
              </Field>
              <Field label="utm_term (opciono)">
                <Input
                  value={data.utm.term ?? ""}
                  onChange={(e) => update("utm", { ...data.utm, term: e.target.value })}
                />
              </Field>
              <div className="flex items-center justify-between rounded-lg border border-border/60 p-3 bg-muted/40">
                <div>
                  <div className="text-sm font-medium">Auto utm_content po linku</div>
                  <div className="text-xs text-muted-foreground">
                    cta, website, banner, linkedin…
                  </div>
                </div>
                <Switch
                  checked={data.utm.autoContent}
                  onCheckedChange={(v) => update("utm", { ...data.utm, autoContent: v })}
                />
              </div>
              {data.utm.enabled && data.ctaUrl && (
                <div className="rounded-md border border-border/60 bg-background p-3 text-[11px] font-mono break-all text-muted-foreground">
                  <div className="text-[10px] uppercase tracking-wider text-foreground/60 mb-1">
                    Primer CTA linka:
                  </div>
                  {withUtm(data.ctaUrl, data, "cta")}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </Card>

      {/* RIGHT — PREVIEW + EXPORT */}
      <div className="space-y-6">
        <Card className="overflow-hidden border-border/60 shadow-[var(--shadow-soft)]">
          <div className="px-6 py-4 border-b border-border/60 bg-[var(--gradient-frost)] flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium text-brand-navy-deep">
              <Eye className="w-4 h-4" />
              Live pregled
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-block w-2 h-2 rounded-full bg-brand-green animate-pulse" />
              Sinhronizovano
            </div>
          </div>

          {/* mock email frame */}
          <div className="bg-[oklch(0.96_0.01_240)] p-3 sm:p-6 lg:p-10">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-border/40 overflow-hidden">
              <div className="px-3 sm:px-6 py-2 sm:py-3 border-b border-border/40 flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FEBC2E]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#28C840]" />
                </div>
                <span className="ml-2 sm:ml-3 font-mono truncate">Re: Vaš upit za rashladnu opremu</span>
              </div>
              <div className="px-3 sm:px-6 py-3 sm:py-5 text-sm text-foreground/80 leading-relaxed overflow-x-auto">
                {data.showIntroMessage && (
                  <>
                    {(data.introText ?? "").split("\n").map((line, i) => (
                      <p key={i} className={i === 0 ? "" : "mt-3"}>
                        {line || "\u00A0"}
                      </p>
                    ))}
                    <p className="mt-4">{data.closingText}</p>
                  </>
                )}
                <div className="mt-3">
                  <div ref={previewRef} dangerouslySetInnerHTML={{ __html: html }} />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* EXPORT */}
        <Card className="border-border/60 shadow-[var(--shadow-soft)]">
          <Tabs defaultValue="export">
            <div className="px-6 pt-5 border-b border-border/60">
              <TabsList className="bg-muted/60">
                <TabsTrigger value="export">
                  <Download className="w-3.5 h-3.5 mr-1.5" />
                  Izvoz
                </TabsTrigger>
                <TabsTrigger value="code">
                  <FileCode className="w-3.5 h-3.5 mr-1.5" />
                  HTML kod
                </TabsTrigger>
                <TabsTrigger value="quality">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                  Kvalitet
                  {(errorCount + warnCount) > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-semibold bg-brand-green/20 text-brand-green-deep">
                      {errorCount + warnCount}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="install">
                  <Mail className="w-3.5 h-3.5 mr-1.5" />
                  Uputstva
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="export" className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <ExportBtn
                  icon={<Copy />}
                  label="Kopiraj formatiran"
                  hint="Nalepi direktno u Gmail / Outlook"
                  onClick={copyRich}
                  active={copied === "rich"}
                />
                <ExportBtn
                  icon={<Mail />}
                  label="Kopiraj za Gmail"
                  hint="Optimizovano (flat HTML)"
                  onClick={copyGmailFlat}
                  active={copied === "gmail"}
                />
                <ExportBtn
                  icon={<Download />}
                  label="Preuzmi za Outlook (.htm)"
                  hint="MSO-kompatibilan fajl"
                  onClick={downloadOutlook}
                />
                <ExportBtn
                  icon={<FileCode />}
                  label="Kopiraj HTML"
                  hint="Za napredne korisnike"
                  onClick={copyHtml}
                  active={copied === "html"}
                />
                <ExportBtn
                  icon={<Download />}
                  label="Preuzmi .html"
                  hint="Samostalni fajl"
                  onClick={downloadHtml}
                />
                <ExportBtn
                  icon={<ImageIcon />}
                  label="Preuzmi PNG"
                  hint="Slika potpisa, 2x rezolucija"
                  onClick={downloadPng}
                />
                <ExportBtn
                  icon={<Contact />}
                  label="Preuzmi vCard"
                  hint=".vcf — kontakt fajl"
                  onClick={downloadVCard}
                />
                <ExportBtn
                  icon={<Smartphone />}
                  label="QR vCard"
                  hint={data.showQr ? "Aktivan u potpisu" : "Uključi u podešavanjima"}
                  onClick={() => update("showQr", !data.showQr)}
                />
              </div>
            </TabsContent>

            <TabsContent value="code" className="p-4 sm:p-6">
              <div className="rounded-lg border border-border/60 bg-[oklch(0.18_0.05_265)] text-[oklch(0.95_0.02_240)] font-mono text-[10px] sm:text-xs overflow-auto max-h-72 sm:max-h-96">
                <pre className="p-3 sm:p-4 whitespace-pre-wrap break-all">{fullHtml}</pre>
              </div>
              <Button
                onClick={copyHtml}
                className="mt-4 bg-[var(--gradient-brand)] hover:opacity-90 transition-opacity w-full sm:w-auto"
              >
                <Copy className="w-4 h-4 mr-2" />
                Kopiraj kompletan HTML
              </Button>
            </TabsContent>

            <TabsContent value="quality" className="p-4 sm:p-6">
              <QualityPanel issues={qualityIssues} />
            </TabsContent>

            <TabsContent value="install" className="p-4 sm:p-6 space-y-4">
              <Instructions />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
        {label}
      </Label>
      {children}
    </div>
  );
}

function SectionSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <span
      className="flex items-center"
      onClick={(event) => event.stopPropagation()}
      onPointerDown={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        aria-label={checked ? "Isključi sekciju" : "Uključi sekciju"}
      />
    </span>
  );
}

function ExportBtn({
  icon,
  label,
  hint,
  onClick,
  active,
}: {
  icon: React.ReactNode;
  label: string;
  hint: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative text-left p-4 rounded-xl border border-border/60 bg-card hover:border-brand-green/60 hover:shadow-[var(--shadow-glow)] transition-[var(--transition-smooth)] overflow-hidden"
    >
      <div className="absolute inset-0 bg-[var(--gradient-frost)] opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="relative flex items-start gap-3">
        <div className="w-9 h-9 rounded-lg bg-[var(--gradient-navy)] text-primary-foreground flex items-center justify-center [&>svg]:w-4 [&>svg]:h-4">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-foreground flex items-center gap-1.5">
            {label}
            {active && <CheckCircle2 className="w-3.5 h-3.5 text-brand-green" />}
          </div>
          <div className="text-xs text-muted-foreground mt-0.5">{hint}</div>
        </div>
      </div>
    </button>
  );
}

function QualityPanel({
  issues,
}: {
  issues: { level: "error" | "warning" | "info"; message: string }[];
}) {
  const errors = issues.filter((i) => i.level === "error");
  const warns = issues.filter((i) => i.level === "warning");
  const infos = issues.filter((i) => i.level === "info");
  const score = Math.max(0, 100 - errors.length * 25 - warns.length * 8);

  const styles = {
    error: {
      icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
      box: "border-destructive/40 bg-destructive/5",
    },
    warning: {
      icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
      box: "border-amber-400/40 bg-amber-50",
    },
    info: {
      icon: <Info className="w-4 h-4 text-brand-navy" />,
      box: "border-border/60 bg-muted/40",
    },
  } as const;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl border border-border/60 p-4 bg-[var(--gradient-frost)]">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            Skor kvaliteta
          </div>
          <div className="text-3xl font-bold text-brand-navy-deep mt-1">{score}/100</div>
          <div className="text-xs text-muted-foreground mt-1">
            {errors.length} grešaka · {warns.length} upozorenja · {infos.length} info
          </div>
        </div>
        <ShieldCheck
          className={`w-12 h-12 ${score >= 90 ? "text-brand-green" : score >= 70 ? "text-amber-500" : "text-destructive"}`}
        />
      </div>
      <ul className="space-y-2">
        {issues.map((i, idx) => (
          <li
            key={idx}
            className={`flex items-start gap-3 rounded-lg border p-3 text-sm ${styles[i.level].box}`}
          >
            <span className="mt-0.5">{styles[i.level].icon}</span>
            <span className="text-foreground/85">{i.message}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Instructions() {
  const steps = [
    {
      client: "Gmail",
      icon: "✉️",
      steps: [
        "Klikni 'Kopiraj za Gmail' (preporuka) ili 'Kopiraj formatiran'.",
        "U Gmail-u: ⚙️ Settings → See all settings → General.",
        "Skroluj do 'Signature' → Create new → daj ime.",
        "Nalepi (Ctrl/Cmd+V) u editor potpisa.",
        "Sačuvaj — postavi kao default za nove i odgovore.",
      ],
    },
    {
      client: "Outlook (Desktop, Windows)",
      icon: "📧",
      steps: [
        "Klikni 'Preuzmi za Outlook (.htm)' i sačuvaj fajl.",
        "Otvori Explorer i ukucaj: %APPDATA%\\Microsoft\\Signatures",
        "Premesti preuzeti .htm fajl u taj folder (ime fajla = ime potpisa).",
        "Restart Outlook → File → Options → Mail → Signatures.",
        "Izaberi novi potpis kao default za New i Reply/Forward.",
      ],
    },
    {
      client: "Outlook Web / Microsoft 365",
      icon: "🌐",
      steps: [
        "Klikni 'Kopiraj formatiran'.",
        "Settings → Mail → Compose and reply.",
        "Nalepi u 'Email signature'.",
        "Označi 'Auto include' opcije i sačuvaj.",
      ],
    },
    {
      client: "Apple Mail",
      icon: "🍎",
      steps: [
        "Otvori Safari → otvori Live pregled u app-u.",
        "Selektuj potpis → Cmd+C.",
        "Mail → Settings → Signatures → '+' za novi.",
        "Nalepi (Cmd+V). Ako se ne formatira, otkači 'Always match my default font'.",
      ],
    },
    {
      client: "Thunderbird",
      icon: "🐦",
      steps: [
        "Preuzmi .html fajl na disk.",
        "Account Settings → izaberi nalog.",
        "Označi 'Attach the signature from a file'.",
        "Pronađi preuzeti .html fajl. Sačuvaj.",
      ],
    },
  ];

  return (
    <Accordion type="single" collapsible defaultValue="Gmail" className="w-full">
      {steps.map((s) => (
        <AccordionItem key={s.client} value={s.client} className="border-border/60">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3">
              <span className="text-xl">{s.icon}</span>
              <span className="font-medium">{s.client}</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ol className="space-y-2 pl-2">
              {s.steps.map((step, i) => (
                <li key={i} className="flex gap-3 text-sm text-foreground/80">
                  <span className="flex-none w-6 h-6 rounded-full bg-brand-navy/10 text-brand-navy text-xs font-semibold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <span className="pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export function StudioHeader() {
  return (
    <header className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-[var(--gradient-frost)]" />
      <div
        className="absolute -top-24 -right-24 w-72 h-72 sm:w-96 sm:h-96 rounded-full opacity-30 blur-3xl"
        style={{ background: "var(--gradient-brand)" }}
      />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-14">
        <div className="flex items-center gap-3 text-[10px] sm:text-xs uppercase tracking-[0.25em] text-brand-navy/70 font-medium">
          <Snowflake className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-navy" />
          EKO Elektrofrigo · Brand Studio
        </div>
        <h1 className="font-display text-3xl sm:text-5xl font-bold mt-3 sm:mt-4 leading-[1.05] tracking-tight text-brand-navy-deep max-w-3xl">
          Signature Elite <br />
          <span className="bg-clip-text text-transparent bg-[var(--gradient-brand)]">
            Studio za email potpise
          </span>
        </h1>
        <p className="mt-3 sm:mt-4 text-foreground/70 max-w-2xl text-sm sm:text-lg leading-relaxed">
          Premium generator email potpisa u brendu EKO Elektrofrigo — piksel-savršenstvo.
          QR vCard, OEM bedževi poverenja, dual CTA dugmad, social proof i jedan-klik multi-platform export.
        </p>
      </div>
    </header>
  );
}
