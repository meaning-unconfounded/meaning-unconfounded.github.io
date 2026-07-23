/**
 * THE WHITE BOOK — Complete JavaScript
 * Extracted from trial.html
 * Key System: 20 keys (reduced from 40)
 */

(function() {
  "use strict";

  /* ── theme ─────────────────────────────────────────────── */
  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("wb-theme"); } catch (e) {}
  var theme = stored || (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  root.setAttribute("data-theme", theme);

  var themeBtn = document.getElementById("themeToggle");
  function paintThemeBtn() {
    if (themeBtn) themeBtn.textContent = root.getAttribute("data-theme") === "dark" ? "☀" : "☾";
  }
  paintThemeBtn();
  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("wb-theme", next); } catch (e) {}
      paintThemeBtn();
    });
  }

  /* ── mobile sidebar ────────────────────────────────────── */
  var navToggle = document.getElementById("navToggle");
  if (navToggle) {
    navToggle.addEventListener("click", function () {
      document.body.classList.toggle("sb-open");
    });
  }
  document.querySelectorAll(".sb-link").forEach(function (a) {
    a.addEventListener("click", function () {
      document.body.classList.remove("sb-open");
    });
  });

  /* ── reading progress + back-to-top ────────────────────── */
  var progress = document.getElementById("progress");
  var toTop = document.getElementById("toTop");
  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    if (progress) progress.style.width = pct + "%";
    if (toTop) toTop.classList.toggle("show", window.scrollY > 700);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) {
    toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  /* ── scrollspy ─────────────────────────────────────────── */
  var links = {};
  document.querySelectorAll(".sb-link[href^='#']").forEach(function (a) {
    links[a.getAttribute("href").slice(1)] = a;
  });
  var headings = Array.prototype.slice.call(
    document.querySelectorAll("#main h1[id], #main h2[id], #main h3[id]")
  );
  var current = null;
  function setActive(id) {
    if (id === current) return;
    if (current && links[current]) links[current].classList.remove("active");
    current = id;
    if (id && links[id]) {
      var a = links[id];
      a.classList.add("active");
      var det = a.closest("details");
      if (det && !det.open) det.open = true;
    }
  }
  if ("IntersectionObserver" in window && headings.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) setActive(en.target.id);
      });
    }, { rootMargin: "-15% 0px -70% 0px" });
    headings.forEach(function (h) { spy.observe(h); });
  }

  /* ── sidebar search ────────────────────────────────────── */
  var searchInput = document.getElementById("sbSearch");
  var navLinks = document.querySelectorAll("#sbNav .sb-link:not(.sb-grp):not(.sb-top)");
  if (searchInput) {
    searchInput.addEventListener("input", function () {
      var q = this.value.toLowerCase().trim();
      navLinks.forEach(function (link) {
        var txt = link.textContent.toLowerCase();
        var show = q === "" || txt.includes(q);
        link.classList.toggle("sb-hidden", !show);
        var det = link.closest("details");
        if (det && q !== "") { det.open = true; }
      });
    });
  }

  /* ── TOC toggle ────────────────────────────────────────── */
  var tocToggle = document.getElementById('tocToggle');
  var toc = document.getElementById('toc');
  if (tocToggle && toc) {
    tocToggle.addEventListener('click', function() {
      toc.classList.toggle('open');
      tocToggle.textContent = toc.classList.contains('open') ? '✕ Hide Contents' : '📖 Show Contents';
    });
  }

  /* ── parable cards ──────────────────────────────────────── */
  document.querySelectorAll(".parable-card").forEach(function (card) {
    card.addEventListener("click", function () {
      this.classList.toggle("open");
    });
  });

  /* ── KEY SYSTEM (20 Keys) ───────────────────────────────── */
  var keys = document.querySelectorAll('.key-surprise');
  if (keys.length) {
    var keyStates = {};
    var activeKey = null;

    var glowMap = {
      '#c96478': 'rgba(201, 100, 120, 0.12)',
      '#5a9e6e': 'rgba(90, 158, 110, 0.12)',
      '#c9a227': 'rgba(201, 162, 39, 0.12)'
    };

    keys.forEach(function(key, index) {
      var color = key.dataset.color || '#c96478';
      var keyId = key.dataset.keyId || ('key-' + index);

      key.style.setProperty('--key-color', color);
      key.style.setProperty('--key-glow', glowMap[color] || glowMap['#c96478']);

      if (index % 2 === 1) key.classList.add('from-left');

      var sentinel = document.createElement('div');
      sentinel.className = 'key-sentinel';
      sentinel.dataset.keyId = keyId;
      key.parentNode.insertBefore(sentinel, key);

      keyStates[keyId] = 'idle';

      var card = key.querySelector('.key-card');
      if (!card) return;

      card.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
        dismissKey(key, keyId, color);
      });

      var hoverTimer = null;
      card.addEventListener('mouseenter', function() {
        hoverTimer = setTimeout(function() {
          dismissKey(key, keyId, color);
        }, 700);
      });
      card.addEventListener('mouseleave', function() {
        if (hoverTimer) { clearTimeout(hoverTimer); hoverTimer = null; }
      });

      var touchTimer = null;
      card.addEventListener('touchstart', function(e) {
        touchTimer = setTimeout(function() {
          dismissKey(key, keyId, color);
        }, 350);
      }, { passive: true });
      card.addEventListener('touchend', function() {
        if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
      });
      card.addEventListener('touchmove', function() {
        if (touchTimer) { clearTimeout(touchTimer); touchTimer = null; }
      }, { passive: true });
    });

    function showKey(key, keyId) {
      if (keyStates[keyId] === 'dismissed') return;
      if (activeKey && activeKey !== key) {
        hideKey(activeKey);
      }
      keyStates[keyId] = 'active';
      key.classList.remove('smoke-out');
      key.classList.add('slide-in');
      activeKey = key;
    }

    function hideKey(key) {
      var keyId = key.dataset.keyId;
      if (!keyId || keyStates[keyId] === 'dismissed') return;
      keyStates[keyId] = 'inactive';
      key.classList.remove('slide-in');
      if (activeKey === key) activeKey = null;
    }

    function dismissKey(key, keyId, color) {
      if (keyStates[keyId] === 'dismissed') return;
      keyStates[keyId] = 'dismissed';
      key.classList.remove('slide-in');
      key.classList.add('smoke-out', 'engaged');
      if (activeKey === key) activeKey = null;

      createSmoke(key, color);
      updateTracker(keyId, color);
    }

    function createSmoke(key, color) {
      var rect = key.getBoundingClientRect();
      var cx = rect.left + rect.width / 2;
      var cy = rect.top + rect.height / 2;

      for (var i = 0; i < 18; i++) {
        var p = document.createElement('div');
        p.className = 'smoke-particle';

        var size = 4 + Math.random() * 12;
        var startX = cx + (Math.random() - 0.5) * rect.width * 0.7;
        var startY = cy + (Math.random() - 0.5) * rect.height * 0.7;

        p.style.cssText =
          'position:fixed;' +
          'width:' + size + 'px;' +
          'height:' + size + 'px;' +
          'border-radius:50%;' +
          'background:' + color + ';' +
          'left:' + startX + 'px;' +
          'top:' + startY + 'px;' +
          'opacity:' + (0.4 + Math.random() * 0.3) + ';' +
          'z-index:51;' +
          'pointer-events:none;' +
          'transition:all 1.2s cubic-bezier(0.4,0,0.2,1);' +
          'filter:blur(2px);';

        document.body.appendChild(p);

        requestAnimationFrame(function() {
          var angle = Math.random() * Math.PI * 2;
          var dist = 80 + Math.random() * 140;
          p.style.transform =
            'translate(' + (Math.cos(angle) * dist) + 'px,' +
            (Math.sin(angle) * dist - 60) + 'px) ' +
            'scale(' + (3 + Math.random() * 4) + ')';
          p.style.opacity = '0';
          p.style.filter = 'blur(14px)';
        });

        (function(particle) {
          setTimeout(function() {
            if (particle.parentNode) particle.parentNode.removeChild(particle);
          }, 1300);
        })(p);
      }
    }

    function updateTracker(keyId, color) {
      var items = document.querySelectorAll('.tracker-key-item');
      var found = 0;
      var total = items.length;

      items.forEach(function(item) {
        if (item.dataset.keyId === keyId) {
          var colorClass = '';
          if (color === '#c96478') colorClass = 'pink-found';
          else if (color === '#5a9e6e') colorClass = 'green-found';
          else if (color === '#c9a227') colorClass = 'yellow-found';
          item.classList.add('found', colorClass);
        }
        if (item.classList.contains('found')) found++;
      });

      var bar = document.querySelector('.tracker-bar');
      if (bar && total > 0) {
        bar.style.width = (found / total * 100) + '%';
      }

      var counter = document.querySelector('#keyTracker');
      if (counter) {
        var countText = counter.querySelector('.tracker-count');
        if (countText) countText.textContent = found + '/' + total;
      }

      if (found === total && total > 0) {
        var completion = document.querySelector('.tracker-completion');
        if (completion) completion.classList.add('show');
      }
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var sentinel = entry.target;
        var key = sentinel.nextElementSibling;
        if (!key || !key.classList.contains('key-surprise')) return;
        var keyId = key.dataset.keyId;
        if (!keyId) return;

        if (entry.isIntersecting) {
          showKey(key, keyId);
        } else {
          hideKey(key);
        }
      });
    }, {
      rootMargin: '-15% 0px -25% 0px',
      threshold: 0
    });

    document.querySelectorAll('.key-sentinel').forEach(function(s) {
      observer.observe(s);
    });

    var tracker = document.getElementById('keyTracker');
    if (tracker) {
      var detail = tracker.querySelector('.tracker-detail');
      tracker.addEventListener('click', function() {
        if (detail) detail.classList.toggle('open');
      });
    }
  }

  /* ── Listening Room ────────────────────────────────────── */
  (function() {
    var videoExts = ['.mp4', '.webm', '.mov'];
    var audioExts = ['.mp3', '.mpa', '.ogg', '.wav', '.m4a'];
    var manifest = null;
    var currentAudio = null;

    async function loadManifest() {
      try {
        var res = await fetch('/media-manifest.json');
        if (!res.ok) throw new Error('Manifest not found');
        manifest = await res.json();
        render();
      } catch (e) {
        showEmpty();
      }
    }

    function getRandom(arr, n) {
      var shuffled = arr.slice().sort(function() { return 0.5 - Math.random(); });
      return shuffled.slice(0, n);
    }

    function formatTime(s) {
      if (!s || isNaN(s)) return '0:00';
      var m = Math.floor(s / 60);
      var sec = Math.floor(s % 60);
      return m + ':' + sec.toString().padStart(2, '0');
    }

    function showEmpty() {
      document.getElementById('lrVideos').innerHTML =
        '<div class="lr-empty">The alcove awaits your contributions</div>';
      document.getElementById('lrAudio').innerHTML = '';
      var microcopy = document.querySelector('.lr-microcopy');
      if (microcopy) microcopy.style.display = 'none';
    }

    function render() {
      if (!manifest) return;
      var videos = manifest.filter(function(f) {
        return videoExts.some(function(e) { return f.toLowerCase().endsWith(e); });
      });
      var audios = manifest.filter(function(f) {
        return audioExts.some(function(e) { return f.toLowerCase().endsWith(e); });
      });

      if (videos.length === 0 && audios.length === 0) {
        showEmpty();
        return;
      }

      var microcopy = document.querySelector('.lr-microcopy');
      if (microcopy) microcopy.style.display = 'block';

      var videoContainer = document.getElementById('lrVideos');
      if (videos.length > 0) {
        var picks = getRandom(videos, Math.min(2, videos.length));
        videoContainer.innerHTML = picks.map(function(src, i) {
          return '<div class="lr-video" data-video-index="' + i + '">' +
            '<video preload="metadata" data-src="' + src + '">' +
            '<source src="' + src + '" type="video/mp4">' +
            '</video>' +
            '<div class="lr-video-overlay">' +
            '<button class="lr-play-btn" data-index="' + i + '">▶</button>' +
            '</div>' +
            '<div class="lr-video-label">' + src.replace(/^.*[\\\/]/, '') + '</div>' +
            '</div>';
        }).join('');

        videoContainer.querySelectorAll('.lr-video').forEach(function(wrapper) {
          wrapper.addEventListener('click', function(e) {
            var video = this.querySelector('video');
            var btn = this.querySelector('.lr-play-btn');

            if (video.paused) {
              videoContainer.querySelectorAll('video').forEach(function(v) {
                if (v !== video) {
                  v.pause();
                  v.currentTime = 0;
                  var otherBtn = v.closest('.lr-video').querySelector('.lr-play-btn');
                  if (otherBtn) otherBtn.textContent = '▶';
                }
              });
              video.play();
              if (btn) btn.textContent = '❚❚';
            } else {
              video.pause();
              if (btn) btn.textContent = '▶';
            }
          });
        });

        videoContainer.querySelectorAll('.lr-play-btn').forEach(function(btn) {
          btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var video = this.closest('.lr-video').querySelector('video');

            if (video.paused) {
              videoContainer.querySelectorAll('video').forEach(function(v) {
                if (v !== video) {
                  v.pause();
                  v.currentTime = 0;
                  var otherBtn = v.closest('.lr-video').querySelector('.lr-play-btn');
                  if (otherBtn) otherBtn.textContent = '▶';
                }
              });
              video.play();
              this.textContent = '❚❚';
            } else {
              video.pause();
              this.textContent = '▶';
            }
          });
        });

        videoContainer.querySelectorAll('video').forEach(function(v) {
          v.addEventListener('ended', function() {
            var btn = this.closest('.lr-video').querySelector('.lr-play-btn');
            if (btn) btn.textContent = '▶';
          });
          v.addEventListener('pause', function() {
            var btn = this.closest('.lr-video').querySelector('.lr-play-btn');
            if (btn) btn.textContent = '▶';
          });
          v.addEventListener('play', function() {
            var btn = this.closest('.lr-video').querySelector('.lr-play-btn');
            if (btn) btn.textContent = '❚❚';
          });
        });
      } else {
        videoContainer.innerHTML = '';
      }

      var audioContainer = document.getElementById('lrAudio');
      if (audios.length > 0) {
        var pick = getRandom(audios, 1)[0];
        audioContainer.innerHTML =
          '<button class="lr-audio-play" id="lrAudioPlay">▶</button>' +
          '<div class="lr-audio-track">' +
          '<div class="lr-audio-label">A word in passing — ' + pick.replace(/^.*[\\\/]/, '') + '</div>' +
          '<div class="lr-audio-progress" id="lrAudioProgress">' +
          '<div class="lr-audio-bar" id="lrAudioBar"></div>' +
          '</div>' +
          '</div>' +
          '<div class="lr-audio-time" id="lrAudioTime">0:00 / 0:00</div>' +
          '<audio id="lrAudioEl" preload="metadata">' +
          '<source src="' + pick + '" type="audio/mpeg">' +
          '</audio>';

        currentAudio = document.getElementById('lrAudioEl');
        var playBtn = document.getElementById('lrAudioPlay');
        var progress = document.getElementById('lrAudioProgress');
        var bar = document.getElementById('lrAudioBar');
        var time = document.getElementById('lrAudioTime');

        playBtn.addEventListener('click', function() {
          if (currentAudio.paused) {
            currentAudio.play();
            this.textContent = '❚❚';
            audioContainer.classList.add('playing');
          } else {
            currentAudio.pause();
            this.textContent = '▶';
            audioContainer.classList.remove('playing');
          }
        });

        currentAudio.addEventListener('timeupdate', function() {
          var pct = (this.currentTime / this.duration) * 100;
          bar.style.width = pct + '%';
          time.textContent = formatTime(this.currentTime) + ' / ' + formatTime(this.duration);
        });

        currentAudio.addEventListener('ended', function() {
          playBtn.textContent = '▶';
          bar.style.width = '0%';
          audioContainer.classList.remove('playing');
        });

        currentAudio.addEventListener('loadedmetadata', function() {
          time.textContent = '0:00 / ' + formatTime(this.duration);
        });

        progress.addEventListener('click', function(e) {
          var rect = this.getBoundingClientRect();
          var pct = (e.clientX - rect.left) / rect.width;
          currentAudio.currentTime = pct * currentAudio.duration;
        });
      } else {
        audioContainer.innerHTML = '';
      }
    }

    var shuffleBtn = document.getElementById('lrShuffle');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', function() {
        this.style.transform = 'rotate(360deg)';
        setTimeout(function() { this.style.transform = ''; }.bind(this), 400);

        var room = document.getElementById('listeningRoom');
        if (room) {
          room.style.opacity = '0.6';
          setTimeout(function() {
            render();
            room.style.opacity = '1';
          }, 200);
        }
      });
    }

    loadManifest();
  })();

  /* ── NotebookLM Demo ───────────────────────────────────── */
  (function() {
    var qaData = [
      {
        q: "Why does NIGHT feel deeper than NITE?",
        a: "<strong>NIGHT</strong> = N(continue) + T(mark) + GH(silent: grow+breath). The silent GH holds growth and breath without sounding — depth held in reserve. <strong>NITE</strong> lacks this hidden architecture. The silent consonant is what I call an Exclusion Anchor: meaning present but unheard. This is not historical accident. It is a biomechanical execution of suppressed mathematics — the wall is built but never opened. <em>(Chapter 9 · The Silent Consonants)</em>"
      },
      {
        q: "What is frozen conflict, and why does it become mass?",
        a: "When two postulates collide — 'I must speak' and 'I must stay hidden' both running at full intensity — the system cannot process the paradox. Four characteristics emerge: <strong>identification</strong> (things collapse into each other), <strong>motionlessness</strong> (no progress possible), <strong>timelessness</strong> (the structure does not age), and <strong>mass</strong> (frozen postulate conflict made physical). MASS = Material + Spread + Spread. Your psychological baggage is not metaphorical. It is literal mass. <em>(Chapter 16 · The Physics of Frozen Conflict)</em>"
      },
      {
        q: "How does the consonant code prove it is not coincidence?",
        a: "Three converging layers eliminate chance: <strong>Layer 1</strong> — Individual consonant identity (B = boundary, M = material). <strong>Layer 2</strong> — Articulation point: B, P, M all produced at the lips, the boundary domain. <strong>Layer 3</strong> — Manner of production: B is a stop (closure + release), the purest boundary. When all three layers say the same thing, the result is not cherry-picking. It is executable architecture. Statistical confidence ranges from 67% to 85% across 22 consonant systems — four to eight times above random chance. <em>(Chapter 7 · The Three Dimensions of Every Consonant)</em>"
      },
      {
        q: "What is the Verb Illusion, and why does grammar hide reality?",
        a: "The verb is the Exclusion Anchor of language. When you say 'John signed the contract,' the verb 'signed' hides the existence of the signature as a thing. When you say 'I am depressed,' you use a verb to hide the existence of a noun — a bounded mass of frozen conflict. Un-confound the language: 'The depression in me.' Suddenly it is a thing. It has location. It can be examined. To speak in nouns is to make reality visible. To speak in verbs is to hide it. <em>(Chapter 13 · The Verb Illusion)</em>"
      },
      {
        q: "What is the Unified Chain, and how does it connect mathematics to the body?",
        a: "Six links, each shown: <strong>1.</strong> Mathematics is the only objective phenomenon. <strong>2.</strong> The mouth's physical actions are mathematical in their precision. <strong>3.</strong> The meanings carried by those actions are not arbitrary. <strong>4.</strong> Consciousness generates postulates — source-level commands. <strong>5.</strong> When postulates conflict, they generate frozen states with four characteristics. <strong>6.</strong> Silent consonants carry meaning without sound; the verb hides existence-claims inside actions. This is not six separate claims. It is one claim seen from six angles. Your mouth is the 3D printer that can rewrite it all. <em>(Chapter 17 · The Unified Chain)</em>"
      },
      {
        q: "How can I verify the consonant code myself?",
        a: "Six tests, all passing: <strong>Test A</strong> — Single-Consonant Isolation: all consonants show core meaning in isolation. <strong>Test B</strong> — All-Positions Test: core meanings invariant across positions. <strong>Test C</strong> — Cluster Test: clusters yield sum of components. <strong>Test D</strong> — Complete Word Decoding: decoded meanings match dictionary definitions. <strong>Test E</strong> — Silent Consonant Test: silent consonants contribute core meaning. <strong>Test F</strong> — Positional Function Refinement: positional functions consistently applied. 100% internal consistency confirmed. The code is not a belief system. It is a discovery. Test it yourself. <em>(Appendix L · Verification and Refinement Tests)</em>"
      }
    ];

    var chat = document.getElementById('nlmChat');
    var isTyping = false;

    function createMessage(role, content) {
      var wrapper = document.createElement('div');
      wrapper.className = 'nlm-msg nlm-msg--' + role;

      var bubble = document.createElement('div');
      bubble.className = 'nlm-bubble';

      if (role === 'user') {
        bubble.innerHTML = '<span class="nlm-q-icon">⁉️</span> ' + content;
        wrapper.appendChild(bubble);
        chat.appendChild(wrapper);
        scrollToBottom();
        return Promise.resolve();
      }

      var avatar = document.createElement('div');
      avatar.className = 'nlm-avatar';
      avatar.textContent = '💎';
      wrapper.appendChild(avatar);
      wrapper.appendChild(bubble);
      chat.appendChild(wrapper);

      return typewriter(bubble, content);
    }

    function typewriter(element, html) {
      return new Promise(function(resolve) {
        isTyping = true;
        element.classList.add('nlm-bubble--typing');

        var temp = document.createElement('div');
        temp.innerHTML = html;
        var text = temp.textContent;
        var fullHTML = html;

        var i = 0;
        element.textContent = '';

        var revealInterval = setInterval(function() {
          i += 3;
          if (i >= text.length) {
            clearInterval(revealInterval);
            element.innerHTML = fullHTML;
            element.classList.remove('nlm-bubble--typing');
            isTyping = false;
            scrollToBottom();
            resolve();
          } else {
            element.textContent = text.substring(0, i) + '▌';
            scrollToBottom();
          }
        }, 12);
      });
    }

    function scrollToBottom() {
      if (chat) chat.scrollTop = chat.scrollHeight;
    }

    function wait(ms) {
      return new Promise(function(r) { setTimeout(r, ms); });
    }

    async function runDemo() {
      await createMessage('user', qaData[0].q);
      await wait(400);
      await createMessage('ai', qaData[0].a);

      for (var i = 1; i < qaData.length; i++) {
        await wait(5000 + (i * 800));
        await createMessage('user', qaData[i].q);
        await wait(600);
        await createMessage('ai', qaData[i].a);
      }

      await wait(4000);
      await createMessage('ai', '<strong>Want to ask your own question?</strong> The real NotebookLM lets you upload The White Book and query it directly — with grounded citations for every answer. <a href="https://notebooklm.google.com/notebook/52395bfd-c265-4690-9c2d-bcd7618a0f8b?utm_source=nlmm_share" target="_blank" style="color:var(--gold);">Open the notebook →</a>');
    }

    var demoSection = document.getElementById('notebooklm-demo');
    if (demoSection && chat) {
      var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (entry.isIntersecting && !window._nlmStarted) {
            window._nlmStarted = true;
            runDemo();
            observer.disconnect();
          }
        });
      }, { threshold: 0.3 });
      observer.observe(demoSection);
    }
  })();

})();