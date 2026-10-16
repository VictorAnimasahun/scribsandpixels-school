import re
from collections import Counter

def words(text):
    """'Send your BVN!' -> ['send', 'your', 'bvn']  (lowercase, punctuation removed)"""
    return re.sub(r"[^a-z0-9]+", " ", text.lower()).split()

TRAIN = [
    ("Congratulations! You have won N5,000,000 in the MTN promo. Send your BVN to claim", "spam"),
    ("Your account will be blocked today. Send your BVN and PIN to reactivate it", "spam"),
    ("You have won a free iPhone in our promo. Click the link to claim your prize", "spam"),
    ("URGENT: claim your N250,000 bonus now. Send your BVN to this number", "spam"),
    ("Your prize is waiting. Claim it now before midnight", "spam"),
    ("Mummy please call me when you see this", "ham"),
    ("Meeting moved to 3pm, bring the sales report", "ham"),
    ("I will send the money for the rent tomorrow morning", "ham"),
    ("Your order from NaijaMart has been delivered. Thank you", "ham"),
    ("Are you coming to church on Sunday?", "ham"),
]

RULE_WORDS = ["free", "won", "bvn", "prize"]

def is_spam_rules(text):
    return any(w in RULE_WORDS for w in words(text))

def learn_spam_words(examples):
    spam_counts = Counter()
    ham_words = set()
    for text, label in examples:
        unique = set(words(text))
        if label == "spam":
            spam_counts.update(unique)
        else:
            ham_words |= unique
    return {w for w, n in spam_counts.items() if n >= 2 and w not in ham_words}

def is_spam_learned(text, spam_words):
    return sum(1 for w in words(text) if w in spam_words) >= 2

learned = learn_spam_words(TRAIN)
print("Learned spam words:", sorted(learned) if learned else learned)

NEW = "Congrats!!! U don win N5m for d promo. Claim am sharp sharp, send ur B V N"
print("Rules say spam?  ", is_spam_rules(NEW))
print("Learner says spam?", is_spam_learned(NEW, learned))
