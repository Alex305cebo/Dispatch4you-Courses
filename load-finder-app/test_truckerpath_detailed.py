"""
Детальная проверка TruckerPath с ожиданием загрузки грузов
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

chrome_options = Options()
chrome_options.add_argument('--headless=new')
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    url = "https://loadboard.truckerpath.com/carrier/loads/home?source_caller=ui&utm_source=official_website&shortlink=cwgwebd1&utm_medium=web&c=homesite&pid=tp_homesite&af_xp=app"
    
    print("🔍 Детальная проверка TruckerPath Load Board...")
    print(f"📍 URL: {url}\n")
    
    driver.get(url)
    
    # Закрываем cookie banner если есть
    try:
        accept_btn = WebDriverWait(driver, 3).until(
            EC.element_to_be_clickable((By.XPATH, "//button[contains(text(), 'Accept')]"))
        )
        accept_btn.click()
        print("✅ Cookie banner закрыт")
        time.sleep(1)
    except:
        print("⚠️ Cookie banner не найден")
    
    # Ждем загрузки грузов (до 15 секунд)
    print("\n⏳ Ожидание загрузки грузов...")
    time.sleep(10)
    
    # Прокручиваем страницу вниз для загрузки контента
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    driver.execute_script("window.scrollTo(0, 0);")
    time.sleep(2)
    
    # Получаем весь HTML
    html = driver.page_source
    body_text = driver.find_element(By.TAG_NAME, "body").text
    
    print("\n📄 Поиск грузов в HTML...")
    
    # Ищем города (формат: City, ST)
    cities = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html)
    print(f"📍 Найдено городов: {len(cities)}")
    if cities:
        unique_cities = list(set(cities))[:20]
        print(f"   Примеры: {', '.join(unique_cities)}")
    
    # Ищем даты
    dates = re.findall(r'\d{1,2}/\d{1,2}(?:/\d{2,4})?', html)
    print(f"\n📅 Найдено дат: {len(dates)}")
    if dates:
        unique_dates = list(set(dates))[:10]
        print(f"   Примеры: {', '.join(unique_dates)}")
    
    # Ищем телефоны
    phones = re.findall(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', body_text)
    print(f"\n📞 Найдено телефонов: {len(phones)}")
    if phones:
        unique_phones = list(set(phones))[:10]
        print(f"   Примеры: {', '.join(unique_phones)}")
    
    # Ищем ставки (rates)
    rates = re.findall(r'\$[\d,]+(?:\.\d{2})?', body_text)
    print(f"\n💰 Найдено ставок: {len(rates)}")
    if rates:
        unique_rates = list(set(rates))[:10]
        print(f"   Примеры: {', '.join(unique_rates)}")
    
    # Ищем расстояния (miles)
    miles = re.findall(r'(\d+)\s*(?:mi|miles)', body_text.lower())
    print(f"\n📏 Найдено расстояний: {len(miles)}")
    if miles:
        unique_miles = list(set(miles))[:10]
        print(f"   Примеры: {', '.join(unique_miles)} miles")
    
    # Ищем элементы с классами load/freight
    print("\n🔍 Поиск элементов грузов...")
    
    selectors_to_try = [
        ("div[class*='LoadCard']", "LoadCard"),
        ("div[class*='load-card']", "load-card"),
        ("div[class*='freight']", "freight"),
        ("div[data-testid*='load']", "data-testid load"),
        (".load-item", "load-item class"),
        ("[role='row']", "table row"),
    ]
    
    for selector, name in selectors_to_try:
        try:
            elements = driver.find_elements(By.CSS_SELECTOR, selector)
            if elements:
                print(f"   ✅ {name}: {len(elements)} элементов")
                
                # Показываем первые 3 элемента
                for i, elem in enumerate(elements[:3], 1):
                    text = elem.text
                    if text and len(text) > 20:
                        print(f"      {i}. {text[:150]}...")
        except:
            pass
    
    # Ищем таблицы
    print("\n📊 Таблицы:")
    tables = driver.find_elements(By.TAG_NAME, "table")
    print(f"   Найдено таблиц: {len(tables)}")
    
    if tables:
        for i, table in enumerate(tables[:2], 1):
            rows = table.find_elements(By.TAG_NAME, "tr")
            print(f"   Таблица {i}: {len(rows)} строк")
            
            # Показываем первые 3 строки
            for j, row in enumerate(rows[:3], 1):
                cells = row.find_elements(By.TAG_NAME, "td")
                if cells:
                    cell_texts = [cell.text for cell in cells if cell.text]
                    if cell_texts:
                        print(f"      Строка {j}: {' | '.join(cell_texts[:5])}")
    
    # Проверяем наличие кнопки Search
    print("\n🔍 Кнопка поиска:")
    try:
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'SEARCH') or contains(text(), 'Search')]")
        print(f"   ✅ Найдена: {search_btn.text}")
        
        # Пробуем нажать
        print("   ⏳ Пробуем нажать Search...")
        search_btn.click()
        time.sleep(5)
        
        # Проверяем результаты после поиска
        html_after = driver.page_source
        cities_after = re.findall(r'[A-Z][a-z]+(?:\s[A-Z][a-z]+)*,\s[A-Z]{2}', html_after)
        print(f"   📍 После поиска найдено городов: {len(cities_after)}")
        
    except Exception as e:
        print(f"   ❌ Кнопка Search не найдена: {e}")
    
    # Сохраняем скриншот
    driver.save_screenshot("truckerpath_detailed.png")
    print("\n📸 Скриншот сохранен: truckerpath_detailed.png")
    
    # Сохраняем HTML
    with open("truckerpath_page.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("📄 HTML сохранен: truckerpath_page.html")
    
    # Итоговая оценка
    print("\n" + "="*70)
    print("📊 ИТОГОВАЯ ОЦЕНКА:")
    print("="*70)
    
    has_loads = len(cities) > 10 or len(dates) > 5
    
    if has_loads:
        print("🎯 ГРУЗЫ НАЙДЕНЫ БЕЗ ЛОГИНА!")
        print(f"   Городов: {len(cities)}")
        print(f"   Дат: {len(dates)}")
        print(f"   Телефонов: {len(phones)}")
        print(f"   Ставок: {len(rates)}")
        print("✅ Можно парсить напрямую!")
    else:
        print("⚠️ Грузы не найдены или требуется дополнительное взаимодействие")
        print("   Возможно нужно:")
        print("   - Нажать кнопку Search")
        print("   - Заполнить фильтры")
        print("   - Прокрутить страницу")
        print("   - Подождать дольше")

finally:
    driver.quit()

print("\n✅ Проверка завершена")
