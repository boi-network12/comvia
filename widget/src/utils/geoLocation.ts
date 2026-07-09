// widget/src/utils/geoLocation.ts

export interface GeoLocation {
  ip: string;
  country: string;
  countryCode: string;
  region: string;
  city: string;
  timezone: string;
  isp: string;
  latitude?: number;
  longitude?: number;
}

/**
 * Get visitor IP and location data from ipapi.co
 * Free tier: 1000 requests per day
 */
export async function getVisitorGeoLocation(): Promise<GeoLocation | null> {
  try {
    // Using ipapi.co - free and reliable
    const response = await fetch('https://ipapi.co/json/', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get location: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      ip: data.ip,
      country: data.country_name || 'Unknown',
      countryCode: data.country_code || 'XX',
      region: data.region || 'Unknown',
      city: data.city || 'Unknown',
      timezone: data.timezone || 'UTC',
      isp: data.org || 'Unknown',
      latitude: data.latitude,
      longitude: data.longitude,
    };
  } catch (error) {
    console.error('❌ Failed to get visitor location:', error);
    
    // Fallback: try ip-api.com
    try {
      const fallbackResponse = await fetch('http://ip-api.com/json/');
      if (fallbackResponse.ok) {
        const data = await fallbackResponse.json();
        return {
          ip: data.query,
          country: data.country || 'Unknown',
          countryCode: data.countryCode || 'XX',
          region: data.regionName || 'Unknown',
          city: data.city || 'Unknown',
          timezone: data.timezone || 'UTC',
          isp: data.isp || 'Unknown',
          latitude: data.lat,
          longitude: data.lon,
        };
      }
    } catch (fallbackError) {
      console.error('❌ Fallback location failed:', fallbackError);
    }
    
    return null;
  }
}

/**
 * Get a flag emoji for a country code
 */
export function getCountryFlag(countryCode: string): string {
  const flags: Record<string, string> = {
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'CA': '🇨🇦',
    'AU': '🇦🇺',
    'DE': '🇩🇪',
    'FR': '🇫🇷',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'JP': '🇯🇵',
    'CN': '🇨🇳',
    'IN': '🇮🇳',
    'BR': '🇧🇷',
    'MX': '🇲🇽',
    'ZA': '🇿🇦',
    'NG': '🇳🇬',
    'KE': '🇰🇪',
    'EG': '🇪🇬',
    'AE': '🇦🇪',
    'SA': '🇸🇦',
    'SG': '🇸🇬',
    'MY': '🇲🇾',
    'PH': '🇵🇭',
    'VN': '🇻🇳',
    'TH': '🇹🇭',
    'KR': '🇰🇷',
    'RU': '🇷🇺',
    'UA': '🇺🇦',
    'PL': '🇵🇱',
    'NL': '🇳🇱',
    'BE': '🇧🇪',
    'SE': '🇸🇪',
    'NO': '🇳🇴',
    'DK': '🇩🇰',
    'FI': '🇫🇮',
    'CH': '🇨🇭',
    'AT': '🇦🇹',
    'GR': '🇬🇷',
    'PT': '🇵🇹',
    'IE': '🇮🇪',
    'NZ': '🇳🇿',
    'AR': '🇦🇷',
    'CL': '🇨🇱',
    'CO': '🇨🇴',
    'PE': '🇵🇪',
    'VE': '🇻🇪',
  };
  
  return flags[countryCode.toUpperCase()] || '🌍';
}

/**
 * Get a greeting message based on visitor's country
 */
export function getGreetingByCountry(countryCode: string): string {
  const greetings: Record<string, string> = {
    'US': 'Hello! 🇺🇸',
    'GB': 'Hello! 🇬🇧',
    'CA': 'Hello! 🇨🇦',
    'AU': 'G\'day! 🇦🇺',
    'DE': 'Hallo! 🇩🇪',
    'FR': 'Bonjour! 🇫🇷',
    'ES': '¡Hola! 🇪🇸',
    'IT': 'Ciao! 🇮🇹',
    'JP': 'こんにちは! 🇯🇵',
    'CN': '你好! 🇨🇳',
    'IN': 'Namaste! 🇮🇳',
    'BR': 'Olá! 🇧🇷',
    'MX': '¡Hola! 🇲🇽',
    'NG': 'Hello! 🇳🇬',
    'KE': 'Habari! 🇰🇪',
    'EG': 'مرحبا! 🇪🇬',
    'AE': 'مرحبا! 🇦🇪',
    'SA': 'مرحبا! 🇸🇦',
    'SG': 'Hello! 🇸🇬',
    'MY': 'Hello! 🇲🇾',
    'PH': 'Kumusta! 🇵🇭',
    'VN': 'Xin chào! 🇻🇳',
    'TH': 'สวัสดี! 🇹🇭',
    'KR': '안녕하세요! 🇰🇷',
    'RU': 'Привет! 🇷🇺',
    'UA': 'Привіт! 🇺🇦',
    'PL': 'Cześć! 🇵🇱',
    'NL': 'Hallo! 🇳🇱',
    'BE': 'Bonjour! 🇧🇪',
    'SE': 'Hej! 🇸🇪',
    'NO': 'Hei! 🇳🇴',
    'DK': 'Hej! 🇩🇰',
    'FI': 'Hei! 🇫🇮',
    'CH': 'Hallo! 🇨🇭',
    'AT': 'Hallo! 🇦🇹',
    'GR': 'Γεια σας! 🇬🇷',
    'PT': 'Olá! 🇵🇹',
    'IE': 'Dia dhuit! 🇮🇪',
    'NZ': 'Kia ora! 🇳🇿',
    'AR': '¡Hola! 🇦🇷',
    'CL': '¡Hola! 🇨🇱',
    'CO': '¡Hola! 🇨🇴',
    'PE': '¡Hola! 🇵🇪',
    'VE': '¡Hola! 🇻🇪',
  };
  
  return greetings[countryCode.toUpperCase()] || 'Hello! 🌍';
}