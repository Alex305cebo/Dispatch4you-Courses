"""
Тестирование всех источников по отдельности
"""
from multi_source_scraper import MultiSourceScraper
import time

def test_source(scraper, source_name, method_name):
    """Тестирует один источник"""
    print(f"\n{'='*60}")
    print(f"🧪 Тестирование: {source_name}")
    print(f"{'='*60}")
    
    try:
        method = getattr(scraper, method_name)
        loads = method("CA", "Van")
        
        print(f"✅ Найдено: {len(loads)} грузов")
        
        if loads:
            print(f"\n📦 Примеры грузов:")
            for i, load in enumerate(loads[:3], 1):
                print(f"\n{i}. ID: {load['id']}")
                print(f"   Дата: {load['pickup_date']}")
                print(f"   Маршрут: {load['origin']} → {load['destination']}")
                print(f"   Оборудование: {load['equipment']}")
                print(f"   Брокер: {load['broker']}")
                print(f"   Телефон: {load['phone']}")
                print(f"   Источник: {load['source']}")
        else:
            print("⚠️ Грузы не найдены")
    
    except Exception as e:
        print(f"❌ ОШИБКА: {e}")
    
    time.sleep(2)

if __name__ == "__main__":
    print("🚀 Запуск тестирования всех источников...")
    
    scraper = MultiSourceScraper()
    scraper.init_browser()
    
    try:
        # Тестируем каждый источник отдельно
        test_source(scraper, "FreightFinder.com", "_search_freightfinder")
        test_source(scraper, "TruckerPath.com", "_search_truckerpath")
        test_source(scraper, "PickaTruckLoad.com", "_search_pickatruckload_public")
        test_source(scraper, "AllTruckers.com", "_search_alltruckers")
        test_source(scraper, "Trulos.com", "_search_trulos")
        
        print(f"\n{'='*60}")
        print("✅ Тестирование завершено!")
        print(f"{'='*60}")
    
    finally:
        scraper.close()
