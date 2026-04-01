// ======================================
//  SHARED HELPERS
// ======================================

function showError(input, message) {
  input.classList.add('input-error');
  const err = document.createElement('span');
  err.className   = 'error-msg';
  err.textContent = message;
  const parent = input.closest('.ep-group') || input.closest('.form-group') || input.closest('.modal-group');
  if (parent) parent.appendChild(err);
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target.type === 'password') {
      target.type = 'text'; btn.style.color = '#2b7de9';
    } else {
      target.type = 'password'; btn.style.color = '#999';
    }
  });
});

function showPopup({ title, message, btnText = 'OK', redirectUrl = null, type = 'success' }) {
  const overlay = document.createElement('div');
  overlay.className = 'popup-overlay';
  const icon = type === 'register'
    ? `<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="25" fill="none" stroke="#2b7de9" stroke-width="2"/>
        <circle cx="26" cy="20" r="7" fill="none" stroke="#2b7de9" stroke-width="2.5" stroke-linecap="round"/>
        <path fill="none" stroke="#2b7de9" stroke-width="2.5" stroke-linecap="round" d="M12 40 q2 -10 14 -10 q12 0 14 10"/></svg>`
    : `<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="25" fill="none" stroke="#4caf50" stroke-width="2"/>
        <path fill="none" stroke="#4caf50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" d="M14 27 l9 9 l16 -16"/></svg>`;
  overlay.innerHTML = `
    <div class="popup-box">
      <div class="popup-icon popup-icon--${type}">${icon}</div>
      <h2 class="popup-title">${title}</h2>
      <p class="popup-msg">${message}</p>
      <button class="popup-btn popup-btn--${type}" id="popupOkBtn">${btnText}</button>
    </div>`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));
  document.getElementById('popupOkBtn').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => { overlay.remove(); if (redirectUrl) window.location.href = redirectUrl; }, 300);
  });
}

function getNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// ── SHARED SEARCH MODAL (admin pages) ──
function initSearchModal() {
  const searchOverlay  = document.getElementById('searchOverlay');
  const openSearchBtn  = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput    = document.getElementById('searchInput');
  const searchGoBtn    = document.getElementById('searchGoBtn');
  const searchResults  = document.getElementById('searchResults');
  if (!searchOverlay) return;

  openSearchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    searchOverlay.classList.add('active');
    searchInput.focus();
    searchResults.innerHTML = '';
    searchInput.value = '';
  });
  closeSearchBtn.addEventListener('click', () => searchOverlay.classList.remove('active'));
  searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) searchOverlay.classList.remove('active'); });
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') searchOverlay.classList.remove('active'); });
  searchGoBtn.addEventListener('click', doSearch);

  function doSearch() {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    if (!query) { searchResults.innerHTML = '<p class="search-no-result">Please enter a name or ID number.</p>'; return; }
    const allUsers = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const found = allUsers.filter(u => {
      const fullName = `${u.firstName} ${u.lastName} ${u.middleName || ''}`.toLowerCase();
      return fullName.includes(query) || u.idNumber.toLowerCase().includes(query);
    });
    if (found.length === 0) { searchResults.innerHTML = '<p class="search-no-result">No students found.</p>'; return; }
    found.forEach(u => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="search-result-avatar">${u.idNumber.toString().slice(-2)}</div>
        <div class="search-result-info">
          <p class="search-result-name">${u.firstName} ${u.middleName ? u.middleName + ' ' : ''}${u.lastName}</p>
          <p class="search-result-details">ID: ${u.idNumber} &nbsp;|&nbsp; ${u.course} &nbsp;|&nbsp; Year ${u.yearLevel}</p>
          <p class="search-result-details">${u.email}</p>
        </div>`;
      searchResults.appendChild(item);
    });
  }
}


// ======================================
//  LOGIN PAGE (index.html)
// ======================================

const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
  const idInput = document.getElementById('idNumber');
  const pwInput = document.getElementById('password');
  loginBtn.addEventListener('click', handleLogin);
  idInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });
  pwInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleLogin(); });

  function handleLogin() {
    clearErrors();
    let valid = true;
    if (!idInput.value.trim()) { showError(idInput, 'Please enter your ID number.'); valid = false; }
    if (!pwInput.value.trim()) { showError(pwInput, 'Please enter your password.'); valid = false; }
    if (!valid) return;

    if (idInput.value.trim() === 'admin' && pwInput.value === 'admin123') {
      localStorage.setItem('ccs_admin', 'true');
      showPopup({ title: 'Admin Login!', message: 'Welcome, <strong>CCS Admin</strong>!', btnText: 'Go to Admin Panel', redirectUrl: 'admin.html', type: 'success' });
      return;
    }
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const user  = users.find(u => u.idNumber === idInput.value.trim());
    if (!user) { showError(idInput, 'ID number not found. Please register first.'); return; }
    if (user.password !== pwInput.value) { showError(pwInput, 'Incorrect password. Please try again.'); return; }
    localStorage.setItem('ccs_current_user', JSON.stringify(user));
    showPopup({ title: 'Successful Login!', message: `Welcome! <strong>${user.firstName} ${user.lastName}</strong>`, btnText: 'OK', redirectUrl: 'dashboard.html', type: 'success' });
  }
}


// ======================================
//  REGISTER PAGE (register.html)
// ======================================

const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
  registerBtn.addEventListener('click', handleRegister);
  function handleRegister() {
    clearErrors();
    let valid = true;
    const idNumber   = document.getElementById('idNumber');
    const lastName   = document.getElementById('lastName');
    const firstName  = document.getElementById('firstName');
    const middleName = document.getElementById('middleName');
    const course     = document.getElementById('course');
    const yearLevel  = document.getElementById('yearLevel');
    const email      = document.getElementById('email');
    const address    = document.getElementById('address');
    const password   = document.getElementById('password');
    const repeatPw   = document.getElementById('repeatPassword');

    if (!idNumber.value.trim())  { showError(idNumber,  'ID Number is required.');    valid = false; }
    if (!lastName.value.trim())  { showError(lastName,  'Last Name is required.');     valid = false; }
    if (!firstName.value.trim()) { showError(firstName, 'First Name is required.');    valid = false; }
    if (!course.value)           { showError(course,    'Please select a course.');     valid = false; }
    if (!yearLevel.value)        { showError(yearLevel, 'Please select a year level.'); valid = false; }
    if (!address.value.trim())   { showError(address,   'Address is required.');        valid = false; }
    if (!email.value.trim()) { showError(email, 'Email is required.'); valid = false; }
    else if (!isValidEmail(email.value.trim())) { showError(email, 'Please enter a valid email.'); valid = false; }
    if (!password.value) { showError(password, 'Password is required.'); valid = false; }
    else if (password.value.length < 6) { showError(password, 'Min. 6 characters.'); valid = false; }
    if (!repeatPw.value) { showError(repeatPw, 'Please confirm your password.'); valid = false; }
    else if (password.value !== repeatPw.value) { showError(repeatPw, 'Passwords do not match.'); valid = false; }
    if (!valid) return;

    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const exists = users.find(u => u.idNumber === idNumber.value.trim());
    if (exists) { showError(idNumber, 'This ID number is already registered.'); return; }

    const newUser = {
      idNumber: idNumber.value.trim(), lastName: lastName.value.trim(),
      firstName: firstName.value.trim(), middleName: middleName.value.trim(),
      course: course.value, yearLevel: yearLevel.value,
      email: email.value.trim(), address: address.value.trim(),
      password: password.value, username: '', sessions: 30,
    };
    users.push(newUser);
    localStorage.setItem('ccs_users', JSON.stringify(users));
    showPopup({ title: 'Registered Successfully!', message: `Welcome, <strong>${newUser.firstName} ${newUser.lastName}</strong>!<br/>You can now log in.`, btnText: 'Go to Login', redirectUrl: 'index.html', type: 'register' });
  }
}


// ======================================
//  STUDENT DASHBOARD (dashboard.html)
// ======================================

const studentAvatar = document.getElementById('studentAvatar');
if (studentAvatar) {
  const currentUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
  if (!currentUser) { window.location.href = 'index.html'; }
  else {
    studentAvatar.textContent = currentUser.idNumber ? currentUser.idNumber.toString().slice(-2) : '??';
    document.getElementById('infoName').textContent    = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('infoCourse').textContent  = currentUser.course    || '—';
    document.getElementById('infoYear').textContent    = currentUser.yearLevel || '—';
    document.getElementById('infoEmail').textContent   = currentUser.email     || '—';
    document.getElementById('infoAddress').textContent = currentUser.address   || '—';
    document.getElementById('infoSession').textContent = currentUser.sessions  !== undefined ? currentUser.sessions : 30;

    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const list = document.getElementById('announcementList');
    if (list && announcements.length > 0) {
      list.innerHTML = '';
      [...announcements].reverse().forEach(a => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.innerHTML = `<p class="announce-author">CCS Admin | ${a.date}</p><p class="announce-body">${a.text}</p>`;
        list.appendChild(item);
      });
    }
  }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_current_user'); window.location.href = 'index.html'; });
}


// ======================================
//  EDIT PROFILE (edit-profile.html)
// ======================================

const epSaveBtn = document.getElementById('epSaveBtn');
if (epSaveBtn) {
  const currentUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
  if (!currentUser) { window.location.href = 'index.html'; }
  else {
    document.getElementById('epIdNumber').value   = currentUser.idNumber   || '';
    document.getElementById('epLastName').value   = currentUser.lastName   || '';
    document.getElementById('epFirstName').value  = currentUser.firstName  || '';
    document.getElementById('epMiddleName').value = currentUser.middleName || '';
    document.getElementById('epEmail').value      = currentUser.email      || '';
    document.getElementById('epAddress').value    = currentUser.address    || '';
    document.getElementById('epUsername').value   = currentUser.username   || '';
    const epAvatar = document.getElementById('epAvatar');
    if (epAvatar) epAvatar.textContent = currentUser.idNumber ? currentUser.idNumber.toString().slice(-2) : '??';
    const courseSelect = document.getElementById('epCourse');
    const yearSelect   = document.getElementById('epYearLevel');
    if (courseSelect) courseSelect.value = currentUser.course    || '';
    if (yearSelect)   yearSelect.value   = currentUser.yearLevel || '';
  }
  epSaveBtn.addEventListener('click', () => {
    clearErrors();
    let valid = true;
    const lastName  = document.getElementById('epLastName');
    const firstName = document.getElementById('epFirstName');
    const course    = document.getElementById('epCourse');
    const yearLevel = document.getElementById('epYearLevel');
    const email     = document.getElementById('epEmail');
    const address   = document.getElementById('epAddress');
    const username  = document.getElementById('epUsername');
    const newPw     = document.getElementById('epNewPassword');
    const confirmPw = document.getElementById('epConfirmPassword');
    if (!lastName.value.trim())  { showError(lastName,  'Last Name is required.');     valid = false; }
    if (!firstName.value.trim()) { showError(firstName, 'First Name is required.');    valid = false; }
    if (!course.value)           { showError(course,    'Please select a course.');     valid = false; }
    if (!yearLevel.value)        { showError(yearLevel, 'Please select a year level.'); valid = false; }
    if (!address.value.trim())   { showError(address,   'Address is required.');        valid = false; }
    if (!username.value.trim())  { showError(username,  'Username is required.');       valid = false; }
    if (!email.value.trim()) { showError(email, 'Email is required.'); valid = false; }
    else if (!isValidEmail(email.value.trim())) { showError(email, 'Please enter a valid email.'); valid = false; }
    if (newPw.value || confirmPw.value) {
      if (newPw.value.length < 6) { showError(newPw, 'Min. 6 characters.'); valid = false; }
      if (newPw.value !== confirmPw.value) { showError(confirmPw, 'Passwords do not match.'); valid = false; }
    }
    if (!valid) return;
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const idx   = users.findIndex(u => u.idNumber === currentUser.idNumber);
    const updatedUser = { ...currentUser, lastName: lastName.value.trim(), firstName: firstName.value.trim(), middleName: document.getElementById('epMiddleName').value.trim(), course: course.value, yearLevel: yearLevel.value, email: email.value.trim(), address: address.value.trim(), username: username.value.trim(), password: newPw.value ? newPw.value : currentUser.password };
    if (idx !== -1) users[idx] = updatedUser;
    localStorage.setItem('ccs_users', JSON.stringify(users));
    localStorage.setItem('ccs_current_user', JSON.stringify(updatedUser));
    showPopup({ title: 'Profile Updated!', message: 'Your profile has been saved successfully.', btnText: 'Back to Dashboard', redirectUrl: 'dashboard.html', type: 'success' });
  });
  const epCancelBtn = document.getElementById('epCancelBtn');
  if (epCancelBtn) epCancelBtn.addEventListener('click', () => { window.location.href = 'dashboard.html'; });
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_current_user'); window.location.href = 'index.html'; });
}


// ======================================
//  ADMIN DASHBOARD (admin.html)
// ======================================

const adminLogoutBtn = document.getElementById('adminLogoutBtn');
if (adminLogoutBtn) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  const users  = JSON.parse(localStorage.getItem('ccs_users')  || '[]');
  const sitIns = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  document.getElementById('statRegistered').textContent = users.length;
  document.getElementById('statCurrent').textContent    = sitIns.filter(s => s.status === 'active').length;
  document.getElementById('statTotal').textContent      = sitIns.length;

  const courseCounts = {};
  users.forEach(u => { courseCounts[u.course] = (courseCounts[u.course] || 0) + 1; });
  const chartLabels = Object.keys(courseCounts).length > 0 ? Object.keys(courseCounts) : ['No data'];
  const chartData   = Object.keys(courseCounts).length > 0 ? Object.values(courseCounts) : [1];

  new Chart(document.getElementById('sitinChart').getContext('2d'), {
    type: 'pie',
    data: { labels: chartLabels, datasets: [{ data: chartData, backgroundColor: ['#2b7de9','#e05c5c','#f0a500','#4caf50','#9c5cf0'], borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 14 } } } }
  });

  function renderAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const list = document.getElementById('postedList');
    if (!list) return;
    if (announcements.length === 0) { list.innerHTML = '<p class="posted-empty">No announcements yet.</p>'; return; }
    list.innerHTML = '';
    [...announcements].reverse().forEach(a => {
      const item = document.createElement('div');
      item.className = 'posted-item';
      item.innerHTML = `<p class="posted-author">CCS Admin | ${a.date}</p>${a.text ? `<p class="posted-body">${a.text}</p>` : ''}`;
      list.appendChild(item);
    });
  }
  renderAnnouncements();

  document.getElementById('announceSubmitBtn').addEventListener('click', () => {
    const textarea = document.getElementById('newAnnounceText');
    const text = textarea.value.trim();
    if (!text) return;
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    announcements.push({ text, date: getNow() });
    localStorage.setItem('ccs_announcements', JSON.stringify(announcements));
    textarea.value = '';
    renderAnnouncements();
  });

  initSearchModal();
}


// ======================================
//  ADMIN STUDENTS PAGE (admin-students.html)
// ======================================

const studentsTableBody = document.getElementById('studentsTableBody');
if (studentsTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let currentEditId = null;
  let entriesLimit  = 10;
  let searchQuery   = '';

  // ── RENDER TABLE ──
  function renderTable() {
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const filtered = users.filter(u => {
      const fullName = `${u.firstName} ${u.lastName} ${u.idNumber}`.toLowerCase();
      return fullName.includes(searchQuery.toLowerCase());
    });

    const shown = filtered.slice(0, entriesLimit);
    studentsTableBody.innerHTML = '';

    if (shown.length === 0) {
      studentsTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No students registered yet.</td></tr>`;
      document.getElementById('entriesInfo').textContent = 'Showing 0 entries';
      return;
    }

    shown.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.idNumber}</td>
        <td>${u.lastName}, ${u.firstName} ${u.middleName || ''}</td>
        <td>${u.yearLevel}</td>
        <td>${u.course}</td>
        <td>${u.sessions !== undefined ? u.sessions : 30}</td>
        <td>
          <button class="btn-edit"   onclick="openEditModal('${u.idNumber}')">Edit</button>
          <button class="btn-reset-one" onclick="resetOneSession('${u.idNumber}')">Reset</button>
          <button class="btn-delete" onclick="deleteStudent('${u.idNumber}')">Delete</button>
        </td>`;
      studentsTableBody.appendChild(tr);
    });

    document.getElementById('entriesInfo').textContent =
      `Showing ${shown.length} of ${filtered.length} entries`;
  }

  renderTable();

  // ── ENTRIES PER PAGE ──
  document.getElementById('entriesPerPage').addEventListener('change', (e) => {
    entriesLimit = parseInt(e.target.value);
    renderTable();
  });

  // ── TABLE SEARCH ──
  document.getElementById('tableSearchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderTable();
  });

  // ── RESET ALL SESSIONS ──
  document.getElementById('resetAllSessionBtn').addEventListener('click', () => {
    if (!confirm('Reset sessions for ALL students to 30?')) return;
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    users.forEach(u => u.sessions = 30);
    localStorage.setItem('ccs_users', JSON.stringify(users));
    renderTable();
  });

  // ── RESET ONE SESSION ──
  window.resetOneSession = function(idNumber) {
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const idx   = users.findIndex(u => u.idNumber === idNumber);
    if (idx !== -1) { users[idx].sessions = 30; localStorage.setItem('ccs_users', JSON.stringify(users)); renderTable(); }
  };

  // ── DELETE STUDENT ──
  window.deleteStudent = function(idNumber) {
    if (!confirm(`Delete student ${idNumber}? This cannot be undone.`)) return;
    let users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    users = users.filter(u => u.idNumber !== idNumber);
    localStorage.setItem('ccs_users', JSON.stringify(users));
    renderTable();
  };

  // ── ADD STUDENT MODAL ──
  const addOverlay = document.getElementById('addStudentOverlay');
  document.getElementById('openAddStudentBtn').addEventListener('click', () => { addOverlay.classList.add('active'); });
  document.getElementById('closeAddStudentBtn').addEventListener('click', () => addOverlay.classList.remove('active'));
  document.getElementById('cancelAddStudentBtn').addEventListener('click', () => addOverlay.classList.remove('active'));
  addOverlay.addEventListener('click', (e) => { if (e.target === addOverlay) addOverlay.classList.remove('active'); });

  document.getElementById('saveAddStudentBtn').addEventListener('click', () => {
    const idNumber   = document.getElementById('addIdNumber');
    const lastName   = document.getElementById('addLastName');
    const firstName  = document.getElementById('addFirstName');
    const middleName = document.getElementById('addMiddleName');
    const course     = document.getElementById('addCourse');
    const yearLevel  = document.getElementById('addYearLevel');
    const email      = document.getElementById('addEmail');
    const address    = document.getElementById('addAddress');
    const password   = document.getElementById('addPassword');

    clearErrors();
    let valid = true;
    if (!idNumber.value.trim())  { showError(idNumber,  'Required.'); valid = false; }
    if (!lastName.value.trim())  { showError(lastName,  'Required.'); valid = false; }
    if (!firstName.value.trim()) { showError(firstName, 'Required.'); valid = false; }
    if (!course.value)           { showError(course,    'Required.'); valid = false; }
    if (!yearLevel.value)        { showError(yearLevel, 'Required.'); valid = false; }
    if (!email.value.trim())     { showError(email,     'Required.'); valid = false; }
    if (!address.value.trim())   { showError(address,   'Required.'); valid = false; }
    if (!password.value)         { showError(password,  'Required.'); valid = false; }
    if (!valid) return;

    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const exists = users.find(u => u.idNumber === idNumber.value.trim());
    if (exists) { showError(idNumber, 'ID already registered.'); return; }

    users.push({
      idNumber: idNumber.value.trim(), lastName: lastName.value.trim(),
      firstName: firstName.value.trim(), middleName: middleName.value.trim(),
      course: course.value, yearLevel: yearLevel.value,
      email: email.value.trim(), address: address.value.trim(),
      password: password.value, username: '', sessions: 30,
    });
    localStorage.setItem('ccs_users', JSON.stringify(users));
    addOverlay.classList.remove('active');

    // Clear fields
    [idNumber, lastName, firstName, middleName, email, address, password].forEach(el => el.value = '');
    course.value = ''; yearLevel.value = '';
    renderTable();
  });

  // ── EDIT STUDENT MODAL ──
  const editOverlay = document.getElementById('editStudentOverlay');
  document.getElementById('closeEditStudentBtn').addEventListener('click', () => editOverlay.classList.remove('active'));
  document.getElementById('cancelEditStudentBtn').addEventListener('click', () => editOverlay.classList.remove('active'));
  editOverlay.addEventListener('click', (e) => { if (e.target === editOverlay) editOverlay.classList.remove('active'); });

  window.openEditModal = function(idNumber) {
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const user  = users.find(u => u.idNumber === idNumber);
    if (!user) return;
    currentEditId = idNumber;
    document.getElementById('editIdNumber').value   = user.idNumber;
    document.getElementById('editLastName').value   = user.lastName;
    document.getElementById('editFirstName').value  = user.firstName;
    document.getElementById('editMiddleName').value = user.middleName || '';
    document.getElementById('editCourse').value     = user.course;
    document.getElementById('editYearLevel').value  = user.yearLevel;
    document.getElementById('editEmail').value      = user.email;
    document.getElementById('editAddress').value    = user.address;
    document.getElementById('editSessions').value   = user.sessions !== undefined ? user.sessions : 30;
    editOverlay.classList.add('active');
  };

  document.getElementById('saveEditStudentBtn').addEventListener('click', () => {
    clearErrors();
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const idx   = users.findIndex(u => u.idNumber === currentEditId);
    if (idx === -1) return;

    users[idx] = {
      ...users[idx],
      lastName:   document.getElementById('editLastName').value.trim(),
      firstName:  document.getElementById('editFirstName').value.trim(),
      middleName: document.getElementById('editMiddleName').value.trim(),
      course:     document.getElementById('editCourse').value,
      yearLevel:  document.getElementById('editYearLevel').value,
      email:      document.getElementById('editEmail').value.trim(),
      address:    document.getElementById('editAddress').value.trim(),
      sessions:   parseInt(document.getElementById('editSessions').value) || 0,
    };

    localStorage.setItem('ccs_users', JSON.stringify(users));
    editOverlay.classList.remove('active');
    renderTable();
  });

  // ── LOGOUT ──
  const adminLogout = document.getElementById('adminLogoutBtn');
  if (adminLogout) adminLogout.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  initSearchModal();
}


// ======================================
//  ADMIN SIT-IN PAGE (admin-sitin.html)
// ======================================

const sitinTableBody = document.getElementById('sitinTableBody');

if (sitinTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let entriesLimit = 10;
  let searchQuery  = '';
  let currentPage  = 1;

  function getSitins() {
    return JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  }

  function renderSitin() {
    const sitins = getSitins();
    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');

    const filtered = sitins.filter(s => {
      const user = users.find(u => u.idNumber === s.idNumber);
      const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
      return name.includes(searchQuery.toLowerCase()) ||
             s.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);

    sitinTableBody.innerHTML = '';

    if (shown.length === 0) {
      sitinTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No data available</td></tr>`;
    } else {
      shown.forEach((s, idx) => {
        const user    = users.find(u => u.idNumber === s.idNumber);
        const name    = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
        const status  = s.status === 'active'
          ? `<span class="badge-active">Active</span>`
          : `<span class="badge-done">Done</span>`;
        const actions = s.status === 'active'
          ? `<button class="btn-end-session" onclick="endSession('${s.sitId}')">End Session</button>`
          : '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.sitId}</td>
          <td>${s.idNumber}</td>
          <td>${name}</td>
          <td>${s.purpose || '—'}</td>
          <td>${s.lab || '—'}</td>
          <td>${s.session || '—'}</td>
          <td>${status}</td>
          <td>${actions}</td>`;
        sitinTableBody.appendChild(tr);
      });
    }

    // Update info
    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent =
      filtered.length === 0
        ? 'Showing 0 entries'
        : `Showing ${from} to ${to} of ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;

    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '&#171;';
    prev.disabled  = currentPage === 1;
    prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderSitin(); } });
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === currentPage ? ' active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => { currentPage = i; renderSitin(); });
      pagination.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '&#187;';
    next.disabled  = currentPage === totalPages;
    next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderSitin(); } });
    pagination.appendChild(next);
  }

  // End a session
  window.endSession = function(sitId) {
    if (!confirm('End this sit-in session?')) return;
    const sitins = getSitins();
    const idx    = sitins.findIndex(s => s.sitId === sitId);
    if (idx !== -1) {
      sitins[idx].status  = 'done';
      sitins[idx].timeOut = new Date().toLocaleTimeString();

      // Deduct session from student
      const users    = JSON.parse(localStorage.getItem('ccs_users') || '[]');
      const userIdx  = users.findIndex(u => u.idNumber === sitins[idx].idNumber);
      if (userIdx !== -1 && users[userIdx].sessions > 0) {
        users[userIdx].sessions -= 1;
        localStorage.setItem('ccs_users', JSON.stringify(users));
      }

      localStorage.setItem('ccs_sitins', JSON.stringify(sitins));
      renderSitin();
    }
  };

  // Entries per page
  document.getElementById('entriesPerPage').addEventListener('change', (e) => {
    entriesLimit = parseInt(e.target.value);
    currentPage  = 1;
    renderSitin();
  });

  // Search
  document.getElementById('tableSearchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderSitin();
  });

  // Logout
  const adminLogout2 = document.getElementById('adminLogoutBtn');
  if (adminLogout2) adminLogout2.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  initSearchModal();
  renderSitin();
}


