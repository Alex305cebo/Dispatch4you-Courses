"""
TruckerPath Load Board Scraper - БЕЗ регистрации!
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import re

class TruckerPathScraper:
    def __init__(self):
        self.driver = None
    
    def init_browser(self):
        if self.driver is None:
            print("🚀 Запуск браузера...")
            chrome_options = Options()
            chrome_options.add_argument('--headless=new')
            chrome_options.add_argument('--no-sandbox')
            chrome_options.add_argument('--disable-dev-shm-usage')
            chrome_options.add_argument('--window-size=1920,1080')
            
            service = Service(ChromeDriverManager().install())
            self.driver = webdriver.Chrome(service=service, options=chrome_options)
            print("✅ Браузер готов")
    
    def search_loads(self, origin_city="Houston, TX", destination="Anywhere"):
        """Поиск грузов на TruckerPath"""
        self.init_browser()
        
        # Формируем URL для поиска
        origin_encoded = origin_city.replace(" ", "%20").replace(",", "%2C")
        url = f"https://loadboard.truckerpath.com/carrier/loads/loads-search/from/{origin_encoded}/to/{destination}"
        
        print(f"\n📦 TruckerPath: {origin_city} → {destination}")
        print(f"📍 URL: {url}")
        
        try:
            self.driver.get(url)
            
            # Закрываем cookie banner
            try:
                accept_btn = WebDriverWait(self.driver, 3).until(
                    EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Accept')]"))
                )
                accept_btn.click()
            except:
                pass
            
            # Ждем загрузки таблицы
            print("⏳ Ожидание загрузки грузов...")
            time.sleep(8)
            
            # Прокручиваем страницу для загрузки контента
            self.driver.execute_script("window.scrollTo(0, 500);")
            time.sleep(2)
            self.driver.execute_script("window.scrollTo(0, 1000);")
            time.sleep(2)
            
            # Сохраняем скриншот для отладки
            self.driver.save_screenshot("truckerpath_debug.png")
            
            # Сохраняем HTML для отладки
            with open("truckerpath_debug.html", "w", encoding="utf-8") as f:
                f.write(self.driver.page_source)
            
            # Парсим таблицу
            loads = self._parse_loads_table()
            
            print(f"✅ Найдено: {len(loads)} грузов")
            
            return loads
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            return []
    
    def _parse_loads_table(self):
        """Парсинг таблицы с грузами"""
        loads = []
        
        try:
            # Ищем все строки таблицы
            rows = self.driver.find_elements(By.CSS_SELECTOR, "tr")
            
            print(f"   Найдено строк: {len(rows)}")
            
            for row in rows:
                try:
                    # Получаем все ячейки
                    cells = row.find_elements(By.TAG_NAME, "td")
                    
                    if len(cells) < 8:
                        continue
                    
                    # Извлекаем данные из ячеек
                    # Структура: Age | Pick Up | DH-P | Date | Drop Off | Distance | Trailer | Weight | Broker | DTP/CS | Market Average | Price
                    
                    age = cells[0].text.strip() if len(cells) > 0 else ""
                    pickup = cells[1].text.strip() if len(cells) > 1 else ""
                    dhp = cells[2].text.strip() if len(cells) > 2 else ""
                    date = cells[3].text.strip() if len(cells) > 3 else ""
                    dropoff = cells[4].text.strip() if len(cells) > 4 else ""
                    distance = cells[5].text.strip() if len(cells) > 5 else ""
                    trailer = cells[6].text.strip() if len(cells) > 6 else ""
                    weight = cells[7].text.strip() if len(cells) > 7 else ""
                    broker = cells[8].text.strip() if len(cells) > 8 else ""
                    price_cell = cells[11].text.strip() if len(cells) > 11 else ""
                    
                    # Извлекаем цену
                    price_match = re.search(r'\$[\d,]+', price_cell)
                    price = price_match.group(0) if price_match else "N/A"
                    
                    # Проверяем что есть основные данные
                    if pickup and dropoff and date:
                        load = {
                            'id': f'TP{abs(hash(f"{pickup}{dropoff}{date}")) % 10000}',
                            'pickup_date': date,
                            'origin': pickup,
                            'destination': dropoff,
                            'equipment': trailer if trailer else 'Van',
                            'broker': broker if broker else 'TruckerPath Broker',
                            'phone': 'N/A',  # Телефон не показывается в таблице
                            'price': price,
                            'distance': distance,
                            'weight': weight,
                            'source': 'TruckerPath.com'
                        }
                        loads.append(load)
                        
                except Exception as e:
                    continue
            
        except Exception as e:
            print(f"   ❌ Ошибка парсинга: {e}")
        
        return loads
    
    def search_multiple_origins(self, origins, destination="Anywhere"):
        """Поиск грузов из нескольких городов"""
        all_loads = []
        
        for origin in origins:
            loads = self.search_loads(origin, destination)
            all_loads.extend(loads)
            time.sleep(1)
        
        # Удаляем дубликаты
        seen = set()
        unique_loads = []
        for load in all_loads:
            key = f"{load['origin']}|{load['destination']}|{load['pickup_date']}"
            if key not in seen:
                seen.add(key)
                unique_loads.append(load)
        
        return unique_loads
    
    def close(self):
        if self.driver:
            self.driver.quit()
            self.driver = None

if __name__ == "__main__":
    scraper = TruckerPathScraper()
    
    try:
        # Тест 1: Один город
        print("="*70)
        print("ТЕСТ 1: Houston, TX → Anywhere")
        print("="*70)
        loads = scraper.search_loads("Houston, TX", "Anywhere")
        
        print(f"\n📊 Результат: {len(loads)} грузов")
        
        for i, load in enumerate(loads[:10], 1):
            print(f"\n{i}. {load['origin']} → {load['destination']}")
            print(f"   Дата: {load['pickup_date']}")
            print(f"   Цена: {load['price']}")
            print(f"   Расстояние: {load['distance']}")
            print(f"   Брокер: {load['broker']}")
            print(f"   Источник: {load['source']}")
        
        # Тест 2: Несколько городов
        print("\n" + "="*70)
        print("ТЕСТ 2: Множественные города")
        print("="*70)
        
        origins = ["Houston, TX", "Dallas, TX", "Austin, TX"]
        all_loads = scraper.search_multiple_origins(origins)
        
        print(f"\n📊 ИТОГО: {len(all_loads)} уникальных грузов")
        
    finally:
        scraper.close()
