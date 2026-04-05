// ===== LESSON AUDIO PLAYER =====
(function() {
    var CIRC = 2 * Math.PI * 32;
    var curAudio = null;
    var curBtn = null;
    var curBox = null;
    var timer = null;
    var allAudioIds = [];
    var curAudioIndex = 0;

    // Sticky fixed bar
    var fixedBar = null;
    var fixedSlot = null;
    var allWraps = [];
    var ticking = false;

    function fmt(s) {
        var m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    function ring(id, t, d) {
        var au = document.getElementById(id);
        if (!au || !au._box) return;
        var box = au._box;
        var fill = box.querySelector('.la-ring-fill');
        var tm = box.querySelector('.la-time');
        var mb = box.querySelector('.la-mobile-fill');
        var p = d > 0 ? t / d : 0;
        if (fill) fill.style.strokeDashoffset = CIRC - p * CIRC;
        if (mb) mb.style.width = (p * 100) + '%';
        if (tm) tm.textContent = fmt(t) + ' / ' + fmt(d);
    }

    function stopAll() {
        if (curAudio) {
            curAudio._simPlaying = false;
            curAudio.pause();
            curAudio.currentTime = 0;
        }
        if (curBtn) curBtn.classList.remove('playing');
        if (curBox) curBox.classList.remove('playing');
        if (timer) clearInterval(timer);
        curAudio = null; curBtn = null; curBox = null; timer = null;
    }

    function startProgress(au, id) {
        if (timer) clearInterval(timer);
        timer = setInterval(function() {
            var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur || 300);
            if (!au.paused && au.currentTime < d) ring(id, au.currentTime, d);
        }, 200);
    }

    window.laToggle = function(btn, id) {
        var au = document.getElementById(id);
        if (!au) return;
        var box = btn.closest('.la-container');
        au._box = box;

        // Если это тот же трек — toggle пауза/play
        if (curAudio === au) {
            if (!au.paused || au._simPlaying) {
                // Пауза
                if (au._simPlaying) {
                    // Симуляция — останавливаем таймер
                    au._simPlaying = false;
                    if (timer) clearInterval(timer); timer = null;
                } else {
                    au.pause();
                    if (timer) clearInterval(timer); timer = null;
                }
                btn.classList.remove('playing');
                box.classList.remove('playing');
            } else {
                // Продолжить
                btn.classList.add('playing');
                box.classList.add('playing');
                var p2 = au.play();
                if (p2 !== undefined) {
                    p2.then(function() { startProgress(au, id); }).catch(function(){});
                } else { startProgress(au, id); }
            }
            return;
        }

        // Другой трек — стоп предыдущий
        if (curAudio) {
            curAudio._simPlaying = false;
            var pid = curAudio.id, pd = curAudio._dur || 300;
            stopAll(); ring(pid, 0, pd);
        }

        if (au.readyState < 2) au.load();
        btn.classList.add('playing');
        box.classList.add('playing');
        curAudio = au; curBtn = btn; curBox = box;
        curAudioIndex = allAudioIds.indexOf(id);
        updateCounter();

        au.onended = function() { var d = au._dur || 300; au._simPlaying = false; stopAll(); ring(id, 0, d); };
        au.onerror = function() { simulatePlayback(au, id, btn, box); };
        var p = au.play();
        if (p !== undefined) {
            p.then(function() { startProgress(au, id); })
             .catch(function() { simulatePlayback(au, id, btn, box); });
        } else { startProgress(au, id); }
    };

    function simulatePlayback(au, id, btn, box) {
        var dur = au._dur || 300, st = 0;
        btn.classList.add('playing'); box.classList.add('playing');
        curAudio = au; curBtn = btn; curBox = box;
        au._simPlaying = true;
        if (timer) clearInterval(timer);
        timer = setInterval(function() {
            if (!au._simPlaying) return;
            if (st < dur) { st += 0.2; ring(id, st, dur); }
            else { au._simPlaying = false; stopAll(); ring(id, 0, dur); }
        }, 200);
    }

    window.laSeek = function(e, id) {
        var r = e.currentTarget.getBoundingClientRect();
        var a = Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2));
        var p = (a + Math.PI/2)/(2*Math.PI); if (p<0) p+=1;
        var au = document.getElementById(id);
        if (!au || au.paused) return;
        var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur||300);
        au.currentTime = p*d; ring(id, au.currentTime, d);
    };

    window.laSeekMobile = function(e, id) {
        var r = e.currentTarget.getBoundingClientRect();
        var p = (e.clientX-r.left)/r.width;
        var au = document.getElementById(id);
        if (!au || au.paused) return;
        var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur||300);
        au.currentTime = p*d; ring(id, au.currentTime, d);
    };

    // ── Стрелки ──────────────────────────────────────────────────
    window.laPrev = function() {
        jumpTo(curAudioIndex > 0 ? curAudioIndex-1 : allAudioIds.length-1);
    };
    window.laNext = function() {
        jumpTo(curAudioIndex < allAudioIds.length-1 ? curAudioIndex+1 : 0);
    };

    function jumpTo(idx) {
        var id = allAudioIds[idx];
        if (!id) return;
        var wasPlaying = curAudio && (!curAudio.paused || curAudio._simPlaying);
        if (curAudio) { curAudio._simPlaying = false; var pid=curAudio.id, pd=curAudio._dur||300; stopAll(); ring(pid,0,pd); }
        curAudioIndex = idx;
        updateCounter();

        // Скролл к секции — берём wrap по индексу, не через closest
        var wrap = allWraps[idx];
        if (wrap) {
            var top = wrap.getBoundingClientRect().top + window.pageYOffset - 90;
            window.scrollTo({ top: top, behavior: 'smooth' });
        }

        if (wasPlaying) {
            setTimeout(function() {
                var au = document.getElementById(id);
                if (!au) return;
                var btn = au._box ? au._box.querySelector('.la-btn') : null;
                if (!btn) btn = document.querySelector('[onclick*="laToggle"][onclick*="'+id+'"]');
                if (btn) laToggle(btn, id);
            }, 400);
        }
    }

    // ── Fixed bar: показываем когда wrap уходит за navbar ────────
    function buildFixedBar() {
        var bar = document.createElement('div');
        bar.id = 'la-fixed-bar';
        bar.className = 'la-fixed-bar';
        bar.innerHTML =
            '<button class="la-arrow la-arrow-prev" onclick="laPrev()" aria-label="Предыдущий">&#8249;</button>' +
            '<div id="la-fixed-slot" class="la-fixed-slot"></div>' +
            '<button class="la-arrow la-arrow-next" onclick="laNext()" aria-label="Следующий">&#8250;</button>';
        document.body.appendChild(bar);
        fixedBar = bar;
        fixedSlot = bar.querySelector('#la-fixed-slot');
    }

    function updateCounter() {
        var allContainers = document.querySelectorAll('.la-container');
        for (var i = 0; i < allContainers.length; i++) {
            var c = allContainers[i].querySelector('.la-counter');
            if (c) c.textContent = (curAudioIndex + 1) + ' / ' + allAudioIds.length;
        }
        // Обновляем видимость стрелок
        if (fixedBar) {
            var prev = fixedBar.querySelector('.la-arrow-prev');
            var next = fixedBar.querySelector('.la-arrow-next');
            var total = allAudioIds.length;
            if (prev) prev.classList.toggle('hidden', total <= 1 || curAudioIndex <= 0);
            if (next) next.classList.toggle('hidden', total <= 1 || curAudioIndex >= total - 1);
        }
    }

    // Найти wrap чья верхняя граница только что ушла за navbar (top < navH)
    // и чья нижняя граница ещё в viewport (bottom > navH)
    function getStuckWrapIdx() {
        var navH = 64 + 8; // navbar height + небольшой отступ
        for (var i = 0; i < allWraps.length; i++) {
            var r = allWraps[i].getBoundingClientRect();
            if (r.top < navH && r.bottom > navH) return i;
        }
        // Если все ушли вверх — берём последний
        var last = -1;
        for (var j = 0; j < allWraps.length; j++) {
            if (allWraps[j].getBoundingClientRect().bottom < navH) last = j;
        }
        return last;
    }

    var currentlyInFixed = null; // .la-container сейчас в fixed bar
    var originalParent = null;   // его оригинальный родитель
    var placeholder = null;      // заглушка на его месте

    function putInFixed(wrap) {
        var container = wrap.querySelector('.la-container');
        if (!container || container === currentlyInFixed) return;
        returnFromFixed();

        // Создаём placeholder
        var ph = document.createElement('div');
        ph.style.cssText = 'width:' + container.offsetWidth + 'px;height:' + container.offsetHeight + 'px;flex-shrink:0;display:inline-block;';
        container.parentNode.insertBefore(ph, container);
        placeholder = ph;
        originalParent = container.parentNode;
        currentlyInFixed = container;

        fixedSlot.appendChild(container);
        fixedBar.classList.add('visible');
        // Синхронизируем счётчик с текущей секцией
        var wrapIdx = allWraps.indexOf(wrap);
        if (wrapIdx >= 0) { curAudioIndex = wrapIdx; updateCounter(); }
    }

    function returnFromFixed() {
        if (!currentlyInFixed || !originalParent || !placeholder) return;
        originalParent.insertBefore(currentlyInFixed, placeholder);
        placeholder.parentNode.removeChild(placeholder);
        placeholder = null;
        originalParent = null;
        currentlyInFixed = null;
        fixedBar.classList.remove('visible');
    }

    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
            ticking = false;
            var idx = getStuckWrapIdx();
            if (idx < 0) {
                returnFromFixed();
                return;
            }
            var wrap = allWraps[idx];
            var container = wrap.querySelector('.la-container');
            if (container && container !== currentlyInFixed) {
                putInFixed(wrap);
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function() {
        var els = document.querySelectorAll('audio[data-duration]');
        for (var i = 0; i < els.length; i++) {
            var au = els[i];
            au._dur = parseInt(au.getAttribute('data-duration')) || 300;
            au.preload = 'metadata';
            var btn = document.querySelector('[onclick*="' + au.id + '"]');
            if (btn) au._box = btn.closest('.la-container');
            ring(au.id, 0, au._dur);
            allAudioIds.push(au.id);
        }

        allWraps = Array.prototype.slice.call(document.querySelectorAll('.section-audio-wrap'));

        // Добавляем счётчик в каждый .la-container рядом с .la-time
        var total = allAudioIds.length;
        for (var j = 0; j < allWraps.length; j++) {
            var cnt = document.createElement('span');
            cnt.className = 'la-counter';
            cnt.textContent = (j + 1) + ' / ' + total;
            var container = allWraps[j].querySelector('.la-container');
            if (container) container.appendChild(cnt);
        }

        if (allWraps.length > 0) {
            buildFixedBar();
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    });
})();
