"""
Flask приложение с несколькими источниками грузов
"""
from flask import Flask, render_template, request, jsonify
from multi_source_scraper import MultiSourceScraper

app = Flask(__name__)
scraper = MultiSourceScraper()

@app.route('/')
def index():
    return render_template('index_detailed.html')

@app.route('/api/search', methods=['POST'])
def search():
    try:
        filters = request.get_json()
        origin_state = filters.get('origin_state', 'AZ')
        equipment = filters.get('equipment_type', 'Van')
        
        print(f"\n📥 Запрос: {origin_state}, {equipment}")
        
        loads = scraper.search_all_sources(origin_state, equipment)
        
        return jsonify({
            'success': True,
            'count': len(loads),
            'loads': loads
        })
    except Exception as e:
        print(f"❌ Ошибка API: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    print("🚛 Load Finder - Реальные грузы!")
    print("📍 http://localhost:5000")
    print("🌐 Источник: FreightFinder.com")
    print("📊 15 запросов (5 штатов × 3 типа оборудования)")
    print("✅ 100% реальные грузы БЕЗ регистрации")
    print("⚠️ ВАЖНО: FreightFinder - единственный бесплатный источник БЕЗ регистрации\n")
    
    try:
        app.run(debug=False, host='0.0.0.0', port=5000)
    finally:
        scraper.close()
