import { formatPrice, formatValue, getColorByChange } from '../formatters';

describe('formatPrice', () => {
  it('should format regular numbers with 2 decimal places', () => {
    expect(formatPrice(123.456)).toBe('$123.46');
    expect(formatPrice(1.0)).toBe('$1.00');
    expect(formatPrice(999.99)).toBe('$999.99');
  });

  it('should use scientific notation for very small numbers', () => {
    expect(formatPrice(0.0000000123)).toBe('$1.23e-8');
    expect(formatPrice(0.00000000456)).toBe('$4.56e-9');
  });

  it('should use appropriate decimal places for small numbers', () => {
    expect(formatPrice(0.1)).toBe('$0.10');
    expect(formatPrice(0.01)).toBe('$0.01');
    expect(formatPrice(0.001)).toBe('$0.001');
    expect(formatPrice(0.0001)).toBe('$0.0001');
    expect(formatPrice(0.00001)).toBe('$0.00001');
    expect(formatPrice(0.000001)).toBe('$0.000001');
  });

  it('should handle edge cases', () => {
    expect(formatPrice(0)).toBe('$0.00');
    expect(formatPrice(1000000)).toBe('$1000000.00');
  });
});

describe('formatValue', () => {
  it('should format billions correctly', () => {
    expect(formatValue(1000000000)).toBe('$1.00B');
    expect(formatValue(2500000000)).toBe('$2.50B');
    expect(formatValue(9999999999)).toBe('$10.00B');
  });

  it('should format millions correctly', () => {
    expect(formatValue(1000000)).toBe('$1.00M');
    expect(formatValue(2500000)).toBe('$2.50M');
    expect(formatValue(999999999)).toBe('$1000.00M');
  });

  it('should format thousands correctly', () => {
    expect(formatValue(1000)).toBe('$1.00K');
    expect(formatValue(2500)).toBe('$2.50K');
    expect(formatValue(999999)).toBe('$1000.00K');
  });

  it('should format regular numbers correctly', () => {
    expect(formatValue(100)).toBe('$100.00');
    expect(formatValue(99.99)).toBe('$99.99');
    expect(formatValue(0.01)).toBe('$0.01');
  });

  it('should handle edge cases', () => {
    expect(formatValue(0)).toBe('$0.00');
    expect(formatValue(999.999)).toBe('$1000.00');
    expect(formatValue(1000000000000)).toBe('$1000.00B');
  });
});

describe('getColorByChange', () => {
  it('should return green for positive values', () => {
    expect(getColorByChange(0.1)).toBe('#52c41a');
    expect(getColorByChange(1)).toBe('#52c41a');
    expect(getColorByChange(100)).toBe('#52c41a');
  });

  it('should return red for negative values', () => {
    expect(getColorByChange(-0.1)).toBe('#f5222d');
    expect(getColorByChange(-1)).toBe('#f5222d');
    expect(getColorByChange(-100)).toBe('#f5222d');
  });

  it('should return gray for zero', () => {
    expect(getColorByChange(0)).toBe('#8c8c8c');
  });

  it('should handle edge cases', () => {
    expect(getColorByChange(Number.POSITIVE_INFINITY)).toBe('#52c41a');
    expect(getColorByChange(Number.NEGATIVE_INFINITY)).toBe('#f5222d');
    expect(getColorByChange(-0)).toBe('#8c8c8c');
  });
});