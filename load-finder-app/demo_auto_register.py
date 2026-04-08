"""
ДЕМОНСТРАЦИЯ автоматической регистрации
Показывает каждый шаг с паузами
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

def demo_step(step_number, description, wait_time=3):
    """Показывает шаг с паузой"""
    print("\n" + "="*70)
    print(f"ШАГ {step_number}: {description}")
    print("="*70)
    time.sleep(wait_time)

def main():
    print("="*70)
    print("🎬 ДЕМОНСТРАЦИЯ АВТОМАТИЧЕСКОЙ РЕГИСТРАЦИИ")
    print("="*70)
    print("\nЭта демонстрация покажет как работает автоматическая регистрация")
    print("Браузер откроется и вы увидите каждый шаг процесса\n")
    
    input("Нажмите Enter для начала...")
    
    # Инициализация браузера
    demo_step(1, "Запуск браузера")
    
    chrome_options = Options()
    # НЕ headless - видимый браузер
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    print("✅ Браузер запущен")
    
    try:
        # ШАГ 2: Генерация email
        demo_step(2, "Открытие temp-mail.org для генерации временного email", 2)
        
        driver.get("https://temp-mail.org/ru/")
        print("✅ Страница temp-mail.org открыта")
        print("⏳ Ожидание загрузки email...")
        time.sleep(5)
        
        # Получаем email
        try:
            email_input = WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.ID, "mail"))
            )
            temp_email = email_input.get_attribute('value')
            
            print(f"\n✅ ВРЕМЕННЫЙ EMAIL СОЗДАН:")
            print(f"   📧 {temp_email}")
            print("\n👀 Посмотрите в браузер - вы видите временный email!")
            
            input("\nНажмите Enter для продолжения...")
            
        except Exception as e:
            print(f"❌ Не удалось получить email: {e}")
            temp_email = "demo@example.com"
        
        # ШАГ 3: Открытие TruckerPath
        demo_step(3, "Открытие страницы регистрации TruckerPath", 2)
        
        # Открываем в новой вкладке
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[1])
        
        driver.get("https://truckerpath.com/")
        print("✅ Страница TruckerPath открыта")
        time.sleep(3)
        
        print("\n👀 Посмотрите в браузер - открыта главная страница TruckerPath")
        input("\nНажмите Enter для продолжения...")
        
        # ШАГ 4: Поиск формы регистрации
        demo_step(4, "Поиск кнопки Sign Up", 2)
        
        try:
            # Ищем кнопку Sign Up
            signup_elements = driver.find_elements(By.XPATH, "//*[contains(text(), 'Sign Up') or contains(text(), 'Sign up')]")
            
            if signup_elements:
                print(f"✅ Найдено элементов Sign Up: {len(signup_elements)}")
                print("\n👀 Посмотрите в браузер - кнопка Sign Up будет подсвечена")
                
                # Подсвечиваем кнопку
                driver.execute_script("arguments[0].style.border='3px solid red'", signup_elements[0])
                time.sleep(2)
                
                input("\nНажмите Enter чтобы кликнуть на Sign Up...")
                
                signup_elements[0].click()
                time.sleep(3)
            else:
                print("⚠️ Кнопка Sign Up не найдена, пробуем прямую ссылку...")
                driver.get("https://truckerpath.com/signup")
                time.sleep(3)
        
        except Exception as e:
            print(f"⚠️ Ошибка: {e}")
            print("Пробуем прямую ссылку...")
            driver.get("https://truckerpath.com/signup")
            time.sleep(3)
        
        # ШАГ 5: Заполнение формы
        demo_step(5, "Заполнение формы регистрации", 2)
        
        print("🔍 Ищем поля формы...")
        
        # Ищем все input поля
        inputs = driver.find_elements(By.TAG_NAME, "input")
        print(f"✅ Найдено input полей: {len(inputs)}")
        
        # Показываем какие поля нашли
        print("\n📝 Найденные поля:")
        for i, inp in enumerate(inputs[:10], 1):
            name = inp.get_attribute('name')
            input_type = inp.get_attribute('type')
            placeholder = inp.get_attribute('placeholder')
            print(f"   {i}. Type: {input_type}, Name: {name}, Placeholder: {placeholder}")
        
        print("\n👀 Посмотрите в браузер - видите форму регистрации?")
        input("\nНажмите Enter для заполнения формы...")
        
        # Пробуем заполнить email
        try:
            email_fields = driver.find_elements(By.CSS_SELECTOR, "input[type='email'], input[name*='email'], input[placeholder*='email' i]")
            
            if email_fields:
                print(f"\n✅ Найдено полей email: {len(email_fields)}")
                
                # Подсвечиваем поле
                driver.execute_script("arguments[0].style.border='3px solid green'", email_fields[0])
                time.sleep(1)
                
                # Заполняем
                email_fields[0].clear()
                email_fields[0].send_keys(temp_email)
                
                print(f"✅ Email заполнен: {temp_email}")
                print("\n👀 Посмотрите в браузер - email введен в форму!")
                
                time.sleep(2)
        except Exception as e:
            print(f"⚠️ Не удалось заполнить email: {e}")
        
        # Пробуем заполнить password
        try:
            password_fields = driver.find_elements(By.CSS_SELECTOR, "input[type='password']")
            
            if password_fields:
                print(f"\n✅ Найдено полей password: {len(password_fields)}")
                
                # Подсвечиваем поле
                driver.execute_script("arguments[0].style.border='3px solid green'", password_fields[0])
                time.sleep(1)
                
                # Заполняем
                demo_password = "DemoPass123!Aa"
                password_fields[0].clear()
                password_fields[0].send_keys(demo_password)
                
                print(f"✅ Password заполнен: {demo_password}")
                print("\n👀 Посмотрите в браузер - password введен!")
                
                time.sleep(2)
        except Exception as e:
            print(f"⚠️ Не удалось заполнить password: {e}")
        
        input("\nНажмите Enter для продолжения...")
        
        # ШАГ 6: Отправка формы
        demo_step(6, "Поиск кнопки Submit", 2)
        
        try:
            submit_buttons = driver.find_elements(By.CSS_SELECTOR, "button[type='submit'], button[type='button']")
            
            if submit_buttons:
                print(f"✅ Найдено кнопок: {len(submit_buttons)}")
                
                for i, btn in enumerate(submit_buttons[:5], 1):
                    text = btn.text
                    print(f"   {i}. {text if text else 'Без текста'}")
                
                # Подсвечиваем первую кнопку
                driver.execute_script("arguments[0].style.border='3px solid red'", submit_buttons[0])
                
                print("\n👀 Посмотрите в браузер - кнопка Submit подсвечена")
                print("\n⚠️ В реальном скрипте здесь будет клик на Submit")
                print("   Но в демо мы НЕ отправляем форму")
        
        except Exception as e:
            print(f"⚠️ Не удалось найти кнопку: {e}")
        
        input("\nНажмите Enter для продолжения...")
        
        # ШАГ 7: Проверка почты
        demo_step(7, "Проверка temp-mail.org на наличие писем", 2)
        
        # Переключаемся на вкладку temp-mail
        driver.switch_to.window(driver.window_handles[0])
        
        print("✅ Переключились на вкладку temp-mail")
        print("\n👀 Посмотрите в браузер - вы видите inbox")
        print("\n⏳ В реальном скрипте здесь будет:")
        print("   1. Обновление страницы каждые 5 секунд")
        print("   2. Поиск новых писем")
        print("   3. Клик на письмо от TruckerPath")
        print("   4. Извлечение ссылки для подтверждения")
        
        time.sleep(3)
        
        # Обновляем страницу для демонстрации
        print("\n🔄 Обновляем страницу...")
        driver.refresh()
        time.sleep(3)
        
        print("\n👀 Посмотрите в браузер - страница обновлена")
        
        input("\nНажмите Enter для продолжения...")
        
        # ШАГ 8: Подтверждение email
        demo_step(8, "Подтверждение email (симуляция)", 2)
        
        print("✅ В реальном скрипте здесь будет:")
        print("   1. Найдено письмо от TruckerPath")
        print("   2. Извлечена ссылка: https://truckerpath.com/verify?token=...")
        print("   3. Открыта ссылка в браузере")
        print("   4. Email подтвержден!")
        
        time.sleep(3)
        
        # ШАГ 9: Сохранение credentials
        demo_step(9, "Сохранение credentials", 2)
        
        print("✅ В реальном скрипте здесь будет:")
        print("   1. Создан файл credentials.json")
        print("   2. Сохранены email и password")
        print("   3. Готово к использованию!")
        
        print("\n📋 Пример credentials.json:")
        print("""
{
  "truckerpath": {
    "username": "abc123@tempmail.com",
    "password": "DemoPass123!Aa"
  }
}
        """)
        
        time.sleep(3)
        
        # ИТОГ
        print("\n" + "="*70)
        print("✅ ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА!")
        print("="*70)
        print("\n📊 Что вы увидели:")
        print("   1. ✅ Генерация временного email на temp-mail.org")
        print("   2. ✅ Открытие страницы TruckerPath")
        print("   3. ✅ Поиск формы регистрации")
        print("   4. ✅ Автоматическое заполнение полей")
        print("   5. ✅ Проверка почты")
        print("   6. ✅ Подтверждение email")
        print("   7. ✅ Сохранение credentials")
        
        print("\n🚀 Для запуска РЕАЛЬНОЙ регистрации:")
        print("   python auto_register_truckerpath.py")
        
        print("\n⏳ Браузер закроется через 10 секунд...")
        time.sleep(10)
    
    finally:
        driver.quit()
        print("\n👋 Демонстрация завершена!")

if __name__ == "__main__":
    main()
