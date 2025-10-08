/**
 * Utility functions for formatting numbers based on locale
 */

const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
const westernNumerals = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert Western numerals to Arabic-Eastern numerals
 */
export const toArabicNumerals = (num: string | number): string => {
  const str = num.toString();
  return str.replace(/[0-9]/g, (digit) => arabicNumerals[parseInt(digit)]);
};

/**
 * Format number based on current language
 */
export const formatNumber = (num: number, language: string, decimals?: number): string => {
  const formatted = decimals !== undefined 
    ? num.toFixed(decimals)
    : num.toString();
  
  return language === 'ar' ? toArabicNumerals(formatted) : formatted;
};

/**
 * Format speed with units based on language
 */
export const formatSpeed = (
  speed: number | string, 
  language: string, 
  t: (key: string) => string
): string => {
  const speedNum = typeof speed === 'string' ? parseFloat(speed) : speed;
  
  if (isNaN(speedNum)) return speed.toString();
  
  // Determine unit (Mbps or Gbps)
  let unit: string;
  let value: number;
  
  if (speedNum >= 1000) {
    value = speedNum / 1000;
    unit = t('units.gbps');
  } else {
    value = speedNum;
    unit = t('units.mbps');
  }
  
  const formattedValue = formatNumber(value, language, 1);
  
  return `${formattedValue} ${unit}`;
};
