# rest/ml/utils.py
def profile_to_text(profile):
    return (
        f"Профессия: {profile.profession or ''}. "
        f"Пол: {profile.gender or ''}. "
        f"Навыки: {' '.join(profile.skills or [])}. "
        f"Интересы: {' '.join(profile.interests or [])}. "
        f"Цели: {' '.join(profile.goals or [])}. "
        f"Локации: {' '.join(profile.locations or [])}. "
        f"Пол: {profile.gender or ''}. "

    )
