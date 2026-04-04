"""
Пошаговый тест логина с визуализацией
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json

# Загружаем credentials
with open("credentials.json", "r") as f:
    creds = json.load(f)
    username = creds["truckerpath"]["username"]
    password = creds["truckerpath"]["password"]

print(f"📧 Email: {username}")
print(f"🔑 Password: {password}")

# Запускаем браузер (ВИДИМЫЙ)
chrome_options = Options()
chrome_options.add_argument('--no-sandbox')
chrome_options.add_argument('--disable-dev-shm-usage')
chrome_options.add_argument('--window-size=1920,1080')

service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

try:
    print("\n🌐 Шаг 1: Открываем truckerpath.com...")
    driver.get("https://truckerpath.com/")
    time.sleep(5)
    
    print("\n🔍 Шаг 2: Ищем кнопку Log In...")
    # Ищем все элементы с текстом "Log In"
    login_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In')]")
    print(f"   Найдено элементов: {len(login_elements)}")
    
    for i, elem in enumerate(login_elements, 1):
        print(f"   {i}. Tag: {elem.tag_name}, Visible: {elem.is_displayed()}, Text: {elem.text}")
    
    if login_elements:
        print("\n✅ Кликаем на первый видимый элемент...")
        for elem in login_elements:
            if elem.is_displayed():
                # Подсвечиваем элемент
                driver.execute_script("arguments[0].style.border='3px solid red'", elem)
                time.sleep(2)
                elem.click()
                print("   ✅ Клик выполнен!")
                break
    
    time.sleep(5)
    
    print("\n📝 Шаг 3: Заполняем форму логина...")
    
    # Ищем поля email и password
    try:
        email_input = driver.find_element(By.ID, "sign-in_email")
        print("   ✅ Поле email найдено")
        
        # Подсвечиваем
        driver.execute_script("arguments[0].style.border='3px solid green'", email_input)
        time.sleep(1)
        
        # Заполняем через JavaScript
        driver.execute_script(f"arguments[0].value = '{username}';", email_input)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", email_input)
        print(f"   ✅ Email введен: {username}")
        
    except Exception as e:
        print(f"   ❌ Ошибка с email: {e}")
    
    time.sleep(2)
    
    try:
        password_input = driver.find_element(By.ID, "sign-in_password")
        print("   ✅ Поле password найдено")
        
        # Подсвечиваем
        driver.execute_script("arguments[0].style.border='3px solid green'", password_input)
        time.sleep(1)
        
        # Заполняем через JavaScript
        driver.execute_script(f"arguments[0].value = '{password}';", password_input)
        driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", password_input)
        print(f"   ✅ Password введен")
        
    except Exception as e:
        print(f"   ❌ Ошибка с password: {e}")
    
    time.sleep(2)
    
    print("\n🔘 Шаг 4: Ищем кнопку Sign In...")
    signin_buttons = driver.find_elements(By.CSS_SELECTOR, "button")
    
    for i, btn in enumerate(signin_buttons, 1):
        if btn.is_displayed():
            print(f"   {i}. Button text: '{btn.text}'")
            if "SIGN IN" in btn.text.upper() or "LOG IN" in btn.text.upper():
                print(f"   ✅ Найдена кнопка входа: {btn.text}")
                # Подсвечиваем
                driver.execute_script("arguments[0].style.border='3px solid red'", btn)
                time.sleep(2)
                btn.click()
                print("   ✅ Кнопка нажата!")
                break
    
    time.sleep(5)
    
    print(f"\n📍 Текущий URL: {driver.current_url}")
    
    if "loads" in driver.current_url or "home" in driver.current_url:
        print("✅ ЛОГИН УСПЕШЕН!")
    else:
        print("⚠️ Возможно логин не удался")
    
    # Сохраняем скриншот
    driver.save_screenshot("login_test_result.png")
    print("\n📸 Скриншот сохранен: login_test_result.png")
    
    print("\n⏳ Браузер закроется через 30 секунд...")
    print("👀 Посмотрите что произошло!")
    time.sleep(30)
    
finally:
    driver.quit()
