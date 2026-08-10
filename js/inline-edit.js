/* =========================================================
   CAFEISH — INLINE PAGE EDITOR
   =========================================================
   Lets an admin edit text and swap photos directly on the live
   site, no code editing required, and it works on ANY page —
   including ones added later — not just ones specifically set
   up for it in advance.

   Two layers:
   1. Explicit: elements marked data-edit-key / data-edit-img-key
      in the HTML (used for a few key spots like the hero).
   2. Automatic: everything else. When edit mode is on, the page
      is scanned for text and images and a stable key is derived
      from each element's position in the page, so edits save
      and reapply correctly on future loads.

   Saved changes apply automatically on every future page load
   (see applyPageEdits() in main.js), same browser only — same
   local-storage tradeoff as the rest of the admin tools.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  applyPageEdits(); // show any saved edits immediately, even before toolbar loads
  buildEditToolbar();
});

// ---------- Auto-detection ----------
// Generates a stable key from an element's tag path from <body>, combined
// with the page filename. Stable as long as the page's structure doesn't
// change — if you add/remove sections above an edited element, that
// element's key can shift. Fine for a small business site; flagged here
// so it's not a surprise.
function getAutoEditKey(el) {
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const path = [];
  let node = el;
  while (node && node.nodeType === 1 && node !== document.body) {
    let selector = node.tagName;
    const parent = node.parentElement;
    if (parent) {
      const siblings = Array.from(parent.children).filter(c => c.tagName === node.tagName);
      if (siblings.length > 1) selector += ':' + (siblings.indexOf(node) + 1);
    }
    path.unshift(selector);
    node = parent;
  }
  return 'auto::' + page + '::' + path.join('>');
}

const AUTO_EDIT_EXCLUDE_SELECTORS = ['#edit-toolbar', '.edit-item-card', '.add-item-card', '.inline-add-form', '#home-menu-preview'];

function isInExcludedZone(el) {
  return AUTO_EDIT_EXCLUDE_SELECTORS.some(sel => el.closest(sel));
}

function isAutoEditableText(el) {
  if (isInExcludedZone(el)) return false;
  if (el.dataset.editKey) return false; // already handled by the explicit system
  if (['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'SVG', 'PATH', 'OPTION'].includes(el.tagName)) return false;
  // Must directly own non-whitespace text (skips pure wrapper elements)
  return Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim().length > 0);
}

function isAutoEditableImage(el) {
  if (isInExcludedZone(el)) return false;
  if (el.dataset.editImgKey) return false;
  if (el.classList.contains('logo-img')) return false; // handled by the Theme panel
  if (el.closest('#logo-preview')) return false;
  if (el.id === 'preview-logo-img') return false;
  return true;
}

// ---------- Toolbar ----------
function buildEditToolbar() {
  const bar = document.createElement('div');
  bar.id = 'edit-toolbar';
  bar.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; z-index: 500;
    background: var(--surface); border: 1px solid var(--gold);
    border-radius: 999px; padding: 10px 16px; display: flex;
    align-items: center; gap: 10px; box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    font-family: var(--font-family, 'Comfortaa', sans-serif); font-size: 13px;
  `;

  const unlocked = isAdminUnlocked();
  bar.innerHTML = unlocked
    ? `<button id="edit-toggle-btn" class="btn btn-primary" style="padding:8px 16px; font-size:13px;">Edit this page</button>
       <button id="edit-reset-btn" class="btn btn-outline" style="padding:8px 14px; font-size:13px; display:none;">Reset all edits</button>`
    : `<button id="edit-unlock-btn" class="btn btn-outline" style="padding:8px 16px; font-size:13px;">Edit this site</button>`;

  document.body.appendChild(bar);

  if (!unlocked) {
    document.getElementById('edit-unlock-btn').addEventListener('click', () => {
      const pw = prompt('Admin password:');
      if (pw === null) return;
      if (unlockAdmin(pw)) {
        showToast('Unlocked — reloading...');
        setTimeout(() => window.location.reload(), 600);
      } else {
        showToast('Wrong password.');
      }
    });
    return;
  }

  let editMode = sessionStorage.getItem('cafeish_edit_mode') === 'true';
  const toggleBtn = document.getElementById('edit-toggle-btn');
  const resetBtn = document.getElementById('edit-reset-btn');

  function setEditMode(on) {
    editMode = on;
    sessionStorage.setItem('cafeish_edit_mode', on ? 'true' : 'false');
    toggleBtn.textContent = on ? 'Done editing' : 'Edit this page';
    resetBtn.style.display = on ? '' : 'none';

    // Explicit elements (marked up in the HTML ahead of time)
    document.querySelectorAll('[data-edit-key]').forEach(el => wireTextEditable(el, on));
    document.querySelectorAll('[data-edit-img-key]').forEach(el => wireImageEditable(el, on));

    // Everything else, auto-detected — works on any page, no markup needed
    document.querySelectorAll('body *').forEach(el => {
      if (isAutoEditableText(el)) wireTextEditable(el, on, getAutoEditKey(el));
    });
    document.querySelectorAll('img').forEach(el => {
      if (isAutoEditableImage(el)) wireImageEditable(el, on, getAutoEditKey(el));
    });

    document.dispatchEvent(new CustomEvent('cafeish:editmodechange', { detail: { on } }));
  }

  toggleBtn.addEventListener('click', () => setEditMode(!editMode));
  resetBtn.addEventListener('click', () => {
    if (confirm('Reset every on-page edit on this browser back to the original text/photos?')) {
      resetAllPageEdits();
      showToast('Reset — reloading...');
      setTimeout(() => window.location.reload(), 500);
    }
  });

  setEditMode(editMode); // restore edit mode across page navigation within the same tab
}

// ---------- Text editing ----------
function wireTextEditable(el, on, customKey) {
  const key = customKey || el.dataset.editKey;
  if (on) {
    el.contentEditable = 'true';
    el.style.outline = '1px dashed var(--gold)';
    el.style.outlineOffset = '3px';
    el.style.cursor = 'text';
    if (el.tagName === 'A' && !el._editClickGuard) {
      el.addEventListener('click', (e) => { if (el.isContentEditable) e.preventDefault(); });
      el._editClickGuard = true;
    }
    if (!el._editBound) {
      el.addEventListener('blur', () => {
        setPageEdit(key, el.textContent.trim());
        showToast('Saved.');
      });
      el._editBound = true;
    }
  } else {
    el.contentEditable = 'false';
    el.style.outline = '';
    el.style.cursor = '';
  }
}

// ---------- Image editing ----------
function wireImageEditable(el, on, customKey) {
  const key = customKey || el.dataset.editImgKey;

  let wrapper = el.closest('.edit-img-wrap');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'edit-img-wrap';
    wrapper.style.cssText = 'position:relative; display:inline-block; width:100%; height:100%;';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }

  let overlay = wrapper.querySelector('.edit-img-overlay');
  if (on) {
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'edit-img-overlay';
      overlay.style.cssText = `
        position:absolute; inset:0; background:rgba(42,10,10,0.55);
        display:flex; align-items:center; justify-content:center;
        color:var(--gold); font-size:13px; font-weight:700; cursor:pointer;
        border-radius:inherit;
      `;
      overlay.textContent = '📷 Change photo';
      overlay.addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.addEventListener('change', async () => {
          const file = input.files[0];
          if (!file) return;
          showToast('Uploading...');
          const url = await uploadImage(file);
          el.src = url;
          setPageEdit(key, url);
          showToast('Photo updated.');
        });
        input.click();
      });
      wrapper.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  } else if (overlay) {
    overlay.style.display = 'none';
  }
}

// Reusable per-item image editor for dynamically rendered cards (menu items,
// team members) where the save should go through a callback rather than a
// fixed key, since these records can be added/removed.
function makeImageEditable(el, onSave) {
  let wrapper = el.closest('.edit-img-wrap');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'edit-img-wrap';
    wrapper.style.cssText = 'position:relative; display:inline-block; width:100%; height:100%;';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }
  if (wrapper.querySelector('.edit-img-overlay')) return;

  const overlay = document.createElement('div');
  overlay.className = 'edit-img-overlay';
  overlay.style.cssText = `
    position:absolute; inset:0; background:rgba(42,10,10,0.55);
    display:flex; align-items:center; justify-content:center;
    color:var(--gold); font-size:13px; font-weight:700; cursor:pointer;
    border-radius:inherit;
  `;
  overlay.textContent = '📷 Change photo';
  overlay.addEventListener('click', () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.addEventListener('change', async () => {
      const file = input.files[0];
      if (!file) return;
      showToast('Uploading...');
      const url = await uploadImage(file);
      el.src = url;
      onSave(url);
      showToast('Photo updated.');
    });
    input.click();
  });
  wrapper.appendChild(overlay);
}
