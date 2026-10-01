def format_naira(amount):
    return f"₦{amount:,}"


def total(expenses):
    result = 0
    for expense in expenses:
        result += expense["amount"]
    return result


def by_category(expenses):
    totals = {}
    for expense in expenses:
        category = expense["category"]
        totals[category] = totals.get(category, 0) + expense["amount"]
    return totals


expenses = []
while True:
    item = input("Item (or done): ")
    if item == "done":
        break
    while True:
        try:
            amount = int(input("Amount: "))
            break
        except ValueError:
            print("Amount must be a number")
    category = input("Category: ")
    expenses.append({"item": item, "amount": amount, "category": category})

print(f"Total: {format_naira(total(expenses))}")
for category, amount in by_category(expenses).items():
    print(f"{category}: {format_naira(amount)}")
