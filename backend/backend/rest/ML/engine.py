from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import date
import numpy as np

class CompatibilityEngine:
    def __init__(self, location_bonus=0.1, skill_bonus=0.05, gender_bonus=0.05):
        # Векторизатор TF-IDF
        self.vectorizer = TfidfVectorizer()
        # Бонусы за совпадения
        self.location_bonus = location_bonus
        self.skill_bonus = skill_bonus
        self.gender_bonus = gender_bonus
        # Хранение предвычисленных векторов пользователей
        self.user_vectors = {}  # {user_id: vector}
        self.user_profiles = []  # список профилей для быстрого доступа
        self.tfidf_matrix = None

    def calculate_age(self, birthdate):
        today = date.today()
        return today.year - birthdate.year - ((today.month, today.day) < (birthdate.month, birthdate.day))

    def profile_to_text(self, profile):
        """Преобразует профиль в текст для TF-IDF"""
        skills_text = " ".join(profile.skills) if getattr(profile, "skills", None) else ""
        profession = getattr(profile, "profession", "") or ""
        gender = getattr(profile, "gender", "") or ""
        location = getattr(profile, "locations", "") or ""
        inerests = getattr(profile, "inerests", "") or ""
        goals = getattr(profile, "goals", "") or ""
        age = self.calculate_age(profile.bithday) if getattr(profile, "bithday", None) else ""
        age_word = f"age_{age}" if age else ""
        return f"{profession} {gender} {skills_text} {inerests} {goals} {location} {age_word}".lower()

    def build_user_index(self, all_profiles):
        """
        Предварительно вычисляет TF-IDF векторы всех пользователей
        и сохраняет их в памяти.
        Это нужно, чтобы не пересчитывать на каждый запрос.
        """
        self.user_profiles = all_profiles
        texts = [self.profile_to_text(p) for p in all_profiles]
        self.tfidf_matrix = self.vectorizer.fit_transform(texts)
        self.user_vectors = {p.id: self.tfidf_matrix[i] for i, p in enumerate(all_profiles)}

    def recommend(self, base_profile, top_n=5):
        """
        Рекомендует топ-N похожих пользователей
        """
        if not self.user_profiles:
            return []

        # Вектор для base-профиля
        base_vector = self.vectorizer.transform([self.profile_to_text(base_profile)])

        # Косинусное сходство между base и всеми пользователями
        scores = cosine_similarity(base_vector, self.tfidf_matrix).flatten()

        # Дополнительные бонусы
        for i, p in enumerate(self.user_profiles):
            # Локация
            if getattr(base_profile, "locations", "").strip().lower() == getattr(p, "locations", "").strip().lower():
                scores[i] += self.location_bonus

            # Skills
            base_skills = set(getattr(base_profile, "skills", []))
            profile_skills = set(getattr(p, "skills", []))
            common_skills = base_skills.intersection(profile_skills)
            scores[i] += len(common_skills) * self.skill_bonus

            # Gender
            if getattr(base_profile, "gender", None) and getattr(p, "gender", None):
                if base_profile.gender == p.gender:
                    scores[i] += self.gender_bonus

            # Ограничиваем максимум 1.0
            scores[i] = min(scores[i], 1.0)

        # Убираем самого себя
        ids = [p.id for p in self.user_profiles]
        base_index = ids.index(base_profile.id) if base_profile.id in ids else None
        if base_index is not None:
            scores[base_index] = -1  # чтобы не попадал в топ

        # Берём top-N
        top_indices = scores.argsort()[::-1][:top_n]

        recommendations = []
        for i in top_indices:
            p = self.user_profiles[i]
            recommendations.append({
                "id": p.id,
                "name": getattr(p.user, "username", ""),
                "profession": getattr(p, "profession", ""),
                "gender": getattr(p, "gender", ""),
                "age": getattr(p, "age", ""),
                "skills": getattr(p, "skills", []),
                "location": getattr(p, "locations", ""),
                "score": round(float(scores[i]) * 100, 2),
            })
        return recommendations
