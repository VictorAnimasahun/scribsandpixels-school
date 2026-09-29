"""Generates the practice datasets for the Excel course.

NaijaMart is a fictional Nigerian retail chain. Every file is deterministic
(fixed seed), so the numbers in the lessons and answer keys stay valid.

    python3 generate.py

Writes CSVs next to this script. Open them in Excel (desktop or the free
Excel for the web); File > Save As .xlsx when a lesson says so.
"""

import csv
import random
from datetime import date, datetime, timedelta
from pathlib import Path

OUT = Path(__file__).parent
rng = random.Random(2026)

STORES = [
    ("Lagos", "Lagos - Ikeja"),
    ("Lagos", "Lagos - Lekki"),
    ("Lagos", "Lagos - Surulere"),
    ("Abuja", "Abuja - Wuse"),
    ("Abuja", "Abuja - Garki"),
    ("Port Harcourt", "Port Harcourt - GRA"),
    ("Kano", "Kano - Sabon Gari"),
    ("Ibadan", "Ibadan - Bodija"),
    ("Enugu", "Enugu - Independence Layout"),
]
STORE_WEIGHTS = [16, 14, 10, 13, 9, 11, 9, 9, 9]

FIRST = ["Chidi", "Amaka", "Tunde", "Ngozi", "Emeka", "Aisha", "Ibrahim", "Funmi", "Segun", "Zainab",
         "Obinna", "Kemi", "Musa", "Adaeze", "Bola", "Yusuf", "Chioma", "Dayo", "Halima", "Ifeanyi",
         "Tolu", "Nneka", "Sani", "Bisi", "Kelechi", "Hauwa", "Femi", "Ada", "Uche", "Maryam"]
LAST = ["Okafor", "Adeyemi", "Bello", "Eze", "Ibrahim", "Okonkwo", "Balogun", "Musa", "Nwosu", "Abubakar",
        "Olawale", "Chukwu", "Danjuma", "Afolabi", "Obi", "Suleiman", "Onyeka", "Adebayo", "Garba", "Uzor"]

