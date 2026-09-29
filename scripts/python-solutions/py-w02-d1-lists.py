foods = ["rice", "beans", "yam", "plantain", "egusi"]
foods.append("suya")
foods.remove("beans")
print(len(foods))
for number, food in enumerate(foods, start=1):
    print(f"{number}. {food}")
first = foods[0]
last = foods[-1]
