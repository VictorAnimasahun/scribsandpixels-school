def add_contact(name, phone):
    with open("contacts.txt", "a") as file:
        file.write(name + "," + phone + "\n")
    print("Contact saved!")
def view_all_contacts():
    try:
        with open("contacts.txt") as f:
            for line in f:
                print(line.strip())
    except FileNotFoundError:
        print("No contacts yet.")
def search_contact(search_name):
    try:
        with open("contacts.txt") as f:
            for line in f:
                name, phone = line.strip().split(",")
                if name.lower() == search_name.lower():
                    print(name, phone); return
    except FileNotFoundError:
        pass
    print("Not found")
