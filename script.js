Act as an expert web developer and editor. I have three files for a web-based book: `final.html`, `style.css`, and `script.js`. I need you to apply the following 12 exact fixes to these files. Do not skip any steps. 

### 1. Fix `script.js` — Simplify keyMap
Find the `var keyMap = { ... };` object inside the KEY SYSTEM module. Replace the entire object with this corrected version so all keys map to valid section IDs:

var keyMap = {
  '01': 'mu-ch1',
  '02': 'mu-intro',
  '03': 'mu-ch9',
  '04': 'mu-ch8',
  '05': 'mu-ch13',
  '06': 'mu-ch5',
  '07': 'mu-ch31',
  '08': 'mu-ch7',
  '09': 'mu-ch8',
  '10': 'mu-ch16',
  '11': 'mu-ch3',
  '12': 'mu-ch14',
  '13': 'mu-ch12',
  '14': 'mu-ch9',
  '15': 'mu-ch10',
  '16': 'mu-ch10',
  '17': 'mu-ch16',
  '18': 'mu-ch16',
  '19': 'mu-ch16',
  '20': 'mu-interlude',
  '21': 'mu-ch15',
  '22': 'mu-ch16',
  '23': 'mu-ch6',
  '24': 'mu-ch5',
  '25': 'mu-ch27',
  '26': 'mu-ch30',
  '27': 'mu-ch30',
  '28': 'mu-ch30',
  '29': 'mu-ch12',
  '30': 'mu-app-o',
  '31': 'mu-ch23',
  '32': 'mu-ch19',
  '33': 'mu-ch26',
  '34': 'mu-ch22',
  '35': 'mu-prologue',
  '36': 'mu-app-p',
  '37': 'mu-app-p',
  '38': 'mu-app-h',
  '39': 'mu-app-b',
  '40': 'mu-ch11'
};

### 2. Fix `style.css` — Add Color Attribute Rules
Find the `/* ── KEY SYSTEM (NEW) ── */` section. Add these CSS rules right after the `.key-card` base styles so the HTML `data-color` attributes work correctly:

.key-surprise[data-color="pink"] .key-card {
  --key-color: var(--key-pink);
  --key-glow: var(--key-glow-pink);
  border-left-color: var(--key-pink);
}
.key-surprise[data-color="green"] .key-card {
  --key-color: var(--key-green);
  --key-glow: var(--key-glow-green);
  border-left-color: var(--key-green);
}
.key-surprise[data-color="gold"] .key-card {
  --key-color: var(--key-gold);
  --key-glow: var(--key-glow-gold);
  border-left-color: var(--key-gold);
}

### 3. Fix `final.html` — Move "Note to the Reader"
Find the `<blockquote>` that starts with `<p><strong>A Note to the Reader</strong></p>`. Cut this entire blockquote from its current location near the top of the document. Paste it immediately before this line: `<h1 id="mu-prologue">PROLOGUE: THE NEW FUNDAMENTAL</h1>`.

### 4. Fix `final.html` — Remove Duplicate Keys in Part A
In Part A, near the end where the `<!-- 20 KEY CARDS -->` comment is, delete ALL keys 31 through 40 inclusive. Delete their `key-sentinel` divs and their entire `key-surprise` card blocks. These keys belong ONLY in Part B.

### 5. Fix `final.html` — Clean up ALL Key Cards (Parts A and B)
Do the following for ALL key cards (01 through 40) in the document:
A) Delete every line that looks like `<div class="key-sentinel" data-key-id="XX"></div>`.
B) Delete every line that looks like `<span class="key-checkmark">✓</span>`.
C) In the `<div class="key-surprise"...>` tag, change `data-color="#c96478"` to `data-color="pink"`, `data-color="#5a9e6e"` to `data-color="green"`, and `data-color="#c9a227"` to `data-color="gold"`.

### 6. Fix `final.html` — Replace the Key Tracker
Find the `<!-- Key Tracker -->` block in Part B. Replace the entire `<div id="keyTracker">...</div>` with this exact HTML:

