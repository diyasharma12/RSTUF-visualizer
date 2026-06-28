/* ============================================================
   RSTUF TUF Metadata Visualizer — Health Cards Dashboard
   ============================================================ */

/**
 * Compute the expiry status of a role.
 * @param {string} expiresISO - ISO 8601 expiry timestamp
 * @returns {{ status: string, label: string, relative: string, countdown: string|null }}
 */
function computeExpiryStatus(expiresISO) {
  const now = new Date();
  const expires = new Date(expiresISO);
  const diffMs = expires - now;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  let status, label, relative, countdown = null;

  if (diffMs <= 0) {
    status = 'expired';
    label = 'Expired';
    const agoHr = Math.floor(-diffMs / 3600000);
    if (agoHr < 1) {
      relative = `Expired ${Math.floor(-diffMs / 60000)} min ago`;
    } else if (agoHr < 24) {
      relative = `Expired ${agoHr}h ago`;
    } else {
      relative = `Expired ${Math.floor(agoHr / 24)}d ago`;
    }
  } else if (diffHr < 24) {
    status = 'critical';
    label = 'Critical';
    const h = diffHr;
    const m = diffMin % 60;
    const s = diffSec % 60;
    relative = `Expires in ${h}h ${m}m`;
    countdown = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  } else if (diffDays < 7) {
    status = 'expiring';
    label = 'Expiring Soon';
    relative = `Expires in ${diffDays}d ${diffHr % 24}h`;
  } else {
    status = 'valid';
    label = 'Valid';
    if (diffDays > 365) {
      relative = `Expires ${formatDate(expires)}`;
    } else if (diffDays > 30) {
      relative = `Expires in ${Math.floor(diffDays / 30)} months`;
    } else {
      relative = `Expires in ${diffDays} days`;
    }
  }

  return { status, label, relative, countdown };
}

/**
 * Format a date to a readable string.
 */
