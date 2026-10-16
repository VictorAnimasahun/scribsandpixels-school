import numpy as np
import pandas as pd
from zlib import crc32
from sklearn.model_selection import train_test_split, StratifiedShuffleSplit

df = pd.read_csv("lagos_housing.csv")

train_set, test_set = train_test_split(df, test_size=0.2, random_state=42)

def in_test_by_id(number):
    return crc32(np.int64(number)) & 0xffffffff < 0.2 * 2**32

df["bed_cat"] = df["bedrooms"].clip(upper=5)
split = StratifiedShuffleSplit(n_splits=1, test_size=0.2, random_state=42)
train_idx, test_idx = next(split.split(df, df["bed_cat"]))
strat_train, strat_test = df.iloc[train_idx], df.iloc[test_idx]

def worst_gap(test_part):
    overall = df["bed_cat"].value_counts(normalize=True)
    part = test_part["bed_cat"].value_counts(normalize=True)
    return float(((part / overall - 1).abs() * 100).max())

rand_test = train_test_split(df, test_size=0.2, random_state=7)[1]
print("random test set, worst bedroom gap:     ", round(worst_gap(rand_test), 1), "%")
print("stratified test set, worst bedroom gap: ", round(worst_gap(strat_test), 1), "%")
