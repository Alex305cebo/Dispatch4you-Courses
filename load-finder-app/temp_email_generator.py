"""
Генератор временной почты - БЕСПЛАТНО
Использует API 1secmail.com
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

import requests
import time
import random
import string

class TempEmailGenerator:
    def __init__(self):
        self.base_url = "https://www.1secmail.com/api/v1/"
        self.email = None
        self.login = None
        self.domain = None
    
    def generate_email(self):
        """Генерирует случайный временный email"""
        # Генерируем случайное имя
        username = ''.join(random.choices(string.ascii_lowercase + string.digits, k=10))
        
        # Получаем доступные домены
        domains = self._get_domains()
        
        if domains:
            self.domain = random.choice(domains)
            self.login = username
            self.email = f"{username}@{self.domain}"
            
            print(f"✅ Создан временный email: {self.email}")
            return self.email
        else:
            print("❌ Не удалось получить домены")
            return None
    
    def _get_domains(self):
        """Получает список доступных доменов"""
        try:
            response = requests.get(f"{self.base_url}?action=getDomainList", timeout=5)
            if response.status_code == 200:
                return response.json()
        except:
            pass
        
        # Fallback домены
        return ['1secmail.com', '1secmail.org', '1secmail.net', 'wwjmp.com', 'esiix.com']
    
    def check_inbox(self):
        """Проверяет входящие письма"""
        if not self.email:
            print("❌ Email не создан. Используйте generate_email()")
            return []
        
        try:
            url = f"{self.base_url}?action=getMessages&login={self.login}&domain={self.domain}"
            response = requests.get(url)
            
            if response.status_code == 200:
                messages = response.json()
                return messages
            return []
        except Exception as e:
            print(f"❌ Ошибка проверки почты: {e}")
            return []
    
    def read_message(self, message_id):
        """Читает конкретное письмо"""
        if not self.email:
            print("❌ Email не создан")
            return None
        
        try:
            url = f"{self.base_url}?action=readMessage&login={self.login}&domain={self.domain}&id={message_id}"
            response = requests.get(url)
            
            if response.status_code == 200:
                return response.json()
            return None
        except Exception as e:
            print(f"❌ Ошибка чтения письма: {e}")
            return None
    
    def wait_for_email(self, timeout=60, check_interval=5):
        """Ждет получения письма"""
        print(f"\n⏳ Ожидание письма (до {timeout} секунд)...")
        
        start_time = time.time()
        
        while time.time() - start_time < timeout:
            messages = self.check_inbox()
            
            if messages:
                print(f"✅ Получено писем: {len(messages)}")
                return messages
            
            remaining = int(timeout - (time.time() - start_time))
            print(f"   Проверка... (осталось {remaining} сек)")
            time.sleep(check_interval)
        
        print("⏰ Время ожидания истекло")
        return []
    
    def display_messages(self, messages):
        """Отображает список писем"""
        if not messages:
            print("📭 Нет писем")
            return
        
        print(f"\n📬 Входящие ({len(messages)} писем):")
        print("="*70)
        
        for i, msg in enumerate(messages, 1):
            print(f"\n{i}. От: {msg.get('from', 'N/A')}")
            print(f"   Тема: {msg.get('subject', 'N/A')}")
            print(f"   Дата: {msg.get('date', 'N/A')}")
            print(f"   ID: {msg.get('id', 'N/A')}")
    
    def display_message_content(self, message):
        """Отображает содержимое письма"""
        if not message:
            print("❌ Письмо не найдено")
            return
        
        print("\n" + "="*70)
        print(f"От: {message.get('from', 'N/A')}")
        print(f"Тема: {message.get('subject', 'N/A')}")
        print(f"Дата: {message.get('date', 'N/A')}")
        print("="*70)
        print("\nТекст письма:")
        print(message.get('textBody', message.get('body', 'Нет текста')))
        
        # Ищем ссылки для подтверждения
        import re
        text = message.get('textBody', message.get('body', ''))
        links = re.findall(r'https?://[^\s<>"]+', text)
        
        if links:
            print("\n🔗 Найденные ссылки:")
            for i, link in enumerate(links, 1):
                print(f"   {i}. {link}")

def interactive_mode():
    """Интерактивный режим"""
    generator = TempEmailGenerator()
    
    print("="*70)
    print("📧 ГЕНЕРАТОР ВРЕМЕННОЙ ПОЧТЫ")
    print("="*70)
    
    # Генерируем email
    email = generator.generate_email()
    
    if not email:
        print("❌ Не удалось создать email")
        return
    
    print(f"\n✅ Ваш временный email: {email}")
    print("📋 Скопируйте его для регистрации")
    print("\n⏳ Ожидание писем...")
    print("   (Нажмите Ctrl+C для выхода)")
    
    try:
        while True:
            print("\n" + "-"*70)
            print("Выберите действие:")
            print("1. Проверить почту")
            print("2. Ждать письмо (60 сек)")
            print("3. Показать email снова")
            print("4. Создать новый email")
            print("5. Выход")
            
            choice = input("\nВыбор: ").strip()
            
            if choice == "1":
                messages = generator.check_inbox()
                generator.display_messages(messages)
                
                if messages:
                    msg_num = input("\nВведите номер письма для чтения (или Enter для пропуска): ").strip()
                    if msg_num.isdigit():
                        idx = int(msg_num) - 1
                        if 0 <= idx < len(messages):
                            msg_id = messages[idx]['id']
                            full_message = generator.read_message(msg_id)
                            generator.display_message_content(full_message)
            
            elif choice == "2":
                messages = generator.wait_for_email(60, 5)
                generator.display_messages(messages)
                
                if messages:
                    msg_id = messages[0]['id']
                    full_message = generator.read_message(msg_id)
                    generator.display_message_content(full_message)
            
            elif choice == "3":
                print(f"\n✅ Ваш email: {generator.email}")
            
            elif choice == "4":
                email = generator.generate_email()
                print(f"\n✅ Новый email: {email}")
            
            elif choice == "5":
                print("\n👋 До свидания!")
                break
            
            else:
                print("❌ Неверный выбор")
    
    except KeyboardInterrupt:
        print("\n\n👋 Прервано пользователем")

if __name__ == "__main__":
    # Можно использовать в двух режимах:
    
    # Режим 1: Интерактивный
    interactive_mode()
    
    # Режим 2: Программный
    # generator = TempEmailGenerator()
    # email = generator.generate_email()
    # print(f"Email: {email}")
    # 
    # # Ждем письмо
    # messages = generator.wait_for_email(60)
    # 
    # if messages:
    #     msg = generator.read_message(messages[0]['id'])
    #     generator.display_message_content(msg)
