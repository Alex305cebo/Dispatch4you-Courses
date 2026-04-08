"""
Тестирование всех бесплатных источников грузов
"""
import requests
from bs4 import BeautifulSoup
import json

class SourceTester:
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive',
        }
        self.session = requests.Session()
        self.results = []
    
    def test_source(self, name, url, method='GET'):
        """Тестирование одного источника"""
        print(f"\n{'='*60}")
        print(f"🔍 Тестирую: {name}")
        print(f"🌐 URL: {url}")
        
        try:
            if method == 'GET':
                response = self.session.get(url, headers=self.headers, timeout=15, allow_redirects=True)
            else:
                response = self.session.head(url, headers=self.headers, timeout=15, allow_redirects=True)
            
            status = response.status_code
            print(f"📊 Статус: {status}")
            
            if status == 200:
                # Проверяем содержимое
                soup = BeautifulSoup(response.content, 'html.parser')
                
                # Ищем признаки грузов
                text = soup.get_text().lower()
                has_loads = any(word in text for word in ['load', 'freight', 'shipment', 'pickup', 'delivery', 'origin', 'destination'])
                
                # Ищем формы авторизации
                has_login = bool(soup.find('input', {'type': 'password'})) or 'login' in text or 'sign in' in text
                
                # Ищем таблицы или списки
                tables = len(soup.find_all('table'))
                divs = len(soup.find_all('div', class_=lambda x: x and ('load' in x.lower() or 'freight' in x.lower())))
                
                print(f"✅ Доступен!")
                print(f"   📦 Упоминания грузов: {'Да' if has_loads else 'Нет'}")
                print(f"   🔐 Требует авторизацию: {'Да' if has_login else 'Нет'}")
                print(f"   📋 Таблиц: {tables}")
                print(f"   📦 Блоков с грузами: {divs}")
                
                self.results.append({
                    'name': name,
                    'url': url,
                    'status': 'accessible',
                    'has_loads': has_loads,
                    'requires_login': has_login,
                    'tables': tables,
                    'load_divs': divs
                })
                
                return True
            elif status == 403:
                print(f"❌ Доступ запрещен (403 Forbidden)")
                self.results.append({'name': name, 'url': url, 'status': 'blocked'})
            elif status == 404:
                print(f"❌ Не найден (404)")
                self.results.append({'name': name, 'url': url, 'status': 'not_found'})
            else:
                print(f"⚠️  Статус: {status}")
                self.results.append({'name': name, 'url': url, 'status': f'status_{status}'})
                
        except requests.exceptions.Timeout:
            print(f"⏱️  Таймаут")
            self.results.append({'name': name, 'url': url, 'status': 'timeout'})
        except requests.exceptions.ConnectionError:
            print(f"❌ Ошибка соединения")
            self.results.append({'name': name, 'url': url, 'status': 'connection_error'})
        except Exception as e:
            print(f"❌ Ошибка: {e}")
            self.results.append({'name': name, 'url': url, 'status': 'error', 'error': str(e)})
        
        return False
    
    def run_all_tests(self):
        """Тестирование всех источников"""
        print("🚛 ТЕСТИРОВАНИЕ БЕСПЛАТНЫХ LOAD BOARDS")
        print("="*60)
        
        sources = [
            # Основные бесплатные load boards
            ('PickaTruckLoad', 'https://www.pickatruckload.com/Load-Boards/index.html'),
            ('FreightFinder', 'https://www.freightfinder.com/load-board'),
            ('Trulos', 'https://www.trulos.com/loads'),
            ('123Loadboard', 'https://www.123loadboard.com/find-loads/'),
            ('Direct Freight', 'https://www.directfreight.com/load-board'),
            ('Trucker Tools', 'https://www.truckertools.com/load-board/'),
            ('TruckerPath', 'https://truckerpath.com/load-board'),
            ('uShip', 'https://www.uship.com/freight/'),
            ('LoadUp', 'https://goloadup.com/'),
            
            # Альтернативные источники
            ('Craigslist Trucking', 'https://www.craigslist.org/search/trp'),
            ('Facebook Marketplace', 'https://www.facebook.com/marketplace/category/freight'),
            ('Indeed Freight Jobs', 'https://www.indeed.com/q-freight-loads-jobs.html'),
            
            # Специализированные
            ('Convoy', 'https://convoy.com/'),
            ('Uber Freight', 'https://www.uberfreight.com/'),
            ('Amazon Relay', 'https://relay.amazon.com/'),
            ('Loadsmart', 'https://loadsmart.com/'),
            
            # Региональные
            ('Central Dispatch', 'https://www.centraldispatch.com/'),
            ('Super Dispatch', 'https://www.superdispatch.com/'),
        ]
        
        for name, url in sources:
            self.test_source(name, url)
        
        # Итоговый отчет
        print(f"\n{'='*60}")
        print("📊 ИТОГОВЫЙ ОТЧЕТ")
        print(f"{'='*60}\n")
        
        accessible = [r for r in self.results if r['status'] == 'accessible']
        blocked = [r for r in self.results if r['status'] == 'blocked']
        
        print(f"✅ Доступных: {len(accessible)}")
        print(f"❌ Заблокированных: {len(blocked)}")
        print(f"⚠️  Других проблем: {len(self.results) - len(accessible) - len(blocked)}")
        
        if accessible:
            print(f"\n🎯 ДОСТУПНЫЕ ИСТОЧНИКИ:")
            for r in accessible:
                print(f"\n   {r['name']}")
                print(f"   URL: {r['url']}")
                print(f"   Грузы: {'✓' if r.get('has_loads') else '✗'}")
                print(f"   Авторизация: {'Требуется' if r.get('requires_login') else 'Не требуется'}")
                if r.get('tables', 0) > 0 or r.get('load_divs', 0) > 0:
                    print(f"   Структура: {r.get('tables', 0)} таблиц, {r.get('load_divs', 0)} блоков")
        
        # Сохраняем результаты
        with open('load-finder-app/source_test_results.json', 'w', encoding='utf-8') as f:
            json.dump(self.results, f, indent=2, ensure_ascii=False)
        
        print(f"\n💾 Результаты сохранены в source_test_results.json")

if __name__ == "__main__":
    tester = SourceTester()
    tester.run_all_tests()
