export interface ActionResult<T = undefined> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isAdmin: boolean;
  avatarUrl: string | null;
}

export interface SessionData {
  userId: string;
  user: SessionUser;
}

export interface CrewProfileSummary {
  id: string;
  name: string;
  slug: string;
  role: string;
  city: string | null;
  country: string;
  avatarUrl: string | null;
  dayRate: number | null;
  showDayRate: boolean;
  plan: string;
}

export interface VideoClipData {
  id: string;
  title: string;
  description: string | null;
  url: string;
  sortOrder: number;
  isFeatured: boolean;
}

export interface CreditData {
  id: string;
  year: number;
  projectName: string;
  format: string;
  role: string;
  director: string | null;
  agency: string | null;
  status: string;
}

export interface BookingData {
  id: string;
  title: string;
  client: string | null;
  startDate: Date;
  endDate: Date;
  dayRate: number | null;
  status: string;
  notes: string | null;
}

export interface BookingRequestData {
  id: string;
  producerName: string;
  producerCompany: string | null;
  producerEmail: string;
  producerPhone: string | null;
  projectName: string;
  role: string | null;
  startDate: Date;
  endDate: Date;
  offeredRate: number;
  message: string | null;
  status: string;
  confirmationId: string | null;
  acceptedAt: Date | null;
  declinedAt: Date | null;
  createdAt: Date;
}

export type BadgeVariant = "pending" | "confirmed" | "danger" | "done";
export type ButtonVariant = "primary" | "gold" | "outline" | "danger";
