number = int(input("Which times table? "))
evens = []
for i in range(1, 11):
    print(number, "x", i, "=", number * i)
    if number * i % 2 == 0:
        evens.append(number * i)
total = 0
for n in range(1, 101):
    total = total + n
print(total)
print("Even:", *evens)
