// Revolutionary Weather Dashboard - Interactive JavaScript

class WeatherDashboard {
    constructor() {
        this.currentLocation = 'New York';
        this.isVoiceListening = false;
        this.isARActive = false;
        this.globeRotation = 0;
        this.chatMessages = [];
        this.userScore = 0;
        this.locationElements = {};
        this.defaultLocation = { city: 'New York', country: 'US' };
        this.currentWeather = null;
        this.isFetchingWeather = false;
        
        // Weather data from provided JSON
        this.weatherData = {
            locations: [
                {"city": "New York", "country": "USA", "temp": 22, "condition": "Partly Cloudy", "humidity": 65, "windSpeed": 12, "pressure": 1013, "uvIndex": 6, "visibility": 10, "airQuality": 85},
                {"city": "London", "country": "UK", "temp": 18, "condition": "Rainy", "humidity": 88, "windSpeed": 8, "pressure": 998, "uvIndex": 2, "visibility": 5, "airQuality": 78},
                {"city": "Tokyo", "country": "Japan", "temp": 26, "condition": "Sunny", "humidity": 55, "windSpeed": 6, "pressure": 1018, "uvIndex": 8, "visibility": 15, "airQuality": 92}
            ],
            predictions: [
                {"user": "WeatherMaster", "prediction": "Rain in NYC tomorrow at 3PM", "confidence": 85, "score": 1250},
                {"user": "ClimateGuru", "prediction": "Temperature will hit 30°C in Tokyo", "confidence": 72, "score": 980},
                {"user": "StormChaser", "prediction": "Clear skies in London by evening", "confidence": 91, "score": 1580}
            ],
            communityReports: [
                {"user": "LocalWeatherWatcher", "location": "Central Park, NYC", "report": "Heavy morning fog, visibility under 100m", "timestamp": "2 hours ago", "verified": true},
                {"user": "SkyObserver", "location": "Tower Bridge, London", "report": "Light drizzle starting, umbrellas recommended", "timestamp": "45 minutes ago", "verified": true},
                {"user": "WeatherEnthusiast", "location": "Shibuya, Tokyo", "report": "Perfect blue skies, great day for outdoor activities", "timestamp": "1 hour ago", "verified": false}
            ],
            healthTips: [
                {"condition": "High UV", "recommendation": "Apply SPF 30+ sunscreen and wear protective clothing", "severity": "high"},
                {"condition": "High Humidity", "recommendation": "Stay hydrated and avoid strenuous outdoor activities", "severity": "medium"},
                {"condition": "Air Quality Alert", "recommendation": "Consider wearing a mask if you have respiratory sensitivities", "severity": "low"}
            ],
            microclimates: [
                {"area": "Downtown Manhattan", "temp": 24, "variance": "+2°C from city average"},
                {"area": "Central Park", "temp": 21, "variance": "-1°C from city average"},
                {"area": "Brooklyn Bridge", "temp": 23, "variance": "+1°C from city average"}
            ],
            aiResponses: [
                "I can help you with weather forecasts, climate patterns, and personalized recommendations. What would you like to know?",
                "Based on current conditions, I recommend light layers and an umbrella for today.",
                "The atmospheric pressure is dropping, which typically indicates incoming weather changes.",
                "Would you like me to set up health alerts based on tomorrow's weather conditions?"
            ]
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startClock();
        this.initializeAnimations();
        this.setupAIChat();
        this.setupVoiceControl();
        this.fetchWeatherForLocation(this.defaultLocation.city, this.defaultLocation.country);
        console.log('🌟 NeoWeather Dashboard Initialized - Welcome to the Future of Weather!');
    }
    
    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.navigateToSection(e));
        });
        
        // AI Chat
        const chatInput = document.getElementById('chat-input');
        const sendBtn = document.getElementById('send-chat');
        
        if (chatInput && sendBtn) {
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendChatMessage();
            });
            sendBtn.addEventListener('click', () => this.sendChatMessage());
        }
        
        // Quick question buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const question = e.target.getAttribute('data-question');
                this.askQuickQuestion(question);
            });
        });
        
        // Globe controls
        const rotateBtn = document.getElementById('rotate-globe');
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        
        if (rotateBtn) rotateBtn.addEventListener('click', () => this.rotateGlobe());
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => this.zoomGlobe('in'));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => this.zoomGlobe('out'));
        
        // Predictions
        const submitPrediction = document.getElementById('submit-prediction');
        if (submitPrediction) {
            submitPrediction.addEventListener('click', () => this.submitPrediction());
        }
        
        // Community reports
        const submitReport = document.getElementById('submit-report');
        if (submitReport) {
            submitReport.addEventListener('click', () => this.submitCommunityReport());
        }
        
        // AR controls
        const toggleAR = document.getElementById('toggle-ar');
        const captureAR = document.getElementById('capture-ar');
        const shareAR = document.getElementById('share-ar');
        
        if (toggleAR) toggleAR.addEventListener('click', () => this.toggleAR());
        if (captureAR) captureAR.addEventListener('click', () => this.captureAR());
        if (shareAR) shareAR.addEventListener('click', () => this.shareAR());
        
        // Voice control
        const voiceToggle = document.getElementById('voice-toggle');
        if (voiceToggle) {
            voiceToggle.addEventListener('click', () => this.toggleVoiceListening());
        }

        // Location selector
        const cityInput = document.getElementById('city-input');
        const countryInput = document.getElementById('country-input');
        const fetchWeatherBtn = document.getElementById('fetch-weather');

        if (cityInput) cityInput.value = this.defaultLocation.city;
        if (countryInput) countryInput.value = this.defaultLocation.country;

        this.locationElements = { cityInput, countryInput, fetchWeatherBtn };

        const handleFetch = () => {
            const city = cityInput?.value?.trim();
            const country = countryInput?.value?.trim();
            if (!city) {
                this.showNotification('Please enter a city name to update the weather.', 'warning');
                return;
            }
            this.fetchWeatherForLocation(city, country);
        };

        if (fetchWeatherBtn) {
            fetchWeatherBtn.addEventListener('click', handleFetch);
        }

        [cityInput, countryInput].forEach(input => {
            if (!input) return;
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    handleFetch();
                }
            });
        });
    }
    
    navigateToSection(e) {
        const targetSection = e.currentTarget?.getAttribute('data-section');
        if (!targetSection) return;

        this.activateSection(targetSection);
        this.playNavigationFeedback();
    }

    activateSection(sectionId) {
        if (!sectionId) return;

        const targetSectionEl = document.getElementById(sectionId);
        if (!targetSectionEl) return;

        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.getAttribute('data-section') === sectionId);
        });

        document.querySelectorAll('.section').forEach(section => {
            section.classList.toggle('active', section.id === sectionId);
        });

        this.onSectionChange(sectionId);
    }
    
    async fetchWeatherForLocation(city, country) {
        if (!city || this.isFetchingWeather) return;

        const normalizedCity = city.trim();
        if (!normalizedCity) {
            this.showNotification('Please provide a city name.', 'warning');
            return;
        }

        const normalizedCountry = country?.trim()?.toUpperCase() || '';

        try {
            this.isFetchingWeather = true;
            this.toggleFetchLoading(true);

            const location = await this.geocodeLocation(normalizedCity, normalizedCountry);
            const forecast = await this.requestWeather(location.latitude, location.longitude);

            const weatherPresentation = this.mapWeatherCode(forecast.current.weather_code);
            const uvCategory = this.mapUVIndexToCategory(forecast.uvIndex);

            this.updateWeatherDisplay({
                cityName: location.name,
                countryCode: location.country_code,
                latitude: location.latitude,
                longitude: location.longitude,
                temperature: forecast.current.temperature_2m,
                feelsLike: forecast.current.apparent_temperature,
                humidity: forecast.current.relative_humidity_2m,
                windSpeed: forecast.current.wind_speed_10m,
                uvIndex: forecast.uvIndex,
                uvCategory,
                visibility: forecast.visibility,
                weatherIcon: weatherPresentation.icon,
                weatherDescription: weatherPresentation.description
            });

            this.currentLocation = `${location.name}, ${location.country_code}`;
            this.currentWeather = {
                ...forecast,
                location,
                presentation: weatherPresentation,
                uvCategory
            };

            this.showNotification(`Weather updated for ${location.name}, ${location.country_code}`, 'success');
        } catch (error) {
            console.error('Weather fetch error:', error);
            const message = error?.message || 'Unable to retrieve weather information right now.';
            this.showNotification(message, 'error');
        } finally {
            this.isFetchingWeather = false;
            this.toggleFetchLoading(false);
        }
    }

    toggleFetchLoading(isLoading) {
        const { fetchWeatherBtn } = this.locationElements || {};
        if (!fetchWeatherBtn) return;

        fetchWeatherBtn.disabled = isLoading;
        fetchWeatherBtn.textContent = isLoading ? 'Fetching…' : 'Update Weather';
    }

    async geocodeLocation(city, countryCode) {
        const params = new URLSearchParams({
            name: city,
            count: '5',
            language: 'en',
            format: 'json'
        });

        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to contact the geocoding service.');
        }

        const data = await response.json();
        if (!data.results?.length) {
            throw new Error(`No results found for "${city}"${countryCode ? ` (${countryCode})` : ''}.`);
        }

        if (!countryCode) {
            return data.results[0];
        }

        const match = data.results.find(result => result.country_code?.toUpperCase() === countryCode);
        return match || data.results[0];
    }

    async requestWeather(latitude, longitude) {
        const params = new URLSearchParams({
            latitude: latitude.toString(),
            longitude: longitude.toString(),
            current: 'temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m',
            hourly: 'uv_index,visibility',
            daily: 'weather_code,temperature_2m_max,temperature_2m_min',
            timezone: 'auto',
            windspeed_unit: 'kmh'
        });

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
        if (!response.ok) {
            throw new Error('Failed to retrieve weather data.');
        }

        const data = await response.json();
        const current = data.current || {};
        const hourly = data.hourly || {};
        const hourlyIndex = this.findHourlyIndex(hourly.time, current.time);

        const uvIndex = Array.isArray(hourly.uv_index) && hourlyIndex !== null
            ? parseFloat(hourly.uv_index[hourlyIndex])
            : null;

        const visibilityRaw = Array.isArray(hourly.visibility) && hourlyIndex !== null
            ? parseFloat(hourly.visibility[hourlyIndex])
            : null;

        const visibility = Number.isFinite(visibilityRaw)
            ? `${(visibilityRaw / 1000).toFixed(1)} km`
            : '—';

        return {
            current,
            uvIndex,
            visibility,
            timezone: data.timezone,
            timezone_abbreviation: data.timezone_abbreviation,
            daily: data.daily || null,
            tomorrow: this.extractTomorrowForecast(data.daily, data.timezone)
        };
    }

    findHourlyIndex(times = [], targetTime) {
        if (!Array.isArray(times) || !times.length) return null;
        if (!targetTime) return 0;

        const exactIndex = times.findIndex(time => time === targetTime);
        if (exactIndex >= 0) return exactIndex;

        const targetDate = new Date(targetTime);
        let closestIndex = 0;
        let smallestDiff = Number.POSITIVE_INFINITY;

        times.forEach((time, index) => {
            const diff = Math.abs(new Date(time) - targetDate);
            if (diff < smallestDiff) {
                smallestDiff = diff;
                closestIndex = index;
            }
        });

        return closestIndex;
    }

    extractTomorrowForecast(daily) {
        if (!daily?.time?.length) return null;

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);
        const tomorrowKey = tomorrow.toISOString().slice(0, 10);

        const index = daily.time.findIndex(date => date === tomorrowKey);
        const resolvedIndex = index >= 0 ? index : Math.min(1, daily.time.length - 1);

        return {
            weather_code: daily.weather_code?.[resolvedIndex],
            temperature_max: daily.temperature_2m_max?.[resolvedIndex],
            temperature_min: daily.temperature_2m_min?.[resolvedIndex],
            date: daily.time?.[resolvedIndex]
        };
    }

    mapUVIndexToCategory(value) {
        if (!Number.isFinite(value)) return 'N/A';
        if (value < 3) return 'Low';
        if (value < 6) return 'Moderate';
        if (value < 8) return 'High';
        if (value < 11) return 'Very High';
        return 'Extreme';
    }

    mapWeatherCode(code) {
        const mapping = {
            0: { icon: '☀️', description: 'Clear sky' },
            1: { icon: '🌤️', description: 'Mainly clear' },
            2: { icon: '⛅', description: 'Partly cloudy' },
            3: { icon: '☁️', description: 'Overcast' },
            45: { icon: '🌫️', description: 'Fog' },
            48: { icon: '🌫️', description: 'Depositing rime fog' },
            51: { icon: '🌦️', description: 'Light drizzle' },
            53: { icon: '🌦️', description: 'Drizzle' },
            55: { icon: '🌧️', description: 'Dense drizzle' },
            61: { icon: '🌦️', description: 'Light rain' },
            63: { icon: '🌧️', description: 'Rain' },
            65: { icon: '🌧️', description: 'Heavy rain' },
            71: { icon: '🌨️', description: 'Snow fall' },
            73: { icon: '🌨️', description: 'Snow showers' },
            75: { icon: '❄️', description: 'Heavy snow' },
            77: { icon: '🌨️', description: 'Snow grains' },
            80: { icon: '🌦️', description: 'Rain showers' },
            81: { icon: '🌧️', description: 'Heavy showers' },
            82: { icon: '⛈️', description: 'Violent showers' },
            85: { icon: '🌨️', description: 'Snow showers' },
            86: { icon: '❄️', description: 'Heavy snow showers' },
            95: { icon: '⛈️', description: 'Thunderstorm' },
            96: { icon: '⛈️', description: 'Thunderstorm with hail' },
            99: { icon: '⛈️', description: 'Severe thunderstorm' }
        };

        return mapping[code] || { icon: '🌡️', description: 'Weather update' };
    }

    formatCoordinates(latitude, longitude) {
        const format = (value, positiveSuffix, negativeSuffix) => {
            const suffix = value >= 0 ? positiveSuffix : negativeSuffix;
            return `${Math.abs(value).toFixed(2)}° ${suffix}`;
        };

        return `${format(latitude, 'N', 'S')}, ${format(longitude, 'E', 'W')}`;
    }

    updateWeatherDisplay({
        cityName,
        countryCode,
        latitude,
        longitude,
        temperature,
        feelsLike,
        humidity,
        windSpeed,
        uvIndex,
        uvCategory,
        visibility,
        weatherIcon,
        weatherDescription
    }) {
        const locationNameEl = document.querySelector('.location-name');
        const coordsEl = document.querySelector('.location-coords');
        const tempValueEl = document.querySelector('.temp-value');
        const conditionIconEl = document.querySelector('.condition-icon');
        const conditionTextEl = document.querySelector('.condition-text');
        const feelsLikeEl = document.getElementById('feels-like-value');
        const humidityEl = document.getElementById('humidity-value');
        const windEl = document.getElementById('wind-value');
        const uvEl = document.getElementById('uv-value');

        if (locationNameEl) {
            locationNameEl.textContent = `${cityName}, ${countryCode}`;
        }

        if (coordsEl) {
            coordsEl.textContent = this.formatCoordinates(latitude, longitude);
        }

        if (tempValueEl && Number.isFinite(temperature)) {
            tempValueEl.textContent = Math.round(temperature);
        }

        if (conditionIconEl) {
            conditionIconEl.textContent = weatherIcon;
        }

        if (conditionTextEl) {
            conditionTextEl.textContent = weatherDescription;
        }

        if (feelsLikeEl && Number.isFinite(feelsLike)) {
            feelsLikeEl.textContent = `${Math.round(feelsLike)}°C`;
        }

        if (humidityEl && Number.isFinite(humidity)) {
            humidityEl.textContent = `${Math.round(humidity)}%`;
        }

        if (windEl && Number.isFinite(windSpeed)) {
            windEl.textContent = `${Math.round(windSpeed)} km/h`;
        }

        if (uvEl) {
            if (Number.isFinite(uvIndex)) {
                uvEl.textContent = `${uvIndex.toFixed(1)} ${uvCategory}`;
            } else {
                uvEl.textContent = 'N/A';
            }
        }

        this.updateMicroclimates(temperature);
    }

    updateMicroclimates(baseTemperature) {
        if (!Number.isFinite(baseTemperature)) return;

        const cards = document.querySelectorAll('.microclimate-card');
        const adjustments = [1.2, -0.8, 0.5, -1.5, 0.9];

        cards.forEach((card, index) => {
            const tempEl = card.querySelector('.micro-temp');
            const varianceEl = card.querySelector('.micro-variance');
            const adjustment = adjustments[index % adjustments.length];
            const adjustedTemp = baseTemperature + adjustment;

            if (tempEl) {
                tempEl.textContent = `${Math.round(adjustedTemp)}°C`;
            }

            if (varianceEl) {
                const prefix = adjustment > 0 ? '+' : '';
                varianceEl.textContent = `${prefix}${adjustment.toFixed(1)}°C from average`;
            }
        });
    }

    getCurrentConditionsSummary() {
        if (!this.currentWeather?.current) return null;

        const current = this.currentWeather.current;
        const description = this.currentWeather.presentation?.description || 'current conditions';
        const locationName = this.currentLocation || 'your area';
        const temperature = Number.isFinite(current.temperature_2m) ? `${Math.round(current.temperature_2m)}°C` : 'N/A';
        const feels = Number.isFinite(current.apparent_temperature) ? `${Math.round(current.apparent_temperature)}°C` : null;
        const humidity = Number.isFinite(current.relative_humidity_2m) ? `${Math.round(current.relative_humidity_2m)}% humidity` : null;
        const wind = Number.isFinite(current.wind_speed_10m) ? `${Math.round(current.wind_speed_10m)} km/h winds` : null;

        const parts = [`${temperature}`, description];
        if (feels) parts.push(`feels like ${feels}`);
        if (humidity) parts.push(humidity);
        if (wind) parts.push(wind);

        return `${locationName}: ${parts.filter(Boolean).join(', ')}.`;
    }

    onSectionChange(section) {
        switch(section) {
            case 'globe':
                this.initializeGlobe();
                break;
            case 'voice':
                this.updateVoiceStatus();
                break;
            case 'ar-view':
                this.initializeAR();
                break;
            case 'ai-chat':
                this.focusChatInput();
                break;
        }
    }
    
    startClock() {
        const updateTime = () => {
            const now = new Date();
            const timeEl = document.getElementById('current-time');
            const dateEl = document.getElementById('current-date');
            
            if (timeEl) {
                timeEl.textContent = now.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                });
            }
            
            if (dateEl) {
                dateEl.textContent = now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric'
                });
            }
        };
        
        updateTime();
        setInterval(updateTime, 1000);
    }
    
    initializeAnimations() {
        // Add particle effects to weather icons
        this.createWeatherParticles();
        
        // Animate weather data points
        this.animateDataPoints();
        
        // Initialize globe rotation
        this.startGlobeRotation();
    }
    
    createWeatherParticles() {
        const weatherCard = document.querySelector('.weather-card.main-weather');
        if (!weatherCard) return;
        
        // Create floating particles for atmospheric effect
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'weather-particle';
                particle.style.cssText = `
                    position: absolute;
                    width: 4px;
                    height: 4px;
                    background: rgba(50, 184, 198, 0.6);
                    border-radius: 50%;
                    pointer-events: none;
                    left: ${Math.random() * 100}%;
                    top: ${Math.random() * 100}%;
                    animation: floatParticle ${3 + Math.random() * 4}s ease-in-out infinite;
                `;
                
                weatherCard.appendChild(particle);
                
                // Remove particle after animation
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 7000);
            }, i * 200);
        }
    }
    
    animateDataPoints() {
        const dataPoints = document.querySelectorAll('.detail-item');
        dataPoints.forEach((point, index) => {
            setTimeout(() => {
                point.style.animation = 'slideInRight 0.6s ease-out forwards';
            }, index * 100);
        });
    }
    
    startGlobeRotation() {
        const globe = document.querySelector('.globe-sphere');
        if (globe) {
            setInterval(() => {
                this.globeRotation += 1;
                globe.style.transform = `rotate(${this.globeRotation}deg)`;
            }, 100);
        }
    }
    
    setupAIChat() {
        // Initialize with welcome message
        const welcomeMessage = {
            type: 'ai',
            content: this.weatherData.aiResponses[0],
            timestamp: new Date()
        };
        this.chatMessages.push(welcomeMessage);
    }
    
    sendChatMessage() {
        const chatInput = document.getElementById('chat-input');
        if (!chatInput || !chatInput.value.trim()) return;
        
        const message = chatInput.value.trim();
        chatInput.value = '';
        
        // Add user message
        this.addChatMessage('user', message);
        
        // Simulate AI processing
        setTimeout(() => {
            const response = this.generateAIResponse(message);
            this.addChatMessage('ai', response);
        }, 1000 + Math.random() * 2000);
    }
    
    addChatMessage(type, content) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageEl = document.createElement('div');
        messageEl.className = `message ${type}-message`;
        
        const avatarEl = document.createElement('div');
        avatarEl.className = 'message-avatar';
        avatarEl.textContent = type === 'ai' ? '🤖' : '👤';
        
        const contentEl = document.createElement('div');
        contentEl.className = 'message-content';
        contentEl.innerHTML = `<p>${content}</p>`;
        
        messageEl.appendChild(avatarEl);
        messageEl.appendChild(contentEl);
        
        chatMessages.appendChild(messageEl);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // Add message animation
        messageEl.style.animation = 'slideInUp 0.5s ease-out';
    }
    
    generateAIResponse(userMessage) {
        const message = userMessage.toLowerCase();
        const current = this.currentWeather?.current;
        const tomorrow = this.currentWeather?.tomorrow;
        const locationName = this.currentLocation || 'your area';
        const uvIndex = this.currentWeather?.uvIndex;
        const uvCategory = this.currentWeather?.uvCategory;
        const visibility = this.currentWeather?.visibility;
        const summary = this.getCurrentConditionsSummary();

        if (message.includes('tomorrow') || message.includes('forecast')) {
            if (tomorrow) {
                const presentation = this.mapWeatherCode(tomorrow.weather_code);
                const high = Number.isFinite(tomorrow.temperature_max) ? `${Math.round(tomorrow.temperature_max)}°C` : 'N/A';
                const low = Number.isFinite(tomorrow.temperature_min) ? `${Math.round(tomorrow.temperature_min)}°C` : 'N/A';
                return `Tomorrow in ${locationName} looks ${presentation.description.toLowerCase()}, with a high near ${high} and a low around ${low}. I'll keep you posted if conditions change.`;
            }
            return summary ? `I don't have tomorrow's forecast yet, but right now ${summary}` : "I'm still gathering data for that forecast. Ask me again in a bit!";
        }

        if (message.includes('umbrella') || message.includes('rain')) {
            const rainyCodes = new Set([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
            const rainLikelyNow = current ? rainyCodes.has(current.weather_code) : false;
            const rainLikelyTomorrow = tomorrow ? rainyCodes.has(tomorrow.weather_code) : false;

            if (rainLikelyNow || rainLikelyTomorrow) {
                return `I'd keep an umbrella handy—${rainLikelyNow ? 'showers are around right now' : 'there is a decent chance of rain tomorrow'}. Better to stay dry!`;
            }
            return `No umbrella needed at the moment in ${locationName}. Skies look clear, but I'll alert you if that changes.`;
        }

        if (message.includes('air quality') || message.includes('pollution')) {
            return visibility && summary
                ? `I don't have live air-quality sensors yet, but visibility is around ${visibility}, which usually indicates clean air. ${summary}`
                : "I'm not tracking air quality right now, but I'll add it soon!";
        }

        if (message.includes('outdoor') || message.includes('activities')) {
            if (current) {
                const temp = Number.isFinite(current.temperature_2m) ? `${Math.round(current.temperature_2m)}°C` : 'comfortable temperatures';
                const uvAdvice = Number.isFinite(uvIndex) ? `UV index is ${uvIndex.toFixed(1)} (${uvCategory}).` : 'UV index looks mild.';
                return `Conditions in ${locationName} are great for being outdoors—${temp}, ${this.currentWeather?.presentation?.description.toLowerCase()}. ${uvAdvice} Plan your activities and stay hydrated!`;
            }
            return "Once I have the latest readings, I'll help you plan outdoor time.";
        }

        if (message.includes('health') || message.includes('recommendation')) {
            const tips = [];
            if (Number.isFinite(current?.relative_humidity_2m) && current.relative_humidity_2m > 60) {
                tips.push('stay hydrated because humidity is elevated');
            }
            if (Number.isFinite(uvIndex) && uvIndex >= 3) {
                tips.push(`apply SPF 30+ sunscreen (UV index ${uvIndex.toFixed(1)} – ${uvCategory})`);
            }
            if (Number.isFinite(current?.wind_speed_10m) && current.wind_speed_10m > 20) {
                tips.push('watch for gusty winds');
            }

            if (tips.length) {
                return `Health check for ${locationName}: ${tips.join(', ')}. Enjoy your day safely!`;
            }
            return summary ? `Nothing extreme right now—${summary} Enjoy the fresh air!` : 'Everything looks stable—enjoy the day!';
        }

        const responses = this.weatherData.aiResponses;
        return responses[Math.floor(Math.random() * responses.length)];
    }
    
    askQuickQuestion(question) {
        const chatInput = document.getElementById('chat-input');
        if (chatInput) {
            chatInput.value = question;
            this.sendChatMessage();
        }
    }
    
    focusChatInput() {
        setTimeout(() => {
            const chatInput = document.getElementById('chat-input');
            if (chatInput) chatInput.focus();
        }, 100);
    }
    
    initializeGlobe() {
        const globe = document.querySelector('.globe-display');
        if (globe) {
            // Add interactive weather markers
            this.updateGlobeWeatherMarkers();
            
            // Make globe interactive
            globe.addEventListener('click', (e) => {
                this.handleGlobeClick(e);
            });
        }
    }
    
    updateGlobeWeatherMarkers() {
        const markers = document.querySelectorAll('.marker');
        markers.forEach(marker => {
            marker.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showMarkerInfo(e.target);
            });
        });
    }
    
    showMarkerInfo(marker) {
        const markerType = marker.className.includes('storm') ? 'Storm System' :
                          marker.className.includes('sun') ? 'Clear Skies' : 'Rain Zone';
        
        // Create popup info
        const popup = document.createElement('div');
        popup.className = 'marker-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h4>${markerType}</h4>
                <p>Click for detailed forecast</p>
            </div>
        `;
        popup.style.cssText = `
            position: absolute;
            top: -60px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(19, 52, 59, 0.95);
            border: 1px solid rgb(50, 184, 198);
            border-radius: 8px;
            padding: 12px;
            color: rgb(50, 184, 198);
            font-size: 12px;
            white-space: nowrap;
            z-index: 1000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        marker.style.position = 'relative';
        marker.appendChild(popup);
        
        // Remove popup after delay
        setTimeout(() => {
            if (popup.parentNode) {
                popup.parentNode.removeChild(popup);
            }
        }, 3000);
    }
    
    rotateGlobe() {
        const globe = document.querySelector('.globe-sphere');
        if (globe) {
            this.globeRotation += 90;
            globe.style.transform = `rotate(${this.globeRotation}deg)`;
            globe.style.transition = 'transform 1s ease-out';
            
            setTimeout(() => {
                globe.style.transition = '';
            }, 1000);
        }
    }
    
    zoomGlobe(direction) {
        const globeDisplay = document.querySelector('.globe-display');
        if (!globeDisplay) return;
        
        const currentScale = globeDisplay.style.transform.includes('scale') 
            ? parseFloat(globeDisplay.style.transform.match(/scale\(([\d.]+)\)/)[1])
            : 1;
        
        const newScale = direction === 'in' 
            ? Math.min(currentScale * 1.2, 2) 
            : Math.max(currentScale * 0.8, 0.5);
        
        globeDisplay.style.transform = `scale(${newScale})`;
        globeDisplay.style.transition = 'transform 0.5s ease-out';
        
        setTimeout(() => {
            globeDisplay.style.transition = '';
        }, 500);
    }
    
    handleGlobeClick(e) {
        // Calculate click position and show weather data for that region
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Simulate getting weather for clicked region
        const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Australia'];
        const randomRegion = regions[Math.floor(Math.random() * regions.length)];
        const randomTemp = Math.floor(Math.random() * 35) + 5;
        
        this.showGlobeWeatherInfo(x, y, randomRegion, randomTemp);
    }
    
    showGlobeWeatherInfo(x, y, region, temp) {
        const globe = document.querySelector('.globe-display');
        const infoPopup = document.createElement('div');
        infoPopup.className = 'globe-weather-info';
        infoPopup.innerHTML = `
            <div class="info-content">
                <h4>${region}</h4>
                <p>Temperature: ${temp}°C</p>
                <p>Conditions: ${temp > 25 ? 'Sunny' : temp > 15 ? 'Cloudy' : 'Cool'}</p>
            </div>
        `;
        infoPopup.style.cssText = `
            position: absolute;
            left: ${x}px;
            top: ${y}px;
            background: rgba(19, 52, 59, 0.95);
            border: 1px solid rgb(50, 184, 198);
            border-radius: 8px;
            padding: 16px;
            color: rgb(50, 184, 198);
            font-size: 14px;
            z-index: 1000;
            animation: popIn 0.3s ease-out;
            pointer-events: none;
        `;
        
        globe.appendChild(infoPopup);
        
        setTimeout(() => {
            if (infoPopup.parentNode) {
                infoPopup.parentNode.removeChild(infoPopup);
            }
        }, 4000);
    }
    
    submitPrediction() {
        const tempInput = document.getElementById('temp-prediction');
        if (!tempInput || !tempInput.value) {
            this.showNotification('Please enter a temperature prediction!', 'warning');
            return;
        }
        
        const prediction = parseFloat(tempInput.value);
        tempInput.value = '';
        
        // Simulate prediction submission
        this.userScore += Math.floor(Math.random() * 50) + 10;
        
        this.showNotification(`Prediction submitted! You predicted ${prediction}°C. Current score: ${this.userScore} points`, 'success');
        
        // Add to leaderboard simulation
        this.updateLeaderboard('You', `Temperature: ${prediction}°C at 6 PM`, Math.floor(Math.random() * 30) + 70);
    }
    
    updateLeaderboard(user, prediction, confidence) {
        const leaderboard = document.querySelector('.leaderboard-list');
        if (!leaderboard) return;
        
        const newEntry = document.createElement('div');
        newEntry.className = 'leader-item new-entry';
        newEntry.innerHTML = `
            <div class="leader-rank">★</div>
            <div class="leader-info">
                <div class="leader-name">${user}</div>
                <div class="leader-prediction">${prediction}</div>
            </div>
            <div class="leader-score">${this.userScore} pts</div>
            <div class="leader-confidence">${confidence}%</div>
        `;
        newEntry.style.cssText = `
            background: rgba(50, 184, 198, 0.2);
            animation: slideInLeft 0.6s ease-out;
        `;
        
        leaderboard.insertBefore(newEntry, leaderboard.firstChild);
        
        // Remove after showing for a while
        setTimeout(() => {
            newEntry.style.animation = 'fadeOut 0.5s ease-out';
            setTimeout(() => {
                if (newEntry.parentNode) {
                    newEntry.parentNode.removeChild(newEntry);
                }
            }, 500);
        }, 5000);
    }
    
    submitCommunityReport() {
        const locationInput = document.getElementById('report-location');
        const descriptionInput = document.getElementById('report-description');
        
        if (!locationInput?.value || !descriptionInput?.value) {
            this.showNotification('Please fill in both location and description!', 'warning');
            return;
        }
        
        const location = locationInput.value.trim();
        const description = descriptionInput.value.trim();
        
        // Clear inputs
        locationInput.value = '';
        descriptionInput.value = '';
        
        // Add to community feed
        this.addCommunityReport('You', location, description, 'just now', false);
        
        this.showNotification('Weather report submitted! Thank you for contributing to our community.', 'success');
    }
    
    addCommunityReport(user, location, report, timestamp, verified) {
        const reportsFeed = document.querySelector('.reports-feed');
        if (!reportsFeed) return;
        
        const reportEl = document.createElement('div');
        reportEl.className = `report-item ${verified ? 'verified' : ''}`;
        reportEl.innerHTML = `
            <div class="report-header">
                <div class="report-user">
                    <div class="user-avatar">👤</div>
                    <div class="user-info">
                        <div class="user-name">${user}</div>
                        <div class="report-time">${timestamp}</div>
                    </div>
                </div>
                <div class="verification-badge ${verified ? '' : 'pending'}">
                    ${verified ? '✓ Verified' : '⏳ Pending'}
                </div>
            </div>
            <div class="report-location">📍 ${location}</div>
            <div class="report-content">${report}</div>
        `;
        
        reportEl.style.animation = 'slideInUp 0.6s ease-out';
        reportsFeed.insertBefore(reportEl, reportsFeed.firstChild);
    }
    
    initializeAR() {
        const arCamera = document.querySelector('.ar-camera');
        if (arCamera) {
            this.animateARDataPoints();
        }
    }
    
    animateARDataPoints() {
        const dataPoints = document.querySelectorAll('.ar-data-point');
        dataPoints.forEach((point, index) => {
            setTimeout(() => {
                point.style.animation = 'arPointAppear 1s ease-out forwards';
            }, index * 300);
        });
    }
    
    toggleAR() {
        const toggleBtn = document.getElementById('toggle-ar');
        const arCamera = document.querySelector('.ar-camera');
        
        if (!toggleBtn || !arCamera) return;
        
        this.isARActive = !this.isARActive;
        
        if (this.isARActive) {
            toggleBtn.textContent = 'Disable AR';
            toggleBtn.style.background = 'rgb(255, 84, 89)';
            arCamera.style.background = 'radial-gradient(circle at center, rgba(50, 184, 198, 0.3), rgba(19, 52, 59, 0.9))';
            
            // Start AR simulation
            this.startARSimulation();
            this.showNotification('AR Mode Activated! Weather data overlays are now visible.', 'success');
        } else {
            toggleBtn.textContent = 'Enable AR';
            toggleBtn.style.background = '';
            arCamera.style.background = '';
            this.stopARSimulation();
            this.showNotification('AR Mode Deactivated.', 'info');
        }
    }
    
    startARSimulation() {
        const overlays = document.querySelector('.ar-overlays');
        if (overlays) {
            overlays.style.opacity = '1';
            
            // Animate AR data points
            const points = overlays.querySelectorAll('.ar-data-point');
            points.forEach(point => {
                point.style.animation = 'pulse 2s ease-in-out infinite';
            });
        }
    }
    
    stopARSimulation() {
        const overlays = document.querySelector('.ar-overlays');
        if (overlays) {
            overlays.style.opacity = '0.7';
            
            const points = overlays.querySelectorAll('.ar-data-point');
            points.forEach(point => {
                point.style.animation = '';
            });
        }
    }
    
    captureAR() {
        if (!this.isARActive) {
            this.showNotification('Please enable AR mode first!', 'warning');
            return;
        }
        
        // Simulate capture effect
        const arCamera = document.querySelector('.ar-camera');
        if (arCamera) {
            arCamera.style.animation = 'captureFlash 0.3s ease-out';
            setTimeout(() => {
                arCamera.style.animation = '';
            }, 300);
        }
        
        this.showNotification('AR weather view captured! Saved to your gallery.', 'success');
    }
    
    shareAR() {
        if (!this.isARActive) {
            this.showNotification('Please enable AR mode first!', 'warning');
            return;
        }
        
        this.showNotification('AR view shared to social media! #NeoWeatherAR', 'success');
    }
    
    setupVoiceControl() {
        // Simulate Web Speech API
        this.voiceCommands = {
            'what\'s the weather': () => this.voiceWeatherResponse(),
            'show me tomorrow\'s forecast': () => this.voiceForecastResponse(),
            'what\'s the air quality': () => this.voiceAirQualityResponse(),
            'should i carry an umbrella': () => this.voiceUmbrellaResponse(),
            'show me the 3d globe': () => this.navigateToGlobe(),
            'open community reports': () => this.navigateToCommunity()
        };
    }
    
    toggleVoiceListening() {
        const voiceToggle = document.getElementById('voice-toggle');
        const voiceCircle = document.querySelector('.voice-circle');
        const voiceStatus = document.getElementById('voice-status');
        
        if (!voiceToggle || !voiceCircle || !voiceStatus) return;
        
        this.isVoiceListening = !this.isVoiceListening;
        
        if (this.isVoiceListening) {
            voiceToggle.textContent = 'Stop Listening';
            voiceToggle.classList.add('listening');
            voiceCircle.classList.add('listening');
            voiceStatus.textContent = 'Listening... Say a command!';
            
            this.startVoiceListening();
        } else {
            voiceToggle.textContent = 'Start Listening';
            voiceToggle.classList.remove('listening');
            voiceCircle.classList.remove('listening');
            voiceStatus.textContent = 'Say "Hey Weather" to start';
            
            this.stopVoiceListening();
        }
    }
    
    startVoiceListening() {
        // Simulate voice recognition
        const commands = Object.keys(this.voiceCommands);
        
        setTimeout(() => {
            if (this.isVoiceListening) {
                const randomCommand = commands[Math.floor(Math.random() * commands.length)];
                this.processVoiceCommand(randomCommand);
            }
        }, 3000 + Math.random() * 4000);
    }
    
    stopVoiceListening() {
        // Stop voice recognition simulation
    }
    
    processVoiceCommand(command) {
        const voiceStatus = document.getElementById('voice-status');
        if (voiceStatus) {
            voiceStatus.textContent = `Heard: "${command}"`;
        }
        
        setTimeout(() => {
            if (this.voiceCommands[command]) {
                this.voiceCommands[command]();
            }
            
            if (voiceStatus) {
                voiceStatus.textContent = 'Command processed! Say another command.';
            }
        }, 1500);
    }
    
    voiceWeatherResponse() {
        const summary = this.getCurrentConditionsSummary();
        this.showNotification(summary ? `🎤 ${summary}` : '🎤 I am still gathering the latest readings—try again in a moment.', 'info');
    }
    
    voiceForecastResponse() {
        const tomorrow = this.currentWeather?.tomorrow;
        if (tomorrow) {
            const presentation = this.mapWeatherCode(tomorrow.weather_code);
            const high = Number.isFinite(tomorrow.temperature_max) ? `${Math.round(tomorrow.temperature_max)}°C` : 'N/A';
            const low = Number.isFinite(tomorrow.temperature_min) ? `${Math.round(tomorrow.temperature_min)}°C` : 'N/A';
            this.showNotification(`🎤 Tomorrow in ${this.currentLocation || 'your area'}: ${presentation.description}, high ${high}, low ${low}.`, 'info');
        } else {
            this.showNotification('🎤 Forecast data is loading—check back shortly for tomorrow’s outlook.', 'warning');
        }
        this.activateSection('predictions');
        this.playNavigationFeedback();
    }
    
    voiceAirQualityResponse() {
        if (this.currentWeather?.visibility) {
            this.showNotification(`🎤 I don't have air-quality sensors yet, but visibility is around ${this.currentWeather.visibility}.`, 'info');
        } else {
            this.showNotification('🎤 Air-quality data is not available yet, but I will add it soon!', 'warning');
        }
    }
    
    voiceUmbrellaResponse() {
        const rainyCodes = new Set([51, 53, 55, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99]);
        const rainLikelyNow = this.currentWeather?.current ? rainyCodes.has(this.currentWeather.current.weather_code) : false;
        const rainLikelyTomorrow = this.currentWeather?.tomorrow ? rainyCodes.has(this.currentWeather.tomorrow.weather_code) : false;

        if (rainLikelyNow || rainLikelyTomorrow) {
            this.showNotification('🎤 Keep an umbrella close—rain is either happening now or expected soon.', 'info');
        } else {
            this.showNotification('🎤 Skies look dry for now. No umbrella needed!', 'info');
        }
    }
    
    navigateToGlobe() {
        this.activateSection('globe');
        this.playNavigationFeedback();
        this.showNotification('🎤 Opening 3D weather globe...', 'info');
    }
    
    navigateToCommunity() {
        this.activateSection('community');
        this.playNavigationFeedback();
        this.showNotification('🎤 Opening community weather reports...', 'info');
    }
    
    updateVoiceStatus() {
        const voiceStatus = document.getElementById('voice-status');
        if (voiceStatus && !this.isVoiceListening) {
            voiceStatus.textContent = 'Say "Hey Weather" to start';
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-icon">
                    ${type === 'success' ? '✅' : type === 'warning' ? '⚠️' : type === 'error' ? '❌' : 'ℹ️'}
                </span>
                <span class="notification-message">${message}</span>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(19, 52, 59, 0.95);
            border: 1px solid ${type === 'success' ? 'rgb(50, 184, 198)' : type === 'warning' ? '#ffc107' : type === 'error' ? 'rgb(255, 84, 89)' : 'rgb(50, 184, 198)'};
            border-radius: 8px;
            padding: 16px 20px;
            color: ${type === 'success' ? 'rgb(50, 184, 198)' : type === 'warning' ? '#ffc107' : type === 'error' ? 'rgb(255, 84, 89)' : 'rgb(50, 184, 198)'};
            font-size: 14px;
            z-index: 10000;
            animation: slideInRight 0.5s ease-out;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after delay
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 500);
        }, 4000);
    }
    
    playNavigationFeedback() {
        // Simulate audio feedback with visual indicator
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 4px;
            height: 4px;
            background: rgb(50, 184, 198);
            border-radius: 50%;
            pointer-events: none;
            z-index: 10000;
            animation: navigationPulse 0.3s ease-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            if (feedback.parentNode) {
                feedback.parentNode.removeChild(feedback);
            }
        }, 300);
    }
}

