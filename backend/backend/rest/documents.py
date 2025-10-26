from django_elasticsearch_dsl import Document, Index, fields
from django_elasticsearch_dsl.registries import registry
from .models import UserProfile

# Имя индекса (аналог таблицы в БД)
user_profile_index = Index('user_profiles')

# Настройки индекса
user_profile_index.settings(
    number_of_shards=1,
    number_of_replicas=0
)

@registry.register_document
class UserProfileDocument(Document):
    # Описываем поля, которые будут индексироваться
    user_id = fields.IntegerField(attr='user_id')
    skills = fields.TextField()
    interests = fields.TextField()
    profession = fields.TextField()
    locations = fields.TextField()

    class Index:
        name = 'user_profiles'  # имя индекса в Elasticsearch

    class Django:
        model = UserProfile
        fields = [
            'id',
        ]