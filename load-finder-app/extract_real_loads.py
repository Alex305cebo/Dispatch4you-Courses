"""
Извлечение реальных грузов с доступных источников
"""
import requests
from bs4 import BeautifulSoup
import json
import re

class RealLoadExtractor:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        }
        self.session = requests.Session()
    
    def extract_pickatruckload(self):
        """Извлечение грузов с PickaTruckLoad"""
        print("\n🔍 Извлекаю грузы с PickaTruckLoad.com...")
        
        try:
            url = "https://www.pickatruckload.com/Load-Boards/index.html"
            response = self.session.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Сохраняем HTML для анализа
            with open('pickatruckload_page.html', 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            
            print("✅ Страница загружена и сохранена в pickatruckload_page.html")
            
            # Ищем все возможные элементы с грузами
            loads = []
            
            # Вариант 1: Таблицы
            tables = soup.find_all('table')
            print(f"   Найдено таблиц: {len(tables)}")
            
            for i, table in enumerate(tables):
                print(f"\n   Таблица {i+1}:")
                rows = table.find_all('tr')
                print(f"   - Строк: {len(rows)}")
                
                if len(rows) > 1:
                    # Смотрим заголовки
                    headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                    print(f"   - Заголовки: {headers}")
                    
                    # Смотрим первую строку данных
                    if len(rows) > 1:
                        first_row = [td.get_text(strip=True) for td in rows[1].find_all('td')]
                        print(f"   - Первая строка: {first_row}")
            
            # Вариант 2: Div блоки
            all_divs = soup.find_all('div')
            print(f"\n   Всего div блоков: {len(all_divs)}")
            
            # Ищем div с классами содержащими load, freight, shipment
            load_divs = [d for d in all_divs if d.get('class') and any(
                keyword in ' '.join(d.get('class')).lower() 
                for keyword in ['load', 'freight', 'shipment', 'cargo']
            )]
            print(f"   Div с грузами: {len(load_divs)}")
            
            for i, div in enumerate(load_divs[:3]):  # Первые 3
                print(f"\n   Div {i+1}:")
                print(f"   - Классы: {div.get('class')}")
                print(f"   - Текст: {div.get_text(strip=True)[:100]}...")
            
            # Вариант 3: Ищем по ключевым словам в тексте
            text = soup.get_text()
            
            # Ищем номера телефонов
            phones = re.findall(r'\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}', text)
            print(f"\n   Найдено телефонов: {len(set(phones))}")
            if phones:
                print(f"   Примеры: {list(set(phones))[:3]}")
            
            # Ищем email
            emails = re.findall(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text)
            print(f"   Найдено email: {len(set(emails))}")
            if emails:
                print(f"   Примеры: {list(set(emails))[:3]}")
            
            # Ищем упоминания штатов (CA, TX, FL и т.д.)
            states = re.findall(r'\b[A-Z]{2}\b', text)
            state_counts = {}
            for state in states:
                state_counts[state] = state_counts.get(state, 0) + 1
            
            print(f"\n   Топ штатов: {sorted(state_counts.items(), key=lambda x: x[1], reverse=True)[:10]}")
            
            # Ищем цены ($1000, $2,500 и т.д.)
            prices = re.findall(r'\$[\d,]+', text)
            print(f"   Найдено цен: {len(prices)}")
            if prices:
                print(f"   Примеры: {prices[:5]}")
            
            return loads
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            return []
    
    def extract_convoy(self):
        """Извлечение грузов с Convoy"""
        print("\n🔍 Извлекаю грузы с Convoy.com...")
        
        try:
            url = "https://convoy.com/"
            response = self.session.get(url, headers=self.headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Сохраняем HTML
            with open('convoy_page.html', 'w', encoding='utf-8') as f:
                f.write(soup.prettify())
            
            print("✅ Страница загружена и сохранена в convoy_page.html")
            
            # Анализируем структуру
            text = soup.get_text()
            
            # Ищем API endpoints в скриптах
            scripts = soup.find_all('script')
            print(f"   Найдено скриптов: {len(scripts)}")
            
            for script in scripts:
                script_text = script.get_text()
                if 'api' in script_text.lower() or 'load' in script_text.lower():
                    # Ищем URL API
                    api_urls = re.findall(r'https?://[^\s"\']+api[^\s"\']*', script_text)
                    if api_urls:
                        print(f"   Найдены API URLs: {api_urls[:3]}")
            
            return []
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            return []

if __name__ == "__main__":
    extractor = RealLoadExtractor()
    
    print("="*60)
    print("🚛 ИЗВЛЕЧЕНИЕ РЕАЛЬНЫХ ГРУЗОВ")
    print("="*60)
    
    # Пробуем PickaTruckLoad
    loads1 = extractor.extract_pickatruckload()
    
    # Пробуем Convoy
    loads2 = extractor.extract_convoy()
    
    print("\n" + "="*60)
    print("✅ АНАЛИЗ ЗАВЕРШЕН")
    print("="*60)
    print("\nПроверь файлы:")
    print("  - pickatruckload_page.html")
    print("  - convoy_page.html")
