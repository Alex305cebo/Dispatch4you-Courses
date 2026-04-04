"""
Анализ формы регистрации TruckerPath
Показывает все поля и их атрибуты
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

print("🔍 Анализ формы регистрации TruckerPath...")

# Инициализация браузера
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # Открываем страницу регистрации
    url = "https://loadboard.truckerpath.com/carrier/sign-up?redirect=%2Fcarrier%2Floads%2Fhome"
    driver.get(url)
    
    print(f"✅ Страница открыта: {url}")
    print("\n⏳ Ожидание загрузки формы (10 секунд)...")
    time.sleep(10)
    
    # Анализируем все input поля
    print("\n" + "="*70)
    print("📋 ВСЕ INPUT ПОЛЯ НА СТРАНИЦЕ:")
    print("="*70)
    
    inputs = driver.find_elements(By.TAG_NAME, "input")
    
    for i, inp in enumerate(inputs, 1):
        print(f"\n{i}. INPUT:")
        print(f"   type: {inp.get_attribute('type')}")
        print(f"   name: {inp.get_attribute('name')}")
        print(f"   id: {inp.get_attribute('id')}")
        print(f"   placeholder: {inp.get_attribute('placeholder')}")
        print(f"   class: {inp.get_attribute('class')}")
        print(f"   visible: {inp.is_displayed()}")
    
    # Анализируем все button элементы
    print("\n" + "="*70)
    print("🔘 ВСЕ BUTTON ЭЛЕМЕНТЫ НА СТРАНИЦЕ:")
    print("="*70)
    
    buttons = driver.find_elements(By.TAG_NAME, "button")
    
    for i, btn in enumerate(buttons, 1):
        print(f"\n{i}. BUTTON:")
        print(f"   text: {btn.text}")
        print(f"   type: {btn.get_attribute('type')}")
        print(f"   class: {btn.get_attribute('class')}")
        print(f"   visible: {btn.is_displayed()}")
    
    # Сохраняем скриншот
    driver.save_screenshot("truckerpath_form_analysis.png")
    print("\n📸 Скриншот сохранен: truckerpath_form_analysis.png")
    
    # Сохраняем HTML
    with open("truckerpath_form.html", "w", encoding="utf-8") as f:
        f.write(driver.page_source)
    print("📄 HTML сохранен: truckerpath_form.html")
    
    print("\n⏳ Браузер закроется через 30 секунд...")
    print("👀 Посмотрите на форму в браузере!")
    time.sleep(30)
    
finally:
    driver.quit()
    print("\n✅ Анализ завершен!")