// ======================================
//  VIEW SIT-IN RECORDS (admin-records.html)
// ======================================

const recordsTableBody = document.getElementById('recordsTableBody');

if (recordsTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let entriesLimit = 10;
  let searchQuery  = '';
  let currentPage  = 1;

  function getRecords() {
    // Show only completed (done) sit-ins as records
    return JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  }

  function renderCharts() {
    const sitins = getRecords();
    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');

    // Sit-ins by Purpose (Programming Language)
    const purposeCounts = {};
    sitins.forEach(s => {
      const key = s.purpose || 'Unknown';
      purposeCounts[key] = (purposeCounts[key] || 0) + 1;
    });

    // Sit-ins by Lab Room
    const labCounts = {};
    sitins.forEach(s => {
      const key = s.lab || 'Unknown';
      labCounts[key] = (labCounts[key] || 0) + 1;
    });

    const langLabels = Object.keys(purposeCounts).length ? Object.keys(purposeCounts) : ['No Data'];
    const langData   = Object.keys(purposeCounts).length ? Object.values(purposeCounts) : [0];
    const labLabels  = Object.keys(labCounts).length ? Object.keys(labCounts) : ['No Data'];
    const labData    = Object.keys(labCounts).length ? Object.values(labCounts) : [0];

    const barOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
        x: { ticks: { font: { size: 11 } } }
      }
    };

    new Chart(document.getElementById('langChart').getContext('2d'), {
      type: 'bar',
      data: { labels: langLabels, datasets: [{ data: langData, backgroundColor: '#2b7de9', borderRadius: 4 }] },
      options: barOptions
    });

    new Chart(document.getElementById('labChart').getContext('2d'), {
      type: 'bar',
      data: { labels: labLabels, datasets: [{ data: labData, backgroundColor: '#4caf50', borderRadius: 4 }] },
      options: barOptions
    });
  }

  function renderRecords() {
    const sitins = getRecords();
    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');

    const filtered = sitins.filter(s => {
      const user = users.find(u => u.idNumber === s.idNumber);
      const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
      return name.includes(searchQuery.toLowerCase()) ||
             s.idNumber.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);

    recordsTableBody.innerHTML = '';

    if (shown.length === 0) {
      recordsTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No data available</td></tr>`;
    } else {
      shown.forEach((s, idx) => {
        const user   = users.find(u => u.idNumber === s.idNumber);
        const name   = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
        const tr     = document.createElement('tr');
        tr.innerHTML = `
          <td>${start + idx + 1}</td>
          <td>${s.idNumber}</td>
          <td>${name}</td>
          <td>${s.purpose || '—'}</td>
          <td>${s.lab || '—'}</td>
          <td>${s.timeIn  || '—'}</td>
          <td>${s.timeOut || '—'}</td>
          <td>${s.date    || '—'}</td>`;
        recordsTableBody.appendChild(tr);
      });
    }

    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent =
      filtered.length === 0
        ? 'Showing 0 entries'
        : `Showing ${from} to ${to} of ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;

    renderRecordsPagination(totalPages);
  }

  function renderRecordsPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'page-btn';
    prev.innerHTML = '&#171;';
    prev.disabled  = currentPage === 1;
    prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderRecords(); } });
    pagination.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === currentPage ? ' active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => { currentPage = i; renderRecords(); });
      pagination.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn';
    next.innerHTML = '&#187;';
    next.disabled  = currentPage === totalPages;
    next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderRecords(); } });
    pagination.appendChild(next);
  }

  // Reset all sessions to 30
  document.getElementById('resetSessionsBtn').addEventListener('click', () => {
    if (!confirm('Reset all student sessions to 30?')) return;
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    users.forEach(u => u.sessions = 30);
    localStorage.setItem('ccs_users', JSON.stringify(users));
    alert('All sessions have been reset to 30.');
  });

  // Clear all sit-in records
  document.getElementById('clearRecordsBtn').addEventListener('click', () => {
    if (!confirm('Clear ALL sit-in records? This cannot be undone.')) return;
    localStorage.setItem('ccs_sitins', '[]');
    renderRecords();
  });

  // Entries per page
  document.getElementById('entriesPerPage').addEventListener('change', (e) => {
    entriesLimit = parseInt(e.target.value);
    currentPage  = 1;
    renderRecords();
  });

  // Search
  document.getElementById('tableSearchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value;
    currentPage = 1;
    renderRecords();
  });

  // Logout
  const adminLogout3 = document.getElementById('adminLogoutBtn');
  if (adminLogout3) adminLogout3.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  initSearchModal();
  renderCharts();
  renderRecords();
}


