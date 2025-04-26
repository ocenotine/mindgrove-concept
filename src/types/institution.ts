
export interface BrandingColors {
  primary: string;
  secondary: string;
}

export interface InstitutionData {
  id: string;
  name: string;
  domain: string;
  logo_url: string | null;
  is_premium: boolean;
  branding_colors: BrandingColors;
  created_at: string;
  updated_at: string;
  selar_co_id: string | null;
  subscription_expiry?: string | null;
}
