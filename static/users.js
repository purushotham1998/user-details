document.addEventListener('DOMContentLoaded', function(){
  const usersContainer = document.getElementById('usersContainer');
  const usersMessage = document.createElement('div');
  usersContainer.parentNode.insertBefore(usersMessage, usersContainer);

  const minAgeEl = document.getElementById('minAge');
  const maxAgeEl = document.getElementById('maxAge');
  const sexEl = document.getElementById('sexFilter');
  const minExpEl = document.getElementById('minExp');
  const maxExpEl = document.getElementById('maxExp');
  const sortByEl = document.getElementById('sortBy');
  const applyBtn = document.getElementById('applyFilters');
  const clearBtn = document.getElementById('clearFilters');

  let originalUsers = [];

  async function fetchUsers(){
    usersMessage.textContent = 'Loading users...';
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      originalUsers = json.users || [];
      usersMessage.textContent = '';
      applyFiltersAndRender();
    } catch (err){
      usersMessage.textContent = 'Could not load users: ' + err.message;
    }
  }

  function applyFiltersAndRender(){
    const minAge = parseInt(minAgeEl.value, 10);
    const maxAge = parseInt(maxAgeEl.value, 10);
    const sex = (sexEl.value || 'all').toLowerCase();
    const minExp = parseFloat(minExpEl.value);
    const maxExp = parseFloat(maxExpEl.value);
    const sortBy = sortByEl.value || '';

    let filtered = originalUsers.filter(u => {
      // Age
      if (!isNaN(minAge)){
        if (u.age === null || u.age === undefined) return false;
        if (Number(u.age) < minAge) return false;
      }
      if (!isNaN(maxAge)){
        if (u.age === null || u.age === undefined) return false;
        if (Number(u.age) > maxAge) return false;
      }
      // Sex
      if (sex && sex !== 'all'){
        if (!u.sex) return false;
        if (String(u.sex).toLowerCase() !== sex) return false;
      }
      // Experience
      if (!isNaN(minExp)){
        if (u.experience === null || u.experience === undefined) return false;
        if (Number(u.experience) < minExp) return false;
      }
      if (!isNaN(maxExp)){
        if (u.experience === null || u.experience === undefined) return false;
        if (Number(u.experience) > maxExp) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy){
      const [key, dir] = sortBy.split('-');
      filtered.sort((a,b)=>{
        let va, vb;
        if (key === 'age'){
          va = a.age != null ? Number(a.age) : Number.NEGATIVE_INFINITY;
          vb = b.age != null ? Number(b.age) : Number.NEGATIVE_INFINITY;
        } else if (key === 'exp'){
          va = a.experience != null ? Number(a.experience) : Number.NEGATIVE_INFINITY;
          vb = b.experience != null ? Number(b.experience) : Number.NEGATIVE_INFINITY;
        } else if (key === 'name'){
          va = (a.name||'').toLowerCase();
          vb = (b.name||'').toLowerCase();
        } else {
          va = a.id || 0; vb = b.id || 0;
        }

        if (va < vb) return dir === 'asc' ? -1 : 1;
        if (va > vb) return dir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    renderUsers(filtered);
  }

  function renderUsers(users){
    if (!users || users.length === 0){
      usersContainer.innerHTML = '<div class="muted-text">No users match the filters.</div>\n' +
        '<div class="gif-wrap">' +
        '<img class="gif-small" src="https://media.giphy.com/media/3oEjI6SIIHBdRxXI40/giphy.gif" alt="no-results" loading="lazy">' +
        '</div>';
      return;
    }

    let html = '<table class="users-table"><thead><tr><th>Name</th><th>Age</th><th>Sex</th><th>Experience</th><th>Phone</th></tr></thead><tbody>';
    for (const u of users){
      html += `<tr><td>${escapeHtml(u.name||'')}</td><td>${u.age!=null?u.age:''}</td><td>${escapeHtml(u.sex||'')}</td><td>${u.experience!=null?u.experience:''}</td><td>${escapeHtml(u.phone||'')}</td></tr>`;
    }
    html += '</tbody></table>';
    usersContainer.innerHTML = html;
  }

  // GIF toggle for users page
  const toggleGifBtnUsers = document.getElementById('toggleGifBtnUsers');
  const usersHeroGif = document.getElementById('usersHeroGif');
  if (toggleGifBtnUsers && usersHeroGif){
    toggleGifBtnUsers.addEventListener('click', function(){
      if (usersHeroGif.classList.contains('hidden')){
        usersHeroGif.classList.remove('hidden');
        usersHeroGif.classList.add('fade-in');
      } else {
        usersHeroGif.classList.add('hidden');
      }
    });
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>\"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  applyBtn.addEventListener('click', function(e){
    e.preventDefault();
    applyFiltersAndRender();
  });

  clearBtn.addEventListener('click', function(e){
    e.preventDefault();
    minAgeEl.value = '';
    maxAgeEl.value = '';
    sexEl.value = 'all';
    minExpEl.value = '';
    maxExpEl.value = '';
    sortByEl.value = '';
    applyFiltersAndRender();
  });

  // initial load
  fetchUsers();
});
