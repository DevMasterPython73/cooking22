import requests
from bs4 import BeautifulSoup
import sqlite3

# Базовый URL
base_url = 'https://www.russianfood.com'

# Создаем или подключаемся к базе данных
conn = sqlite3.connect('recipes.db')
cursor = conn.cursor()

# Создаем таблицу, если она не существует
cursor.execute('''
CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY,
    title TEXT,
    link TEXT,
    image_url TEXT,
    description TEXT
)
''')

# URL для парсинга
url = base_url

# Заголовки для запроса
headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
}

# Получаем содержимое страницы
response = requests.get(url, headers=headers)

# Проверяем, успешен ли запрос
if response.status_code == 200:
    # Парсим HTML
    soup = BeautifulSoup(response.text, 'html.parser')
    
    # Пример: находим все рецепты
    recipes = soup.find_all('a', class_='title')

    for recipe in recipes:
        title = recipe.get_text()
        link = recipe['href']
        full_link = base_url + link
        
        # Получаем страницу рецепта для извлечения картинки и описания
        recipe_response = requests.get(full_link, headers=headers)
        if recipe_response.status_code == 200:
            recipe_soup = BeautifulSoup(recipe_response.text, 'html.parser')
            image = recipe_soup.find('img', alt=title)
            image_url = image['src'] if image else 'Нет изображения'
            description = recipe_soup.find('p')
            description_text = description.get_text() if description else 'Нет описания'
            
            # Сохраняем данные в базу данных
            cursor.execute('''
            INSERT INTO recipes (title, link, image_url, description)
            VALUES (?, ?, ?, ?)
            ''', (title, full_link, image_url, description_text))

# Сохраняем изменения и закрываем соединение
conn.commit()
conn.close()
