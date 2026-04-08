"""
Отладочный скрипт - показывает что есть на странице после поиска
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.keys import Keys
import time
import json

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    credentials = creds.get("truckerpath", {})

print("="*70)
print("🔍 ОТЛАДКА: Проверяем что есть на странице")
print("="*70)

# Браузер с масштабом 50%
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--start-maximized')
chrome_options.add_argument('--force-device-scale-factor=0.5')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    # ЛОГИН
    print("\n🔐 Логин...")
    driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
    time.sleep(3)
    
    login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN')]")
    for btn in login_buttons:
        if btn.is_displayed():
            driver.execute_script("arguments[0].click();", btn)
            break
    
    time.sleep(2)
    
    try:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email']"))
        )
    except:
        email_input = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.ID, "sign-in_email"))
        )
    
    email_input.clear()
    email_input.send_keys(credentials['username'])
    
    try:
        password_input = driver.find_element(By.ID, "sign-in_password")
    except:
        password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
    
    password_input.clear()
    password_input.send_keys(credentials['password'])
    time.sleep(1)
    
    try:
        signin_btn = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
        )
        signin_btn.click()
    except:
        password_input.send_keys(Keys.RETURN)
    
    time.sleep(4)
    print("✅ Вход выполнен")
    
    # ПОИСК
    print(f"\n🔍 Поиск грузов из Dallas, TX...")
    driver.refresh()
    time.sleep(3)
    
    # Вводим город
    pickup_input = None
    inputs = driver.find_elements(By.TAG_NAME, "input")
    for inp in inputs:
        try:
            placeholder = inp.get_attribute('placeholder') or ''
            if 'pick' in placeholder.lower() and 'date' not in placeholder.lower():
                pickup_input = inp
                print(f"   Нашли поле: {placeholder}")
                break
        except:
            continue
    
    if pickup_input:
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", pickup_input)
        time.sleep(1)
        pickup_input.click()
        time.sleep(1)
        pickup_input.clear()
        time.sleep(0.5)
        pickup_input.send_keys("Dallas, TX")
        time.sleep(2)
        pickup_input.send_keys(Keys.RETURN)
        time.sleep(1)
    
    # SEARCH
    buttons = driver.find_elements(By.TAG_NAME, "button")
    for btn in buttons:
        try:
            if 'search' in btn.text.lower():
                btn.click()
                print("   Нажали SEARCH")
                break
        except:
            continue
    
    time.sleep(10)
    
    # АНАЛИЗ СТРАНИЦЫ
    print(f"\n{'='*70}")
    print("📊 АНАЛИЗ СТРАНИЦЫ:")
    print(f"{'='*70}")
    
    # 1. Проверяем table tbody tr
    print("\n1️⃣ Проверяем: table tbody tr")
    try:
        rows = driver.find_elements(By.CSS_SELECTOR, "table tbody tr")
        print(f"   Найдено: {len(rows)} элементов")
        for i, row in enumerate(rows[:3]):
            text = row.text[:100]
            print(f"   Строка {i+1}: {text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # 2. Проверяем div[role='row']
    print("\n2️⃣ Проверяем: div[role='row']")
    try:
        rows = driver.find_elements(By.CSS_SELECTOR, "div[role='row']")
        print(f"   Найдено: {len(rows)} элементов")
        for i, row in enumerate(rows[:3]):
            text = row.text[:100]
            print(f"   Строка {i+1}: {text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # 3. Проверяем элементы с ценой
    print("\n3️⃣ Проверяем: элементы с '$'")
    try:
        price_elements = driver.find_elements(By.XPATH, "//*[contains(text(), '$')]")
        print(f"   Найдено: {len(price_elements)} элементов с ценой")
        for i, elem in enumerate(price_elements[:5]):
            text = elem.text
            print(f"   Элемент {i+1}: {text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # 4. Сохраняем HTML
    print("\n4️⃣ Сохраняем HTML страницы...")
    try:
        with open("page_debug.html", "w", encoding="utf-8") as f:
            f.write(driver.page_source)
        print("   ✅ Сохранено: page_debug.html")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    # 5. Проверяем все tr на странице
    print("\n5️⃣ Проверяем: все tr элементы")
    try:
        all_tr = driver.find_elements(By.TAG_NAME, "tr")
        print(f"   Найдено: {len(all_tr)} tr элементов")
        for i, tr in enumerate(all_tr[:5]):
            text = tr.text[:100]
            if len(text) > 10:
                print(f"   TR {i+1}: {text}")
    except Exception as e:
        print(f"   Ошибка: {e}")
    
    print(f"\n{'='*70}")
    print("✅ Анализ завершен! Браузер остается открытым.")
    print("Нажми Enter чтобы закрыть...")
    print(f"{'='*70}")
    input()

except Exception as e:
    print(f"\n❌ ОШИБКА: {e}")
    import traceback
    traceback.print_exc()
    print("\nНажми Enter...")
    input()

finally:
    driver.quit()
    print("✅ Закрыто")
