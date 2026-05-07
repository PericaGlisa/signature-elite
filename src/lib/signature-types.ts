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
  company: string;
  phone: string;
  mobile?: string;
  whatsapp?: string;
  email: string;
  website: string;
  website2?: string;
  address: string;
  city: string;
  warehouse?: string;
  warehouseCity?: string;
  photoUrl?: string;
  logoUrl?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  bannerUrl?: string;
  bannerLink?: string;
  bookingUrl?: string;
  bookingLabel?: string;
  oemLabel?: string;
  oemPartners?: string;
  showOemBadges: boolean;
  showIntroMessage: boolean;
  showCta: boolean;
  showBanner: boolean;
  showSocial: boolean;
  showBooking: boolean;
  social: SocialLinks;
  introText?: string;
  closingText?: string;
  utm: UtmConfig;
};

export const DEFAULT_SIGNATURE: SignatureData = {
  fullName: "Marko Petrović",
  position: "Direktor prodaje",
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
  photoUrl: "",
  logoUrl: "",
  ctaLabel: "Zakaži sastanak",
  ctaUrl: "https://www.eef.rs/kontakt",
  bannerUrl: "",
  bannerLink: "",
  bookingUrl: "",
  bookingLabel: "Zakaži konsultaciju",
  oemLabel: "Ovlašćeni distributer, generalni zastupnik i partner za brendove:",
  oemPartners: "Bitzer, Danfoss, Alfa Laval, Alfa Lu-Ve, Güven Soğutma, Isolcell",
  showOemBadges: true,
  showIntroMessage: true,
  showCta: true,
  showBanner: false,
  showSocial: true,
  showBooking: false,
  social: {
    linkedin: "https://linkedin.com/company/eko-elektrofrigo",
    instagram: "https://instagram.com/eko_elektrofrigo",
  },
  introText: "Poštovani,\n\nU prilogu Vam dostavljam traženu dokumentaciju.",
  closingText: "Srdačan pozdrav,",
  utm: {
    enabled: true,
    source: "email",
    medium: "signature",
    campaign: "",
    autoContent: true,
  },
};
