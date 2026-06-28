/* ============================================================
   RSTUF TUF Metadata Visualizer — Detail Panel Renderer
   ============================================================ */

/* ---- SVG Icon helpers ---- */
const ICONS = {
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>',
  target: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
  grid: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 3v18"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
  file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  layers: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
  alertTriangle: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  package: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  hash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>',
  emptyBox: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
  wifiOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"/><path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/><path d="M5 12.55a10.94 10.94 0 015.17-2.39"/><path d="M10.71 5.05A16 16 0 0122.56 9"/><path d="M1.42 9a15.91 15.91 0 014.7-2.88"/><path d="M8.53 16.11a6 6 0 016.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>',
};

/**
 * Get appropriate icon for a role type.
 */
function getRoleIcon(roleName) {
  if (roleName === 'root') return ICONS.shield;
  if (roleName === 'targets') return ICONS.target;
  if (roleName === 'snapshot') return ICONS.grid;
  if (roleName === 'timestamp') return ICONS.clock;
  if (roleName.startsWith('bins')) return ICONS.box;
  return ICONS.file;
}

/**
 * Get subtitle for a role.
 */
function getRoleSubtitle(roleName) {
  const subs = {
    root: 'Trust anchor · Defines all signing keys and thresholds',
    targets: 'Delegated roles · Manages artifact delegation',
    snapshot: 'Consistency record · Points to all current metadata versions',
    timestamp: 'Freshness guarantee · Most frequently rotated role',
  };
  if (roleName.startsWith('bins-')) return `Hash-prefixed bin · Stores artifact metadata entries`;
  return subs[roleName] || 'TUF metadata role';
}

/**
 * Format file size in human-readable format.
 */
function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(2) + ' MB';
}

/**
 * Truncate a hash string.
 */
function truncateHash(hash, len = 16) {
  if (!hash || hash.length <= len) return hash;
  return hash.substring(0, len) + '…';
}

/**
 * Render the detail panel for a given role.
 * @param {Object} data - Detail data from API
 */
function renderDetailPanel(data) {
  const panel = document.getElementById('detail-panel-content');
  if (!panel) return;

  // Animate transition
  panel.style.opacity = '0';
  panel.style.transform = 'translateY(8px)';

  requestAnimationFrame(() => {
    renderDetailHeader(data);

    switch (data.name) {
      case 'root':
        renderRootDetails(panel, data);
        break;
      case 'targets':
        renderTargetsDetails(panel, data);
        break;
      case 'snapshot':
        renderSnapshotDetails(panel, data);
        break;
      case 'timestamp':
        renderTimestampDetails(panel, data);
        break;
      default:
        if (data.name && data.name.startsWith('bins')) {
          renderBinDetails(panel, data);
        } else {
          renderGenericDetails(panel, data);
        }
    }

    // Trigger animation
    requestAnimationFrame(() => {
      panel.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    });
  });
}

/**
 * Render the detail panel header.
 */
function renderDetailHeader(data) {
  const nameEl = document.getElementById('detail-role-name');
  const subEl = document.getElementById('detail-role-subtitle');
  const iconEl = document.getElementById('detail-role-icon');

  if (nameEl) nameEl.textContent = data.name;
  if (subEl) subEl.textContent = getRoleSubtitle(data.name);
  if (iconEl) iconEl.innerHTML = getRoleIcon(data.name);
}

/**
 * Render info grid with common fields.
 */
function renderInfoGrid(data) {
  const expiry = window.TUFDashboard.computeExpiryStatus(data.expires);
  const expiryFormatted = window.TUFDashboard.formatExpiryDate(data.expires);

  let items = `
    <div class="info-item">
      <div class="info-item__label">Version</div>
      <div class="info-item__value">v${data.version}</div>
    </div>
    <div class="info-item">
      <div class="info-item__label">Expiration</div>
      <div class="info-item__value info-item__value--mono" style="color: var(--status-${expiry.status === 'valid' ? 'healthy' : expiry.status === 'expiring' ? 'warning' : 'critical'})" title="${expiryFormatted}">${expiry.relative}</div>
    </div>
  `;

  if (data.signed_by) {
    items += `
      <div class="info-item">
        <div class="info-item__label">Signed By</div>
        <div class="info-item__value">${escapeHtml(data.signed_by)}</div>
      </div>
    `;
  }

  return `<div class="info-grid">${items}</div>`;
}

