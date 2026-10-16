import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("lagos_housing.csv")
print(df.head())
df.info()

N_ROWS = len(df)
MISSING_SIZE = df["size_sqm"].isna().sum()
N_AREA_SPELLINGS = df["area"].nunique()
MEDIAN_PRICE = df["price_m"].median()
N_CAPPED = (df["price_m"] == 500).sum()
MAX_SIZE = df["size_sqm"].max()

print(df["area"].value_counts())

df["price_m"].hist(bins=50)
plt.xlabel("price (₦ millions)")
plt.show()
