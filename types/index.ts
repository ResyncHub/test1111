export type JobStatus = "nowe" | "w_trakcie" | "zakonczone" | "oplacone";

export interface Customer {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description: string | null;
  base_price: number | null;
  created_at: string;
}

export interface Job {
  id: string;
  customer_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  status: JobStatus;
  scheduled_at: string | null;
  scheduled_end_at: string | null;
  address: string | null;
  notes: string | null;
  revenue: number;
  created_at: string;
  updated_at: string;
  customer?: Customer;
  category?: ServiceCategory;
  costs?: JobCost[];
  photos?: JobPhoto[];
}

export interface JobCost {
  id: string;
  job_id: string;
  description: string;
  amount: number;
  cost_date: string;
  created_at: string;
}

export interface JobPhoto {
  id: string;
  job_id: string;
  storage_path: string;
  public_url: string | null;
  caption: string | null;
  photo_type: "before" | "after" | "other";
  created_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface DashboardStats {
  todayJobsCount: number;
  unpaidJobsCount: number;
  monthRevenue: number;
  monthCosts: number;
  monthProfit: number;
  openJobsCount: number;
}

export interface FinancialSummary {
  total_revenue: number;
  total_costs: number;
  profit: number;
  job_count: number;
}
