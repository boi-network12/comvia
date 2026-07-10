// Add this helper function
export function getCountryFlag(countryCode: string): string {
  if (!countryCode) return '🌍';
  
  const flags: Record<string, string> = {
    'US': '🇺🇸', 'GB': '🇬🇧', 'CA': '🇨🇦', 'AU': '🇦🇺',
    'DE': '🇩🇪', 'FR': '🇫🇷', 'IT': '🇮🇹', 'ES': '🇪🇸',
    'JP': '🇯🇵', 'CN': '🇨🇳', 'IN': '🇮🇳', 'BR': '🇧🇷',
    'MX': '🇲🇽', 'ZA': '🇿🇦', 'NG': '🇳🇬', 'KE': '🇰🇪',
    'EG': '🇪🇬', 'AE': '🇦🇪', 'SA': '🇸🇦', 'SG': '🇸🇬',
    'MY': '🇲🇾', 'PH': '🇵🇭', 'VN': '🇻🇳', 'TH': '🇹🇭',
    'KR': '🇰🇷', 'RU': '🇷🇺', 'UA': '🇺🇦', 'PL': '🇵🇱',
    'NL': '🇳🇱', 'BE': '🇧🇪', 'SE': '🇸🇪', 'NO': '🇳🇴',
    'DK': '🇩🇰', 'FI': '🇫🇮', 'CH': '🇨🇭', 'AT': '🇦🇹',
    'GR': '🇬🇷', 'PT': '🇵🇹', 'IE': '🇮🇪', 'NZ': '🇳🇿',
    'AR': '🇦🇷', 'CL': '🇨🇱', 'CO': '🇨🇴', 'PE': '🇵🇪',
    'VE': '🇻🇪', 'IL': '🇮🇱', 'TR': '🇹🇷', 'PK': '🇵🇰',
    'BD': '🇧🇩', 'ID': '🇮🇩',
  };
  
  return flags[countryCode.toUpperCase()] || '🌍';
}