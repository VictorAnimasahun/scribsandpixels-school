import math
import random


def roll_dice():
    return random.randint(1, 6)


def buses_needed(people, seats=18):
    return math.ceil(people / seats)


def days_between(start, end):
    return (end - start).days
