import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.model_selection import StratifiedShuffleSplit

df = pd.read_csv("lagos_housing.csv")
df["bed_cat"] = df["bedrooms"].clip(upper=5)
train_idx, test_idx = next(StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42).split(df, df["bed_cat"]))
train = df.iloc[train_idx].copy()

train.plot(kind="scatter", x="longitude", y="latitude", c="price_m", cmap="jet", alpha=0.4, colorbar=True)
plt.show()

corr = train.select_dtypes("number").corr()["price_m"].sort_values(ascending=False)
print(corr)
CORR_SIZE = train["size_sqm"].corr(train["price_m"])

train["size_per_bedroom"] = train["size_sqm"] / train["bedrooms"]
train["km_to_ikoyi"] = np.sqrt(((train["latitude"] - 6.452) * 111) ** 2 + ((train["longitude"] - 3.435) * 110) ** 2)
CORR_SIZE_PER_BEDROOM = train["size_per_bedroom"].corr(train["price_m"])
CORR_KM_TO_IKOYI = train["km_to_ikoyi"].corr(train["price_m"])
print("size per bedroom:", round(CORR_SIZE_PER_BEDROOM, 3), " km to Ikoyi:", round(CORR_KM_TO_IKOYI, 3))
