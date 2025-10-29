from .engine import CompatibilityEngine

engine = CompatibilityEngine()


class DummyProfile:
    def __init__(self, id, user, profession="", gender="", bithday=None,
                 skills=None, inerests="", goals="", locations=""):
        self.id = id
        self.user = user
        self.profession = profession
        self.gender = gender
        self.bithday = bithday
        self.skills = skills or []
        self.inerests = inerests
        self.goals = goals
        self.locations = locations
        self.age = self.calculate_age() if bithday else None

    def calculate_age(self):
        today = date.today()
        return today.year - self.bithday.year - ((today.month, today.day) < (self.bithday.month, self.bithday.day))

class DummyUser:
    def __init__(self, username):
        self.username = username


from datetime import date

# --- Примеры профилей ---
profiles = [
    DummyProfile(
        id=1,
        user=DummyUser("ivan"),
        profession="Frontend Developer",
        gender="male",
        bithday=date(1995, 5, 10),
        skills=["javascript", "react", "css"],
        locations="Moscow",
    ),
    DummyProfile(
        id=2,
        user=DummyUser("anna"),
        profession="Backend Developer",
        gender="female",
        bithday=date(1998, 9, 3),
        skills=["django", "python", "rest api"],
        locations="Moscow",
    ),
    DummyProfile(
        id=3,
        user=DummyUser("oleg"),
        profession="Data Scientist",
        gender="male",
        bithday=date(1992, 12, 1),
        skills=["python", "pandas", "sklearn"],
        locations="Saint Petersburg",
    ),
    DummyProfile(
        id=4,
        user=DummyUser("elena"),
        profession="Frontend Developer",
        gender="female",
        bithday=date(1997, 2, 20),
        skills=["javascript", "vue", "html", "css"],
        locations="Moscow",
    ),
    DummyProfile(
        id=5,
        user=DummyUser("sergey"),
        profession="Backend Developer",
        gender="male",
        bithday=date(1996, 8, 15),
        skills=["python", "django", "postgresql"],
        locations="Saint Petersburg",
    ),
    DummyProfile(
        id=6,
        user=DummyUser("Alesya"),
        profession="Desighner",
        gender="female",
        bithday=date(1996, 8, 15),
        skills=["figma", "tilda", "photoshop", "AdobePremier", "AbobeElusrtator"],# 10 let
        locations="Rostov on don",
    ),
]

engine.build_user_index(profiles)
# Проверим сходство
base = profiles[0]
recomendations = engine.recommend(base, top_n=3)
# Рекомендации
for r in recomendations:
    print(r)
