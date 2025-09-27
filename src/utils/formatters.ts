export const formatPrice = (value: number) => {
  if (value >= 1) {
    return `$${value.toFixed(2)}`;
  }
  // For very small numbers, use scientific notation
  if (value < 0.0000001) {
    return `$${value.toExponential(2)}`;
  }
  // For small numbers, show enough decimal places
  return `$${value.toFixed(Math.min(8, Math.max(2, -Math.floor(Math.log10(value)))))}`;
};

export const formatValue = (value: number) => {
  if (value >= 1000000000) {
    return `$${(value / 1000000000).toFixed(2)}B`;
  }
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2)}M`;
  }
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(2)}K`;
  }
  return `$${value.toFixed(2)}`;
};

export const getColorByChange = (value: number) => {
  if (value > 0) {
    return '#52c41a';
  }
  if (value < 0) {
    return '#f5222d';
  }
  return '#8c8c8c';
};