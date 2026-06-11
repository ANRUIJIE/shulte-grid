(function () {
  'use strict';

  const STORAGE_KEY = 'shulte_stats';
  const DAILY_KEY = 'shulte_daily';

  const views = {
    home: document.getElementById('home-view'),
    game: document.getElementById('game-view'),
    result: document.getElementById('result-view'),
  };

  const els = {
    gridSize: document.getElementById('grid-size'),
    gameMode: document.getElementById('game-mode'),
    btnStart: document.getElementById('btn-start'),
    btnBack: document.getElementById('btn-back'),
    btnRestart: document.getElementById('btn-restart'),
    btnAgain: document.getElementById('btn-again'),
    btnHome: document.getElementById('btn-home'),
    gridContainer: document.getElementById('grid-container'),
    timer: document.getElementById('timer'),
    nextNum: document.getElementById('next-num'),
    gameHint: document.getElementById('game-hint'),
    bestTime: document.getElementById('best-time'),
    totalCount: document.getElementById('total-count'),
    avgTime: document.getElementById('avg-time'),
    resultIcon: document.getElementById('result-icon'),
    resultTitle: document.getElementById('result-title'),
    resultTime: document.getElementById('result-time'),
    resultDetail: document.getElementById('result-detail'),
    qrImg: document.getElementById('qr-img'),
    qrUrl: document.getElementById('qr-url'),
    dailyTrigger: document.getElementById('daily-trigger'),
    dailyOverlay: document.getElementById('daily-overlay'),
    dailyClose: document.getElementById('daily-close'),
    dailyList: document.getElementById('daily-list'),
    dailyEmpty: document.getElementById('daily-empty'),
  };

  const COLORS = [
    '#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff',
    '#ff8cc8', '#a78bfa', '#fb923c', '#2dd4bf',
    '#f472b6', '#38bdf8', '#a3e635', '#e879f9',
  ];

  let state = {
    size: 5,
    mode: 'color',
    numbers: [],
    current: 1,
    maxNum: 25,
    elapsedSeconds: 0,
    timerInterval: null,
    isPlaying: false,
  };

  function formatSeconds(sec) {
    return `${Math.round(sec)}s`;
  }

  function showView(name) {
    Object.values(views).forEach(v => v.classList.remove('active'));
    views[name].classList.add('active');
  }

  function loadStats() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveStats(stats) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  }

  function loadDaily() {
    try {
      return JSON.parse(localStorage.getItem(DAILY_KEY)) || {};
    } catch {
      return {};
    }
  }

  function saveDaily(daily) {
    localStorage.setItem(DAILY_KEY, JSON.stringify(daily));
  }

  function getTodayKey() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatDateLabel(dateKey) {
    const today = getTodayKey();
    if (dateKey === today) return '今天';
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yKey = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
    if (dateKey === yKey) return '昨天';
    const [y, m, d] = dateKey.split('-');
    return `${parseInt(m, 10)}月${parseInt(d, 10)}日`;
  }

  function formatClock(ts) {
    const d = new Date(ts);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  function getStatsKey() {
    return `${state.size}_${state.mode}`;
  }

  function updateStatsDisplay() {
    state.size = parseInt(els.gridSize.value, 10);
    state.mode = els.gameMode.value;
    const stats = loadStats();
    const key = getStatsKey();
    const data = stats[key] || { best: null, total: 0, sum: 0 };

    els.bestTime.textContent = data.best !== null ? formatSeconds(data.best) : '--';
    els.totalCount.textContent = data.total;
    els.avgTime.textContent = data.total > 0 ? formatSeconds(data.sum / data.total) : '--';
  }

  function recordResult(elapsed) {
    const stats = loadStats();
    const key = getStatsKey();
    const data = stats[key] || { best: null, total: 0, sum: 0 };

    data.total += 1;
    data.sum += elapsed;
    if (data.best === null || elapsed < data.best) {
      data.best = elapsed;
    }

    stats[key] = data;
    saveStats(stats);

    const daily = loadDaily();
    const dateKey = getTodayKey();
    if (!daily[dateKey]) daily[dateKey] = [];
    daily[dateKey].unshift({
      seconds: elapsed,
      size: state.size,
      mode: state.mode,
      ts: Date.now(),
    });
    saveDaily(daily);

    return data;
  }

  function renderDailyList() {
    const daily = loadDaily();
    const dates = Object.keys(daily).sort((a, b) => b.localeCompare(a));

    els.dailyList.innerHTML = '';

    if (dates.length === 0) {
      els.dailyList.classList.add('hidden');
      els.dailyEmpty.classList.remove('hidden');
      return;
    }

    els.dailyList.classList.remove('hidden');
    els.dailyEmpty.classList.add('hidden');

    dates.forEach(dateKey => {
      const records = daily[dateKey];
      if (!records || records.length === 0) return;

      const group = document.createElement('li');
      group.className = 'daily-date-group';

      const label = document.createElement('div');
      label.className = 'daily-date-label';
      label.textContent = `${formatDateLabel(dateKey)}（${records.length} 次）`;
      group.appendChild(label);

      records.forEach(rec => {
        const item = document.createElement('div');
        item.className = 'daily-item';

        const time = document.createElement('span');
        time.className = 'daily-item-time';
        time.textContent = formatSeconds(rec.seconds);

        const info = document.createElement('span');
        info.className = 'daily-item-info';
        info.textContent = `${rec.size}×${rec.size} ${getModeName(rec.mode)}`;

        const clock = document.createElement('span');
        clock.className = 'daily-item-clock';
        clock.textContent = formatClock(rec.ts);

        item.appendChild(time);
        item.appendChild(info);
        item.appendChild(clock);
        group.appendChild(item);
      });

      els.dailyList.appendChild(group);
    });
  }

  function openDailyPanel() {
    renderDailyList();
    els.dailyOverlay.classList.remove('hidden');
  }

  function closeDailyPanel() {
    els.dailyOverlay.classList.add('hidden');
  }

  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function getHintText() {
    const hints = {
      classic: '按从小到大的顺序点击数字',
      reverse: '按从大到小的顺序点击数字',
      color: '按颜色顺序点击（红→黄→绿→蓝…循环）',
    };
    return hints[state.mode] || '';
  }

  function getCellColor(num) {
    return COLORS[(num - 1) % COLORS.length];
  }

  function initGame() {
    state.size = parseInt(els.gridSize.value, 10);
    state.mode = els.gameMode.value;
    state.maxNum = state.size * state.size;
    state.current = state.mode === 'reverse' ? state.maxNum : 1;

    const nums = Array.from({ length: state.maxNum }, (_, i) => i + 1);
    state.numbers = shuffle(nums);
    state.isPlaying = true;

    renderGrid();
    startTimer();
    showView('game');

    els.nextNum.textContent = state.current;
    els.gameHint.textContent = getHintText();
  }

  function renderGrid() {
    els.gridContainer.innerHTML = '';
    els.gridContainer.style.gridTemplateColumns = `repeat(${state.size}, 1fr)`;
    els.gridContainer.className = `grid-container size-${state.size}`;

    state.numbers.forEach(num => {
      const cell = document.createElement('div');
      cell.className = 'grid-cell';
      cell.dataset.num = num;

      if (state.mode === 'color') {
        cell.textContent = num;
        cell.style.color = getCellColor(num);
      } else {
        cell.textContent = num;
      }

      cell.addEventListener('click', () => onCellClick(cell, num));
      els.gridContainer.appendChild(cell);
    });
  }

  function onCellClick(cell, num) {
    if (!state.isPlaying || cell.classList.contains('found')) return;

    if (num === state.current) {
      cell.classList.add('found');
      advanceNext();
    } else {
      cell.classList.add('wrong');
      setTimeout(() => cell.classList.remove('wrong'), 400);
    }
  }

  function advanceNext() {
    if (state.mode === 'reverse') {
      state.current -= 1;
      if (state.current < 1) {
        finishGame();
        return;
      }
    } else {
      state.current += 1;
      if (state.current > state.maxNum) {
        finishGame();
        return;
      }
    }
    els.nextNum.textContent = state.current;
  }

  function startTimer() {
    state.elapsedSeconds = 0;
    els.timer.textContent = '0s';
    clearInterval(state.timerInterval);
    state.timerInterval = setInterval(() => {
      state.elapsedSeconds += 1;
      els.timer.textContent = formatSeconds(state.elapsedSeconds);
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
    return state.elapsedSeconds;
  }

  function finishGame() {
    state.isPlaying = false;
    const elapsed = stopTimer();
    const stats = recordResult(elapsed);

    const isNewBest = stats.best === elapsed;
    els.resultIcon.textContent = isNewBest ? '🏆' : '🎉';
    els.resultTitle.textContent = isNewBest ? '新纪录！' : '完成！';
    els.resultTime.textContent = `${elapsed} 秒`;
    els.resultDetail.textContent =
      `${state.size}×${state.size} ${getModeName()} · 最佳 ${formatSeconds(stats.best)} · 共完成 ${stats.total} 次`;

    updateStatsDisplay();
    showView('result');
  }

  function getModeName(mode) {
    const m = mode || state.mode;
    const names = { classic: '经典', reverse: '倒序', color: '颜色' };
    return names[m] || '';
  }

  const PAGES_URL = 'https://ANRUIJIE.github.io/vueDemo/';

  function getShareUrl() {
    const host = location.hostname;
    if (host === 'localhost' || host === '127.0.0.1' || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
      return PAGES_URL;
    }
    const path = location.pathname.replace(/index\.html$/, '').replace(/\/?$/, '');
    return `${location.origin}${path}/`;
  }

  async function loadQRCode() {
    const url = getShareUrl();
    els.qrUrl.textContent = url;
    if (typeof QRCode === 'undefined') {
      els.qrImg.alt = '二维码加载失败';
      return;
    }
    try {
      const qrDataUrl = await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: '#1a1a2e', light: '#ffffff' },
      });
      els.qrImg.src = qrDataUrl;
    } catch {
      els.qrImg.alt = '二维码加载失败';
    }
  }

  els.btnStart.addEventListener('click', initGame);
  els.btnBack.addEventListener('click', () => {
    state.isPlaying = false;
    clearInterval(state.timerInterval);
    showView('home');
  });
  els.btnRestart.addEventListener('click', initGame);
  els.btnAgain.addEventListener('click', initGame);
  els.btnHome.addEventListener('click', () => showView('home'));

  els.gridSize.addEventListener('change', updateStatsDisplay);
  els.gameMode.addEventListener('change', updateStatsDisplay);

  els.dailyTrigger.addEventListener('click', openDailyPanel);
  els.dailyClose.addEventListener('click', closeDailyPanel);
  els.dailyOverlay.addEventListener('click', (e) => {
    if (e.target === els.dailyOverlay) closeDailyPanel();
  });

  loadQRCode();
  updateStatsDisplay();
})();