// Add dynamic CSS animations
const dynamicStyles = document.createElement('style');
dynamicStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    @keyframes slideInUp {
        from { transform: translateY(20px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
    }
    
    @keyframes slideInLeft {
        from { transform: translateX(-20px); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes popIn {
        from { transform: scale(0.8); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes arPointAppear {
        from { transform: scale(0); opacity: 0; }
        to { transform: scale(1); opacity: 1; }
    }
    
    @keyframes captureFlash {
        0% { background: rgba(255, 255, 255, 0.8); }
        100% { background: ''; }
    }
    
    @keyframes navigationPulse {
        0% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(8); opacity: 0.6; }
        100% { transform: translate(-50%, -50%) scale(12); opacity: 0; }
    }
    
    @keyframes floatParticle {
        0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
        25% { transform: translateY(-20px) rotate(90deg); opacity: 1; }
        50% { transform: translateY(-10px) rotate(180deg); opacity: 0.8; }
        75% { transform: translateY(-30px) rotate(270deg); opacity: 1; }
    }
`;
document.head.appendChild(dynamicStyles);

// Initialize the dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WeatherDashboard();
});

// Add some global enhancements
window.addEventListener('load', () => {
    // Add loading completion effect
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 1s ease-in-out';
        document.body.style.opacity = '1';
    }, 100);
    
    // Add easter egg
    console.log(`
    ⚡ NeoWeather Dashboard ⚡
    
    🚀 Revolutionary Features Loaded:
    • AI Weather Conversations
    • 3D Interactive Globe
    • Hyperlocal Microclimates
    • Community Weather Network
    • Gamified Predictions
    • Health Integration
    • AR Weather Overlay
    • Voice Control System
    
    Welcome to the future of weather! 🌟
    `);
});

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Alt + number shortcuts for navigation
    if (e.altKey) {
        const sections = ['dashboard', 'ai-chat', 'globe', 'predictions', 'community', 'health', 'ar-view', 'voice'];
        const number = parseInt(e.key);
        if (number >= 1 && number <= sections.length) {
            const targetNav = document.querySelector(`[data-section="${sections[number - 1]}"]`);
            if (targetNav) targetNav.click();
        }
    }
    
    // Space to activate voice control from anywhere
    if (e.code === 'Space' && e.ctrlKey) {
        e.preventDefault();
        const voiceNav = document.querySelector('[data-section="voice"]');
        if (voiceNav) voiceNav.click();
    }
});