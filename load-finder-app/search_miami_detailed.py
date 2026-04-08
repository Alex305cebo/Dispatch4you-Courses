"""
Детальный поиск грузов ИЗ Miami, FL
Кликает на каждый груз и извлекает полную информацию
"""
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time
import json
import re

def load_credentials():
    """Загружает credentials"""
    try:
        with open("credentials.json", "r") as f:
            creds = json.load(f)
            return creds.get("truckerpath", {})
    except:
        print("❌ credentials.json не найден!")
        return None

def login(driver, credentials):
    """Логин на TruckerPath - проверенный метод"""
    print("\n🔐 Вход в TruckerPath...")
    
    try:
        # Очищаем cookies
        print("   🧹 Очищаем cookies...")
        driver.delete_all_cookies()
        
        # Открываем главную страницу
        print("   🌐 Открываем loadboard.truckerpath.com...")
        driver.get("https://loadboard.truckerpath.com/carrier/loads/home")
        time.sleep(1.5)
        
        # ШАГ 1: Нажимаем кнопку "Log In"
        print("\n   🔘 Ищем кнопку 'Log In'...")
        login_button_found = False
        
        # Способ 1: По тексту
        try:
            login_buttons = driver.find_elements(By.XPATH, "//*[contains(text(), 'Log In') or contains(text(), 'LOG IN')]")
            for btn in login_buttons:
                if btn.is_displayed():
                    driver.execute_script("arguments[0].scrollIntoView(true);", btn)
                    time.sleep(0.5)
                    driver.execute_script("arguments[0].click();", btn)
                    print("   ✅ Кнопка 'Log In' нажата!")
                    login_button_found = True
                    break
        except:
            pass
        
        if not login_button_found:
            print("   ⚠️ Кнопка Log In не найдена, возможно уже на странице логина")
        
        # ШАГ 2: Ждем модальное окно
        print("\n   ⏳ Ожидаем модальное окно логина...")
        try:
            email_input = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "input[placeholder='Email address'], input[type='email']"))
            )
            print("   ✅ Модальное окно появилось!")
        except:
            email_input = WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.ID, "sign-in_email"))
            )
            print("   ✅ Форма логина появилась!")
        
        time.sleep(2)
        
        # ШАГ 3: Заполняем Email
        print("\n   📝 Заполнение Email...")
        driver.execute_script("arguments[0].scrollIntoView(true);", email_input)
        email_input.clear()
        email_input.click()
        email_input.send_keys(credentials['username'])
        print(f"   ✅ Email: {credentials['username']}")
        
        # ШАГ 4: Заполняем Password
        try:
            password_input = driver.find_element(By.ID, "sign-in_password")
        except:
            password_input = driver.find_element(By.CSS_SELECTOR, "input[type='password']")
        
        password_input.clear()
        password_input.click()
        password_input.send_keys(credentials['password'])
        print(f"   ✅ Password: ***")
        
        # Минимальная задержка
        time.sleep(0.8)
        
        # ШАГ 5: Нажимаем SIGN IN
        print("\n   🔘 Нажимаем 'SIGN IN'...")
        signin_found = False
        
        # Способ 1: По классу
        try:
            signin_btn = WebDriverWait(driver, 10).until(
                EC.element_to_be_clickable((By.CSS_SELECTOR, "button.tlant-btn-primary"))
            )
            signin_btn.click()
            print("   ✅ Кнопка 'SIGN IN' нажата!")
            signin_found = True
        except:
            pass
        
        # Способ 2: JavaScript
        if not signin_found:
            try:
                signin_buttons = driver.find_elements(By.XPATH, "//button[contains(text(), 'SIGN IN')]")
                for btn in signin_buttons:
                    if 'SIGN IN' in btn.text and 'UP' not in btn.text:
                        driver.execute_script("arguments[0].click();", btn)
                        print("   ✅ Кнопка 'SIGN IN' нажата (JS)!")
                        signin_found = True
                        break
            except:
                pass
        
        # Способ 3: Enter
        if not signin_found:
            from selenium.webdriver.common.keys import Keys
            password_input.send_keys(Keys.RETURN)
            print("   ✅ Нажат Enter!")
        
        time.sleep(5)
        
        # Проверка
        current_url = driver.current_url
        print(f"\n   📍 URL: {current_url}")
        
        if "loads" in current_url and "sign-in" not in current_url:
            print("✅ Вход выполнен успешно!")
            return True
        else:
            print("⚠️ Возможно требуется проверка")
            driver.save_screenshot("login_check.png")
            return False
        
    except Exception as e:
        print(f"❌ Ошибка входа: {e}")
        import traceback
        traceback.print_exc()
        try:
            driver.save_screenshot("login_error.png")
        except:
            pass
        return False

