// ======================================
//  API HELPERS
// ======================================

const API = {
  users:         'api/users.php',
  sitins:        'api/sitins.php',
  announcements: 'api/announcements.php',
  feedbacks:     'api/feedbacks.php',
  reservations:  'api/reservations.php',
  computers:     'api/computers.php',
  softwares:     'api/softwares.php',
};

async function apiGet(endpoint, params = {}) {
  const url = new URL(endpoint, window.location.href);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  return res.json();
}

async function apiPost(endpoint, action, body = {}) {
  const url = new URL(endpoint, window.location.href);
  url.searchParams.set('action', action);
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
}

function getCurrentUser() {
  return JSON.parse(sessionStorage.getItem('ccs_current_user') || 'null');
}
function setCurrentUser(user) {
  sessionStorage.setItem('ccs_current_user', JSON.stringify(user));
}
function clearCurrentUser() {
  sessionStorage.removeItem('ccs_current_user');
}


// ======================================
//  SHARED HELPERS
// ======================================

function showError(input, message) {
  input.classList.add('input-error');
  const err       = document.createElement('span');
  err.className   = 'error-msg';
  err.textContent = message;
  const parent = input.closest('.ep-group') || input.closest('.form-group') || input.closest('.modal-group') || input.closest('.sitin-form-group');
  if (parent) parent.appendChild(err);
}

function clearErrors() {
  document.querySelectorAll('.error-msg').forEach(el => el.remove());
  document.querySelectorAll('.input-error').forEach(el => el.classList.remove('input-error'));
}

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

function getNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    if (target.type === 'password') { target.type = 'text'; btn.style.color = '#2b7de9'; }
    else { target.type = 'password'; btn.style.color = '#999'; }
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


// ======================================
//  SHARED SEARCH MODAL (admin pages)
// ======================================

function initSearchModal() {
  const searchOverlay = document.getElementById('searchOverlay');
  if (!searchOverlay) return;

  const openSearchBtn  = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput    = document.getElementById('searchInput');
  const searchGoBtn    = document.getElementById('searchGoBtn');
  const searchResults  = document.getElementById('searchResults');

  if (!document.getElementById('searchResultsPanel')) {
    const resultsPanel = document.createElement('div');
    resultsPanel.id = 'searchResultsPanel';
    searchResults.parentNode.insertBefore(resultsPanel, searchResults);
    resultsPanel.appendChild(searchResults);
  }

  if (!document.getElementById('sitinFormPanel')) {
    const formPanel = document.createElement('div');
    formPanel.id    = 'sitinFormPanel';
    formPanel.style.display = 'none';
    formPanel.innerHTML = `
      <div class="sitin-student-card">
        <div class="sitin-student-avatar" id="sitinAvatar">??</div>
        <div class="sitin-student-info">
          <h4 id="sitinStudentName">—</h4>
          <div class="sitin-student-meta"><span>ID NUMBER</span><span id="sitinStudentId">—</span></div>
          <div class="sitin-student-meta"><span>REMAINING</span><span id="sitinStudentSessions" class="sitin-sessions-count">—</span></div>
        </div>
      </div>
      <div class="sitin-admin-form">
        <div class="sitin-admin-field">
          <label>Purpose</label>
          <select id="adminSitinPurpose">
            <option value="">Select purpose</option>
            <option value="C">C</option><option value="C#">C#</option>
            <option value="Java">Java</option><option value="ASP.Net">ASP.Net</option>
            <option value="PHP">PHP</option><option value="Python">Python</option>
            <option value="HTML/CSS">HTML/CSS</option><option value="JavaScript">JavaScript</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="sitin-admin-field">
          <label>Lab Room</label>
          <select id="adminSitinLab">
            <option value="">Select lab</option>
            <option value="524">524</option><option value="526">526</option>
            <option value="528">528</option><option value="530">530</option>
            <option value="542">542</option>
          </select>
        </div>
      </div>
      <div class="sitin-admin-actions">
        <button class="sitin-admin-cancel-btn" id="sitinBackBtn">Cancel</button>
        <button class="sitin-admin-confirm-btn" id="sitinConfirmBtn">Confirm Sit-In</button>
      </div>`;
    document.getElementById('searchResultsPanel').parentNode.appendChild(formPanel);
  }

  const searchResultsPanel = document.getElementById('searchResultsPanel');
  const sitinFormPanel     = document.getElementById('sitinFormPanel');
  let selectedUser = null;

  function showResultsPanel() { searchResultsPanel.style.display = 'block'; sitinFormPanel.style.display = 'none'; }
  function showSitinPanel(u) {
    selectedUser = u;
    searchResultsPanel.style.display = 'none';
    sitinFormPanel.style.display     = 'block';
    document.getElementById('sitinAvatar').textContent      = ((u.firstName[0]||'')+(u.lastName[0]||'')).toUpperCase();
    document.getElementById('sitinStudentName').textContent = `${u.firstName} ${u.middleName ? u.middleName+' ' : ''}${u.lastName}`;
    document.getElementById('sitinStudentId').textContent   = u.idNumber;
    document.getElementById('sitinStudentSessions').textContent = `${u.sessions ?? 30} / 30`;
    document.getElementById('adminSitinPurpose').value = '';
    document.getElementById('adminSitinLab').value     = '';
  }

  function openModal() {
    searchOverlay.classList.add('active');
    searchInput.focus();
    searchResults.innerHTML = '';
    searchInput.value = '';
    showResultsPanel();
  }

  if (openSearchBtn) openSearchBtn.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
  closeSearchBtn.addEventListener('click', () => searchOverlay.classList.remove('active'));
  searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) searchOverlay.classList.remove('active'); });
  searchInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') doSearch(); if (e.key === 'Escape') searchOverlay.classList.remove('active'); });
  searchGoBtn.addEventListener('click', doSearch);
  document.getElementById('sitinBackBtn').addEventListener('click', () => showResultsPanel());

  document.getElementById('sitinConfirmBtn').addEventListener('click', async () => {
    const purpose = document.getElementById('adminSitinPurpose').value;
    const lab     = document.getElementById('adminSitinLab').value;
    if (!purpose) { alert('Please select a purpose.'); return; }
    if (!lab)     { alert('Please select a lab room.'); return; }
    if (!selectedUser) return;

    const now    = new Date();
    const result = await apiPost(API.sitins, 'add', {
      sitId:    'SIT-' + Date.now(),
      idNumber:  selectedUser.idNumber,
      purpose, lab,
      timeIn:   now.toLocaleTimeString(),
      date:     getNow(),
    });

    if (!result.success) { alert(result.message || 'Failed to log sit-in.'); return; }
    searchOverlay.classList.remove('active');
    showPopup({ title: 'Sit-in Confirmed!', message: `<strong>${selectedUser.firstName} ${selectedUser.lastName}</strong> has been logged in.<br/>Lab: <strong>${lab}</strong> | Purpose: <strong>${purpose}</strong>`, btnText: 'OK', type: 'success' });
  });

  async function doSearch() {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    showResultsPanel();
    if (!query) { searchResults.innerHTML = '<p class="search-no-result">Please enter a name or ID number.</p>'; return; }

    const allUsers = await apiGet(API.users, { action: 'getAll' });
    const found    = allUsers.filter(u => {
      const name = `${u.firstName} ${u.lastName} ${u.middleName || ''}`.toLowerCase();
      return name.includes(query) || u.idNumber.toLowerCase().includes(query);
    });

    if (!found.length) { searchResults.innerHTML = '<p class="search-no-result">No students found.</p>'; return; }
    found.forEach(u => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      item.innerHTML = `
        <div class="search-result-avatar">${(u.firstName[0]||'')+(u.lastName[0]||'')}</div>
        <div class="search-result-info">
          <p class="search-result-name">${u.firstName} ${u.middleName ? u.middleName+' ' : ''}${u.lastName}</p>
          <p class="search-result-details">ID: ${u.idNumber} &nbsp;|&nbsp; ${u.course} ${u.yearLevel} year</p>
          <p class="search-result-sessions">${u.sessions ?? 30} sessions</p>
          <p class="search-result-click-hint">Click to select</p>
        </div>`;
      item.addEventListener('click', () => showSitinPanel(u));
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

  async function handleLogin() {
    clearErrors();
    let valid = true;
    if (!idInput.value.trim()) { showError(idInput, 'Please enter your ID number.'); valid = false; }
    if (!pwInput.value.trim()) { showError(pwInput, 'Please enter your password.');  valid = false; }
    if (!valid) return;

    if (idInput.value.trim() === 'admin' && pwInput.value === 'admin123') {
      sessionStorage.setItem('ccs_admin', 'true');
      showPopup({ title: 'Admin Login!', message: 'Welcome, <strong>CCS Admin</strong>!', btnText: 'Go to Admin Panel', redirectUrl: 'admin.html', type: 'success' });
      return;
    }

    loginBtn.disabled    = true;
    loginBtn.textContent = 'Logging in…';
    try {
      const data = await apiPost(API.users, 'login', { idNumber: idInput.value.trim(), password: pwInput.value });
      if (data.success) {
        setCurrentUser(data.user);
        showPopup({ title: 'Successful Login!', message: `Welcome! <strong>${data.user.firstName} ${data.user.lastName}</strong>`, btnText: 'OK', redirectUrl: 'dashboard.html', type: 'success' });
      } else {
        showError(idInput, data.message || 'Login failed.');
      }
    } catch (e) {
      alert('Server error. Make sure XAMPP is running.');
    } finally {
      loginBtn.disabled    = false;
      loginBtn.textContent = 'Login';
    }
  }
}


// ======================================
//  REGISTER PAGE (register.html)
// ======================================

const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
  registerBtn.addEventListener('click', handleRegister);

  async function handleRegister() {
    clearErrors();
    let valid    = true;
    const fields = {
      idNumber:  document.getElementById('idNumber'),
      lastName:  document.getElementById('lastName'),
      firstName: document.getElementById('firstName'),
      middleName:document.getElementById('middleName'),
      course:    document.getElementById('course'),
      yearLevel: document.getElementById('yearLevel'),
      email:     document.getElementById('email'),
      address:   document.getElementById('address'),
      password:  document.getElementById('password'),
      repeatPw:  document.getElementById('repeatPassword'),
    };

    if (!fields.idNumber.value.trim())  { showError(fields.idNumber,  'ID Number is required.');       valid = false; }
    if (!fields.lastName.value.trim())  { showError(fields.lastName,  'Last Name is required.');        valid = false; }
    if (!fields.firstName.value.trim()) { showError(fields.firstName, 'First Name is required.');       valid = false; }
    if (!fields.course.value)           { showError(fields.course,    'Please select a course.');        valid = false; }
    if (!fields.yearLevel.value)        { showError(fields.yearLevel, 'Please select a year level.');    valid = false; }
    if (!fields.address.value.trim())   { showError(fields.address,   'Address is required.');           valid = false; }
    if (!fields.email.value.trim())     { showError(fields.email,     'Email is required.');             valid = false; }
    else if (!isValidEmail(fields.email.value.trim())) { showError(fields.email, 'Please enter a valid email.'); valid = false; }
    if (!fields.password.value)         { showError(fields.password,  'Password is required.');          valid = false; }
    else if (fields.password.value.length < 6) { showError(fields.password, 'Min. 6 characters.');      valid = false; }
    if (!fields.repeatPw.value)         { showError(fields.repeatPw,  'Please confirm your password.'); valid = false; }
    else if (fields.password.value !== fields.repeatPw.value) { showError(fields.repeatPw, 'Passwords do not match.'); valid = false; }
    if (!valid) return;

    registerBtn.disabled    = true;
    registerBtn.textContent = 'Registering…';
    try {
      const data = await apiPost(API.users, 'register', {
        idNumber:   fields.idNumber.value.trim(),
        lastName:   fields.lastName.value.trim(),
        firstName:  fields.firstName.value.trim(),
        middleName: fields.middleName.value.trim(),
        course:     fields.course.value,
        yearLevel:  fields.yearLevel.value,
        email:      fields.email.value.trim(),
        address:    fields.address.value.trim(),
        password:   fields.password.value,
      });
      if (data.success) {
        showPopup({ title: 'Registered Successfully!', message: `Welcome, <strong>${fields.firstName.value.trim()} ${fields.lastName.value.trim()}</strong>!<br/>You can now log in.`, btnText: 'Go to Login', redirectUrl: 'index.html', type: 'register' });
      } else {
        showError(fields.idNumber, data.message || 'Registration failed.');
      }
    } catch (e) {
      alert('Server error. Make sure XAMPP is running.');
    } finally {
      registerBtn.disabled    = false;
      registerBtn.textContent = 'Register';
    }
  }
}