/* ---- ROOT DETAILS ---- */
function renderRootDetails(panel, data) {
  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Overview</div>
      ${renderInfoGrid(data)}
    </div>
  `;

  // Keys table
  if (data.keys && data.keys.length > 0) {
    html += `
      <div class="detail-section">
        <div class="detail-section__title">Signing Keys</div>
        <div style="overflow-x: auto; border: 1px solid var(--border-subtle);">
          <table class="data-table" id="root-keys-table">
            <thead>
              <tr>
                <th>Key Name</th>
                <th>Type</th>
                <th>Key ID</th>
                <th>Status</th>
                <th>Signs For</th>
              </tr>
            </thead>
            <tbody>
    `;

    for (const key of data.keys) {
      const typeClass = key.keytype.toLowerCase().includes('ed25519') ? 'ed25519'
        : key.keytype.toLowerCase().includes('ecdsa') ? 'ecdsa' : 'rsa';

      html += `
        <tr>
          <td style="font-weight:600; color: var(--text-primary)">${escapeHtml(key.name)}</td>
          <td><span class="key-type-badge key-type-badge--${typeClass}">${escapeHtml(key.keytype)}</span></td>
          <td><span class="mono" style="color: var(--text-muted)">${escapeHtml(key.keyid_short)}</span></td>
          <td>
            <span class="online-badge online-badge--${key.online ? 'online' : 'offline'}">
              <span class="online-badge__dot"></span>
              ${key.online ? 'Online' : 'Offline'}
            </span>
          </td>
          <td>
            <div class="role-tags">
              ${key.roles.map(r => `<span class="role-tag">${escapeHtml(r)}</span>`).join('')}
            </div>
          </td>
        </tr>
      `;
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Thresholds
  if (data.roles) {
    html += `
      <div class="detail-section">
        <div class="detail-section__title">Signing Thresholds</div>
    `;

    for (const [roleName, roleData] of Object.entries(data.roles)) {
      const keyCount = roleData.keyids ? roleData.keyids.length : 0;
      html += `
        <div class="threshold-display">
          <span class="threshold-display__label" style="min-width:80px; font-weight:600; color:var(--text-primary)">${escapeHtml(roleName)}</span>
          <span class="threshold-display__value">${roleData.threshold} of ${keyCount}</span>
          <span class="threshold-display__label">key${roleData.threshold !== 1 ? 's' : ''} required to sign</span>
        </div>
      `;
    }

    html += `
        <div class="security-note" style="margin-top: var(--space-md);">
          ${ICONS.alertTriangle}
          <span class="security-note__text">
            The <strong>root</strong> role requires multiple offline keys for signing, providing maximum security.
            Offline keys should be stored on air-gapped hardware security modules (HSMs) or similar secure storage.
          </span>
        </div>
      </div>
    `;
  }

  panel.innerHTML = html;
}

/* ---- TARGETS DETAILS ---- */
function renderTargetsDetails(panel, data) {
  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Overview</div>
      ${renderInfoGrid(data)}
    </div>
  `;

  // Delegations
  if (data.delegations && data.delegations.length > 0) {
    html += `
      <div class="detail-section">
        <div class="detail-section__title">Delegated Roles</div>
        <div class="delegation-list" id="targets-delegations-list">
    `;

    for (const del of data.delegations) {
      html += `
        <div class="delegation-item" data-delegation="${escapeHtml(del)}" tabindex="0" role="button" aria-label="View ${escapeHtml(del)} details" id="delegation-link-${escapeHtml(del)}">
          <span class="delegation-item__dot"></span>
          ${escapeHtml(del)}
        </div>
      `;
    }

    html += `
        </div>
      </div>
    `;
  }

  // Targets (direct artifacts under targets role)
  if (data.targets && Object.keys(data.targets).length > 0) {
    html += renderArtifactsTable(data.targets);
  }

  panel.innerHTML = html;

  // Wire up delegation click handlers
  document.querySelectorAll('.delegation-item[data-delegation]').forEach(el => {
    const handler = () => {
      const roleName = el.dataset.delegation;
      window.TUFTree.selectTreeNode(roleName);
      window.TUFApp.loadRoleDetails(roleName);
    };
    el.addEventListener('click', handler);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); }
    });
  });
}

