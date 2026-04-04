"""
Анализ страницы с грузами TruckerPath
"""
from truckerpath_scraper_final import TruckerPathScraper
from selenium.webdriver.common.by import By
import time

scraper = TruckerPathScraper()
scraper.init_browser(headless=False)

if scraper.login():
    print("\n✅ Вход выполнен!")
    
    # Переходим на страницу поиска
    scraper.driver.get("https://loadboard.truckerpath.com/carrier/loads/loads-search")
    time.sleep(10)
    
    print("\n📋 Анализ страницы с грузами...")
    
    # Сохраняем HTML
    with open("loads_page.html", "w", encoding="utf-8") as f:
        f.write(scraper.driver.page_source)
    print("📄 HTML сохранен: loads_page.html")
    
    # Сохраняем скриншот
    scraper.driver.save_screenshot("loads_page.png")
    print("📸 Скриншот сохранен: loads_page.png")
    
    # Ищем элементы с грузами
    load_elements = scraper.driver.find_elements(By.CSS_SELECTOR, "[class*='load'], [class*='card'], [class*='item']")
    print(f"\n🔍 Найдено элементов: {len(load_elements)}")
    
    # Показываем первые 5
    for i, elem in enumerate(load_elements[:5], 1):
        print(f"\n{i}. Элемент:")
        print(f"   Class: {elem.get_attribute('class')}")
        print(f"   Text: {elem.text[:200]}")
    
    print("\n⏳ Браузер закроется через 30 секунд...")
    print("👀 Посмотрите на страницу с грузами!")
    time.sleep(30)
    
    scraper.driver.quit()
