FRAMING = {
    "supervision": "supervised",
    "task": "regression",
    "features": "multiple",
    "outputs": "univariate",
    "learning": "batch",
}

ESTIMATES = [58, 100, 61, 70, 44, 260, 96, 15, 180, 50]
ACTUAL    = [45, 120, 60, 88, 30, 250, 75, 15, 140, 52]

def share_off_by_more_than(estimates, actual, limit):
    off = sum(1 for e, a in zip(estimates, actual) if abs(e - a) / a > limit)
    return off / len(actual)

print("Agents more than 20% off:", share_off_by_more_than(ESTIMATES, ACTUAL, 0.20))
