from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from datetime import date


class CompatibilityEngine:
    def __init__(self):
        self.vectorizer = TfidfVectorizer()

    def calculate_age(self, birthdate):
        today = date.today()
        return (
            today.year
            - birthdate.year
            - ((today.month, today.day) < (birthdate.month, birthdate.day))
        )

    def profile_to_text(self, profile):
        """
        Преобразует профиль пользователя в текст для TF-IDF.
        profile.skills можно хранить как список строк.
        """
        skills_text = " ".join(profile.skills) if hasattr(profile, "skills") else ""
        profession = profile.profession if hasattr(profile, "profession") else ""
        gender = profile.gender if hasattr(profile, "gender") else ""
        age = (
            self.calculate_age(profile.bithday)
            if hasattr(profile, "bithday") and profile.bithday
            else ""
        )
        age_word = f"age_{age}" if age else ""
        return f"{profession} {gender} {skills_text} {age_word}".lower()

    def compute_similarity(self, profile_a, profile_b):
        """
        Вычисляет сходство между двумя профилями в процентах.
        """
        texts = [self.profile_to_text(profile_a), self.profile_to_text(profile_b)]
        tfidf_matrix = self.vectorizer.fit_transform(texts)
        score = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return round(score * 100, 2)

    def recommend(self, base_profile, all_profiles, top_n=5):
        """
        Находит топ-N наиболее похожих пользователей к base_profile
        """
        texts = [self.profile_to_text(p) for p in all_profiles]
        base_text = self.profile_to_text(base_profile)
        tfidf_matrix = self.vectorizer.fit_transform([base_text] + texts)
        scores = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:]).flatten()
        top_indices = scores.argsort()[::-1][:top_n]

        recommendations = []
        for i in top_indices:
            p = all_profiles[i]
            recommendations.append(
                {
                    "id": p.id,
                    "name": getattr(p.user, "username", ""),
                    "profession": getattr(p, "profession", ""),
                    "gender": getattr(p, "gender", ""),
                    "age": getattr(p, "age", ""),
                    "skills": getattr(p, "skills", ""),
                    "score": round(float(scores[i]) * 100, 2),
                }
            )
        return recommendations


