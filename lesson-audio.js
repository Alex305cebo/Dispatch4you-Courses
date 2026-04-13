// ===== LESSON AUDIO PLAYER =====
(function() {
    var curAudio = null;
    var curBtn = null;
    var curBox = null;
    var timer = null;
    var allAudioIds = [];
    var curAudioIndex = 0;

    var fixedBar = null;      // десктоп sidebar
    var mobileBar = null;     // мобильный bottom bar
    var fixedSlot = null;
    var allWraps = [];
    var ticking = false;

    function fmt(s) {
        var m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    // Обновить прогресс
    function updateProgress(id, t, d) {
        var au = document.getElementById(id);
        if (!au || !au._box) return;
        var box = au._box;
        var tm = box.querySelector('.la-time');
        var mb = box.querySelector('.la-mobile-fill');
        var p = d > 0 ? t / d : 0;
        if (mb) mb.style.width = (p * 100) + '%';
        if (tm) tm.textContent = fmt(t) + ' / ' + fmt(d);
        // Обновить fixed bars
        updateFixedProgress(p, t, d);
    }

    // Обновить прогресс в fixed-барах
    function updateFixedProgress(p, t, d) {
        // Десктоп
        if (fixedBar) {
            var fp = fixedBar.querySelector('.la-fixed-progress-fill');
            var ft = fixedBar.querySelector('.la-fixed-time');
            if (fp) fp.style.width = (p * 100) + '%';
            if (ft) ft.textContent = fmt(t) + ' / ' + fmt(d);
        }
        // Мобильный
        if (mobileBar) {
            var mp = mobileBar.querySelector('.la-mob-progress-fill');
            var mt = mobileBar.querySelector('.la-mob-time');
            if (mp) mp.style.width = (p * 100) + '%';
            if (mt) mt.textContent = fmt(t) + ' / ' + fmt(d);
        }
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
        // Сбросить кнопку в мобильном баре
        if (mobileBar) {
            var mp = mobileBar.querySelector('.la-mob-play');
            if (mp) mp.classList.remove('playing');
        }
        // Убрать класс playing с fixedBar
        if (fixedBar) {
            fixedBar.classList.remove('playing');
        }
    }

    function startProgress(au, id) {
        if (timer) clearInterval(timer);
        timer = setInterval(function() {
            var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur || 300);
            if (!au.paused && au.currentTime < d) updateProgress(id, au.currentTime, d);
        }, 200);
    }

    // Обновить заголовок трека в fixed-барах
    function updateFixedTitle(idx) {
        var wrap = allWraps[idx];
        var title = '';
        if (wrap) {
            var h2 = wrap.querySelector('h2');
            if (h2) title = h2.textContent.trim();
        }
        if (!title) title = 'Аудио ' + (idx + 1);

        if (fixedBar) {
            var ft = fixedBar.querySelector('.la-fixed-title');
            if (ft) ft.textContent = title;
        }
        if (mobileBar) {
            var mt = mobileBar.querySelector('.la-mob-title');
            if (mt) mt.textContent = title;
        }
    }

    window.laToggle = function(btn, id) {
        var au = document.getElementById(id);
        if (!au) return;
        var box = btn.closest('.la-container');
        au._box = box;

        if (curAudio === au) {
            if (!au.paused || au._simPlaying) {
                // Пауза
                if (au._simPlaying) {
                    au._simPlaying = false;
                    if (timer) clearInterval(timer); timer = null;
                } else {
                    au.pause();
                    if (timer) clearInterval(timer); timer = null;
                }
                btn.classList.remove('playing');
                box.classList.remove('playing');
                syncMobPlayBtn(false);
            } else {
                // Продолжить
                btn.classList.add('playing');
                box.classList.add('playing');
                syncMobPlayBtn(true);
                var p2 = au.play();
                if (p2 !== undefined) {
                    p2.then(function() { startProgress(au, id); }).catch(function(){});
                } else { startProgress(au, id); }
            }
            return;
        }

        // Другой трек
        if (curAudio) {
            curAudio._simPlaying = false;
            var pid = curAudio.id, pd = curAudio._dur || 300;
            stopAll(); updateProgress(pid, 0, pd);
        }

        if (au.readyState < 2) au.load();
        btn.classList.add('playing');
        box.classList.add('playing');
        curAudio = au; curBtn = btn; curBox = box;
        curAudioIndex = allAudioIds.indexOf(id);
        updateCounter();
        updateFixedTitle(curAudioIndex);
        syncMobPlayBtn(true);

        au.onended = function() {
            var d = au._dur || 300;
            au._simPlaying = false;
            var nextIdx = curAudioIndex + 1;
            stopAll(); updateProgress(id, 0, d);
            updateFixedProgress(0, 0, d);
            // Автопереключение на следующий трек
            if (nextIdx < allAudioIds.length) {
                setTimeout(function() {
                    var nextId = allAudioIds[nextIdx];
                    if (!nextId) return;
                    var nextAu = document.getElementById(nextId);
                    if (!nextAu) return;
                    curAudioIndex = nextIdx;
                    updateCounter();
                    updateFixedTitle(nextIdx);
                    var nextWrap = allWraps[nextIdx];
                    if (nextWrap) {
                        var top = nextWrap.getBoundingClientRect().top + window.pageYOffset - 90;
                        window.scrollTo({ top: top, behavior: 'smooth' });
                    }
                    var nextBtn = document.querySelector('[onclick*="laToggle"][onclick*="' + nextId + '"]');
                    if (nextBtn) laToggle(nextBtn, nextId);
                }, 800);
            }
        };
        au.onerror = function() { simulatePlayback(au, id, btn, box); };
        var p = au.play();
        if (p !== undefined) {
            p.then(function() { startProgress(au, id); })
             .catch(function() { simulatePlayback(au, id, btn, box); });
        } else { startProgress(au, id); }
    };

    // Синхронизировать кнопку play в мобильном баре
    function syncMobPlayBtn(playing) {
        if (!mobileBar) return;
        var mp = mobileBar.querySelector('.la-mob-play');
        if (mp) mp.classList.toggle('playing', playing);
        
        // Также синхронизировать фиксированную кнопку
        syncFixedButton();
        
        // Обновить класс playing на fixedBar для индикации воспроизведения
        if (fixedBar) {
            fixedBar.classList.toggle('playing', playing);
        }
    }

    // Клик по кнопке play в мобильном/десктоп баре
    window.laBarToggle = function() {
        if (!curAudio) {
            // Запустить первый трек
            var id = allAudioIds[0];
            if (!id) return;
            var au = document.getElementById(id);
            if (!au) return;
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) laToggle(btn, id);
            return;
        }
        // Toggle текущего
        if (!curAudio.paused || curAudio._simPlaying) {
            if (curAudio._simPlaying) {
                curAudio._simPlaying = false;
                if (timer) clearInterval(timer); timer = null;
            } else {
                curAudio.pause();
                if (timer) clearInterval(timer); timer = null;
            }
            if (curBtn) curBtn.classList.remove('playing');
            if (curBox) curBox.classList.remove('playing');
            syncMobPlayBtn(false);
        } else {
            if (curBtn) curBtn.classList.add('playing');
            if (curBox) curBox.classList.add('playing');
            syncMobPlayBtn(true);
            var p = curAudio.play();
            if (p !== undefined) {
                p.then(function() { startProgress(curAudio, curAudio.id); }).catch(function(){});
            } else { startProgress(curAudio, curAudio.id); }
        }
    };

    function simulatePlayback(au, id, btn, box) {
        var dur = au._dur || 300, st = 0;
        btn.classList.add('playing'); box.classList.add('playing');
        curAudio = au; curBtn = btn; curBox = box;
        au._simPlaying = true;
        syncMobPlayBtn(true);
        if (timer) clearInterval(timer);
        timer = setInterval(function() {
            if (!au._simPlaying) return;
            if (st < dur) { st += 0.2; updateProgress(id, st, dur); }
            else { au._simPlaying = false; stopAll(); updateProgress(id, 0, dur); }
        }, 200);
    }

    window.laSeek = function(e, id) {
        e.stopPropagation(); // Предотвращаем всплытие события
        var r = e.currentTarget.getBoundingClientRect();
        var a = Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2));
        var p = (a + Math.PI/2)/(2*Math.PI); if (p<0) p+=1;
        var au = document.getElementById(id);
        if (!au) return;
        var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur||300);
        
        // Устанавливаем позицию
        au.currentTime = p*d;
        
        // Если аудио на паузе, запускаем его
        if (au.paused && !au._simPlaying) {
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) laToggle(btn, id);
        } else {
            updateProgress(id, au.currentTime, d);
        }
    };

    window.laSeekMobile = function(e, id) {
        e.stopPropagation(); // Предотвращаем всплытие события
        var r = e.currentTarget.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        var au = document.getElementById(id);
        if (!au) return;
        var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur||300);
        
        var wasPaused = au.paused && !au._simPlaying;
        
        // Устанавливаем позицию
        au.currentTime = p*d;
        updateProgress(id, au.currentTime, d);
        
        // Если аудио было на паузе, запускаем его
        if (wasPaused) {
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) {
                // Запускаем без сброса позиции
                btn.classList.add('playing');
                var box = btn.closest('.la-container');
                if (box) box.classList.add('playing');
                curAudio = au; 
                curBtn = btn; 
                curBox = box;
                curAudioIndex = allAudioIds.indexOf(id);
                updateCounter();
                updateFixedTitle(curAudioIndex);
                syncMobPlayBtn(true);
                
                var p = au.play();
                if (p !== undefined) {
                    p.then(function() { startProgress(au, id); }).catch(function(){});
                } else { 
                    startProgress(au, id); 
                }
            }
        }
    };

    // Перемотка по прогресс-бару в fixed-барах
    window.laSeekBar = function(e) {
        if (e.stopPropagation) e.stopPropagation();
        var r = e.currentTarget.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        
        if (!curAudio) {
            // Если нет активного аудио, запускаем первый трек с нужной позиции
            var id = allAudioIds[0];
            if (!id) return;
            var au = document.getElementById(id);
            if (!au) return;
            var d = au._dur || 300;
            var targetTime = p * d;
            
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) {
                var box = btn.closest('.la-container');
                au._box = box;
                btn.classList.add('playing');
                if (box) box.classList.add('playing');
                curAudio = au; 
                curBtn = btn; 
                curBox = box;
                curAudioIndex = 0;
                updateCounter();
                updateFixedTitle(0);
                syncMobPlayBtn(true);
                
                // Загружаем аудио если нужно
                if (au.readyState < 2) au.load();
                
                // Ждем загрузки метаданных
                var trySeek = function() {
                    if (au.readyState >= 2) {
                        au.currentTime = targetTime;
                        var playPromise = au.play();
                        if (playPromise !== undefined) {
                            playPromise.then(function() { startProgress(au, id); }).catch(function(){ simulatePlayback(au, id, btn, box); });
                        } else { 
                            startProgress(au, id); 
                        }
                    } else {
                        au.addEventListener('loadedmetadata', function() {
                            au.currentTime = targetTime;
                            var playPromise = au.play();
                            if (playPromise !== undefined) {
                                playPromise.then(function() { startProgress(au, id); }).catch(function(){ simulatePlayback(au, id, btn, box); });
                            } else { 
                                startProgress(au, id); 
                            }
                        }, { once: true });
                    }
                };
                trySeek();
            }
            return;
        }
        
        var d = curAudio.duration && isFinite(curAudio.duration) ? curAudio.duration : (curAudio._dur||300);
        var targetTime = p * d;
        var wasPlaying = !curAudio.paused || curAudio._simPlaying;
        
        // Устанавливаем позицию
        if (curAudio.readyState >= 2 && !curAudio._simPlaying) {
            curAudio.currentTime = targetTime;
            updateProgress(curAudio.id, targetTime, d);
        } else if (curAudio._simPlaying) {
            // Для симулированного аудио только обновляем визуально
            updateProgress(curAudio.id, targetTime, d);
        }
        
        // Если аудио было на паузе, запускаем воспроизведение
        // Если уже играло - НЕ вызываем play() снова!
        if (!wasPlaying) {
            if (curBtn) curBtn.classList.add('playing');
            if (curBox) curBox.classList.add('playing');
            syncMobPlayBtn(true);
            
            var playPromise = curAudio.play();
            if (playPromise !== undefined) {
                playPromise.then(function() { startProgress(curAudio, curAudio.id); }).catch(function(){});
            } else { 
                startProgress(curAudio, curAudio.id); 
            }
        }
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
        if (curAudio) { curAudio._simPlaying = false; var pid=curAudio.id, pd=curAudio._dur||300; stopAll(); updateProgress(pid,0,pd); }
        curAudioIndex = idx;
        updateCounter();
        updateFixedTitle(idx);

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

    // ── Десктоп sidebar ──────────────────────────────────────────
    function buildFixedBar() {
        var bar = document.createElement('div');
        bar.id = 'la-fixed-bar';
        bar.className = 'la-fixed-bar';
        bar.innerHTML =
            '<button class="la-fixed-toggle" onclick="laToggleFixedBar()" aria-label="Свернуть/развернуть плеер">' +
                '<span class="la-fixed-toggle-icon">▶</span>' +
            '</button>' +
            '<div class="la-fixed-title">Выберите аудио</div>' +
            '<div class="la-fixed-controls">' +
                '<button class="la-arrow la-arrow-prev" onclick="laPrev()" aria-label="Предыдущий">&#8249;</button>' +
                '<div id="la-fixed-slot" class="la-fixed-slot">' +
                    '<div class="la-container">' +
                        '<div class="la-wave"></div>' +
                        '<div class="la-wave"></div>' +
                        '<div class="la-wave"></div>' +
                        '<button class="la-btn" onclick="laBarToggle()" aria-label="Play/Pause">' +
                            '<span class="la-play">▶</span>' +
                            '<span class="la-pause">⏸</span>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
                '<button class="la-arrow la-arrow-next" onclick="laNext()" aria-label="Следующий">&#8250;</button>' +
            '</div>' +
            '<div class="la-fixed-progress">' +
                '<div class="la-fixed-progress-fill"></div>' +
            '</div>' +
            '<div class="la-fixed-time">0:00 / 0:00</div>' +
            '<div class="la-controls">' +
                '<div class="la-control-row">' +
                    '<span class="la-control-label">⚡ Speed</span>' +
                    '<div class="la-speed-buttons">' +
                        '<button class="la-speed-btn active" onclick="laSetSpeed(1)">1x</button>' +
                        '<button class="la-speed-btn" onclick="laSetSpeed(1.5)">1.5x</button>' +
                        '<button class="la-speed-btn" onclick="laSetSpeed(2)">2x</button>' +
                    '</div>' +
                '</div>' +
                '<div class="la-control-row">' +
                    '<span class="la-control-label">🔊 Vol</span>' +
                    '<span class="la-volume-icon" onclick="laToggleMute()">🔊</span>' +
                    '<input type="range" class="la-volume-slider" min="0" max="100" value="100" oninput="laSetVolume(this.value)">' +
                '</div>' +
            '</div>';
        document.body.appendChild(bar);
        fixedBar = bar;
        fixedSlot = bar.querySelector('#la-fixed-slot');
        
        // Добавляем обработчик клика на прогресс-бар
        var progressBar = bar.querySelector('.la-fixed-progress');
        if (progressBar) {
            progressBar.addEventListener('click', function(e) {
                e.stopPropagation();
                laSeekBar(e);
            }, false);
            progressBar.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.changedTouches && e.changedTouches.length > 0) {
                    var touch = e.changedTouches[0];
                    var rect = progressBar.getBoundingClientRect();
                    var fakeEvent = {
                        currentTarget: progressBar,
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    };
                    laSeekBar(fakeEvent);
                }
            }, false);
        }
    }

    // ── Мобильный bottom bar ─────────────────────────────────────
    function buildMobileBar() {
        var bar = document.createElement('div');
        bar.id = 'la-mobile-bottom-bar';
        bar.className = 'la-mobile-bottom-bar';
        bar.innerHTML =
            '<div class="la-mob-collapse-btn" onclick="laCollapseMobileBar()">' +
                '<span class="la-mob-collapse-icon">▼</span>' +
            '</div>' +
            '<div class="la-mob-progress">' +
                '<div class="la-mob-progress-fill"></div>' +
            '</div>' +
            '<div class="la-mob-row">' +
                '<div class="la-mob-icon">🎧</div>' +
                '<div class="la-mob-info">' +
                    '<div class="la-mob-title">Аудио</div>' +
                    '<div class="la-mob-time">0:00 / 0:00</div>' +
                '</div>' +
                '<div class="la-mob-controls">' +
                    '<button class="la-mob-btn-prev hidden" onclick="laPrev()" aria-label="Предыдущий">&#8249;</button>' +
                    '<button class="la-mob-play" onclick="laBarToggle()" aria-label="Play/Pause">' +
                        '<span class="la-play">▶</span>' +
                        '<span class="la-pause">⏸</span>' +
                    '</button>' +
                    '<button class="la-mob-btn-next hidden" onclick="laNext()" aria-label="Следующий">&#8250;</button>' +
                '</div>' +
            '</div>' +
            '<div class="la-mob-controls-row">' +
                '<div class="la-mob-control-group">' +
                    '<span class="la-mob-control-label">⚡ Speed</span>' +
                    '<div class="la-mob-speed-buttons">' +
                        '<button class="la-mob-speed-btn active" onclick="laSetSpeed(1)">1x</button>' +
                        '<button class="la-mob-speed-btn" onclick="laSetSpeed(1.5)">1.5x</button>' +
                        '<button class="la-mob-speed-btn" onclick="laSetSpeed(2)">2x</button>' +
                    '</div>' +
                '</div>' +
                '<div class="la-mob-control-group">' +
                    '<span class="la-mob-control-label">🔊 Vol</span>' +
                    '<div class="la-mob-volume-group">' +
                        '<span class="la-mob-volume-icon" onclick="laToggleMute()">🔊</span>' +
                        '<input type="range" class="la-mob-volume-slider" min="0" max="100" value="100" oninput="laSetVolume(this.value)">' +
                    '</div>' +
                '</div>' +
                '<button class="la-mob-scroll-top" onclick="laScrollToTop()" aria-label="Наверх">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>' +
                '</button>' +
            '</div>';
        document.body.appendChild(bar);
        mobileBar = bar;
        
        // Большая кнопка для разворачивания
        var expandBtn = document.createElement('div');
        expandBtn.className = 'la-mob-expand-btn';
        expandBtn.onclick = laExpandMobileBar;
        expandBtn.innerHTML = '<span class="la-mob-expand-icon">▲</span>';
        document.body.appendChild(expandBtn);
        
        // Обработчики для возврата активности
        bar.addEventListener('touchstart', resetInactivityTimer);
        bar.addEventListener('mouseenter', resetInactivityTimer);
        
        // Добавляем обработчик клика на мобильный прогресс-бар
        var mobProgress = bar.querySelector('.la-mob-progress');
        if (mobProgress) {
            mobProgress.addEventListener('click', function(e) {
                e.stopPropagation();
                laSeekBar(e);
            }, false);
            mobProgress.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                if (e.changedTouches && e.changedTouches.length > 0) {
                    var touch = e.changedTouches[0];
                    var rect = mobProgress.getBoundingClientRect();
                    var fakeEvent = {
                        currentTarget: mobProgress,
                        clientX: touch.clientX,
                        clientY: touch.clientY
                    };
                    laSeekBar(fakeEvent);
                }
            }, false);
        }
    }

    function updateCounter() {
        var total = allAudioIds.length;
        // Десктоп бар
        if (fixedBar) {
            var prev = fixedBar.querySelector('.la-arrow-prev');
            var next = fixedBar.querySelector('.la-arrow-next');
            if (prev) prev.classList.toggle('hidden', total <= 1);
            if (next) next.classList.toggle('hidden', total <= 1);
        }
        // Мобильный бар
        if (mobileBar) {
            var mp = mobileBar.querySelector('.la-mob-btn-prev');
            var mn = mobileBar.querySelector('.la-mob-btn-next');
            if (mp) mp.classList.toggle('hidden', total <= 1);
            if (mn) mn.classList.toggle('hidden', total <= 1);
        }
    }

    // ── Scroll logic ─────────────────────────────────────────────
    function getStuckWrapIdx() {
        var navH = 64 + 8;
        for (var i = 0; i < allWraps.length; i++) {
            var r = allWraps[i].getBoundingClientRect();
            if (r.top < navH && r.bottom > navH) return i;
        }
        var last = -1;
        for (var j = 0; j < allWraps.length; j++) {
            if (allWraps[j].getBoundingClientRect().bottom < navH) last = j;
        }
        return last;
    }

    var currentActiveWrap = null;

    function putInFixed(wrap) {
        if (wrap === currentActiveWrap) return;
        
        // Убрать подсветку с предыдущей секции
        if (currentActiveWrap) {
            currentActiveWrap.classList.remove('active-track');
        }
        
        // Подсветить текущую секцию
        wrap.classList.add('active-track');
        currentActiveWrap = wrap;

        // Показать сайдбар с плавной анимацией
        if (fixedBar) {
            fixedBar.classList.add('visible');
            // Синхронизировать состояние кнопки в сайдбаре
            syncFixedButton();
        }

        // Мобильный бар
        if (mobileBar) {
            mobileBar.classList.add('visible');
            document.body.classList.add('la-mob-bar-visible');
        }

        var wrapIdx = allWraps.indexOf(wrap);
        if (wrapIdx >= 0) { 
            updateFixedTitle(wrapIdx);
            // Меняем curAudioIndex только если нет активного воспроизведения
            if (!curAudio || curAudio.paused) {
                curAudioIndex = wrapIdx; 
                updateCounter();
            }
        }
    }

    function returnFromFixed() {
        // Убрать подсветку
        if (currentActiveWrap) {
            currentActiveWrap.classList.remove('active-track');
            currentActiveWrap = null;
        }
        
        // Скрыть сайдбар
        if (fixedBar) fixedBar.classList.remove('visible');
        if (mobileBar) {
            mobileBar.classList.remove('visible');
            document.body.classList.remove('la-mob-bar-visible');
        }
    }

    // Синхронизировать состояние кнопки в фиксированном сайдбаре
    function syncFixedButton() {
        if (!fixedSlot) return;
        var fixedBtn = fixedSlot.querySelector('.la-btn');
        var fixedContainer = fixedSlot.querySelector('.la-container');
        if (!fixedBtn || !fixedContainer) return;

        // Синхронизировать playing состояние
        var isPlaying = curAudio && (!curAudio.paused || curAudio._simPlaying);
        if (isPlaying) {
            fixedBtn.classList.add('playing');
            fixedContainer.classList.add('playing');
            if (fixedBar) fixedBar.classList.add('playing');
        } else {
            fixedBtn.classList.remove('playing');
            fixedContainer.classList.remove('playing');
            if (fixedBar) fixedBar.classList.remove('playing');
        }
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
            if (wrap) {
                if (wrap !== currentActiveWrap) {
                    putInFixed(wrap);
                } else if (!fixedBar || !fixedBar.classList.contains('visible')) {
                    // Если wrap уже активен, но сайдбар не виден - показываем его
                    putInFixed(wrap);
                }
            }
        });
    }

    // ── Управление скоростью ─────────────────────────────────────
    window.laSetSpeed = function(speed) {
        if (curAudio) {
            curAudio.playbackRate = speed;
        }
        // Обновить активную кнопку в десктоп и мобильном баре
        var buttons = document.querySelectorAll('.la-speed-btn, .la-mob-speed-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
            if (parseFloat(buttons[i].textContent) === speed) {
                buttons[i].classList.add('active');
            }
        }
    };

    // ── Скролл наверх из плеера ───────────────────────────────────
    window.laScrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // ── Сворачивание/разворачивание мобильного бара ───────────────
    window.laCollapseMobileBar = function() {
        if (!mobileBar) return;
        mobileBar.classList.add('collapsed');
        document.body.classList.add('la-mob-bar-collapsed');
        document.body.style.paddingBottom = '8px';
    };

    window.laExpandMobileBar = function() {
        if (!mobileBar) return;
        mobileBar.classList.remove('collapsed');
        document.body.classList.remove('la-mob-bar-collapsed');
        document.body.style.paddingBottom = '120px';
        resetInactivityTimer();
    };

    // ── Сворачивание/разворачивание десктопного плеера ─────────────
    window.laToggleFixedBar = function() {
        if (!fixedBar) return;
        fixedBar.classList.toggle('collapsed');
    };

    // ── Прозрачность мобильного бара при неактивности ─────────────
    var inactivityTimer = null;

    function resetInactivityTimer() {
        if (!mobileBar) return;
        mobileBar.classList.remove('inactive');
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function() {
            if (mobileBar && mobileBar.classList.contains('visible') && !mobileBar.classList.contains('collapsed')) {
                mobileBar.classList.add('inactive');
            }
        }, 3000); // 3 секунды до прозрачности
    }

    // Инициализация таймера неактивности для мобильных
    if (window.innerWidth <= 768) {
        document.addEventListener('touchstart', resetInactivityTimer, { passive: true });
        document.addEventListener('touchmove', resetInactivityTimer, { passive: true });
    }

    // ── Управление громкостью ─────────────────────────────────────
    var savedVolume = 1;
    var isMuted = false;

    window.laSetVolume = function(value) {
        var volume = value / 100;
        if (curAudio) {
            curAudio.volume = volume;
        }
        savedVolume = volume;
        
        // Обновить иконки в десктоп и мобильном баре
        var icons = document.querySelectorAll('.la-volume-icon, .la-mob-volume-icon');
        for (var i = 0; i < icons.length; i++) {
            if (volume === 0) {
                icons[i].textContent = '🔇';
            } else if (volume < 0.5) {
                icons[i].textContent = '🔉';
            } else {
                icons[i].textContent = '🔊';
            }
        }
        isMuted = false;
    };

    window.laToggleMute = function() {
        if (!curAudio) return;
        
        var sliders = document.querySelectorAll('.la-volume-slider, .la-mob-volume-slider');
        var icons = document.querySelectorAll('.la-volume-icon, .la-mob-volume-icon');
        
        if (isMuted) {
            curAudio.volume = savedVolume;
            for (var i = 0; i < sliders.length; i++) {
                sliders[i].value = savedVolume * 100;
            }
            for (var j = 0; j < icons.length; j++) {
                icons[j].textContent = savedVolume < 0.5 ? '🔉' : '🔊';
            }
            isMuted = false;
        } else {
            savedVolume = curAudio.volume;
            curAudio.volume = 0;
            for (var k = 0; k < sliders.length; k++) {
                sliders[k].value = 0;
            }
            for (var l = 0; l < icons.length; l++) {
                icons[l].textContent = '🔇';
            }
            isMuted = true;
        }
    };

    document.addEventListener('DOMContentLoaded', function() {
        var els = document.querySelectorAll('audio[data-duration]');
        for (var i = 0; i < els.length; i++) {
            var au = els[i];
            au._dur = parseInt(au.getAttribute('data-duration')) || 300;
            au.preload = 'metadata';
            var btn = document.querySelector('[onclick*="' + au.id + '"]');
            if (btn) au._box = btn.closest('.la-container');
            updateProgress(au.id, 0, au._dur);
            allAudioIds.push(au.id);
        }

        allWraps = Array.prototype.slice.call(document.querySelectorAll('.section-audio-wrap'));

        if (allWraps.length > 0) {
            buildFixedBar();
            buildMobileBar();
            window.addEventListener('scroll', onScroll, { passive: true });
        }
    });
})();
