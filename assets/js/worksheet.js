/* =============================================================================
   worksheet.js — a Snowsight/Databricks-style SQL worksheet over the résumé.

   Real SQLite, compiled to WebAssembly (sql.js), running entirely in the
   visitor's browser. Nothing is uploaded and no server is involved, which is
   why this works on a static GitHub Pages host. The engine is vendored under
   assets/vendor/ and lazy-loaded the first time the SQL tab is opened, so the
   dashboard never pays for it.
   ============================================================================= */
(function () {
  'use strict';

  var R = window.RESUME;
  if (!R) { return; }

  var VENDOR = 'assets/vendor/';
  var db = null;
  var loading = false;
  var ready = false;

  var $ = function (s) { return document.querySelector(s); };
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  var scratch = document.createElement('div');
  function plain(html) { scratch.innerHTML = html; return scratch.textContent || ''; }
  function q(s) { return "'" + String(s).replace(/'/g, "''") + "'"; }

  /* ---------- schema ------------------------------------------------------ */

  var SCHEMA = [
    { name: 'experience', cols: [
      ['id', 'TEXT'], ['org', 'TEXT'], ['title', 'TEXT'], ['location', 'TEXT'],
      ['start_date', 'TEXT'], ['end_date', 'TEXT'], ['is_current', 'INT']
    ]},
    { name: 'achievements', cols: [
      ['id', 'TEXT'], ['job_id', 'TEXT'], ['org', 'TEXT'], ['achievement', 'TEXT'],
      ['skills', 'TEXT'], ['score_overview', 'INT'], ['score_data_analyst', 'INT'],
      ['score_analytics_engineer', 'INT'], ['score_data_scientist', 'INT'],
      ['score_data_engineer', 'INT']
    ]},
    { name: 'achievement_skills', cols: [['achievement_id', 'TEXT'], ['skill', 'TEXT']] },
    { name: 'skills', cols: [['skill', 'TEXT'], ['category', 'TEXT'], ['role_view', 'TEXT']] },
    { name: 'publications', cols: [
      ['year', 'INT'], ['title', 'TEXT'], ['venue', 'TEXT'], ['authors', 'TEXT'], ['doi', 'TEXT']
    ]},
    { name: 'education', cols: [
      ['school', 'TEXT'], ['degree', 'TEXT'], ['location', 'TEXT'], ['dates', 'TEXT'], ['gpa', 'TEXT']
    ]},
    { name: 'certifications', cols: [['name', 'TEXT'], ['issuer', 'TEXT'], ['issued', 'TEXT']] }
  ];

  var EXAMPLES = [
    { label: 'Highest impact', sql:
      '-- The achievements I am proudest of, ranked\n' +
      'SELECT org, achievement, score_overview AS score\n' +
      'FROM   achievements\n' +
      'ORDER  BY score DESC\n' +
      'LIMIT  5;' },
    { label: 'Most-used skills', sql:
      '-- Which technologies show up across the most work?\n' +
      'SELECT   skill, COUNT(*) AS achievements\n' +
      'FROM     achievement_skills\n' +
      'GROUP BY skill\n' +
      'HAVING   COUNT(*) > 1\n' +
      'ORDER BY achievements DESC, skill\n' +
      'LIMIT    12;' },
    { label: 'Everything Snowflake', sql:
      '-- Join achievements to their skills\n' +
      'SELECT a.org, a.achievement\n' +
      'FROM   achievements a\n' +
      'JOIN   achievement_skills s ON s.achievement_id = a.id\n' +
      'WHERE  s.skill = \'Snowflake\'\n' +
      'ORDER  BY a.score_overview DESC;' },
    { label: 'Fit: data engineer', sql:
      '-- Re-rank the same record for a different role\n' +
      'SELECT org, achievement, score_data_engineer AS fit\n' +
      'FROM   achievements\n' +
      'WHERE  score_data_engineer >= 80\n' +
      'ORDER  BY fit DESC;' },
    { label: 'Tenure', sql:
      'SELECT org, title, start_date, end_date,\n' +
      '       CASE WHEN is_current = 1 THEN \'yes\' ELSE \'no\' END AS current\n' +
      'FROM   experience\n' +
      'ORDER  BY start_date DESC;' },
    { label: 'Research', sql:
      'SELECT year, title, venue, doi\n' +
      'FROM   publications\n' +
      'ORDER  BY year DESC;' }
  ];

  var DEFAULT_SQL = EXAMPLES[0].sql;

  /* ---------- build the database ------------------------------------------ */

  function buildDb(SQL) {
    var d = new SQL.Database();
    var stmts = [];

    SCHEMA.forEach(function (t) {
      stmts.push('CREATE TABLE ' + t.name + ' (' +
        t.cols.map(function (c) { return c[0] + ' ' + c[1]; }).join(', ') + ');');
    });

    R.experience.forEach(function (j) {
      stmts.push('INSERT INTO experience VALUES (' + [
        q(j.id), q(plain(j.org)), q(plain(j.title)), q(j.location),
        q(j.start), j.end ? q(j.end) : 'NULL', j.end ? 0 : 1
      ].join(', ') + ');');

      j.bullets.forEach(function (b) {
        var w = b.weight || {};
        stmts.push('INSERT INTO achievements VALUES (' + [
          q(b.id), q(j.id), q(plain(j.org).split(',')[0]), q(plain(b.text)),
          q((b.skills || []).join(', ')),
          w.unified | 0, w['data-analyst'] | 0, w['analytics-engineer'] | 0,
          w['data-scientist'] | 0, w['data-engineer'] | 0
        ].join(', ') + ');');

        (b.skills || []).forEach(function (s) {
          stmts.push('INSERT INTO achievement_skills VALUES (' +
            q(b.id) + ', ' + q(plain(s)) + ');');
        });
      });
    });

    Object.keys(R.skills).forEach(function (role) {
      R.skills[role].forEach(function (g) {
        g.items.forEach(function (s) {
          stmts.push('INSERT INTO skills VALUES (' +
            [q(plain(s)), q(plain(g.group)), q(role)].join(', ') + ');');
        });
      });
    });

    R.publications.forEach(function (p) {
      stmts.push('INSERT INTO publications VALUES (' + [
        p.year, q(plain(p.title)), q(plain(p.venue)), q(plain(p.authors)),
        p.doi ? q(p.doi) : 'NULL'
      ].join(', ') + ');');
    });

    R.education.filter(function (e) { return !e.hidden; }).forEach(function (e) {
      stmts.push('INSERT INTO education VALUES (' + [
        q(plain(e.school)), q(plain(e.degree)), q(e.location), q(e.dates), q(plain(e.gpa || ''))
      ].join(', ') + ');');
    });

    R.certifications.filter(function (c) { return !c.hidden; }).forEach(function (c) {
      stmts.push('INSERT INTO certifications VALUES (' + [
        q(plain(c.name)), q(plain(c.issuer)), q(c.date)
      ].join(', ') + ');');
    });

    d.run(stmts.join('\n'));
    return d;
  }

  /* ---------- object explorer ---------------------------------------------- */

  function rowCount(table) {
    try {
      var r = db.exec('SELECT COUNT(*) FROM ' + table);
      return r[0].values[0][0];
    } catch (e) { return '—'; }
  }

  function renderTree() {
    var dbIcon = '<svg viewBox="0 0 16 16" aria-hidden="true">' +
      '<ellipse cx="8" cy="4" rx="5.2" ry="2.2" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
      '<path d="M2.8 4v8c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2V4" fill="none" stroke="currentColor" stroke-width="1.3"/>' +
      '<path d="M2.8 8c0 1.2 2.3 2.2 5.2 2.2s5.2-1 5.2-2.2" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>';

    var html = '<div class="tree-db">' + dbIcon + 'RESUME</div>';
    SCHEMA.forEach(function (t) {
      html += '<button type="button" class="tree-tbl" data-tbl="' + t.name +
              '" aria-expanded="false">' +
              '<span class="caret">&#9656;</span>' + t.name +
              '<span class="cnt">' + rowCount(t.name) + '</span></button>' +
              '<ul class="tree-cols" id="cols-' + t.name + '" hidden>' +
              t.cols.map(function (c) {
                return '<li><span>' + c[0] + '</span><span class="ty">' + c[1] + '</span></li>';
              }).join('') + '</ul>';
    });
    $('#ws-tree').innerHTML = html;

    $('#ws-tree').addEventListener('click', function (e) {
      var b = e.target.closest('.tree-tbl');
      if (!b) { return; }
      var name = b.getAttribute('data-tbl');
      var open = b.getAttribute('aria-expanded') === 'true';
      b.setAttribute('aria-expanded', open ? 'false' : 'true');
      document.getElementById('cols-' + name).hidden = open;
    });

    $('#ws-tree').addEventListener('dblclick', function (e) {
      var b = e.target.closest('.tree-tbl');
      if (b) { setSql('SELECT *\nFROM   ' + b.getAttribute('data-tbl') + '\nLIMIT  20;'); run(); }
    });
  }

  /* ---------- editor -------------------------------------------------------- */

  function syncGutter() {
    var ed = $('#ws-editor');
    var n = ed.value.split('\n').length;
    var out = [];
    for (var i = 1; i <= Math.max(n, 1); i++) { out.push(i); }
    $('#ws-gutter').textContent = out.join('\n');
  }

  function setSql(sql) {
    $('#ws-editor').value = sql;
    syncGutter();
  }

  function setStatus(text, isErr) {
    var el = $('#ws-status');
    el.textContent = text;
    el.classList.toggle('is-err', !!isErr);
  }

  function setDot(cls) {
    $('#ws-dot').className = 'ws-dot' + (cls ? ' ' + cls : '');
  }

  /* ---------- run ----------------------------------------------------------- */

  function run() {
    if (!ready || !db) { return; }
    var sql = $('#ws-editor').value.trim();
    var out = $('#ws-out');
    if (!sql) {
      out.innerHTML = '<div class="ws-msg">Type a query, then press Run.</div>';
      setStatus('idle');
      return;
    }
    setDot('is-busy');
    var t0 = performance.now();
    var res;
    try {
      res = db.exec(sql);
    } catch (err) {
      setDot('is-err');
      setStatus('error', true);
      out.innerHTML = '<div class="ws-msg is-err">' + esc(err.message || String(err)) + '</div>';
      return;
    }
    var ms = Math.max(performance.now() - t0, 0.1);
    setDot('');

    if (!res.length) {
      out.innerHTML = '<div class="ws-msg">Statement ran; no rows returned.</div>';
      setStatus('0 rows · ' + ms.toFixed(1) + ' ms');
      return;
    }

    var r = res[res.length - 1];
    var wideAt = r.columns.reduce(function (acc, c, i) {
      if (/achievement|title|venue|authors|degree|name/i.test(c)) { acc[i] = true; }
      return acc;
    }, {});

    var html = '<table class="ws-table"><thead><tr><th></th>' +
      r.columns.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') +
      '</tr></thead><tbody>';

    r.values.forEach(function (row, i) {
      html += '<tr><td class="ws-rownum">' + (i + 1) + '</td>' + row.map(function (v, ci) {
        if (v === null) { return '<td class="num">NULL</td>'; }
        var isNum = typeof v === 'number';
        var cls = isNum ? 'num' : (wideAt[ci] ? 'wide' : '');
        return '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + esc(v) + '</td>';
      }).join('') + '</tr>';
    });
    html += '</tbody></table>';

    out.innerHTML = html;
    out.scrollTop = 0;
    setStatus(r.values.length + (r.values.length === 1 ? ' row · ' : ' rows · ') + ms.toFixed(1) + ' ms');
  }

  /* ---------- boot ---------------------------------------------------------- */

  function renderExamples() {
    var bar = $('#ws-examples');
    EXAMPLES.forEach(function (ex, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'ex';
      b.textContent = ex.label;
      b.addEventListener('click', function () { setSql(EXAMPLES[i].sql); run(); });
      bar.appendChild(b);
    });
  }

  function wireEditor() {
    var ed = $('#ws-editor');
    ed.addEventListener('input', syncGutter);
    ed.addEventListener('scroll', function () { $('#ws-gutter').scrollTop = ed.scrollTop; });
    ed.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') { e.preventDefault(); run(); }
      if (e.key === 'Tab') {
        e.preventDefault();
        var s = ed.selectionStart, t = ed.selectionEnd;
        ed.value = ed.value.slice(0, s) + '  ' + ed.value.slice(t);
        ed.selectionStart = ed.selectionEnd = s + 2;
        syncGutter();
      }
    });
    $('#ws-run').addEventListener('click', run);

    if (/Mac|iPhone|iPad/.test(navigator.platform || '')) {
      $('#ws-kbd').textContent = '⌘ + Enter';
    }
  }

  function fail(msg) {
    ready = false;
    setDot('is-err');
    setStatus('engine unavailable', true);
    $('#ws-run').disabled = true;
    $('#ws-out').innerHTML = '<div class="ws-msg">' + esc(msg) + '</div>';
  }

  function load() {
    if (loading || ready) { return; }
    loading = true;
    setDot('is-busy');
    setStatus('loading engine…');

    var s = document.createElement('script');
    s.src = VENDOR + 'sql-wasm.js';
    s.onerror = function () {
      loading = false;
      fail('Could not load the SQL engine. The dashboard view has the same information.');
    };
    s.onload = function () {
      if (typeof window.initSqlJs !== 'function') {
        loading = false;
        return fail('SQL engine did not initialise.');
      }
      window.initSqlJs({ locateFile: function (f) { return VENDOR + f; } })
        .then(function (SQL) {
          db = buildDb(SQL);
          ready = true;
          loading = false;
          renderTree();
          setDot('');
          setStatus('ready');
          $('#ws-run').disabled = false;
          if (!$('#ws-editor').value.trim()) { setSql(DEFAULT_SQL); }
          run();
        })
        .catch(function (err) {
          loading = false;
          fail('WebAssembly is unavailable in this browser (' +
               (err && err.message ? err.message : 'unknown error') +
               '). The dashboard view has the same information.');
        });
    };
    document.head.appendChild(s);
  }

  function init() {
    renderExamples();
    wireEditor();
    setSql(DEFAULT_SQL);
    $('#ws-run').disabled = true;
    setStatus('engine loads on first use');
    setDot('is-busy');
  }

  window.Worksheet = {
    activate: function () { load(); },
    run: run,
    setSql: setSql,
    onThemeChange: function () {}
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