def search_loads(driver, city="Miami", state="FL"):
    """Поиск грузов - проверенный метод"""
    print(f"\n🔍 Поиск грузов из {city}, {state}...")
    
    try:
        # Обновляем страницу после логина
        print("   🔄 Обновляем страницу...")
        driver.refresh()
        time.sleep(3)
        
        # Ищем поле Pick Up разными способами
        print("   📝 Ищем поле Pick Up...")
        pickup_input = None
        
        # Способ 1: По placeholder
        try:
            pickup_input = driver.find_element(By.CSS_SELECTOR, "input[placeholder*='Pick Up']")
            print("   ✅ Найдено по placeholder")
        except:
            pass
        
        # Способ 2: По ID или name
        if not pickup_input:
            try:
                pickup_input = driver.find_element(By.CSS_SELECTOR, "input[id*='pick'], input[name*='pick']")
                print("   ✅ Найдено по ID/name")
            except:
                pass
        
        # Способ 3: Перебираем все input
        if not pickup_input:
            inputs = driver.find_elements(By.TAG_NAME, "input")
            for inp in inputs:
                placeholder = inp.get_attribute('placeholder') or ''
                if 'pick' in placeholder.lower():
                    pickup_input = inp
                    print(f"   ✅ Найдено: placeholder='{placeholder}'")
                    break
        
        if not pickup_input:
            print("   ❌ Поле Pick Up не найдено!")
            driver.save_screenshot("pickup_not_found.png")
            return False
        
        # Заполняем поле
        pickup_input.click()
        time.sleep(0.5)
        
        search_text = f"{city}, {state}"
        pickup_input.clear()
        pickup_input.send_keys(search_text)
        print(f"   ✅ Pick Up: {search_text}")
        time.sleep(1.5)
        
        # Нажимаем Enter
        from selenium.webdriver.common.keys import Keys
        pickup_input.send_keys(Keys.RETURN)
        time.sleep(1)
        
        # Ищем и нажимаем кнопку SEARCH
        print("   🔘 Ищем кнопку SEARCH...")
        try:
            search_btn = None
            
            # Способ 1: По тексту
            try:
                search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'SEARCH') or contains(text(), 'Search')]")
            except:
                pass
            
            # Способ 2: Перебираем кнопки
            if not search_btn:
                buttons = driver.find_elements(By.TAG_NAME, "button")
                for btn in buttons:
                    if 'search' in btn.text.lower():
                        search_btn = btn
                        break
            
            if search_btn:
                search_btn.click()
                print("   ✅ Кнопка SEARCH нажата!")
                time.sleep(3)
            else:
                print("   ⚠️ Кнопка SEARCH не найдена, используем Enter")
        except Exception as e:
            print(f"   ⚠️ Ошибка нажатия SEARCH: {e}")
        
        print("✅ Поиск выполнен!")
        driver.save_screenshot("search_completed.png")
        return True
        
    except Exception as e:
        print(f"❌ Ошибка поиска: {e}")
        import traceback
        traceback.print_exc()
        try:
            driver.save_screenshot("search_error.png")
        except:
            pass
        return False

def extract_load_details(driver, load_element):
    """Извлекает детали груза после клика"""
    details = {
        'origin': 'N/A',
        'destination': 'N/A',
        'pickup_date': 'N/A',
        'distance': 'N/A',
        'weight': 'N/A',
        'rate': 'N/A',
        'phone': 'N/A',
        'email': 'N/A',
        'broker': 'N/A'
    }
    
    try:
        # Кликаем на груз
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", load_element)
        time.sleep(0.5)
        driver.execute_script("arguments[0].click();", load_element)
        time.sleep(2)
        
        # Ждем появления детальной панели
        try:
            detail_panel = WebDriverWait(driver, 5).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='detail'], [class*='panel'], [class*='modal']"))
            )
            
            # Получаем весь текст панели
            panel_text = detail_panel.text
            
            # Извлекаем данные
            # Origin и Destination
            cities = re.findall(r'([A-Z][a-zA-Z\s]+),\s*([A-Z]{2})', panel_text)
            if len(cities) >= 2:
                details['origin'] = f"{cities[0][0]}, {cities[0][1]}"
                details['destination'] = f"{cities[1][0]}, {cities[1][1]}"
            
            # Дата
            date_match = re.search(r'(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}', panel_text)
            if date_match:
                details['pickup_date'] = date_match.group(0)
            
            # Расстояние
            distance_match = re.search(r'(\d+,?\d*)\s*mi', panel_text)
            if distance_match:
                details['distance'] = distance_match.group(0)
            
            # Цена
            price_match = re.search(r'\$(\d+,?\d+)', panel_text)
            if price_match:
                details['rate'] = '$' + price_match.group(1)
            
            # Вес
            weight_match = re.search(r'(\d+,?\d+)\s*lbs', panel_text)
            if weight_match:
                details['weight'] = weight_match.group(1) + ' lbs'
            
            # Телефон (10 цифр)
            phone_match = re.search(r'(\d{3}[-.]?\d{3}[-.]?\d{4})', panel_text)
            if phone_match:
                details['phone'] = phone_match.group(1)
            
            # Email
            email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', panel_text)
            if email_match:
                details['email'] = email_match.group(1)
            
            # Broker/Company name (обычно в начале или рядом с контактами)
            broker_match = re.search(r'(Company|Broker|Carrier):\s*([A-Za-z0-9\s&,.-]+)', panel_text)
            if broker_match:
                details['broker'] = broker_match.group(2).strip()
            else:
                # Пробуем найти название компании в тексте
                lines = panel_text.split('\n')
                for line in lines:
                    if 'LLC' in line or 'Inc' in line or 'Corp' in line or 'Company' in line:
                        details['broker'] = line.strip()
                        break
            
            # Закрываем панель (ESC)
            from selenium.webdriver.common.keys import Keys
            driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ESCAPE)
            time.sleep(0.5)
            
        except Exception as e:
            print(f"   ⚠️ Не удалось открыть детали: {e}")
        
    except Exception as e:
        print(f"   ⚠️ Ошибка клика: {e}")
    
    return details

