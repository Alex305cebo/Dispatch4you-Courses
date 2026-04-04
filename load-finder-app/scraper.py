"""
Scraper для сбора данных о грузах с бесплатных load boards
"""
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json

class LoadScraper:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
    
    def scrape_trulos(self, origin_city=None, origin_state=None, equipment_type=None):
        """
        Парсинг Trulos.com load board
        Сейчас использует тестовые данные
        """
        # Получаем тестовые данные
        loads = self._get_sample_loads()
        
        # Фильтрация по параметрам
        if origin_city:
            loads = [l for l in loads if origin_city.lower() in l['origin'].lower()]
        if origin_state:
            loads = [l for l in loads if origin_state.upper() in l['origin']]
        if equipment_type:
            loads = [l for l in loads if l['equipment'].lower() == equipment_type.lower()]
        
        return loads
    
    def _get_sample_loads(self):
        """
        Тестовые данные для разработки
        В реальной версии будут данные с сайта
        """
        return [
            {
                'id': 'TRL001',
                'origin': 'Chicago, IL',
                'destination': 'Dallas, TX',
                'pickup_date': '2026-02-25',
                'equipment': 'Dry Van',
                'weight': '42000 lbs',
                'length': '53 ft',
                'rate': '$2,800',
                'miles': 925,
                'rate_per_mile': 3.03,
                'broker': 'ABC Logistics',
                'phone': '(555) 123-4567',
                'posted': '2 hours ago'
            },
            {
                'id': 'TRL002',
                'origin': 'Los Angeles, CA',
                'destination': 'Phoenix, AZ',
                'pickup_date': '2026-02-26',
                'equipment': 'Reefer',
                'weight': '38000 lbs',
                'length': '53 ft',
                'rate': '$1,200',
                'miles': 373,
                'rate_per_mile': 3.22,
                'broker': 'XYZ Freight',
                'phone': '(555) 987-6543',
                'posted': '1 hour ago'
            },
            {
                'id': 'TRL003',
                'origin': 'Atlanta, GA',
                'destination': 'Miami, FL',
                'pickup_date': '2026-02-25',
                'equipment': 'Dry Van',
                'weight': '35000 lbs',
                'length': '53 ft',
                'rate': '$1,800',
                'miles': 663,
                'rate_per_mile': 2.72,
                'broker': 'Southern Transport',
                'phone': '(555) 456-7890',
                'posted': '30 minutes ago'
            },
            {
                'id': 'TRL004',
                'origin': 'New York, NY',
                'destination': 'Boston, MA',
                'pickup_date': '2026-02-27',
                'equipment': 'Flatbed',
                'weight': '45000 lbs',
                'length': '48 ft',
                'rate': '$850',
                'miles': 215,
                'rate_per_mile': 3.95,
                'broker': 'Northeast Carriers',
                'phone': '(555) 321-0987',
                'posted': '4 hours ago'
            },
            {
                'id': 'TRL005',
                'origin': 'Houston, TX',
                'destination': 'Denver, CO',
                'pickup_date': '2026-02-26',
                'equipment': 'Dry Van',
                'weight': '40000 lbs',
                'length': '53 ft',
                'rate': '$3,200',
                'miles': 1019,
                'rate_per_mile': 3.14,
                'broker': 'Mountain Freight',
                'phone': '(555) 654-3210',
                'posted': '15 minutes ago'
            },
            {
                'id': 'TRL006',
                'origin': 'Miami, FL',
                'destination': 'Atlanta, GA',
                'pickup_date': '2026-02-25',
                'equipment': 'Dry Van',
                'weight': '38000 lbs',
                'length': '53 ft',
                'rate': '$1,900',
                'miles': 663,
                'rate_per_mile': 2.87,
                'broker': 'Florida Express',
                'phone': '(555) 111-2222',
                'posted': '20 minutes ago'
            },
            {
                'id': 'TRL007',
                'origin': 'Miami, FL',
                'destination': 'Orlando, FL',
                'pickup_date': '2026-02-26',
                'equipment': 'Reefer',
                'weight': '32000 lbs',
                'length': '53 ft',
                'rate': '$650',
                'miles': 235,
                'rate_per_mile': 2.77,
                'broker': 'Sunshine Logistics',
                'phone': '(555) 333-4444',
                'posted': '1 hour ago'
            },
            {
                'id': 'TRL008',
                'origin': 'Miami, FL',
                'destination': 'Jacksonville, FL',
                'pickup_date': '2026-02-27',
                'equipment': 'Dry Van',
                'weight': '40000 lbs',
                'length': '53 ft',
                'rate': '$950',
                'miles': 345,
                'rate_per_mile': 2.75,
                'broker': 'Coastal Freight',
                'phone': '(555) 555-6666',
                'posted': '45 minutes ago'
            }
        ]
    
    def search_loads(self, filters):
        """
        Поиск грузов с фильтрами
        """
        origin_city = filters.get('origin_city')
        origin_state = filters.get('origin_state')
        equipment_type = filters.get('equipment_type')
        min_rate_per_mile = filters.get('min_rate_per_mile', 0)
        
        # Получаем грузы
        loads = self.scrape_trulos(origin_city, origin_state, equipment_type)
        
        # Фильтр по ставке
        if min_rate_per_mile:
            loads = [l for l in loads if l['rate_per_mile'] >= float(min_rate_per_mile)]
        
        # Сортировка по $/миля (от большего к меньшему)
        loads.sort(key=lambda x: x['rate_per_mile'], reverse=True)
        
        return loads

if __name__ == "__main__":
    # Тест
    scraper = LoadScraper()
    loads = scraper.search_loads({
        'origin_city': 'Chicago',
        'equipment_type': 'Dry Van'
    })
    
    print(f"Найдено грузов: {len(loads)}")
    for load in loads:
        print(f"{load['origin']} → {load['destination']} | ${load['rate_per_mile']:.2f}/mile")
