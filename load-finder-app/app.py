"""
Flask сервер для Load Finder приложения
"""
from flask import Flask, render_template, request, jsonify
from real_scraper import RealLoadScraper
import json

app = Flask(__name__)
scraper = RealLoadScraper()

@app.route('/')
def index():
    """Главная страница"""
    return render_template('index.html')

@app.route('/api/search', methods=['POST'])
def search_loads():
    """API для поиска грузов"""
    try:
        filters = request.get_json()
        print(f"\n🔍 Новый поиск: {filters}")
        loads = scraper.search_loads(filters)
        
        return jsonify({
            'success': True,
            'count': len(loads),
            'loads': loads
        })
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/load/<load_id>')
def get_load_details(load_id):
    """Получить детали груза"""
    return jsonify({
        'success': True,
        'load_id': load_id
    })

if __name__ == '__main__':
    print("🚛 Load Finder запущен!")
    print("📍 Откройте: http://localhost:5000")
    print("🌐 Источники: PickaTruckLoad.com, FreightFinder.com")
    print("⚠️  Если сайты блокируют - показываются демо-данные для обучения\n")
    app.run(debug=True, host='0.0.0.0', port=5000)
