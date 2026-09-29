bill = float(input("Bill amount (₦): "))
people = int(input("How many people? "))
print(round(bill / people, 2))
each = (bill // people) // 1000 * 1000
print("Left over:", int(bill - each * people))