function formatDate(date) {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Format an ISO date string for display.
 */
function formatExpiryDate(isoStr) {
  const d = new Date(isoStr);
  return formatDate(d) + ' ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

/**
 * Get the worst status among all roles for the overall health badge.
 */
function computeOverallHealth(overview) {
  const statuses = [];
  const roles = ['timestamp', 'snapshot', 'root', 'targets'];

  for (const role of roles) {
    if (overview[role] && overview[role].expires) {
      statuses.push(computeExpiryStatus(overview[role].expires).status);
    }
  }

  if (overview.bins) {
    for (const bin of overview.bins) {
      statuses.push(computeExpiryStatus(bin.expires).status);
    }
  }

  const priority = ['expired', 'critical', 'expiring', 'valid'];
  for (const p of priority) {
    if (statuses.includes(p)) return p;
  }
  return 'valid';
}

/**
 * Render the overall health badge in the topbar.
 */
function renderHealthBadge(overview) {
  const badge = document.getElementById('overall-health-badge');
  if (!badge) return;

  const health = computeOverallHealth(overview);
  const labels = {
    valid: 'All Healthy',
    expiring: 'Expiring Soon',
    critical: 'Critical',
    expired: 'Expired',
  };

  badge.className = `health-badge health-badge--${health}`;
  badge.innerHTML = `<span class="health-badge__dot"></span>${labels[health]}`;
}

/**
 * Render all 4 health cards with overview data.
 */
function renderHealthCards(overview) {
  renderRootCard(overview.root);
  renderTargetsCard(overview.targets);
  renderSnapshotCard(overview.snapshot);
  renderTimestampCard(overview.timestamp);
  renderHealthBadge(overview);
}

function renderRootCard(root) {
  const el = document.getElementById('health-card-root');
  if (!el || !root) return;

  const expiry = computeExpiryStatus(root.expires);
  const keyCount = root.roles
    ? new Set(Object.values(root.roles).flatMap(r => r.keys || [])).size
    : 0;
  const roleCount = root.roles ? Object.keys(root.roles).length : 0;

  el.innerHTML = `
    <div class="health-card__header">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="health-card__icon health-card__icon--root">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
        </div>
        <span class="health-card__title">Root</span>
      </div>
      <span class="health-card__status health-card__status--${expiry.status}">${expiry.label}</span>
    </div>
    <div class="health-card__body">
      <div class="health-card__stat">
        <span class="health-card__stat-label">Version</span>
        <span class="health-card__stat-value">v${root.version}</span>
      </div>
      <div class="health-card__stat">
        <span class="health-card__stat-label">Keys</span>
        <span class="health-card__stat-value">${keyCount} keys</span>
      </div>
      <div class="health-card__stat">
        <span class="health-card__stat-label">Roles</span>
        <span class="health-card__stat-value">${roleCount} roles</span>
      </div>
    </div>
    <div class="health-card__expiry">
      <span class="health-card__expiry-label">Expiration</span>
      <span class="health-card__expiry-value health-card__expiry-value--${expiry.status}">${expiry.relative}</span>
    </div>
  `;
}

function renderTargetsCard(targets) {
  const el = document.getElementById('health-card-targets');
  if (!el || !targets) return;

  const expiry = computeExpiryStatus(targets.expires);
  const delegationCount = targets.delegations ? targets.delegations.length : 0;

  el.innerHTML = `
    <div class="health-card__header">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="health-card__icon health-card__icon--targets">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <span class="health-card__title">Targets</span>
      </div>
      <span class="health-card__status health-card__status--${expiry.status}">${expiry.label}</span>
    </div>
    <div class="health-card__body">
      <div class="health-card__stat">
        <span class="health-card__stat-label">Version</span>
        <span class="health-card__stat-value">v${targets.version}</span>
      </div>
      <div class="health-card__stat">
        <span class="health-card__stat-label">Delegations</span>
        <span class="health-card__stat-value">${delegationCount} bins</span>
      </div>
    </div>
    <div class="health-card__expiry">
      <span class="health-card__expiry-label">Expiration</span>
      <span class="health-card__expiry-value health-card__expiry-value--${expiry.status}">${expiry.relative}</span>
    </div>
  `;
}

function renderSnapshotCard(snapshot) {
  const el = document.getElementById('health-card-snapshot');
  if (!el || !snapshot) return;

  const expiry = computeExpiryStatus(snapshot.expires);

  el.innerHTML = `
    <div class="health-card__header">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="health-card__icon health-card__icon--snapshot">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>
        </div>
        <span class="health-card__title">Snapshot</span>
      </div>
      <span class="health-card__status health-card__status--${expiry.status}">${expiry.label}</span>
    </div>
    <div class="health-card__body">
      <div class="health-card__stat">
        <span class="health-card__stat-label">Version</span>
        <span class="health-card__stat-value">v${snapshot.version}</span>
      </div>
    </div>
    <div class="health-card__expiry">
      <span class="health-card__expiry-label">Expiration</span>
      <span class="health-card__expiry-value health-card__expiry-value--${expiry.status}">${expiry.relative}</span>
    </div>
  `;
}

function renderTimestampCard(timestamp) {
  const el = document.getElementById('health-card-timestamp');
  if (!el || !timestamp) return;

  const expiry = computeExpiryStatus(timestamp.expires);

  let countdownHtml = '';
  if (expiry.countdown) {
    countdownHtml = `<div class="health-card__countdown health-card__expiry-value--${expiry.status}" id="timestamp-countdown">${expiry.countdown}</div>`;
  }

  el.innerHTML = `
    <div class="health-card__header">
      <div style="display:flex;align-items:center;gap:10px">
        <div class="health-card__icon health-card__icon--timestamp">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>
        <span class="health-card__title">Timestamp</span>
      </div>
      <span class="health-card__status health-card__status--${expiry.status}">${expiry.label}</span>
    </div>
    <div class="health-card__body">
      <div class="health-card__stat">
        <span class="health-card__stat-label">Version</span>
        <span class="health-card__stat-value">v${timestamp.version}</span>
      </div>
    </div>
    <div class="health-card__expiry">
      <span class="health-card__expiry-label">Expires</span>
      <span class="health-card__expiry-value health-card__expiry-value--${expiry.status}" id="timestamp-expiry-relative">${expiry.relative}</span>
      ${countdownHtml}
    </div>
  `;
}

/**
 * Start a live countdown timer for the timestamp card.
 * @param {string} expiresISO
 * @returns {number} interval ID for cleanup
 */
let _countdownInterval = null;

function startTimestampCountdown(expiresISO) {
  if (_countdownInterval) clearInterval(_countdownInterval);

  _countdownInterval = setInterval(() => {
    const exp = computeExpiryStatus(expiresISO);
    const countdownEl = document.getElementById('timestamp-countdown');
    const relativeEl = document.getElementById('timestamp-expiry-relative');

    if (countdownEl && exp.countdown) {
      countdownEl.textContent = exp.countdown;
      countdownEl.className = `health-card__countdown health-card__expiry-value--${exp.status}`;
    }
    if (relativeEl) {
      relativeEl.textContent = exp.relative;
      relativeEl.className = `health-card__expiry-value health-card__expiry-value--${exp.status}`;
    }

    // Also update status badge
    const statusEl = document.querySelector('#health-card-timestamp .health-card__status');
    if (statusEl) {
      statusEl.textContent = exp.label;
      statusEl.className = `health-card__status health-card__status--${exp.status}`;
    }
  }, 1000);

  return _countdownInterval;
}

function stopTimestampCountdown() {
  if (_countdownInterval) {
    clearInterval(_countdownInterval);
    _countdownInterval = null;
  }
}

/**
 * Show loading skeleton for health cards.
 */
function renderHealthCardsSkeleton() {
  const ids = ['health-card-root', 'health-card-targets', 'health-card-snapshot', 'health-card-timestamp'];
  for (const id of ids) {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = `
        <div class="skeleton skeleton-line skeleton-line--short"></div>
        <div class="skeleton skeleton-line skeleton-line--long"></div>
        <div class="skeleton skeleton-line skeleton-line--medium"></div>
        <div class="skeleton skeleton-line skeleton-line--short" style="margin-top:12px"></div>
      `;
    }
  }
  const badge = document.getElementById('overall-health-badge');
  if (badge) {
    badge.className = 'health-badge health-badge--loading';
    badge.innerHTML = '<span class="health-badge__dot"></span>Loading…';
  }
}

// Export
window.TUFDashboard = {
  renderHealthCards,
  renderHealthCardsSkeleton,
  renderHealthBadge,
  startTimestampCountdown,
  stopTimestampCountdown,
  computeExpiryStatus,
  computeOverallHealth,
  formatExpiryDate,
};
