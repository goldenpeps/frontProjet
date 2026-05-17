interface OpenMeteoDailyResponse {
  daily?: {
    weathercode?: number[];
    time?: string[];
  };
}

export interface WeatherCheckResult {
  weatherCode: number;
  description: string;
  hasRainOrSnow: boolean;
}

const RAIN_CODES = new Set([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82]);
const SNOW_CODES = new Set([71, 73, 75, 77, 85, 86]);

function weatherCodeToDescription(code: number): string {
  const map: Record<number, string> = {
    0: 'Ciel degage',
    1: 'Principalement degage',
    2: 'Partiellement nuageux',
    3: 'Couvert',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine legere',
    53: 'Bruine moderee',
    55: 'Bruine dense',
    56: 'Bruine verglacante legere',
    57: 'Bruine verglacante dense',
    61: 'Pluie legere',
    63: 'Pluie moderee',
    65: 'Pluie forte',
    66: 'Pluie verglacante legere',
    67: 'Pluie verglacante forte',
    71: 'Neige legere',
    73: 'Neige moderee',
    75: 'Neige forte',
    77: 'Grains de neige',
    80: 'Averses de pluie legeres',
    81: 'Averses de pluie moderees',
    82: 'Averses de pluie violentes',
    85: 'Averses de neige legeres',
    86: 'Averses de neige fortes',
    95: 'Orage',
    96: 'Orage avec grele legere',
    99: 'Orage avec forte grele',
  };

  return map[code] ?? `Code meteo ${code}`;
}

function isRainOrSnow(code: number): boolean {
  return RAIN_CODES.has(code) || SNOW_CODES.has(code);
}

export const weatherService = {
  async checkDailyWeather(latitude: number, longitude: number, date: string): Promise<WeatherCheckResult> {
    try {
      const params = new URLSearchParams({
        latitude: String(latitude),
        longitude: String(longitude),
        timezone: 'auto',
        daily: 'weathercode',
        start_date: date,
        end_date: date,
      });

      const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      console.log('Requete meteo envoyee avec params:', params.toString());
      if (!response.ok) {
        throw new Error('Impossible de recuperer la meteo');
      }

      const data = (await response.json()) as OpenMeteoDailyResponse;
      const weatherCode = data.daily?.weathercode?.[0];

      if (typeof weatherCode !== 'number') {
        throw new Error('Donnees meteo indisponibles pour la date demandee');
      }

      return {
        weatherCode,
        description: weatherCodeToDescription(weatherCode),
        hasRainOrSnow: isRainOrSnow(weatherCode),
      };
    } catch (error) {
      throw new Error((error as Error).message || 'Erreur lors de la verification meteo');
    }
  },
};
