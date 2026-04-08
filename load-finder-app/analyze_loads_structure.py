"""
Анализ структуры страницы с грузами TruckerPath
Сохраняет HTML и скриншот для изучения
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
import json

class LoadsPageAnalyzer:
    def __init__(self):
        self.driver = None
        self.credentials = self.load_credentials()
    
    def load_credentials(self):
        """Загружает credentials"""
        with open("credentials.json", "r") as f:
            return json.load(f).get("truckerpath", {})
    
    def init_browser(self):
        """Инициализация браузера"""
        print("🚀 Запуск браузера...")
        chrome_options = Options()
        chrome_options.add_argument('--no-sandbox')
        chrome_options.add_argument('--disable-dev-shm-usage')
        chrome_options.add_argument('--window-size=1920,1080')
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        print("✅ Браузер готов")
    
    def login(self):
        """Простой логин"""
        print("\n🔐 Логин...")
        self.driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
        time.sleep(5)
        
        # Проверяем что залогинены
        if "loads" in self.driver.current_url:
            print("✅ Залогинены!")
            return True
        return False
    
    def analyze_page(self):
        """Анализирует страницу с грузами"""
        print("\n🔍 Анализ страницы...")
        
        # Переходим на страницу поиска
        self.driver.get("https://loadboard.truckerpath.com/carrier/loads/loads-search")
        time.sleep(8)
        
        # Сохраняем HTML
        html = self.driver.page_source
        with open("loads_page_structure.html", "w", encoding="utf-8") as f:
            f.write(html)
        print("✅ HTML сохранен: loads_page_structure.html")
        
        # Сохраняем скриншот
        self.driver.save_screenshot("loads_page_structure.png")
        print("✅ Скриншот сохранен: loads_page_structure.png")
        
        # Анализируем классы элементов
        print("\n📊 Анализ классов элементов:")
        
        # Ищем все div с классами содержащими 'load', 'card', 'item'
        keywords = ['load', 'card', 'item', 'row', 'list']
        
        for keyword in keywords:
            elements = self.driver.find_elements(By.CSS_SELECTOR, f"[class*='{keyword}']")
            if elements:
                print(f"\n   Элементы с '{keyword}': {len(elements)}")
                # Показываем первые 3 уникальных класса
                classes_seen = set()
                for elem in elements[:20]:
                    class_name = elem.get_attribute('class')
                    if class_name and class_name not in classes_seen:
                        classes_seen.add(class_name)
                        if len(classes_seen) <= 5:
                            print(f"      - {class_name}")
        
        # Ищем таблицы
        tables = self.driver.find_elements(By.TAG_NAME, "table")
        print(f"\n   Таблицы: {len(tables)}")
        
        # Ищем списки
        lists = self.driver.find_elements(By.CSS_SELECTOR, "ul, ol")
        print(f"   Списки (ul/ol): {len(lists)}")
        
        print("\n✅ Анализ завершен!")
        print("   Проверьте файлы:")
        print("   - loads_page_structure.html")
        print("   - loads_page_structure.png")
    
    def run(self):
        """Запуск анализа"""
        print("="*70)
        print("🔬 АНАЛИЗ СТРУКТУРЫ СТРАНИЦЫ ГРУЗОВ")
        print("="*70)
        
        try:
            self.init_browser()
            
            if not self.login():
                print("❌ Не удалось войти")
                return
            
            self.analyze_page()
            
        finally:
            print("\n⏳ Браузер закроется через 15 секунд...")
            time.sleep(15)
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    analyzer = LoadsPageAnalyzer()
    analyzer.run()
