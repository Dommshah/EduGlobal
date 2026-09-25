/**
 * Dual API base:
 * - Browser → same-origin "/api" (Next.js rewrites proxy to FastAPI; no CORS).
 * - Server components (SSR) → absolute backend URL, because relative URLs
 *   cannot be fetched from Node. Override server target via API_PROXY_TARGET
 *   (e.g. http://api:8000 inside Docker).
 */
const isServer = typeof window === "undefined";
export const API_URL = (
  isServer
    ? process.env.API_PROXY_TARGET || process.env.INTERNAL_API_URL || "http://127.0.0.1:8000"
    : process.env.NEXT_PUBLIC_API_URL || "/api"
).replace(/\/+$/, "");

export type Role = "student" | "employee" | "admin";

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  avatar_color?: string;
  created_at?: string;
}

export interface Country {
  id: number;
  name: string;
  slug: string;
  flag: string;
  tagline?: string;
  description?: string;
  universities_count: number;
  students_count: number;
  visa_success_rate: number;
  min_tuition: number;
  avg_living_cost: number;
  intakes: string;
  highlights?: string[];
  hero_gradient: string;
}

export interface University {
  id: number;
  name: string;
  slug: string;
  country_id: number;
  country?: Country;
  city: string;
  world_rank: number | null;
  founded: number | null;
  type: string;
  description?: string;
  tuition_min: number | null;
  tuition_max: number | null;
  acceptance_rate: number | null;
  programs_count: number | null;
  image_gradient: string;
  featured: boolean;
}

export interface Course {
  id: number;
  university_id: number;
  university?: University;
  name: string;
  level: string;
  duration: string;
  tuition: number | null;
  currency: string;
  intake: string;
  ielts: string;
  description?: string;
}

export interface Application {
  id: number;
  student_id: number;
  university_id: number;
  course_id: number;
  counselor_id: number | null;
  status: string;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  student?: { id: number; name: string; email: string } | null;
  university?: { id: number; name: string } | null;
  course?: { id: number; name: string } | null;
  documents?: Document[];
  timeline?: ApplicationEvent[];
}

export interface Document {
  id: number;
  application_id: number;
  kind: string;
  status: "pending" | "received" | "verified";
}

export interface ApplicationEvent {
  id: number;
  application_id: number;
  label: string;
  detail?: string | null;
  created_at: string;
}

export interface Enquiry {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  country_interest?: string | null;
  level?: string | null;
  intake?: string | null;
  message?: string | null;
  source: string;
  status: "new" | "contacted" | "qualified" | "converted" | "closed";
  owner_id: number | null;
  created_at: string;
}

export interface Testimonial {
  id: number;
  name: string;
  program?: string;
  university?: string;
  country?: string;
  content: string;
  rating: number;
  avatar_gradient: string;
  avatar_image?: string | null;
  featured: boolean;
}

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  category: string;
  author: string;
  read_minutes: number;
  gradient: string;
  created_at: string;
}

export interface Stat {
  id: number;
  label: string;
  value: string;
  suffix?: string;
}

export interface Quote {
  id: number;
  text: string;
  author: string;
}

export interface Ticket {
  id: number;
  user_id: number;
  subject: string;
  message: string;
  status: "open" | "pending" | "resolved";
  priority: string;
  response?: string | null;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject?: string;
  message: string;
  handled: boolean;
  created_at: string;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers, cache: "no-store" });
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = await res.json();
      detail = body.detail || JSON.stringify(body);
    } catch {}
    throw new ApiError(detail, res.status);
  }
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
