import math

REAL = [45, 120, 60]
PREDICTED = [50, 100, 63]

def mae(predicted, real):
    return sum(abs(p - r) for p, r in zip(predicted, real)) / len(real)

def rmse(predicted, real):
    return math.sqrt(sum((p - r) ** 2 for p, r in zip(predicted, real)) / len(real))

print("MAE: ", mae(PREDICTED, REAL))
print("RMSE:", rmse(PREDICTED, REAL))

REAL_4 = REAL + [80]
PREDICTED_4 = PREDICTED + [280]
print("MAE with the big miss: ", mae(PREDICTED_4, REAL_4))
print("RMSE with the big miss:", rmse(PREDICTED_4, REAL_4))

rmse_jump = rmse(PREDICTED_4, REAL_4) / rmse(PREDICTED, REAL)
mae_jump = mae(PREDICTED_4, REAL_4) / mae(PREDICTED, REAL)
print("RMSE grew", round(rmse_jump, 1), "times; MAE grew", round(mae_jump, 1), "times")
