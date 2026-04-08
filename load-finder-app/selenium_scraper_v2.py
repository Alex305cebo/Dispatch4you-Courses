"""
Улучшенный Selenium парсер - ищет реальные данные грузов
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import re

class ImprovedLoadScraper:
    def __init__(self, headless=False):
        print("🚀 Запуск браузера...")
        
        chrome_options = Options()
        if headless:
            chrome_options.add_argument('--headless=new')
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
        print("✅ Браузер готов\n")
    
    def search_loads(self, origin="Phoenix, AZ", equipment="Van"):
        print(f"🔍 Поиск грузов: {origin}, {equipment}")
        
        try:
            url = "https://www.freightfinder.com/database/search/city-radius"
            self.driver.get(url)
            time.sleep(2)
            
            # Заполняем форму
            Select(self.driver.find_element(By.ID, "searchType")).select_by_value("loads")
            Select(self.driver.find_element(By.ID, "equipment")).select_by_visible_text(equipment)
            
            origin_input = self.driver.find_element(By.ID, "vchOrigin")
            origin_input.clear()
            origin_input.send_keys(origin)
            
            radius = self.driver.find_element(By.ID, "intOriginRadius")
            radius.clear()
            radius.send_keys("100")
            
            # Отправляем
            self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
            time.sleep(4)
            
            # Парсим результаты
            loads = self._extract_loads()
            
            return loads
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            self.driver.save_screenshot('error.png')
            return []
    
    def _extract_loads(self):
        """Извлечение данных грузов"""
        loads = []
        
        print("📊 Анализирую страницу...")
        
        # Метод 1: Ищем все строки таблиц
        all_rows = self.driver.find_elements(By.TAG_NAME, "tr")
        print(f"   Всего строк <tr>: {len(all_rows)}")
        
        for i, row in enumerate(all_rows):
            cells = row.find_elements(By.TAG_NAME, "td")
            
            # Пропускаем строки с пагинацией
            if len(cells) > 0:
                text = row.text
                
                # Проверяем что это не пагинация
                if "Previous Page" in text or "Next Page" in text:
                    continue
                
                # Проверяем что есть признаки груза
                if any(keyword in text for keyword in [',', 'Van', 'Flatbed', 'Reefer', '$', 'lbs']):
                    print(f"\n   Строка {i}: {text[:150]}")
                    
                    # Извлекаем данные из ячеек
                    cell_data = [cell.text.strip() for cell in cells if cell.text.strip()]
                    
                    if len(cell_data) >= 3:
                        load = {
                            'raw_data': cell_data,
                            'full_text': text
                        }
                        loads.append(load)
        
        # Метод 2: Ищем div блоки с классом содержащим 'load' или 'result'
        divs = self.driver.find_elements(By.CSS_SELECTOR, "div[class*='load'], div[class*='result'], div[class*='listing']")
        print(f"\n   Найдено div блоков: {len(divs)}")
        
        for div in divs[:5]:
            text = div.text
            if len(text) > 50 and any(keyword in text for keyword in ['Origin', 'Destination', 'Equipment']):
                print(f"   Div: {text[:100]}")
        
        # Метод 3: Ищем списки
        lists = self.driver.find_elements(By.TAG_NAME, "ul")
        for lst in lists:
            items = lst.find_elements(By.TAG_NAME, "li")
            if len(items) > 10:
                print(f"\n   Список с {len(items)} элементами:")
                for item in items[:3]:
                    text = item.text
                    if len(text) > 20:
                        print(f"     - {text[:80]}")
        
        # Метод 4: Ищем по XPath - строки с данными
        try:
            data_rows = self.driver.find_elements(By.XPATH, "//tr[contains(@class, 'data') or contains(@class, 'row')]")
            print(f"\n   Строк с классом 'data/row': {len(data_rows)}")
        except:
            pass
        
        # Сохраняем HTML для анализа
        with open('page_source.html', 'w', encoding='utf-8') as f:
            f.write(self.driver.page_source)
        
        print(f"\n📦 Извлечено записей: {len(loads)}")
        
        return loads
    
    def close(self):
        self.driver.quit()

def main():
    scraper = ImprovedLoadScraper(headless=False)
    
    try:
        loads = scraper.search_loads("Phoenix, AZ", "Van")
        
        if loads:
            print(f"\n✅ Найдено {len(loads)} грузов\n")
            
            # Показываем первые 5
            for i, load in enumerate(loads[:5], 1):
                print(f"\n{i}. {load}")
            
            # Сохраняем
            with open('extracted_loads.json', 'w', encoding='utf-8') as f:
                json.dump(loads, f, indent=2, ensure_ascii=False)
            
            print("\n💾 Сохранено в extracted_loads.json")
        else:
            print("\n⚠️  Данные не извлечены")
            print("Проверь page_source.html")
        
        # Ждем чтобы посмотреть на браузер
        input("\nНажми Enter чтобы закрыть браузер...")
        
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
