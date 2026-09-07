/* =============================================================================
   app.js — renders window.RESUME as a dashboard and wires the interactions.
   Vanilla, no build step, no dependencies. The SQL worksheet lives in
   worksheet.js and talks to this file through window.ResumeApp.
   ============================================================================= */
(function () {
  'use strict';

  var R = window.RESUME;
  if (!R) { return; }

  var DEFAULT_ROLE = 'unified';
  var VISIBLE_BULLETS = 5;   // shown before "show more" in each job
  var DEMOTE_BELOW = 60;     // in a role view, bullets under this dim and sink
  var STRONG_AT = 80;
  var COVERAGE_ROWS = 10;
  var LS_ROLE = 'wwc.role';
  var LS_THEME = 'wwc.theme';

  var state = { role: DEFAULT_ROLE, skill: null, view: 'dash' };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(s, root) { return (root || document).querySelector(s); }
  function $$(s, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(s));
  }

  var scratch = document.createElement('div');
  function plain(html) { scratch.innerHTML = html; return scratch.textContent || ''; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;');
  }

  /* ---------- role helpers ------------------------------------------------ */

  function roleById(id) {
    for (var i = 0; i < R.roles.length; i++) {
      if (R.roles[i].id === id) { return R.roles[i]; }
    }
    return R.roles[0];
  }
  function isRole(id) { return R.roles.some(function (r) { return r.id === id; }); }
  function weightOf(b, role) {
    var w = b.weight || {};
    return typeof w[role] === 'number' ? w[role] : (w.unified || 0);
  }
  function textOf(b, role) {
    return (b.variants && b.variants[role]) ? b.variants[role] : b.text;
  }
  function relevantTo(b, role) {
    return role === 'unified' || weightOf(b, role) >= DEMOTE_BELOW;
  }

  /* ---------- theme ------------------------------------------------------- */

  function initTheme() {
    var saved = null;
    try { saved = localStorage.getItem(LS_THEME); } catch (e) {}
    if (saved === 'dark' || saved === 'light') {
      document.documentElement.setAttribute('data-theme', saved);
    }
    $('#theme-btn').addEventListener('click', function () {
      var cur = document.documentElement.getAttribute('data-theme');
      if (!cur) {
        cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      var next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(LS_THEME, next); } catch (e) {}
      if (window.Worksheet && window.Worksheet.onThemeChange) { window.Worksheet.onThemeChange(); }
    });
  }

  /* ---------- contact ----------------------------------------------------- */

  function renderContact() {
    var m = R.meta;
    var mail = m.emailUser + '@' + m.emailDomain;
    var I = {
      mail: '<path d="M2 4h12v8H2z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M2 4.5l6 4 6-4" fill="none" stroke="currentColor" stroke-width="1.4"/>',
      gh: '<path fill="currentColor" d="M8 .2a8 8 0 00-2.5 15.6c.4.07.55-.17.55-.38v-1.4C3.84 14.4 3.4 13 3.4 13c-.36-.9-.87-1.15-.87-1.15-.7-.48.06-.47.06-.47.78.05 1.2.8 1.2.8.7 1.2 1.83.85 2.28.65.07-.5.27-.85.5-1.05-1.75-.2-3.6-.87-3.6-3.9 0-.86.3-1.56.8-2.11-.08-.2-.35-1 .08-2.07 0 0 .66-.21 2.2.8a7.5 7.5 0 014 0c1.53-1.01 2.2-.8 2.2-.8.43 1.07.16 1.87.08 2.07.5.55.8 1.25.8 2.11 0 3.04-1.86 3.7-3.63 3.89.29.24.54.72.54 1.45v2.15c0 .21.14.46.55.38A8 8 0 008 .2z"/>',
      li: '<path fill="currentColor" d="M3.4 5.3h2.2V14H3.4zM4.5 1.8a1.3 1.3 0 110 2.6 1.3 1.3 0 010-2.6zM7.3 5.3h2.1v1.2h.03c.3-.55 1.02-1.13 2.1-1.13 2.24 0 2.66 1.44 2.66 3.32V14h-2.2V9.13c0-.81-.01-1.85-1.15-1.85-1.16 0-1.34.88-1.34 1.79V14h-2.2z"/>',
      copy: '<rect x="5" y="5" width="8" height="9" rx="1" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M11 5V3a1 1 0 00-1-1H3a1 1 0 00-1 1v7a1 1 0 001 1h2" fill="none" stroke="currentColor" stroke-width="1.3"/>'
    };
    function svg(p) { return '<svg viewBox="0 0 16 16" aria-hidden="true">' + p + '</svg>'; }

    $('#contact').innerHTML =
      '<a href="mailto:' + mail + '">' + svg(I.mail) + mail + '</a>' +
      '<a href="' + m.linkedin + '" rel="me noopener" target="_blank">' + svg(I.li) + 'LinkedIn</a>' +
      '<a href="' + m.github + '" rel="me noopener" target="_blank">' + svg(I.gh) + 'GitHub</a>' +
      '<button type="button" id="copy-mail">' + svg(I.copy) + '<span>Copy email</span></button>';

    $('#copy-mail').addEventListener('click', function () {
      var label = $('#copy-mail span');
      var done = function () {
        label.textContent = 'Copied';
        setTimeout(function () { label.textContent = 'Copy email'; }, 1600);
      };
      if (navigator.clipboard) { navigator.clipboard.writeText(mail).then(done, done); }
      else { done(); }
    });
    $('#foot-mail').href = 'mailto:' + mail;
  }

  /* ---------- role switcher ----------------------------------------------- */

  function renderSwitch() {
    var group = $('#switch-group');
    group.innerHTML = R.roles.map(function (r) {
      return '<button type="button" class="switch-opt" role="radio" data-role="' + r.id +
             '" aria-checked="false" tabindex="-1">' + r.label + '</button>';
    }).join('');

    group.addEventListener('click', function (e) {
      var b = e.target.closest('.switch-opt');
      if (b) { setRole(b.getAttribute('data-role')); }
    });

    group.addEventListener('keydown', function (e) {
      var keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'];
      if (keys.indexOf(e.key) === -1) { return; }
      e.preventDefault();
      var opts = $$('.switch-opt', group);
      var i = opts.indexOf(document.activeElement);
      if (i === -1) { i = 0; }
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { i = (i + 1) % opts.length; }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { i = (i - 1 + opts.length) % opts.length; }
      else if (e.key === 'Home') { i = 0; }
      else { i = opts.length - 1; }
      opts[i].focus();
      setRole(opts[i].getAttribute('data-role'));
    });
  }

  function paintHero(role) {
    var r = roleById(role);
    var el = $('#hero-summary');
    var apply = function () {
      // reads as "Wei-Wei Chi / as a Data Analyst" straight under the name
      $('#hero-role').innerHTML = r.hero;
      el.innerHTML = r.summary;
      el.classList.remove('is-swapping');
    };
    if (reduceMotion) { apply(); return; }
    el.classList.add('is-swapping');
    setTimeout(apply, 150);
  }

  /* ---------- KPI cards --------------------------------------------------- */

  function renderStats(role) {
    var list = R.stats[role] || R.stats.unified;
    $('#stats').innerHTML = list.map(function (s, i) {
      return '<div class="kpi">' +
        '<div class="kpi-lbl">' + s.label + '</div>' +
        '<div class="kpi-val" data-to="' + s.value + '" data-suffix="' + esc(s.suffix) + '">0</div>' +
        sparkline(i) +
      '</div>';
    }).join('');
    $$('#stats .kpi-val').forEach(countUp);
  }

  // Decorative trend line — deterministic per slot, never presented as data.
  function sparkline(seed) {
    var pts = [], n = 14, v = 26;
    for (var i = 0; i < n; i++) {
      v += Math.sin((i + seed * 3.1) * 0.9) * 5 + (i * 1.5);
      pts.push([(i / (n - 1)) * 100, Math.max(3, Math.min(34, 37 - v * 0.42))]);
    }
    var d = pts.map(function (p, i) {
      return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }).join(' ');
    return '<svg class="kpi-spark" viewBox="0 0 100 37" preserveAspectRatio="none" aria-hidden="true">' +
      '<path d="' + d + '" fill="none" stroke="var(--rule-strong)" stroke-width="1.6" ' +
      'vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  function countUp(el) {
    var to = parseFloat(el.getAttribute('data-to'));
    var suffix = el.getAttribute('data-suffix') || '';
    var dec = (String(to).split('.')[1] || '').length;
    var tail = suffix ? '<span class="u">' + suffix + '</span>' : '';
    var put = function (v) { el.innerHTML = v.toFixed(dec) + tail; };
    if (reduceMotion) { put(to); return; }
    var dur = 850, t0 = null;
    function step(ts) {
      if (t0 === null) { t0 = ts; }
      var p = Math.min((ts - t0) / dur, 1);
      put(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) { requestAnimationFrame(step); }
    }
    requestAnimationFrame(step);
  }

  /* ---------- timeline (gantt) -------------------------------------------- */

  function toYear(ym) {
    if (!ym) { var d = new Date(); return d.getFullYear() + d.getMonth() / 12; }
    var p = ym.split('-');
    return parseInt(p[0], 10) + (parseInt(p[1], 10) - 1) / 12;
  }

  function renderTimeline() {
    var rows = R.timeline;
    var min = Math.floor(Math.min.apply(null, rows.map(function (r) { return toYear(r.start); })));
    var max = Math.ceil(toYear(null));
    var span = max - min;

    var W = 1000, rowH = 27, padT = 24, padB = 4;
    var H = padT + rows.length * rowH + padB;
    var x = function (y) { return ((y - min) / span) * W; };
    var out = [];

    for (var yr = min; yr <= max; yr++) {
      var gx = x(yr);
      out.push('<line x1="' + gx.toFixed(1) + '" y1="' + (padT - 9) + '" x2="' + gx.toFixed(1) +
               '" y2="' + (H - padB) + '" stroke="var(--grid)" stroke-width="1"/>');
      if (yr % 2 === 0 || yr === max) {
        out.push('<text class="tl-year" x="' + (gx + 4).toFixed(1) + '" y="' + (padT - 13) +
                 '">' + yr + '</text>');
      }
    }

    rows.forEach(function (r, i) {
      var y = padT + i * rowH + 5;
      var x1 = x(toYear(r.start)), x2 = x(toYear(r.end));
      var w = Math.max(x2 - x1, 4);
      var fill = r.kind === 'edu' ? 'var(--rule-strong)' : 'var(--primary)';
      out.push('<rect class="tl-bar" x="' + x1.toFixed(1) + '" y="' + y + '" width="' +
               w.toFixed(1) + '" height="13" rx="6.5" fill="' + fill + '"><title>' +
               esc(plain(r.label)) + '</title></rect>');
      var right = x1 > W * 0.58;
      var tx = right ? x1 - 8 : x1 + w + 8;
      out.push('<text class="tl-label" x="' + tx.toFixed(1) + '" y="' + (y + 10.5) +
               '" text-anchor="' + (right ? 'end' : 'start') + '">' + esc(plain(r.short)) + '</text>');
    });

    $('#timeline').innerHTML =
      '<svg class="tl-svg" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' +
      'Career and education timeline from ' + min + ' to present">' + out.join('') + '</svg>';
    $('#tl-meta').textContent = min + '–present';
  }

  /* ---------- skill coverage ---------------------------------------------- */

  function coverageCounts(role) {
    var counts = {};
    R.experience.forEach(function (j) {
      j.bullets.forEach(function (b) {
        if (!relevantTo(b, role)) { return; }
        (b.skills || []).forEach(function (s) { counts[s] = (counts[s] || 0) + 1; });
      });
    });
    return Object.keys(counts).map(function (k) { return { skill: k, n: counts[k] }; })
      .sort(function (a, b) { return b.n - a.n || a.skill.localeCompare(b.skill); });
  }

  function renderCoverage(role) {
    var rows = coverageCounts(role).slice(0, COVERAGE_ROWS);
    if (!rows.length) { $('#coverage').innerHTML = '<p class="ws-msg">No data.</p>'; return; }
    var max = rows[0].n;
    $('#coverage').innerHTML = rows.map(function (r) {
      var pct = Math.round((r.n / max) * 100);
      return '<button type="button" class="cov-row" data-skill="' + esc(r.skill) +
        '" aria-pressed="' + (state.skill === r.skill) + '">' +
        '<span class="cov-name" title="' + esc(r.skill) + '">' + esc(r.skill) + '</span>' +
        '<span class="cov-track"><span class="cov-fill" style="width:' + pct + '%"></span></span>' +
        '<span class="cov-num">' + r.n + '</span></button>';
    }).join('');
  }

  /* ---------- experience --------------------------------------------------- */

  function renderExperience() {
    $('#experience-list').innerHTML = R.experience.map(function (job) {
      return '<article class="job is-collapsed" id="job-' + job.id + '">' +
        '<div class="job-head">' +
          '<h3 class="job-title">' + job.title + '</h3>' +
          '<span class="job-dates">' + job.dates + '</span>' +
        '</div>' +
        '<div class="job-org">' + job.org + '</div>' +
        '<div class="job-sub">' + job.location + (job.note ? ' · ' + job.note : '') + '</div>' +
        '<ul class="bullets" data-job="' + job.id + '"></ul>' +
        (job.bullets.length > VISIBLE_BULLETS
          ? '<button type="button" class="more-btn" data-job="' + job.id + '"></button>' : '') +
      '</article>';
    }).join('');

    $('#exp-meta').textContent = R.experience.length + ' roles · ' +
      R.experience.reduce(function (n, j) { return n + j.bullets.length; }, 0) + ' achievements';

    $('#experience-list').addEventListener('click', function (e) {
      var b = e.target.closest('.more-btn');
      if (!b) { return; }
      $('#job-' + b.getAttribute('data-job')).classList.toggle('is-collapsed');
      syncMoreLabel(b);
    });
  }

  function syncMoreLabel(btn) {
    var id = btn.getAttribute('data-job'), job = null;
    R.experience.forEach(function (j) { if (j.id === id) { job = j; } });
    var art = $('#job-' + id);
    var collapsed = art.classList.contains('is-collapsed');
    btn.textContent = collapsed
      ? '+ show ' + (job.bullets.length - VISIBLE_BULLETS) + ' more' : '− show fewer';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }

  function paintBullets(role, animate) {
    R.experience.forEach(function (job) {
      var ul = $('.bullets[data-job="' + job.id + '"]');

      var first = {};
      if (animate && !reduceMotion) {
        $$('li', ul).forEach(function (li) {
          first[li.getAttribute('data-id')] = li.getBoundingClientRect().top;
        });
      }

      var ordered = job.bullets.slice().sort(function (a, b) {
        return weightOf(b, role) - weightOf(a, role);
      });

      ul.innerHTML = ordered.map(function (b, i) {
        var w = weightOf(b, role);
        var cls = 'bullet';
        if (i >= VISIBLE_BULLETS) { cls += ' is-overflow'; }
        if (w >= STRONG_AT) { cls += ' is-strong'; }
        if (role !== 'unified' && w < DEMOTE_BELOW) { cls += ' is-demoted'; }
        return '<li class="' + cls + '" data-id="' + b.id + '">' +
          '<span class="bullet-rel" style="--rel:' + w + '%" aria-hidden="true"></span>' +
          '<span>' + textOf(b, role) + '</span></li>';
      }).join('');

      if (animate && !reduceMotion) {
        $$('li', ul).forEach(function (li) {
          var id = li.getAttribute('data-id');
          if (!(id in first)) { return; }
          var d = first[id] - li.getBoundingClientRect().top;
          if (!d) { return; }
          li.style.transition = 'none';
          li.style.transform = 'translateY(' + d + 'px)';
          requestAnimationFrame(function () {
            li.style.transition = 'transform 280ms cubic-bezier(.4,0,.2,1)';
            li.style.transform = '';
          });
        });
      }
    });

    $$('.more-btn').forEach(syncMoreLabel);
    applySkillFilter();
  }

  /* ---------- skills ------------------------------------------------------- */

  function renderSkills(role) {
    var groups = R.skills[role] || R.skills.unified;
    $('#skills-list').innerHTML = groups.map(function (g) {
      return '<div class="skill-group">' +
        '<h3 class="skill-group-name">' + g.group + '</h3>' +
        '<div class="chips">' + g.items.map(function (s) {
          return '<button type="button" class="chip" data-skill="' + esc(s) +
                 '" aria-pressed="false">' + s + '</button>';
        }).join('') + '</div></div>';
    }).join('');

    var n = groups.reduce(function (a, g) { return a + g.items.length; }, 0);
    $('#sk-meta').textContent = n + ' across ' + groups.length + ' groups';
    markInertChips();
  }

  // A chip only filters if some achievement actually claims that skill.
  function markInertChips() {
    var used = {};
    R.experience.forEach(function (j) {
      j.bullets.forEach(function (b) {
        (b.skills || []).forEach(function (s) { used[s] = true; });
      });
    });
    $$('#skills-list .chip').forEach(function (c) {
      var s = plain(c.getAttribute('data-skill'));
      if (!used[s]) { c.classList.add('is-inert'); }
      c.setAttribute('aria-pressed', state.skill === s ? 'true' : 'false');
    });
  }

  function bulletsWithSkill(skill) {
    var ids = {}, jobs = 0;
    R.experience.forEach(function (j) {
      var hit = false;
      j.bullets.forEach(function (b) {
        if ((b.skills || []).indexOf(skill) !== -1) { ids[b.id] = true; hit = true; }
      });
      if (hit) { jobs++; }
    });
    return { ids: ids, jobs: jobs, count: Object.keys(ids).length };
  }

  function applySkillFilter() {
    var bar = $('#filterbar');
    if (!state.skill) {
      $$('.bullet').forEach(function (li) { li.classList.remove('is-hit', 'is-dimmed'); });
      bar.classList.remove('is-open');
      $$('#skills-list .chip').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      $$('.cov-row').forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
      return;
    }
    var res = bulletsWithSkill(state.skill);
    $$('.bullet').forEach(function (li) {
      var on = !!res.ids[li.getAttribute('data-id')];
      li.classList.toggle('is-hit', on);
      li.classList.toggle('is-dimmed', !on);
    });
    // reveal any matching bullet parked in the overflow
    R.experience.forEach(function (j) {
      var art = $('#job-' + j.id);
      if ($$('.bullet.is-overflow.is-hit', art).length && art.classList.contains('is-collapsed')) {
        art.classList.remove('is-collapsed');
        var b = $('.more-btn[data-job="' + j.id + '"]');
        if (b) { syncMoreLabel(b); }
      }
    });
    $('#filter-text').innerHTML = '<b>' + esc(state.skill) + '</b> — ' + res.count +
      ' achievement' + (res.count === 1 ? '' : 's') + ' across ' + res.jobs +
      ' role' + (res.jobs === 1 ? '' : 's');
    bar.classList.add('is-open');
    $$('#skills-list .chip').forEach(function (c) {
      c.setAttribute('aria-pressed', plain(c.getAttribute('data-skill')) === state.skill);
    });
    $$('.cov-row').forEach(function (c) {
      c.setAttribute('aria-pressed', plain(c.getAttribute('data-skill')) === state.skill);
    });
  }

  function setSkill(skill) {
    state.skill = (state.skill === skill) ? null : skill;
    applySkillFilter();
  }

  /* ---------- static panels ------------------------------------------------ */

  function renderPublications() {
    $('#publications-list').innerHTML = R.publications.map(function (p) {
      var link = p.doi
        ? '<a href="https://doi.org/' + p.doi + '" target="_blank" rel="noopener" class="doi">doi:' + p.doi + '</a>'
        : (p.isbn ? '<span class="doi">ISBN ' + p.isbn + '</span>' : '');
      return '<div class="entry"><div class="entry-main">' +
        '<p class="entry-title">' + p.title + '</p>' +
        '<p class="entry-sub">' + p.authors + '</p>' +
        '<p class="entry-detail">' + p.venue + (link ? ' · ' + link : '') + '</p>' +
        '</div><div class="entry-side">' + p.year + '</div></div>';
    }).join('');
    $('#pub-meta').textContent = R.publications.length + ' peer-reviewed';
  }

  function renderEducation() {
    var rows = R.education.filter(function (e) { return !e.hidden; });
    $('#education-list').innerHTML = rows.map(function (e) {
      var d = [];
      if (e.detail) { d.push(e.detail); }
      if (e.thesis) { d.push('Thesis: <em>' + e.thesis + '</em>'); }
      if (e.gpa) { d.push(e.gpa); }
      return '<div class="entry"><div class="entry-main">' +
        '<p class="entry-title">' + e.school + '</p>' +
        '<p class="entry-sub">' + e.degree + '</p>' +
        (d.length ? '<p class="entry-detail">' + d.join('<br>') + '</p>' : '') +
        '</div><div class="entry-side">' + e.dates + '<br>' + e.location + '</div></div>';
    }).join('');
    $('#edu-meta').textContent = rows.length + ' degrees';
  }

  function renderCerts() {
    var rows = R.certifications.filter(function (c) { return !c.hidden; });
    $('#certifications-list').innerHTML = rows.map(function (c) {
      return '<div class="entry"><div class="entry-main">' +
        '<p class="entry-title">' + c.name + '</p>' +
        '<p class="entry-sub">' + c.issuer + '</p>' +
        '</div><div class="entry-side">' + c.date + '</div></div>';
    }).join('');
    $('#cert-meta').textContent = rows.length + ' active';
  }

  /* ---------- search -------------------------------------------------------- */

  var index = [];
  function buildIndex() {
    index = [];
    R.experience.forEach(function (j) {
      j.bullets.forEach(function (b) {
        index.push({ kind: plain(j.org).split(',')[0], text: plain(b.text),
                     target: '#job-' + j.id, id: b.id });
      });
    });
    R.publications.forEach(function (p, i) {
      index.push({ kind: 'Publication', text: plain(p.title + ' — ' + p.venue),
                   target: '#publications', id: 'pub' + i });
    });
    R.education.filter(function (e) { return !e.hidden; }).forEach(function (e, i) {
      index.push({ kind: 'Education', text: plain(e.school + ' — ' + e.degree),
                   target: '#education', id: 'edu' + i });
    });
    var seen = {};
    Object.keys(R.skills).forEach(function (k) {
      R.skills[k].forEach(function (g) {
        g.items.forEach(function (s) {
          var t = plain(s);
          if (!seen[t]) {
            seen[t] = true;
            index.push({ kind: 'Skill', text: t, target: '#skills', skill: t });
          }
        });
      });
    });
  }

  function initSearch() {
    var back = $('#search-back'), input = $('#search-input'), out = $('#search-results');
    var active = -1, rows = [];

    function open() {
      setView('dash');
      back.classList.add('is-open');
      input.value = ''; out.innerHTML = ''; active = -1; rows = [];
      input.focus();
    }
    function close() { back.classList.remove('is-open'); }

    function draw() {
      var q = input.value.trim().toLowerCase();
      rows = q ? index.filter(function (r) { return r.text.toLowerCase().indexOf(q) !== -1; })
                      .slice(0, 12) : [];
      if (!q) { out.innerHTML = ''; return; }
      if (!rows.length) { out.innerHTML = '<div class="search-empty">No matches</div>'; return; }
      out.innerHTML = rows.map(function (r, i) {
        return '<button type="button" class="sr" data-i="' + i + '">' +
          '<span class="sr-kind">' + esc(r.kind) + '</span>' +
          esc(r.text.length > 130 ? r.text.slice(0, 130) + '…' : r.text) + '</button>';
      }).join('');
      active = 0; highlight();
    }
    function highlight() {
      $$('.sr', out).forEach(function (el, i) { el.classList.toggle('is-active', i === active); });
    }
    function go(i) {
      var r = rows[i];
      if (!r) { return; }
      close();
      if (r.skill) { state.skill = null; setSkill(r.skill); }
      var t = document.querySelector(r.target);
      if (t) { t.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
      if (r.id) {
        var li = document.querySelector('.bullet[data-id="' + r.id + '"]');
        if (li) {
          var art = li.closest('.job');
          if (art) { art.classList.remove('is-collapsed'); $$('.more-btn').forEach(syncMoreLabel); }
          li.classList.add('is-hit');
          setTimeout(function () { if (!state.skill) { li.classList.remove('is-hit'); } }, 2400);
        }
      }
    }

    input.addEventListener('input', draw);
    out.addEventListener('click', function (e) {
      var b = e.target.closest('.sr');
      if (b) { go(parseInt(b.getAttribute('data-i'), 10)); }
    });
    back.addEventListener('mousedown', function (e) { if (e.target === back) { close(); } });
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, rows.length - 1); highlight(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); highlight(); }
      else if (e.key === 'Enter') { e.preventDefault(); go(active); }
      else if (e.key === 'Escape') { close(); }
    });
    $('#search-btn').addEventListener('click', open);

    document.addEventListener('keydown', function (e) {
      var tag = (e.target.tagName || '').toLowerCase();
      var typing = tag === 'input' || tag === 'textarea';
      if (e.key === 'Escape') {
        if (back.classList.contains('is-open')) { close(); }
        else if (state.skill) { state.skill = null; applySkillFilter(); }
        return;
      }
      if (typing) { return; }
      if (e.key === '/' || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault(); open();
      }
    });
  }

  /* ---------- scroll spy ---------------------------------------------------- */

  function initSpy() {
    var links = {};
    $$('.nav-links a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var secs = Object.keys(links).map(function (id) { return document.getElementById(id); })
                     .filter(Boolean);
    if (!('IntersectionObserver' in window) || !secs.length) { return; }
    var visible = {};
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { visible[en.target.id] = en.isIntersecting; });
      var cur = null;
      secs.forEach(function (s) { if (visible[s.id] && !cur) { cur = s.id; } });
      Object.keys(links).forEach(function (id) {
        links[id].setAttribute('aria-current', id === cur ? 'true' : 'false');
      });
    }, { rootMargin: '-64px 0px -70% 0px' });
    secs.forEach(function (s) { io.observe(s); });
  }

  /* ---------- URL ----------------------------------------------------------- */

  function syncUrl() {
    var url = new URL(window.location.href);
    if (state.role === DEFAULT_ROLE) { url.searchParams.delete('role'); }
    else { url.searchParams.set('role', state.role); }
    if (state.view === 'dash') { url.searchParams.delete('view'); }
    else { url.searchParams.set('view', state.view); }
    history.replaceState(null, '', url.pathname + (url.search || '') + url.hash);
  }

  /* ---------- views --------------------------------------------------------- */

  function setView(view) {
    if (view !== 'sql') { view = 'dash'; }
    state.view = view;
    $('#view-dash').hidden = view !== 'dash';
    $('#view-sql').hidden = view !== 'sql';
    $('#nav-links').style.visibility = view === 'dash' ? '' : 'hidden';
    $$('.viewtab').forEach(function (t) {
      t.setAttribute('aria-selected', t.getAttribute('data-view') === view ? 'true' : 'false');
    });
    if (view === 'sql' && window.Worksheet) { window.Worksheet.activate(); }
    syncUrl();
  }

  function initViews() {
    $$('.viewtab').forEach(function (t) {
      t.addEventListener('click', function () { setView(t.getAttribute('data-view')); });
    });
  }

  /* ---------- role switching ------------------------------------------------ */

  function setRole(role, opts) {
    if (!isRole(role)) { role = DEFAULT_ROLE; }
    var first = opts && opts.first;
    if (!first && role === state.role) { return; }
    state.role = role;

    $$('.switch-opt').forEach(function (b) {
      var on = b.getAttribute('data-role') === role;
      b.setAttribute('aria-checked', on ? 'true' : 'false');
      b.setAttribute('tabindex', on ? '0' : '-1');
    });

    paintHero(role);
    renderStats(role);
    renderSkills(role);
    renderCoverage(role);
    paintBullets(role, !first);

    var shown = 0;
    R.experience.forEach(function (j) {
      j.bullets.forEach(function (b) { if (relevantTo(b, role)) { shown++; } });
    });
    var total = R.experience.reduce(function (n, j) { return n + j.bullets.length; }, 0);
    var r = roleById(role);
    $('#toolbar-note').innerHTML = role === 'unified'
      ? '<b>' + total + '</b> achievements, ranked by impact'
      : '<b>' + shown + '</b> of ' + total + ' achievements lead for ' + plain(r.as);

    try { localStorage.setItem(LS_ROLE, role); } catch (e) {}
    syncUrl();
    document.title = role === 'unified'
      ? R.meta.name + ' — ' + plain(r.as)
      : R.meta.name + ' as ' + plain(r.as);
  }

  /* ---------- boot ---------------------------------------------------------- */

  function boot() {
    var m = R.meta;
    $('#hero-name').textContent = m.name;
    $('#hero-meta').innerHTML =
      '<span>' + m.title + ' at ' + m.employer + '</span><span>' + m.location + '</span>';
    $('#foot-updated').textContent = m.updated;
    $('#foot-gh').href = m.github;
    $('#foot-li').href = m.linkedin;
    $('#print-url').textContent = m.site;

    renderContact();
    renderSwitch();
    renderTimeline();
    renderExperience();
    renderPublications();
    renderEducation();
    renderCerts();
    buildIndex();

    $('#skills-list').addEventListener('click', function (e) {
      var c = e.target.closest('.chip');
      if (c && !c.classList.contains('is-inert')) { setSkill(plain(c.getAttribute('data-skill'))); }
    });
    $('#coverage').addEventListener('click', function (e) {
      var c = e.target.closest('.cov-row');
      if (c) { setSkill(plain(c.getAttribute('data-skill'))); }
    });
    $('#filter-clear').addEventListener('click', function () {
      state.skill = null; applySkillFilter();
    });

    initTheme();
    initSearch();
    initSpy();
    initViews();

    // A shared ?role= / ?view= link wins over the stored preference.
    var q = new URLSearchParams(window.location.search);
    var saved = null;
    try { saved = localStorage.getItem(LS_ROLE); } catch (e) {}
    setRole(q.get('role') || saved || DEFAULT_ROLE, { first: true });
    setView(q.get('view') || 'dash');

    document.body.removeAttribute('data-loading');
  }

  // exposed for worksheet.js
  window.ResumeApp = {
    state: state,
    setSkill: setSkill,
    setView: function (v) { setView(v); },
    weightOf: weightOf,
    plain: plain,
    esc: esc
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
