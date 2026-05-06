export type SocialLinks = {
  linkedin?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
};

export type UtmConfig = {
  enabled: boolean;
  source: string;
  medium: string;
  campaign: string; // empty => auto from fullName slug
  term?: string;
  autoContent: boolean; // adds utm_content per link type (cta, web, linkedin...)
};

export type SignatureData = {
  fullName: string;
  position: string;
  department?: string;
  company: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
  whatsappMessage?: string;
  email: string;
  website: string;
  website2?: string;
  address: string;
  city: string;
  warehouse?: string;
  warehouseCity?: string;
  slogan?: string;
  photoUrl?: string;
  logoUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  secondaryCtaLabel?: string;
  secondaryCtaUrl?: string;
  bannerUrl?: string;
  bannerLink?: string;
  bookingUrl?: string;
  bookingLabel?: string;
  ratingText?: string;
  certificates?: string;
  oemLabel?: string;
  oemPartners?: string;
  showOemBadges: boolean;
  showQr: boolean;
  showIntroMessage: boolean;
  showCta: boolean;
  showSecondaryCta: boolean;
  showBanner: boolean;
  showSocial: boolean;
  showDisclaimer: boolean;
  showBooking: boolean;
  showSocialProof: boolean;
  social: SocialLinks;
  legalDisclaimer?: string;
  introText?: string;
  closingText?: string;
  utm: UtmConfig;
};

export const DEFAULT_SIGNATURE: SignatureData = {
  fullName: "Marko Petrović",
  position: "Direktor prodaje",
  department: "Komercijalni sektor",
  company: "Eko Elektrofrigo d.o.o.",
  phone: "+381 11 3757286",
  mobile: "+381 64 8222606",
  whatsapp: "+381 64 8222606",
  email: "marko.petrovic@eef.rs",
  website: "www.eef.rs",
  website2: "www.ekoelektrofrigo.rs",
  address: "Tošin bunar 164",
  city: "Novi Beograd, Srbija",
  warehouse: "Svetolika Nikačevića 11",
  warehouseCity: "Beograd, Srbija",
  slogan: "Hladnoća koja pokreće.",
  photoUrl: "",
  logoUrl: "",
  ctaLabel: "Zakaži sastanak",
  ctaUrl: "https://www.eef.rs/kontakt",
  secondaryCtaLabel: "Preuzmi katalog",
  secondaryCtaUrl: "https://www.eef.rs/katalog",
  bannerUrl: "",
  bannerLink: "",
  bookingUrl: "",
  bookingLabel: "Zakaži konsultaciju",
  whatsappMessage: "Zdravo, zanimaju me vaše usluge. Možemo li popričati?",
  ratingText: "4.9/5 — 120+ recenzija",
  certificates: "ISO 9001, HACCP, CE",
  oemLabel: "Ovlašćeni distributer, generalni zastupnik i partner za brendove:",
  oemPartners: "Bitzer, Danfoss, Alfa Laval, Alfa Lu-Ve, Güven Soğutma, Isolcell",
  showOemBadges: true,
  showQr: true,
  showIntroMessage: true,
  showCta: true,
  showSecondaryCta: false,
  showBanner: true,
  showSocial: true,
  showDisclaimer: true,
  showBooking: false,
  showSocialProof: false,
  social: {
    linkedin: "https://linkedin.com/company/eko-elektrofrigo",
    instagram: "",
    facebook: "",
    youtube: "",
  },
  legalDisclaimer:
    "Ova poruka i svi prilozi su poverljivi i namenjeni isključivo primaocu. Ako ste je primili greškom, molimo obavestite pošiljaoca i obrišite poruku. Eko Elektrofrigo d.o.o. ne preuzima odgovornost za štete nastale neovlašćenom upotrebom sadržaja.",
  introText:
    "Poštovana/i,\n\nHvala Vam na ukazanom poverenju. U prilogu Vam šaljem tražene informacije i stojim na raspolaganju za sva dodatna pitanja.",
  closingText: "S poštovanjem,",
  utm: {
    enabled: true,
    source: "email-signature",
    medium: "email",
    campaign: "",
    term: "",
    autoContent: true,
  },
};
