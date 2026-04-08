# Паттерн: 2-колоночный layout для документов

## Когда использовать
На любой странице где упоминается документ грузоперевозки:
Rate Con, BOL, POD, Invoice, Carrier Packet, Lumper Receipt, Scale Ticket, Detention Receipt, Damage Report (OS&D), TONU Letter — и любой другой документ.

## Образец: `pages/docs.html` → раздел `#doc-ratecon`

### Структура layout

```html
<!-- 2 КОЛОНКИ: ИНФОРМАЦИЯ + ДОКУМЕНТ -->
<div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:12px;">

    <!-- ЛЕВАЯ КОЛОНКА: кликабельный чеклист с tooltip-подсказками -->
    <div>
        <h4 style="font-size:16px;font-weight:700;color:var(--text-primary);margin:0 0 10px 0;">📋 Что проверять</h4>

        <!-- Каждый пункт — rc-field с data-section и data-tooltip -->
        <div class="rc-field"
             data-section="Название секции"
             data-tooltip="Заголовок секции.<br><br>Подробное объяснение что это и почему важно."
             style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:8px 10px;margin-bottom:6px;cursor:pointer;transition:all 0.2s ease;position:relative;">
            <p style="font-size:12px;font-weight:600;color:#06b6d4;margin:0 0 2px 0;">✓ Название пункта</p>
            <p style="font-size:11px;color:#e2e8f0;margin:0;line-height:1.4;">Краткое описание что проверять.</p>
        </div>

        <!-- Подсказка внизу -->
        <div style="background:linear-gradient(135deg,rgba(6,182,212,0.15),rgba(14,165,233,0.1));border:2px solid rgba(6,182,212,0.3);border-radius:8px;padding:8px 10px;margin-top:10px;">
            <p style="font-size:11px;font-weight:600;color:var(--primary);margin:0 0 2px 0;">💡 Нажми на любой пункт →</p>
            <p style="font-size:10px;color:#e2e8f0;margin:0;line-height:1.4;">или на поле в документе справа</p>
        </div>
    </div>

    <!-- ПРАВАЯ КОЛОНКА: интерактивный документ -->
    <div>
        <div style="background:rgba(255,255,255,0.05);border:2px solid rgba(6,182,212,0.2);border-radius:10px;padding:0;overflow-y:auto;max-height:600px;">
            <div style="padding:16px;background:#fff;font-family:Arial,Helvetica,sans-serif;color:#000;width:100%;">

                <!-- Поля документа — тоже rc-field с tooltip -->
                <div class="rc-field"
                     data-section="НАЗВАНИЕ ПОЛЯ"
                     data-tooltip="Объяснение поля документа."
                     style="border:1px solid #000;padding:12px;background:#fff;cursor:pointer;transition:all 0.2s ease;position:relative;">
                    <span style="position:absolute;top:8px;right:8px;font-size:11px;color:#06b6d4;opacity:0.6;">ⓘ</span>
                    <!-- содержимое поля -->
                </div>

            </div>
        </div>
    </div>
</div>
```

## Правила

### Цвета текста внутри документа (белый фон)
- Все `<p>` и `<strong>` внутри документа: `color:#000 !important`
- Лейблы с чёрным фоном (PICKUP, DELIVERY): добавить класс `rc-badge` → CSS даёт `color:#fff !important`

### Tooltip система
- Все `.rc-field` на странице автоматически подхватываются скриптом из `docs.html`
- Desktop: hover показывает tooltip возле курсора, клик фиксирует
- Mobile: клик открывает tooltip по центру экрана, любое следующее нажатие или скролл закрывает

### Адаптив
- На мобильных (`max-width:768px`): `grid-template-columns:1fr` — чеклист сверху, документ снизу

### Навигация между документами (если несколько)
Стиль кнопок ← →:
```css
padding: 16px 22px;
background: linear-gradient(135deg, rgba(6,182,212,0.12), rgba(14,165,233,0.08));
border: 1px solid rgba(6,182,212,0.25);
border-radius: 16px;
color: #e2e8f0;
font-size: 15px;
font-weight: 700;
```
Точки-индикаторы: активная — синяя таблетка 28×10px, остальные — серые круги 10×10px.
Навигация **циклическая** — последний → первый и наоборот.

## CSS который должен быть на странице
```css
#rate-con-interactive strong { color: #000 !important; }
#rate-con-interactive td { color: #000 !important; }
#rate-con-interactive p { color: #000 !important; }
#rate-con-interactive p.rc-badge { color: #fff !important; background: #000; }
.rc-field:hover { box-shadow: 0 2px 8px rgba(6,182,212,0.15) !important; border-color: #06b6d4 !important; }
```
