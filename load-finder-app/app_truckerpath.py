"""
Flask приложение - ТОЛЬКО TruckerPath Loadboard
Использует автоматический логин
"""
from flask import Flask, render_template, request, jsonify
from truckerpath_scraper_final import TruckerPathScraper

app = Flask(__name__)
scraper = None

@app.route('/')
def index():
    return render_template('index_detailed.html')

@app.route('/test')
def test():
    return render_template('test_button.html')

@app.route('/api/search', methods=['POST'])
def search():
    global scraper
    
    print("\n" + "="*70)
    print("🔍 ПОЛУЧЕН ЗАПРОС НА /api/search")
    print("="*70)
    
    try:
        filters = request.get_json()
        print(f"📦 Полученные данные: {filters}")
        
        origin_state = filters.get('origin_state', 'CA')
        equipment = filters.get('equipment_type', 'Van')
        
        print(f"📍 Штат: {origin_state}")
        print(f"🚛 Оборудование: {equipment}")
        
        # Определяем город по штату (главные города штатов)
        state_cities = {
            'CA': 'Los Angeles',
            'TX': 'Houston',
            'FL': 'Miami',
            'NY': 'New York',
            'IL': 'Chicago',
            'PA': 'Philadelphia',
            'OH': 'Columbus',
            'GA': 'Atlanta',
            'NC': 'Charlotte',
            'MI': 'Detroit',
            'AZ': 'Phoenix'
        }
        origin_city = state_cities.get(origin_state, 'Los Angeles')
        
        print(f"\n📥 Запрос: {origin_city}, {origin_state}, {equipment}")
        
        # Инициализируем scraper если еще не создан
        if not scraper:
            print("🚀 Инициализация scraper...")
            scraper = TruckerPathScraper()
            scraper.init_browser(headless=True)
            
            print("🔐 Логин...")
            if not scraper.login():
                return jsonify({
                    'success': False,
                    'error': 'Не удалось войти в TruckerPath'
                }), 500
        
        # Ищем грузы
        print(f"🔍 Поиск грузов: {origin_city}, {origin_state}")
        success = scraper.search_loads(origin_city, origin_state, equipment)
        
        loads = []
        if success:
            print("📦 Парсинг результатов...")
            loads = scraper.parse_loads()
        
        print(f"✅ Найдено грузов: {len(loads)}")
        
        return jsonify({
            'success': True,
            'count': len(loads),
            'loads': loads,
            'source': 'TruckerPath Loadboard'
        })
    except Exception as e:
        print(f"❌ Ошибка API: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("="*70)
    print("🚛 LOAD FINDER - TRUCKERPATH LOADBOARD")
    print("="*70)
    print("📍 http://localhost:5000")
    print("🌐 Источник: TruckerPath Loadboard")
    print("✅ Автоматический логин")
    print("📊 500-1000 реальных грузов")
    print("🔐 Credentials: credentials.json\n")
    
    try:
        app.run(debug=False, host='0.0.0.0', port=5000)
    finally:
        if scraper and scraper.driver:
            scraper.driver.quit()
