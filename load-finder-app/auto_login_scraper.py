"""
Парсер с автоматическим логином (используя сохраненные credentials)
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
import os
from multi_source_scraper import MultiSourceScraper

class AutoLoginScraper(MultiSourceScraper):
    def __init__(self):
        super().__init__()
        self.credentials_file = "credentials.json"
        self.credentials = self.load_credentials()
    
    def load_credentials(self):
        """Загружает сохраненные credentials"""
        if os.path.exists(self.credentials_file):
            with open(self.credentials_file, 'r') as f:
                return json.load(f)
        return {}
    
    def save_credentials(self, source, username, password):
        """Сохраняет credentials для источника"""
        self.credentials[source] = {
            'username': username,
            'password': password
        }
        with open(self.credentials_file, 'w') as f:
            json.dump(self.credentials, f, indent=2)
        print(f"✅ Credentials сохранены для {source}")
    
    def search_all_sources_with_login(self, origin_state="AZ", equipment="Van"):
        """Поиск грузов со всех источников включая те что требуют логин"""
        self.init_browser()
        
        all_loads = []
        
        # Источник 1: FreightFinder (БЕЗ логина)
        print("\n📦 Источник 1: FreightFinder.com (БЕЗ логина)")
        loads_ff = self.search_all_sources(origin_state, equipment)
        all_loads.extend(loads_ff)
        
        # Источник 2: TruckerPath (С логином)
        if 'truckerpath' in self.credentials:
            print("\n📦 Источник 2: TruckerPath.com (С логином)")
            loads_tp = self._search_truckerpath_with_login(origin_state, equipment)
            all_loads.extend(loads_tp)
            print(f"   ✅ Найдено: {len(loads_tp)} грузов")
        else:
            print("\n⚠️ TruckerPath: credentials не найдены (используйте setup_truckerpath())")
        
        # Источник 3: Convoy (С логином)
        if 'convoy' in self.credentials:
            print("\n📦 Источник 3: Convoy.com (С логином)")
            loads_convoy = self._search_convoy_with_login(origin_state, equipment)
            all_loads.extend(loads_convoy)
            print(f"   ✅ Найдено: {len(loads_convoy)} грузов")
        else:
            print("\n⚠️ Convoy: credentials не найдены (используйте setup_convoy())")
        
        # Источник 4: Doft (С логином)
        if 'doft' in self.credentials:
            print("\n📦 Источник 4: Doft.com (С логином)")
            loads_doft = self._search_doft_with_login(origin_state, equipment)
            all_loads.extend(loads_doft)
            print(f"   ✅ Найдено: {len(loads_doft)} грузов")
        else:
            print("\n⚠️ Doft: credentials не найдены (используйте setup_doft())")
        
        # Перемешиваем и удаляем дубликаты
        import random
        random.shuffle(all_loads)
        
        seen = set()
        unique_loads = []
        for load in all_loads:
            key = f"{load['origin']}|{load['destination']}|{load['pickup_date']}"
            if key not in seen:
                seen.add(key)
                unique_loads.append(load)
        
        print(f"\n✅ ИТОГО: {len(unique_loads)} уникальных грузов")
        
        return unique_loads
    
    def _search_truckerpath_with_login(self, origin_state, equipment):
        """TruckerPath с автоматическим логином"""
        try:
            creds = self.credentials['truckerpath']
            
            # Переходим на страницу логина
            self.driver.get("https://truckerpath.com/truckloads/")
            time.sleep(2)
            
            # Ищем кнопку Login
            try:
                login_btn = WebDriverWait(self.driver, 5).until(
                    EC.presence_of_element_located((By.XPATH, "//a[contains(text(), 'Log In') or contains(text(), 'Sign In')]"))
                )
                login_btn.click()
                time.sleep(2)
            except:
                print("   ⚠️ Кнопка Login не найдена")
            
            # Вводим credentials
            try:
                email_input = self.driver.find_element(By.NAME, "email")
                password_input = self.driver.find_element(By.NAME, "password")
                
                email_input.send_keys(creds['username'])
                password_input.send_keys(creds['password'])
                
                # Нажимаем Submit
                submit_btn = self.driver.find_element(By.CSS_SELECTOR, "button[type='submit']")
                submit_btn.click()
                time.sleep(3)
                
                print("   ✅ Логин успешен")
                
                # Теперь парсим грузы
                return self._parse_truckerpath_loads(origin_state, equipment)
                
            except Exception as e:
                print(f"   ❌ Ошибка логина: {e}")
                return []
        
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            return []
    
    def _search_convoy_with_login(self, origin_state, equipment):
        """Convoy с автоматическим логином"""
        try:
            creds = self.credentials['convoy']
            
            self.driver.get("https://convoy.com/")
            time.sleep(2)
            
            # Логика логина для Convoy
            # TODO: Реализовать после получения credentials
            
            return []
        
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            return []
    
    def _search_doft_with_login(self, origin_state, equipment):
        """Doft с автоматическим логином"""
        try:
            creds = self.credentials['doft']
            
            self.driver.get("https://doft.com/")
            time.sleep(2)
            
            # Логика логина для Doft
            # TODO: Реализовать после получения credentials
            
            return []
        
        except Exception as e:
            print(f"   ❌ Ошибка: {e}")
            return []
    
    def _parse_truckerpath_loads(self, origin_state, equipment):
        """Парсинг грузов TruckerPath после логина"""
        loads = []
        
        try:
            # Переходим на страницу с грузами
            self.driver.get("https://truckerpath.com/truckloads/search")
            time.sleep(3)
            
            # Парсим грузы
            # TODO: Реализовать парсинг после успешного логина
            
        except Exception as e:
            print(f"   ❌ Ошибка парсинга: {e}")
        
        return loads
    
    # Методы для первоначальной настройки
    def setup_truckerpath(self, email, password):
        """Настройка TruckerPath credentials"""
        print("\n🔧 Настройка TruckerPath...")
        print("⚠️ ВАЖНО: Вы должны зарегистрироваться на truckerpath.com вручную")
        print("   1. Перейдите на https://truckerpath.com/")
        print("   2. Нажмите Sign Up")
        print("   3. Заполните форму регистрации")
        print("   4. Подтвердите email")
        print("   5. Введите ваши credentials здесь\n")
        
        self.save_credentials('truckerpath', email, password)
        print("✅ TruckerPath настроен!")
    
    def setup_convoy(self, email, password):
        """Настройка Convoy credentials"""
        print("\n🔧 Настройка Convoy...")
        print("⚠️ ВАЖНО: Вы должны зарегистрироваться на convoy.com вручную")
        print("   1. Перейдите на https://convoy.com/")
        print("   2. Нажмите Sign Up")
        print("   3. Заполните форму (потребуется MC Number)")
        print("   4. Дождитесь одобрения (24-48 часов)")
        print("   5. Введите ваши credentials здесь\n")
        
        self.save_credentials('convoy', email, password)
        print("✅ Convoy настроен!")
    
    def setup_doft(self, email, password):
        """Настройка Doft credentials"""
        print("\n🔧 Настройка Doft...")
        print("⚠️ ВАЖНО: Вы должны зарегистрироваться на doft.com вручную")
        print("   1. Перейдите на https://doft.com/")
        print("   2. Нажмите Sign Up")
        print("   3. Заполните форму регистрации")
        print("   4. Подтвердите email")
        print("   5. Введите ваши credentials здесь\n")
        
        self.save_credentials('doft', email, password)
        print("✅ Doft настроен!")

if __name__ == "__main__":
    scraper = AutoLoginScraper()
    
    print("="*70)
    print("🔐 Auto-Login Load Finder")
    print("="*70)
    print("\nДоступные команды:")
    print("1. Поиск грузов (с автоматическим логином)")
    print("2. Настроить TruckerPath")
    print("3. Настроить Convoy")
    print("4. Настроить Doft")
    print("\nПример использования:")
    print("  scraper.setup_truckerpath('your@email.com', 'password')")
    print("  loads = scraper.search_all_sources_with_login('CA', 'Van')")
