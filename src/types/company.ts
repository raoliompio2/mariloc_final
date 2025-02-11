export interface CompanyInfo {
  id: string
  title: string
  content: string
  meta_description: string | null
  banner_url: string | null
  created_at: string
  updated_at: string
}

export interface ContactInfo {
  id: string
  type: 'phone' | 'email' | 'whatsapp' | 'address'
  value: string
  is_primary: boolean
  created_at: string
  updated_at: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
  category: 'rental' | 'payment' | 'return' | 'maintenance'
  order_index: number
  created_at: string
  updated_at: string
}

export interface SupportTicket {
  id: string
  client_id: string
  subject: string
  message: string
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  related_rental_id: string | null
  created_at: string
  updated_at: string
}

export interface SupportMessage {
  id: string
  ticket_id: string
  sender_id: string
  message: string
  created_at: string
}

export interface CompanyHero {
  id: string
  title: string
  subtitle: string
  video_url: string | null
  poster_url: string
  created_at: string
  updated_at: string
}

export interface CompanyMissionVisionValue {
  id: string
  type: 'mission' | 'vision' | 'values'
  title: string
  description: string
  icon: string
  created_at: string
  updated_at: string
}

export interface CompanyTimeline {
  id: string
  year: string
  title: string
  description: string
  created_at: string
  updated_at: string
}

export interface CompanyValue {
  id: string
  title: string
  description: string
  image_url: string
  icon: string
  created_at: string
  updated_at: string
}

export interface CompanySector {
  id: string
  title: string
  image_url: string
  created_at: string
  updated_at: string
}

export interface CompanyCertification {
  id: string
  name: string
  image_url: string
  created_at: string
  updated_at: string
}