// ======================================
//  STUDENT DASHBOARD (dashboard.html)
// ======================================

const studentAvatar = document.getElementById('studentAvatar');
if (studentAvatar) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; }
  else {
    studentAvatar.textContent = currentUser.idNumber ? currentUser.idNumber.toString().slice(-2) : '??';
    document.getElementById('infoName').textContent    = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('infoCourse').textContent  = currentUser.course    || '—';
    document.getElementById('infoYear').textContent    = currentUser.yearLevel || '—';
    document.getElementById('infoEmail').textContent   = currentUser.email     || '—';
    document.getElementById('infoAddress').textContent = currentUser.address   || '—';
    document.getElementById('infoSession').textContent = currentUser.sessions  ?? 30;

    async function loadAnnouncements() {
      const list = document.getElementById('announcementList');
      if (!list) return;
      const announcements = await apiGet(API.announcements, { action: 'getAll' });
      if (!announcements.length) { list.innerHTML = '<p style="font-size:13px;color:#aaa;text-align:center;margin-top:20px;">No announcements yet.</p>'; return; }
      list.innerHTML = '';
      [...announcements].reverse().forEach(a => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.innerHTML = `<p class="announce-author">CCS Admin | ${a.date}</p><p class="announce-body">${a.text}</p>`;
        list.appendChild(item);
      });
    }

    async function loadNotifications() {
      const announcements = await apiGet(API.announcements, { action: 'getAll' });
      const readKey  = `ccs_notif_read_${currentUser.idNumber}`;
      const lastRead = parseInt(localStorage.getItem(readKey) || '0');
      const unread   = announcements.filter(a => parseInt(a.id) > lastRead);
      const badge    = document.getElementById('notifBadge');
      const menu     = document.getElementById('notifMenu');
      if (badge) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = unread.length > 0 ? 'flex' : 'none'; }
      if (menu) {
        menu.innerHTML = '';
        if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No new notifications</a></li>'; return; }
        [...announcements].reverse().forEach(a => {
          const li = document.createElement('li');
          const isNew = parseInt(a.id) > lastRead;
          li.innerHTML = `<a class="notif-item${isNew ? ' notif-unread' : ''}"><p class="notif-item-date">CCS Admin | ${a.date}${isNew ? ' 🔵' : ''}</p><p class="notif-item-text">${a.text}</p></a>`;
          menu.appendChild(li);
        });
        if (unread.length > 0) {
          const markLi = document.createElement('li');
          markLi.innerHTML = `<a class="notif-mark-read" id="markReadBtn">Mark all as read</a>`;
          menu.appendChild(markLi);
          document.getElementById('markReadBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const latest = Math.max(...announcements.map(a => parseInt(a.id) || 0));
            localStorage.setItem(readKey, latest);
            loadNotifications();
          });
        }
      }
    }

    loadAnnouncements();
    loadNotifications();
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html'; });

  const sitinOverlay   = document.getElementById('sitinModalOverlay');
  const openSitinBtn   = document.getElementById('openSitinModalBtn');
  const closeSitinBtn  = document.getElementById('closeSitinModalBtn');
  const cancelSitinBtn = document.getElementById('cancelSitinBtn');
  const submitSitinBtn = document.getElementById('submitSitinBtn');

  if (sitinOverlay && openSitinBtn) {
    openSitinBtn.addEventListener('click', () => {
      const freshUser = getCurrentUser();
      const sessions  = freshUser ? (freshUser.sessions ?? 30) : 0;
      document.getElementById('modalSessionCount').textContent = sessions;
      if (sessions <= 0) { alert('You have no remaining sessions. Please contact the admin.'); return; }
      sitinOverlay.classList.add('active');
    });
    closeSitinBtn.addEventListener('click',  () => sitinOverlay.classList.remove('active'));
    cancelSitinBtn.addEventListener('click', () => sitinOverlay.classList.remove('active'));
    sitinOverlay.addEventListener('click', (e) => { if (e.target === sitinOverlay) sitinOverlay.classList.remove('active'); });

    submitSitinBtn.addEventListener('click', async () => {
      const purpose = document.getElementById('sitinPurpose').value;
      const lab     = document.getElementById('sitinLab').value;
      if (!purpose) { alert('Please select a purpose.'); return; }
      if (!lab)     { alert('Please select a laboratory.'); return; }
      const freshUser = getCurrentUser();
      if (!freshUser) { window.location.href = 'index.html'; return; }
      submitSitinBtn.disabled = true;
      const now    = new Date();
      const result = await apiPost(API.sitins, 'add', { sitId: 'SIT-' + Date.now(), idNumber: freshUser.idNumber, purpose, lab, timeIn: now.toLocaleTimeString(), date: getNow() });
      submitSitinBtn.disabled = false;
      if (!result.success) { alert(result.message || 'Failed to submit sit-in.'); return; }
      sitinOverlay.classList.remove('active');
      document.getElementById('sitinPurpose').value = '';
      document.getElementById('sitinLab').value     = '';
      showPopup({ title: 'Sit-in Request Submitted!', message: `Your sit-in has been recorded.<br/>Lab: <strong>${lab}</strong> | Purpose: <strong>${purpose}</strong>`, btnText: 'OK', type: 'success' });
    });
  }
}