<div id="keyTracker">
  <span class="tracker-count">0/40</span>
  <span class="tracker-progress">
    <span class="tracker-bar"></span>
  </span>
  <div class="tracker-detail">
    <div class="tracker-category">
      <div class="tracker-category-label">Pink — The Code</div>
      <div class="tracker-key-list">
        <span class="tracker-key-item" data-key-id="01">1</span>
        <span class="tracker-key-item" data-key-id="02">2</span>
        <span class="tracker-key-item" data-key-id="03">3</span>
        <span class="tracker-key-item" data-key-id="04">4</span>
        <span class="tracker-key-item" data-key-id="05">5</span>
        <span class="tracker-key-item" data-key-id="06">6</span>
        <span class="tracker-key-item" data-key-id="07">7</span>
        <span class="tracker-key-item" data-key-id="08">8</span>
        <span class="tracker-key-item" data-key-id="09">9</span>
        <span class="tracker-key-item" data-key-id="10">10</span>
      </div>
    </div>
    <div class="tracker-category">
      <div class="tracker-category-label">Yellow — The Restructured Mind</div>
      <div class="tracker-key-list">
        <span class="tracker-key-item" data-key-id="11">11</span>
        <span class="tracker-key-item" data-key-id="12">12</span>
        <span class="tracker-key-item" data-key-id="13">13</span>
        <span class="tracker-key-item" data-key-id="14">14</span>
        <span class="tracker-key-item" data-key-id="15">15</span>
        <span class="tracker-key-item" data-key-id="16">16</span>
        <span class="tracker-key-item" data-key-id="17">17</span>
        <span class="tracker-key-item" data-key-id="18">18</span>
        <span class="tracker-key-item" data-key-id="19">19</span>
        <span class="tracker-key-item" data-key-id="20">20</span>
        <span class="tracker-key-item" data-key-id="21">21</span>
        <span class="tracker-key-item" data-key-id="22">22</span>
        <span class="tracker-key-item" data-key-id="23">23</span>
        <span class="tracker-key-item" data-key-id="24">24</span>
        <span class="tracker-key-item" data-key-id="25">25</span>
        <span class="tracker-key-item" data-key-id="26">26</span>
        <span class="tracker-key-item" data-key-id="27">27</span>
        <span class="tracker-key-item" data-key-id="28">28</span>
        <span class="tracker-key-item" data-key-id="29">29</span>
        <span class="tracker-key-item" data-key-id="30">30</span>
      </div>
    </div>
    <div class="tracker-category">
      <div class="tracker-category-label">Green — BedRock &amp; Cosmology</div>
      <div class="tracker-key-list">
        <span class="tracker-key-item" data-key-id="31">31</span>
        <span class="tracker-key-item" data-key-id="32">32</span>
        <span class="tracker-key-item" data-key-id="33">33</span>
        <span class="tracker-key-item" data-key-id="34">34</span>
        <span class="tracker-key-item" data-key-id="35">35</span>
        <span class="tracker-key-item" data-key-id="36">36</span>
        <span class="tracker-key-item" data-key-id="37">37</span>
        <span class="tracker-key-item" data-key-id="38">38</span>
        <span class="tracker-key-item" data-key-id="39">39</span>
        <span class="tracker-key-item" data-key-id="40">40</span>
      </div>
    </div>
  </div>
  <div class="tracker-completion">✨ All 40 keys discovered</div>
</div>

### 7. Fix `final.html` — Text and Formatting Fixes
Apply these exact find-and-replace text edits:

A) Prologue Punctuation:
Find: `...aimed the wrong direction. As above so below 👇 That chapter is waiting for you.`
Replace: `...aimed the wrong direction. As above, so below. 👇 That chapter is waiting for you.`

B) Chapter 12 Redundant Label:
Find: `<p><strong>SPEAK (S+P+K)</strong> — SPEAK = S + P + K</p>`
Replace: `<p><strong>SPEAK (S+P+K)</strong> — <em>Spread + Project + Contain</em></p>`

C) Chapter 1 Formatting:
Find: `<p>THE S-DEFINITION — SPEECH ITSELF IS MADE OF S</p>`
Replace: `<h3>THE S-DEFINITION — SPEECH ITSELF IS MADE OF S</h3>`

D) Appendix A Title:
Find: `APPENDIX A: THE 3D CONSONANT REFERENCE (22 Core Sounds)`
Replace: `APPENDIX A: THE 3D CONSONANT REFERENCE (The 24 Core Units)`

Please apply all these changes and output the fully corrected code for each file.