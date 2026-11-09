/* =========================================================
   JLPT N3 — SPA Application (Uzbek · Latin)
   ---------------------------------------------------------
   Testlar oqimi:
     Rejim tanlash → Miqdor tanlash → Savol → Natija

   - Savollar har safar Fisher-Yates bilan aralashtiriladi
   - Natijalar SAQLANMAYDI (faqat joriy sessiya uchun)
   ========================================================= */

(function () {
  'use strict';

  /* =========================================================
     1. UTILS
     ========================================================= */

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

  const escapeHtml = (str) =>
    str == null ? '' : String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

  /** 漢字[かんじ] → <ruby>漢字<rt>かんじ</rt></ruby> */
  function furigana(text) {
    if (!text) return '';
    return escapeHtml(text).replace(
      /([\u4E00-\u9FAF\u3400-\u4DBF\u3005\u30F6]+)\[([^\]]+)\]/g,
      (_, b, r) => `<ruby>${b}<rt>${r}</rt></ruby>`
    );
  }

  function shuffleArray(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* =========================================================
     2. ICONS
     ========================================================= */

  const I = {
    grammar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    vocab: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
    tests: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>`,
    settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
    chevron: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`,
    back: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
  };

  /* =========================================================
     3. CATEGORIES
     ========================================================= */

  const CATEGORIES = {
    'Concession': { jp: '逆接', uz: 'Qarama-qarshilik', cls: 'bg-rose-100 text-rose-700 border-rose-200',       dot: 'bg-rose-500'    },
    'Reason':     { jp: '理由', uz: 'Sabab',            cls: 'bg-indigo-100 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500'  },
    'Condition':  { jp: '条件', uz: 'Shart',            cls: 'bg-cyan-100 text-cyan-700 border-cyan-200',       dot: 'bg-cyan-500'    },
    'Tendency':   { jp: '傾向', uz: 'Moyillik',         cls: 'bg-amber-100 text-amber-700 border-amber-200',    dot: 'bg-amber-500'   },
    'Degree':     { jp: '程度', uz: 'Daraja',           cls: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500'  },
    'Judgement':  { jp: '判断', uz: 'Hukm',             cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
    'Expression': { jp: '表現', uz: 'Ifoda',            cls: 'bg-slate-100 text-slate-700 border-slate-300',    dot: 'bg-slate-500'   },
  };
  const catMeta = (cat) => CATEGORIES[cat] || CATEGORIES['Expression'];

  /* =========================================================
     4. TABS
     ========================================================= */

  const TABS = [
    { id: 'grammar',  label: 'Grammatika', icon: I.grammar  },
    { id: 'vocab',    label: "Lug'at",     icon: I.vocab    },
    { id: 'tests',    label: 'Testlar',    icon: I.tests    },
    { id: 'settings', label: 'Sozlamalar', icon: I.settings },
  ];

  /* =========================================================
     5. STATE
     ========================================================= */

  const state = {
    tab: 'grammar',
    grammar: { query: '', category: 'all' },
    quiz: {
      mode: null,       // null = rejim tanlash; 'grammar' | 'vocab' | 'mixed'
      count: null,      // null = miqdor tanlash; 20 | 30 | 50 | 75 | 100
      pool: [],         // joriy sessiya uchun aralashtirilgan savollar
      index: 0,
      score: 0,
      selected: null,
      answered: false,
      finished: false
    }
  };

  /* =========================================================
     6. QUIZ HELPERS
     ========================================================= */

  const COUNT_PRESETS = [20, 30, 50, 75, 100];

  function getQuizPools() {
    const raw = window.quizData;
    if (!raw) return { grammar: [], vocab: [] };
    if (Array.isArray(raw)) return { grammar: raw, vocab: [] }; // backward compat
    return {
      grammar: Array.isArray(raw.grammar) ? raw.grammar : [],
      vocab:   Array.isArray(raw.vocab)   ? raw.vocab   : []
    };
  }

  function getModeSource(mode) {
    const pools = getQuizPools();
    if (mode === 'grammar') return pools.grammar;
    if (mode === 'vocab')   return pools.vocab;
    if (mode === 'mixed')   return [...pools.grammar, ...pools.vocab];
    return [];
  }

  const modeLabel = (m) => ({ grammar: 'Grammatika', vocab: "Lug'at", mixed: 'Aralash' }[m] || '');

  function estimateMinutes(count) {
    return Math.max(1, Math.round(count * 0.5));
  }

  function selectQuizMode(mode) {
    if (!getModeSource(mode).length) return;
    state.quiz = {
      mode,
      count: null,
      pool: [],
      index: 0,
      score: 0,
      selected: null,
      answered: false,
      finished: false
    };
    renderApp();
  }

  function startQuizWithCount(count) {
    const source = getModeSource(state.quiz.mode);
    if (!source.length) return;
    const actual = Math.min(count, source.length);
    const shuffled = shuffleArray(source).slice(0, actual);

    state.quiz = {
      mode: state.quiz.mode,
      count: actual,
      pool: shuffled,
      index: 0,
      score: 0,
      selected: null,
      answered: false,
      finished: false
    };
    renderApp();
  }

  /** Testdan chiqish (savol ekranidan) — miqdor tanlashga qaytaradi */
  function leaveQuiz() {
    const q = state.quiz;
    const nothingToLose = q.index === 0 && !q.answered;
    if (!nothingToLose && !confirm('Testni tark etasizmi? Joriy natija saqlanmaydi.')) return;

    state.quiz = {
      mode: q.mode,
      count: null,
      pool: [],
      index: 0,
      score: 0,
      selected: null,
      answered: false,
      finished: false
    };
    renderApp();
  }

  /** Qaytadan — bir xil rejim + miqdor, yangi savollar */
  function restartQuiz() {
    const { mode, count } = state.quiz;
    if (mode && count) startQuizWithCount(count);
  }

  /** Miqdorni o'zgartirish (natijadan) — rejimni saqlab qoladi */
  function changeCount() {
    state.quiz.count = null;
    state.quiz.pool = [];
    state.quiz.index = 0;
    state.quiz.score = 0;
    state.quiz.selected = null;
    state.quiz.answered = false;
    state.quiz.finished = false;
    renderApp();
  }

  /** Rejim tanlashga qaytish */
  function backToQuizModes() {
    state.quiz = {
      mode: null, count: null, pool: [],
      index: 0, score: 0,
      selected: null, answered: false, finished: false
    };
    renderApp();
  }

  /* =========================================================
     7. SCREENS — GRAMMAR
     ========================================================= */

  function renderGrammar() {
    const data = window.grammarData || [];
    if (!data.length) return emptyState(
      "Grammatika bo'sh",
      "data.js fayliga window.grammarData obyektlarini qo'shing"
    );

    const lessons = [...new Set(data.map(g => g.lesson))].filter(Boolean).sort((a, b) => a - b);
    const categories = [...new Set(data.map(g => g.category))].filter(Boolean);

    const filtered = data.filter(g => {
      const q = state.grammar.query.toLowerCase().trim();
      const matchQuery = !q
        || (g.title || '').toLowerCase().includes(q)
        || (g.meaningUz || '').toLowerCase().includes(q)
        || (g.titleRomaji || '').toLowerCase().includes(q);
      const matchCat = state.grammar.category === 'all' || g.category === state.grammar.category;
      return matchQuery && matchCat;
    });

    const catChips = categories.length > 1 ? `
      <div class="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 mt-4 scrollbar-hide">
        <button class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
          ${state.grammar.category === 'all' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}"
          data-filter-category="all">Barchasi</button>
        ${categories.map(c => {
          const m = catMeta(c);
          const active = state.grammar.category === c;
          return `<button class="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
            ${active ? 'bg-slate-900 text-white border-slate-900' : `${m.cls}`}"
            data-filter-category="${c}">${m.uz}</button>`;
        }).join('')}
      </div>
    ` : '';

    const cards = filtered.map((item) => {
      const meta = catMeta(item.category);
      return `
        <button data-grammar-index="${data.indexOf(item)}"
          class="group w-full text-left bg-white rounded-2xl p-4 border border-slate-200
                 hover:border-indigo-300 hover:shadow-md hover:shadow-indigo-100/50
                 transition-all active:scale-[0.985]">

          <div class="flex items-start justify-between gap-3 mb-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider
                           px-2 py-1 rounded-md bg-amber-100 text-amber-800">
                ${item.lesson}-dars
              </span>
              ${item.category ? `
                <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${meta.cls}">
                  <span class="w-1.5 h-1.5 rounded-full ${meta.dot}"></span>
                  ${meta.jp} ${meta.uz}
                </span>` : ''}
            </div>
            <span class="shrink-0 w-5 h-5 text-slate-300 group-hover:text-indigo-500 transition-colors">${I.chevron}</span>
          </div>

          <div class="text-xl font-bold text-slate-900 leading-tight font-jp mb-1">
            ${escapeHtml(item.title)}
          </div>
          ${item.titleRomaji ? `<div class="text-xs text-slate-400 font-medium mb-1">${escapeHtml(item.titleRomaji)}</div>` : ''}

          <div class="text-sm text-slate-600 leading-snug mt-2">
            ${escapeHtml(item.meaningShort || item.meaningUz || '')}
          </div>
        </button>
      `;
    }).join('');

    const emptyResult = filtered.length === 0 ? `
      <div class="text-center py-12">
        <div class="text-4xl mb-3">🔍</div>
        <div class="text-slate-500 text-sm">Hech narsa topilmadi</div>
      </div>
    ` : '';

    return `
      <div class="px-4 pt-3">
        <div class="hero-gradient rounded-3xl p-5 text-white relative overflow-hidden">
          <div class="absolute -right-6 -top-6 text-white/10 text-[120px] font-black leading-none select-none font-jp">文</div>
          <div class="absolute -right-2 bottom-0 text-white/10 text-[80px] font-black leading-none select-none font-jp">法</div>
          <div class="relative">
            <div class="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">JLPT N3</div>
            <h1 class="text-2xl font-bold">Grammatika</h1>
            <p class="text-sm text-indigo-100 mt-1">${data.length} ta konstruksiya · ${lessons[0]}–${lessons[lessons.length - 1]}-darslar</p>
          </div>
        </div>

        <div class="relative mt-4">
          <span class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400">${I.search}</span>
          <input
            id="grammarSearch"
            type="search"
            value="${escapeHtml(state.grammar.query)}"
            placeholder="Grammatikadan qidirish..."
            class="search-input w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm
                   focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
          />
        </div>

        ${catChips}

        <div class="stagger flex flex-col gap-3 mt-4">${cards}${emptyResult}</div>
      </div>
    `;
  }

  /* =========================================================
     8. SCREEN — VOCAB (placeholder)
     ========================================================= */

  function renderVocab() {
    return emptyState("Lug'at", "Bo'lim tez orada · 単語", '📖');
  }

  /* =========================================================
     9. SCREEN — TESTS (router: mode → count → question → finished)
     ========================================================= */

  function renderQuiz() {
    const q = state.quiz;

    if (!q.mode)  return renderQuizModeSelection();
    if (!q.count) return renderQuizCountSelection();
    if (q.finished) return renderQuizFinished();

    return renderQuizQuestion();
  }

  /* ---------- 9.1 Rejim tanlash ---------- */
  function renderQuizModeSelection() {
    const pools = getQuizPools();
    const gCount = pools.grammar.length;
    const vCount = pools.vocab.length;
    const mCount = gCount + vCount;
    const mEnabled = gCount > 0 && vCount > 0;

    return `
      <div class="px-4 pt-3 animate-in">
        <div class="hero-gradient rounded-3xl p-5 text-white relative overflow-hidden mb-5">
          <div class="absolute -right-6 -top-6 text-white/10 text-[120px] font-black leading-none select-none font-jp">試</div>
          <div class="relative">
            <div class="text-xs font-semibold uppercase tracking-wider text-indigo-200 mb-1">JLPT N3</div>
            <h1 class="text-2xl font-bold">Testlar</h1>
            <p class="text-sm text-indigo-100 mt-1">Bilimingizni sinab ko'ring</p>
          </div>
        </div>

        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Rejimni tanlang</h2>

        <div class="flex flex-col gap-3 stagger">
          ${modeCard('grammar', '📖', 'Grammatika', 'Grammatik savollar', gCount, 'from-indigo-500 to-violet-500', gCount > 0)}
          ${modeCard('vocab', '📚', "Lug'at", "So'z boyligi savollar", vCount, 'from-emerald-500 to-teal-500', vCount > 0)}
          ${modeCard('mixed', '🎯', 'Aralash', "Grammatika + Lug'at", mCount, 'from-amber-500 to-orange-500', mEnabled)}
        </div>

        <p class="text-center text-xs text-slate-400 mt-6 px-4">
          Har safar savollar yangi tartibda aralashtiriladi 🎲
        </p>
      </div>
    `;
  }

  function modeCard(mode, emoji, title, subtitle, count, gradient, enabled) {
    if (!enabled) {
      return `
        <div class="w-full text-left bg-white rounded-2xl p-4 border-2 border-dashed border-slate-200 opacity-60">
          <div class="flex items-center justify-between gap-3">
            <div class="flex items-center gap-3 flex-1 min-w-0">
              <div class="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-2xl">${emoji}</div>
              <div class="flex-1 min-w-0">
                <div class="font-bold text-slate-700">${title}</div>
                <div class="text-xs text-slate-500">${subtitle}</div>
              </div>
            </div>
            <span class="text-[10px] font-bold text-slate-400 uppercase px-2 py-1 bg-slate-100 rounded-md shrink-0">Tez orada</span>
          </div>
        </div>
      `;
    }
    return `
      <button data-quiz-mode="${mode}"
        class="w-full text-left bg-white rounded-2xl p-4 border border-slate-200 hover:border-indigo-300 hover:shadow-md active:scale-[0.98] transition-all">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 flex-1 min-w-0">
            <div class="w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center text-2xl shadow-sm">${emoji}</div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-slate-900">${title}</div>
              <div class="text-xs text-slate-500">${subtitle}</div>
            </div>
          </div>
          <div class="text-right shrink-0">
            <div class="text-lg font-bold text-slate-900">${count}</div>
            <div class="text-[10px] text-slate-400 uppercase">savol</div>
          </div>
        </div>
      </button>
    `;
  }

  /* ---------- 9.2 Miqdor tanlash ---------- */
  function renderQuizCountSelection() {
    const source = getModeSource(state.quiz.mode);
    const available = source.length;
    const label = modeLabel(state.quiz.mode);

    // Agar 20 dan kam savol bo'lsa — faqat "Barchasi" varianti
    const useFallback = available < COUNT_PRESETS[0];

    const countCards = useFallback
      ? countCard(available, true, available, 'Barchasi')
      : COUNT_PRESETS.map(c => countCard(c, c <= available, available)).join('');

    return `
      <div class="px-4 pt-3 animate-in">
        <div class="flex items-center gap-3 mb-5">
          <button id="backToModes"
            class="shrink-0 w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600
                   active:scale-90 hover:bg-slate-50 transition-all" aria-label="Orqaga">
            <span class="w-4 h-4">${I.back}</span>
          </button>
          <div class="flex-1 min-w-0">
            <h1 class="text-xl font-bold text-slate-900">${label}</h1>
            <p class="text-xs text-slate-500">${available} ta savol mavjud</p>
          </div>
        </div>

        <h2 class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Nechta savol yechmoqchisiz?</h2>

        <div class="grid grid-cols-2 gap-3 stagger">
          ${countCards}
        </div>

        <p class="text-center text-xs text-slate-400 mt-6 px-4">
          Har safar savollar yangi tartibda aralashtiriladi 🎲
        </p>
      </div>
    `;
  }

  function countCard(count, enabled, available, customLabel) {
    const label = customLabel || `${count} savol`;
    const minutes = estimateMinutes(count);
    const timeLabel = `≈ ${minutes} daqiqa`;

    if (!enabled) {
      return `
        <div class="w-full p-4 bg-white rounded-2xl border-2 border-dashed border-slate-200 opacity-40">
          <div class="text-3xl font-bold text-slate-400">${count}</div>
          <div class="text-xs text-slate-400 mt-1">savol</div>
          <div class="text-[10px] text-slate-400 mt-2 font-semibold">Yetarli emas</div>
        </div>
      `;
    }

    return `
      <button data-quiz-count="${count}"
        class="w-full p-4 bg-white rounded-2xl border border-slate-200 text-left
               hover:border-indigo-300 hover:shadow-md active:scale-[0.97] transition-all">
        <div class="text-3xl font-bold text-slate-900">${count}</div>
        <div class="text-xs text-slate-500 mt-1">${customLabel ? 'savol' : 'savol'}</div>
        <div class="text-[10px] text-indigo-600 mt-2 font-semibold">${timeLabel}</div>
      </button>
    `;
  }

  /* ---------- 9.3 Savol ekrani ---------- */
  function renderQuizQuestion() {
    const q = state.quiz;
    const data = q.pool;
    const question = data[q.index];
    const options = question.options || [];
    const progressPct = (q.index / data.length) * 100;

    const optionsHtml = options.map((opt, i) => {
      let cls = 'option w-full text-left px-4 py-4 rounded-xl border-2 border-slate-200 bg-white text-slate-800 font-medium flex items-start gap-3';
      if (q.answered) {
        if (i === question.correctIndex) cls += ' correct';
        else if (i === q.selected) cls += ' wrong';
        else cls += ' disabled';
      }
      const letter = String.fromCharCode(65 + i);
      const badge = q.answered && i === question.correctIndex
        ? '<span class="shrink-0 w-6 h-6 rounded-md bg-emerald-500 text-white text-xs font-bold flex items-center justify-center">✓</span>'
        : q.answered && i === q.selected
        ? '<span class="shrink-0 w-6 h-6 rounded-md bg-rose-500 text-white text-xs font-bold flex items-center justify-center">✕</span>'
        : `<span class="shrink-0 w-6 h-6 rounded-md bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">${letter}</span>`;
      return `<button class="${cls}" data-option="${i}">${badge}<span class="flex-1 leading-relaxed">${furigana(opt)}</span></button>`;
    }).join('');

    return `
      <div class="px-4 pt-3 animate-in">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <button id="leaveQuiz"
              class="shrink-0 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600
                     active:scale-90 hover:bg-slate-200 transition-all" aria-label="Testdan chiqish">
              <span class="w-4 h-4">${I.back}</span>
            </button>
            <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-xs font-bold">
              №${q.index + 1}
            </span>
            <span class="text-xs text-slate-500 font-medium">/ ${data.length}</span>
          </div>
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold">
            <span>⭐</span>
            <span>${q.score}</span>
          </div>
        </div>

        <div class="h-2 bg-slate-200 rounded-full overflow-hidden mb-5">
          <div class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
               style="width: ${progressPct}%"></div>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl p-5 mb-4 shadow-sm">
          <div class="text-lg leading-loose text-slate-900 font-jp">${furigana(question.question)}</div>
        </div>

        <div class="flex flex-col gap-2.5 mb-4">${optionsHtml}</div>

        ${q.answered ? `
          <div class="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-200 rounded-xl p-4 mb-4 animate-in">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">i</div>
              <div class="text-xs font-bold text-indigo-800 uppercase tracking-wider">Tushuntirish</div>
            </div>
            <div class="text-sm text-slate-700 leading-relaxed">${furigana(question.explanationUz || '')}</div>
          </div>
          <button id="nextQuestion"
            class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold
                   shadow-lg shadow-indigo-500/25 active:scale-[0.98] transition-all">
            ${q.index + 1 === data.length ? "Natijani ko'rish →" : 'Keyingi savol →'}
          </button>
        ` : ''}
      </div>
    `;
  }

  /* ---------- 9.4 Natija ---------- */
  function renderQuizFinished() {
    const q = state.quiz;
    const total = q.pool.length;
    const pct = Math.round((q.score / total) * 100);
    const { emoji, title, msg, ringColor } = (() => {
      if (pct === 100) return { emoji: '🏆', title: 'Kanpai!',    msg: 'Mukammal natija',            ringColor: '#f59e0b' };
      if (pct >= 80)   return { emoji: '🎉', title: 'Ajoyib!',    msg: 'Deyarli mukammal',           ringColor: '#10b981' };
      if (pct >= 60)   return { emoji: '👍', title: 'Yaxshi!',    msg: 'Shu ruhda davom et',         ringColor: '#6366f1' };
      if (pct >= 40)   return { emoji: '📚', title: 'Yomon emas', msg: 'Qiyin mavzularni takrorlang', ringColor: '#f59e0b' };
      return                    { emoji: '💪', title: "Taslim bo'lmang", msg: 'Yana mashq kerak',     ringColor: '#ef4444' };
    })();

    if (pct >= 80) setTimeout(confetti, 100);

    const radius = 68, circ = 2 * Math.PI * radius;
    const offset = circ - (pct / 100) * circ;
    const label = modeLabel(q.mode);

    return `
      <div class="p-5 flex flex-col items-center justify-center min-h-[78dvh] text-center animate-in">
        <div class="text-6xl mb-3 animate-pop">${emoji}</div>
        <h1 class="text-3xl font-bold text-slate-900 mb-1">${title}</h1>
        <p class="text-slate-500 mb-2">${msg}</p>
        <p class="text-xs text-slate-400 mb-6 uppercase tracking-wider">${label} · ${total} savol</p>

        <div class="relative mb-6">
          <svg width="176" height="176" viewBox="0 0 176 176" class="transform -rotate-90">
            <circle cx="88" cy="88" r="${radius}" stroke="#e2e8f0" stroke-width="12" fill="none"/>
            <circle cx="88" cy="88" r="${radius}" stroke="${ringColor}" stroke-width="12" fill="none"
                    stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${offset}"
                    style="transition: stroke-dashoffset 1s ease-out;"/>
          </svg>
          <div class="absolute inset-0 flex flex-col items-center justify-center">
            <div class="text-4xl font-bold text-slate-900">${q.score}</div>
            <div class="text-xs text-slate-400 font-medium">/ ${total} dan</div>
          </div>
        </div>

        <div class="text-2xl font-bold text-slate-700 mb-6">${pct}%</div>

        <div class="grid grid-cols-3 gap-3 w-full max-w-xs mb-6">
          <div class="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
            <div class="text-xl font-bold text-emerald-600">${q.score}</div>
            <div class="text-[10px] font-semibold text-emerald-700 uppercase">To'g'ri</div>
          </div>
          <div class="bg-rose-50 rounded-xl p-3 border border-rose-100">
            <div class="text-xl font-bold text-rose-600">${total - q.score}</div>
            <div class="text-[10px] font-semibold text-rose-700 uppercase">Xato</div>
          </div>
          <div class="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <div class="text-xl font-bold text-indigo-600">${total}</div>
            <div class="text-[10px] font-semibold text-indigo-700 uppercase">Jami</div>
          </div>
        </div>

        <div class="flex flex-col gap-2 w-full max-w-xs">
          <button id="restartQuiz"
            class="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold
                   shadow-lg shadow-indigo-500/30 active:scale-[0.97] transition-all">
            Qaytadan
          </button>
          <button id="changeCount"
            class="w-full py-3 bg-white text-slate-700 rounded-xl font-semibold border border-slate-200
                   active:scale-[0.97] transition-all">
            Boshqa miqdor
          </button>
          <button id="backToModes"
            class="w-full py-3 bg-transparent text-slate-500 rounded-xl font-medium text-sm
                   active:scale-[0.97] transition-all">
            Boshqa rejim
          </button>
        </div>

        <p class="text-center text-xs text-slate-400 mt-6">Natija saqlanmaydi</p>
      </div>
    `;
  }

  /* =========================================================
     10. SCREEN — SETTINGS
     ========================================================= */

  function renderSettings() {
    const grammarCount = (window.grammarData || []).length;
    const pools = getQuizPools();
    const quizTotal = pools.grammar.length + pools.vocab.length;

    return `
      <div class="px-4 pt-3 animate-in">
        <div class="hero-gradient-soft rounded-3xl p-5 mb-4">
          <h1 class="text-2xl font-bold text-slate-900">Sozlamalar</h1>
          <p class="text-sm text-slate-600 mt-1">Ilova boshqaruvi</p>
        </div>

        <div class="bg-white border border-slate-200 rounded-2xl overflow-hidden mb-4">
          <div class="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <span class="text-sm text-slate-700">Versiya</span>
            <span class="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">1.4.0</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <span class="text-sm text-slate-700">Grammatika</span>
            <span class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">${grammarCount}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
            <span class="text-sm text-slate-700">Grammatika testlari</span>
            <span class="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">${pools.grammar.length}</span>
          </div>
          <div class="flex items-center justify-between px-4 py-3.5">
            <span class="text-sm text-slate-700">Lug'at testlari</span>
            <span class="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded-md">${pools.vocab.length}</span>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <span class="text-lg shrink-0">💾</span>
          <div class="text-xs text-amber-900 leading-relaxed">
            <strong>Natijalar saqlanmaydi.</strong> Har bir test tugagach, natija bir marta ko'rsatiladi va o'chiriladi.
            Bu ataylab shunday — har safar yangi savollar bilan mashq qilish uchun.
          </div>
        </div>

        <p class="text-center text-xs text-slate-400 mt-8">N3 o'quvchilari uchun mehr bilan ❤️</p>
      </div>
    `;
  }

  function emptyState(title, subtitle, emoji = '🗂️') {
    return `
      <div class="p-6 flex flex-col items-center justify-center min-h-[65dvh] text-center animate-in">
        <div class="text-6xl mb-4">${emoji}</div>
        <h2 class="text-lg font-semibold text-slate-800">${escapeHtml(title)}</h2>
        <p class="text-sm text-slate-500 mt-1 max-w-xs">${escapeHtml(subtitle)}</p>
      </div>
    `;
  }

  /* =========================================================
     11. MODAL — Grammar Detail
     ========================================================= */

  const modal = { backdrop: null, panel: null, content: null };

  function initModalRefs() {
    modal.backdrop = $('#modalBackdrop');
    modal.panel = $('#modalPanel');
    modal.content = $('#modalContent');
    modal.backdrop.addEventListener('click', closeModal);
  }

  function openGrammarModal(index) {
    const item = (window.grammarData || [])[index];
    if (!item) return;

    const meta = catMeta(item.category);

    const connectionBlock = item.connectionExamples?.length
      ? `<div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
           ${item.connectionExamples.map((line, i) => `
             <div class="px-4 py-2.5 ${i > 0 ? 'border-t border-slate-100' : ''} text-sm text-slate-700 leading-relaxed font-jp">
               ${furigana(line)}
             </div>`).join('')}
         </div>`
      : `<div class="bg-white rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 leading-relaxed">
           ${furigana(item.connection || '')}
         </div>`;

    const examplesBlock = (item.examples || []).map((ex, i) => `
      <div class="bg-white rounded-xl border border-slate-200 p-4">
        <div class="flex items-start gap-2.5">
          <span class="shrink-0 w-6 h-6 rounded-md bg-indigo-100 text-indigo-700 text-[11px] font-bold flex items-center justify-center mt-0.5">${i + 1}</span>
          <div class="flex-1 min-w-0">
            <div class="text-base leading-loose text-slate-900 font-jp mb-2">${furigana(ex.ja || ex.jp || '')}</div>
            <div class="text-sm text-slate-500 leading-relaxed">${escapeHtml(ex.uz || '')}</div>
          </div>
        </div>
      </div>
    `).join('');

    const mistakeBlock = item.commonMistake ? `
      <section class="animate-in">
        <h3 class="text-xs font-bold text-rose-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>⚠️</span> Ko'p uchraydigan xato
        </h3>
        <div class="bg-white rounded-xl border border-rose-200 overflow-hidden">
          <div class="px-4 py-3 bg-rose-50 border-b border-rose-100">
            <div class="text-sm text-rose-800 font-medium leading-relaxed">${furigana(item.commonMistake.wrong || '')}</div>
          </div>
          <div class="px-4 py-3 bg-emerald-50 border-b border-emerald-100">
            <div class="text-sm text-emerald-800 font-medium leading-relaxed">${furigana(item.commonMistake.right || '')}</div>
          </div>
          ${item.commonMistake.explanation ? `
            <div class="px-4 py-3 text-xs text-slate-600 leading-relaxed">
              ${furigana(item.commonMistake.explanation)}
            </div>` : ''}
        </div>
      </section>
    ` : '';

    const tipBlock = item.tip ? `
      <section class="animate-in">
        <h3 class="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <span>💡</span> Esda tuting
        </h3>
        <div class="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-4">
          <div class="text-sm text-amber-900 leading-relaxed">${furigana(item.tip)}</div>
        </div>
      </section>
    ` : '';

    modal.content.innerHTML = `
      <div class="shrink-0 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div class="drag-handle"></div>
        <div class="px-4 pb-3 pt-2 flex items-start justify-between gap-3">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1 flex-wrap">
              <span class="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-100 text-amber-800">
                ${item.lesson}-dars
              </span>
              ${item.category ? `
                <span class="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-md border ${meta.cls}">
                  <span class="w-1.5 h-1.5 rounded-full ${meta.dot}"></span>
                  ${meta.jp} ${meta.uz}
                </span>` : ''}
            </div>
            <h2 class="text-2xl font-bold text-slate-900 leading-tight font-jp">${escapeHtml(item.title)}</h2>
            ${item.titleRomaji ? `<div class="text-xs text-slate-400 font-medium mt-0.5">${escapeHtml(item.titleRomaji)}</div>` : ''}
          </div>
          <button id="closeModalBtn"
            class="shrink-0 w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600
                   active:scale-95 hover:bg-slate-200 transition-all" aria-label="Yopish">
            <span class="w-4 h-4">${I.close}</span>
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-y-auto p-4 space-y-5"
           style="padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));">

        <section class="animate-in">
          <h3 class="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>📖</span> Ma'nosi
          </h3>
          <div class="bg-white rounded-xl border border-slate-200 p-4">
            <p class="text-slate-800 leading-relaxed font-medium">${escapeHtml(item.meaningUz || '—')}</p>
            ${item.meaningShort && item.meaningShort !== item.meaningUz ? `
              <p class="text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
                Qisqacha: ${escapeHtml(item.meaningShort)}
              </p>` : ''}
          </div>
        </section>

        <section class="animate-in">
          <h3 class="text-xs font-bold text-cyan-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>🔗</span> Qo'shilishi
          </h3>
          ${connectionBlock}
        </section>

        ${item.notes ? `
          <section class="animate-in">
            <h3 class="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>📌</span> Izoh
            </h3>
            <div class="bg-white rounded-xl border border-slate-200 p-4">
              <p class="text-sm text-slate-700 leading-relaxed">${escapeHtml(item.notes)}</p>
            </div>
          </section>` : ''}

        <section class="animate-in">
          <h3 class="text-xs font-bold text-violet-600 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span>✏️</span> Misollar
          </h3>
          <div class="space-y-2.5">${examplesBlock || '<p class="text-slate-400 text-sm p-4">Misollar qo\'shilmagan</p>'}</div>
        </section>

        ${mistakeBlock}
        ${tipBlock}
      </div>
    `;

    modal.backdrop.classList.add('open');
    modal.panel.classList.add('open');
    document.body.style.overflow = 'hidden';
    $('#closeModalBtn').addEventListener('click', closeModal);
  }

  function closeModal() {
    modal.backdrop.classList.remove('open');
    modal.panel.classList.remove('open');
    document.body.style.overflow = '';
  }

  /* =========================================================
     12. QUIZ LOGIC
     ========================================================= */

  function answerQuestion(i) {
    const q = state.quiz;
    if (q.answered) return;
    const question = q.pool[q.index];
    if (!question) return;
    q.selected = i;
    q.answered = true;
    if (i === question.correctIndex) q.score += 1;
    renderApp();
  }

  function nextQuestion() {
    const q = state.quiz;
    if (q.index + 1 >= q.pool.length) {
      q.finished = true;
    } else {
      q.index += 1;
      q.selected = null;
      q.answered = false;
    }
    renderApp();
  }

  /* =========================================================
     13. CONFETTI
     ========================================================= */

  function confetti() {
    const layer = $('#confettiLayer');
    if (!layer) return;
    const colors = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#06b6d4'];
    for (let i = 0; i < 60; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-piece';
      p.style.left = Math.random() * 100 + '%';
      p.style.background = colors[Math.floor(Math.random() * colors.length)];
      p.style.animationDelay = Math.random() * 0.5 + 's';
      p.style.animationDuration = 2 + Math.random() * 1.2 + 's';
      p.style.transform = `rotate(${Math.random() * 360}deg)`;
      layer.appendChild(p);
    }
    setTimeout(() => { layer.innerHTML = ''; }, 4000);
  }

  /* =========================================================
     14. RENDER & NAV
     ========================================================= */

  function renderNav() {
    const nav = $('.bottom-nav');
    nav.innerHTML = TABS.map(t => `
      <button class="nav-btn ${state.tab === t.id ? 'active' : ''}" data-tab="${t.id}">
        ${t.icon}
        <span>${t.label}</span>
      </button>
    `).join('');
    $$('.nav-btn').forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  }

  function setTab(tab) {
    if (state.tab === tab) return;
    state.tab = tab;
    renderNav();
    renderApp();
  }

  function renderApp() {
    const screen = $('#screen');
    let html = '';
    switch (state.tab) {
      case 'grammar':  html = renderGrammar();  break;
      case 'vocab':    html = renderVocab();    break;
      case 'tests':    html = renderQuiz();     break;
      case 'settings': html = renderSettings(); break;
      default:         html = renderGrammar();
    }
    screen.innerHTML = html;
    window.scrollTo({ top: 0, behavior: 'instant' });

    if (state.tab === 'grammar' && state.grammar.query) {
      const inp = $('#grammarSearch');
      if (inp) { inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
    }
  }

  /* =========================================================
     15. EVENTS
     ========================================================= */

  function bindGlobalEvents() {
    const screen = $('#screen');

    screen.addEventListener('click', (e) => {
      // grammar
      const grammarBtn = e.target.closest('[data-grammar-index]');
      if (grammarBtn) return openGrammarModal(Number(grammarBtn.dataset.grammarIndex));

      const catBtn = e.target.closest('[data-filter-category]');
      if (catBtn) {
        state.grammar.category = catBtn.dataset.filterCategory;
        return renderApp();
      }

      // quiz mode
      const modeBtn = e.target.closest('[data-quiz-mode]');
      if (modeBtn) return selectQuizMode(modeBtn.dataset.quizMode);

      // quiz count
      const countBtn = e.target.closest('[data-quiz-count]');
      if (countBtn) return startQuizWithCount(Number(countBtn.dataset.quizCount));

      // quiz options
      const optionBtn = e.target.closest('[data-option]');
      if (optionBtn) return answerQuestion(Number(optionBtn.dataset.option));

      // nav buttons
      if (e.target.closest('#nextQuestion'))  return nextQuestion();
      if (e.target.closest('#restartQuiz'))   return restartQuiz();
      if (e.target.closest('#changeCount'))   return changeCount();
      if (e.target.closest('#backToModes'))   return backToQuizModes();
      if (e.target.closest('#leaveQuiz'))     return leaveQuiz();
    });

    screen.addEventListener('input', (e) => {
      if (e.target.id === 'grammarSearch') {
        state.grammar.query = e.target.value;
        renderApp();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.panel.classList.contains('open')) closeModal();
    });
  }

  /* =========================================================
     16. INIT
     ========================================================= */

  function init() {
    initModalRefs();
    renderNav();
    bindGlobalEvents();
    renderApp();
  }

  document.addEventListener('DOMContentLoaded', init);
})();