# ProductID, Product, Category, Supplier, UnitCost, UnitPrice, ReorderLevel
PRODUCTS = [
    ("P001", "Tecno Spark 20", "Phones", "Transsion Nigeria", 118000, 145000, 15),
    ("P002", "Infinix Hot 40", "Phones", "Transsion Nigeria", 132000, 162000, 15),
    ("P003", "Samsung Galaxy A15", "Phones", "Samsung West Africa", 165000, 205000, 10),
    ("P004", "iPhone 13 (Refurbished)", "Phones", "iStore Lagos", 520000, 640000, 5),
    ("P005", "Oraimo Power Bank 20000mAh", "Accessories", "Oraimo", 14500, 21000, 40),
    ("P006", "Oraimo FreePods 4", "Accessories", "Oraimo", 17000, 25500, 30),
    ("P007", "Phone Charger (Fast)", "Accessories", "Oraimo", 4200, 7500, 60),
    ("P008", "HP 250 G9 Laptop", "Computers", "HP Nigeria", 480000, 585000, 6),
    ("P009", "Lenovo IdeaPad 3", "Computers", "Lenovo Distribution", 455000, 560000, 6),
    ("P010", "Dell Inspiron 15", "Computers", "Dell Nigeria", 530000, 649000, 5),
    ("P011", "Wireless Mouse", "Accessories", "Logitech Africa", 5500, 9500, 50),
    ("P012", "LG 43\" Smart TV", "TV & Audio", "LG Electronics", 285000, 349000, 8),
    ("P013", "Hisense 55\" 4K TV", "TV & Audio", "Hisense Nigeria", 410000, 499000, 5),
    ("P014", "JBL Flip 6 Speaker", "TV & Audio", "Harman Africa", 98000, 129000, 10),
    ("P015", "Sound Bar 2.1", "TV & Audio", "Hisense Nigeria", 72000, 95000, 10),
    ("P016", "Thermocool Freezer 200L", "Appliances", "Haier Thermocool", 265000, 318000, 6),
    ("P017", "Binatone Blender", "Appliances", "Binatone", 21000, 29500, 25),
    ("P018", "Scanfrost Gas Cooker", "Appliances", "Scanfrost", 185000, 229000, 6),
    ("P019", "Standing Fan 18\"", "Appliances", "Binatone", 28000, 38500, 20),
    ("P020", "Microwave Oven 20L", "Appliances", "Scanfrost", 68000, 86000, 10),
    ("P021", "Solar Generator 1kVA", "Power", "Lumos Solar", 390000, 475000, 4),
    ("P022", "Inverter Battery 200Ah", "Power", "Lumos Solar", 290000, 355000, 4),
    ("P023", "Surge Protector", "Power", "Oraimo", 7800, 12500, 40),
    ("P024", "Rice 50kg (Local)", "Groceries", "Mama Gold Mills", 68000, 78000, 30),
    ("P025", "Vegetable Oil 5L", "Groceries", "Power Oil", 14500, 17500, 50),
    ("P026", "Indomie Carton (40)", "Groceries", "Dufil Prima", 11200, 13500, 60),
    ("P027", "Milo 1kg Refill", "Groceries", "Nestle Nigeria", 7400, 9200, 50),
    ("P028", "Peak Milk Tin (24)", "Groceries", "FrieslandCampina", 13800, 16500, 40),
    ("P029", "Semovita 10kg", "Groceries", "Flour Mills Nigeria", 9800, 11800, 40),
    ("P030", "Sugar 1kg (x10)", "Groceries", "Dangote Sugar", 12500, 15000, 40),
    ("P031", "Ankara Fabric (6 yards)", "Fashion", "Kano Textiles", 12000, 18500, 30),
    ("P032", "Men's Senator Wear", "Fashion", "Aba Tailors Co-op", 22000, 35000, 20),
    ("P033", "Women's Ankara Dress", "Fashion", "Aba Tailors Co-op", 19000, 31000, 20),
    ("P034", "Sneakers (Unisex)", "Fashion", "Aba Footwear", 16000, 26000, 25),
    ("P035", "School Bag", "Fashion", "Aba Footwear", 7500, 12500, 30),
    ("P036", "Office Chair", "Furniture", "Mouka Furniture", 58000, 79000, 8),
    ("P037", "Study Desk", "Furniture", "Mouka Furniture", 46000, 64000, 8),
    ("P038", "Mattress 6x6", "Furniture", "Mouka", 142000, 178000, 6),
    ("P039", "Printer Paper A4 (Box)", "Office", "Paper Mills Ltd", 19500, 24500, 25),
    ("P040", "HP Ink Cartridge 305", "Office", "HP Nigeria", 9800, 14500, 30),
]
# Relative sales frequency: cheap items sell more often.
PRODUCT_WEIGHTS = [8, 8, 5, 1, 10, 9, 14, 2, 2, 1, 10, 3, 1, 4, 3, 2, 7, 2, 7, 4,
                   1, 1, 10, 9, 12, 14, 12, 10, 11, 10, 9, 6, 6, 7, 8, 3, 3, 2, 6, 7]

SALESPEOPLE = {}  # store -> list of names


def person(r=rng):
    return f"{r.choice(FIRST)} {r.choice(LAST)}"


def write(name, header, rows):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"{name}: {len(rows)} rows")


def seasonal_weight(d: date) -> float:
    # December and Easter/April are busy; February is quiet.
    return {1: 0.9, 2: 0.75, 3: 0.95, 4: 1.1, 5: 0.95, 6: 0.9, 7: 0.95,
            8: 1.0, 9: 1.05, 10: 1.1, 11: 1.2, 12: 1.6}[d.month]