// ======================================
//  SIT-IN REPORTS (admin-reports.html)
// ======================================

const reportsTableBody = document.getElementById('reportsTableBody');

if (reportsTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let currentPage  = 1;
  let entriesLimit = 10;
  let filterQuery  = '';
  let dateFilter   = '';

  function getFiltered() {
    const sitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
    const users  = JSON.parse(localStorage.getItem('ccs_users')  || '[]');

    return sitins.filter(s => {
      const user     = users.find(u => u.idNumber === s.idNumber);
      const name     = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : '';
      const matchStr = (name + s.idNumber + (s.purpose||'') + (s.lab||'') + (s.date||'')).toLowerCase();
      const matchFilter = matchStr.includes(filterQuery.toLowerCase());
      const matchDate   = dateFilter ? s.date === dateFilter : true;
      return matchFilter && matchDate;
    });
  }

  function renderReports() {
    const users    = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const filtered = getFiltered();

    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);

    reportsTableBody.innerHTML = '';

    if (shown.length === 0) {
      reportsTableBody.innerHTML = `<tr><td colspan="7" class="table-empty">No records found.</td></tr>`;
    } else {
      shown.forEach(s => {
        const user = users.find(u => u.idNumber === s.idNumber);
        const name = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
        const tr   = document.createElement('tr');
        tr.innerHTML = `
          <td>${s.idNumber}</td>
          <td>${name}</td>
          <td>${s.purpose  || '—'}</td>
          <td>${s.lab      || '—'}</td>
          <td>${s.timeIn   || '—'}</td>
          <td>${s.timeOut  || '—'}</td>
          <td>${s.date     || '—'}</td>`;
        reportsTableBody.appendChild(tr);
      });
    }

    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent =
      filtered.length === 0
        ? 'Showing 0 entries'
        : `Showing ${from} to ${to} of ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;

    buildPagination(totalPages);
  }

  function buildPagination(totalPages) {
    const pg = document.getElementById('pagination');
    pg.innerHTML = '';

    const mkBtn = (label, page, disabled) => {
      const b = document.createElement('button');
      b.className   = `page-btn${page === currentPage ? ' active' : ''}`;
      b.innerHTML   = label;
      b.disabled    = disabled;
      b.addEventListener('click', () => { if (!disabled) { currentPage = page; renderReports(); } });
      return b;
    };

    pg.appendChild(mkBtn('&#8249;', 1,           currentPage === 1));
    pg.appendChild(mkBtn('&#171;', Math.max(1, currentPage - 1), currentPage === 1));
    for (let i = 1; i <= totalPages; i++) pg.appendChild(mkBtn(i, i, false));
    pg.appendChild(mkBtn('&#187;', Math.min(totalPages, currentPage + 1), currentPage === totalPages));
    pg.appendChild(mkBtn('&#8250;', totalPages,  currentPage === totalPages));
  }

  // Date search
  document.getElementById('reportSearchBtn').addEventListener('click', () => {
    dateFilter  = document.getElementById('reportDateInput').value;
    currentPage = 1;
    renderReports();
  });

  // Reset
  document.getElementById('reportResetBtn').addEventListener('click', () => {
    document.getElementById('reportDateInput').value = '';
    document.getElementById('reportFilterInput').value = '';
    dateFilter  = '';
    filterQuery = '';
    currentPage = 1;
    renderReports();
  });

  // Filter input
  document.getElementById('reportFilterInput').addEventListener('input', (e) => {
    filterQuery = e.target.value;
    currentPage = 1;
    renderReports();
  });

  // ── EXPORT CSV ──
  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const users    = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const filtered = getFiltered();
    if (filtered.length === 0) { alert('No records to export.'); return; }

    let csv = 'ID Number,Name,Purpose,Laboratory,Login,Logout,Date\n';
    filtered.forEach(s => {
      const user = users.find(u => u.idNumber === s.idNumber);
      const name = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
      csv += `${s.idNumber},"${name}","${s.purpose||''}","${s.lab||''}","${s.timeIn||''}","${s.timeOut||''}","${s.date||''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'sitin-report.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  // ── EXPORT PDF (print-friendly) ──
  document.getElementById('exportPdfBtn').addEventListener('click', () => { window.print(); });

  // ── PRINT ──
  document.getElementById('printBtn').addEventListener('click', () => { window.print(); });

  // ── EXPORT EXCEL (CSV with .xls hint) ──
  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    const users    = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const filtered = getFiltered();
    if (filtered.length === 0) { alert('No records to export.'); return; }

    let csv = 'ID Number\tName\tPurpose\tLaboratory\tLogin\tLogout\tDate\n';
    filtered.forEach(s => {
      const user = users.find(u => u.idNumber === s.idNumber);
      const name = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
      csv += `${s.idNumber}\t${name}\t${s.purpose||''}\t${s.lab||''}\t${s.timeIn||''}\t${s.timeOut||''}\t${s.date||''}\n`;
    });

    const blob = new Blob([csv], { type: 'application/vnd.ms-excel' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'sitin-report.xls'; a.click();
    URL.revokeObjectURL(url);
  });

  // Logout
  const adminLogout4 = document.getElementById('adminLogoutBtn');
  if (adminLogout4) adminLogout4.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  initSearchModal();
  renderReports();
}


