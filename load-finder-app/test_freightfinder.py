"""
Тестирование FreightFinder.com
"""
import requests
from bs4 import BeautifulSoup

headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

url = 'https://www.freightfinder.com/database/search/'

print(f"🔍 Проверяю: {url}\n")

try:
    response = requests.get(url, headers=headers, timeout=15)
    print(f"Статус: {response.status_code}")
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Сохраняем
        with open('freightfinder_search.html', 'w', encoding='utf-8') as f:
            f.write(soup.prettify())
        
        print("✅ Страница загружена!")
        print(f"Заголовок: {soup.title.string if soup.title else 'N/A'}")
        
        # Ищем формы
        forms = soup.find_all('form')
        print(f"\nФорм: {len(forms)}")
        
        for i, form in enumerate(forms):
            print(f"\nФорма {i+1}:")
            inputs = form.find_all('input')
            selects = form.find_all('select')
            print(f"  Inputs: {len(inputs)}")
            print(f"  Selects: {len(selects)}")
            
            # Показываем поля
            for inp in inputs[:5]:
                print(f"    - {inp.get('name', 'N/A')}: {inp.get('type', 'text')}")
        
        # Ищем таблицы с грузами
        tables = soup.find_all('table')
        print(f"\nТаблиц: {len(tables)}")
        
        # Ищем div с результатами
        results_div = soup.find('div', id=re.compile(r'result|load', re.I))
        if results_div:
            print(f"\nНайден div с результатами: {results_div.get('id')}")
        
        print("\n💾 Сохранено в freightfinder_search.html")
        
except Exception as e:
    print(f"❌ Ошибка: {e}")
