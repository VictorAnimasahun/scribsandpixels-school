SIZES = [45, 55, 60, 70, 80, 90, 100, 120]
RENTS = [1.2, 1.5, 1.6, 1.9, 2.1, 2.4, 2.6, 3.1]

def knn_predict(size, k=3):
    pairs = sorted(zip([abs(s - size) for s in SIZES], RENTS))
    nearest = pairs[:k]
    return sum(rent for _, rent in nearest) / k

def fit_line(xs, ys):
    x_bar = sum(xs) / len(xs)
    y_bar = sum(ys) / len(ys)
    top = sum((x - x_bar) * (y - y_bar) for x, y in zip(xs, ys))
    bottom = sum((x - x_bar) ** 2 for x in xs)
    theta1 = top / bottom
    theta0 = y_bar - theta1 * x_bar
    return theta0, theta1

def predict_line(size, theta0, theta1):
    return theta0 + theta1 * size

print("k-NN, 84 m²:  ₦", knn_predict(84), "m")
line = fit_line(SIZES, RENTS)
print("Line:", line)
print("Line, 84 m²: ₦", predict_line(84, *line), "m")
