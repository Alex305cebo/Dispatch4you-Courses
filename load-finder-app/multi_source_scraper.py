"""
Парсер с несколькими источниками грузов
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import re

class MultiSourceScraper:
    def __init__(self):
        self.driver = None
    
    def init_browser(self):
        if self.driver is None:
            print("🚀 Запуск браузера...")
            chrome_options = Options()
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--disable-gpu')
            chrome_options.add_argument('--window-size=1920,1080')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            print("✅ Браузер готов")
    
    def search_all_sources(self, origin_state="AZ", equipment="Van"):
        """Поиск грузов со всех источников"""
        self.init_browser()
        
        all_loads = []
        
        # Источник: FreightFinder - оптимальное количество запросов
        print("\n📦 Источник: FreightFinder.com (оптимизированный охват)")
        
        # Топ-5 штатов по грузообороту
        top_states = ['CA', 'TX', 'FL', 'IL', 'GA']
        
        # Все типы оборудования
        all_equipment = ['Van', 'Reefer', 'Flatbed']
        
        request_num = 1
        
        # Делаем запросы для топ штатов и всех типов оборудования
        for state in top_states:
            for equip in all_equipment:
                loads = self._search_freightfinder(state, equip)
                all_loads.extend(loads)
                print(f"   ✅ Запрос {request_num} ({state}, {equip}): {len(loads)} грузов")
                request_num += 1
                time.sleep(0.5)
        
        # Перемешиваем грузы в случайном порядке
        import random
        random.shuffle(all_loads)
        
        # Удаляем дубликаты по комбинации origin+destination+date
        seen = set()
        unique_loads = []
        for load in all_loads:
            key = f"{load['origin']}|{load['destination']}|{load['pickup_date']}"
            if key not in seen:
                seen.add(key)
                unique_loads.append(load)
        
        print(f"\n✅ ВСЕГО: {len(unique_loads)} уникальных грузов из FreightFinder.com")
        print(f"📊 Сделано запросов: {request_num - 1}")
        
        return unique_loads
    
    def _search_freightfinder(self, origin_state, equipment):
        """FreightFinder.com - основной рабочий источник"""
        state_cities = {
            'AZ': 'Phoenix, AZ', 'CA': 'Los Angeles, CA', 'TX': 'Houston, TX',
            'FL': 'Miami, FL', 'IL': 'Chicago, IL', 'NY': 'New York, NY',
            'GA': 'Atlanta, GA', 'NC': 'Charlotte, NC', 'OH': 'Columbus, OH',
            'PA': 'Philadelphia, PA', 'MI': 'Detroit, MI', 'WA': 'Seattle, WA'
        }
        
        equipment_map = {
            'Dry Van': 'Van', 'Van': 'Van', 'Reefer': 'Reefer', 'Flatbed': 'Flatbed'
        }
        
        equipment = equipment_map.get(equipment, equipment)
        origin = state_cities.get(origin_state, f"{origin_state}")
        
        try:
            url = "https://www.freightfinder.com/database/search/city-radius"
            self.driver.get(url)
            time.sleep(2)
            
            Select(self.driver.find_element(By.ID, "searchType")).select_by_value("loads")
            Select(self.driver.find_element(By.ID, "equipment")).select_by_visible_text(equipment)
            
            origin_input = self.driver.find_element(By.ID, "vchOrigin")
            origin_input.clear()
            origin_input.send_keys(origin)
            
            radius = self.driver.find_element(By.ID, "intOriginRadius")
            radius.clear()
            radius.send_keys("150")
            
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            time.sleep(3)
            
            return self._parse_freightfinder()
            
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            return []
    
    def _parse_freightfinder(self):
        """Парсинг FreightFinder"""
        loads = []
        all_rows = self.driver.find_elements(By.TAG_NAME, "tr")
        
        for row in all_rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            if len(cells) > 0:
                text = row.text
                if "Previous Page" in text or "Next Page" in text:
                    continue
                
                if any(kw in text for kw in [',', 'Van', 'Flatbed', 'Reefer']):
                    cell_data = [cell.text.strip() for cell in cells if cell.text.strip()]
                    
                    if len(cell_data) >= 5:
                        date = cell_data[0]
                        origin = cell_data[1]
                        destination = cell_data[2]
                        equipment = cell_data[3]
                        broker_info = cell_data[4]
                        
                        phone_match = re.search(r'(\d{10})', broker_info)
                        phone = phone_match.group(1) if phone_match else "N/A"
                        if phone != "N/A" and len(phone) == 10:
                            phone = f"({phone[:3]}) {phone[3:6]}-{phone[6:]}"
                        
                        broker = broker_info.split('\n')[0] if '\n' in broker_info else broker_info
                        broker = re.sub(r'\d+', '', broker).strip()
                        
                        load = {
                            'id': f'FF{abs(hash(text)) % 10000}',
                            'pickup_date': date,
                            'origin': origin,
                            'destination': destination,
                            'equipment': equipment,
                            'broker': broker,
                            'phone': phone,
                            'source': 'FreightFinder.com'
                        }
                        loads.append(load)
        
        return loads
    
    def _search_truckerpath(self, origin_state, equipment):
        """TruckerPath - бесплатный load board"""
        try:
            url = "https://framer.truckerpath.com/truckloads/free-load-board"
            self.driver.get(url)
            time.sleep(3)
            
            loads = []
            load_elements = self.driver.find_elements(By.CSS_SELECTOR, "[class*='load'], [class*='freight'], .card, .listing")
            
            for elem in load_elements[:20]:
                try:
                    text = elem.text
                    if not text or len(text) < 20:
                        continue
                    
                    # Ищем города (формат: City, ST)
                    cities = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2})', text)
                    if len(cities) >= 2:
                        origin = cities[0]
                        destination = cities[1]
                        
                        # Ищем дату
                        date_match = re.search(r'(\d{1,2}/\d{1,2}(?:/\d{2,4})?)', text)
                        date = date_match.group(1) if date_match else "ASAP"
                        
                        # Ищем телефон
                        phone_match = re.search(r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})', text)
                        phone = phone_match.group(1) if phone_match else "N/A"
                        
                        # Ищем компанию
                        lines = text.split('\n')
                        broker = "TruckerPath User"
                        for line in lines:
                            if len(line) > 5 and not any(c in line for c in ['/', '$', '#']):
                                broker = line.strip()
                                break
                        
                        load = {
                            'id': f'TP{abs(hash(text)) % 10000}',
                            'pickup_date': date,
                            'origin': origin,
                            'destination': destination,
                            'equipment': equipment,
                            'broker': broker,
                            'phone': phone,
                            'source': 'TruckerPath.com'
                        }
                        loads.append(load)
                except:
                    continue
            
            return loads
        except Exception as e:
            print(f"   ❌ Ошибка TruckerPath: {e}")
            return []
    
    def _search_pickatruckload_public(self, origin_state, equipment):
        """PickaTruckLoad - публичная часть"""
        try:
            url = "https://www.pickatruckload.com/"
            self.driver.get(url)
            time.sleep(3)
            
            loads = []
            # Ищем любые элементы с информацией о грузах
            load_elements = self.driver.find_elements(By.CSS_SELECTOR, "div[class*='load'], tr, .listing")
            
            for elem in load_elements[:20]:
                try:
                    text = elem.text
                    if not text or len(text) < 20:
                        continue
                    
                    cities = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2})', text)
                    if len(cities) >= 2:
                        origin = cities[0]
                        destination = cities[1]
                        
                        date_match = re.search(r'(\d{1,2}/\d{1,2}(?:/\d{2,4})?)', text)
                        date = date_match.group(1) if date_match else "ASAP"
                        
                        phone_match = re.search(r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})', text)
                        phone = phone_match.group(1) if phone_match else "N/A"
                        
                        broker = "PickaTruckLoad Carrier"
                        
                        load = {
                            'id': f'PTL{abs(hash(text)) % 10000}',
                            'pickup_date': date,
                            'origin': origin,
                            'destination': destination,
                            'equipment': equipment,
                            'broker': broker,
                            'phone': phone,
                            'source': 'PickaTruckLoad.com'
                        }
                        loads.append(load)
                except:
                    continue
            
            return loads
        except Exception as e:
            print(f"   ❌ Ошибка PickaTruckLoad: {e}")
            return []
    
    def _search_alltruckers(self, origin_state, equipment):
        """AllTruckers - бесплатный load board"""
        try:
            url = "https://alltruckers.com/"
            self.driver.get(url)
            time.sleep(3)
            
            loads = []
            load_elements = self.driver.find_elements(By.CSS_SELECTOR, "div[class*='load'], tr, .card")
            
            for elem in load_elements[:20]:
                try:
                    text = elem.text
                    if not text or len(text) < 20:
                        continue
                    
                    cities = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2})', text)
                    if len(cities) >= 2:
                        origin = cities[0]
                        destination = cities[1]
                        
                        date_match = re.search(r'(\d{1,2}/\d{1,2}(?:/\d{2,4})?)', text)
                        date = date_match.group(1) if date_match else "ASAP"
                        
                        phone_match = re.search(r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})', text)
                        phone = phone_match.group(1) if phone_match else "N/A"
                        
                        broker = "AllTruckers Member"
                        
                        load = {
                            'id': f'AT{abs(hash(text)) % 10000}',
                            'pickup_date': date,
                            'origin': origin,
                            'destination': destination,
                            'equipment': equipment,
                            'broker': broker,
                            'phone': phone,
                            'source': 'AllTruckers.com'
                        }
                        loads.append(load)
                except:
                    continue
            
            return loads
        except Exception as e:
            print(f"   ❌ Ошибка AllTruckers: {e}")
            return []
    
    def _search_trulos(self, origin_state, equipment):
        """Trulos - новый load board"""
        try:
            url = "https://trulos.com/load-board/"
            self.driver.get(url)
            time.sleep(3)
            
            loads = []
            load_elements = self.driver.find_elements(By.CSS_SELECTOR, "div[class*='load'], tr, .listing")
            
            for elem in load_elements[:20]:
                try:
                    text = elem.text
                    if not text or len(text) < 20:
                        continue
                    
                    cities = re.findall(r'([A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2})', text)
                    if len(cities) >= 2:
                        origin = cities[0]
                        destination = cities[1]
                        
                        date_match = re.search(r'(\d{1,2}/\d{1,2}(?:/\d{2,4})?)', text)
                        date = date_match.group(1) if date_match else "ASAP"
                        
                        phone_match = re.search(r'(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})', text)
                        phone = phone_match.group(1) if phone_match else "N/A"
                        
                        broker = "Trulos Carrier"
                        
                        load = {
                            'id': f'TR{abs(hash(text)) % 10000}',
                            'pickup_date': date,
                            'origin': origin,
                            'destination': destination,
                            'equipment': equipment,
                            'broker': broker,
                            'phone': phone,
                            'source': 'Trulos.com'
                        }
                        loads.append(load)
                except:
                    continue
            
            return loads
        except Exception as e:
            print(f"   ❌ Ошибка Trulos: {e}")
            return []
    
    def close(self):
        if self.driver:
            self.driver.quit()
            self.driver = None

if __name__ == "__main__":
    scraper = MultiSourceScraper()
    try:
        loads = scraper.search_all_sources("CA", "Van")
        print(f"\n📊 Результат: {len(loads)} грузов")
        for i, load in enumerate(loads[:5], 1):
            print(f"\n{i}. {load['origin']} → {load['destination']}")
            print(f"   {load['broker']} | {load['phone']}")
            print(f"   Источник: {load['source']}")
    finally:
        scraper.close()