// ======================================
//  EDIT PROFILE (edit-profile.html)
// ======================================

const epSaveBtn = document.getElementById('epSaveBtn');
if (epSaveBtn) {
  const currentUser = getCurrentUser();
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

  epSaveBtn.addEventListener('click', async () => {
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
    if (!email.value.trim())     { showError(email,     'Email is required.');          valid = false; }
    else if (!isValidEmail(email.value.trim())) { showError(email, 'Please enter a valid email.'); valid = false; }
    if (newPw.value || confirmPw.value) {
      if (newPw.value.length < 6)          { showError(newPw,     'Min. 6 characters.');      valid = false; }
      if (newPw.value !== confirmPw.value) { showError(confirmPw, 'Passwords do not match.'); valid = false; }
    }
    if (!valid) return;

    epSaveBtn.disabled = true;
    const payload = { idNumber: currentUser.idNumber, lastName: lastName.value.trim(), firstName: firstName.value.trim(), middleName: document.getElementById('epMiddleName').value.trim(), course: course.value, yearLevel: yearLevel.value, email: email.value.trim(), address: address.value.trim(), username: username.value.trim() };
    if (newPw.value) payload.password = newPw.value;
    const result = await apiPost(API.users, 'update', payload);
    epSaveBtn.disabled = false;
    if (result.success) { setCurrentUser(result.user); showPopup({ title: 'Profile Updated!', message: 'Your profile has been saved successfully.', btnText: 'Back to Dashboard', redirectUrl: 'dashboard.html', type: 'success' }); }
    else { alert(result.message || 'Update failed.'); }
  });

  const epCancelBtn = document.getElementById('epCancelBtn');
  if (epCancelBtn) epCancelBtn.addEventListener('click', () => { window.location.href = 'dashboard.html'; });
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html'; });
}


// ======================================
//  ADMIN DASHBOARD (admin.html)
// ======================================

const sitinChartEl = document.getElementById('sitinChart');
if (sitinChartEl) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); sessionStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  async function loadAdminDash() {
    const [users, sitIns] = await Promise.all([apiGet(API.users, { action: 'getAll' }), apiGet(API.sitins, { action: 'getAll' })]);
    document.getElementById('statRegistered').textContent = users.length;
    document.getElementById('statCurrent').textContent    = sitIns.filter(s => s.status === 'active').length;
    document.getElementById('statTotal').textContent      = sitIns.length;
    const courseCounts = {};
    users.forEach(u => { courseCounts[u.course] = (courseCounts[u.course] || 0) + 1; });
    const chartLabels = Object.keys(courseCounts).length ? Object.keys(courseCounts) : ['No data'];
    const chartData   = Object.keys(courseCounts).length ? Object.values(courseCounts) : [1];
    new Chart(sitinChartEl.getContext('2d'), { type: 'pie', data: { labels: chartLabels, datasets: [{ data: chartData, backgroundColor: ['#2b7de9','#e05c5c','#f0a500','#4caf50','#9c5cf0'], borderWidth: 2, borderColor: '#fff' }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 14 } } } } });
  }

  async function renderAnnouncements() {
    const announcements = await apiGet(API.announcements, { action: 'getAll' });
    const list = document.getElementById('postedList');
    if (!list) return;
    if (!announcements.length) { list.innerHTML = '<p class="posted-empty">No announcements yet.</p>'; return; }
    list.innerHTML = '';
    [...announcements].reverse().forEach(a => {
      const item = document.createElement('div');
      item.className = 'posted-item';
      item.innerHTML = `<div class="posted-item-header"><p class="posted-author">CCS Admin | ${a.date}</p><button class="btn-delete-announce" title="Delete" onclick="deleteAnnouncement(${a.id})">&#128465;</button></div>${a.text ? `<p class="posted-body">${a.text}</p>` : ''}`;
      list.appendChild(item);
    });
  }

  window.deleteAnnouncement = async function (id) {
    if (!confirm('Delete this announcement?')) return;
    await apiPost(API.announcements, 'delete', { id });
    renderAnnouncements();
  };

  document.getElementById('announceSubmitBtn').addEventListener('click', async () => {
    const textarea = document.getElementById('newAnnounceText');
    const text = textarea.value.trim();
    if (!text) return;
    await apiPost(API.announcements, 'add', { text, date: getNow() });
    textarea.value = '';
    renderAnnouncements();
  });

  loadAdminDash();
  renderAnnouncements();
  initSearchModal();
}


// ======================================
//  ADMIN STUDENTS PAGE (admin-students.html)
// ======================================

