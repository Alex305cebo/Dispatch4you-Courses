"""
Реальный парсер FreightFinder.com
"""
import requests
from bs4 import BeautifulSoup
import re

class FreightFinderScraper:
    def __init__(self):
        self.base_url = "https://www.freightfinder.com"
        self.search_url = f"{self.base_url}/database/search/city-radius"
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Referer': 'https://www.freightfinder.com/database/search/',
        }
        self.session = requests.Session()
    
    def search_loads(self, origin_city="Phoenix", origin_state="AZ", equipment="Dry Van"):
        """
        Поиск грузов
        """
        print(f"\n🔍 Поиск грузов на FreightFinder.com")
        print(f"   Откуда: {origin_city}, {origin_state}")
        print(f"   Оборудование: {equipment}")
        
        # Параметры запроса
        params = {
            'searchType': 'loads',
            'Equipment': equipment if equipment != 'Dry Van' else 'Van',
            'vchOrigin': f"{origin_city}, {origin_state}",
            'intOriginRadius': '100',  # радиус 100 миль
            'perPage': '25'
        }
        
        try:
            response = self.session.get(
                self.search_url,
                params=params,
                headers=self.headers,
                timeout=15
            )
            
            print(f"   Статус: {response.status_code}")
            print(f"   URL: {response.url}")
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Сохраняем результат
                with open('freightfinder_results.html', 'w', encoding='utf-8') as f:
                    f.write(soup.prettify())
                
                print(f"   ✅ Результаты сохранены в freightfinder_results.html")
                
                # Парсим грузы
                loads = self._parse_loads(soup)
                
                print(f"\n📦 Найдено грузов: {len(loads)}")
                
                return loads
            else:
                print(f"   ❌ Ошибка: {response.status_code}")
                return []
                
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            return []
    
    def _parse_loads(self, soup):
        """
        Извлечение грузов из HTML
        """
        loads = []
        
        # Ищем таблицу с результатами
        tables = soup.find_all('table')
        print(f"   Таблиц на странице: {len(tables)}")
        
        for table in tables:
            rows = table.find_all('tr')
            print(f"   Строк в таблице: {len(rows)}")
            
            if len(rows) > 1:
                # Первая строка - заголовки
                headers = [th.get_text(strip=True) for th in rows[0].find_all(['th', 'td'])]
                print(f"   Заголовки: {headers}")
                
                # Остальные строки - данные
                for row in rows[1:]:
                    cells = row.find_all('td')
                    if len(cells) >= 3:
                        load_data = {}
                        for i, cell in enumerate(cells):
                            if i < len(headers):
                                load_data[headers[i]] = cell.get_text(strip=True)
                        
                        if load_data:
                            loads.append(load_data)
        
        # Ищем div блоки с грузами
        load_divs = soup.find_all('div', class_=re.compile(r'load|result|listing', re.I))
        print(f"   Div блоков с грузами: {len(load_divs)}")
        
        # Ищем списки
        lists = soup.find_all(['ul', 'ol'])
        for lst in lists:
            items = lst.find_all('li')
            if len(items) > 3:
                print(f"   Список с {len(items)} элементами")
        
        # Показываем первые найденные грузы
        if loads:
            print(f"\n   Первый груз:")
            for key, value in list(loads[0].items())[:5]:
                print(f"     {key}: {value}")
        
        return loads

if __name__ == "__main__":
    scraper = FreightFinderScraper()
    
    # Тест 1: Phoenix, AZ
    loads = scraper.search_loads("Phoenix", "AZ", "Van")
    
    if loads:
        print(f"\n✅ УСПЕХ! Найдено {len(loads)} грузов")
        print("\nПервые 3 груза:")
        for i, load in enumerate(loads[:3], 1):
            print(f"\n{i}. {load}")
    else:
        print("\n⚠️  Грузы не найдены или требуется другой метод парсинга")
        print("Проверь файл freightfinder_results.html")
