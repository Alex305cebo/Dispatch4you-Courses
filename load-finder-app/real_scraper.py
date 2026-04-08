"""
Реальный парсер для бесплатных load boards
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import re

class RealLoadScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        self.session = requests.Session()
    
    def scrape_pickatruckload(self, origin_state=None, equipment_type=None):
        """
        Парсинг PickaTruckLoad.com
        """
        print(f"🔍 Поиск грузов на PickaTruckLoad.com...")
        print(f"   Штат: {origin_state}, Тип: {equipment_type}")
        
        try:
            # URL для поиска грузов
            base_url = "https://www.pickatruckload.com/Load-Boards/index.html"
            
            # Параметры поиска
            params = {}
            if origin_state:
                params['origin_state'] = origin_state
            if equipment_type:
                params['equipment'] = equipment_type
            
            # Запрос
            response = self.session.get(base_url, headers=self.headers, params=params, timeout=15)
            response.raise_for_status()
            
            print(f"✅ Ответ получен: {response.status_code}")
            
            # Парсинг HTML
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Поиск грузов на странице
            loads = self._parse_loads_from_html(soup, origin_state, equipment_type)
            
            print(f"📦 Найдено грузов: {len(loads)}")
            return loads
            
        except requests.exceptions.RequestException as e:
            print(f"❌ Ошибка при запросе: {e}")
            return []
        except Exception as e:
            print(f"❌ Ошибка при парсинге: {e}")
            return []
    
    def _parse_loads_from_html(self, soup, origin_state, equipment_type):
        """
        Извлечение данных о грузах из HTML
        """
        loads = []
        
        # Ищем различные возможные структуры данных
        # Вариант 1: Таблица с грузами
        tables = soup.find_all('table')
        for table in tables:
            rows = table.find_all('tr')
            for row in rows[1:]:  # Пропускаем заголовок
                cells = row.find_all('td')
                if len(cells) >= 5:
                    try:
                        load = self._extract_load_from_row(cells)
                        if load:
                            loads.append(load)
                    except:
                        continue
        
        # Вариант 2: Div-блоки с грузами
        load_divs = soup.find_all('div', class_=re.compile(r'load|freight|shipment', re.I))
        for div in load_divs:
            try:
                load = self._extract_load_from_div(div)
                if load:
                    loads.append(load)
            except:
                continue
        
        # Если ничего не нашли, возвращаем тестовые данные с пометкой
        if not loads:
            print("⚠️  Структура сайта изменилась или требуется авторизация")
            print("📝 Показываю демо-данные для обучения")
            loads = self._get_demo_loads(origin_state, equipment_type)
        
        return loads
    
    def _extract_load_from_row(self, cells):
        """Извлечение данных из строки таблицы"""
        # Примерная структура (может отличаться)
        return {
            'id': cells[0].get_text(strip=True) if len(cells) > 0 else 'N/A',
            'origin': cells[1].get_text(strip=True) if len(cells) > 1 else 'N/A',
            'destination': cells[2].get_text(strip=True) if len(cells) > 2 else 'N/A',
            'equipment': cells[3].get_text(strip=True) if len(cells) > 3 else 'N/A',
            'rate': cells[4].get_text(strip=True) if len(cells) > 4 else 'N/A',
        }
    
    def _extract_load_from_div(self, div):
        """Извлечение данных из div-блока"""
        text = div.get_text()
        # Здесь будет логика извлечения данных из текста
        return None
    
    def _get_demo_loads(self, origin_state, equipment_type):
        """
        Демо-данные когда реальный парсинг не работает
        Генерируем грузы для любого штата
        """
        import random
        
        # Основные города по штатам
        cities_by_state = {
            'AZ': ['Phoenix', 'Tucson', 'Mesa'],
            'CA': ['Los Angeles', 'San Francisco', 'San Diego'],
            'TX': ['Houston', 'Dallas', 'Austin'],
            'FL': ['Miami', 'Jacksonville', 'Tampa'],
            'IL': ['Chicago', 'Springfield', 'Peoria'],
            'NY': ['New York', 'Buffalo', 'Rochester'],
            'GA': ['Atlanta', 'Savannah', 'Augusta'],
            'NC': ['Charlotte', 'Raleigh', 'Greensboro'],
            'OH': ['Columbus', 'Cleveland', 'Cincinnati'],
            'PA': ['Philadelphia', 'Pittsburgh', 'Harrisburg'],
        }
        
        # Популярные маршруты
        routes = [
            ('Phoenix, AZ', 'Los Angeles, CA', 373),
            ('Los Angeles, CA', 'Phoenix, AZ', 373),
            ('Houston, TX', 'Dallas, TX', 239),
            ('Miami, FL', 'Atlanta, GA', 663),
            ('Chicago, IL', 'Detroit, MI', 283),
            ('New York, NY', 'Boston, MA', 215),
        ]
        
        loads = []
        
        # Если указан штат, генерируем грузы из этого штата
        if origin_state and origin_state in cities_by_state:
            cities = cities_by_state[origin_state]
            
            # Генерируем 3-5 грузов
            for i in range(random.randint(3, 5)):
                origin_city = random.choice(cities)
                
                # Случайный пункт назначения
                dest_states = [s for s in cities_by_state.keys() if s != origin_state]
                dest_state = random.choice(dest_states)
                dest_city = random.choice(cities_by_state[dest_state])
                
                miles = random.randint(200, 1200)
                rate_per_mile = round(random.uniform(2.5, 3.5), 2)
                rate = int(miles * rate_per_mile)
                
                # Фильтр по типу оборудования
                equip = equipment_type if equipment_type else random.choice(['Dry Van', 'Reefer', 'Flatbed'])
                
                load = {
                    'id': f'PTL{random.randint(1000, 9999)}',
                    'origin': f'{origin_city}, {origin_state}',
                    'destination': f'{dest_city}, {dest_state}',
                    'pickup_date': '2026-02-25',
                    'equipment': equip,
                    'weight': f'{random.randint(30, 45)}000 lbs',
                    'length': '53 ft',
                    'rate': f'${rate:,}',
                    'miles': miles,
                    'rate_per_mile': rate_per_mile,
                    'broker': random.choice(['ABC Logistics', 'XYZ Freight', 'Transport Co', 'Haul Masters']),
                    'phone': f'(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    'posted': random.choice(['15 min ago', '30 min ago', '1 hour ago', '2 hours ago']),
                    'source': 'PickaTruckLoad (Demo)'
                }
                
                loads.append(load)
        else:
            # Если штат не указан, показываем популярные маршруты
            for origin, dest, miles in routes[:5]:
                rate_per_mile = round(random.uniform(2.7, 3.3), 2)
                rate = int(miles * rate_per_mile)
                
                equip = equipment_type if equipment_type else random.choice(['Dry Van', 'Reefer'])
                
                load = {
                    'id': f'PTL{random.randint(1000, 9999)}',
                    'origin': origin,
                    'destination': dest,
                    'pickup_date': '2026-02-25',
                    'equipment': equip,
                    'weight': f'{random.randint(35, 45)}000 lbs',
                    'length': '53 ft',
                    'rate': f'${rate:,}',
                    'miles': miles,
                    'rate_per_mile': rate_per_mile,
                    'broker': random.choice(['National Freight', 'Express Logistics', 'Prime Transport']),
                    'phone': f'(555) {random.randint(100, 999)}-{random.randint(1000, 9999)}',
                    'posted': random.choice(['20 min ago', '45 min ago', '1 hour ago']),
                    'source': 'PickaTruckLoad (Demo)'
                }
                
                loads.append(load)
        
        return loads
    
    def search_loads(self, filters):
        """
        Главный метод поиска
        """
        origin_state = filters.get('origin_state')
        equipment_type = filters.get('equipment_type')
        
        # Пробуем реальный парсинг
        loads = self.scrape_pickatruckload(origin_state, equipment_type)
        
        # Сортировка по $/миля
        loads.sort(key=lambda x: x.get('rate_per_mile', 0), reverse=True)
        
        return loads

if __name__ == "__main__":
    # Тест
    scraper = RealLoadScraper()
    loads = scraper.search_loads({
        'origin_state': 'CA',
        'equipment_type': 'Dry Van'
    })
    
    print(f"\n📊 Результаты:")
    for load in loads:
        print(f"  {load['origin']} → {load['destination']} | ${load['rate_per_mile']:.2f}/mile | {load['source']}")
