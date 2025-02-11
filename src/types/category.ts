export interface Category {
  id: string;
  name: string;
  description: string;
  banner_url: string;
  icon_url: string;
  slug: string;
  type: string;
  parent_id?: string;
  created_at?: string;
}
