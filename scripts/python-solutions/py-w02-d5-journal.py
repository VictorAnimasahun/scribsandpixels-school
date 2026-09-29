from datetime import date

def save_entry(text):
    with open("journal.txt", "a") as f:
        f.write(f"{date.today()}: {text}\n")

def read_entries():
    with open("journal.txt") as f:
        return [line.strip() for line in f]
