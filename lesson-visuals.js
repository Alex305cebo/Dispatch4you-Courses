// ===== LESSON VISUALS =====
// Схемы и инфографика уроков: раскрытие при прокрутке + подсветка шагов под озвучку.
//
// Принцип — прогрессивное улучшение. В разметке блок нарисован в готовом виде: полосы
// имеют ширину var(--w), в счётчиках стоят настоящие числа. Без JS урок читается целиком.
// Скрипт сначала «взводит» блок (класс lv-armed: полосы в ноль, счётчики в ноль), потом
// проигрывает их при появлении в кадре. Синхрон с аудио только подсвечивает шаги и ничего
// не прячет: секцию можно читать глазами, не включая звук.
(function () {
    'use strict';

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var blocks = [];        // { el, audioId, steps: [{ el, cue }] }
    var byAudio = {};       // audioId -> block
    var syncedBlock = null; // блок, который сейчас идёт под озвучку

    // ---------- счётчики ----------

    function fmtNum(v, decimals, sep) {
        var s = decimals > 0 ? v.toFixed(decimals) : String(Math.round(v));
        if (!sep) return s;
        var parts = s.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
        return parts.join('.');
    }

    function runCounter(el) {
        if (el._lvDone) return;
        el._lvDone = true;

        var target = parseFloat(el.getAttribute('data-count-to'));
        if (!isFinite(target)) return;

        var decimals = parseInt(el.getAttribute('data-count-decimals'), 10) || 0;
        var sep = el.getAttribute('data-count-sep');
        if (sep === null) sep = ',';
        var prefix = el.getAttribute('data-count-prefix') || '';
        var suffix = el.getAttribute('data-count-suffix') || '';
        var dur = parseInt(el.getAttribute('data-count-duration'), 10) || 1100;

        if (reduced) {
            el.textContent = prefix + fmtNum(target, decimals, sep) + suffix;
            return;
        }

        // rAF, а не setInterval: счётчик не отстаёт от кадра и не копит дрейф.
        var start = null;
        function step(ts) {
            if (start === null) start = ts;
            var p = Math.min(1, (ts - start) / dur);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = prefix + fmtNum(target * eased, decimals, sep) + suffix;
            if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
    }

    function armCounters(root) {
        var els = root.querySelectorAll('[data-count-to]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var decimals = parseInt(el.getAttribute('data-count-decimals'), 10) || 0;
            var prefix = el.getAttribute('data-count-prefix') || '';
            var suffix = el.getAttribute('data-count-suffix') || '';
            if (!reduced) el.textContent = prefix + fmtNum(0, decimals, '') + suffix;
        }
    }

    function playCounters(root) {
        var els = root.querySelectorAll('[data-count-to]');
        for (var i = 0; i < els.length; i++) runCounter(els[i]);
    }

    // ---------- раскрытие при прокрутке ----------

    function reveal(block) {
        if (block.el.classList.contains('lv-in')) return;
        block.el.classList.add('lv-in');
        playCounters(block.el);
    }

    function initObserver() {
        if (!('IntersectionObserver' in window)) {
            // Старый браузер — показываем всё сразу, без затей.
            for (var i = 0; i < blocks.length; i++) reveal(blocks[i]);
            return;
        }
        var io = new IntersectionObserver(function (entries) {
            for (var i = 0; i < entries.length; i++) {
                if (!entries[i].isIntersecting) continue;
                var block = entries[i].target._lvBlock;
                if (block) reveal(block);
                io.unobserve(entries[i].target);
            }
        }, { rootMargin: '0px 0px -12% 0px', threshold: 0.15 });

        for (var j = 0; j < blocks.length; j++) io.observe(blocks[j].el);
    }

    // ---------- синхрон с озвучкой ----------

    function clearSync(block) {
        if (!block) return;
        block.el.classList.remove('lv-sync');
        for (var i = 0; i < block.steps.length; i++) {
            block.steps[i].el.classList.remove('is-active', 'is-passed');
        }
    }

    function applyProgress(block, p) {
        // Активен последний шаг, чью веху прогресс уже прошёл; предыдущие — «пройденные».
        var activeIdx = -1;
        for (var i = 0; i < block.steps.length; i++) {
            if (p >= block.steps[i].cue) activeIdx = i; else break;
        }
        for (var j = 0; j < block.steps.length; j++) {
            var el = block.steps[j].el;
            el.classList.toggle('is-active', j === activeIdx);
            el.classList.toggle('is-passed', j < activeIdx);
        }
    }

    function onProgress(e) {
        var d = e.detail || {};
        var block = byAudio[d.id];
        if (!block) return;

        // p === 0 приходит и на старте, и на стопе/сбросе — выходим из режима синхрона,
        // блок возвращается к обычному читаемому виду.
        if (!(d.p > 0)) {
            if (syncedBlock === block) syncedBlock = null;
            clearSync(block);
            return;
        }

        if (syncedBlock !== block) {
            clearSync(syncedBlock);
            syncedBlock = block;
            block.el.classList.add('lv-sync');
            reveal(block); // догнать, если до блока ещё не долистали
        }
        applyProgress(block, d.p);
    }

    // ---------- раскрывашки ----------

    // Каждая строка блока — кнопка: нажатие раскрывает пояснение под ней.
    // Соседи в том же блоке закрываются, чтобы схема не разъезжалась на пол-экрана.
    // Панель ищем по aria-controls: кнопка и пояснение могут лежать в разных
    // местах разметки (строка таблицы, карточка, сегмент полосы).
    function panelFor(btn) {
        var id = btn.getAttribute('aria-controls');
        if (id) {
            var byId = document.getElementById(id);
            if (byId) return byId;
        }
        return btn.parentNode ? btn.parentNode.querySelector('.lv-explain') : null;
    }

    function initToggles(block) {
        var btns = block.el.querySelectorAll('[aria-expanded]');

        function closeAll() {
            for (var j = 0; j < btns.length; j++) {
                btns[j].setAttribute('aria-expanded', 'false');
                var p = panelFor(btns[j]);
                if (p) p.classList.remove('is-open');
            }
        }

        for (var i = 0; i < btns.length; i++) {
            btns[i].addEventListener('click', function () {
                var wasOpen = this.getAttribute('aria-expanded') === 'true';
                closeAll();
                if (wasOpen) return;
                this.setAttribute('aria-expanded', 'true');
                var mine = panelFor(this);
                if (mine) mine.classList.add('is-open');
            });
        }
    }

    // ---------- сборка ----------

    function collect() {
        var els = document.querySelectorAll('[data-visual-for]');
        for (var i = 0; i < els.length; i++) {
            var el = els[i];
            var steps = [];
            var stepEls = el.querySelectorAll('[data-cue]');
            for (var j = 0; j < stepEls.length; j++) {
                var cue = parseFloat(stepEls[j].getAttribute('data-cue'));
                if (!isFinite(cue)) continue;
                steps.push({ el: stepEls[j], cue: cue });
            }
            steps.sort(function (a, b) { return a.cue - b.cue; });

            var block = { el: el, audioId: el.getAttribute('data-visual-for'), steps: steps };
            el._lvBlock = block;
            blocks.push(block);

            // Один audio-id может обслуживать несколько блоков — берём первый, остальные
            // всё равно раскроются по прокрутке.
            if (block.audioId && !byAudio[block.audioId]) byAudio[block.audioId] = block;

            el.classList.add('lv-armed');
            armCounters(el);
            initToggles(block);
        }
    }

    function init() {
        collect();
        if (!blocks.length) return;
        initObserver();
        document.addEventListener('la:progress', onProgress);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
