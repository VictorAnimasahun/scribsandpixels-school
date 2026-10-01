CODES = {
    0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
    45: "Fog", 48: "Fog",
    51: "Drizzle", 53: "Drizzle", 55: "Drizzle",
    61: "Rain", 63: "Rain", 65: "Heavy rain",
    80: "Rain showers", 81: "Rain showers", 82: "Violent rain showers",
    95: "Thunderstorm", 96: "Thunderstorm with hail", 99: "Thunderstorm with hail",
}


def describe(code):
    return CODES.get(code, "Unknown")


def advice(temp, code):
    if 51 <= code <= 82 or 95 <= code <= 99:
        return "Take an umbrella"
    if temp >= 32:
        return "Stay hydrated"
    return "Enjoy your day"


def report(city, current):
    return (f"Weather in {city}: {describe(current['weather_code'])}, "
            f"{current['temperature_2m']}°C, humidity {current['relative_humidity_2m']}%, "
            f"wind {current['wind_speed_10m']} km/h")
