from django import template
from cooking.models import Category
from django.db.models import Count
from django.db.models import Q


register = template.Library()

@register.simple_tag
def get_all_categories():
    """
    Возвращает все категории, у которых есть хотя бы один пост.
    """
    return Category.objects.annotate(cnt=Count('posts', filter=Q(posts__is_published=True))).filter(cnt__gt=0)