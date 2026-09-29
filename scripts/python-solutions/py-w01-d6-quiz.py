name = input("Welcome! What is your name? ")
print("Hello,", name, "! Let's play a quiz.")
score = 0
answer1 = input("What is the capital of Nigeria? ").lower()
if answer1 == "abuja":
    print("Correct!")
    score = score + 1
else:
    print("Wrong! The answer is Abuja.")
answer2 = input("What colour is the Nigerian flag besides white? ").lower()
if answer2 == "green":
    print("Correct!"); score += 1
else:
    print("Wrong! Green.")
answer3 = input("Largest city? ").lower()
if answer3 == "lagos":
    print("Correct!"); score += 1
else:
    print("Wrong! Lagos.")
print("Quiz over!", name, "you scored", score, "out of 3")