/* ---- BIN DETAILS ---- */
function renderBinDetails(panel, data) {
  const targetEntries = data.targets ? Object.entries(data.targets) : [];
  const artifactCount = targetEntries.length;

  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Overview</div>
      ${renderInfoGrid(data)}
    </div>
  `;

  html += `
    <div class="detail-section">
      <div class="detail-section__title">Artifacts</div>
      <div class="artifact-count">
        ${artifactCount} artifact${artifactCount !== 1 ? 's' : ''}
      </div>
  `;

  if (artifactCount > 0) {
    html += `
      <div style="overflow-x: auto; border: 1px solid var(--border-subtle);">
        <table class="data-table" id="bin-artifacts-table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Hash Algorithm</th>
              <th>Hash Value</th>
              <th>Size</th>
            </tr>
          </thead>
          <tbody>
    `;

    for (const [filename, info] of targetEntries) {
      const hashes = info.hashes || {};
      const hashEntries = Object.entries(hashes);
      const size = formatSize(info.length || 0);

      if (hashEntries.length === 0) {
        html += `
          <tr>
            <td><span class="artifact-filename">${escapeHtml(filename)}</span></td>
            <td><span class="mono" style="color:var(--text-muted)">—</span></td>
            <td><span class="mono" style="color:var(--text-muted)">—</span></td>
            <td><span class="file-size">${size}</span></td>
          </tr>
        `;
      } else {
        for (let i = 0; i < hashEntries.length; i++) {
          const [algo, hash] = hashEntries[i];
          html += `
            <tr>
              ${i === 0 ? `<td rowspan="${hashEntries.length}"><span class="artifact-filename">${escapeHtml(filename)}</span></td>` : ''}
              <td><span class="key-type-badge key-type-badge--ed25519" style="font-size:0.68rem">${escapeHtml(algo)}</span></td>
              <td><span class="hash-value" title="${escapeHtml(hash)}">${truncateHash(hash)}</span></td>
              ${i === 0 ? `<td rowspan="${hashEntries.length}"><span class="file-size">${size}</span></td>` : ''}
            </tr>
          `;
        }
      }
    }

    html += `
          </tbody>
        </table>
      </div>
    `;
  } else {
    html += `
      <div class="empty-state">
        <div class="empty-state__icon">${ICONS.emptyBox}</div>
        <div class="empty-state__text">No artifacts</div>
        <div class="empty-state__sub">This bin has no artifacts registered yet</div>
      </div>
    `;
  }

  html += `</div>`;
  panel.innerHTML = html;
}

/* ---- SNAPSHOT DETAILS ---- */
function renderSnapshotDetails(panel, data) {
  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Overview</div>
      ${renderInfoGrid(data)}
    </div>
  `;

  if (data.meta && Object.keys(data.meta).length > 0) {
    html += `
      <div class="detail-section">
        <div class="detail-section__title">Tracked Metadata Versions</div>
        <div style="overflow-x: auto; border: 1px solid var(--border-subtle); background: var(--bg-secondary);">
          <table class="meta-table" id="snapshot-meta-table">
    `;

    for (const [filename, info] of Object.entries(data.meta)) {
      html += `
        <tr>
          <td>${escapeHtml(filename)}</td>
          <td>v${info.version}</td>
        </tr>
      `;
    }

    html += `
          </table>
        </div>
        <div class="security-note" style="margin-top: var(--space-md)">
          ${ICONS.info}
          <span class="security-note__text">
            The snapshot role records the current version of every metadata file,
            ensuring clients can detect rollback attacks and verify consistency.
          </span>
        </div>
      </div>
    `;
  }

  panel.innerHTML = html;
}

/* ---- TIMESTAMP DETAILS ---- */
function renderTimestampDetails(panel, data) {
  const expiry = window.TUFDashboard.computeExpiryStatus(data.expires);

  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Overview</div>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-item__label">Version</div>
          <div class="info-item__value">v${data.version}</div>
        </div>
        <div class="info-item">
          <div class="info-item__label">Expiration</div>
          <div class="info-item__value info-item__value--mono" style="color: var(--status-${expiry.status === 'valid' ? 'healthy' : expiry.status === 'expiring' ? 'warning' : 'critical'})">${expiry.relative}</div>
        </div>
        <div class="info-item">
          <div class="info-item__label">Snapshot Version</div>
          <div class="info-item__value">v${data.snapshot_version || '?'}</div>
        </div>
      </div>
    </div>
  `;

  // Countdown display for timestamp
  if (expiry.countdown || expiry.status === 'critical' || expiry.status === 'expired') {
    const countdownValue = expiry.countdown || '00:00:00';
    html += `
      <div class="detail-section">
        <div class="detail-section__title">Live Countdown</div>
        <div style="text-align:center; padding: var(--space-lg); background: var(--bg-secondary); border: 1px solid var(--border-subtle);">
          <div class="health-card__countdown health-card__expiry-value--${expiry.status}" id="detail-timestamp-countdown" style="font-size: 2rem; letter-spacing: 0.08em;">
            ${countdownValue}
          </div>
          <div style="margin-top: 8px; font-size: 0.78rem; color: var(--text-muted);">
            ${expiry.status === 'expired' ? 'This role has expired and needs immediate rotation' : 'Time remaining until expiration'}
          </div>
        </div>
      </div>
    `;
  }

  html += `
    <div class="detail-section">
      <div class="detail-section__title">Role Relationship</div>
      <div class="security-note">
        ${ICONS.info}
        <span class="security-note__text">
          The <strong>timestamp</strong> role is the entry point for TUF clients. It points to snapshot v${data.snapshot_version || '?'},
          which in turn references all other metadata. This role has the shortest expiry and is rotated most frequently
          to ensure freshness of the repository.
        </span>
      </div>
    </div>
  `;

  panel.innerHTML = html;

  // Start detail countdown if critical
  if (expiry.countdown) {
    startDetailCountdown(data.expires);
  }
}

/* ---- GENERIC DETAILS (fallback) ---- */
function renderGenericDetails(panel, data) {
  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Overview</div>
      ${renderInfoGrid(data)}
    </div>
  `;
  panel.innerHTML = html;
}

