import { validateCustomer } from './validation';
import { normalizeIndianPhone } from './phone';

describe('customer validation', () => {
  it.each(['9876543210', '+91 98765 43210', '919876543210', '09876543210'])('accepts %s', (p) => {
    expect(normalizeIndianPhone(p)).toBe('919876543210');
  });
  it.each(['5876543210', '98765', 'abcdefghij', '+1 9876543210'])('rejects %s', (p) => {
    expect(normalizeIndianPhone(p)).toBeNull();
  });
  it('flags missing name and bad phone', () => {
    const errors = validateCustomer({ name: ' ', phone: '123' });
    expect(errors.name).toBeDefined();
    expect(errors.phone).toBeDefined();
  });
  it('passes valid input', () => {
    expect(validateCustomer({ name: 'Ravi', phone: '9876543210' })).toEqual({});
  });
});
