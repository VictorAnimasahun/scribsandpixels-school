import json

contacts = [
    {"name": "Ada", "phone": "0803 111 2222"},
    {"name": "Tunde", "phone": "0805 333 4444"},
]


def save_contacts(contacts, filename):
    with open(filename, "w") as file:
        json.dump(contacts, file, indent=2)


def load_contacts(filename):
    try:
        with open(filename) as file:
            return json.load(file)
    except FileNotFoundError:
        return []
