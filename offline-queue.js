// Makhanani LTSM — Offline Queue v1.1 — Auto-Sync When Back Online
// v1.1 change: Auto-sync runs on ANY page (not just Issue).
// How it works:
// 1. Any page loads offline-queue.js + registers a write function via OfflineQueue.setWriter(fn)
// 2. When internet returns (online event), queue auto-syncs, retries failed items, shows banner.
// 3. If page was closed while offline, sync runs next time ANY page opens online.
window.OfflineQueue = {
  KEY: 'MAKHANANI_OFFLINE_QUEUE_V1',
  WRITER_KEY: 'MAKHANANI_OFFLINE_WRITER_SET',
  _writer: null,
  _syncing: false,

  getAll() {
    try { return JSON.parse(localStorage.getItem(this.KEY) || '[]'); } catch(e) { return []; }
  },
  add(item) {
    const q = this.getAll();
    q.push({ ...item, queuedAt: new Date().toISOString(), attempts: 0 });
    localStorage.setItem(this.KEY, JSON.stringify(q));
    this.updateBadge();
    return q.length;
  },
  clear() { localStorage.removeItem(this.KEY); this.updateBadge(); },
  count() { return this.getAll().length; },

  // Register the function that writes one queued item to Firebase.
  // Issue page does: OfflineQueue.setWriter(async (item) => { await writeIssueToCloud(item); });
  setWriter(fn) { this._writer = fn; },

  updateBadge() {
    const n = this.count();
    document.querySelectorAll('[data-offline-queue]').forEach(el => {
      el.textContent = n ? '🟠 Offline — Queue: ' + n + ' waiting' : '🟢 Online — Queue: 0';
      el.style.display = 'block';
    });
    const online = navigator.onLine;
    document.querySelectorAll('[data-offline-status]').forEach(el => {
      el.textContent = online
        ? (n ? '🟢 Back Online — Auto-syncing ' + n + ' item(s)...' : '🟢 Online')
        : '🟠 Offline — Issue / Return saved on this phone, will auto-sync when online';
      el.style.background = online ? '#059669' : '#ea580c';
    });
    // Sync status line on Issue page, if present
    const syncMsg = document.getElementById('syncMsg');
    if (syncMsg && online && n > 0) {
      syncMsg.innerHTML = '<div class="info">🟢 Back online — Auto-syncing ' + n + ' item(s)... Do not close this page.</div>';
    }
  },

  async sync(writeFn) {
    const fn = writeFn || this._writer;
    if (!fn) return { done: 0, failed: this.count(), noWriter: true };
    const q = this.getAll();
    if (!q.length) return { done: 0, failed: 0 };
    if (!navigator.onLine) return { done: 0, failed: q.length, offline: true };
    if (this._syncing) return { done: 0, failed: q.length, busy: true };
    this._syncing = true;
    this.updateBadge();
    let done = 0, failed = 0; const remaining = [];
    for (const item of q) {
      try {
        await fn(item);
        done++;
      } catch(e) {
        failed++;
        remaining.push({ ...item, attempts: (item.attempts || 0) + 1, lastError: String(e.message || e).slice(0, 200) });
      }
      // Save progress after each item — if page closes mid-sync, done items are not re-sent
      localStorage.setItem(this.KEY, JSON.stringify([...remaining, ...q.slice(q.indexOf(item) + 1)]));
      // Re-read: simpler — rebuild remaining + not-yet-tried
      // (We overwrite above with correct list below on finish)
    }
    // Correct final list = only failed items (done items are gone)
    localStorage.setItem(this.KEY, JSON.stringify(remaining));
    this._syncing = false;
    this.updateBadge();
    const syncMsg = document.getElementById('syncMsg');
    if (syncMsg) {
      if (failed > 0) syncMsg.innerHTML = '<div class="warn">⚠️ Auto-sync: Synced ' + done + ' • Failed ' + failed + ' • Remaining ' + remaining.length + '<br>Failed items stayed in queue — check Grade / Title / Subject / Book exists, then it will retry next time you come online.</div>';
      else if (done > 0) syncMsg.innerHTML = '<div class="ok">✅ Auto-synced: ' + done + ' • Failed: 0 • Queue is empty.</div>';
    }
    // Show a toast on any page
    this.showToast(done, failed);
    return { done, failed };
  },

  showToast(done, failed) {
    if (!done && !failed) return;
    let toast = document.getElementById('offlineToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'offlineToast';
      toast.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);background:#0a1f4d;color:#fff;padding:12px 16px;border-radius:12px;font-weight:900;font-size:13px;z-index:9999;box-shadow:0 4px 16px rgba(0,0,0,.3);max-width:92vw;text-align:center';
      document.body.appendChild(toast);
    }
    toast.textContent = failed > 0
      ? '⚠️ Auto-sync: ' + done + ' synced • ' + failed + ' failed — will retry'
      : '✅ Auto-synced: ' + done + ' item(s) — Queue is empty';
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 5000);
  },

  // Called automatically on 'online' + on page load if online
  async autoSync() {
    if (!navigator.onLine) return;
    if (this.count() === 0) { this.updateBadge(); return; }
    if (!this._writer) {
      // No writer on this page (e.g. Home) — tell user to open Issue to sync
      const syncMsg = document.getElementById('syncMsg');
      if (syncMsg) syncMsg.innerHTML = '<div class="info">🟢 Back online — Queue: ' + this.count() + ' waiting. Open <b>Issue / Return</b> to auto-sync.</div>';
      this.showToast(0, 0);
      return;
    }
    await this.sync();
  }
};

// Auto-sync triggers:
// 1. Browser fires 'online' — sync immediately
window.addEventListener('online', () => {
  window.OfflineQueue.updateBadge();
  // Small delay — WiFi often says "online" before Firebase is reachable
  setTimeout(() => window.OfflineQueue.autoSync(), 1500);
});
window.addEventListener('offline', () => window.OfflineQueue.updateBadge());

// 2. Page loads online with queue waiting (app was closed while offline) — sync on load
document.addEventListener('DOMContentLoaded', () => {
  window.OfflineQueue.updateBadge();
  if (navigator.onLine && window.OfflineQueue.count() > 0) {
    setTimeout(() => window.OfflineQueue.autoSync(), 2000);
  }
});

// 3. Retry every 30 seconds while online + queue not empty + not already syncing
setInterval(() => {
  if (navigator.onLine && window.OfflineQueue.count() > 0 && !window.OfflineQueue._syncing && window.OfflineQueue._writer) {
    window.OfflineQueue.autoSync();
  }
}, 30000);
