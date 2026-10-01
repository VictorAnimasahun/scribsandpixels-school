CITIES = {
    "lagos": (6.52, 3.38),
    "abuja": (9.06, 7.49),
    "port harcourt": (4.82, 7.03),
    "kano": (12.00, 8.52),
    "ibadan": (7.38, 3.95),
    "enugu": (6.46, 7.55),
}
CURRENT = "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m"


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


def main():
    city = input("City: ")
    try:
        build_params(city)
        print(f"Fetching weather for {city.strip().title()}...")
    except ValueError as error:
        print(error)


if __name__ == "__main__":
    main()
