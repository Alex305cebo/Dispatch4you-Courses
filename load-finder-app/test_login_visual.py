"""
Визуальный тест логина с паузами и скриншотами на каждом шаге
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

def load_credentials():
    """Загружает credentials"""
    with open("credentials.json", "r") as f:
        return json.load(f).get("truckerpath", {})

def test_login():
    print("="*70)
    print("🔬 ВИЗУАЛЬНЫЙ ТЕСТ ЛОГИНА")
    print("="*70)
    
    credentials = load_credentials()
    print(f"\n📋 Используем credentials:")
    print(f"   Email: {credentials['username']}")
    print(f"   Password: {credentials['password']}")
    
    # Инициализация браузера
    print("\n🚀 Запуск браузера...")
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # ШАГ 1: Открываем главную страницу
        print("\n" + "="*70)
        print("ШАГ 1: Открываем loadboard.truckerpath.com")
        print("="*70)
        driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
        time.sleep(5)
        
        driver.save_screenshot("step1_homepage.png")
        print(f"📍 URL: {driver.current_url}")
        print("📸 Скриншот: step1_homepage.png")
        print("\n⏸️  ПАУЗА 5 секунд - смотрим что открылось...")
        time.sleep(5)
        
        # ШАГ 2: Ищем кнопку Log In
        print("\n" + "="*70)
        print("ШАГ 2: Ищем кнопку 'Log In' справа сверху")
        print("="*70)
        
        # Ищем все элементы с текстом Log In
        all_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN') or contains(text(), 'Sign In')]")
        print(f"   Найдено элементов с 'Log In': {len(all_elements)}")
        
        for i, elem in enumerate(all_elements, 1):
            try:
                if elem.is_displayed():
                    print(f"   {i}. Текст: '{elem.text}' | Tag: {elem.tag_name} | Видимый: ✅")
            except:
                pass
        
        # Пробуем нажать на первый видимый
        login_clicked = False
        for elem in all_elements:
            try:
                if elem.is_displayed():
                    print(f"\n   🔘 Нажимаем на: '{elem.text}'")
                    driver.execute_script("arguments[0].scrollIntoView(true);", elem)
                    time.sleep(1)
                    driver.execute_script("arguments[0].click();", elem)
                    login_clicked = True
                    break
            except Exception as e:
                print(f"   ⚠️ Ошибка клика: {e}")
        
        if not login_clicked:
            print("   ⚠️ Кнопка Log In не найдена или не нажата")
        
        time.sleep(3)
        driver.save_screenshot("step2_after_login_click.png")
        print(f"📍 URL: {driver.current_url}")
        print("📸 Скриншот: step2_after_login_click.png")
        print("\n⏸️  ПАУЗА 5 секунд - смотрим что появилось...")
        time.sleep(5)
        
        # ШАГ 3: Ищем форму логина
        print("\n" + "="*70)
        print("ШАГ 3: Ищем форму логина")
        print("="*70)
        
        try:
            # Ищем поле email
            email_input = driver.find_element(By.ID, "sign-in_email")
            print("   ✅ Поле Email найдено!")
            
            password_input = driver.find_element(By.ID, "sign-in_password")
            print("   ✅ Поле Password найдено!")
            
            # ШАГ 4: Заполняем форму
            print("\n" + "="*70)
            print("ШАГ 4: Заполняем форму")
            print("="*70)
            
            # Email
            driver.execute_script("arguments[0].scrollIntoView(true);", email_input)
            time.sleep(1)
            driver.execute_script(f"arguments[0].value = '{credentials['username']}';", email_input)
            driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", email_input)
            print(f"   ✅ Email введен: {credentials['username']}")
            time.sleep(1)
            
            # Password
            driver.execute_script(f"arguments[0].value = '{credentials['password']}';", password_input)
            driver.execute_script("arguments[0].dispatchEvent(new Event('input', { bubbles: true }));", password_input)
            print(f"   ✅ Password введен: ***")
            time.sleep(1)
            
            driver.save_screenshot("step4_form_filled.png")
            print("📸 Скриншот: step4_form_filled.png")
            print("\n⏸️  ПАУЗА 5 секунд - проверяем заполнение...")
            time.sleep(5)
            
            # ШАГ 5: Нажимаем Sign In
            print("\n" + "="*70)
            print("ШАГ 5: Нажимаем кнопку Sign In")
            print("="*70)
            
            signin_buttons = driver.find_elements(By.CSS_SELECTOR, "button[type='submit'], button[type='button']")
            print(f"   Найдено кнопок: {len(signin_buttons)}")
            
            for i, btn in enumerate(signin_buttons, 1):
                try:
                    btn_text = btn.text
                    print(f"   {i}. Кнопка: '{btn_text}'")
                    if "SIGN IN" in btn_text.upper() or "LOG IN" in btn_text.upper():
                        print(f"   🔘 Нажимаем: '{btn_text}'")
                        driver.execute_script("arguments[0].scrollIntoView(true);", btn)
                        time.sleep(1)
                        driver.execute_script("arguments[0].click();", btn)
                        print("   ✅ Кнопка нажата!")
                        break
                except:
                    pass
            
            time.sleep(5)
            driver.save_screenshot("step5_after_signin.png")
            print(f"📍 URL: {driver.current_url}")
            print("📸 Скриншот: step5_after_signin.png")
            
            # ШАГ 6: Проверка результата
            print("\n" + "="*70)
            print("ШАГ 6: Проверка результата")
            print("="*70)
            
            current_url = driver.current_url
            print(f"📍 Финальный URL: {current_url}")
            
            if "loads" in current_url and "sign-in" not in current_url:
                print("✅ ЛОГИН УСПЕШЕН!")
            else:
                print("❌ ЛОГИН НЕ УДАЛСЯ!")
                print("   Возможные причины:")
                print("   - Неверные credentials")
                print("   - Требуется капча")
                print("   - Требуется дополнительная верификация")
            
            print("\n⏸️  ПАУЗА 10 секунд - смотрим финальный результат...")
            time.sleep(10)
            
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            driver.save_screenshot("error.png")
            print("📸 Скриншот ошибки: error.png")
        
    finally:
        print("\n⏳ Закрываем браузер через 5 секунд...")
        time.sleep(5)
        driver.quit()
        
        print("\n" + "="*70)
        print("📊 РЕЗУЛЬТАТЫ ТЕСТА")
        print("="*70)
        print("Проверьте скриншоты:")
        print("  1. step1_homepage.png - главная страница")
        print("  2. step2_after_login_click.png - после клика Log In")
        print("  3. step4_form_filled.png - заполненная форма")
        print("  4. step5_after_signin.png - после Sign In")

if __name__ == "__main__":
    test_login()
