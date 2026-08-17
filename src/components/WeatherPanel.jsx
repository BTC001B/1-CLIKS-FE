import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Sun, Moon, Wind, Droplets, Loader2, AlertCircle, CloudSun, Sunrise, Sunset, Thermometer } from 'lucide-react';

const fetchWeather = async (lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset&hourly=temperature_2m&current=temperature_2m,is_day,relative_humidity_2m,wind_speed_10m&timezone=auto`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch weather data');
    }
    return response.json();
};

const fetchLocationName = async (lat, lon) => {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Failed to fetch location name');
    }
    return response.json();
};

const WeatherPanel = () => {
    const [location, setLocation] = useState(null);
    const [geoError, setGeoError] = useState(null);
    const [isRequestingLocation, setIsRequestingLocation] = useState(false);

    const requestLocation = () => {
        setIsRequestingLocation(true);
        setGeoError(null);

        if (!navigator.geolocation) {
            setGeoError("Geolocation is not supported by your browser.");
            setIsRequestingLocation(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude
                });
                setIsRequestingLocation(false);
            },
            (error) => {
                console.error("Geolocation error:", error);
                setGeoError(`Location error (${error.code}): ${error.message}`);
                setIsRequestingLocation(false);
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );
    };

    const { 
        data: weatherData, 
        isLoading: isWeatherLoading, 
        isError: isWeatherError 
    } = useQuery({
        queryKey: ['weather', location?.lat, location?.lon],
        queryFn: () => fetchWeather(location.lat, location.lon),
        enabled: !!location, // Only fetch if location is available
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    const { 
        data: locationData, 
        isLoading: isLocationLoading 
    } = useQuery({
        queryKey: ['locationName', location?.lat, location?.lon],
        queryFn: () => fetchLocationName(location.lat, location.lon),
        enabled: !!location,
        staleTime: 60 * 60 * 1000, // 1 hour
    });

    if (!location && !isRequestingLocation && !geoError) {
        return (
            <div className="wp-container wp-center">
                <style>{css}</style>
                <CloudSun size={48} color="#60a5fa" style={{ marginBottom: 16 }} />
                <h3 className="wp-title">Local Weather</h3>
                <p className="wp-subtitle">Allow location access to see the current weather in your area.</p>
                <button onClick={requestLocation} className="wp-btn">
                    <MapPin size={18} />
                    Detect Location
                </button>
            </div>
        );
    }

    if (isRequestingLocation || (location && (isWeatherLoading || isLocationLoading))) {
        return (
            <div className="wp-container wp-center">
                <style>{css}</style>
                <Loader2 className="wp-spin" size={32} color="#3b82f6" style={{ marginBottom: 16 }} />
                <p className="wp-text">
                    {isRequestingLocation ? "Detecting location..." : "Fetching local weather..."}
                </p>
            </div>
        );
    }

    if (geoError) {
        return (
            <div className="wp-container wp-center">
                <style>{css}</style>
                <AlertCircle size={32} color="#f87171" style={{ marginBottom: 16 }} />
                <p className="wp-title" style={{ color: '#ef4444' }}>Location Error</p>
                <p className="wp-error-text">{geoError}</p>
            </div>
        );
    }

    if (isWeatherError) {
        return (
            <div className="wp-container wp-center">
                <style>{css}</style>
                <AlertCircle size={32} color="#f87171" style={{ marginBottom: 16 }} />
                <p className="wp-title" style={{ color: '#ef4444' }}>Weather Error</p>
                <p className="wp-error-text">Failed to load weather data.</p>
            </div>
        );
    }

    const current = weatherData?.current;
    const daily = weatherData?.daily;
    const isDay = current?.is_day === 1;
    const cityName = locationData?.city || locationData?.locality || "Current Location";

    const maxTemp = daily?.temperature_2m_max?.[0];
    const minTemp = daily?.temperature_2m_min?.[0];
    const sunriseTime = daily?.sunrise?.[0] ? new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;
    const sunsetTime = daily?.sunset?.[0] ? new Date(daily.sunset[0]).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null;

    return (
        <div className="wp-container">
            <style>{css}</style>
            
            {/* Header / Location */}
            <div className="wp-header">
                <MapPin size={18} color="#3b82f6" />
                <h2 className="wp-header-title">{cityName}</h2>
            </div>

            {/* Main Weather Info */}
            <div className="wp-main">
                <div className="wp-icon-wrapper">
                    <div className="wp-icon-glow"></div>
                    {isDay ? (
                        <Sun size={80} color="#fbbf24" fill="currentColor" className="wp-weather-icon" />
                    ) : (
                        <Moon size={80} color="#93c5fd" fill="currentColor" className="wp-weather-icon" />
                    )}
                </div>
                
                <div className="wp-temp-wrapper">
                    <span className="wp-temp">{Math.round(current?.temperature_2m)}</span>
                    <span className="wp-degree">°</span>
                </div>
                <p className="wp-condition">
                    {isDay ? "Sunny" : "Clear Night"}
                </p>
            </div>

            {/* Details Grid */}
            <div className="wp-grid">
                <div className="wp-grid-item">
                    <Wind size={20} color="#60a5fa" className="wp-item-icon" />
                    <span className="wp-item-label">Wind</span>
                    <span className="wp-item-value">
                        {current?.wind_speed_10m} <span className="wp-item-unit">km/h</span>
                    </span>
                </div>
                <div className="wp-grid-item">
                    <Droplets size={20} color="#60a5fa" className="wp-item-icon" />
                    <span className="wp-item-label">Humidity</span>
                    <span className="wp-item-value">
                        {current?.relative_humidity_2m}%
                    </span>
                </div>
                <div className="wp-grid-item">
                    <Thermometer size={20} color="#60a5fa" className="wp-item-icon" />
                    <span className="wp-item-label">High / Low</span>
                    <span className="wp-item-value">
                        {Math.round(maxTemp)}° / {Math.round(minTemp)}°
                    </span>
                </div>
                <div className="wp-grid-item">
                    {isDay ? <Sunset size={20} color="#60a5fa" className="wp-item-icon" /> : <Sunrise size={20} color="#60a5fa" className="wp-item-icon" />}
                    <span className="wp-item-label">{isDay ? "Sunset" : "Sunrise"}</span>
                    <span className="wp-item-value">
                        {isDay ? sunsetTime : sunriseTime}
                    </span>
                </div>
            </div>
        </div>
    );
};

const css = `
    .wp-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        width: 100%;
        background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%);
        font-family: 'Inter', system-ui, sans-serif;
        box-sizing: border-box;
    }
    .wp-center {
        justify-content: center;
        align-items: center;
        padding: 24px;
        text-align: center;
        background: #ffffff;
    }
    .wp-title {
        font-size: 18px;
        font-weight: 600;
        color: #1f2937;
        margin: 0 0 8px 0;
        line-height: 1.2;
    }
    .wp-subtitle {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 24px 0;
        line-height: 1.5;
    }
    .wp-text {
        font-size: 14px;
        color: #6b7280;
        margin: 0;
    }
    .wp-error-text {
        font-size: 12px;
        color: #f87171;
        margin: 0;
        max-width: 250px;
    }
    .wp-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: #3b82f6;
        color: #ffffff;
        border: none;
        padding: 10px 20px;
        border-radius: 12px;
        font-weight: 500;
        font-size: 15px;
        cursor: pointer;
        transition: background 0.2s;
        box-shadow: 0 1px 2px rgba(0,0,0,0.05);
    }
    .wp-btn:hover {
        background: #2563eb;
    }
    .wp-btn:active {
        transform: scale(0.98);
    }
    .wp-spin {
        animation: wp-spin-anim 1s linear infinite;
    }
    @keyframes wp-spin-anim {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
    .wp-header {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 20px;
        border-bottom: 1px solid rgba(219, 234, 254, 0.5);
        background: rgba(255, 255, 255, 0.5);
        backdrop-filter: blur(4px);
    }
    .wp-header-title {
        font-size: 14px;
        font-weight: 600;
        color: #1f2937;
        margin: 0;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .wp-main {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px;
    }
    .wp-icon-wrapper {
        position: relative;
        margin-bottom: 24px;
    }
    .wp-icon-glow {
        position: absolute;
        inset: 0;
        background: #60a5fa;
        opacity: 0.4;
        filter: blur(24px);
        border-radius: 50%;
    }
    .wp-weather-icon {
        position: relative;
        z-index: 10;
        filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
    }
    .wp-temp-wrapper {
        display: flex;
        align-items: flex-start;
        justify-content: center;
        line-height: 1;
    }
    .wp-temp {
        font-size: 64px;
        font-weight: 900;
        color: #1f2937;
        letter-spacing: -0.05em;
    }
    .wp-degree {
        font-size: 24px;
        font-weight: 700;
        color: #9ca3af;
        margin-top: 8px;
    }
    .wp-condition {
        font-size: 14px;
        font-weight: 500;
        color: #6b7280;
        margin: 4px 0 0 0;
    }
    .wp-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        padding: 20px;
        background: rgba(255, 255, 255, 0.6);
        border-top: 1px solid rgba(219, 234, 254, 0.5);
    }
    .wp-grid-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 12px;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 1px 2px rgba(0,0,0,0.02);
        border: 1px solid #f3f4f6;
    }
    .wp-item-icon {
        margin-bottom: 4px;
    }
    .wp-item-label {
        font-size: 12px;
        font-weight: 500;
        color: #9ca3af;
        margin-bottom: 4px;
    }
    .wp-item-value {
        font-size: 14px;
        font-weight: 700;
        color: #374151;
    }
    .wp-item-unit {
        font-size: 11px;
        font-weight: 400;
    }
`;

export default WeatherPanel;
