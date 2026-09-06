// ===== LESSON AUDIO PLAYER =====
(function() {
    var curAudio = null;
    var curBtn = null;
    var curBox = null;
    var timer = null;
    var allAudioIds = [];
    var curAudioIndex = 0;

    var fixedBar = null;      // desktop sidebar
    var mobileBar = null;     // mobile bottom bar
    var fixedSlot = null;
    var allWraps = [];
    var ticking = false;

    function fmt(s) {
        var m = Math.floor(s / 60), sec = Math.floor(s % 60);
        return m + ':' + (sec < 10 ? '0' : '') + sec;
    }

    // Update progress
    function updateProgress(id, t, d) {
        // The single point every track time goes through: real playback, seeking and
        // simulatePlayback all lead here. Dispatched before the _box check so lesson
        // visuals (lesson-visuals.js) do not depend on the player's DOM state.
        document.dispatchEvent(new CustomEvent('la:progress', {
            detail: { id: id, t: t, d: d, p: d > 0 ? t / d : 0 }
        }));

        var au = document.getElementById(id);
        if (!au || !au._box) return;
        var box = au._box;
        var tm = box.querySelector('.la-time');
        var mb = box.querySelector('.la-mobile-fill');
        var p = d > 0 ? t / d : 0;
        if (mb) mb.style.width = (p * 100) + '%';
        if (tm) tm.textContent = fmt(t) + ' / ' + fmt(d);
        // Update fixed bars
        updateFixedProgress(p, t, d);
    }

    // Update progress in the fixed bars
    function updateFixedProgress(p, t, d) {
        // Desktop
        if (fixedBar) {
            var fp = fixedBar.querySelector('.la-fixed-progress-fill');
            var ft = fixedBar.querySelector('.la-fixed-time');
            if (fp) fp.style.width = (p * 100) + '%';
            if (ft) ft.textContent = fmt(t) + ' / ' + fmt(d);
        }
        // Mobile
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
        // Reset the button in the mobile bar
        if (mobileBar) {
            var mp = mobileBar.querySelector('.la-mob-play');
            if (mp) mp.classList.remove('playing');
        }
        // Remove the playing class from fixedBar
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

    // Update the track title in the fixed bars
    function updateFixedTitle(idx) {
        var wrap = allWraps[idx];
        var title = '';
        if (wrap) {
            var h2 = wrap.querySelector('h2');
            if (h2) title = h2.textContent.trim();
        }
        if (!title) title = 'Audio ' + (idx + 1);

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
                // Pause
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
                // Resume
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

        // A different track
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
            // Auto-advance to the next track
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

    // Sync the play button in the mobile bar
    function syncMobPlayBtn(playing) {
        if (!mobileBar) return;
        var mp = mobileBar.querySelector('.la-mob-play');
        if (mp) mp.classList.toggle('playing', playing);

        // Also sync the fixed button
        syncFixedButton();

        // Update the playing class on fixedBar to indicate playback
        if (fixedBar) {
            fixedBar.classList.toggle('playing', playing);
        }
    }

    // Click on the play button in the mobile/desktop bar
    window.laBarToggle = function() {
        if (!curAudio) {
            // Start the first track
            var id = allAudioIds[0];
            if (!id) return;
            var au = document.getElementById(id);
            if (!au) return;
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) laToggle(btn, id);
            return;
        }
        // Toggle the current track
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
        e.stopPropagation(); // Prevent event bubbling
        var r = e.currentTarget.getBoundingClientRect();
        var a = Math.atan2(e.clientY-(r.top+r.height/2), e.clientX-(r.left+r.width/2));
        var p = (a + Math.PI/2)/(2*Math.PI); if (p<0) p+=1;
        var au = document.getElementById(id);
        if (!au) return;
        var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur||300);

        // Set the position
        au.currentTime = p*d;

        // If the audio is paused, start it
        if (au.paused && !au._simPlaying) {
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) laToggle(btn, id);
        } else {
            updateProgress(id, au.currentTime, d);
        }
    };

    window.laSeekMobile = function(e, id) {
        e.stopPropagation(); // Prevent event bubbling
        var r = e.currentTarget.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
        var au = document.getElementById(id);
        if (!au) return;
        var d = au.duration && isFinite(au.duration) ? au.duration : (au._dur||300);

        var wasPaused = au.paused && !au._simPlaying;

        // Set the position
        au.currentTime = p*d;
        updateProgress(id, au.currentTime, d);

        // If the audio was paused, start it
        if (wasPaused) {
            var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + id + '"]');
            if (btn) {
                // Start without resetting the position
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

    // Seek via the progress bar in the fixed bars
    window.laSeekBar = function(e) {
        if (e.stopPropagation) e.stopPropagation();
        var r = e.currentTarget.getBoundingClientRect();
        var p = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));

        if (!curAudio) {
            // If there's no active audio, start the first track at the target position
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

                // Load the audio if needed
                if (au.readyState < 2) au.load();

                // Wait for metadata to load
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

        // Set the position
        if (curAudio.readyState >= 2 && !curAudio._simPlaying) {
            curAudio.currentTime = targetTime;
            updateProgress(curAudio.id, targetTime, d);
        } else if (curAudio._simPlaying) {
            // For simulated audio just update visually
            updateProgress(curAudio.id, targetTime, d);
        }

        // If the audio was paused, start playback
        // If it was already playing — do NOT call play() again!
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

    // ── Arrows ──────────────────────────────────────────────────
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

    // ── Desktop sidebar ──────────────────────────────────────────
    function buildFixedBar() {
        var bar = document.createElement('div');
        bar.id = 'la-fixed-bar';
        bar.className = 'la-fixed-bar';
        bar.innerHTML =
            '<button class="la-fixed-toggle" onclick="laToggleFixedBar()" aria-label="Collapse/expand player">' +
                '<span class="la-fixed-toggle-icon">▶</span>' +
            '</button>' +
            '<div class="la-fixed-title">Select audio</div>' +
            '<div class="la-fixed-controls">' +
                '<button class="la-arrow la-arrow-prev" onclick="laPrev()" aria-label="Previous">&#8249;</button>' +
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
                '<button class="la-arrow la-arrow-next" onclick="laNext()" aria-label="Next">&#8250;</button>' +
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

        // Add a click handler on the progress bar
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

    // ── Mobile bottom bar ─────────────────────────────────────
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
                    '<div class="la-mob-title">Audio</div>' +
                    '<div class="la-mob-time">0:00 / 0:00</div>' +
                '</div>' +
                '<div class="la-mob-controls">' +
                    '<button class="la-mob-btn-prev hidden" onclick="laPrev()" aria-label="Previous">&#8249;</button>' +
                    '<button class="la-mob-play" onclick="laBarToggle()" aria-label="Play/Pause">' +
                        '<span class="la-play">▶</span>' +
                        '<span class="la-pause">⏸</span>' +
                    '</button>' +
                    '<button class="la-mob-btn-next hidden" onclick="laNext()" aria-label="Next">&#8250;</button>' +
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
                '<button class="la-mob-scroll-top" onclick="laScrollToTop()" aria-label="Back to top">' +
                    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>' +
                '</button>' +
            '</div>';
        document.body.appendChild(bar);
        mobileBar = bar;

        // Large button to expand
        var expandBtn = document.createElement('div');
        expandBtn.className = 'la-mob-expand-btn';
        expandBtn.onclick = laExpandMobileBar;
        expandBtn.innerHTML = '<span class="la-mob-expand-icon">▲</span>';
        document.body.appendChild(expandBtn);

        // Handlers to restore activity
        bar.addEventListener('touchstart', resetInactivityTimer);
        bar.addEventListener('mouseenter', resetInactivityTimer);

        // Add a click handler on the mobile progress bar
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
        // Desktop bar
        if (fixedBar) {
            var prev = fixedBar.querySelector('.la-arrow-prev');
            var next = fixedBar.querySelector('.la-arrow-next');
            if (prev) prev.classList.toggle('hidden', total <= 1);
            if (next) next.classList.toggle('hidden', total <= 1);
        }
        // Mobile bar
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

        // Remove the highlight from the previous section
        if (currentActiveWrap) {
            currentActiveWrap.classList.remove('active-track');
        }

        // Highlight the current section
        wrap.classList.add('active-track');
        currentActiveWrap = wrap;

        // Show the sidebar with a smooth animation
        if (fixedBar) {
            fixedBar.classList.add('visible');
            // Sync the button state in the sidebar
            syncFixedButton();
        }

        // Mobile bar
        if (mobileBar) {
            mobileBar.classList.add('visible');
            document.body.classList.add('la-mob-bar-visible');
        }

        var wrapIdx = allWraps.indexOf(wrap);
        if (wrapIdx >= 0) {
            updateFixedTitle(wrapIdx);
            // Change curAudioIndex only if nothing is actively playing
            if (!curAudio || curAudio.paused) {
                curAudioIndex = wrapIdx;
                updateCounter();
            }
        }
    }

    function returnFromFixed() {
        // Remove the highlight
        if (currentActiveWrap) {
            currentActiveWrap.classList.remove('active-track');
            currentActiveWrap = null;
        }

        // Hide the sidebar
        if (fixedBar) fixedBar.classList.remove('visible');
        if (mobileBar) {
            mobileBar.classList.remove('visible');
            document.body.classList.remove('la-mob-bar-visible');
        }
    }

    // Sync the button state in the fixed sidebar
    function syncFixedButton() {
        if (!fixedSlot) return;
        var fixedBtn = fixedSlot.querySelector('.la-btn');
        var fixedContainer = fixedSlot.querySelector('.la-container');
        if (!fixedBtn || !fixedContainer) return;

        // Sync the playing state
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
                    // If the wrap is already active but the sidebar isn't visible — show it
                    putInFixed(wrap);
                }
            }
        });
    }

    // ── Speed control ─────────────────────────────────────────────
    window.laSetSpeed = function(speed) {
        if (curAudio) {
            curAudio.playbackRate = speed;
        }
        // Update the active button in the desktop and mobile bar
        var buttons = document.querySelectorAll('.la-speed-btn, .la-mob-speed-btn');
        for (var i = 0; i < buttons.length; i++) {
            buttons[i].classList.remove('active');
            if (parseFloat(buttons[i].textContent) === speed) {
                buttons[i].classList.add('active');
            }
        }
    };

    // ── Scroll to top from the player ───────────────────────────────────
    window.laScrollToTop = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // ── Collapse/expand the mobile bar ───────────────
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

    // ── Collapse/expand the desktop player ─────────────
    window.laToggleFixedBar = function() {
        if (!fixedBar) return;
        fixedBar.classList.toggle('collapsed');
    };

    // ── Mobile bar transparency on inactivity ─────────────
    var inactivityTimer = null;

    function resetInactivityTimer() {
        if (!mobileBar) return;
        mobileBar.classList.remove('inactive');
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(function() {
            if (mobileBar && mobileBar.classList.contains('visible') && !mobileBar.classList.contains('collapsed')) {
                mobileBar.classList.add('inactive');
            }
        }, 3000); // 3 seconds until transparency
    }

    // Initialize the inactivity timer for mobile
    if (window.innerWidth <= 768) {
        document.addEventListener('touchstart', resetInactivityTimer, { passive: true });
        document.addEventListener('touchmove', resetInactivityTimer, { passive: true });
    }

    // ── Volume control ─────────────────────────────────────
    var savedVolume = 1;
    var isMuted = false;

    window.laSetVolume = function(value) {
        var volume = value / 100;
        if (curAudio) {
            curAudio.volume = volume;
        }
        savedVolume = volume;

        // Update the icons in the desktop and mobile bar
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
    // ═══ Subtitles and transcript ══════════════════════════════════
    // The VTT sits next to the mp3 under the same name. No file — nothing
    // shows up and the player behaves exactly as before.

    var subCur = null;   // { au, words: [{t, el}], k }
    var subRaf = null;
    var subHold = 0;     // no panel autoscroll until this moment

    function vttSec(s) {
        var p = s.split(':');
        return (+p[0]) * 3600 + (+p[1]) * 60 + parseFloat(p[2]);
    }

    // "one <00:00:01.200>two" -> [{t:null,w:'one'}, {t:1.2,w:'two'}]
    function parseCue(text) {
        var out = [], re = /<(\d\d:\d\d:\d\d\.\d\d\d)>/g, last = 0, pending = null, m;
        while ((m = re.exec(text)) !== null) {
            var chunk = text.slice(last, m.index).trim();
            if (chunk) out.push({ t: pending, w: chunk });
            pending = vttSec(m[1]);
            last = re.lastIndex;
        }
        var tail = text.slice(last).trim();
        if (tail) out.push({ t: pending, w: tail });
        return out;
    }

    function plainCue(text) {
        return text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    }

    // Lay the cue out word by word, return the word->time map
    function renderWords(box, parts, start) {
        var frag = document.createDocumentFragment(), words = [], i;
        for (i = 0; i < parts.length; i++) {
            var sp = document.createElement('span');
            sp.className = 'la-w';
            sp.textContent = parts[i].w;
            frag.appendChild(sp);
            if (i < parts.length - 1) frag.appendChild(document.createTextNode(' '));
            words.push({ t: parts[i].t === null ? start : parts[i].t, el: sp });
        }
        box.textContent = '';
        box.appendChild(frag);
        return words;
    }

    // The same word lives in two places — the subtitle line and the panel
    // row. They share one timestamp but may have several elements.
    function mergeWords(lists) {
        var out = [], i, j;
        for (i = 0; i < lists[0].length; i++) {
            var els = [];
            for (j = 0; j < lists.length; j++) els.push(lists[j][i].el);
            out.push({ t: lists[0][i].t, els: els });
        }
        return out;
    }

    function paintWords(k) {
        if (!subCur) return;
        var ws = subCur.words, i, j;
        for (i = 0; i < ws.length; i++) {
            var cls = 'la-w' + (i < k ? ' said' : (i === k ? ' now' : ''));
            for (j = 0; j < ws[i].els.length; j++) ws[i].els[j].className = cls;
        }
    }

    function subTick() {
        subRaf = null;
        if (!subCur) return;
        var au = subCur.au, t = au.currentTime, ws = subCur.words, k = -1;
        for (var i = 0; i < ws.length; i++) {
            if (ws[i].t <= t) k = i; else break;
        }
        if (k !== subCur.k) { subCur.k = k; paintWords(k); }
        if (!au.paused) subRaf = requestAnimationFrame(subTick);
    }

    function subStart() {
        if (subRaf === null && subCur) subRaf = requestAnimationFrame(subTick);
    }

    function subStop() {
        if (subRaf !== null) { cancelAnimationFrame(subRaf); subRaf = null; }
    }

    // Phrases are APPENDED, not replaced: the line above the player fills
    // up and older text scrolls off to the left. Same behaviour as the
    // Russian player — the English one used to swap the text wholesale,
    // which read as flicker.
    var SUB_KEEP = 14;   // how many phrases to keep before dropping the oldest
    function appendCue(box, txt) {
        if (!txt) { box.textContent = ''; box.classList.remove('has-text'); return; }
        var last = box.lastElementChild;
        if (last && last.dataset.cue === txt) return;   // same phrase — no duplicate
        var sp = document.createElement('span');
        sp.className = 'la-cue';
        sp.dataset.cue = txt;
        sp.textContent = txt;
        box.appendChild(sp);
        while (box.children.length > SUB_KEEP) box.removeChild(box.firstElementChild);
        for (var k = 0; k < box.children.length; k++) {
            box.children[k].classList.toggle('now', k === box.children.length - 1);
        }
        box.classList.add('has-text');
        if (box.scrollTo) box.scrollTo({ left: box.scrollWidth, behavior: 'smooth' });
        else box.scrollLeft = box.scrollWidth;
    }

    function setBarText(txt) {
        var boxes = [], i;
        if (fixedBar) boxes.push(fixedBar.querySelector('.la-fixed-sub'));
        if (mobileBar) boxes.push(mobileBar.querySelector('.la-mob-sub'));
        for (i = 0; i < boxes.length; i++) {
            if (!boxes[i]) continue;
            appendCue(boxes[i], txt);
        }
    }

    function scrollPanelTo(panel, row) {
        if (!panel.classList.contains('open') || Date.now() < subHold) return;
        var top = row.offsetTop - panel.clientHeight / 2 + row.offsetHeight / 2;
        if (panel.scrollTo) panel.scrollTo({ top: top, behavior: 'smooth' });
        else panel.scrollTop = top;
    }

    function seekTo(au, t) {
        var go = function() {
            try { au.currentTime = t; } catch (e) { return; }
            if (au.paused && !au._simPlaying) {
                var btn = document.querySelector('[onclick*="laToggle"][onclick*="' + au.id + '"]');
                if (btn) laToggle(btn, au.id);
            }
        };
        if (au.readyState >= 1) go();
        else { au.load(); au.addEventListener('loadedmetadata', go, { once: true }); }
    }

    function buildTranscript(au, track, ui) {
        var cues = track.cues, frag = document.createDocumentFragment(), i;
        if (!cues || !cues.length) return false;
        for (i = 0; i < cues.length; i++) {
            var row = document.createElement('div');
            row.className = 'la-tr-row';
            row.setAttribute('data-t', cues[i].startTime);
            row.innerHTML = '<span class="la-tr-time"></span><span class="la-tr-text"></span>';
            row.firstChild.textContent = fmt(cues[i].startTime);
            row.lastChild.textContent = plainCue(cues[i].text);
            frag.appendChild(row);
        }
        ui.panel.appendChild(frag);
        ui.rows = ui.panel.querySelectorAll('.la-tr-row');

        ui.panel.addEventListener('click', function(e) {
            var row = e.target.closest ? e.target.closest('.la-tr-row') : null;
            if (row) seekTo(au, parseFloat(row.getAttribute('data-t')));
        });
        ui.panel.addEventListener('scroll', function() { subHold = Date.now() + 4000; }, { passive: true });
        return true;
    }

    function onCueChange(au, track, ui) {
        var cue = track.activeCues && track.activeCues.length ? track.activeCues[0] : null;
        if (!cue) {
            // A gap between phrases is NOT the end of the track. This used to
            // wipe the text from the bar and the line above the player: the
            // line collapsed, the bar lost a row, and the next phrase put it
            // all back — the page jumped on every sentence. Now the last
            // phrase stays until the next one; only "ended" clears it.
            if (ui.active) { ui.active.classList.remove('now'); ui.active.lastChild.textContent = ui.activeText; ui.active = null; }
            if (!subCur || subCur.au === au) {
                subStop(); subCur = null;
                var ws = ui.line.querySelectorAll('.la-w');
                for (var w = 0; w < ws.length; w++) { ws[w].classList.remove('now'); ws[w].classList.add('said'); }
            }
            return;
        }

        var parts = parseCue(cue.text), plain = plainCue(cue.text);
        ui.line.classList.add('has-text');
        var lists = [renderWords(ui.line, parts, cue.startTime)];

        // the active panel row gets the same words so it highlights too
        if (ui.rows) {
            if (ui.active) { ui.active.classList.remove('now'); ui.active.lastChild.textContent = ui.activeText; }
            var idx = Array.prototype.indexOf.call(track.cues, cue);
            var row = ui.rows[idx];
            if (row) {
                ui.active = row;
                ui.activeText = plain;
                row.classList.add('now');
                lists.push(renderWords(row.lastChild, parts, cue.startTime));
                scrollPanelTo(ui.panel, row);
            }
        }

        setBarText(plain);
        subCur = { au: au, words: mergeWords(lists), k: -1 };
        paintWords(-1);
        if (!au.paused) subStart(); else subTick();
    }

    function attachSubs(au) {
        var src = au.getAttribute('src') || '';
        if (!/\.mp3(\?|$)/i.test(src)) return;
        var wrap = document.querySelector('.section-audio-wrap[data-audio-id="' + au.id + '"]');
        if (!wrap) return;

        var track = document.createElement('track');
        track.kind = 'captions';
        track.srclang = 'en';
        track.label = 'Text';
        track.src = src.replace(/\.mp3(\?.*)?$/i, '.vtt');
        au.appendChild(track);
        try { track.track.mode = 'hidden'; } catch (e) { return; }

        track.addEventListener('error', function() {
            try { au.removeChild(track); } catch (e) {}
        });

        var mounted = false;
        function mount() {
            if (mounted) return;
            mounted = true;
            var ui = document.createElement('div');
            ui.className = 'la-subs';
            ui.innerHTML =
                '<div class="la-sub-line"></div>' +
                '<button type="button" class="la-sub-btn" aria-expanded="false">' +
                    '<span class="la-sub-btn-icon">▤</span> Text' +
                '</button>' +
                '<div class="la-transcript"></div>';
            wrap.appendChild(ui);

            var state = {
                line: ui.querySelector('.la-sub-line'),
                panel: ui.querySelector('.la-transcript'),
                rows: null, active: null, activeText: ''
            };
            if (!buildTranscript(au, track.track, state)) { wrap.removeChild(ui); mounted = false; return; }

            ui.querySelector('.la-sub-btn').addEventListener('click', function() {
                var open = state.panel.classList.toggle('open');
                this.classList.toggle('open', open);
                this.setAttribute('aria-expanded', open ? 'true' : 'false');
                if (open && state.active) { subHold = 0; scrollPanelTo(state.panel, state.active); }
            });

            track.track.addEventListener('cuechange', function() {
                onCueChange(au, track.track, state);
            });
            au.addEventListener('playing', function() {
                if (subCur && subCur.au === au) subStart();
            });
            au.addEventListener('pause', function() {
                if (subCur && subCur.au === au) subStop();
            });
            au.addEventListener('ended', function() {
                if (subCur && subCur.au !== au) return;
                subStop(); subCur = null;
                state.line.classList.remove('has-text');
                state.line.textContent = '';
                if (state.active) { state.active.classList.remove('now'); state.active.lastChild.textContent = state.activeText; state.active = null; }
                setBarText('');
            });
        }

        // Safari/iOS does not always fire load on a <track> inside <audio> —
        // poll for cues, otherwise the feature never shows up there
        track.addEventListener('load', mount);
        var tries = 0;
        var poll = setInterval(function() {
            var t = track.track;
            if (t && t.cues && t.cues.length) { clearInterval(poll); mount(); }
            else if (++tries > 20) clearInterval(poll);
        }, 300);
    }

    function initSubs() {
        if (fixedBar && !fixedBar.querySelector('.la-fixed-sub')) {
            var fs = document.createElement('div');
            fs.className = 'la-fixed-sub';
            var ft = fixedBar.querySelector('.la-fixed-title');
            if (ft && ft.nextSibling) fixedBar.insertBefore(fs, ft.nextSibling);
            else fixedBar.appendChild(fs);
        }
        if (mobileBar && !mobileBar.querySelector('.la-mob-sub')) {
            var ms = document.createElement('div');
            ms.className = 'la-mob-sub';
            var mr = mobileBar.querySelector('.la-mob-row');
            if (mr) mobileBar.insertBefore(ms, mr);
            else mobileBar.appendChild(ms);
        }
        var els = document.querySelectorAll('audio[data-duration]');
        for (var i = 0; i < els.length; i++) attachSubs(els[i]);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSubs);
    } else {
        initSubs();
    }
})();
