def get_passing_scores(scores, pass_mark=50):
    return [s for s in scores if s >= pass_mark]

def get_average(scores):
    if len(scores) == 0:
        return 0
    return sum(scores) / len(scores)

def largest(numbers):
    best = numbers[0]
    for n in numbers:
        if n > best:
            best = n
    return best
