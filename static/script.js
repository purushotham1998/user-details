document.addEventListener('DOMContentLoaded', function(){
  const form = document.getElementById('userForm');
  const registerBtn = document.getElementById('registerBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const formContainer = document.getElementById('formContainer');
  const usersContainer = document.getElementById('usersContainer');
  const usersMessage = document.getElementById('usersMessage');

  function showForm(){
    formContainer.style.display = '';
    registerBtn.disabled = true;
  }

  function hideForm(){
    formContainer.style.display = 'none';
    registerBtn.disabled = false;
    form.reset();
  }

  registerBtn.addEventListener('click', showForm);
  cancelBtn.addEventListener('click', hideForm);

  async function fetchUsers(){
    usersMessage.textContent = 'Loading users...';
    try {
      const res = await fetch('/api/users');
      if (!res.ok) throw new Error('Fetch failed');
      const json = await res.json();
      renderUsers(json.users || []);
    } catch (err){
      usersMessage.textContent = 'Could not load users: ' + err.message;
    }
  }

  function renderUsers(users){
    if (!users || users.length === 0){
      usersContainer.innerHTML = '<p>No users yet.</p>';
      return;
    }

    let html = '<table class="users-table"><thead><tr><th>Name</th><th>Age</th><th>Sex</th><th>Experience</th><th>Phone</th></tr></thead><tbody>';
    for (const u of users){
      html += `<tr><td>${escapeHtml(u.name||'')}</td><td>${u.age||''}</td><td>${escapeHtml(u.sex||'')}</td><td>${u.experience||''}</td><td>${escapeHtml(u.phone||'')}</td></tr>`;
    }
    html += '</tbody></table>';
    usersContainer.innerHTML = html;
  }

  function escapeHtml(s){
    return String(s).replace(/[&<>\"]/g, function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];
    });
  }

  form.addEventListener('submit', async function(e){
    e.preventDefault();
    const f = e.target;
    const data = {
      name: f.name.value,
      age: f.age.value ? Number(f.age.value) : null,
      sex: f.sex.value,
      experience: f.experience.value ? Number(f.experience.value) : null,
      phone: f.phone.value
    };

    try {
      const res = await fetch('/submit', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (res.ok){
        hideForm();
        fetchUsers();
      } else {
        alert('Error: ' + JSON.stringify(json));
      }
    } catch (err){
      alert('Network error: ' + err.message);
    }
  });

  // Initial load
  fetchUsers();
});