/* ---- Helper: render artifacts table ---- */
function renderArtifactsTable(targets) {
  const entries = Object.entries(targets);
  if (entries.length === 0) return '';

  let html = `
    <div class="detail-section">
      <div class="detail-section__title">Direct Artifacts</div>
      <div style="overflow-x: auto; border: 1px solid var(--border-subtle);">
        <table class="data-table">
          <thead><tr><th>Filename</th><th>Hash</th><th>Size</th></tr></thead>
          <tbody>
  `;

  for (const [filename, info] of entries) {
    const hashes = info.hashes || {};
    const firstHash = Object.values(hashes)[0] || '—';
    html += `
      <tr>
        <td><span class="artifact-filename">${escapeHtml(filename)}</span></td>
        <td><span class="hash-value" title="${escapeHtml(firstHash)}">${truncateHash(firstHash)}</span></td>
        <td><span class="file-size">${formatSize(info.length || 0)}</span></td>
      </tr>
    `;
  }

  html += `</tbody></table></div></div>`;
  return html;
}

/* ---- Detail countdown for timestamp ---- */
let _detailCountdownInterval = null;

function startDetailCountdown(expiresISO) {
  if (_detailCountdownInterval) clearInterval(_detailCountdownInterval);

  _detailCountdownInterval = setInterval(() => {
    const el = document.getElementById('detail-timestamp-countdown');
    if (!el) {
      clearInterval(_detailCountdownInterval);
      _detailCountdownInterval = null;
      return;
    }
    const exp = window.TUFDashboard.computeExpiryStatus(expiresISO);
    el.textContent = exp.countdown || '00:00:00';
    el.className = `health-card__countdown health-card__expiry-value--${exp.status}`;
  }, 1000);
}

/* ---- Loading skeleton ---- */
function renderDetailSkeleton() {
  const panel = document.getElementById('detail-panel-content');
  if (!panel) return;

  panel.innerHTML = `
    <div class="detail-section">
      <div class="skeleton skeleton-line skeleton-line--short"></div>
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:12px">
        <div class="skeleton" style="height:56px;border-radius:8px"></div>
        <div class="skeleton" style="height:56px;border-radius:8px"></div>
        <div class="skeleton" style="height:56px;border-radius:8px"></div>
      </div>
    </div>
    <div class="detail-section" style="margin-top:24px">
      <div class="skeleton skeleton-line skeleton-line--short"></div>
      <div class="skeleton" style="height:120px;border-radius:8px;margin-top:12px"></div>
    </div>
    <div class="detail-section" style="margin-top:24px">
      <div class="skeleton skeleton-line skeleton-line--medium"></div>
      <div class="skeleton skeleton-line skeleton-line--long" style="margin-top:8px"></div>
      <div class="skeleton skeleton-line skeleton-line--long" style="margin-top:6px"></div>
    </div>
  `;
  panel.style.opacity = '1';
  panel.style.transform = 'translateY(0)';
}

/* ---- Error state ---- */
function renderDetailError(message) {
  const panel = document.getElementById('detail-panel-content');
  if (!panel) return;

  panel.innerHTML = `
    <div class="error-state">
      <div class="error-state__icon">${ICONS.wifiOff}</div>
      <div class="error-state__title">Failed to Load Details</div>
      <div class="error-state__message">${escapeHtml(message)}</div>
      <button class="btn-retry" id="detail-retry-btn" aria-label="Retry loading details">
        ${ICONS.refresh}
        Retry
      </button>
    </div>
  `;

  panel.style.opacity = '1';
  panel.style.transform = 'translateY(0)';
}

/* ---- HTML escaping ---- */
function escapeHtml(str) {
  if (typeof str !== 'string') return String(str);
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return str.replace(/[&<>"']/g, c => map[c]);
}

// Export
window.TUFDetails = {
  renderDetailPanel,
  renderDetailSkeleton,
  renderDetailError,
  ICONS,
};
