"""
Selenium парсер для FreightFinder.com - реальные грузы
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

class SeleniumLoadScraper:
    def __init__(self, headless=True):
        """
        headless=True - браузер невидимый (быстрее)
        headless=False - видно что происходит (для отладки)
        """
        print("🚀 Запуск Selenium...")
        
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--disable-gpu')
        chrome_options.add_argument('--window-size=1920,1080')
        chrome_options.add_argument('user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')
        
        # Автоматическая установка ChromeDriver
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
        print("✅ Браузер запущен")
    
    def search_freightfinder(self, origin_city="Phoenix", origin_state="AZ", equipment="Van"):
        """
        Поиск грузов на FreightFinder.com
        """
        print(f"\n🔍 Поиск на FreightFinder.com")
        print(f"   Откуда: {origin_city}, {origin_state}")
        print(f"   Оборудование: {equipment}")
        
        try:
            # Открываем страницу поиска
            url = "https://www.freightfinder.com/database/search/city-radius"
            print(f"   Открываю: {url}")
            self.driver.get(url)
            
            # Ждем загрузки формы
            time.sleep(2)
            
            # Заполняем форму
            print("   Заполняю форму...")
            
            # Тип поиска: Loads
            search_type = Select(self.driver.find_element(By.ID, "searchType"))
            search_type.select_by_value("loads")
            
            # Оборудование
            equipment_select = Select(self.driver.find_element(By.ID, "equipment"))
            equipment_select.select_by_visible_text(equipment)
            
            # Город отправления
            origin_input = self.driver.find_element(By.ID, "vchOrigin")
            origin_input.clear()
            origin_input.send_keys(f"{origin_city}, {origin_state}")
            
            # Радиус
            radius_input = self.driver.find_element(By.ID, "intOriginRadius")
            radius_input.clear()
            radius_input.send_keys("100")
            
            print("   Отправляю запрос...")
            
            # Отправляем форму
            submit_button = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
            submit_button.click()
            
            # Ждем результатов
            print("   Ожидаю результаты...")
            time.sleep(3)
            
            # Сохраняем HTML результатов
            with open('selenium_results.html', 'w', encoding='utf-8') as f:
                f.write(self.driver.page_source)
            
            print("   ✅ Результаты сохранены в selenium_results.html")
            
            # Парсим результаты
            loads = self._parse_results()
            
            return loads
            
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            # Сохраняем скриншот для отладки
            self.driver.save_screenshot('error_screenshot.png')
            print("   📸 Скриншот сохранен: error_screenshot.png")
            return []
    
    def _parse_results(self):
        """
        Извлечение грузов из результатов
        """
        loads = []
        
        try:
            # Ищем таблицу с результатами
            tables = self.driver.find_elements(By.TAG_NAME, "table")
            print(f"   Найдено таблиц: {len(tables)}")
            
            for table in tables:
                rows = table.find_elements(By.TAG_NAME, "tr")
                print(f"   Строк в таблице: {len(rows)}")
                
                if len(rows) > 1:
                    # Заголовки
                    headers = []
                    header_cells = rows[0].find_elements(By.TAG_NAME, "th")
                    if not header_cells:
                        header_cells = rows[0].find_elements(By.TAG_NAME, "td")
                    
                    for cell in header_cells:
                        headers.append(cell.text.strip())
                    
                    print(f"   Заголовки: {headers}")
                    
                    # Данные
                    for row in rows[1:]:
                        cells = row.find_elements(By.TAG_NAME, "td")
                        if len(cells) >= 3:
                            load = {}
                            for i, cell in enumerate(cells):
                                if i < len(headers):
                                    load[headers[i]] = cell.text.strip()
                            
                            if load:
                                loads.append(load)
            
            # Ищем div блоки с результатами
            result_divs = self.driver.find_elements(By.CSS_SELECTOR, "div[class*='result'], div[class*='load'], div[class*='listing']")
            print(f"   Найдено div блоков: {len(result_divs)}")
            
            # Ищем списки
            lists = self.driver.find_elements(By.TAG_NAME, "ul")
            for lst in lists:
                items = lst.find_elements(By.TAG_NAME, "li")
                if len(items) > 5:
                    print(f"   Список с {len(items)} элементами")
                    for item in items[:3]:
                        print(f"     - {item.text[:100]}")
            
            # Проверяем есть ли сообщение "No results"
            page_text = self.driver.find_element(By.TAG_NAME, "body").text
            if "no results" in page_text.lower() or "no loads" in page_text.lower():
                print("   ⚠️  Грузы не найдены (сайт вернул 'No results')")
            
            print(f"\n   📦 Извлечено грузов: {len(loads)}")
            
        except Exception as e:
            print(f"   ❌ Ошибка парсинга: {e}")
        
        return loads
    
    def close(self):
        """Закрыть браузер"""
        print("\n🔒 Закрываю браузер...")
        self.driver.quit()

def main():
    # Создаем парсер (headless=False чтобы видеть браузер)
    scraper = SeleniumLoadScraper(headless=False)
    
    try:
        # Поиск грузов
        loads = scraper.search_freightfinder("Phoenix", "AZ", "Van")
        
        if loads:
            print(f"\n✅ УСПЕХ! Найдено {len(loads)} грузов\n")
            
            # Показываем первые 3
            for i, load in enumerate(loads[:3], 1):
                print(f"{i}. {load}\n")
            
            # Сохраняем в JSON
            with open('found_loads.json', 'w', encoding='utf-8') as f:
                json.dump(loads, f, indent=2, ensure_ascii=False)
            
            print("💾 Грузы сохранены в found_loads.json")
        else:
            print("\n⚠️  Грузы не найдены")
            print("Проверь файлы:")
            print("  - selenium_results.html (HTML результатов)")
            print("  - error_screenshot.png (скриншот если была ошибка)")
    
    finally:
        # Закрываем браузер
        scraper.close()

if __name__ == "__main__":
    main()
