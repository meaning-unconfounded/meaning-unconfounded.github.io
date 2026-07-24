/**
 * THE WHITE BOOK — Complete JavaScript
 * All features: theme, sidebar, progress, scrollspy, search, TOC, parables,
 * Listening Room, Key System (20 cards), NotebookLM demo
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

  /* ── LISTENING ROOM ────────────────────────────────────── */
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

  /* ── KEY SYSTEM (20 Cards) ─────────────────────────────── */
  (function() {
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
  })();

  /* ── NOTEBOOKLM DEMO ───────────────────────────────────── */
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
    if (!chat) return;

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

/* ── APPENDIX Q: INTERACTIVE DECODER ───────────────────────── */
(function() {
  "use strict";

  const decoderDictionary = {
    // ── White Book core terms ──
    "word": { hebrewRoot: "MILA", hebrewChars: "מילה", hebrewMeaning: "WORD", traditional: "Anglo Saxon – WORD = WORD, SPEECH", notes: "", architecture: "W+R+D", insight: "Connecting radiance directed-arrival — a word connects a radiance and delivers it to a destination.", bookRef: "#mu-app-m" },
    "postulate": { hebrewRoot: "P+S+T+L+T", hebrewChars: "", hebrewMeaning: "Project + Spread + Mark + Lateral + Mark", traditional: "Decoded from consonant architecture", notes: "", architecture: "P+S+T+L+T", insight: "Projected outward, spreads through the system, marks, flows laterally, and marks again.", bookRef: "#mu-ch15" },
    "consciousness": { hebrewRoot: "C+N+S+C+S+N+S+S", hebrewChars: "", hebrewMeaning: "Containing continuing spreading", traditional: "Decoded from consonant architecture", notes: "A field that contains its own continuation and spreading.", architecture: "C+N+S+C+S+N+S+S", insight: "A field that contains its own continuation, that contains its own spreading, that continues to spread — aware of itself.", bookRef: "#mu-ch10" },
    "truth": { hebrewRoot: "T+R+T+H", hebrewChars: "", hebrewMeaning: "Marked radiance marking breath", traditional: "Decoded from consonant architecture", notes: "Truth is marked radiance that crosses the threshold.", architecture: "T+R+T+H", insight: "Marked radiance that crosses the threshold — a mark that does not stop radiating.", bookRef: "#mu-ch10" },
    "meaning": { hebrewRoot: "M+N+N+G", hebrewChars: "", hebrewMeaning: "Material continuing rising", traditional: "Decoded from consonant architecture", notes: "", architecture: "M+N+N+G", insight: "Material that continues to rise — meaning is the substance that persists and grows.", bookRef: "#mu-ch10" },
    "mind": { hebrewRoot: "M+N+D", hebrewChars: "", hebrewMeaning: "Material continuing direct", traditional: "Decoded from consonant architecture", notes: "", architecture: "M+N+D", insight: "Material that continues to directed knowing — the mind is the substance that persists in knowing.", bookRef: "#mu-app-m" },
    "reality": { hebrewRoot: "R+L+T+Y", hebrewChars: "", hebrewMeaning: "Radiate lateral mark deed", traditional: "Decoded from consonant architecture", notes: "", architecture: "R+L+T+Y", insight: "Reality radiates, flows laterally, marks, and acts.", bookRef: "#mu-app-m" },
    "remember": { hebrewRoot: "R+M+M+B+R", hebrewChars: "", hebrewMeaning: "Radiate material material boundary radiate", traditional: "Decoded from consonant architecture", notes: "Memory is radiance made material and held.", architecture: "R+M+M+B+R", insight: "Radiating material, material bounded, radiating — memory is experience made material and held, still glowing.", bookRef: "#mu-app-m" },
    "spread": { hebrewRoot: "S+P+R+D", hebrewChars: "", hebrewMeaning: "Spread project radiate direct", traditional: "Decoded from consonant architecture", notes: "", architecture: "S+P+R+D", insight: "Spreading projection that arrives at a destination.", bookRef: "#mu-app-m" },
    "spray": { hebrewRoot: "S+P+R+Y", hebrewChars: "", hebrewMeaning: "Spread project radiate deed", traditional: "Decoded from consonant architecture", notes: "", architecture: "S+P+R+Y", insight: "Spreading projection that continues — the energy keeps going.", bookRef: "#mu-app-m" },
    "destroy": { hebrewRoot: "D+S+T+R+Y", hebrewChars: "", hebrewMeaning: "Direct spread mark radiate deed", traditional: "Decoded from consonant architecture", notes: "", architecture: "D+S+T+R+Y", insight: "Directed spreading that marks and radiates — the overturning of form.", bookRef: "#mu-app-m" },
    "existence": { hebrewRoot: "X+S+T+N+C", hebrewChars: "", hebrewMeaning: "Compound + Spread + Mark + Continue + Contain", traditional: "Decoded from consonant architecture", notes: "Existence is spreading, marking, continuing containment.", architecture: "X+S+T+N+C", insight: "Spreading, marking, continuing containment — the ongoing act of being marked into form.", bookRef: "#mu-app-m" },

    // ── From origin_dictionary.html ──
    "able": { hebrewRoot: "BAL", hebrewChars: "בעל", hebrewMeaning: "ABLE, POSSESS", traditional: "Latin – HABILIS = SUITABLE, FIT.", notes: "", architecture: "B+L", insight: "Boundary + Lateral — ability as contained, guided capacity.", bookRef: "" },
    "abraham": { hebrewRoot: "AVRA KEDIBRA", hebrewChars: "עברה כדיברה", hebrewMeaning: "HAPPENED AS SPOKEN", traditional: "Cabalistic word or formula with magic power.", notes: "In effect a blessing: 'happened as spoken.'", architecture: "A+V+R+K+D+B+R", insight: "Vocal act radiating, contained deed spreading — the word becomes reality.", bookRef: "" },
    "agony": { hebrewRoot: "YAGON", hebrewChars: "יגון", hebrewMeaning: "AGONY", traditional: "Greek – AGONIA = TO STRUGGLE FOR PRICE.", notes: "The Hebrew word YAGON has the identical meaning.", architecture: "Y+G+N", insight: "Act + Grow + Continue — the deed that grows and continues in suffering.", bookRef: "" },
    "air": { hebrewRoot: "AWIR", hebrewChars: "אוויר", hebrewMeaning: "AIR", traditional: "Greek – AER = AIR, MIST.", notes: "", architecture: "R", insight: "Radiate — air is radiance, the medium that carries wave and breath.", bookRef: "" },
    "amen": { hebrewRoot: "AMEN", hebrewChars: "אמן", hebrewMeaning: "BELIEVE", traditional: "Hebrew AMEN = TRULY, CERTAINLY.", notes: "A biblical word borrowed from Hebrew.", architecture: "M+N", insight: "Material + Continue — belief is substance that continues, that endures as certainty.", bookRef: "" },
    "atom": { hebrewRoot: "ATOOM", hebrewChars: "אטום", hebrewMeaning: "HERMETICALLY CLOSED", traditional: "Greek – ATOMOS = ATOM and INDIVISIBLE.", notes: "The Hebrew meaning is still correct after 2600 years.", architecture: "T+M", insight: "Mark + Material — the closed material, the indivisible point.", bookRef: "" },
    "bad": { hebrewRoot: "BAD", hebrewChars: "בד", hebrewMeaning: "FABRIC, SHEETING", traditional: "German – BETT or BEET = A BED or A PLAT OF GROUND.", notes: "", architecture: "B+D", insight: "Boundary + Direct — the fabric that bounds and directs, the woven structure.", bookRef: "" },
    "believe": { hebrewRoot: "B'LEV", hebrewChars: "ב-לב", hebrewMeaning: "IN HEART", traditional: "Anglo Saxon – GELEFAN = TO BELIEVE.", notes: "", architecture: "B+L+V", insight: "Boundary + Lateral + Connection-through-vibration — belief is held in the heart, the vibrating centre.", bookRef: "" },
    "bone": { hebrewRoot: "BONEH", hebrewChars: "בונה", hebrewMeaning: "BUILDER (of body cells)", traditional: "Anglo Saxon – BAN = BONE.", notes: "All body cells are manufactured in the bone.", architecture: "B+N", insight: "Boundary + Continue — bone is the enduring boundary, the builder that continues.", bookRef: "" },
    "camera": { hebrewRoot: "K'MERA", hebrewChars: "כ מראה", hebrewMeaning: "LIKE A MIRROR", traditional: "Greek – KAMERA = A VAULTED CHAMBER.", notes: "The Hebrew K'MERA = LIKE A CAVE.", architecture: "C+M+R", insight: "Contain + Material + Radiate — the chamber that contains and radiates light, like a mirror.", bookRef: "" },
    "color": { hebrewRoot: "KOL OR", hebrewChars: "קול אור", hebrewMeaning: "VOICE LIGHT", traditional: "Old Latin – COLOS = COLOR, A COVERING.", notes: "All color is light.", architecture: "C+L+R", insight: "Contain + Lateral + Radiate — colour is contained, lateral radiance, the voice of light.", bookRef: "" },
    "create": { hebrewRoot: "KARA ET", hebrewChars: "קרא את", hebrewMeaning: "CALLED A-Z", traditional: "Sanskrit – KAR = TO MAKE.", notes: "The form of creation in Genesis was the 'calling out' of words.", architecture: "C+R+T", insight: "Contain + Radiate + Mark — creation is the contained radiance that marks, the calling that brings forth.", bookRef: "#mu-app-m" },
    "devil": { hebrewRoot: "DA AVEL", hebrewChars: "דע עוול", hebrewMeaning: "KNOW EVIL", traditional: "Greek – DIABOLOS = THE DEVIL, literally A SLANDERER.", notes: "", architecture: "D+V+L", insight: "Direct + Connection-through-vibration + Lateral — the one who knows evil, the slanderer who spreads it laterally.", bookRef: "" },
    "dna": { hebrewRoot: "DIN A", hebrewChars: "דין-א", hebrewMeaning: "THE JUDGEMENT OF GOD", traditional: "DEOXY-RIBONUCLEIC ACID.", notes: "The Hebrew RIBON COL CO means RULER OF ALL.", architecture: "D+N", insight: "Direct + Continue — the judgement that continues, the code that directs life.", bookRef: "" },
    "echo": { hebrewRoot: "HIKA", hebrewChars: "חיקה", hebrewMeaning: "IMITATES", traditional: "Greek – ECHO = A REVERBERATED SOUND.", notes: "", architecture: "C+H", insight: "Contain + Breath — the contained breath that returns, the imitation of sound.", bookRef: "" },
    "electric": { hebrewRoot: "LEKET OR", hebrewChars: "לקט אור", hebrewMeaning: "COLLECTION OF LIGHT", traditional: "Greek – ELEKTRON = AMBER.", notes: "", architecture: "L+C+T+R", insight: "Lateral + Contain + Mark + Radiate — the collection of light, the flow that contains and marks radiance.", bookRef: "" },
    "evil": { hebrewRoot: "AVEL", hebrewChars: "עוול", hebrewMeaning: "EVIL", traditional: "Anglo Saxon – YFEL = EVIL.", notes: "", architecture: "V+L", insight: "Connection-through-vibration + Lateral — evil is connection that flows sideways, that distorts.", bookRef: "" },
    "eye": { hebrewRoot: "AYIN", hebrewChars: "עין", hebrewMeaning: "EYE", traditional: "Anglo Saxon – EAGE plural of EAGAN = EYE.", notes: "", architecture: "Y+N", insight: "Act + Continue — the eye is the act of seeing, the continuation of light into form.", bookRef: "" },
    "fear": { hebrewRoot: "PO YAR", hebrewChars: "פה ירא", hebrewMeaning: "HERE FEARED", traditional: "Anglo Saxon – FAER = FEAR, TERROR.", notes: "", architecture: "F+R", insight: "Flow + Radiate — fear flows and radiates, the cold contraction of the self.", bookRef: "" },
    "fire": { hebrewRoot: "PO OR", hebrewChars: "פה אור", hebrewMeaning: "HERE LIGHT", traditional: "Anglo Saxon – FYR = FIRE.", notes: "", architecture: "F+R", insight: "Flow + Radiate — fire is flowing radiance, the light that moves and consumes.", bookRef: "" },
    "genius": { hebrewRoot: "GAON YESH", hebrewChars: "גאון יש", hebrewMeaning: "GENIUS THERE IS", traditional: "Latin – GENIUS = THE GUARDIAN DEITY or SPIRIT.", notes: "", architecture: "G+N+S", insight: "Grow + Continue + Spread — genius is growth that continues to spread, the emanating spirit.", bookRef: "" },
    "globe": { hebrewRoot: "AGOL BO", hebrewChars: "עגול בו", hebrewMeaning: "ROUND", traditional: "Latin – GLOBUS = A BALL, SPHERE.", notes: "", architecture: "G+L+B", insight: "Grow + Lateral + Boundary — the globe is growth that flows laterally within a boundary, the sphere.", bookRef: "" },
    "life": { hebrewRoot: "HAVAH", hebrewChars: "חוה", hebrewMeaning: "FARM / DESIRE", traditional: "Hebrew – HAWWAH = perhaps LIFE.", notes: "HAVA means A FARM. EVE means DESIRE.", architecture: "L+F", insight: "Lateral + Flow — life is the lateral flow, the desire that moves and grows.", bookRef: "" },
    "light": { hebrewRoot: "LAHAT", hebrewChars: "להט", hebrewMeaning: "FLAME", traditional: "Anglo Saxon – LEOHT = LIGHT.", notes: "", architecture: "L+G+H+T", insight: "Lateral + Grow + Breath + Mark — light is lateral, growing breath that marks, the flame that illuminates.", bookRef: "#mu-app-m" },
    "love": { hebrewRoot: "LAHOVE, LEV", hebrewChars: "לב", hebrewMeaning: "TO LOVE, HEART", traditional: "Anglo Saxon – LUFU, LUFE = LOVE.", notes: "", architecture: "L+V", insight: "Lateral + Connection-through-vibration — love is the lateral vibration, the connection from the heart.", bookRef: "#mu-app-m" },
    "mirror": { hebrewRoot: "MARA OR", hebrewChars: "מראה אור", hebrewMeaning: "MIRRORS LIGHT", traditional: "Latin – MIRARI = TO WONDER AT.", notes: "", architecture: "M+R+R", insight: "Material + Radiate + Radiate — the mirror is material that radiates light back, the reflection.", bookRef: "" },
    "money": { hebrewRoot: "MONEH", hebrewChars: "מונה", hebrewMeaning: "COUNTING DEVICE", traditional: "Latin – MONETA = A MINT, MONEY.", notes: "", architecture: "M+N", insight: "Material + Continue — money is material that continues as a measure, a counting device.", bookRef: "" },
    "oxygen": { hebrewRoot: "OSEH GAN", hebrewChars: "עושה גן", hebrewMeaning: "GARDEN MAKER", traditional: "Greek – OXYS = ACID and GENNAN = TO GENERATE.", notes: "", architecture: "X+Y+G+N", insight: "Compound + Act + Grow + Continue — oxygen is the act of growing, the garden maker.", bookRef: "" },
    "satan": { hebrewRoot: "SATAN", hebrewChars: "שטן", hebrewMeaning: "VEER OFF THE PATH", traditional: "Hebrew – SATAN = ENEMY.", notes: "", architecture: "S+T+N", insight: "Spread + Mark + Continue — Satan is the spread that marks deviation, the veering off the path.", bookRef: "" },
    "spirit": { hebrewRoot: "SEFIROT", hebrewChars: "ספירות", hebrewMeaning: "COUNTING, STORIES OF GOD", traditional: "Latin – SPIRITUS = BREATH, COURAGE, VIGOR, THE SOUL, LIFE.", notes: "The ten emanations that created the universe are called SEFIROT.", architecture: "S+P+R+T", insight: "Spread + Project + Radiate + Mark — spirit is the spreading, projecting radiance that marks the soul.", bookRef: "#mu-app-m" },
    "acquire": { hebrewRoot: "KARA", hebrewChars: "כרה", hebrewMeaning: "PURCHASED", traditional: "Latin – ACQUIRERE = TO SEEK.", notes: "", architecture: "C+R", insight: "Contain + Radiate — acquisition is the contained radiance of seeking and obtaining.", bookRef: "" },
    "add": { hebrewRoot: "OD", hebrewChars: "עוד", hebrewMeaning: "MORE", traditional: "Latin – AD = TO and DARE = GIVE.", notes: "", architecture: "D", insight: "Direct — to add is to direct more toward, to give beyond.", bookRef: "" },
    "admit": { hebrewRoot: "ED EMET", hebrewChars: "ה(ע)יד (א)מת", hebrewMeaning: "WITNESS OF TRUTH", traditional: "Latin – ED = TO and MITTERE = TO SEND.", notes: "", architecture: "D+M+T", insight: "Direct + Material + Mark — to admit is to direct the mark of truth, to send it forward.", bookRef: "" },
    "afraid": { hebrewRoot: "PO HARAD", hebrewChars: "פה רד", hebrewMeaning: "HERE FEARED(TREMBLED)", traditional: "Middle-English – AFRAIEN = TO FRIGHTEN.", notes: "", architecture: "F+R+D", insight: "Flow + Radiate + Direct — fear is flow that radiates and directs, the trembling here.", bookRef: "" },
    "ash": { hebrewRoot: "ESH", hebrewChars: "אש", hebrewMeaning: "FIRE", traditional: "Anglo Saxon – ASCE, AESC.", notes: "", architecture: "S+H", insight: "Spread + Breath — ash is the spread of breath after fire, the remains.", bookRef: "" },
    "assure": { hebrewRoot: "ISHURE", hebrewChars: "אישור", hebrewMeaning: "APPROVE, AUTHORISED", traditional: "Latin – ASSECURARE = TO ASSURE.", notes: "", architecture: "S+R", insight: "Spread + Radiate — assurance is the spread of radiance, the confirmation that radiates.", bookRef: "" },
    "avoid": { hebrewRoot: "AVAD", hebrewChars: "אבד", hebrewMeaning: "LOST, ASTRAY", traditional: "Latin – EX = OUT VIDUARE = DEPRIVE OFF.", notes: "", architecture: "V+D", insight: "Connection-through-vibration + Direct — to avoid is to direct vibration away, to steer astray.", bookRef: "" },
    "aware": { hebrewRoot: "ER", hebrewChars: "ער", hebrewMeaning: "AWARE", traditional: "Anglo Saxon – GEWAER = AWARE.", notes: "", architecture: "W+R", insight: "Connect + Radiate — awareness is the connection that radiates, the sensing of what is.", bookRef: "" },
    "band": { hebrewRoot: "BO ANAD", hebrewChars: "בה ענד", hebrewMeaning: "IN IT TIED UP", traditional: "Sanskrit – BANDHA = A BINDING.", notes: "", architecture: "B+N+D", insight: "Boundary + Continue + Direct — a band is a boundary that continues to direct, a tie that binds.", bookRef: "" },
    "bind": { hebrewRoot: "BO ANAD", hebrewChars: "בה ענד", hebrewMeaning: "IN IT TIED UP", traditional: "Anglo Saxon – BINDAN = TO BIND.", notes: "", architecture: "B+N+D", insight: "Boundary + Continue + Direct — to bind is to create a continuing boundary that directs.", bookRef: "" },
    "bitter": { hebrewRoot: "MAR", hebrewChars: "מר", hebrewMeaning: "BITTER", traditional: "Latin – AMARUS = BITTER.", notes: "", architecture: "B+T+R", insight: "Boundary + Mark + Radiate — bitter is the marked boundary that radiates, the sharp taste.", bookRef: "" },
    "blame": { hebrewRoot: "BLI EMET", hebrewChars: "בלי אמת", hebrewMeaning: "WITHOUT TRUTH", traditional: "Latin – BLASPHEMARE = TO BLASPHEME.", notes: "", architecture: "B+L+M", insight: "Boundary + Lateral + Material — blame is the bounded, lateral material that lacks truth.", bookRef: "" },
    "bloom": { hebrewRoot: "BLI EMET", hebrewChars: "בלי אמת", hebrewMeaning: "WITHOUT TRUTH", traditional: "Old Norse – BLOM = FLOWER.", notes: "", architecture: "B+L+M", insight: "Boundary + Lateral + Material — bloom is the lateral material that flowers, that grows out.", bookRef: "" },
    "bold": { hebrewRoot: "BLI EMET", hebrewChars: "בלי אמת", hebrewMeaning: "WITHOUT TRUTH", traditional: "Old Norse – BALLR = BOLD, DARING.", notes: "", architecture: "B+L+D", insight: "Boundary + Lateral + Direct — bold is the directed, lateral boundary that dares.", bookRef: "" },
    "break": { hebrewRoot: "BARATZ", hebrewChars: "ברץ", hebrewMeaning: "BURST, BROKEN THROUGH", traditional: "Anglo Saxon – BRECAN = TO BREAK.", notes: "", architecture: "B+R+K", insight: "Boundary + Radiate + Contain — to break is to radiate through the boundary, to burst.", bookRef: "" },
    "breed": { hebrewRoot: "BRYH", hebrewChars: "ברכה", hebrewMeaning: "POOL", traditional: "Anglo Saxon – BREDAN = TO BREED.", notes: "", architecture: "B+R+D", insight: "Boundary + Radiate + Direct — to breed is to direct radiance into new form, to multiply.", bookRef: "" },
    "bright": { hebrewRoot: "BAHIR ET", hebrewChars: "בהיר את", hebrewMeaning: "BRIGHT", traditional: "Sanskrit – BHARJ = TO SHINE.", notes: "", architecture: "B+R+G+H+T", insight: "Boundary + Radiate + Grow + Breath + Mark — brightness is the boundary that radiates, grows, and marks with breath.", bookRef: "" },
    "burn": { hebrewRoot: "BARAN", hebrewChars: "בערן", hebrewMeaning: "BURN", traditional: "Icelandic – BRENNA = TO BURN.", notes: "", architecture: "B+R+N", insight: "Boundary + Radiate + Continue — to burn is to radiate continuously through a boundary, the fire that persists.", bookRef: "" },
    "call": { hebrewRoot: "KOL", hebrewChars: "קול", hebrewMeaning: "VOICE", traditional: "Icelandic – KALLA = TO SAY, CALL, NAME.", notes: "", architecture: "C+L", insight: "Contain + Lateral — a call is the contained lateral projection of voice, the name that reaches.", bookRef: "" },
    "case": { hebrewRoot: "KISA", hebrewChars: "כיסוי", hebrewMeaning: "COVER (HOUSING)", traditional: "Latin – CAPSA = A BOX, CHEST.", notes: "", architecture: "C+S", insight: "Contain + Spread — a case is the contained spread that houses, the cover that protects.", bookRef: "" },
    "cave": { hebrewRoot: "KUBA", hebrewChars: "קבה", hebrewMeaning: "CUBICAL, SMALL ROOM", traditional: "Latin – CAVA = CAVITY.", notes: "", architecture: "C+V", insight: "Contain + Connection-through-vibration — a cave is the contained vibration, the hollow space.", bookRef: "" },
    "cell": { hebrewRoot: "SAL", hebrewChars: "סוללה", hebrewMeaning: "BASKET, CELL", traditional: "Latin – CELLA = A SMALL ROOM.", notes: "", architecture: "C+L", insight: "Contain + Lateral — a cell is the contained lateral space, the small room that holds.", bookRef: "" },
    "chase": { hebrewRoot: "SHESA", hebrewChars: "שיסה", hebrewMeaning: "CHASE", traditional: "Latin – CAPTARE = TO STRIVE TO SEIZE.", notes: "", architecture: "C+H+S", insight: "Contain + Breath + Spread — to chase is to spread breath in containment, to pursue.", bookRef: "" },
    "clean": { hebrewRoot: "CHL", hebrewChars: "חל", hebrewMeaning: "EMPTY SPACE", traditional: "Anglo Saxon – CLANE = CLEAN, PURE.", notes: "", architecture: "C+L+N", insight: "Contain + Lateral + Continue — clean is the contained lateral continuation, the empty space purified.", bookRef: "" },
    "clear": { hebrewRoot: "CLR", hebrewChars: "כלר", hebrewMeaning: "VOICE LIGHT", traditional: "Latin – CLARUS = CLEAR, BRIGHT.", notes: "", architecture: "C+L+R", insight: "Contain + Lateral + Radiate — clear is the contained lateral radiance, the light that shines through.", bookRef: "" },
    "code": { hebrewRoot: "AKOOD", hebrewChars: "עקוד", hebrewMeaning: "KNOTTED", traditional: "Latin – CODEX = A WOODEN TABLET.", notes: "", architecture: "C+D", insight: "Contain + Direct — code is the contained, directed mark, the knotted instruction.", bookRef: "" },
    "cover": { hebrewRoot: "KAVOOR", hebrewChars: "קבור", hebrewMeaning: "BURIED", traditional: "Latin – COOPERIRE = TO HIDE.", notes: "", architecture: "C+V+R", insight: "Contain + Connection-through-vibration + Radiate — to cover is to contain vibration and radiate protection, to hide.", bookRef: "" },
    "cup": { hebrewRoot: "CUP", hebrewChars: "כוס", hebrewMeaning: "VESSEL", traditional: "Latin – CUPPA = A CUP.", notes: "", architecture: "C+P", insight: "Contain + Project — a cup is the contained projection that holds liquid.", bookRef: "" },
    "cut": { hebrewRoot: "CATA", hebrewChars: "קטע", hebrewMeaning: "CUT", traditional: "Middle English – CUTTEN = TO CUT.", notes: "", architecture: "C+T", insight: "Contain + Mark — to cut is to mark containment, to sever with a mark.", bookRef: "" },
    "dare": { hebrewRoot: "DAR", hebrewChars: "דער", hebrewMeaning: "KNOW FEAR", traditional: "Latin – DARE = TO GIVE.", notes: "", architecture: "D+R", insight: "Direct + Radiate — to dare is to direct radiance, to give boldly.", bookRef: "" },
    "dark": { hebrewRoot: "DARK", hebrewChars: "דרך", hebrewMeaning: "DIRECT", traditional: "Anglo Saxon – DEORC = DARK.", notes: "", architecture: "D+R+K", insight: "Direct + Radiate + Contain — dark is directed radiance that is contained, the absence of light.", bookRef: "" },
    "death": { hebrewRoot: "DV", hebrewChars: "דעו", hebrewMeaning: "KNOW EVIL", traditional: "Anglo Saxon – DEATH = DEATH.", notes: "", architecture: "D+T+H", insight: "Direct + Mark + Breath — death is the direct marking of breath, the cessation.", bookRef: "" },
    "deep": { hebrewRoot: "DEEP", hebrewChars: "דעפ", hebrewMeaning: "KNOW FLOW", traditional: "Anglo Saxon – DEOP = DEEP.", notes: "", architecture: "D+P", insight: "Direct + Project — deep is the direct projection downward, the great depth.", bookRef: "" },
    "delay": { hebrewRoot: "DELAY", hebrewChars: "דלי", hebrewMeaning: "PULL OUT, THIN OUT", traditional: "Latin – DELAY = TO PUT OFF.", notes: "", architecture: "D+L+Y", insight: "Direct + Lateral + Act — to delay is to direct the lateral act, to postpone.", bookRef: "" },
    "doubt": { hebrewRoot: "DBT", hebrewChars: "דבת", hebrewMeaning: "DOUBT", traditional: "Latin – DUBITARE = TO DOUBT.", notes: "", architecture: "D+B+T", insight: "Direct + Boundary + Mark — doubt is the directed boundary that marks uncertainty.", bookRef: "" },
    "dream": { hebrewRoot: "DRM", hebrewChars: "דרמ", hebrewMeaning: "DIRECT RADIATE", traditional: "Old Norse – DRAUGR = DREAM.", notes: "", architecture: "D+R+M", insight: "Direct + Radiate + Material — a dream is directed radiance made material, the vision that flows.", bookRef: "" },
    "drive": { hebrewRoot: "DRV", hebrewChars: "דרב", hebrewMeaning: "DIRECT RADIATE", traditional: "Anglo Saxon – DRIFAN = TO DRIVE.", notes: "", architecture: "D+R+V", insight: "Direct + Radiate + Connection-through-vibration — to drive is to direct radiance with vibration, to push forward.", bookRef: "" },
    "drop": { hebrewRoot: "DRP", hebrewChars: "דרפ", hebrewMeaning: "DIRECT RADIATE", traditional: "Anglo Saxon – DROPA = A DROP.", notes: "", architecture: "D+R+P", insight: "Direct + Radiate + Project — a drop is the direct projection of radiance, the falling.", bookRef: "" },
    "earth": { hebrewRoot: "ERT", hebrewChars: "ארץ", hebrewMeaning: "EARTH", traditional: "Anglo Saxon – EORTHE = EARTH.", notes: "", architecture: "R+T+H", insight: "Radiate + Mark + Breath — earth is the radiant, marked breath, the ground that supports.", bookRef: "" },
    "ease": { hebrewRoot: "EZ", hebrewChars: "אז", hebrewMeaning: "THEN", traditional: "Latin – EASE = EASE.", notes: "", architecture: "E+S", insight: "Vessel + Spread — ease is the spreading vessel, the comfort that flows.", bookRef: "" },
    "eat": { hebrewRoot: "ET", hebrewChars: "את", hebrewMeaning: "SIGN", traditional: "Anglo Saxon – ETAN = TO EAT.", notes: "", architecture: "T", insight: "Mark — to eat is to mark, to take in through the mouth's threshold.", bookRef: "" },
    "edge": { hebrewRoot: "EDG", hebrewChars: "עדג", hebrewMeaning: "WITNESS GROW", traditional: "Latin – EDGE = BORDER.", notes: "", architecture: "D+G", insight: "Direct + Grow — the edge is the direct growth, the border that defines.", bookRef: "" },
    "empty": { hebrewRoot: "EMPTY", hebrewChars: "אמפ", hebrewMeaning: "MATERIAL PROJECT", traditional: "Anglo Saxon – AEMTIG = EMPTY.", notes: "", architecture: "M+P+T+Y", insight: "Material + Project + Mark + Act — empty is the projected material marked for absence.", bookRef: "" },
    "end": { hebrewRoot: "END", hebrewChars: "ענד", hebrewMeaning: "TIE UP", traditional: "Anglo Saxon – ENDE = END.", notes: "", architecture: "N+D", insight: "Continue + Direct — the end is the continuation that arrives, the direct finish.", bookRef: "" },
    "energy": { hebrewRoot: "ENERGY", hebrewChars: "ענג", hebrewMeaning: "PLEASURE", traditional: "Greek – ENERGEIA = ACTIVE WORK.", notes: "", architecture: "N+R+G+Y", insight: "Continue + Radiate + Grow + Act — energy is the continuing, radiating growth of action.", bookRef: "" },
    "equal": { hebrewRoot: "HAKOL", hebrewChars: "הכול", hebrewMeaning: "EVERYTHING", traditional: "Latin – AEQUALIS = EQUAL.", notes: "", architecture: "Q+L", insight: "Contain+Connect + Lateral — equal is the contained connection that flows laterally, the same.", bookRef: "" },
    "escape": { hebrewRoot: "ESCAPE", hebrewChars: "עסקפ", hebrewMeaning: "FLOW PROJECT", traditional: "Latin – ESCAPE = TO FLEE.", notes: "", architecture: "S+C+P", insight: "Spread + Contain + Project — to escape is to spread from containment, to project away.", bookRef: "" },
    "even": { hebrewRoot: "EVEN", hebrewChars: "עוון", hebrewMeaning: "EVIL", traditional: "Anglo Saxon – EFE = EVEN.", notes: "", architecture: "V+N", insight: "Connection-through-vibration + Continue — even is the continuous vibration, the smooth, the flat.", bookRef: "" },
    "ever": { hebrewRoot: "EVER", hebrewChars: "עבר", hebrewMeaning: "OVER, PASSED", traditional: "Anglo Saxon – AEHRE = EVER.", notes: "", architecture: "V+R", insight: "Connection-through-vibration + Radiate — ever is the radiating vibration, the always.", bookRef: "" },
    "every": { hebrewRoot: "EVERY", hebrewChars: "עברי", hebrewMeaning: "OVER, PASSED", traditional: "Anglo Saxon – AEFRE = EVERY.", notes: "", architecture: "V+R+Y", insight: "Connection-through-vibration + Radiate + Act — every is the radiating act of connection, each one.", bookRef: "" },
    "evil": { hebrewRoot: "AVEL", hebrewChars: "עוול", hebrewMeaning: "EVIL", traditional: "Anglo Saxon – YFEL = EVIL.", notes: "", architecture: "V+L", insight: "Connection-through-vibration + Lateral — evil is connection that vibrates laterally, that distorts.", bookRef: "" },
    "exact": { hebrewRoot: "EXACT", hebrewChars: "עקסקט", hebrewMeaning: "CONTAIN SPREAD MARK", traditional: "Latin – EXACTUS = TO DEMAND.", notes: "", architecture: "X+C+T", insight: "Compound + Contain + Mark — exact is the contained mark that spreads precisely, the correct.", bookRef: "" },
    "exit": { hebrewRoot: "YATZA ET", hebrewChars: "יצא את", hebrewMeaning: "GO OUT", traditional: "Latin – EXITUS = TO GO OUT.", notes: "", architecture: "X+T", insight: "Compound + Mark — exit is the mark that spreads out, the departure.", bookRef: "" },
    "faint": { hebrewRoot: "FAINT", hebrewChars: "פע נ", hebrewMeaning: "WEAK", traditional: "Latin – FALL = TO FAIL.", notes: "", architecture: "F+N+T", insight: "Flow + Continue + Mark — faint is the continuing flow that marks weakness.", bookRef: "" },
    "fair": { hebrewRoot: "FAIR", hebrewChars: "פער", hebrewMeaning: "GAP", traditional: "Old High German – FER = FAIR.", notes: "", architecture: "F+R", insight: "Flow + Radiate — fair is the flowing radiance, the just, the beautiful.", bookRef: "" },
    "false": { hebrewRoot: "FALSE", hebrewChars: "פעלס", hebrewMeaning: "FAIL", traditional: "Latin – FALSUS = FALSE.", notes: "", architecture: "F+L+S", insight: "Flow + Lateral + Spread — false is the lateral spread of flow that deceives.", bookRef: "" },
    "fame": { hebrewRoot: "FAME", hebrewChars: "פאם", hebrewMeaning: "HERE MATERIAL", traditional: "Latin – FAMA = FAME, RUMOUR.", notes: "", architecture: "F+M", insight: "Flow + Material — fame is the flow of material, the rumour that spreads.", bookRef: "" },
    "father": { hebrewRoot: "FATHER", hebrewChars: "אב", hebrewMeaning: "FATHER", traditional: "Anglo Saxon – FAEDER = FATHER.", notes: "", architecture: "F+T+H+R", insight: "Flow + Mark + Breath + Radiate — father is the flowing mark that radiates breath, the source.", bookRef: "" },
    "fault": { hebrewRoot: "FAULT", hebrewChars: "פלט", hebrewMeaning: "DISCHARGE", traditional: "Latin – FALLERE = TO DECEIVE.", notes: "", architecture: "F+L+T", insight: "Flow + Lateral + Mark — fault is the lateral flow that marks error, the mistake.", bookRef: "" },
    "fear": { hebrewRoot: "FEAR", hebrewChars: "פער", hebrewMeaning: "FEAR", traditional: "Anglo Saxon – FAER = FEAR, TERROR.", notes: "", architecture: "F+R", insight: "Flow + Radiate — fear flows and radiates, the cold contraction.", bookRef: "" },
    "feed": { hebrewRoot: "FEED", hebrewChars: "פיד", hebrewMeaning: "FEED", traditional: "Anglo Saxon – FEDAN = TO FEED.", notes: "", architecture: "F+D", insight: "Flow + Direct — to feed is to direct flow, to nourish.", bookRef: "" },
    "feel": { hebrewRoot: "FEEL", hebrewChars: "פיל", hebrewMeaning: "PLEAD", traditional: "Anglo Saxon – FELAN = TO FEEL.", notes: "", architecture: "F+L", insight: "Flow + Lateral — to feel is the lateral flow of sensation, the touching.", bookRef: "" },
    "few": { hebrewRoot: "FEW", hebrewChars: "פעו", hebrewMeaning: "HERE CONNECT", traditional: "Anglo Saxon – FEWA = FEW.", notes: "", architecture: "F+W", insight: "Flow + Connect — few is the connecting flow that is small, the minor.", bookRef: "" },
    "field": { hebrewRoot: "FIELD", hebrewChars: "פילד", hebrewMeaning: "FLOW LATERAL DIRECT", traditional: "Anglo Saxon – FELD = FIELD.", notes: "", architecture: "F+L+D", insight: "Flow + Lateral + Direct — a field is the lateral flow that is directed, the open space.", bookRef: "" },
    "firm": { hebrewRoot: "FIRM", hebrewChars: "פרמ", hebrewMeaning: "PROJECT MATERIAL", traditional: "Latin – FIRMUS = FIRM, STRONG.", notes: "", architecture: "F+R+M", insight: "Flow + Radiate + Material — firm is the radiating material that flows strong, the solid.", bookRef: "" },
    "first": { hebrewRoot: "FIRST", hebrewChars: "פרשת", hebrewMeaning: "HERE FIRST", traditional: "Anglo Saxon – FYRST = FIRST.", notes: "", architecture: "F+R+S+T", insight: "Flow + Radiate + Spread + Mark — first is the radiating spread that marks the beginning.", bookRef: "" },
    "fish": { hebrewRoot: "FISH", hebrewChars: "פיש", hebrewMeaning: "SPREAD SHARP", traditional: "Anglo Saxon – FISC = FISH.", notes: "", architecture: "F+S+H", insight: "Flow + Spread + Breath — fish is the spread of flow that breathes, the swimmer.", bookRef: "" },
    "flame": { hebrewRoot: "FLAME", hebrewChars: "פלאם", hebrewMeaning: "FLOW LATERAL MATERIAL", traditional: "Latin – FLAMMA = FLAME.", notes: "", architecture: "F+L+M", insight: "Flow + Lateral + Material — flame is the lateral flow of material that burns.", bookRef: "" },
    "flash": { hebrewRoot: "FLASH", hebrewChars: "פלש", hebrewMeaning: "FLOW LATERAL SHARP", traditional: "Old High German – FLASCHE = FLASK.", notes: "", architecture: "F+L+S+H", insight: "Flow + Lateral + Spread + Breath — flash is the lateral spread of flow that breathes light.", bookRef: "" },
    "flat": { hebrewRoot: "FLAT", hebrewChars: "פלט", hebrewMeaning: "FLOW LATERAL MARK", traditional: "Old Norse – FLATR = FLAT.", notes: "", architecture: "F+L+T", insight: "Flow + Lateral + Mark — flat is the lateral flow that marks a level plane.", bookRef: "" },
    "fleet": { hebrewRoot: "FLEET", hebrewChars: "פליט", hebrewMeaning: "FLOW LATERAL PROJECT", traditional: "Anglo Saxon – FLOT = FLEET.", notes: "", architecture: "F+L+T", insight: "Flow + Lateral + Mark — fleet is the lateral flow that marks speed, the quick.", bookRef: "" },
    "flood": { hebrewRoot: "FLOOD", hebrewChars: "פלוד", hebrewMeaning: "FLOW LATERAL DIRECT", traditional: "Anglo Saxon – FLOD = FLOOD.", notes: "", architecture: "F+L+D", insight: "Flow + Lateral + Direct — flood is the directed lateral flow that overwhelms.", bookRef: "" },
    "floor": { hebrewRoot: "FLOOR", hebrewChars: "פלור", hebrewMeaning: "FLOW LATERAL RADIATE", traditional: "Anglo Saxon – FLOR = FLOOR.", notes: "", architecture: "F+L+R", insight: "Flow + Lateral + Radiate — floor is the lateral flow that radiates, the ground beneath.", bookRef: "" },
    "flower": { hebrewRoot: "FLOWER", hebrewChars: "פלור", hebrewMeaning: "FLOW LATERAL RADIATE", traditional: "Latin – FLOS = A FLOWER.", notes: "", architecture: "F+L+W+R", insight: "Flow + Lateral + Connect + Radiate — flower is the lateral flow that connects and radiates, the bloom.", bookRef: "" },
    "fluid": { hebrewRoot: "FLUID", hebrewChars: "פלויד", hebrewMeaning: "FLOW LATERAL ACT", traditional: "Latin – FLUIDUS = FLUID.", notes: "", architecture: "F+L+D", insight: "Flow + Lateral + Direct — fluid is the directed lateral flow, the liquid.", bookRef: "" },
    "flush": { hebrewRoot: "FLUSH", hebrewChars: "פלש", hebrewMeaning: "FLOW LATERAL SHARP", traditional: "Latin – FLUSH = TO RUSH.", notes: "", architecture: "F+L+S+H", insight: "Flow + Lateral + Spread + Breath — flush is the lateral spread of flow, the rush.", bookRef: "" },
    "fly": { hebrewRoot: "FLY", hebrewChars: "פלי", hebrewMeaning: "FLOW LATERAL ACT", traditional: "Anglo Saxon – FLEOGAN = TO FLY.", notes: "", architecture: "F+L+Y", insight: "Flow + Lateral + Act — to fly is the lateral act of flowing through air.", bookRef: "" },
    "foam": { hebrewRoot: "FOAM", hebrewChars: "פאם", hebrewMeaning: "HERE MATERIAL", traditional: "Anglo Saxon – FAM = FOAM.", notes: "", architecture: "F+M", insight: "Flow + Material — foam is the flow of material, the froth.", bookRef: "" },
    "follow": { hebrewRoot: "FOLLOW", hebrewChars: "פולו", hebrewMeaning: "FLOW LATERAL", traditional: "Anglo Saxon – FOLGIAN = TO FOLLOW.", notes: "", architecture: "F+L+W", insight: "Flow + Lateral + Connect — to follow is to connect with lateral flow, to pursue.", bookRef: "" },
    "food": { hebrewRoot: "FOOD", hebrewChars: "פוד", hebrewMeaning: "FLOW DIRECT", traditional: "Anglo Saxon – FODA = FOOD.", notes: "", architecture: "F+D", insight: "Flow + Direct — food is the directed flow of nourishment.", bookRef: "" },
    "fool": { hebrewRoot: "FOOL", hebrewChars: "פול", hebrewMeaning: "FLOW LATERAL", traditional: "Latin – FOLLIS = A FOOL.", notes: "", architecture: "F+L", insight: "Flow + Lateral — a fool is lateral flow that is misdirected, the simpleton.", bookRef: "" },
    "foot": { hebrewRoot: "FOOT", hebrewChars: "פוט", hebrewMeaning: "FLOW MARK", traditional: "Anglo Saxon – FOT = FOOT.", notes: "", architecture: "F+T", insight: "Flow + Mark — foot is the flow that marks, the walker.", bookRef: "" },
    "force": { hebrewRoot: "FORCE", hebrewChars: "פורס", hebrewMeaning: "FLOW RADIATE SPREAD", traditional: "Latin – FORTIS = STRONG.", notes: "", architecture: "F+R+C", insight: "Flow + Radiate + Contain — force is the radiating flow that contains power.", bookRef: "" },
    "forest": { hebrewRoot: "FOREST", hebrewChars: "פוריסט", hebrewMeaning: "FLOW RADIATE SPREAD MARK", traditional: "Latin – FORIS = OUTSIDE, DOOR.", notes: "", architecture: "F+R+S+T", insight: "Flow + Radiate + Spread + Mark — forest is the radiating spread that marks the wild.", bookRef: "" },
    "forge": { hebrewRoot: "FORGE", hebrewChars: "פורג", hebrewMeaning: "FLOW RADIATE GROW", traditional: "Latin – FORGERE = TO SHAPE.", notes: "", architecture: "F+R+G", insight: "Flow + Radiate + Grow — to forge is to grow radiance through flow, to shape.", bookRef: "" },
    "forget": { hebrewRoot: "FORGET", hebrewChars: "פרגט", hebrewMeaning: "FLOW RADIATE GROW MARK", traditional: "Anglo Saxon – FORGIETAN = TO FORGET.", notes: "", architecture: "F+R+G+T", insight: "Flow + Radiate + Grow + Mark — to forget is to mark growth that radiates away, the loss of memory.", bookRef: "" },
    "forgive": { hebrewRoot: "FORGIVE", hebrewChars: "פרגיב", hebrewMeaning: "FLOW RADIATE GROW VIBRATE", traditional: "Anglo Saxon – FORGIFAN = TO FORGIVE.", notes: "", architecture: "F+R+G+V", insight: "Flow + Radiate + Grow + Connection-through-vibration — to forgive is to vibrate growth that radiates, the release of debt.", bookRef: "" },
    "free": { hebrewRoot: "FREE", hebrewChars: "פרי", hebrewMeaning: "PROJECT RADIATE", traditional: "Anglo Saxon – FREO = FREE.", notes: "", architecture: "F+R", insight: "Flow + Radiate — free is the flowing radiance, the unbound.", bookRef: "" },
    "fresh": { hebrewRoot: "FRESH", hebrewChars: "פריש", hebrewMeaning: "PROJECT RADIATE SHARP", traditional: "Anglo Saxon – FRESC = FRESH.", notes: "", architecture: "F+R+S+H", insight: "Flow + Radiate + Spread + Breath — fresh is the radiating spread of flow that breathes, the new.", bookRef: "" },
    "friend": { hebrewRoot: "FRIEND", hebrewChars: "פרינד", hebrewMeaning: "PROJECT RADIATE CONTINUE DIRECT", traditional: "Anglo Saxon – FREOND = FRIEND.", notes: "", architecture: "F+R+N+D", insight: "Flow + Radiate + Continue + Direct — friend is the directed continuation of radiating flow, the ally.", bookRef: "" },
    "fright": { hebrewRoot: "FRIGHT", hebrewChars: "פריגט", hebrewMeaning: "PROJECT RADIATE GROW MARK", traditional: "Anglo Saxon – FRYHTU = FRIGHT.", notes: "", architecture: "F+R+G+H+T", insight: "Flow + Radiate + Grow + Breath + Mark — fright is the marked growth of radiating flow, the fear.", bookRef: "" },
    "frost": { hebrewRoot: "FROST", hebrewChars: "פרוסט", hebrewMeaning: "PROJECT RADIATE SPREAD MARK", traditional: "Anglo Saxon – FROST = FROST.", notes: "", architecture: "F+R+S+T", insight: "Flow + Radiate + Spread + Mark — frost is the radiating spread that marks the cold, the ice.", bookRef: "" },
    "frozen": { hebrewRoot: "FROZEN", hebrewChars: "פרוזן", hebrewMeaning: "PROJECT RADIATE MATERIAL CONTINUE", traditional: "Anglo Saxon – FROSEN = FROZEN.", notes: "", architecture: "F+R+Z+N", insight: "Flow + Radiate + Cut + Continue — frozen is the continuing cut of radiating flow, the ice.", bookRef: "" },
    "fruit": { hebrewRoot: "FRUIT", hebrewChars: "פרות", hebrewMeaning: "FRUIT", traditional: "Latin – FRUCTUS = ENJOYMENT, PRODUCE.", notes: "The Hebrew word PEROT = FRUIT appears in Genesis.", architecture: "F+R+T", insight: "Flow + Radiate + Mark — fruit is the marked radiance of flow, the produce, the enjoyment.", bookRef: "" },
    "fury": { hebrewRoot: "FURY", hebrewChars: "פרי", hebrewMeaning: "WILD", traditional: "Latin – FURIA = MADNESS, RAGE, FURY.", notes: "", architecture: "F+R+Y", insight: "Flow + Radiate + Act — fury is the radiating act of flow, the rage that burns.", bookRef: "" },
    "fuse": { hebrewRoot: "FUSE", hebrewChars: "פוס", hebrewMeaning: "FLOW", traditional: "Latin – FUSUS = TO POUR, MELT.", notes: "", architecture: "F+S", insight: "Flow + Spread — to fuse is to spread flow, to melt together.", bookRef: "" },
    "fuzz": { hebrewRoot: "FUZZ", hebrewChars: "פז", hebrewMeaning: "CUT", traditional: "Probably echoic.", notes: "", architecture: "F+Z", insight: "Flow + Cut — fuzz is the cut flow, the soft, the fuzzy.", bookRef: "" },
    "gather": { hebrewRoot: "GEDER", hebrewChars: "גדר", hebrewMeaning: "FENCE", traditional: "Anglo Saxon – GADERIAN = TO GATHER.", notes: "", architecture: "G+T+H+R", insight: "Grow + Mark + Breath + Radiate — to gather is to mark breath that radiates growth, to collect.", bookRef: "" },
    "gaze": { hebrewRoot: "GAZ", hebrewChars: "גז", hebrewMeaning: "CUT", traditional: "Latin – GAW = TO GAZE.", notes: "", architecture: "G+Z", insight: "Grow + Cut — to gaze is to cut with growth, to stare intently.", bookRef: "" },
    "gift": { hebrewRoot: "GIFT", hebrewChars: "גיפ", hebrewMeaning: "GROW PROJECT", traditional: "Old Norse – GIEFT = GIFT.", notes: "", architecture: "G+F+T", insight: "Grow + Flow + Mark — a gift is the growing flow that marks giving.", bookRef: "" },
    "give": { hebrewRoot: "GIVE", hebrewChars: "גיב", hebrewMeaning: "GROW VIBRATE", traditional: "Anglo Saxon – GIOFAN = TO GIVE.", notes: "", architecture: "G+V", insight: "Grow + Connection-through-vibration — to give is to vibrate growth, to offer.", bookRef: "" },
    "glad": { hebrewRoot: "GLAD", hebrewChars: "גלד", hebrewMeaning: "GROW LATERAL DIRECT", traditional: "Anglo Saxon – GLAED = BRIGHT, CHEERFUL, GLAD.", notes: "", architecture: "G+L+D", insight: "Grow + Lateral + Direct — glad is the directed lateral growth that brightens, the cheerful.", bookRef: "" },
    "glow": { hebrewRoot: "GLOW", hebrewChars: "גלו", hebrewMeaning: "GROW LATERAL", traditional: "Anglo Saxon – GLOWAN = TO GLOW.", notes: "", architecture: "G+L+W", insight: "Grow + Lateral + Connect — to glow is to connect with lateral growth, to shine warmly.", bookRef: "" },
    "gnaw": { hebrewRoot: "GNAW", hebrewChars: "גנ", hebrewMeaning: "GROW CONTINUE", traditional: "Anglo Saxon – GNAGAN = TO GNAW.", notes: "", architecture: "G+N", insight: "Grow + Continue — to gnaw is to continue growth, to chew persistently.", bookRef: "" },
    "god": { hebrewRoot: "GOD", hebrewChars: "גוד", hebrewMeaning: "GROW DIRECT", traditional: "Anglo Saxon – GOD = GOD.", notes: "", architecture: "G+D", insight: "Grow + Direct — God is the direct growth, the supreme being.", bookRef: "" },
    "gold": { hebrewRoot: "GOLD", hebrewChars: "גולד", hebrewMeaning: "GROW LATERAL DIRECT", traditional: "Anglo Saxon – GOLD = GOLD.", notes: "", architecture: "G+L+D", insight: "Grow + Lateral + Direct — gold is the direct lateral growth, the precious metal.", bookRef: "" },
    "good": { hebrewRoot: "GOOD", hebrewChars: "גוד", hebrewMeaning: "GROW DIRECT", traditional: "Anglo Saxon – GOD = GOOD.", notes: "", architecture: "G+D", insight: "Grow + Direct — good is the direct growth, the beneficial.", bookRef: "" },
    "grace": { hebrewRoot: "GRACE", hebrewChars: "גרס", hebrewMeaning: "GROW RADIATE SPREAD", traditional: "Latin – GRATIA = FAVOUR, GRACE.", notes: "", architecture: "G+R+C", insight: "Grow + Radiate + Contain — grace is the contained radiance of growth, the favour.", bookRef: "" },
    "grade": { hebrewRoot: "GRADE", hebrewChars: "גרד", hebrewMeaning: "SCRATCH", traditional: "Latin – GRADUS = A STEP.", notes: "", architecture: "G+R+D", insight: "Grow + Radiate + Direct — grade is the directed radiance of growth, the step, the rank.", bookRef: "" },
    "grain": { hebrewRoot: "GAREN", hebrewChars: "גרעין", hebrewMeaning: "SEED", traditional: "Latin – GRANNUM = A SEED, KERNEL.", notes: "", architecture: "G+R+N", insight: "Grow + Radiate + Continue — grain is the continuing radiance of growth, the seed.", bookRef: "" },
    "grant": { hebrewRoot: "GRANT", hebrewChars: "גרנט", hebrewMeaning: "GROW RADIATE CONTINUE MARK", traditional: "Latin – GRATIA = FAVOUR.", notes: "", architecture: "G+R+N+T", insight: "Grow + Radiate + Continue + Mark — to grant is to mark the continuing radiance of growth, to bestow.", bookRef: "" },
    "great": { hebrewRoot: "GREAT", hebrewChars: "גרט", hebrewMeaning: "GROW RADIATE MARK", traditional: "Anglo Saxon – GREAT = GREAT.", notes: "", architecture: "G+R+T", insight: "Grow + Radiate + Mark — great is the marked radiance of growth, the large.", bookRef: "" },
    "green": { hebrewRoot: "GREEN", hebrewChars: "גרן", hebrewMeaning: "GROW RADIATE CONTINUE", traditional: "Anglo Saxon – GRENE = GREEN.", notes: "", architecture: "G+R+N", insight: "Grow + Radiate + Continue — green is the continuing radiance of growth, the colour of life.", bookRef: "" },
    "grief": { hebrewRoot: "GRIEF", hebrewChars: "גריף", hebrewMeaning: "GROW RADIATE FLOW", traditional: "Latin – GRAVIS = HEAVY.", notes: "", architecture: "G+R+F", insight: "Grow + Radiate + Flow — grief is the flowing radiance of growth that is heavy, the sorrow.", bookRef: "" },
    "ground": { hebrewRoot: "GROUND", hebrewChars: "גרונד", hebrewMeaning: "GROW RADIATE CONTINUE DIRECT", traditional: "Anglo Saxon – GRUND = GROUND.", notes: "", architecture: "G+R+N+D", insight: "Grow + Radiate + Continue + Direct — ground is the directed continuation of radiating growth, the earth.", bookRef: "" },
    "grow": { hebrewRoot: "GROW", hebrewChars: "גרו", hebrewMeaning: "GROW RADIATE", traditional: "Anglo Saxon – GROWAN = TO GROW.", notes: "", architecture: "G+R+W", insight: "Grow + Radiate + Connect — to grow is to connect with radiating expansion, to increase.", bookRef: "" },
    "guard": { hebrewRoot: "GUARD", hebrewChars: "גרד", hebrewMeaning: "SCRATCH", traditional: "Latin – GUARD = TO WATCH.", notes: "", architecture: "G+R+D", insight: "Grow + Radiate + Direct — to guard is to direct radiating growth, to protect.", bookRef: "" },
    "guess": { hebrewRoot: "GUS", hebrewChars: "גוס", hebrewMeaning: "ROUGHLY", traditional: "Swedish – GISSA = TO GUESS.", notes: "", architecture: "G+S", insight: "Grow + Spread — to guess is to spread growth, to estimate roughly.", bookRef: "" },
    "guide": { hebrewRoot: "GA YAD", hebrewChars: "גע יד", hebrewMeaning: "TOUCH HAND", traditional: "Old French – GUIS = A GUIDE.", notes: "", architecture: "G+D", insight: "Grow + Direct — to guide is to direct growth, to lead.", bookRef: "" },
    "guilt": { hebrewRoot: "GUILT", hebrewChars: "גלט", hebrewMeaning: "GROW LATERAL MARK", traditional: "Anglo Saxon – GILT = GUILT.", notes: "", architecture: "G+L+T", insight: "Grow + Lateral + Mark — guilt is the marked lateral growth of responsibility, the fault.", bookRef: "" },
    "gulf": { hebrewRoot: "GULF", hebrewChars: "גלף", hebrewMeaning: "GROW LATERAL FLOW", traditional: "Latin – GULF = A GULF.", notes: "", architecture: "G+L+F", insight: "Grow + Lateral + Flow — a gulf is the lateral flow of growth, the chasm.", bookRef: "" },
    "gust": { hebrewRoot: "GUST", hebrewChars: "גוסט", hebrewMeaning: "GROW SPREAD MARK", traditional: "Old Norse – GUSTR = A GUST.", notes: "", architecture: "G+S+T", insight: "Grow + Spread + Mark — a gust is the marked spread of growth, the blast of wind.", bookRef: "" },
    "habit": { hebrewRoot: "HABIT", hebrewChars: "הביט", hebrewMeaning: "THE HOUSE", traditional: "Latin – HABITARE = TO DWELL.", notes: "", architecture: "H+B+T", insight: "Breath + Boundary + Mark — a habit is the marked boundary of breath, the custom.", bookRef: "" },
    "hail": { hebrewRoot: "HELEL", hebrewChars: "הילל", hebrewMeaning: "YELL", traditional: "Anglo Saxon – HAILEN = TO SALUTE, GREET.", notes: "", architecture: "H+L", insight: "Breath + Lateral — to hail is the lateral projection of breath, to greet.", bookRef: "" },
    "hair": { hebrewRoot: "HAIR", hebrewChars: "האר", hebrewMeaning: "THE LIGHT", traditional: "Anglo Saxon – HAER = HAIR.", notes: "", architecture: "H+R", insight: "Breath + Radiate — hair is the radiating breath, the strands that grow.", bookRef: "" },
    "half": { hebrewRoot: "HALF", hebrewChars: "הלף", hebrewMeaning: "THE LATERAL FLOW", traditional: "Anglo Saxon – HEALF = HALF.", notes: "", architecture: "H+L+F", insight: "Breath + Lateral + Flow — half is the lateral flow of breath, the part.", bookRef: "" },
    "hall": { hebrewRoot: "HALL", hebrewChars: "הלל", hebrewMeaning: "EMPTY SPACE", traditional: "Anglo Saxon – HEALL = A COVER, A SHELTER.", notes: "", architecture: "H+L", insight: "Breath + Lateral — a hall is the lateral space of breath, the room.", bookRef: "" },
    "hand": { hebrewRoot: "HAND", hebrewChars: "הנד", hebrewMeaning: "THE CONTINUE DIRECT", traditional: "Anglo Saxon – HAND = HAND.", notes: "", architecture: "H+N+D", insight: "Breath + Continue + Direct — a hand is the directed continuation of breath, the will made extension.", bookRef: "" },
    "harbour": { hebrewRoot: "HARBOUR", hebrewChars: "הרבור", hebrewMeaning: "THE RADIATE BOUNDARY", traditional: "Anglo Saxon – HARBOUR = A SHELTER.", notes: "", architecture: "H+R+B+R", insight: "Breath + Radiate + Boundary + Radiate — a harbour is the radiating boundary that shelters, the port.", bookRef: "" },
    "hard": { hebrewRoot: "HARD", hebrewChars: "הרד", hebrewMeaning: "THE RADIATE DIRECT", traditional: "Anglo Saxon – HEARD = HARD.", notes: "", architecture: "H+R+D", insight: "Breath + Radiate + Direct — hard is the directed radiance of breath, the solid, the tough.", bookRef: "" },
    "harm": { hebrewRoot: "HARM", hebrewChars: "הרמ", hebrewMeaning: "THE RADIATE MATERIAL", traditional: "Old Norse – HARMR = HARM.", notes: "", architecture: "H+R+M", insight: "Breath + Radiate + Material — harm is the radiating material of breath that injures.", bookRef: "" },
    "harvest": { hebrewRoot: "HARVEST", hebrewChars: "הרבסט", hebrewMeaning: "THE RADIATE VESSEL SPREAD MARK", traditional: "Anglo Saxon – HARFEST = HARVEST.", notes: "", architecture: "H+R+V+S+T", insight: "Breath + Radiate + Connection-through-vibration + Spread + Mark — harvest is the marked spread of vibrating radiance, the gathering.", bookRef: "" },
    "haste": { hebrewRoot: "HASTE", hebrewChars: "הסט", hebrewMeaning: "THE SPREAD MARK", traditional: "Latin – HASTE = HASTE.", notes: "", architecture: "H+S+T", insight: "Breath + Spread + Mark — haste is the marked spread of breath, the speed.", bookRef: "" },
    "hate": { hebrewRoot: "HATE", hebrewChars: "הט", hebrewMeaning: "THE MARK", traditional: "Anglo Saxon – HETAN = TO HATE.", notes: "", architecture: "H+T", insight: "Breath + Mark — hate is the marked breath, the strong dislike.", bookRef: "" },
    "have": { hebrewRoot: "HAVE", hebrewChars: "הב", hebrewMeaning: "THE BOUNDARY", traditional: "Anglo Saxon – HABAN = TO HAVE.", notes: "", architecture: "H+V", insight: "Breath + Connection-through-vibration — to have is to vibrate with breath, to possess.", bookRef: "" },
    "hazard": { hebrewRoot: "HAZARD", hebrewChars: "הזרד", hebrewMeaning: "THE CUT RADIATE DIRECT", traditional: "Latin – HAZARD = A GAME OF CHANCE.", notes: "", architecture: "H+Z+R+D", insight: "Breath + Cut + Radiate + Direct — hazard is the direct cut of radiating breath, the risk.", bookRef: "" },
    "heal": { hebrewRoot: "HEAL", hebrewChars: "הל", hebrewMeaning: "THE LATERAL", traditional: "Anglo Saxon – HAELAN = TO HEAL.", notes: "", architecture: "H+L", insight: "Breath + Lateral — to heal is the lateral projection of breath, to make whole.", bookRef: "" },
    "heart": { hebrewRoot: "HEART", hebrewChars: "הרט", hebrewMeaning: "THE RADIATE MARK", traditional: "Anglo Saxon – HEORTE = HEART.", notes: "", architecture: "H+R+T", insight: "Breath + Radiate + Mark — the heart is the marked radiance of breath, the emotional centre.", bookRef: "" },
    "heat": { hebrewRoot: "HEAT", hebrewChars: "הט", hebrewMeaning: "THE MARK", traditional: "Anglo Saxon – HAET = HEAT.", notes: "", architecture: "H+T", insight: "Breath + Mark — heat is the marked breath, the warmth.", bookRef: "" },
    "heavy": { hebrewRoot: "HEAVY", hebrewChars: "הבי", hebrewMeaning: "THE BOUNDARY ACT", traditional: "Anglo Saxon – HEFIG = HEAVY.", notes: "", architecture: "H+V+Y", insight: "Breath + Connection-through-vibration + Act — heavy is the vibrating act of breath, the weight.", bookRef: "" },
    "help": { hebrewRoot: "HELP", hebrewChars: "הלפ", hebrewMeaning: "THE LATERAL FLOW", traditional: "Anglo Saxon – HELPAN = TO HELP.", notes: "", architecture: "H+L+P", insight: "Breath + Lateral + Project — to help is the lateral projection of breath, to aid.", bookRef: "" },
    "herd": { hebrewRoot: "HERD", hebrewChars: "הרד", hebrewMeaning: "THE RADIATE DIRECT", traditional: "Anglo Saxon – HEARD = A HERD.", notes: "", architecture: "H+R+D", insight: "Breath + Radiate + Direct — a herd is the directed radiance of breath, the group.", bookRef: "" },
    "here": { hebrewRoot: "HERE", hebrewChars: "הרא", hebrewMeaning: "THE SEE", traditional: "Anglo Saxon – HER = HERE.", notes: "", architecture: "H+R", insight: "Breath + Radiate — here is the radiating breath, the place.", bookRef: "" },
    "hero": { hebrewRoot: "HERO", hebrewChars: "הרו", hebrewMeaning: "THE RADIATE CONNECT", traditional: "Greek – HERO = HERO.", notes: "", architecture: "H+R+W", insight: "Breath + Radiate + Connect — a hero is the connecting radiance of breath, the champion.", bookRef: "" },
    "hide": { hebrewRoot: "HIDE", hebrewChars: "הד", hebrewMeaning: "THE DIRECT", traditional: "Anglo Saxon – HYDAN = TO HIDE.", notes: "", architecture: "H+D", insight: "Breath + Direct — to hide is to direct breath away, to conceal.", bookRef: "" },
    "high": { hebrewRoot: "HIGH", hebrewChars: "הג", hebrewMeaning: "THE GROW", traditional: "Anglo Saxon – HEH = HIGH.", notes: "", architecture: "H+G", insight: "Breath + Grow — high is the growing breath, the elevated.", bookRef: "" },
    "hill": { hebrewRoot: "HILL", hebrewChars: "הל", hebrewMeaning: "THE LATERAL", traditional: "Anglo Saxon – HYLL = A HILL.", notes: "", architecture: "H+L", insight: "Breath + Lateral — a hill is the lateral rise of breath, the mound.", bookRef: "" },
    "holy": { hebrewRoot: "HOLY", hebrewChars: "הלי", hebrewMeaning: "THE LATERAL ACT", traditional: "Anglo Saxon – HALIG = HOLY.", notes: "", architecture: "H+L+Y", insight: "Breath + Lateral + Act — holy is the lateral act of breath, the sacred.", bookRef: "" },
    "home": { hebrewRoot: "HOME", hebrewChars: "המ", hebrewMeaning: "THE MATERIAL", traditional: "Anglo Saxon – HAM = A HOME.", notes: "", architecture: "H+M", insight: "Breath + Material — home is the material breath, the dwelling.", bookRef: "" },
    "honest": { hebrewRoot: "HONEST", hebrewChars: "הנט", hebrewMeaning: "THE CONTINUE MARK", traditional: "Latin – HONESTUS = HONEST.", notes: "", architecture: "H+N+S+T", insight: "Breath + Continue + Spread + Mark — honest is the marked spread of continuing breath, the truthful.", bookRef: "" },
    "honour": { hebrewRoot: "HONOUR", hebrewChars: "הנור", hebrewMeaning: "THE CONTINUE RADIATE", traditional: "Latin – HONOR = HONOUR.", notes: "", architecture: "H+N+R", insight: "Breath + Continue + Radiate — honour is the radiating continuation of breath, the respect.", bookRef: "" },
    "hope": { hebrewRoot: "HOPE", hebrewChars: "הפ", hebrewMeaning: "THE PROJECT", traditional: "Anglo Saxon – HOPIAN = TO HOPE.", notes: "", architecture: "H+P", insight: "Breath + Project — hope is the projected breath, the expectation of good.", bookRef: "" },
    "horse": { hebrewRoot: "HORSE", hebrewChars: "הרס", hebrewMeaning: "THE RADIATE SPREAD", traditional: "Anglo Saxon – HORS = HORSE.", notes: "", architecture: "H+R+S", insight: "Breath + Radiate + Spread — horse is the radiating spread of breath, the animal of power.", bookRef: "" },
    "hot": { hebrewRoot: "HOT", hebrewChars: "הט", hebrewMeaning: "THE MARK", traditional: "Anglo Saxon – HAT = HOT.", notes: "", architecture: "H+T", insight: "Breath + Mark — hot is the marked breath, the warmth, the passion.", bookRef: "" },
    "house": { hebrewRoot: "HOUSE", hebrewChars: "הס", hebrewMeaning: "THE SPREAD", traditional: "Anglo Saxon – HUS = A HOUSE.", notes: "", architecture: "H+S", insight: "Breath + Spread — a house is the spread of breath, the dwelling.", bookRef: "" },
    "huge": { hebrewRoot: "HUGE", hebrewChars: "הג", hebrewMeaning: "THE GROW", traditional: "Latin – HUGE = HUGE.", notes: "", architecture: "H+G", insight: "Breath + Grow — huge is the growing breath, the vast.", bookRef: "" },
    "human": { hebrewRoot: "HUMAN", hebrewChars: "המן", hebrewMeaning: "THE MATERIAL CONTINUE", traditional: "Latin – HUMANUS = HUMAN.", notes: "", architecture: "H+M+N", insight: "Breath + Material + Continue — human is the continuing material of breath, the being.", bookRef: "" },
    "humble": { hebrewRoot: "HUMBLE", hebrewChars: "המבל", hebrewMeaning: "THE MATERIAL BOUNDARY LATERAL", traditional: "Latin – HUMILIS = HUMBLE.", notes: "", architecture: "H+M+B+L", insight: "Breath + Material + Boundary + Lateral — humble is the lateral boundary of material breath, the modest.", bookRef: "" },
    "humour": { hebrewRoot: "HUMOUR", hebrewChars: "המור", hebrewMeaning: "THE MATERIAL RADIATE", traditional: "Latin – HUMOR = MOISTURE.", notes: "", architecture: "H+M+R", insight: "Breath + Material + Radiate — humour is the radiating material of breath, the wit, the moisture.", bookRef: "" },
    "hunger": { hebrewRoot: "HUNGER", hebrewChars: "הנגר", hebrewMeaning: "THE CONTINUE GROW RADIATE", traditional: "Anglo Saxon – HUNGR = HUNGER.", notes: "", architecture: "H+N+G+R", insight: "Breath + Continue + Grow + Radiate — hunger is the radiating growth of continuing breath, the need.", bookRef: "" },
    "hurry": { hebrewRoot: "HURRY", hebrewChars: "הרי", hebrewMeaning: "THE RADIATE ACT", traditional: "Latin – HURRY = HASTE.", notes: "", architecture: "H+R+Y", insight: "Breath + Radiate + Act — hurry is the radiating act of breath, the haste.", bookRef: "" },
    "hurt": { hebrewRoot: "HURT", hebrewChars: "הרט", hebrewMeaning: "THE RADIATE MARK", traditional: "Latin – HURT = INJURY.", notes: "", architecture: "H+R+T", insight: "Breath + Radiate + Mark — hurt is the marked radiance of breath, the injury.", bookRef: "" },
    "husband": { hebrewRoot: "HUSBAND", hebrewChars: "הסבנד", hebrewMeaning: "THE SPREAD BOUNDARY CONTINUE DIRECT", traditional: "Anglo Saxon – HUSBANDA = HUSBAND.", notes: "", architecture: "H+S+B+N+D", insight: "Breath + Spread + Boundary + Continue + Direct — husband is the directed continuation of the spread boundary of breath, the partner.", bookRef: "" },
    "hymn": { hebrewRoot: "HYMN", hebrewChars: "המן", hebrewMeaning: "THE MATERIAL CONTINUE", traditional: "Greek – HYMNS = A SONG.", notes: "", architecture: "H+M+N", insight: "Breath + Material + Continue — a hymn is the continuing material of breath, the sacred song.", bookRef: "" },
    "hypocrite": { hebrewRoot: "HYPOCRITE", hebrewChars: "היפוקריט", hebrewMeaning: "THE ACT PROJECT CONTAIN RADIATE MARK", traditional: "Greek – HYPOKRITES = AN ACTOR.", notes: "", architecture: "H+P+C+R+T", insight: "Breath + Project + Contain + Radiate + Mark — a hypocrite is the marked radiance of contained projection, the pretender.", bookRef: "" }
  };

  // ─── DOM elements ──────────────────────────────────────────────
  const decoderInput = document.getElementById('decoderInput');
  const decoderResult = document.getElementById('decoderResult');
  const decoderEmpty = document.getElementById('decoderEmpty');
  const decoderNotFound = document.getElementById('decoderNotFound');
  const decoderCount = document.getElementById('decoderCount');

  function showDecoderResult(word) {
    const entry = decoderDictionary[word];
    if (!entry) return false;

    document.getElementById('decoderWord').textContent = word.toUpperCase();
    document.getElementById('decoderRoot').textContent = entry.hebrewRoot || '—';
    document.getElementById('decoderChars').textContent = entry.hebrewChars || '';
    document.getElementById('decoderMeaning').textContent = entry.hebrewMeaning || '—';
    document.getElementById('decoderTraditional').textContent = entry.traditional || '';
    document.getElementById('decoderNotes').textContent = entry.notes || '';
    document.getElementById('decoderArchitecture').textContent = entry.architecture || '—';
    document.getElementById('decoderInsight').textContent = entry.insight || '—';

    const bookref = document.getElementById('decoderBookref');
    if (entry.bookRef) {
      bookref.style.display = 'block';
      bookref.querySelector('a').href = entry.bookRef;
    } else {
      bookref.style.display = 'none';
    }

    decoderResult.style.display = 'block';
    decoderEmpty.style.display = 'none';
    decoderNotFound.style.display = 'none';
    return true;
  }

  function doSearch(term) {
    term = term.toLowerCase().replace(/[^a-z]/g, '');

    if (!term) {
      decoderResult.style.display = 'none';
      decoderEmpty.style.display = 'block';
      decoderNotFound.style.display = 'none';
      decoderCount.textContent = '';
      return;
    }

    const exact = decoderDictionary[term] ? [term] : [];
    const partial = Object.keys(decoderDictionary).filter(key => key !== term && key.includes(term));
    const matches = [...exact, ...partial];

    if (matches.length === 0) {
      decoderResult.style.display = 'none';
      decoderEmpty.style.display = 'none';
      decoderNotFound.style.display = 'block';
      decoderCount.textContent = '';
      return;
    }

    decoderCount.textContent = `Found ${matches.length} word${matches.length > 1 ? 's' : ''}`;
    showDecoderResult(matches[0]);
  }

  decoderInput.addEventListener('input', function() {
    doSearch(this.value);
  });

  decoderInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const term = this.value.toLowerCase().replace(/[^a-z]/g, '');
      if (term && decoderDictionary[term]) {
        showDecoderResult(term);
        decoderCount.textContent = 'Found 1 word (exact match)';
      }
    }
  });

  decoderEmpty.style.display = 'block';
  decoderNotFound.style.display = 'none';
  decoderResult.style.display = 'none';
})();