def parse_loads_detailed(driver):
    """Парсит грузы с детальной информацией"""
    print("\n📦 Парсинг грузов с деталями...")
    
    loads = []
    
    try:
        time.sleep(3)
        
        # Находим все карточки грузов
        load_cards = driver.find_elements(By.CSS_SELECTOR, "[class*='load'], [class*='card'], [class*='item']")
        
        print(f"   Найдено элементов: {len(load_cards)}")
        
        # Ограничиваем количество для теста
        max_loads = min(20, len(load_cards))
        
        for i, card in enumerate(load_cards[:max_loads], 1):
            print(f"\n   Груз {i}/{max_loads}...")
            
            details = extract_load_details(driver, card)
            
            # Проверяем что груз ИЗ Miami
            if 'Miami' in details['origin'] and details['rate'] != 'N/A':
                print(f"   ✅ {details['origin']} → {details['destination']} | {details['rate']}")
                loads.append(details)
            else:
                print(f"   ⏭️ Пропускаем: {details['origin']} (не из Miami или нет цены)")
        
        print(f"\n✅ Найдено грузов ИЗ Miami с ценами: {len(loads)}")
        return loads
        
    except Exception as e:
        print(f"❌ Ошибка парсинга: {e}")
        import traceback
        traceback.print_exc()
        return loads

def main():
    print("="*70)
    print("🚛 ДЕТАЛЬНЫЙ ПОИСК ГРУЗОВ ИЗ MIAMI, FL")
    print("="*70)
    
    credentials = load_credentials()
    if not credentials:
        return
    
    # Запускаем браузер
    print("\n🚀 Запуск браузера...")
    chrome_options = Options()
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--disable-dev-shm-usage')
    chrome_options.add_argument('--window-size=1920,1080')
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    try:
        # Логин
        if not login(driver, credentials):
            return
        
        # Поиск
        if not search_loads(driver, "Miami", "FL"):
            return
        
        # Парсинг с деталями
        loads = parse_loads_detailed(driver)
        
        if loads:
            # Сохраняем
            with open("miami_loads_detailed.json", "w", encoding="utf-8") as f:
                json.dump(loads, f, indent=2, ensure_ascii=False)
            
            print(f"\n💾 Результаты сохранены: miami_loads_detailed.json")
            
            # Показываем
            print(f"\n📊 ГРУЗЫ ИЗ MIAMI, FL С ПОЛНОЙ ИНФОРМАЦИЕЙ:\n")
            for i, load in enumerate(loads, 1):
                print(f"{i}. {load['origin']} → {load['destination']}")
                print(f"   💰 Rate: {load['rate']}")
                print(f"   📏 Distance: {load['distance']}")
                print(f"   📅 Pickup: {load['pickup_date']}")
                print(f"   ⚖️ Weight: {load['weight']}")
                print(f"   🏢 Broker: {load['broker']}")
                print(f"   📞 Phone: {load['phone']}")
                print(f"   📧 Email: {load['email']}")
                print()
        else:
            print("\n⚠️ Грузы ИЗ Miami с ценами не найдены")
        
        input("\n⏸️ Нажмите Enter чтобы закрыть...")
        
    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        driver.quit()
        print("✅ Браузер закрыт")

if __name__ == "__main__":
    main()
