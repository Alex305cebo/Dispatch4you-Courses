"""
Поиск грузов: Miami, Florida | Reefer
"""
from truckerpath_scraper_final import TruckerPathScraper
import json

def main():
    print("="*70)
    print("🚛 LOAD FINDER - MIAMI, FL | REEFER")
    print("="*70)
    
    # Параметры поиска
    city = "Miami"
    state = "FL"
    equipment = "Reefer"
    
    print(f"\n🔍 Поиск: {city}, {state} | {equipment}")
    print("="*70)
    
    # Создаем scraper
    scraper = TruckerPathScraper()
    
    try:
        # Инициализируем браузер (видимый для отладки)
        print("\n🚀 Запуск браузера...")
        scraper.init_browser(headless=False)
        
        # Логинимся
        print("\n🔐 Вход в TruckerPath...")
        if not scraper.login():
            print("❌ Не удалось войти")
            input("\nНажмите Enter чтобы закрыть...")
            return
        
        print("✅ Вход выполнен успешно!")
        
        # Ищем грузы
        print(f"\n🔍 Поиск грузов в {city}, {state}...")
        success = scraper.search_loads(city, state, equipment)
        
        if not success:
            print("❌ Не удалось выполнить поиск")
            input("\nНажмите Enter чтобы закрыть...")
            return
        
        print("✅ Поиск выполнен!")
        
        # Парсим результаты
        print("\n📦 Парсинг результатов...")
        loads = scraper.parse_loads()
        
        print(f"\n✅ НАЙДЕНО ГРУЗОВ: {len(loads)}")
        print("="*70)
        
        if loads:
            # Сохраняем в JSON
            with open("miami_reefer_loads.json", "w", encoding="utf-8") as f:
                json.dump(loads, f, indent=2, ensure_ascii=False)
            print("💾 Результаты сохранены в: miami_reefer_loads.json")
            
            # Показываем все грузы
            print(f"\n📊 ВСЕ НАЙДЕННЫЕ ГРУЗЫ ({len(loads)}):\n")
            for i, load in enumerate(loads, 1):
                print(f"{i}. {load['origin']} → {load['destination']}")
                print(f"   📅 Pickup: {load['pickup_date']}")
                print(f"   📏 Distance: {load.get('distance', 'N/A')}")
                print(f"   💰 Rate: {load.get('rate', 'N/A')}")
                print(f"   ⚖️ Weight: {load.get('weight', 'N/A')}")
                print(f"   📞 Phone: {load.get('phone', 'N/A')}")
                print(f"   📧 Email: {load.get('email', 'N/A')}")
                print(f"   🚛 Equipment: {load['equipment']}")
                print(f"   🏢 Broker: {load['broker']}")
                print()
        else:
            print("⚠️ Грузы не найдены")
            print("\n💡 Возможные причины:")
            print("   - Нет доступных грузов в этом направлении")
            print("   - Форма поиска не была заполнена правильно")
            print("   - Страница загрузилась не полностью")
        
        input("\n⏸️ Нажмите Enter чтобы закрыть браузер...")
        
    except Exception as e:
        print(f"\n❌ ОШИБКА: {e}")
        import traceback
        traceback.print_exc()
        input("\nНажмите Enter чтобы закрыть...")
    
    finally:
        if scraper.driver:
            scraper.driver.quit()
            print("✅ Браузер закрыт")

if __name__ == "__main__":
    main()
