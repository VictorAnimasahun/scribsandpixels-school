try:
    amount = int(input("Amount: "))
    people = int(input("People: "))
    print(f"Each person pays ₦{amount // people:,}")
except ValueError:
    print("Please enter numbers only.")
except ZeroDivisionError:
    print("Can't split between 0 people.")
