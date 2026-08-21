export interface Profile {
  id: string;
  full_name: string | null;
  business_name: string | null;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  user_id: string;
  name: string;
  email: string;
  company: string | null;
  total_revenue: number;
  status: "active" | "inactive" | "churned";
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue" | "failed";
  due_date: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FailedPayment {
  id: string;
  user_id: string;
  customer_id: string;
  invoice_id: string;
  amount: number;
  failure_reason: string | null;
  recovery_status: "pending" | "in_progress" | "recovered" | "failed";
  detected_at: string;
  recovered_at: string | null;
  updated_at: string;
}

export interface RecoveryCampaign {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: "draft" | "active" | "paused" | "completed";
  recovered_amount: number;
  created_at: string;
  updated_at: string;
}

export interface RecoveryAction {
  id: string;
  user_id: string;
  failed_payment_id: string;
  campaign_id: string | null;
  action_type: "email" | "sms" | "call" | "retry_payment" | "offer_discount";
  status: "pending" | "executed" | "failed" | "cancelled";
  executed_at: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string;
  sku: string;
  description: string | null;
  category: string;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  status: "active" | "inactive" | "out_of_stock";
  image_url: string | null;
  total_revenue: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  total_amount: number;
  status: "pending" | "confirmed" | "processing" | "completed" | "cancelled";
  customer_name: string;
  customer_email: string;
  shipping_address: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  created_at: string;
}

export interface RevenueMetric {
  id: string;
  user_id: string;
  date: string;
  total_revenue: number;
  recovered_revenue: number;
  lost_revenue: number;
  failed_payment_amount: number;
  created_at: string;
}
