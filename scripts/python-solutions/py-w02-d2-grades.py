scores = [45, 72, 38, 91, 55]
highest = max(scores)
lowest = min(scores)
average = sum(scores) / len(scores)
print("Pass" if average >= 50 else "Fail")
top_three = sorted(scores, reverse=True)[:3]
has_72 = 72 in scores