const studentsTableBody = document.getElementById('studentsTableBody');
if (studentsTableBody) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let allUsers = [], currentEditId = null, currentViewId = null, entriesLimit = 10, searchQuery = '';

  async function loadStudents() {
    allUsers = await apiGet(API.users, { action: 'getAll' });
    renderTable();
  }

  function renderTable() {
    const filtered = allUsers.filter(u => `${u.firstName} ${u.lastName} ${u.idNumber}`.toLowerCase().includes(searchQuery.toLowerCase()));
    const shown    = filtered.slice(0, entriesLimit);
    studentsTableBody.innerHTML = '';
    if (!shown.length) { studentsTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No students registered yet.</td></tr>`; document.getElementById('entriesInfo').textContent = 'Showing 0 entries'; return; }
    shown.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${u.idNumber}</td><td>${u.lastName}, ${u.firstName} ${u.middleName || ''}</td><td>${u.yearLevel}</td><td>${u.course}</td><td>${u.sessions ?? 30}</td>
        <td>
          <button class="btn-view"      onclick="openViewModal('${u.idNumber}')">View</button>
          <button class="btn-edit"      onclick="openEditModal('${u.idNumber}')">Edit</button>
          <button class="btn-reset-one" onclick="resetOneSession('${u.idNumber}')">Reset</button>
          <button class="btn-delete"    onclick="deleteStudent('${u.idNumber}')">Delete</button>
        </td>`;
      studentsTableBody.appendChild(tr);
    });
    document.getElementById('entriesInfo').textContent = `Showing ${shown.length} of ${filtered.length} entries`;
  }

  loadStudents();

  document.getElementById('entriesPerPage').addEventListener('change', (e) => { entriesLimit = parseInt(e.target.value); renderTable(); });
  document.getElementById('tableSearchInput').addEventListener('input', (e) => { searchQuery = e.target.value; renderTable(); });

  document.getElementById('resetAllSessionBtn').addEventListener('click', async () => {
    if (!confirm('Reset sessions for ALL students to 30?')) return;
    await apiPost(API.users, 'resetAll', {});
    loadStudents();
  });

  window.resetOneSession = async function (idNumber) {
    await apiPost(API.users, 'resetOne', { idNumber });
    loadStudents();
  };

  window.deleteStudent = async function (idNumber) {
    if (!confirm(`Delete student ${idNumber}? This cannot be undone.`)) return;
    await apiPost(API.users, 'delete', { idNumber });
    loadStudents();
  };

  // ── VIEW MODAL ──
  const viewOverlay = document.getElementById('viewStudentOverlay');
  window.openViewModal = function (idNumber) {
    const u = allUsers.find(u => u.idNumber === idNumber);
    if (!u) return;
    currentViewId = idNumber;
    document.getElementById('viewAvatar').textContent   = ((u.firstName[0]||'')+(u.lastName[0]||'')).toUpperCase();
    document.getElementById('viewName').textContent     = `${u.firstName} ${u.middleName ? u.middleName+' ' : ''}${u.lastName}`;
    document.getElementById('viewIdBadge').textContent  = u.idNumber;
    document.getElementById('viewCourse').textContent   = u.course    || '—';
    document.getElementById('viewYear').textContent     = u.yearLevel || '—';
    document.getElementById('viewEmail').textContent    = u.email     || '—';
    document.getElementById('viewAddress').textContent  = u.address   || '—';
    document.getElementById('viewMiddle').textContent   = u.middleName|| '—';
    document.getElementById('viewUsername').textContent = u.username  || '—';
    document.getElementById('viewSessions').textContent = u.sessions  ?? 30;
    viewOverlay.classList.add('active');
  };
  if (viewOverlay) {
    document.getElementById('closeViewStudentBtn').addEventListener('click',  () => viewOverlay.classList.remove('active'));
    document.getElementById('cancelViewStudentBtn').addEventListener('click', () => viewOverlay.classList.remove('active'));
    viewOverlay.addEventListener('click', (e) => { if (e.target === viewOverlay) viewOverlay.classList.remove('active'); });
  }
  window.switchToEdit = function () { if (viewOverlay) viewOverlay.classList.remove('active'); openEditModal(currentViewId); };

  // ── ADD MODAL ──
  const addOverlay = document.getElementById('addStudentOverlay');
  document.getElementById('openAddStudentBtn').addEventListener('click',   () => addOverlay.classList.add('active'));
  document.getElementById('closeAddStudentBtn').addEventListener('click',  () => addOverlay.classList.remove('active'));
  document.getElementById('cancelAddStudentBtn').addEventListener('click', () => addOverlay.classList.remove('active'));
  addOverlay.addEventListener('click', (e) => { if (e.target === addOverlay) addOverlay.classList.remove('active'); });

  document.getElementById('saveAddStudentBtn').addEventListener('click', async () => {
    const idNumber = document.getElementById('addIdNumber');
    const lastName = document.getElementById('addLastName');
    const firstName= document.getElementById('addFirstName');
    const middleName=document.getElementById('addMiddleName');
    const course   = document.getElementById('addCourse');
    const yearLevel= document.getElementById('addYearLevel');
    const email    = document.getElementById('addEmail');
    const address  = document.getElementById('addAddress');
    const password = document.getElementById('addPassword');
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
    const result = await apiPost(API.users, 'add', { idNumber: idNumber.value.trim(), lastName: lastName.value.trim(), firstName: firstName.value.trim(), middleName: middleName.value.trim(), course: course.value, yearLevel: yearLevel.value, email: email.value.trim(), address: address.value.trim(), password: password.value });
    if (!result.success) { showError(idNumber, result.message || 'Failed.'); return; }
    addOverlay.classList.remove('active');
    [idNumber, lastName, firstName, middleName, email, address, password].forEach(el => el.value = '');
    course.value = ''; yearLevel.value = '';
    loadStudents();
  });

  // ── EDIT MODAL ──
  const editOverlay = document.getElementById('editStudentOverlay');
  document.getElementById('closeEditStudentBtn').addEventListener('click',  () => editOverlay.classList.remove('active'));
  document.getElementById('cancelEditStudentBtn').addEventListener('click', () => editOverlay.classList.remove('active'));
  editOverlay.addEventListener('click', (e) => { if (e.target === editOverlay) editOverlay.classList.remove('active'); });

  window.openEditModal = function (idNumber) {
    const u = allUsers.find(u => u.idNumber === idNumber);
    if (!u) return;
    currentEditId = idNumber;
    document.getElementById('editIdNumber').value   = u.idNumber;
    document.getElementById('editLastName').value   = u.lastName;
    document.getElementById('editFirstName').value  = u.firstName;
    document.getElementById('editMiddleName').value = u.middleName || '';
    document.getElementById('editCourse').value     = u.course;
    document.getElementById('editYearLevel').value  = u.yearLevel;
    document.getElementById('editEmail').value      = u.email;
    document.getElementById('editAddress').value    = u.address;
    document.getElementById('editSessions').value   = u.sessions ?? 30;
    editOverlay.classList.add('active');
  };

  document.getElementById('saveEditStudentBtn').addEventListener('click', async () => {
    const result = await apiPost(API.users, 'adminEdit', { idNumber: currentEditId, lastName: document.getElementById('editLastName').value.trim(), firstName: document.getElementById('editFirstName').value.trim(), middleName: document.getElementById('editMiddleName').value.trim(), course: document.getElementById('editCourse').value, yearLevel: document.getElementById('editYearLevel').value, email: document.getElementById('editEmail').value.trim(), address: document.getElementById('editAddress').value.trim(), sessions: parseInt(document.getElementById('editSessions').value) || 0 });
    if (result.success) { editOverlay.classList.remove('active'); loadStudents(); }
    else { alert(result.message || 'Update failed.'); }
  });

  const adminLogout = document.getElementById('adminLogoutBtn');
  if (adminLogout) adminLogout.addEventListener('click', (e) => { e.preventDefault(); sessionStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });
  initSearchModal();
}


// ======================================
//  ADMIN SIT-IN PAGE (admin-sitin.html)
// ======================================

const sitinTableBody = document.getElementById('sitinTableBody');
if (sitinTableBody) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let allSitins = [], allUsers2 = [], entriesLimit = 10, searchQuery = '', currentPage = 1;

  async function loadSitins() {
    [allSitins, allUsers2] = await Promise.all([apiGet(API.sitins, { action: 'getAll' }), apiGet(API.users, { action: 'getAll' })]);
    renderSitin();
  }

  function renderSitin() {
    const filtered   = allSitins.filter(s => { const user = allUsers2.find(u => u.idNumber === s.idNumber); const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : ''; return name.includes(searchQuery.toLowerCase()) || s.idNumber.toLowerCase().includes(searchQuery.toLowerCase()); });
    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);
    sitinTableBody.innerHTML = '';
    if (!shown.length) { sitinTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No data available</td></tr>`; }
    else {
      shown.forEach(s => {
        const user    = allUsers2.find(u => u.idNumber === s.idNumber);
        const name    = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
        const status  = s.status === 'active' ? `<span class="badge-active">Active</span>` : `<span class="badge-done">Done</span>`;
        const actions = s.status === 'active' ? `<button class="btn-end-session" onclick="endSession('${s.sitId}')">End Session</button>` : '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.sitId}</td><td>${s.idNumber}</td><td>${name}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.session||'—'}</td><td>${status}</td><td>${actions}</td>`;
        sitinTableBody.appendChild(tr);
      });
    }
    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent = filtered.length === 0 ? 'Showing 0 entries' : `Showing ${from} to ${to} of ${filtered.length} entries`;
    renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    const pg = document.getElementById('pagination'); pg.innerHTML = '';
    const prev = document.createElement('button'); prev.className = 'page-btn'; prev.innerHTML = '&#171;'; prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderSitin(); } }); pg.appendChild(prev);
    for (let i = 1; i <= totalPages; i++) { const btn = document.createElement('button'); btn.className = `page-btn${i === currentPage ? ' active' : ''}`; btn.textContent = i; btn.addEventListener('click', () => { currentPage = i; renderSitin(); }); pg.appendChild(btn); }
    const next = document.createElement('button'); next.className = 'page-btn'; next.innerHTML = '&#187;'; next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderSitin(); } }); pg.appendChild(next);
  }

  window.endSession = async function (sitId) {
    if (!confirm('End this sit-in session?')) return;
    const now    = new Date();
    const result = await apiPost(API.sitins, 'endSession', { sitId, timeOut: now.toLocaleTimeString() });
    if (result.success) loadSitins();
    else alert(result.message || 'Failed to end session.');
  };

  document.getElementById('entriesPerPage').addEventListener('change', (e) => { entriesLimit = parseInt(e.target.value); currentPage = 1; renderSitin(); });
  document.getElementById('tableSearchInput').addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; renderSitin(); });
  const adminLogout2 = document.getElementById('adminLogoutBtn');
  if (adminLogout2) adminLogout2.addEventListener('click', (e) => { e.preventDefault(); sessionStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });
  initSearchModal(); loadSitins();
}


// ======================================
//  VIEW SIT-IN RECORDS (admin-records.html)
// ======================================

