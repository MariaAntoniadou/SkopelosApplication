import { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from "react-i18next";

const WeatherContext = createContext();

export const WeatherProvider = ({ children }) => {
  const [weather, setWeather] = useState(null);
  const { i18n } = useTranslation();
  const locale = i18n.language || 'el';

  useEffect(() => {
    async function fetchWeather() {
      try {
        const apiKey = "7927d486f1d246f1a2e81847252507";
        const response = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${apiKey}&q=Skopelos&lang=${locale}`
        );
        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setWeather(null);
      }
    }
    fetchWeather();
  }, [locale]);

  return (
    <WeatherContext.Provider value={weather}>
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => useContext(WeatherContext);