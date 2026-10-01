orders = [
    {"city": "Lagos", "item": "rice", "amount": 15000},
    {"city": "Abuja", "item": "beans", "amount": 8000},
    {"city": "Lagos", "item": "garri", "amount": 4000},
    {"city": "Kano", "item": "rice", "amount": 12000},
    {"city": "Abuja", "item": "rice", "amount": 9000},
]

total = 0
for order in orders:
    total += order["amount"]


def city_totals(orders):
    totals = {}
    for order in orders:
        city = order["city"]
        totals[city] = totals.get(city, 0) + order["amount"]
    return totals


totals = city_totals(orders)
best = max(totals, key=totals.get)
print(f"Top city: {best}")
