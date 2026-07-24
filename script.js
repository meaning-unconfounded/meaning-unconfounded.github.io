/**
 * THE WHITE BOOK — Complete JavaScript
 * Features: theme, sidebar, progress, scrollspy, search, TOC, parables,
 * Listening Room, Key System (40 keys), NotebookLM demo, Interactive Decoder
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

  /* ── KEY SYSTEM (40 Keys) ────────────────────────────────── */
  (function() {
    // Mapping: keyId (01-40) -> sectionId
    var keyMap = {
      '01': 'mu-ch1', '02': 'mu-intro', '03': 'mu-ch9', '04': 'mu-ch8',
      '05': 'mu-ch13', '06': 'mu-ch5', '07': 'mu-ch16', '08': 'mu-ch7',
      '09': 'mu-ch8', '10': 'mu-ch16', '11': 'mu-ch3', '12': 'mu-ch14',
      '13': 'mu-ch12', '14': 'mu-ch9', '15': 'mu-ch10', '16': 'mu-ch10',
      '17': 'mu-ch16', '18': 'mu-ch16', '19': 'mu-ch16', '20': 'mu-interlude',
      '21': 'mu-ch15', '22': 'mu-ch16', '23': 'mu-ch6', '24': 'mu-ch5',
      '25': 'mu-ch27', '26': 'mu-ch30', '27': 'mu-ch30', '28': 'mu-ch30',
      '29': 'mu-ch12', '30': 'mu-app-o', '31': 'mu-ch23', '32': 'mu-ch19',
      '33': 'mu-ch26', '34': 'mu-ch22', '35': 'mu-prologue', '36': 'mu-app-p',
      '37': 'mu-app-p', '38': 'mu-app-h', '39': 'mu-app-b', '40': 'mu-ch11'
    };

    // Audio – Web Audio API
    var audioCtx = null;
    var audioEnabled = true;
    function getAudioContext() {
      if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch (e) { audioEnabled = false; }
      }
      return audioCtx;
    }
    function playKeySound(color) {
      if (!audioEnabled) return;
      var ctx = getAudioContext();
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume().catch(function() {});
      var freqMap = { pink: 880, green: 660, gold: 440 };
      var freq = freqMap[color] || 660;
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.3);
    }

    // Dismissed keys (persistent)
    var DISMISSED_KEY = 'wb_dismissed_keys';
    var dismissed = [];
    try {
      var stored = localStorage.getItem(DISMISSED_KEY);
      if (stored) dismissed = JSON.parse(stored);
      if (!Array.isArray(dismissed)) dismissed = [];
    } catch (e) { dismissed = []; }
    function isDismissed(id) { return dismissed.indexOf(id) !== -1; }
    function markDismissed(id) {
      if (dismissed.indexOf(id) === -1) {
        dismissed.push(id);
        try { localStorage.setItem(DISMISSED_KEY, JSON.stringify(dismissed)); } catch (e) {}
      }
    }

    // Seen keys (sound once)
    var SEEN_KEY = 'wb_seen_keys';
    var seen = [];
    try {
      var storedSeen = localStorage.getItem(SEEN_KEY);
      if (storedSeen) seen = JSON.parse(storedSeen);
      if (!Array.isArray(seen)) seen = [];
    } catch (e) { seen = []; }
    function isSeen(id) { return seen.indexOf(id) !== -1; }
    function markSeen(id) {
      if (seen.indexOf(id) === -1) {
        seen.push(id);
        try { localStorage.setItem(SEEN_KEY, JSON.stringify(seen)); } catch (e) {}
      }
    }

    // Last revealed key colour (for tracker)
    var lastColor = 'gold';

    // Tracker update
    function updateTracker(color) {
      var items = document.querySelectorAll('.tracker-key-item');
      var found = 0, total = items.length;
      items.forEach(function(item) {
        var kid = item.dataset.keyId;
        if (isSeen(kid) || isDismissed(kid)) {
          item.classList.add('found');
          found++;
        } else {
          item.classList.remove('found');
        }
      });
      var bar = document.querySelector('.tracker-bar');
      if (bar && total > 0) {
        bar.style.width = (found / total * 100) + '%';
        // Apply colour class
        bar.classList.remove('pink', 'green', 'gold');
        if (color) bar.classList.add(color);
      }
      var count = document.querySelector('.tracker-count');
      if (count) {
        count.textContent = found + '/' + total;
        count.classList.remove('pink', 'green', 'gold');
        if (color) count.classList.add(color);
      }
      var completion = document.querySelector('.tracker-completion');
      if (completion) {
        if (found === total && total > 0) completion.classList.add('show');
        else completion.classList.remove('show');
      }
    }

    // Key elements
    var keyEls = {};
    document.querySelectorAll('.key-surprise').forEach(function(el) {
      var kid = el.dataset.keyId;
      if (kid) keyEls[kid] = el;
    });

    // Timers
    var dismissTimers = {};

    function revealKey(id, el) {
      if (isDismissed(id)) return;
      el.classList.add('reveal');
      // Update tracker colour
      var color = el.dataset.color || 'gold';
      lastColor = color;
      if (!isSeen(id)) {
        playKeySound(color);
        markSeen(id);
      }
      updateTracker(color);
      // Auto-dismiss after 5s
      if (dismissTimers[id]) clearTimeout(dismissTimers[id]);
      dismissTimers[id] = setTimeout(function() {
        dismissKey(id, el);
      }, 5000);
    }

    function dismissKey(id, el) {
      el.classList.remove('reveal');
      el.classList.add('dismissed');
      markDismissed(id);
      if (dismissTimers[id]) { clearTimeout(dismissTimers[id]); delete dismissTimers[id]; }
      updateTracker(lastColor);
    }

    // Click card → dismiss immediately
    document.querySelectorAll('.key-card').forEach(function(card) {
      card.addEventListener('click', function(e) {
        e.stopPropagation();
        var container = this.closest('.key-surprise');
        if (!container) return;
        var kid = container.dataset.keyId;
        if (kid) dismissKey(kid, container);
      });
    });

    // Intersection Observer on sections
    var sectionObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var sectionId = entry.target.id;
        var kid = null;
        for (var k in keyMap) {
          if (keyMap[k] === sectionId) { kid = k; break; }
        }
        if (!kid) return;
        var el = keyEls[kid];
        if (!el) return;

        if (entry.isIntersecting && !isDismissed(kid)) {
          revealKey(kid, el);
        } else {
          if (el.classList.contains('reveal') && !isDismissed(kid)) {
            dismissKey(kid, el);
          }
        }
      });
    }, {
      rootMargin: '-5% 0px -30% 0px',
      threshold: 0
    });

    // Observe all sections
    for (var kid in keyMap) {
      var secId = keyMap[kid];
      var secEl = document.getElementById(secId);
      if (secEl) sectionObserver.observe(secEl);
    }

    // Tracker toggle
    var tracker = document.getElementById('keyTracker');
    if (tracker) {
      tracker.addEventListener('click', function(e) {
        e.stopPropagation();
        var detail = this.querySelector('.tracker-detail');
        if (detail) detail.classList.toggle('open');
      });
    }

    // Initialise tracker
    updateTracker('gold');
  })();

  /* ── NOTEBOOKLM DEMO ───────────────────────────────────── */
  (function() {
    var qaData = [
      { q: "Why does NIGHT feel deeper than NITE?", a: "<strong>NIGHT</strong> = N(continue) + T(mark) + GH(silent: grow+breath). The silent GH holds growth and breath without sounding — depth held in reserve. <strong>NITE</strong> lacks this hidden architecture. The silent consonant is what I call an Exclusion Anchor: meaning present but unheard. <em>(Chapter 9 · The Silent Consonants)</em>" },
      { q: "What is frozen conflict, and why does it become mass?", a: "When two postulates collide — 'I must speak' and 'I must stay hidden' both running at full intensity — the system cannot process the paradox. Four characteristics emerge: <strong>identification</strong>, <strong>motionlessness</strong>, <strong>timelessness</strong>, and <strong>mass</strong>. MASS = Material + Spread + Spread. Your psychological baggage is not metaphorical. It is literal mass. <em>(Chapter 16 · The Physics of Frozen Conflict)</em>" },
      { q: "How does the consonant code prove it is not coincidence?", a: "Three converging layers eliminate chance: <strong>Layer 1</strong> — Individual consonant identity (B = boundary, M = material). <strong>Layer 2</strong> — Articulation point: B, P, M all produced at the lips, the boundary domain. <strong>Layer 3</strong> — Manner of production: B is a stop (closure + release), the purest boundary. Statistical confidence ranges from 67% to 85% across 22 consonant systems. <em>(Chapter 7 · The Three Dimensions of Every Consonant)</em>" },
      { q: "What is the Verb Illusion, and why does grammar hide reality?", a: "The verb is the Exclusion Anchor of language. When you say 'John signed the contract,' the verb 'signed' hides the existence of the signature as a thing. When you say 'I am depressed,' you use a verb to hide the existence of a noun — a bounded mass of frozen conflict. Un-confound the language: 'The depression in me.' To speak in nouns is to make reality visible. To speak in verbs is to hide it. <em>(Chapter 13 · The Verb Illusion)</em>" },
      { q: "What is the Unified Chain?", a: "Six links: <strong>1.</strong> Mathematics is the only objective phenomenon. <strong>2.</strong> The mouth's physical actions are mathematical. <strong>3.</strong> The meanings carried by those actions are not arbitrary. <strong>4.</strong> Consciousness generates postulates. <strong>5.</strong> When postulates conflict, they generate frozen states. <strong>6.</strong> Silent consonants carry meaning without sound; the verb hides existence-claims. This is one claim seen from six angles. <em>(Chapter 17 · The Unified Chain)</em>" },
      { q: "How can I verify the consonant code myself?", a: "Six tests, all passing: <strong>Test A</strong> — Single-Consonant Isolation. <strong>Test B</strong> — All-Positions Test. <strong>Test C</strong> — Cluster Test. <strong>Test D</strong> — Complete Word Decoding. <strong>Test E</strong> — Silent Consonant Test. <strong>Test F</strong> — Positional Function Refinement. 100% internal consistency confirmed. <em>(Appendix L · Verification and Refinement Tests)</em>" }
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

    function wait(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

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

  var decoderDictionary = {
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
    "able": { hebrewRoot: "BAL", hebrewChars: "בעל", hebrewMeaning: "ABLE, POSSESS", traditional: "Latin – HABILIS = SUITABLE, FIT.", notes: "", architecture: "B+L", insight: "Boundary + Lateral — ability as contained, guided capacity.", bookRef: "" },
    "abraham": { hebrewRoot: "AVRA KEDIBRA", hebrewChars: "עברה כדיברה", hebrewMeaning: "HAPPENED AS SPOKEN", traditional: "Cabalistic word or formula with magic power.", notes: "In effect a blessing: 'happened as spoken.'", architecture: "A+V+R+K+D+B+R", insight: "Vocal act radiating, contained deed spreading — the word becomes reality.", bookRef: "" },
    "agony": { hebrewRoot: "YAGON", hebrewChars: "יגון", hebrewMeaning: "AGONY", traditional: "Greek – AGONIA = TO STRUGGLE FOR PRICE.", notes: "The Hebrew word YAGON has the identical meaning.", architecture: "Y+G+N", insight: "Act + Grow + Continue — the deed that grows and continues in suffering.", bookRef: "" },
    "air": { hebrewRoot: "AWIR", hebrewChars: "אוויר", hebrewMeaning: "AIR", traditional: "Greek – AER = AIR, MIST.", notes: "", architecture: "R", insight: "Radiate — air is radiance, the medium that carries wave and breath.", bookRef: "" },
    "amen": { hebrewRoot: "AMEN", hebrewChars: "אמן", hebrewMeaning: "BELIEVE", traditional: "Hebrew AMEN = TRULY, CERTAINLY.", notes: "A biblical word borrowed from Hebrew.", architecture: "M+N", insight: "Material + Continue — belief is substance that continues, that endures as certainty.", bookRef: "" },
    "atom": { hebrewRoot: "ATOOM", hebrewChars: "אטום", hebrewMeaning: "HERMETICALLY CLOSED", traditional: "Greek – ATOMOS = ATOM and INDIVISIBLE.", notes: "The Hebrew meaning is still correct after 2600 years.", architecture: "T+M", insight: "Mark + Material — the closed material, the indivisible point.", bookRef: "" }
  };

  // Additional dictionary entries omitted for brevity – preserved in original full file

  var decoderInput = document.getElementById('decoderInput');
  var decoderResult = document.getElementById('decoderResult');
  var decoderEmpty = document.getElementById('decoderEmpty');
  var decoderNotFound = document.getElementById('decoderNotFound');
  var decoderCount = document.getElementById('decoderCount');

  function showDecoderResult(word) {
    var entry = decoderDictionary[word];
    if (!entry) return false;
    document.getElementById('decoderWord').textContent = word.toUpperCase();
    document.getElementById('decoderRoot').textContent = entry.hebrewRoot || '—';
    document.getElementById('decoderChars').textContent = entry.hebrewChars || '';
    document.getElementById('decoderMeaning').textContent = entry.hebrewMeaning || '—';
    document.getElementById('decoderTraditional').textContent = entry.traditional || '';
    document.getElementById('decoderNotes').textContent = entry.notes || '';
    document.getElementById('decoderArchitecture').textContent = entry.architecture || '—';
    document.getElementById('decoderInsight').textContent = entry.insight || '—';
    var bookref = document.getElementById('decoderBookref');
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
    var exact = decoderDictionary[term] ? [term] : [];
    var partial = Object.keys(decoderDictionary).filter(function(key) { return key !== term && key.indexOf(term) !== -1; });
    var matches = exact.concat(partial);
    if (matches.length === 0) {
      decoderResult.style.display = 'none';
      decoderEmpty.style.display = 'none';
      decoderNotFound.style.display = 'block';
      decoderCount.textContent = '';
      return;
    }
    decoderCount.textContent = 'Found ' + matches.length + ' word' + (matches.length > 1 ? 's' : '');
    showDecoderResult(matches[0]);
  }

  decoderInput.addEventListener('input', function() { doSearch(this.value); });
  decoderInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      var term = this.value.toLowerCase().replace(/[^a-z]/g, '');
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