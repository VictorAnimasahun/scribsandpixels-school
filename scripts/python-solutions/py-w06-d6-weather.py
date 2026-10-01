CITIES = {"lagos": (6.52, 3.38), "abuja": (9.06, 7.49), "kano": (12.00, 8.52)}
CURRENT = "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"
CODES = {0: "Clear sky", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast", 61: "Rain", 63: "Rain", 95: "Thunderstorm"}

SAVED = {
    6.52: (200, {"current": {"temperature_2m": 25.7, "relative_humidity_2m": 85, "weather_code": 2, "wind_speed_10m": 10.6}}),
    9.06: (200, {"current": {"temperature_2m": 23.1, "relative_humidity_2m": 92, "weather_code": 63, "wind_speed_10m": 6.2}}),
    12.0: (500, {"error": True, "reason": "Server overloaded"}),
}


def fake_get(params):
    return SAVED[params["latitude"]]


def describe(code):
    return CODES.get(code, "Unknown")


def report(city, current):
    return (f"Weather in {city}: {describe(current['weather_code'])}, "
            f"{current['temperature_2m']}°C, humidity {current['relative_humidity_2m']}%, "
            f"wind {current['wind_speed_10m']} km/h")


def build_params(city):
    key = city.strip().lower()
    if key not in CITIES:
        raise ValueError(f"Sorry, I don't know {city.strip()}")
    latitude, longitude = CITIES[key]
    return {"latitude": latitude, "longitude": longitude, "current": CURRENT, "timezone": "Africa/Lagos"}


def check_response(status, body):
    if status != 200:
        raise RuntimeError(body.get("reason", "Unknown error"))
    return body["current"]


def weather_report(city, get=fake_get):
    try:
        params = build_params(city)
    except ValueError as error:
        return str(error)
    status, body = get(params)
    try:
        current = check_response(status, body)
    except RuntimeError as error:
        return f"Couldn't get the weather: {error}"
    return report(city.strip().title(), current)


def main():
    city = input("City: ")
    print(weather_report(city))


if __name__ == "__main__":
    main()
