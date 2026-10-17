import { normalizeIndianPhone } from './phone';

export interface CustomerFormValues {
  name: string;
  phone: string;
}

export interface CustomerFormErrors {
  name?: string;
  phone?: string;
}

export function validateCustomer(values: CustomerFormValues): CustomerFormErrors {
  const errors: CustomerFormErrors = {};
  const name = values.name.trim();
  if (name.length < 2) errors.name = 'Enter the customer name (at least 2 characters).';
  else if (name.length > 80) errors.name = 'Customer name must be 80 characters or fewer.';

  if (!values.phone.trim()) errors.phone = 'Enter the customer phone number.';
  else if (!normalizeIndianPhone(values.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
  }
  return errors;
}