const recordsTableBody = document.getElementById('recordsTableBody');
if (recordsTableBody) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let allRecords = [], allUsers3 = [], entriesLimit = 10, searchQuery = '', currentPage = 1;

  async function loadRecords() {
    [allRecords, allUsers3] = await Promise.all([apiGet(API.sitins, { action: 'getAll' }), apiGet(API.users, { action: 'getAll' })]);
    renderCharts();
    renderRecords();
  }

  function renderCharts() {
    const purposeCounts = {}, labCounts = {};
    allRecords.forEach(s => { const pk = s.purpose||'Unknown'; purposeCounts[pk]=(purposeCounts[pk]||0)+1; const lk=s.lab||'Unknown'; labCounts[lk]=(labCounts[lk]||0)+1; });
    const barOpts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{ticks:{font:{size:11}}}} };
    new Chart(document.getElementById('langChart').getContext('2d'),{type:'bar',data:{labels:Object.keys(purposeCounts).length?Object.keys(purposeCounts):['No Data'],datasets:[{data:Object.keys(purposeCounts).length?Object.values(purposeCounts):[0],backgroundColor:'#2b7de9',borderRadius:4}]},options:barOpts});
    new Chart(document.getElementById('labChart').getContext('2d'), {type:'bar',data:{labels:Object.keys(labCounts).length?Object.keys(labCounts):['No Data'],datasets:[{data:Object.keys(labCounts).length?Object.values(labCounts):[0],backgroundColor:'#4caf50',borderRadius:4}]},options:barOpts});
  }

  function renderRecords() {
    const filtered   = allRecords.filter(s => { const user=allUsers3.find(u=>u.idNumber===s.idNumber); const name=user?`${user.firstName} ${user.lastName}`.toLowerCase():''; return name.includes(searchQuery.toLowerCase())||s.idNumber.toLowerCase().includes(searchQuery.toLowerCase()); });
    const totalPages = Math.max(1, Math.ceil(filtered.length/entriesLimit)); if(currentPage>totalPages)currentPage=totalPages;
    const start=(currentPage-1)*entriesLimit; const shown=filtered.slice(start,start+entriesLimit);
    recordsTableBody.innerHTML='';
    if(!shown.length){recordsTableBody.innerHTML=`<tr><td colspan="8" class="table-empty">No data available</td></tr>`;}
    else{shown.forEach((s,i)=>{const user=allUsers3.find(u=>u.idNumber===s.idNumber);const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber;const tr=document.createElement('tr');tr.innerHTML=`<td>${start+i+1}</td><td>${s.idNumber}</td><td>${name}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.timeIn||'—'}</td><td>${s.timeOut||'—'}</td><td>${s.date||'—'}</td>`;recordsTableBody.appendChild(tr);});}
    const from=filtered.length===0?0:start+1; const to=Math.min(start+entriesLimit,filtered.length);
    document.getElementById('entriesInfo').textContent=filtered.length===0?'Showing 0 entries':`Showing ${from} to ${to} of ${filtered.length} entries`;
    buildRecordsPagination(totalPages);
  }

  function buildRecordsPagination(totalPages){const pg=document.getElementById('pagination');pg.innerHTML='';const prev=document.createElement('button');prev.className='page-btn';prev.innerHTML='&#171;';prev.disabled=currentPage===1;prev.addEventListener('click',()=>{if(currentPage>1){currentPage--;renderRecords();}});pg.appendChild(prev);for(let i=1;i<=totalPages;i++){const btn=document.createElement('button');btn.className=`page-btn${i===currentPage?' active':''}`;btn.textContent=i;btn.addEventListener('click',()=>{currentPage=i;renderRecords();});pg.appendChild(btn);}const next=document.createElement('button');next.className='page-btn';next.innerHTML='&#187;';next.disabled=currentPage===totalPages;next.addEventListener('click',()=>{if(currentPage<totalPages){currentPage++;renderRecords();}});pg.appendChild(next);}

  document.getElementById('resetSessionsBtn').addEventListener('click', async () => { if(!confirm('Reset all sessions to 30?'))return; await apiPost(API.users,'resetAll',{}); alert('All sessions reset.'); });
  document.getElementById('clearRecordsBtn').addEventListener('click',  async () => { if(!confirm('Clear ALL sit-in records?'))return; await apiPost(API.sitins,'clear',{}); loadRecords(); });
  document.getElementById('entriesPerPage').addEventListener('change',(e)=>{entriesLimit=parseInt(e.target.value);currentPage=1;renderRecords();});
  document.getElementById('tableSearchInput').addEventListener('input',(e)=>{searchQuery=e.target.value;currentPage=1;renderRecords();});
  const adminLogout3=document.getElementById('adminLogoutBtn');if(adminLogout3)adminLogout3.addEventListener('click',(e)=>{e.preventDefault();sessionStorage.removeItem('ccs_admin');window.location.href='index.html';});
  initSearchModal(); loadRecords();
}


// ======================================
//  STUDENT HISTORY (history.html)
// ======================================

const historyTableBody = document.getElementById('historyTableBody');
if (historyTableBody) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; }

  let mySitins = [], entriesLimit = 10, searchQuery = '', currentPage = 1, feedbackSitId = null, feedbackLab = null;

  async function loadHistory() {
    mySitins = await apiGet(API.sitins, { action: 'getByUser', idNumber: currentUser.idNumber });
    renderHistory();
  }

  async function loadNotifications() {
    const announcements = await apiGet(API.announcements, { action: 'getAll' });
    const readKey  = `ccs_notif_read_${currentUser.idNumber}`;
    const lastRead = parseInt(localStorage.getItem(readKey) || '0');
    const unread   = announcements.filter(a => parseInt(a.id) > lastRead);
    const badge    = document.getElementById('notifBadge');
    const menu     = document.getElementById('notifMenu');
    if (badge) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = unread.length > 0 ? 'flex' : 'none'; }
    if (menu) {
      menu.innerHTML = '';
      if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No announcements yet</a></li>'; return; }
      [...announcements].reverse().forEach(a => { const li = document.createElement('li'); const isNew = parseInt(a.id) > lastRead; li.innerHTML = `<a class="notif-item"><p class="notif-item-date">CCS Admin | ${a.date}${isNew?' 🔵':''}</p><p class="notif-item-text">${a.text}</p></a>`; menu.appendChild(li); });
      if (unread.length > 0) { const markLi = document.createElement('li'); markLi.innerHTML = `<a class="notif-mark-read" id="markReadBtn">Mark all as read</a>`; menu.appendChild(markLi); document.getElementById('markReadBtn').addEventListener('click', (e) => { e.preventDefault(); const latest = Math.max(...announcements.map(a => parseInt(a.id)||0)); localStorage.setItem(readKey, latest); loadNotifications(); }); }
    }
  }

  loadNotifications();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html'; });

  function renderHistory() {
    const filtered   = mySitins.filter(s => `${s.purpose||''} ${s.lab||''} ${s.date||''}`.toLowerCase().includes(searchQuery.toLowerCase()));
    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);
    historyTableBody.innerHTML = '';
    if (!shown.length) { historyTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No sit-in history found.</td></tr>`; }
    else {
      shown.forEach(s => {
        const tr        = document.createElement('tr');
        const actionBtn = s.status === 'done' ? `<button class="btn-feedback" onclick="openFeedback('${s.sitId}', '${s.lab||''}')">Feedback</button>` : `<span style="font-size:12px;color:#aaa;">Active</span>`;
        tr.innerHTML = `<td>${s.idNumber}</td><td>${currentUser.firstName} ${currentUser.lastName}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.timeIn||'—'}</td><td>${s.timeOut||'—'}</td><td>${s.date||'—'}</td><td>${actionBtn}</td>`;
        historyTableBody.appendChild(tr);
      });
    }
    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent = filtered.length === 0 ? 'Showing 0 entries' : `Showing ${from} to ${to} of ${filtered.length} entries`;
    buildHistoryPagination(totalPages);
  }

  function buildHistoryPagination(totalPages) {
    const pg = document.getElementById('pagination'); pg.innerHTML = '';
    const prev = document.createElement('button'); prev.className = 'page-btn'; prev.innerHTML = '&#171;'; prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderHistory(); } }); pg.appendChild(prev);
    for (let i = 1; i <= totalPages; i++) { const btn = document.createElement('button'); btn.className = `page-btn${i === currentPage ? ' active' : ''}`; btn.textContent = i; btn.addEventListener('click', () => { currentPage = i; renderHistory(); }); pg.appendChild(btn); }
    const next = document.createElement('button'); next.className = 'page-btn'; next.innerHTML = '&#187;'; next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderHistory(); } }); pg.appendChild(next);
  }

  document.getElementById('entriesPerPage').addEventListener('change', (e) => { entriesLimit = parseInt(e.target.value); currentPage = 1; renderHistory(); });
  document.getElementById('tableSearchInput').addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; renderHistory(); });

  loadHistory();

  const feedbackOverlay = document.getElementById('feedbackOverlay');
  window.openFeedback = function (sitId, lab) { feedbackSitId = sitId; feedbackLab = lab; document.getElementById('feedbackLab').value = lab || '—'; document.getElementById('feedbackMessage').value = ''; feedbackOverlay.classList.add('active'); };
  document.getElementById('closeFeedbackBtn').addEventListener('click',  () => feedbackOverlay.classList.remove('active'));
  document.getElementById('cancelFeedbackBtn').addEventListener('click', () => feedbackOverlay.classList.remove('active'));
  feedbackOverlay.addEventListener('click', (e) => { if (e.target === feedbackOverlay) feedbackOverlay.classList.remove('active'); });

  document.getElementById('submitFeedbackBtn').addEventListener('click', async () => {
    const message = document.getElementById('feedbackMessage').value.trim();
    if (!message) { alert('Please write your feedback message.'); return; }
    await apiPost(API.feedbacks, 'add', { idNumber: currentUser.idNumber, sitId: feedbackSitId, lab: feedbackLab, message, date: getNow() });
    feedbackOverlay.classList.remove('active');
    showPopup({ title: 'Feedback Sent!', message: 'Your feedback has been submitted to the admin.', btnText: 'OK', type: 'success' });
  });
}


// ======================================
//  LEADERBOARD (leaderboard.html)
// ======================================

const leaderboardTableBody = document.getElementById('leaderboardTableBody');
if (leaderboardTableBody) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html'; });

  async function loadLeaderboard() {
    const [users, sitins] = await Promise.all([apiGet(API.users, { action: 'getAll' }), apiGet(API.sitins, { action: 'getAll' })]);
    const done = sitins.filter(s => s.status === 'done');
    const studentStats = users.map(u => {
      const mySitins = done.filter(s => s.idNumber === u.idNumber);
      return { ...u, sitinCount: mySitins.length, points: mySitins.length };
    }).sort((a, b) => b.points - a.points);

    leaderboardTableBody.innerHTML = '';
    if (!studentStats.length) { leaderboardTableBody.innerHTML = `<tr><td colspan="5" class="lb-empty">No students registered yet.</td></tr>`; }
    else {
      studentStats.forEach((u, idx) => {
        const rank = idx + 1;
        const isMe = u.idNumber === currentUser.idNumber;
        const tr   = document.createElement('tr');
        if (isMe) tr.className = 'lb-my-row';
        let medalClass = 'normal', medalContent = rank;
        if (rank === 1) { medalClass = 'gold';   medalContent = '🥇'; }
        if (rank === 2) { medalClass = 'silver';  medalContent = '🥈'; }
        if (rank === 3) { medalClass = 'bronze';  medalContent = '🥉'; }
        const youBadge = isMe ? '<span class="lb-you-badge">You</span>' : '';
        tr.innerHTML = `<td><div class="lb-rank-medal ${medalClass}">${medalContent}</div></td><td>${u.firstName} ${u.lastName}${youBadge}</td><td>${u.course}</td><td>${u.sitinCount}</td><td><span class="lb-points-badge">${u.points}</span></td>`;
        leaderboardTableBody.appendChild(tr);
      });
    }

    const myStats = studentStats.find(u => u.idNumber === currentUser.idNumber);
    const myRank  = myStats ? studentStats.indexOf(myStats) + 1 : '—';
    document.getElementById('lbRankNumber').textContent    = myRank ? `#${myRank}` : '#—';
    document.getElementById('lbPoints').textContent        = myStats ? myStats.points     : 0;
    document.getElementById('lbSitins').textContent        = myStats ? myStats.sitinCount : 0;
    document.getElementById('lbTotalStudents').textContent = users.length;
  }

  loadLeaderboard();
}


