/* =========================================================
   CAFEISH — INLINE PAGE EDITOR
   =========================================================
   Lets an admin edit text and swap photos directly on the live
   site, no code editing required. Text/images marked with
   data-edit-key / data-edit-img-key in the page HTML become
   editable when "Edit this page" is turned on.

   Saved changes apply automatically on every future page load
   (see applyPageEdits() in main.js), same browser only — same
   local-storage tradeoff as the rest of the admin tools.
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {
  applyPageEdits(); // show any saved edits immediately, even before toolbar loads
  buildEditToolbar();
});

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
    document.querySelectorAll('[data-edit-key]').forEach(el => wireTextEditable(el, on));
    document.querySelectorAll('[data-edit-img-key]').forEach(el => wireImageEditable(el, on));
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

function wireTextEditable(el, on) {
  if (on) {
    el.contentEditable = 'true';
    el.style.outline = '1px dashed var(--gold)';
    el.style.outlineOffset = '3px';
    el.style.cursor = 'text';
    if (!el._editBound) {
      el.addEventListener('blur', () => {
        setPageEdit(el.dataset.editKey, el.textContent.trim());
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

function wireImageEditable(el, on) {
  // Ensure the image sits inside a positioned wrapper so the overlay can sit on top
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
          setPageEdit(el.dataset.editImgKey, url);
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

// Same idea as wireImageEditable, but for dynamically rendered cards (menu
// items, team members) where the change should go through a callback
// (onSave) rather than the static data-edit-img-key mechanism, since these
// items can be added/removed and don't have a fixed key.
function makeImageEditable(el, onSave) {
  let wrapper = el.closest('.edit-img-wrap');
  if (!wrapper) {
    wrapper = document.createElement('div');
    wrapper.className = 'edit-img-wrap';
    wrapper.style.cssText = 'position:relative; display:inline-block; width:100%; height:100%;';
    el.parentNode.insertBefore(wrapper, el);
    wrapper.appendChild(el);
  }
  if (wrapper.querySelector('.edit-img-overlay')) return; // already wired

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