// ======================================
//  FEEDBACK REPORTS (admin-feedback.html)
// ======================================

const feedbackTableBody = document.getElementById('feedbackTableBody');

if (feedbackTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let currentPage  = 1;
  let entriesLimit = 10;
  let filterQuery  = '';

  function getFiltered() {
    const feedbacks = JSON.parse(localStorage.getItem('ccs_feedbacks') || '[]');
    return feedbacks.filter(f => {
      const str = `${f.idNumber} ${f.lab || ''} ${f.date || ''} ${f.message || ''}`.toLowerCase();
      return str.includes(filterQuery.toLowerCase());
    });
  }

  function renderFeedback() {
    const filtered   = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);

    feedbackTableBody.innerHTML = '';

    if (shown.length === 0) {
      feedbackTableBody.innerHTML = `<tr><td colspan="4" class="table-empty">No feedback found.</td></tr>`;
    } else {
      shown.forEach(f => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${f.idNumber}</td>
          <td>${f.lab     || '—'}</td>
          <td>${f.date    || '—'}</td>
          <td class="feedback-msg">${f.message || '—'}</td>`;
        feedbackTableBody.appendChild(tr);
      });
    }

    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent =
      filtered.length === 0
        ? 'Showing 0 entries'
        : `Showing ${from} to ${to} of ${filtered.length} entr${filtered.length === 1 ? 'y' : 'ies'}`;

    buildFeedbackPagination(totalPages);
  }

  function buildFeedbackPagination(totalPages) {
    const pg = document.getElementById('pagination');
    pg.innerHTML = '';

    const mkBtn = (label, page, disabled) => {
      const b = document.createElement('button');
      b.className = `page-btn${page === currentPage ? ' active' : ''}`;
      b.innerHTML = label;
      b.disabled  = disabled;
      b.addEventListener('click', () => { if (!disabled) { currentPage = page; renderFeedback(); } });
      return b;
    };

    pg.appendChild(mkBtn('&#8249;', 1,           currentPage === 1));
    pg.appendChild(mkBtn('&#171;', Math.max(1, currentPage - 1), currentPage === 1));
    for (let i = 1; i <= totalPages; i++) pg.appendChild(mkBtn(i, i, false));
    pg.appendChild(mkBtn('&#187;', Math.min(totalPages, currentPage + 1), currentPage === totalPages));
    pg.appendChild(mkBtn('&#8250;', totalPages,  currentPage === totalPages));
  }

  // Filter
  document.getElementById('feedbackFilterInput').addEventListener('input', (e) => {
    filterQuery = e.target.value;
    currentPage = 1;
    renderFeedback();
  });

  // Print
  document.getElementById('feedbackPrintBtn').addEventListener('click', () => window.print());

  // Logout
  const adminLogout5 = document.getElementById('adminLogoutBtn');
  if (adminLogout5) adminLogout5.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  initSearchModal();
  renderFeedback();
}


// ======================================
//  RESERVATION (admin-reservation.html)
// ======================================

const computerGrid = document.getElementById('computerGrid');

if (computerGrid) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  const TOTAL_COMPUTERS = 20;

  function getComputers(lab) {
    const key  = `ccs_computers_${lab}`;
    const data = JSON.parse(localStorage.getItem(key) || 'null');
    if (data) return data;
    // Default: all available
    const defaults = {};
    for (let i = 1; i <= TOTAL_COMPUTERS; i++) defaults[i] = 'available';
    return defaults;
  }

  function saveComputers(lab, data) {
    localStorage.setItem(`ccs_computers_${lab}`, JSON.stringify(data));
  }

  function renderComputers() {
    const lab       = document.getElementById('labInput').value.trim() || '524';
    const computers = getComputers(lab);
    computerGrid.innerHTML = '';

    for (let i = 1; i <= TOTAL_COMPUTERS; i++) {
      const status = computers[i] || 'available';
      const btn    = document.createElement('button');
      btn.className   = `computer-btn ${status}`;
      btn.textContent = i;
      btn.addEventListener('click', () => {
        if (status === 'available') {
          if (!confirm(`Mark Computer ${i} as Used?`)) return;
          computers[i] = 'used';
        } else {
          if (!confirm(`Mark Computer ${i} as Available?`)) return;
          computers[i] = 'available';
        }
        saveComputers(lab, computers);
        renderComputers();
      });
      computerGrid.appendChild(btn);
    }
  }

  document.getElementById('labFilterBtn').addEventListener('click', renderComputers);
  document.getElementById('labInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') renderComputers(); });

  // ── RESERVATION REQUESTS ──
  function renderRequests() {
    const requests = JSON.parse(localStorage.getItem('ccs_reservations') || '[]');
    const pending  = requests.filter(r => r.status === 'pending');
    const panel    = document.getElementById('reservationRequests');
    panel.innerHTML = '';

    if (pending.length === 0) {
      panel.innerHTML = '<p class="res-empty">No pending reservation requests.</p>';
      return;
    }

    pending.forEach(r => {
      const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
      const user  = users.find(u => u.idNumber === r.idNumber);
      const name  = user ? `${user.firstName} ${user.lastName}` : r.idNumber;

      const item = document.createElement('div');
      item.className = 'res-request-item';
      item.innerHTML = `
        <p><strong>${name}</strong> (${r.idNumber})</p>
        <p>Lab: ${r.lab} &nbsp;|&nbsp; PC: ${r.computer}</p>
        <p>Date: ${r.date} &nbsp;|&nbsp; ${r.timeSlot || ''}</p>
        <div class="res-request-actions">
          <button class="btn-approve" onclick="handleReservation('${r.resId}', 'approved')">Approve</button>
          <button class="btn-reject"  onclick="handleReservation('${r.resId}', 'rejected')">Reject</button>
        </div>`;
      panel.appendChild(item);
    });
  }

  // ── LOGS ──
  function renderLogs() {
    const requests = JSON.parse(localStorage.getItem('ccs_reservations') || '[]');
    const done     = requests.filter(r => r.status !== 'pending');
    const panel    = document.getElementById('reservationLogs');
    panel.innerHTML = '';

    if (done.length === 0) {
      panel.innerHTML = '<p class="res-empty">No reservation logs yet.</p>';
      return;
    }

    [...done].reverse().forEach(r => {
      const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
      const user  = users.find(u => u.idNumber === r.idNumber);
      const name  = user ? `${user.firstName} ${user.lastName}` : r.idNumber;
      const color = r.status === 'approved' ? '#4caf50' : '#e02020';

      const item = document.createElement('div');
      item.className = 'res-log-item';
      item.innerHTML = `
        <strong>${name}</strong> — Lab ${r.lab}, PC ${r.computer}<br/>
        <span style="color:${color}; font-weight:600; text-transform:capitalize;">${r.status}</span>
        &nbsp;|&nbsp; ${r.date}`;
      panel.appendChild(item);
    });
  }

  window.handleReservation = function(resId, action) {
    const requests = JSON.parse(localStorage.getItem('ccs_reservations') || '[]');
    const idx      = requests.findIndex(r => r.resId === resId);
    if (idx !== -1) {
      requests[idx].status = action;
      // If approved, mark computer as used
      if (action === 'approved') {
        const lab       = requests[idx].lab;
        const computer  = requests[idx].computer;
        const computers = getComputers(lab);
        computers[computer] = 'used';
        saveComputers(lab, computers);
        renderComputers();
      }
      localStorage.setItem('ccs_reservations', JSON.stringify(requests));
      renderRequests();
      renderLogs();
    }
  };

  // Logout
  const adminLogout6 = document.getElementById('adminLogoutBtn');
  if (adminLogout6) adminLogout6.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  initSearchModal();
  renderComputers();
  renderRequests();
  renderLogs();
}