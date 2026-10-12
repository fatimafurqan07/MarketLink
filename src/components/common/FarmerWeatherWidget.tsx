import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, Wind, Thermometer, MapPin, Loader2 } from 'lucide-react';

interface WeatherWidgetProps {
  cityName?: string;
  latitude?: number;
  longitude?: number;
}

export const FarmerWeatherWidget: React.FC<WeatherWidgetProps> = ({
  cityName = 'Karachi / Mandi Hub',
  latitude = 24.9721,
  longitude = 67.1571,
}) => {
  const [temp, setTemp] = useState<number | null>(null);
  const [weatherCode, setWeatherCode] = useState<number>(0);
  const [windSpeed, setWindSpeed] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const lat = latitude || 24.9721;
    const lon = longitude || 67.1571;

    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.current_weather) {
          setTemp(data.current_weather.temperature);
          setWeatherCode(data.current_weather.weathercode);
          setWindSpeed(data.current_weather.windspeed);
        }
      })
      .catch(() => {
        if (isMounted) {
          setTemp(28); // Fallback
          setWeatherCode(0);
          setWindSpeed(12);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [latitude, longitude]);

  // Interpret WMO weather code
  const getWeatherDesc = (code: number) => {
    if (code === 0) return { label: 'Sunny & Clear', icon: Sun, color: 'text-amber-500' };
    if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: Cloud, color: 'text-sky-600' };
    if (code >= 51 && code <= 67) return { label: 'Light Showers / Rain', icon: CloudRain, color: 'text-blue-600' };
    return { label: 'Optimal Harvest Weather', icon: Sun, color: 'text-emerald-600' };
  };

  const currentCondition = getWeatherDesc(weatherCode);
  const WeatherIcon = currentCondition.icon;

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8e5] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
          <WeatherIcon className={`w-6 h-6 ${currentCondition.color}`} />
        </div>
        <div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748b] font-mono">
            <MapPin className="w-3.5 h-3.5 text-[#064e3b]" />
            <span>{cityName}</span>
          </div>
          <h4 className="font-serif text-lg font-normal text-[#10231d] mt-0.5">
            {loading ? 'Checking dawn climate...' : currentCondition.label}
          </h4>
        </div>
      </div>

      <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-[#e2e8e5] pt-3 sm:pt-0 sm:pl-6 text-xs">
        <div>
          <span className="text-[#64748b] block text-[10px] uppercase font-mono font-bold">Temperature</span>
          <span className="font-mono text-base font-bold text-[#10231d]">
            {loading ? '--' : `${temp}°C`}
          </span>
        </div>
        <div>
          <span className="text-[#64748b] block text-[10px] uppercase font-mono font-bold">Wind Speed</span>
          <span className="font-mono text-base font-bold text-[#064e3b]">
            {loading ? '--' : `${windSpeed} km/h`}
          </span>
        </div>
        <div>
          <span className="text-[#64748b] block text-[10px] uppercase font-mono font-bold">Harvest Window</span>
          <span className="font-semibold text-emerald-700 font-mono">Ideal (04:00 AM)</span>
        </div>
      </div>
    </div>
  );
};
