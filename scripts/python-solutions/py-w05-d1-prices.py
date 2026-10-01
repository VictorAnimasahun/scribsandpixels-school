prices = {"rice": 1500, "beans": 1200, "garri": 800}

prices["yam"] = 2500
prices["rice"] = 1700

for name, price in prices.items():
    print(f"{name}: ₦{price:,}")

item = input("Item: ")
if item in prices:
    print(f"Price of {item} is ₦{prices[item]:,}")
else:
    print("Not sold here")
