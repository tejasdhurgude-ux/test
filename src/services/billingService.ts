import type { SubmitBillRequest, SubmitBillSuccess } from '../types/bill';
import { products } from '../data/products';

const URL = import.meta.env.VITE_APPS_SCRIPT_URL as string | undefined;
const TIMEOUT_MS = 25_000;

export class BillingError extends Error {
  constructor(message: string, public readonly code: string = 'UNKNOWN') {
    super(message);
    this.name = 'BillingError';
  }
}

interface ErrorResponse {
  ok: false;
  code: string;
  message: string;
}

export async function submitBill(request: SubmitBillRequest, idToken: string): Promise<SubmitBillSuccess> {
  if (!URL) {
    if (true) {
      // TEMPORARY: fake save for local testing. Nothing is stored anywhere.
      const total = request.items.reduce((sum, line) => {
        const price = products.find((p) => p.id === line.productId)?.price ?? 0;
        return sum + price * line.quantity;
      }, 0);
      await new Promise((resolve) => setTimeout(resolve, 600));
      return { ok: true, billId: request.billId, subtotal: total, total, duplicate: false };
    }
    throw new BillingError('Billing server URL is not configured (VITE_APPS_SCRIPT_URL).', 'NOT_CONFIGURED');
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetch(URL, {
      method: 'POST',
      // text/plain avoids a CORS preflight, which Apps Script cannot answer.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...request, idToken }),
      signal: controller.signal,
    });
    if (!response.ok) throw new BillingError(`Server returned ${response.status}.`, 'HTTP_ERROR');
    const data = (await response.json()) as SubmitBillSuccess | ErrorResponse;
    if (!data.ok) throw new BillingError(data.message, data.code);
    return data;
  } catch (error) {
    if (error instanceof BillingError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new BillingError('The server took too long to respond. Retry: the same bill ID prevents duplicates.', 'TIMEOUT');
    }
    throw new BillingError('Could not reach the billing server. Check the connection and retry.', 'NETWORK');
  } finally {
    clearTimeout(timer);
  }
}
