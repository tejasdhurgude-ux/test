import type { CartItem } from './cart';

export interface CustomerDetails {
  name: string;
  /** Normalised international format, e.g. 919876543210 */
  phone: string;
}

export interface Bill {
  billId: string;
  createdAt: string; // ISO timestamp
  customer: CustomerDetails;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  staffEmail: string;
}

export interface SubmitBillRequest {
  billId: string;
  customer: CustomerDetails;
  items: { productId: string; quantity: number }[];
}

export interface SubmitBillSuccess {
  ok: true;
  billId: string;
  subtotal: number;
  total: number;
  duplicate: boolean;
}
