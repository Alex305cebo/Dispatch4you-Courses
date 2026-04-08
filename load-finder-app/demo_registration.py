"""
ДЕМОНСТРАЦИЯ процесса регистрации
Показывает каждый шаг с паузами для наблюдения
"""
from truckerpath_auto_register import TruckerPathAutoRegister
import time

class DemoRegistration(TruckerPathAutoRegister):
    """Демонстрационная версия с паузами и пояснениями"""
    
    def demo_pause(self, message, wait_time=3):
        """Пауза с сообщением"""
        print("\n" + "="*70)
        print(f"👀 {message}")
        print("="*70)
        time.sleep(wait_time)
    
    def get_temp_email(self):
        """Получает временный email с пояснениями"""
        self.demo_pause("ШАГ 1: Открываем temp-mail.org для генерации email", 2)
        
        result = super().get_temp_email()
        
        if result:
            self.demo_pause(f"✅ Email создан: {self.email}\nПосмотрите в браузер temp-mail!", 5)
        
        return result
    
    def fill_registration_form(self):
        """Заполняет форму с пояснениями"""
        self.demo_pause("ШАГ 2: Открываем страницу регистрации TruckerPath", 2)
        
        result = super().fill_registration_form()
        
        if result:
            self.demo_pause("✅ Форма заполнена!\nПосмотрите в браузер TruckerPath - все поля заполнены", 5)
        
        return result
    
    def request_verification_code(self):
        """Запрашивает код с пояснениями"""
        self.demo_pause("ШАГ 3: Нажимаем кнопку GET CODE", 2)
        
        result = super().request_verification_code()
        
        if result:
            self.demo_pause("✅ Код запрошен! Письмо отправлено на email", 3)
        
        return result
    
    def get_verification_code_from_email(self, timeout=120):
        """Получает код с пояснениями"""
        self.demo_pause("ШАГ 4: Проверяем temp-mail на наличие письма с кодом", 2)
        print("⏳ Обновляем страницу каждые 10 секунд...")
        print("👀 Посмотрите в браузер temp-mail - ждем письмо!")
        
        code = super().get_verification_code_from_email(timeout)
        
        if code:
            self.demo_pause(f"✅ КОД ПОЛУЧЕН: {code}\nПосмотрите в браузер - письмо пришло!", 5)
        
        return code
    
    def enter_verification_code(self, code):
        """Вводит код с пояснениями"""
        self.demo_pause(f"ШАГ 5: Вводим код {code} в форму", 2)
        
        result = super().enter_verification_code(code)
        
        if result:
            self.demo_pause("✅ Код введен!\nПосмотрите в браузер TruckerPath - код в поле", 5)
        
        return result
    
    def submit_registration(self):
        """Отправляет форму с пояснениями"""
        self.demo_pause("ШАГ 6: Нажимаем кнопку SIGN UP", 2)
        
        result = super().submit_registration()
        
        if result:
            self.demo_pause("✅ Регистрация завершена!\nПосмотрите в браузер - вы вошли в систему!", 5)
        
        return result
    
    def save_credentials(self):
        """Сохраняет credentials с пояснениями"""
        self.demo_pause("ШАГ 7: Сохраняем данные для входа", 2)
        
        super().save_credentials()
        
        self.demo_pause("✅ Credentials сохранены в credentials.json", 3)

if __name__ == "__main__":
    print("="*70)
    print("🎬 ДЕМОНСТРАЦИЯ АВТОМАТИЧЕСКОЙ РЕГИСТРАЦИИ")
    print("="*70)
    print("\nЭта демонстрация покажет весь процесс регистрации пошагово")
    print("Вы увидите:")
    print("  1. Генерацию временного email на temp-mail.org")
    print("  2. Заполнение формы регистрации на TruckerPath")
    print("  3. Получение 6-значного кода по email")
    print("  4. Ввод кода и завершение регистрации")
    print("\nОткроются 2 браузера:")
    print("  - Левый: temp-mail.org (для получения кода)")
    print("  - Правый: TruckerPath (для регистрации)")
    
    input("\n👉 Нажмите Enter для начала демонстрации...")
    
    demo = DemoRegistration()
    success = demo.run()
    
    if success:
        print("\n" + "="*70)
        print("✅ ДЕМОНСТРАЦИЯ ЗАВЕРШЕНА!")
        print("="*70)
        print("\n📊 Что вы увидели:")
        print("  ✅ Автоматическая генерация email")
        print("  ✅ Автоматическое заполнение формы")
        print("  ✅ Автоматическое получение кода из email")
        print("  ✅ Автоматический ввод кода")
        print("  ✅ Успешная регистрация")
        print("\n🚀 Для реальной регистрации запустите:")
        print("  python truckerpath_auto_register.py")
    else:
        print("\n❌ Демонстрация прервана")
