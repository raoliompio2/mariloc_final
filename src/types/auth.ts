export type UserRole = 'client' | 'landlord';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}