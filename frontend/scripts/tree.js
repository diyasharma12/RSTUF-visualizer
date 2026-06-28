/* ============================================================
   RSTUF TUF Metadata Visualizer — Delegation Tree Renderer
   ============================================================ */

/**
 * Render the full delegation tree from overview data.
 * @param {Object} overview - The metadata overview
 * @param {Function} onSelectRole - Callback when a node is selected
 */
function renderDelegationTree(overview, onSelectRole) {
  const container = document.getElementById('delegation-tree');
  if (!container) return;

  container.innerHTML = '';

  // Build tree data
  const treeData = buildTreeData(overview);

  // Render recursively
  const treeEl = document.createElement('div');
  treeEl.className = 'tree';
  treeEl.setAttribute('role', 'tree');
  treeEl.setAttribute('aria-label', 'TUF metadata delegation tree');

  renderTreeNodes(treeEl, treeData, onSelectRole, 0);
  container.appendChild(treeEl);
}

/**
 * Build tree data structure from overview.
 */
function buildTreeData(overview) {
  const root = {
    name: 'root',
    type: 'root',
    version: overview.root?.version || '?',
    meta: `${overview.root?.roles ? Object.keys(overview.root.roles).length : 0} roles`,
    children: [],
  };

  // Targets node
  const targets = {
    name: 'targets',
    type: 'targets',
    version: overview.targets?.version || '?',
    meta: `${overview.targets?.delegations?.length || 0} bins`,
    children: [],
  };

  // Bin nodes under targets
  if (overview.bins) {
    for (const bin of overview.bins) {
      targets.children.push({
        name: bin.name,
        type: 'bin',
        version: bin.version,
        meta: `${bin.file_count} file${bin.file_count !== 1 ? 's' : ''}`,
        children: [],
      });
    }
  }

  root.children.push(targets);

  // Snapshot node
  root.children.push({
    name: 'snapshot',
    type: 'snapshot',
    version: overview.snapshot?.version || '?',
    meta: '',
    children: [],
  });

  // Timestamp node
  root.children.push({
    name: 'timestamp',
    type: 'timestamp',
    version: overview.timestamp?.version || '?',
    meta: '',
    children: [],
  });

  return [root];
}

/**
 * Recursively render tree nodes.
 */
function renderTreeNodes(parentEl, nodes, onSelectRole, depth) {
  for (const node of nodes) {
    const nodeEl = document.createElement('div');
    nodeEl.className = `tree-node tree-node--${node.type}`;
    nodeEl.dataset.role = node.name;
    nodeEl.setAttribute('role', 'treeitem');
    nodeEl.setAttribute('aria-expanded', node.children.length > 0 ? 'true' : 'false');

    const contentEl = document.createElement('div');
    contentEl.className = 'tree-node__content';
    contentEl.id = `tree-node-${node.name}`;
    contentEl.tabIndex = 0;

    // Dot indicator
    const dot = document.createElement('span');
    dot.className = 'tree-node__dot';
    contentEl.appendChild(dot);

    // Label
    const label = document.createElement('span');
    label.className = 'tree-node__label';
    label.textContent = node.name;
    contentEl.appendChild(label);

    // Version badge
    const badge = document.createElement('span');
    badge.className = 'tree-node__badge';
    badge.textContent = `v${node.version}`;
    contentEl.appendChild(badge);

    // Meta info (file count, etc.)
    if (node.meta) {
      const meta = document.createElement('span');
      meta.className = 'tree-node__meta';
      meta.textContent = node.meta;
      contentEl.appendChild(meta);
    }

    // Click handler
    contentEl.addEventListener('click', () => {
      selectTreeNode(node.name);
      if (onSelectRole) onSelectRole(node.name);
    });

    // Keyboard handler
    contentEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        selectTreeNode(node.name);
        if (onSelectRole) onSelectRole(node.name);
      }
    });

    nodeEl.appendChild(contentEl);

    // Children
    if (node.children.length > 0) {
      const childContainer = document.createElement('div');
      childContainer.className = 'tree-children';
      childContainer.setAttribute('role', 'group');
      renderTreeNodes(childContainer, node.children, onSelectRole, depth + 1);
      nodeEl.appendChild(childContainer);
    }

    parentEl.appendChild(nodeEl);
  }
}

/**
 * Select a tree node visually.
 * @param {string} roleName
 */
function selectTreeNode(roleName) {
  // Deselect all
  document.querySelectorAll('.tree-node.is-selected').forEach(el => {
    el.classList.remove('is-selected');
  });

  // Select new
  const node = document.querySelector(`.tree-node[data-role="${roleName}"]`);
  if (node) {
    node.classList.add('is-selected');
  }
}

/**
 * Show loading skeleton for the tree.
 */
function renderTreeSkeleton() {
  const container = document.getElementById('delegation-tree');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 8px 0">
      <div class="skeleton skeleton-line skeleton-line--medium"></div>
      <div style="padding-left:20px">
        <div class="skeleton skeleton-line skeleton-line--long" style="margin-top:8px"></div>
        <div style="padding-left:16px">
          <div class="skeleton skeleton-line skeleton-line--short" style="margin-top:6px"></div>
          <div class="skeleton skeleton-line skeleton-line--short" style="margin-top:6px"></div>
          <div class="skeleton skeleton-line skeleton-line--short" style="margin-top:6px"></div>
          <div class="skeleton skeleton-line skeleton-line--short" style="margin-top:6px"></div>
        </div>
      </div>
      <div class="skeleton skeleton-line skeleton-line--medium" style="margin-top:8px"></div>
      <div class="skeleton skeleton-line skeleton-line--medium" style="margin-top:8px"></div>
    </div>
  `;
}

// Export
window.TUFTree = {
  renderDelegationTree,
  selectTreeNode,
  renderTreeSkeleton,
};