def sales_rows(start: date, end: date, n: int, first_id: int, r: random.Random):
    days = [start + timedelta(i) for i in range((end - start).days + 1)]
    day_weights = [seasonal_weight(d) * (0.6 if d.weekday() == 6 else 1.0) for d in days]
    rows = []
    for i in range(n):
        d = r.choices(days, day_weights)[0]
        region, store = r.choices(STORES, STORE_WEIGHTS)[0]
        p = r.choices(PRODUCTS, PRODUCT_WEIGHTS)[0]
        ctype = r.choices(["Retail", "Wholesale", "Online"], [60, 15, 25])[0]
        units = r.randint(1, 3) if p[5] > 100000 else r.randint(1, 12)
        if ctype == "Wholesale":
            units *= r.randint(3, 8)
        discount = r.choices([0, 5, 10, 15], [60, 20, 15, 5])[0] if ctype != "Wholesale" else r.choice([10, 15])
        payment = "Transfer" if ctype == "Online" and r.random() < 0.6 else r.choices(
            ["Cash", "Transfer", "POS", "Card"], [25, 35, 30, 10])[0]
        rows.append([f"NM-{first_id + i:05d}", d.isoformat(), region, store, r.choice(SALESPEOPLE[store]),
                     ctype, p[0], p[1], p[2], units, p[5], discount, payment])
    rows.sort(key=lambda row: (row[1], row[0]))
    # Re-number in date order so IDs increase with time.
    for i, row in enumerate(rows):
        row[0] = f"NM-{first_id + i:05d}"
    return rows


SALES_HEADER = ["OrderID", "OrderDate", "Region", "Store", "Salesperson", "CustomerType",
                "ProductID", "Product", "Category", "Units", "UnitPrice", "DiscountPct", "PaymentMethod"]