// ======================================
//  MY SUMMARY (mysummary.html)
// ======================================

const summaryMain = document.querySelector('.summary-main');
if (summaryMain) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html'; });

  async function loadSummary() {
    const [freshUser, allSitins] = await Promise.all([
      apiGet(API.users, { action: 'getOne', idNumber: currentUser.idNumber }),
      apiGet(API.sitins, { action: 'getByUser', idNumber: currentUser.idNumber }),
    ]);
    const doneSitins = allSitins.filter(s => s.status === 'done');
    const sessions   = freshUser.sessions ?? 30;
    const used       = 30 - sessions;

    document.getElementById('statTotalSitins').textContent = doneSitins.length;
    document.getElementById('statTotalPoints').textContent = doneSitins.length;

    const timed = doneSitins.filter(s => s.timeIn && s.timeOut);
    if (timed.length > 0) {
      const parseTime = t => { const [h,m,rest] = t.split(':'); const sec=rest?parseInt(rest):0; const pm=t.toLowerCase().includes('pm'); const hr=parseInt(h)+(pm&&parseInt(h)!==12?12:0); return hr*60+parseInt(m)+sec/60; };
      const totalMins = timed.reduce((acc, s) => acc + Math.abs(parseTime(s.timeOut) - parseTime(s.timeIn)), 0);
      document.getElementById('statTotalHours').textContent = `${Math.floor(totalMins/60)}h ${Math.round(totalMins%60)}m`;
      document.getElementById('statAvgSession').textContent = `${Math.round(totalMins / timed.length)}m`;
    }

    const activityList = document.getElementById('activityList');
    if (!allSitins.length) { activityList.innerHTML = '<p class="summary-empty">No sit-in records yet.</p>'; }
    else {
      activityList.innerHTML = '';
      [...allSitins].slice(0, 20).forEach(s => {
        const item = document.createElement('div'); item.className = 'summary-activity-item';
        item.innerHTML = `<div class="summary-activity-dot ${s.status}"></div><div class="summary-activity-info"><p class="summary-activity-purpose">${s.purpose||'—'} &nbsp;·&nbsp; Lab ${s.lab||'—'}</p><p class="summary-activity-meta">${s.timeIn||'—'} → ${s.timeOut||'Active'}</p></div><span class="summary-activity-date">${s.date||'—'}</span>`;
        activityList.appendChild(item);
      });
    }

    document.getElementById('gaugeNumber').textContent  = sessions;
    document.getElementById('sessUsed').textContent      = used;
    document.getElementById('sessTotal').textContent     = 30;
    document.getElementById('sessRemaining').textContent = sessions;
    new Chart(document.getElementById('gaugeChart').getContext('2d'), { type:'doughnut', data:{ datasets:[{ data:[sessions, 30-sessions], backgroundColor:['#4caf50','#e8edf5'], borderWidth:0, circumference:180, rotation:270 }] }, options:{ responsive:false, cutout:'75%', plugins:{ legend:{display:false}, tooltip:{enabled:false} } } });

    const purposeWrap   = document.getElementById('purposeWrap');
    const purposeCounts = {};
    doneSitins.forEach(s => { const k = s.purpose||'Other'; purposeCounts[k]=(purposeCounts[k]||0)+1; });
    if (!Object.keys(purposeCounts).length) { purposeWrap.innerHTML = '<p class="summary-empty">No data yet.</p>'; }
    else {
      purposeWrap.innerHTML = '';
      const max = Math.max(...Object.values(purposeCounts));
      Object.entries(purposeCounts).sort((a,b)=>b[1]-a[1]).forEach(([label,count]) => {
        const pct = Math.round((count/max)*100);
        const row = document.createElement('div'); row.className = 'summary-purpose-bar-row';
        row.innerHTML = `<span class="summary-purpose-label">${label}</span><div class="summary-purpose-bar-bg"><div class="summary-purpose-bar-fill" style="width:${pct}%"></div></div><span class="summary-purpose-count">${count}</span>`;
        purposeWrap.appendChild(row);
      });
    }
  }

  loadSummary();
}


// ======================================
//  LAB STATUS (labstatus.html)
// ======================================

const labsGrid = document.getElementById('labsGrid');
if (labsGrid) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; }
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html'; });

  const LABS = [
    { id: '524', name: 'Laboratory 524', total: 40 },
    { id: '525', name: 'Laboratory 525', total: 40 },
    { id: '526', name: 'Laboratory 526', total: 40 },
    { id: '527', name: 'Laboratory 527', total: 40 },
    { id: '528', name: 'Laboratory 528', total: 40 },
  ];

  async function renderLabs() {
    const sitins       = await apiGet(API.sitins, { action: 'getAll' });
    const activeSitins = sitins.filter(s => s.status === 'active');
    labsGrid.innerHTML = '';
    LABS.forEach(lab => {
      const inUse = activeSitins.filter(s => s.lab === lab.id).length;
      const free  = lab.total - inUse;
      const card  = document.createElement('div'); card.className = 'lab-card';
      card.innerHTML = `<div class="lab-card-header"><span class="lab-card-icon">&#128187;</span><div><p class="lab-card-name">${lab.name}</p><p class="lab-card-pcs">${inUse} / ${lab.total} PCs available</p></div></div><div class="lab-card-footer"><span class="lab-free-count">${free} free</span><span class="lab-inuse-count">${inUse} in use</span></div>`;
      labsGrid.appendChild(card);
    });
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
  }

  renderLabs();
  setInterval(renderLabs, 30000);
}


// ======================================
//  ADMIN RESERVATION (admin-reservation.html)
// ======================================

