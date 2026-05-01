export function formatNumber(value: number) {
  const stringValue = value?.toString();
  if (stringValue && stringValue?.includes('.')) {
    const [, decimalPart] = stringValue?.split('.');
    if (decimalPart.length <= 2) {
      return value;
    }
    return parseFloat(value.toFixed(2));
  }

  return value;
}