def main():
    for _, store in STORES:
        SALESPEOPLE[store] = sorted({person() for _ in range(3)})

    # 1. Products
    write("products.csv", ["ProductID", "Product", "Category", "Supplier", "UnitCost", "UnitPrice", "ReorderLevel"],
          [list(p) for p in PRODUCTS])

    # 2. Sales 2025 (the main dataset)
    sales = sales_rows(date(2025, 1, 1), date(2025, 12, 31), 2400, 1, rng)
    write("sales_2025.csv", SALES_HEADER, sales)

    # 3. Monthly files for Power Query "From Folder" (Jan–Jun 2026)
    next_id = 10001
    for month in range(1, 7):
        start = date(2026, month, 1)
        end = (date(2026, month + 1, 1) if month < 12 else date(2027, 1, 1)) - timedelta(1)
        rows = sales_rows(start, end, rng.randint(230, 290), next_id, rng)
        next_id += len(rows)
        write(f"monthly-sales/sales_2026-{month:02d}.csv", SALES_HEADER, rows)

    # 4. Targets per region per month of 2025 (for variance, relationships, DAX)
    # Set around actual net sales (±15%) so some region-months hit target and some miss.
    actual = {}
    for row in sales:
        key = (row[2], row[1][:7])
        actual[key] = actual.get(key, 0) + row[9] * row[10] * (1 - row[11] / 100)
    targets = [[region, month, int(round(value * rng.uniform(0.85, 1.15), -5))]
               for (region, month), value in sorted(actual.items())]
    write("targets_2025.csv", ["Region", "Month", "SalesTarget"], targets)

    # 5. Employees
    departments = {
        "Sales": ["Sales Associate", "Senior Sales Associate", "Store Manager"],
        "Finance": ["Accountant", "Finance Analyst", "Finance Manager"],
        "Operations": ["Logistics Officer", "Inventory Clerk", "Operations Manager"],
        "HR": ["HR Officer", "HR Manager"],
        "IT": ["IT Support", "Data Analyst", "Software Developer"],
        "Marketing": ["Marketing Officer", "Social Media Manager"],
    }
    base_salary = {"Associate": 180000, "Senior": 260000, "Clerk": 170000, "Officer": 230000, "Support": 220000,
                   "Accountant": 300000, "Analyst": 380000, "Developer": 520000, "Manager": 650000}
    employees = []
    used = set()
    for i in range(1, 121):
        while True:
            first, last = rng.choice(FIRST), rng.choice(LAST)
            if (first, last) not in used:
                used.add((first, last))
                break
        dept = rng.choices(list(departments), [45, 12, 20, 6, 10, 7])[0]
        title = rng.choice(departments[dept])
        key = next(k for k in base_salary if k in title)
        salary = round(base_salary[key] * rng.uniform(0.9, 1.25), -3)
        hired = date(2015, 1, 1) + timedelta(rng.randint(0, 3800))
        born = date(1970, 1, 1) + timedelta(rng.randint(0, 10500))
        region = rng.choices([r for r, _ in STORES], STORE_WEIGHTS)[0]
        phone = f"0{rng.choice(['803', '806', '813', '703', '806', '905', '816', '802'])}{rng.randint(1000000, 9999999)}"
        employees.append([f"E{i:03d}", first, last, dept, title, region, hired.isoformat(), born.isoformat(),
                          int(salary), rng.choice(["F", "M"]), f"{first.lower()}.{last.lower()}@naijamart.ng", phone])
    write("employees.csv", ["EmployeeID", "FirstName", "LastName", "Department", "JobTitle", "Region", "HireDate",
                            "DateOfBirth", "MonthlySalary", "Gender", "Email", "Phone"], employees)

    # 6. Timesheet: 20 employees, March 2025 weekdays
    ts = []
    for emp in employees[:20]:
        d = date(2025, 3, 1)
        while d.month == 3:
            if d.weekday() < 5 and rng.random() > 0.05:
                cin = datetime(2025, 3, d.day, 7, 30) + timedelta(minutes=rng.randint(0, 75))
                cout = cin + timedelta(hours=8, minutes=rng.randint(-40, 150))
                ts.append([emp[0], d.isoformat(), cin.strftime("%H:%M"), cout.strftime("%H:%M")])
            d += timedelta(1)
    write("timesheet_2025-03.csv", ["EmployeeID", "Date", "ClockIn", "ClockOut"], ts)

    # 7. Messy customers: deliberately dirty data for cleaning practice
    city_variants = {
        "Lagos": ["Lagos", "lagos", "LAGOS", " Lagos ", "Lagos State", "Lag0s"],
        "Abuja": ["Abuja", "abuja", "FCT Abuja", "Abuja ", "ABUJA"],
        "Port Harcourt": ["Port Harcourt", "PH", "port harcourt", "Port-Harcourt"],
        "Kano": ["Kano", "kano", "KANO "],
        "Ibadan": ["Ibadan", "ibadan", "Ibadan, Oyo"],
        "Enugu": ["Enugu", "enugu", "ENUGU"],
    }
    customers = []
    for i in range(1, 301):
        first, last = rng.choice(FIRST), rng.choice(LAST)
        name = rng.choice([f"{first} {last}", f"{first.upper()} {last.upper()}", f"{first.lower()} {last.lower()}",
                           f"  {first} {last}", f"{last}, {first}", f"{first}  {last}"])
        digits = f"{rng.choice(['803', '806', '813', '703', '905', '816'])}{rng.randint(1000000, 9999999)}"
        phone = rng.choice([f"0{digits}", f"+234{digits}", f"234-{digits[:3]}-{digits[3:6]}-{digits[6:]}",
                            f"0{digits[:3]} {digits[3:6]} {digits[6:]}", ""])
        city = rng.choice(city_variants[rng.choice(list(city_variants))])
        joined = date(2022, 1, 1) + timedelta(rng.randint(0, 1200))
        joined_s = rng.choice([joined.isoformat(), joined.strftime("%d/%m/%Y"), joined.strftime("%d-%b-%Y"),
                               joined.strftime("%m/%d/%Y")])
        spend = rng.choice([f"{rng.randint(5, 900) * 1000}", f"₦{rng.randint(5, 900) * 1000:,}",
                            f"{rng.randint(5, 900) * 1000:,}.00", "N/A"])
        email = rng.choice([f"{first.lower()}.{last.lower()}@gmail.com", f"{first.lower()}{rng.randint(1, 99)}@yahoo.com",
                            f"{first.upper()}.{last.upper()}@GMAIL.COM", ""])
        customers.append([f"C{i:04d}", name, phone, email, city, joined_s, spend])
    # Duplicates
    for _ in range(15):
        customers.append(list(rng.choice(customers)))
    rng.shuffle(customers)
    write("messy_customers.csv", ["CustomerID", "FullName", "Phone", "Email", "City", "DateJoined", "TotalSpend"],
          customers)


if __name__ == "__main__":
    main()
