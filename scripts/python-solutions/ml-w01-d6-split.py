import numpy as np

FLATS = [(58, 1.29), (104, 2.88), (87, 2.39), (77, 2.2), (75, 1.78), (119, 3.09), (131, 3.12), (58, 1.41),
         (105, 2.75), (70, 1.97), (137, 3.38), (132, 3.13), (104, 2.49), (115, 3.14), (92, 2.46), (123, 3.18),
         (85, 2.58), (74, 1.77), (68, 2.22), (63, 2.2), (93, 2.67), (83, 2.29), (106, 2.56), (41, 1.2),
         (85, 2.11), (77, 1.99), (60, 1.5), (99, 2.57), (84, 2.4), (70, 1.71)]

def split(rows):
    return rows[:18], rows[18:24], rows[24:]

def fit(rows, degree):
    xs, ys = [r[0] for r in rows], [r[1] for r in rows]
    return np.poly1d(np.polyfit(xs, ys, degree))

def mae(model, rows):
    return float(np.mean([abs(model(x) - y) for x, y in rows]))

def compare(train, val):
    return {d: (mae(fit(train, d), train), mae(fit(train, d), val)) for d in range(1, 6)}

def best_degree(results):
    return min(results, key=lambda d: results[d][1])

def final_test(train, val, test, degree):
    return mae(fit(train + val, degree), test)

train, val, test = split(FLATS)
results = compare(train, val)
for d, (tr, va) in results.items():
    print(f"degree {d}: training error {tr:.3f}   validation error {va:.3f}")
d = best_degree(results)
print("Chosen degree:", d)
print("Honest test error (₦m):", final_test(train, val, test, d))
