// Скрипт для раскрытия штатов при клике на регион с разделением на сегменты
document.addEventListener('DOMContentLoaded', function() {
  // Цвета для штатов
  const stateColors = {
    'Illinois (Chicago)': '#059669',
    'Michigan (Detroit)': '#10b981',
    'Michigan': '#10b981',
    'Minnesota': '#34d399',
    'Indiana': '#10b981',
    'Ohio': '#059669',
    'Wisconsin': '#10b981',
    'Georgia (Atlanta)': '#4f46e5',
    'Georgia': '#4f46e5',
    'North Carolina': '#6366f1',
    'Tennessee': '#818cf8',
    'South Carolina': '#6366f1',
    'Florida': '#db2777',
    'Texas (Dallas)': '#7c3aed',
    'Texas (Houston)': '#8b5cf6',
    'Texas': '#7c3aed',
    'Oklahoma': '#a78bfa',
    'Louisiana': '#8b5cf6',
    'Pennsylvania': '#db2777',
    'Massachusetts': '#ec4899',
    'New York': '#f472b6',
    'New Jersey': '#ec4899',
    'California (LA)': '#d97706',
    'California (SF)': '#f59e0b',
    'California': '#d97706',
    'Washington': '#fbbf24',
    'Oregon': '#f59e0b',
    'Arizona': '#d97706'
  };
  
  // Функция для обновления цены
  function updateRate(segment, delta) {
    const maxRate = 4.0;
    const minRate = 1.5;
    const currentRate = parseFloat(segment.getAttribute('data-rate'));
    let newRate = currentRate + delta;
    
    // Ограничиваем диапазон
    newRate = Math.max(minRate, Math.min(maxRate, newRate));
    newRate = Math.round(newRate * 100) / 100;
    
    // Обновляем данные
    segment.setAttribute('data-rate', newRate);
    
    const rateValueEl = segment.querySelector('.segment-rate');
    if (rateValueEl) {
      rateValueEl.textContent = `$${newRate.toFixed(2)}`;
    }
    
    // Обновляем ширину сегмента
    const segmentWidth = (newRate / maxRate) * 100;
    segment.style.width = `${segmentWidth}%`;
    
    // Анимация подтверждения
    segment.style.transform = 'scale(1.05)';
    setTimeout(() => {
      segment.style.transform = '';
    }, 150);
  }
  
  // Функция для создания сегментированной полоски
  function createSegmentedBar(regionData) {
    const maxRate = 4.0;
    const totalStates = regionData.states.length;
    
    const segmentsHTML = regionData.states.map((state, index) => {
      const color = stateColors[state.name] || '#6366f1';
      const segmentWidth = (state.rate / maxRate) * 100;
      
      return `
        <div class="state-segment" 
             data-state="${state.name}" 
             data-rate="${state.rate}" 
             data-loads="${state.loads}"
             style="width: ${segmentWidth}%; background: linear-gradient(135deg, ${color}, ${color}dd); position: relative; transition: all 0.3s ease; opacity: 0; animation: fadeIn 0.4s ease-out ${0.1 * index}s forwards; min-width: 120px;">
          
          <div class="segment-content" style="padding: 16px 12px; height: 100%; display: flex; flex-direction: column; justify-content: center; position: relative;">
            
            <!-- Название штата -->
            <div class="segment-name" style="font-size: 15px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 8px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
              ${state.name}
            </div>
            
            <!-- Ставка (крупно) -->
            <div class="segment-rate" style="font-size: 28px; font-weight: 900; color: #ffffff; margin: 8px 0; text-shadow: 0 2px 8px rgba(0,0,0,0.5);">
              $${state.rate}
            </div>
            
            <!-- Количество грузов -->
            <div class="segment-loads" style="font-size: 13px; color: rgba(255,255,255,0.9); display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 16px;">📦</span>
              <span style="font-weight: 600;">${state.loads} грузов</span>
            </div>
          </div>
          
          <!-- Индикатор при наведении -->
          <div class="segment-hover-indicator" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(255,255,255,0.1); opacity: 0; transition: opacity 0.2s; pointer-events: none;"></div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="segmented-bar-container" style="margin-top: 20px; background: rgba(0,0,0,0.4); border-radius: 16px; padding: 8px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 4px 16px rgba(0,0,0,0.3);">
        <div class="segmented-bar" style="display: flex; min-height: 180px; border-radius: 12px; overflow: hidden; box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);">
          ${segmentsHTML}
        </div>
      </div>
    `;
  }
  
  // Добавляем обработчики кликов для всех баров регионов
  const rateBarContainers = document.querySelectorAll('.rate-bar-container');
  
  console.log('Found rate-bar-containers:', rateBarContainers.length);
  console.log('window.detailedRates:', window.detailedRates);
  
  rateBarContainers.forEach((container) => {
    const bar = container.querySelector('.rate-bar');
    if (!bar) return;
    
    const regionName = bar.querySelector('.region-name')?.textContent;
    if (!regionName) return;
    
    console.log('Setting up click handler for region:', regionName);
    
    // Определяем тип оборудования
    const section = bar.closest('.rates-section');
    const sectionTitle = section?.querySelector('h3')?.textContent.toLowerCase();
    
    let equipmentType = 'dryvan';
    if (sectionTitle?.includes('reefer')) equipmentType = 'reefer';
    if (sectionTitle?.includes('flatbed')) equipmentType = 'flatbed';
    
    // Получаем данные региона из глобального объекта
    const regionData = window.detailedRates?.[equipmentType]?.[regionName];
    if (!regionData) return;
    
    // Добавляем индикатор кликабельности
    bar.style.cursor = 'pointer';
    bar.setAttribute('title', 'Нажмите чтобы увидеть детали по штатам');
    bar.setAttribute('data-rate', regionData.rate);
    
    // Обработчик клика
    bar.addEventListener('click', function(e) {
      console.log('Bar clicked! Region:', regionName, 'Data:', regionData);
      e.stopPropagation();
      
      // Закрываем все другие раскрытые регионы в этой секции
      const chart = container.closest('.rates-chart');
      chart.querySelectorAll('.rate-bar-container').forEach(otherContainer => {
        if (otherContainer !== container) {
          otherContainer.classList.remove('expanded');
          const existingSegments = otherContainer.querySelector('.segmented-bar-container');
          if (existingSegments) {
            existingSegments.style.opacity = '0';
            setTimeout(() => existingSegments.remove(), 300);
          }
        }
      });
      
      // Переключаем текущий регион
      if (container.classList.contains('expanded')) {
        // Закрываем
        container.classList.remove('expanded');
        const existingSegments = container.querySelector('.segmented-bar-container');
        if (existingSegments) {
          existingSegments.style.opacity = '0';
          setTimeout(() => existingSegments.remove(), 300);
        }
        bar.style.borderColor = 'rgba(255, 255, 255, 0.05)';
      } else {
        // Открываем
        container.classList.add('expanded');
        bar.style.borderColor = 'rgba(99, 102, 241, 0.4)';
        
        const segmentedHTML = createSegmentedBar(regionData);
        container.insertAdjacentHTML('beforeend', segmentedHTML);
        
        // Добавляем обработчики для сегментов
        setTimeout(() => {
          const segments = container.querySelectorAll('.state-segment');
          segments.forEach(segment => {
            // Hover эффект
            segment.addEventListener('mouseenter', () => {
              const hoverIndicator = segment.querySelector('.segment-hover-indicator');
              if (hoverIndicator) hoverIndicator.style.opacity = '1';
              segment.style.filter = 'brightness(1.15)';
              segment.style.transform = 'translateY(-2px)';
              segment.style.zIndex = '5';
            });
            
            segment.addEventListener('mouseleave', () => {
              const hoverIndicator = segment.querySelector('.segment-hover-indicator');
              if (hoverIndicator) hoverIndicator.style.opacity = '0';
              segment.style.filter = '';
              segment.style.transform = '';
              segment.style.zIndex = '';
            });
          });
        }, 100);
      }
    });
  });
});