const computerGrid = document.getElementById('computerGrid');
if (computerGrid) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  const TOTAL = 20;

  async function renderComputers() {
    const lab      = document.getElementById('labInput').value.trim() || '524';
    const map      = await apiGet(API.computers, { action: 'getByLab', lab });
    computerGrid.innerHTML = '';
    for (let i = 1; i <= TOTAL; i++) {
      const status = map[i] || 'available';
      const btn    = document.createElement('button');
      btn.className   = `computer-btn ${status}`;
      btn.textContent = i;
      btn.addEventListener('click', async () => {
        const newStatus = status === 'available' ? 'used' : 'available';
        const label     = status === 'available' ? `Mark Computer ${i} as Used?` : `Mark Computer ${i} as Available?`;
        if (!confirm(label)) return;
        await apiPost(API.computers, 'setStatus', { lab, seat: i, status: newStatus });
        renderComputers();
      });
      computerGrid.appendChild(btn);
    }
  }

  async function renderRequests() {
    const requests = await apiGet(API.reservations, { action: 'getAll' });
    const users    = await apiGet(API.users, { action: 'getAll' });
    const pending  = requests.filter(r => r.status === 'pending');
    const panel    = document.getElementById('reservationRequests');
    panel.innerHTML = '';
    if (!pending.length) { panel.innerHTML = '<p class="res-empty">No pending reservation requests.</p>'; return; }
    pending.forEach(r => {
      const user = users.find(u => u.idNumber === r.idNumber);
      const name = user ? `${user.firstName} ${user.lastName}` : r.idNumber;
      const item = document.createElement('div'); item.className = 'res-request-item';
      item.innerHTML = `<p><strong>${name}</strong> (${r.idNumber})</p><p>Lab: ${r.lab} &nbsp;|&nbsp; PC: ${r.computer}</p><p>Date: ${r.date}</p><div class="res-request-actions"><button class="btn-approve" onclick="handleReservation('${r.resId}','approved')">Approve</button><button class="btn-reject" onclick="handleReservation('${r.resId}','rejected')">Reject</button></div>`;
      panel.appendChild(item);
    });
  }

  async function renderLogs() {
    const requests = await apiGet(API.reservations, { action: 'getAll' });
    const users    = await apiGet(API.users, { action: 'getAll' });
    const done     = requests.filter(r => r.status !== 'pending');
    const panel    = document.getElementById('reservationLogs');
    panel.innerHTML = '';
    if (!done.length) { panel.innerHTML = '<p class="res-empty">No reservation logs yet.</p>'; return; }
    [...done].reverse().forEach(r => {
      const user  = users.find(u => u.idNumber === r.idNumber);
      const name  = user ? `${user.firstName} ${user.lastName}` : r.idNumber;
      const color = r.status === 'approved' ? '#4caf50' : '#e02020';
      const item  = document.createElement('div'); item.className = 'res-log-item';
      item.innerHTML = `<strong>${name}</strong> — Lab ${r.lab}, PC ${r.computer}<br/><span style="color:${color};font-weight:600;text-transform:capitalize;">${r.status}</span> &nbsp;|&nbsp; ${r.date}`;
      panel.appendChild(item);
    });
  }

  window.handleReservation = async function (resId, action) {
    await apiPost(API.reservations, 'handle', { resId, status: action });
    renderRequests(); renderLogs(); renderComputers();
  };

  document.getElementById('labFilterBtn').addEventListener('click', renderComputers);
  document.getElementById('labInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') renderComputers(); });
  const adminLogout6 = document.getElementById('adminLogoutBtn');
  if (adminLogout6) adminLogout6.addEventListener('click', (e) => { e.preventDefault(); sessionStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });
  initSearchModal(); renderComputers(); renderRequests(); renderLogs();
}


// ======================================
//  FEEDBACK PAGE (admin-feedback.html)
// ======================================

const feedbackTableBody = document.getElementById('feedbackTableBody');
if (feedbackTableBody) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let allFeedbacks = [], currentPage = 1, entriesLimit = 10, filterQuery = '';

  async function loadFeedbacks() {
    allFeedbacks = await apiGet(API.feedbacks, { action: 'getAll' });
    renderFeedback();
  }

  function renderFeedback() {
    const filtered   = allFeedbacks.filter(f => `${f.idNumber} ${f.lab||''} ${f.date||''} ${f.message||''}`.toLowerCase().includes(filterQuery.toLowerCase()));
    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);
    feedbackTableBody.innerHTML = '';
    if (!shown.length) { feedbackTableBody.innerHTML = `<tr><td colspan="4" class="table-empty">No feedback found.</td></tr>`; }
    else { shown.forEach(f => { const tr = document.createElement('tr'); tr.innerHTML = `<td>${f.idNumber}</td><td>${f.lab||'—'}</td><td>${f.date||'—'}</td><td class="feedback-msg">${f.message||'—'}</td>`; feedbackTableBody.appendChild(tr); }); }
    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent = filtered.length === 0 ? 'Showing 0 entries' : `Showing ${from} to ${to} of ${filtered.length} entries`;
  }

  document.getElementById('feedbackFilterInput').addEventListener('input', (e) => { filterQuery = e.target.value; currentPage = 1; renderFeedback(); });
  document.getElementById('feedbackPrintBtn').addEventListener('click', () => window.print());
  const adminLogout5 = document.getElementById('adminLogoutBtn');
  if (adminLogout5) adminLogout5.addEventListener('click', (e) => { e.preventDefault(); sessionStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });
  initSearchModal(); loadFeedbacks();
}


// ======================================
//  REPORTS (admin-reports.html)
// ======================================

