"""
Прямой поиск грузов на TruckerPath - БЕЗ веб-интерфейса
Просто запускаете скрипт и получаете грузы
"""
import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from truckerpath_scraper_final import TruckerPathScraper
import json

def main():
    print("="*70)
    print("🚛 LOAD FINDER - ПРЯМОЙ ПОИСК")
    print("="*70)
    
    # Запрашиваем параметры поиска
    print("\n📍 Выберите штат:")
    print("1. Arizona (AZ)")
    print("2. California (CA)")
    print("3. Texas (TX)")
    print("4. Florida (FL)")
    print("5. Illinois (IL)")
    
    choice = input("\nВведите номер (1-5): ").strip()
    
    states = {
        '1': ('AZ', 'Phoenix'),
        '2': ('CA', 'Los Angeles'),
        '3': ('TX', 'Houston'),
        '4': ('FL', 'Miami'),
        '5': ('IL', 'Chicago')
    }
    
    if choice not in states:
        print("❌ Неверный выбор!")
        return
    
    state_code, city = states[choice]
    
    print("\n🚛 Выберите тип трейлера:")
    print("1. Dry Van")
    print("2. Reefer")
    print("3. Flatbed")
    
    eq_choice = input("\nВведите номер (1-3): ").strip()
    
    equipment_types = {
        '1': 'Dry Van',
        '2': 'Reefer',
        '3': 'Flatbed'
    }
    
    equipment = equipment_types.get(eq_choice, 'Dry Van')
    
    print(f"\n🔍 Ищем грузы: {city}, {state_code} | {equipment}")
    print("="*70)
    
    # Создаем scraper
    scraper = TruckerPathScraper()
    
    try:
        # Инициализируем браузер
        scraper.init_browser(headless=False)
        
        # Логинимся
        print("\n🔐 Вход в TruckerPath...")
        if not scraper.login():
            print("❌ Не удалось войти")
            return
        
        # Ищем грузы
        print(f"\n🔍 Поиск грузов в {city}, {state_code}...")
        success = scraper.search_loads(city, state_code, equipment)
        
        if not success:
            print("❌ Не удалось выполнить поиск")
            return
        
        # Парсим результаты
        print("\n📦 Парсинг результатов...")
        loads = scraper.parse_loads()
        
        print(f"\n✅ НАЙДЕНО ГРУЗОВ: {len(loads)}")
        print("="*70)
        
        if loads:
            # Сохраняем в JSON
            with open("found_loads.json", "w", encoding="utf-8") as f:
                json.dump(loads, f, indent=2, ensure_ascii=False)
            print("💾 Результаты сохранены в: found_loads.json")
            
            # Показываем первые 5 грузов
            print("\n📊 ПЕРВЫЕ 5 ГРУЗОВ:\n")
            for i, load in enumerate(loads[:5], 1):
                print(f"{i}. {load['origin']} → {load['destination']}")
                print(f"   📅 Pickup: {load['pickup_date']}")
                print(f"   📏 Distance: {load.get('distance', 'N/A')}")
                print(f"   💰 Rate: {load.get('rate', 'N/A')}")
                print(f"   📞 Phone: {load.get('phone', 'N/A')}")
                print(f"   🚛 Equipment: {load['equipment']}")
                print()
        else:
            print("⚠️ Грузы не найдены")
        
        input("\n⏸️ Нажмите Enter чтобы закрыть браузер...")
        
    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        if scraper.driver:
            scraper.driver.quit()
            print("✅ Браузер закрыт")

if __name__ == "__main__":
    main()
