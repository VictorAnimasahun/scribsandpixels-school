data = {
    "timezone": "Africa/Lagos",
    "current_units": {"temperature_2m": "°C", "relative_humidity_2m": "%", "wind_speed_10m": "km/h"},
    "current": {
        "time": "2026-10-01T22:30",
        "temperature_2m": 25.7,
        "relative_humidity_2m": 85,
        "weather_code": 2,
        "wind_speed_10m": 10.6,
    },
}

temp = data["current"]["temperature_2m"]
humidity = data["current"]["relative_humidity_2m"]
print(f"Temperature: {temp}{data['current_units']['temperature_2m']}")


def read_current(data):
    current = data["current"]
    return {
        "temp": current["temperature_2m"],
        "humidity": current["relative_humidity_2m"],
        "code": current["weather_code"],
        "wind": current["wind_speed_10m"],
    }