const reportsTableBody = document.getElementById('reportsTableBody');
if (reportsTableBody) {
  if (!sessionStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let allReports = [], allUsers4 = [], currentPage = 1, entriesLimit = 10, filterQuery = '', dateFilter = '';

  async function loadReports() {
    [allReports, allUsers4] = await Promise.all([apiGet(API.sitins, { action: 'getAll' }), apiGet(API.users, { action: 'getAll' })]);
    renderReports();
  }

  function getFiltered() { return allReports.filter(s => { const user=allUsers4.find(u=>u.idNumber===s.idNumber); const name=user?`${user.firstName} ${user.lastName}`.toLowerCase():''; const str=(name+s.idNumber+(s.purpose||'')+(s.lab||'')+(s.date||'')).toLowerCase(); return str.includes(filterQuery.toLowerCase())&&(dateFilter?s.date===dateFilter:true); }); }

  function renderReports() {
    const filtered   = getFiltered();
    const totalPages = Math.max(1, Math.ceil(filtered.length/entriesLimit)); if(currentPage>totalPages)currentPage=totalPages;
    const start=(currentPage-1)*entriesLimit; const shown=filtered.slice(start,start+entriesLimit);
    reportsTableBody.innerHTML='';
    if(!shown.length){reportsTableBody.innerHTML=`<tr><td colspan="7" class="table-empty">No records found.</td></tr>`;}
    else{shown.forEach(s=>{const user=allUsers4.find(u=>u.idNumber===s.idNumber);const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber;const tr=document.createElement('tr');tr.innerHTML=`<td>${s.idNumber}</td><td>${name}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.timeIn||'—'}</td><td>${s.timeOut||'—'}</td><td>${s.date||'—'}</td>`;reportsTableBody.appendChild(tr);});}
    const from=filtered.length===0?0:start+1; const to=Math.min(start+entriesLimit,filtered.length);
    document.getElementById('entriesInfo').textContent=filtered.length===0?'Showing 0 entries':`Showing ${from} to ${to} of ${filtered.length} entries`;
  }

  document.getElementById('reportSearchBtn').addEventListener('click', () => { dateFilter=document.getElementById('reportDateInput').value; currentPage=1; renderReports(); });
  document.getElementById('reportResetBtn').addEventListener('click',  () => { document.getElementById('reportDateInput').value=''; document.getElementById('reportFilterInput').value=''; dateFilter=''; filterQuery=''; currentPage=1; renderReports(); });
  document.getElementById('reportFilterInput').addEventListener('input', (e) => { filterQuery=e.target.value; currentPage=1; renderReports(); });

  document.getElementById('exportCsvBtn').addEventListener('click', () => {
    const filtered = getFiltered();
    if (!filtered.length) { alert('No records to export.'); return; }
    let csv = 'ID Number,Name,Purpose,Laboratory,Login,Logout,Date\n';
    filtered.forEach(s => { const user=allUsers4.find(u=>u.idNumber===s.idNumber); const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber; csv+=`${s.idNumber},"${name}","${s.purpose||''}","${s.lab||''}","${s.timeIn||''}","${s.timeOut||''}","${s.date||''}"\n`; });
    const blob=new Blob([csv],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='sitin-report.csv'; a.click(); URL.revokeObjectURL(url);
  });

  document.getElementById('exportExcelBtn').addEventListener('click', () => {
    const filtered = getFiltered();
    if (!filtered.length) { alert('No records to export.'); return; }
    let tsv = 'ID Number\tName\tPurpose\tLaboratory\tLogin\tLogout\tDate\n';
    filtered.forEach(s => { const user=allUsers4.find(u=>u.idNumber===s.idNumber); const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber; tsv+=`${s.idNumber}\t${name}\t${s.purpose||''}\t${s.lab||''}\t${s.timeIn||''}\t${s.timeOut||''}\t${s.date||''}\n`; });
    const blob=new Blob([tsv],{type:'application/vnd.ms-excel'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='sitin-report.xls'; a.click(); URL.revokeObjectURL(url);
  });

  document.getElementById('exportPdfBtn').addEventListener('click', () => window.print());
  document.getElementById('printBtn').addEventListener('click',      () => window.print());
  const adminLogout4 = document.getElementById('adminLogoutBtn');
  if (adminLogout4) adminLogout4.addEventListener('click', (e) => { e.preventDefault(); sessionStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });
  initSearchModal(); loadReports();
}

// ======================================
//  STUDENT RESERVATION (reservation.html)
//  PASTE THIS AT THE BOTTOM OF script.js
//  (just before the dark mode IIFE block)
// ======================================

const reserveBtn = document.getElementById('reserveBtn');
if (reserveBtn) {
  const currentUser = getCurrentUser();
  if (!currentUser) { window.location.href = 'index.html'; }

  // ── Pre-fill read-only fields ──
  document.getElementById('resIdNumber').value    = currentUser.idNumber || '';
  document.getElementById('resStudentName').value =
    `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
  document.getElementById('resSession').value     = currentUser.sessions ?? 30;

  // ── Default date = today ──
  const today = new Date();
  document.getElementById('resDate').value =
    `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;

  // ── Logout ──
  const resLogoutBtn = document.getElementById('logoutBtn');
  if (resLogoutBtn) resLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); clearCurrentUser(); window.location.href = 'index.html';
  });

  // ── Notifications ──
  (async function loadResNotifications() {
    try {
      const announcements = await apiGet(API.announcements, { action: 'getAll' });
      const readKey  = `ccs_notif_read_${currentUser.idNumber}`;
      const lastRead = parseInt(localStorage.getItem(readKey) || '0');
      const unread   = announcements.filter(a => parseInt(a.id) > lastRead);
      const badge    = document.getElementById('notifBadge');
      const menu     = document.getElementById('notifMenu');
      if (badge) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = unread.length > 0 ? 'flex' : 'none'; }
      if (menu) {
        menu.innerHTML = '';
        if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No announcements yet</a></li>'; return; }
        [...announcements].reverse().forEach(a => {
          const li = document.createElement('li');
          const isNew = parseInt(a.id) > lastRead;
          li.innerHTML = `<a class="notif-item"><p class="notif-item-date">CCS Admin | ${a.date}${isNew ? ' 🔵' : ''}</p><p class="notif-item-text">${a.text}</p></a>`;
          menu.appendChild(li);
        });
        if (unread.length > 0) {
          const markLi = document.createElement('li');
          markLi.innerHTML = `<a class="notif-mark-read" id="resMarkReadBtn">Mark all as read</a>`;
          menu.appendChild(markLi);
          document.getElementById('resMarkReadBtn').addEventListener('click', (e) => {
            e.preventDefault();
            const latest = Math.max(...announcements.map(a => parseInt(a.id) || 0));
            localStorage.setItem(readKey, latest);
            loadResNotifications();
          });
        }
      }
    } catch (e) { /* silently fail */ }
  })();

  // ── Inline message helper ──
  function showResMsg(text, type = 'error') {
    const el = document.getElementById('resMsg');
    el.textContent   = text;
    el.style.display = 'block';
    el.style.background = type === 'error' ? '#fdecea' : '#e8f8ee';
    el.style.color      = type === 'error' ? '#c0392b' : '#2e7d32';
    setTimeout(() => { el.style.display = 'none'; }, 4000);
  }

  // ── Reserve button ──
  reserveBtn.addEventListener('click', async () => {
    const purpose = document.getElementById('resPurpose').value;
    const lab     = document.getElementById('resLab').value;
    const timeIn  = document.getElementById('resTimeIn').value;
    const date    = document.getElementById('resDate').value;

    if (!purpose) { showResMsg('Please select a purpose.'); return; }
    if (!lab)     { showResMsg('Please select a laboratory.'); return; }
    if (!timeIn)  { showResMsg('Please select a time in.'); return; }
    if (!date)    { showResMsg('Please select a date.'); return; }

    const sessions = parseInt(document.getElementById('resSession').value) || 0;
    if (sessions <= 0) { showResMsg('You have no remaining sessions. Please contact the admin.'); return; }

    reserveBtn.disabled    = true;
    reserveBtn.textContent = 'Reserving…';

    try {
      const result = await apiPost(API.reservations, 'add', {
        resId:    'RES-' + Date.now(),
        idNumber: currentUser.idNumber,
        lab, computer: 0, date, timeIn, purpose,
      });

      if (result.success) {
        document.getElementById('resPurpose').value = '';
        document.getElementById('resLab').value     = '';
        document.getElementById('resTimeIn').value  = '';
        showPopup({
          title:   'Reservation Submitted!',
          message: `Your reservation for <strong>Lab ${lab}</strong> is <strong>pending approval</strong>.`,
          btnText: 'OK',
          type:    'success',
        });
        loadResHistory();
      } else {
        showResMsg(result.message || 'Failed to submit reservation.');
      }
    } catch (e) {
      showResMsg('Server error. Make sure XAMPP is running.');
    } finally {
      reserveBtn.disabled    = false;
      reserveBtn.textContent = '✅ Reserve';
    }
  });

  // ── History table ──
  let resAllData = [], resLimit = 10, resQuery = '', resPage = 1;

  async function loadResHistory() {
    try {
      const data = await apiGet(API.reservations, { action: 'getByUser', idNumber: currentUser.idNumber });
      resAllData = data;
      resPage    = 1;
      renderResHistory();
    } catch (e) {
      document.getElementById('resHistoryBody').innerHTML =
        '<tr><td colspan="5" class="table-empty">Could not load reservation history.</td></tr>';
    }
  }

  function renderResHistory() {
    const filtered   = resAllData.filter(r =>
      `${r.purpose||''} ${r.lab||''} ${r.date||''} ${r.status||''}`.toLowerCase().includes(resQuery.toLowerCase())
    );
    const totalPages = Math.max(1, Math.ceil(filtered.length / resLimit));
    if (resPage > totalPages) resPage = totalPages;
    const start = (resPage - 1) * resLimit;
    const shown = filtered.slice(start, start + resLimit);

    const tbody = document.getElementById('resHistoryBody');
    tbody.innerHTML = '';

    if (!shown.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="table-empty">No reservation records yet.</td></tr>';
    } else {
      shown.forEach((r, i) => {
        let badge = '';
        if (r.status === 'pending')  badge = `<span class="badge-pending">Pending</span>`;
        if (r.status === 'approved') badge = `<span class="badge-active">Approved</span>`;
        if (r.status === 'rejected') badge = `<span class="badge-rejected">Rejected</span>`;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${start+i+1}</td><td>${r.purpose||'—'}</td><td>Lab ${r.lab||'—'}</td><td>${r.date||'—'}</td><td>${badge||r.status||'—'}</td>`;
        tbody.appendChild(tr);
      });
    }

    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + resLimit, filtered.length);
    document.getElementById('resEntriesInfo').textContent =
      filtered.length === 0 ? 'Showing 0 entries' : `Showing ${from} to ${to} of ${filtered.length} entries`;

    buildResPagination(totalPages);
  }

  function buildResPagination(totalPages) {
    const pg = document.getElementById('resPagination');
    pg.innerHTML = '';
    const prev = document.createElement('button');
    prev.className = 'page-btn'; prev.innerHTML = '&#171;'; prev.disabled = resPage === 1;
    prev.addEventListener('click', () => { if (resPage > 1) { resPage--; renderResHistory(); } });
    pg.appendChild(prev);
    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className   = `page-btn${i === resPage ? ' active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => { resPage = i; renderResHistory(); });
      pg.appendChild(btn);
    }
    const next = document.createElement('button');
    next.className = 'page-btn'; next.innerHTML = '&#187;'; next.disabled = resPage === totalPages;
    next.addEventListener('click', () => { if (resPage < totalPages) { resPage++; renderResHistory(); } });
    pg.appendChild(next);
  }

  document.getElementById('resEntriesPerPage').addEventListener('change', (e) => { resLimit = parseInt(e.target.value); resPage = 1; renderResHistory(); });
  document.getElementById('resSearchInput').addEventListener('input',     (e) => { resQuery = e.target.value; resPage = 1; renderResHistory(); });

  loadResHistory();
}

// ======================================
//  DARK MODE (all pages)
// ======================================

(function () {
  if (localStorage.getItem('ccs_dark_mode') === 'true') document.body.classList.add('dark-mode');

  function updateBtnIcon() {
    const isDark = document.body.classList.contains('dark-mode');
    document.querySelectorAll('.btn-darkmode').forEach(btn => { btn.textContent = isDark ? '☀️' : '🌙'; btn.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'; });
  }

  function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('ccs_dark_mode', document.body.classList.contains('dark-mode'));
    updateBtnIcon();
  }

  function init() {
    updateBtnIcon();
    document.querySelectorAll('.btn-darkmode').forEach(btn => { btn.removeEventListener('click', toggleDarkMode); btn.addEventListener('click', toggleDarkMode); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

