// ======================================
//  SHARED HELPERS
// ======================================

function showError(input, message) {
  input.classList.add('input-error');
  const err = document.createElement('span');
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

// ── SHARED SEARCH MODAL ──
function initSearchModal() {
  const searchOverlay = document.getElementById('searchOverlay');
  if (!searchOverlay) return;

  const openSearchBtn  = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchInput    = document.getElementById('searchInput');
  const searchGoBtn    = document.getElementById('searchGoBtn');
  const searchResults  = document.getElementById('searchResults');

  // ── Dynamically inject sit-in panels if not already in HTML ──
  if (!document.getElementById('searchResultsPanel')) {
    // Wrap existing searchResults in a panel div
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
          <div class="sitin-student-meta">
            <span>ID NUMBER</span>
            <span id="sitinStudentId">—</span>
          </div>
          <div class="sitin-student-meta">
            <span>REMAINING</span>
            <span id="sitinStudentSessions" class="sitin-sessions-count">—</span>
          </div>
        </div>
      </div>
      <div class="sitin-admin-form">
        <div class="sitin-admin-field">
          <label>Purpose</label>
          <select id="adminSitinPurpose">
            <option value="">Select purpose</option>
            <option value="C">C</option>
            <option value="C#">C#</option>
            <option value="Java">Java</option>
            <option value="ASP.Net">ASP.Net</option>
            <option value="PHP">PHP</option>
            <option value="Python">Python</option>
            <option value="HTML/CSS">HTML/CSS</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div class="sitin-admin-field">
          <label>Lab Room</label>
          <select id="adminSitinLab">
            <option value="">Select lab</option>
            <option value="524">524</option>
            <option value="526">526</option>
            <option value="528">528</option>
            <option value="530">530</option>
            <option value="542">542</option>
          </select>
        </div>
      </div>
      <div class="sitin-admin-actions">
        <button class="sitin-admin-cancel-btn" id="sitinBackBtn">Cancel</button>
        <button class="sitin-admin-confirm-btn" id="sitinConfirmBtn">Confirm Sit-In</button>
      </div>`;
    // Append after resultsPanel inside search-box
    document.getElementById('searchResultsPanel').parentNode.appendChild(formPanel);
  }

  const searchResultsPanel = document.getElementById('searchResultsPanel');
  const sitinFormPanel     = document.getElementById('sitinFormPanel');
  let selectedUser = null;

  function showResultsPanel() {
    searchResultsPanel.style.display = 'block';
    sitinFormPanel.style.display     = 'none';
  }

  function showSitinPanel(u) {
    selectedUser = u;
    searchResultsPanel.style.display = 'none';
    sitinFormPanel.style.display     = 'block';
    const initials = (u.firstName[0] || '') + (u.lastName[0] || '');
    document.getElementById('sitinAvatar').textContent      = initials.toUpperCase();
    document.getElementById('sitinStudentName').textContent = `${u.firstName} ${u.middleName ? u.middleName + ' ' : ''}${u.lastName}`;
    document.getElementById('sitinStudentId').textContent   = u.idNumber;
    const sessions = u.sessions !== undefined ? u.sessions : 30;
    document.getElementById('sitinStudentSessions').textContent = `${sessions} / 30`;
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

  // Back button
  document.getElementById('sitinBackBtn').addEventListener('click', () => showResultsPanel());

  // Confirm Sit-In
  document.getElementById('sitinConfirmBtn').addEventListener('click', () => {
    const purpose = document.getElementById('adminSitinPurpose').value;
    const lab     = document.getElementById('adminSitinLab').value;
    if (!purpose) { alert('Please select a purpose.'); return; }
    if (!lab)     { alert('Please select a lab room.'); return; }
    if (!selectedUser) return;

    const users   = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const userIdx = users.findIndex(u => u.idNumber === selectedUser.idNumber);
    if (userIdx === -1) { alert('Student not found.'); return; }
    if ((users[userIdx].sessions || 0) <= 0) { alert('This student has no remaining sessions.'); return; }

    const sitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
    const now    = new Date();
    sitins.push({
      sitId:    'SIT-' + Date.now(),
      idNumber:  selectedUser.idNumber,
      purpose:   purpose,
      lab:       lab,
      session:   users[userIdx].sessions,
      status:   'active',
      timeIn:    now.toLocaleTimeString(),
      timeOut:   null,
      date:      getNow(),
    });
    localStorage.setItem('ccs_sitins', JSON.stringify(sitins));

    searchOverlay.classList.remove('active');
    showPopup({
      title:   'Sit-in Confirmed!',
      message: `<strong>${selectedUser.firstName} ${selectedUser.lastName}</strong> has been logged in.<br/>Lab: <strong>${lab}</strong> | Purpose: <strong>${purpose}</strong>`,
      btnText: 'OK',
      type:    'success',
    });
  });

  function doSearch() {
    const query = searchInput.value.trim().toLowerCase();
    searchResults.innerHTML = '';
    showResultsPanel();
    if (!query) { searchResults.innerHTML = '<p class="search-no-result">Please enter a name or ID number.</p>'; return; }
    const allUsers = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const found = allUsers.filter(u => {
      const name = `${u.firstName} ${u.lastName} ${u.middleName || ''}`.toLowerCase();
      return name.includes(query) || u.idNumber.toLowerCase().includes(query);
    });
    if (found.length === 0) { searchResults.innerHTML = '<p class="search-no-result">No students found.</p>'; return; }
    found.forEach(u => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      const sessions = u.sessions !== undefined ? u.sessions : 30;
      item.innerHTML = `
        <div class="search-result-avatar">${(u.firstName[0]||'')+(u.lastName[0]||'')}</div>
        <div class="search-result-info">
          <p class="search-result-name">${u.firstName} ${u.middleName ? u.middleName + ' ' : ''}${u.lastName}</p>
          <p class="search-result-details">ID: ${u.idNumber} &nbsp;|&nbsp; ${u.course} ${u.yearLevel} year</p>
          <p class="search-result-sessions">${sessions} sessions</p>
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

    if (!idNumber.value.trim())  { showError(idNumber,  'ID Number is required.');        valid = false; }
    if (!lastName.value.trim())  { showError(lastName,  'Last Name is required.');         valid = false; }
    if (!firstName.value.trim()) { showError(firstName, 'First Name is required.');        valid = false; }
    if (!course.value)           { showError(course,    'Please select a course.');         valid = false; }
    if (!yearLevel.value)        { showError(yearLevel, 'Please select a year level.');     valid = false; }
    if (!address.value.trim())   { showError(address,   'Address is required.');            valid = false; }
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
    // Fill student info
    studentAvatar.textContent = currentUser.idNumber ? currentUser.idNumber.toString().slice(-2) : '??';
    document.getElementById('infoName').textContent    = `${currentUser.firstName} ${currentUser.lastName}`;
    document.getElementById('infoCourse').textContent  = currentUser.course    || '—';
    document.getElementById('infoYear').textContent    = currentUser.yearLevel || '—';
    document.getElementById('infoEmail').textContent   = currentUser.email     || '—';
    document.getElementById('infoAddress').textContent = currentUser.address   || '—';
    document.getElementById('infoSession').textContent = currentUser.sessions  !== undefined ? currentUser.sessions : 30;

    // ── LOAD ANNOUNCEMENTS ──
    function loadAnnouncements() {
      const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
      const list = document.getElementById('announcementList');
      if (list) {
        if (announcements.length === 0) {
          list.innerHTML = '<p style="font-size:13px;color:#aaa;text-align:center;margin-top:20px;">No announcements yet.</p>';
        } else {
          list.innerHTML = '';
          [...announcements].reverse().forEach(a => {
            const item = document.createElement('div');
            item.className = 'announcement-item';
            item.innerHTML = `<p class="announce-author">CCS Admin | ${a.date}</p><p class="announce-body">${a.text}</p>`;
            list.appendChild(item);
          });
        }
      }
    }

    // ── NOTIFICATION DROPDOWN ──
    function loadNotifications() {
      const announcements  = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
      const readKey        = `ccs_notif_read_${currentUser.idNumber}`;
      const lastRead       = parseInt(localStorage.getItem(readKey) || '0');
      const unread         = announcements.filter(a => a.id > lastRead);

      const badge   = document.getElementById('notifBadge');
      const menu    = document.getElementById('notifMenu');

      // Update badge
      if (unread.length > 0) {
        badge.textContent = unread.length > 9 ? '9+' : unread.length;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }

      // Populate dropdown
      menu.innerHTML = '';
      if (announcements.length === 0) {
        menu.innerHTML = '<li><a class="notif-empty">No new notifications</a></li>';
        return;
      }

      [...announcements].reverse().forEach(a => {
        const li = document.createElement('li');
        const isNew = a.id > lastRead;
        li.innerHTML = `
          <a class="notif-item${isNew ? ' notif-unread' : ''}">
            <p class="notif-item-date">CCS Admin | ${a.date}${isNew ? ' 🔵' : ''}</p>
            <p class="notif-item-text">${a.text}</p>
          </a>`;
        menu.appendChild(li);
      });

      // Mark all as read button
      if (unread.length > 0) {
        const markLi = document.createElement('li');
        markLi.innerHTML = `<a class="notif-mark-read" id="markReadBtn">Mark all as read</a>`;
        menu.appendChild(markLi);
        document.getElementById('markReadBtn').addEventListener('click', (e) => {
          e.preventDefault();
          const latest = Math.max(...announcements.map(a => a.id || 0));
          localStorage.setItem(readKey, latest);
          loadNotifications();
        });
      }
    }

    loadAnnouncements();
    loadNotifications();
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('ccs_current_user');
    window.location.href = 'index.html';
  });

  // ── SIT-IN REQUEST MODAL ──
  const sitinOverlay   = document.getElementById('sitinModalOverlay');
  const openSitinBtn   = document.getElementById('openSitinModalBtn');
  const closeSitinBtn  = document.getElementById('closeSitinModalBtn');
  const cancelSitinBtn = document.getElementById('cancelSitinBtn');
  const submitSitinBtn = document.getElementById('submitSitinBtn');

  if (sitinOverlay && openSitinBtn) {
    openSitinBtn.addEventListener('click', () => {
      const freshUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
      const sessions  = freshUser ? (freshUser.sessions !== undefined ? freshUser.sessions : 30) : 0;
      document.getElementById('modalSessionCount').textContent = sessions;
      if (sessions <= 0) { alert('You have no remaining sessions. Please contact the admin.'); return; }
      sitinOverlay.classList.add('active');
    });

    closeSitinBtn.addEventListener('click',  () => sitinOverlay.classList.remove('active'));
    cancelSitinBtn.addEventListener('click', () => sitinOverlay.classList.remove('active'));
    sitinOverlay.addEventListener('click', (e) => { if (e.target === sitinOverlay) sitinOverlay.classList.remove('active'); });

    submitSitinBtn.addEventListener('click', () => {
      const purpose = document.getElementById('sitinPurpose').value;
      const lab     = document.getElementById('sitinLab').value;
      if (!purpose) { alert('Please select a purpose.'); return; }
      if (!lab)     { alert('Please select a laboratory.'); return; }

      const freshUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
      if (!freshUser) { window.location.href = 'index.html'; return; }
      if ((freshUser.sessions || 0) <= 0) { alert('You have no remaining sessions.'); sitinOverlay.classList.remove('active'); return; }

      const sitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
      const now    = new Date();
      sitins.push({
        sitId:    'SIT-' + Date.now(),
        idNumber:  freshUser.idNumber,
        purpose:   purpose,
        lab:       lab,
        session:   freshUser.sessions,
        status:   'active',
        timeIn:    now.toLocaleTimeString(),
        timeOut:   null,
        date:      getNow(),
      });
      localStorage.setItem('ccs_sitins', JSON.stringify(sitins));

      sitinOverlay.classList.remove('active');
      document.getElementById('sitinPurpose').value = '';
      document.getElementById('sitinLab').value     = '';

      showPopup({
        title:   'Sit-in Request Submitted!',
        message: `Your sit-in has been recorded.<br/>Lab: <strong>${lab}</strong> | Purpose: <strong>${purpose}</strong>`,
        btnText: 'OK', type: 'success',
      });
    });
  }
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
    const updatedUser = {
      ...currentUser,
      lastName: lastName.value.trim(), firstName: firstName.value.trim(),
      middleName: document.getElementById('epMiddleName').value.trim(),
      course: course.value, yearLevel: yearLevel.value,
      email: email.value.trim(), address: address.value.trim(),
      username: username.value.trim(),
      password: newPw.value ? newPw.value : currentUser.password,
    };
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

const sitinChartEl = document.getElementById('sitinChart');
if (sitinChartEl) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  const users  = JSON.parse(localStorage.getItem('ccs_users')  || '[]');
  const sitIns = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  document.getElementById('statRegistered').textContent = users.length;
  document.getElementById('statCurrent').textContent    = sitIns.filter(s => s.status === 'active').length;
  document.getElementById('statTotal').textContent      = sitIns.length;

  const courseCounts = {};
  users.forEach(u => { courseCounts[u.course] = (courseCounts[u.course] || 0) + 1; });
  const chartLabels = Object.keys(courseCounts).length > 0 ? Object.keys(courseCounts) : ['No data'];
  const chartData   = Object.keys(courseCounts).length > 0 ? Object.values(courseCounts) : [1];

  new Chart(sitinChartEl.getContext('2d'), {
    type: 'pie',
    data: { labels: chartLabels, datasets: [{ data: chartData, backgroundColor: ['#2b7de9','#e05c5c','#f0a500','#4caf50','#9c5cf0'], borderWidth: 2, borderColor: '#fff' }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top', labels: { font: { size: 12 }, boxWidth: 14 } } } }
  });

  function renderAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const list = document.getElementById('postedList');
    if (!list) return;
    if (!announcements.length) { list.innerHTML = '<p class="posted-empty">No announcements yet.</p>'; return; }
    list.innerHTML = '';
    [...announcements].reverse().forEach(a => {
      const item = document.createElement('div');
      item.className = 'posted-item';
      item.innerHTML = `
        <div class="posted-item-header">
          <p class="posted-author">CCS Admin | ${a.date}</p>
          <button class="btn-delete-announce" title="Delete" onclick="deleteAnnouncement(${a.id})">&#128465;</button>
        </div>
        ${a.text ? `<p class="posted-body">${a.text}</p>` : ''}`;
      list.appendChild(item);
    });
  }

  window.deleteAnnouncement = function(id) {
    if (!confirm('Delete this announcement?')) return;
    let announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    announcements = announcements.filter(a => a.id !== id);
    localStorage.setItem('ccs_announcements', JSON.stringify(announcements));
    renderAnnouncements();
  };


  document.getElementById('announceSubmitBtn').addEventListener('click', () => {
    const textarea = document.getElementById('newAnnounceText');
    const text = textarea.value.trim();
    if (!text) return;
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    // Assign a unique ID so students can track read/unread
    const newId = Date.now();
    announcements.push({ id: newId, text, date: getNow() });
    localStorage.setItem('ccs_announcements', JSON.stringify(announcements));
    textarea.value = '';
    renderAnnouncements();
  });

  renderAnnouncements();
  initSearchModal();
}


// ======================================
//  ADMIN STUDENTS PAGE (admin-students.html)
// ======================================

const studentsTableBody = document.getElementById('studentsTableBody');
if (studentsTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  let currentEditId = null, currentViewId = null, entriesLimit = 10, searchQuery = '';

  function renderTable() {
    const users    = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const filtered = users.filter(u => `${u.firstName} ${u.lastName} ${u.idNumber}`.toLowerCase().includes(searchQuery.toLowerCase()));
    const shown    = filtered.slice(0, entriesLimit);
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
          <button class="btn-view"      onclick="openViewModal('${u.idNumber}')">View</button>
          <button class="btn-edit"      onclick="openEditModal('${u.idNumber}')">Edit</button>
          <button class="btn-reset-one" onclick="resetOneSession('${u.idNumber}')">Reset</button>
          <button class="btn-delete"    onclick="deleteStudent('${u.idNumber}')">Delete</button>
        </td>`;
      studentsTableBody.appendChild(tr);
    });
    document.getElementById('entriesInfo').textContent = `Showing ${shown.length} of ${filtered.length} entries`;
  }

  renderTable();

  document.getElementById('entriesPerPage').addEventListener('change', (e) => { entriesLimit = parseInt(e.target.value); renderTable(); });
  document.getElementById('tableSearchInput').addEventListener('input', (e) => { searchQuery = e.target.value; renderTable(); });

  document.getElementById('resetAllSessionBtn').addEventListener('click', () => {
    if (!confirm('Reset sessions for ALL students to 30?')) return;
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    users.forEach(u => u.sessions = 30);
    localStorage.setItem('ccs_users', JSON.stringify(users));
    renderTable();
  });

  window.resetOneSession = function(idNumber) {
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const idx   = users.findIndex(u => u.idNumber === idNumber);
    if (idx !== -1) { users[idx].sessions = 30; localStorage.setItem('ccs_users', JSON.stringify(users)); renderTable(); }
  };

  window.deleteStudent = function(idNumber) {
    if (!confirm(`Delete student ${idNumber}? This cannot be undone.`)) return;
    let users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    users = users.filter(u => u.idNumber !== idNumber);
    localStorage.setItem('ccs_users', JSON.stringify(users));
    renderTable();
  };

  // ── VIEW MODAL ──
  const viewOverlay = document.getElementById('viewStudentOverlay');
  window.openViewModal = function(idNumber) {
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const u     = users.find(u => u.idNumber === idNumber);
    if (!u) return;
    currentViewId = idNumber;
    const initials = (u.firstName[0] || '') + (u.lastName[0] || '');
    document.getElementById('viewAvatar').textContent   = initials.toUpperCase();
    document.getElementById('viewName').textContent     = `${u.firstName} ${u.middleName ? u.middleName + ' ' : ''}${u.lastName}`;
    document.getElementById('viewIdBadge').textContent  = u.idNumber;
    document.getElementById('viewCourse').textContent   = u.course     || '—';
    document.getElementById('viewYear').textContent     = u.yearLevel  || '—';
    document.getElementById('viewEmail').textContent    = u.email      || '—';
    document.getElementById('viewAddress').textContent  = u.address    || '—';
    document.getElementById('viewMiddle').textContent   = u.middleName || '—';
    document.getElementById('viewUsername').textContent = u.username   || '—';
    document.getElementById('viewSessions').textContent = u.sessions !== undefined ? u.sessions : 30;
    viewOverlay.classList.add('active');
  };
  if (viewOverlay) {
    document.getElementById('closeViewStudentBtn').addEventListener('click',  () => viewOverlay.classList.remove('active'));
    document.getElementById('cancelViewStudentBtn').addEventListener('click', () => viewOverlay.classList.remove('active'));
    viewOverlay.addEventListener('click', (e) => { if (e.target === viewOverlay) viewOverlay.classList.remove('active'); });
  }
  window.switchToEdit = function() { if (viewOverlay) viewOverlay.classList.remove('active'); openEditModal(currentViewId); };

  // ── ADD MODAL ──
  const addOverlay = document.getElementById('addStudentOverlay');
  document.getElementById('openAddStudentBtn').addEventListener('click',   () => addOverlay.classList.add('active'));
  document.getElementById('closeAddStudentBtn').addEventListener('click',  () => addOverlay.classList.remove('active'));
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
    users.push({ idNumber: idNumber.value.trim(), lastName: lastName.value.trim(), firstName: firstName.value.trim(), middleName: middleName.value.trim(), course: course.value, yearLevel: yearLevel.value, email: email.value.trim(), address: address.value.trim(), password: password.value, username: '', sessions: 30 });
    localStorage.setItem('ccs_users', JSON.stringify(users));
    addOverlay.classList.remove('active');
    [idNumber, lastName, firstName, middleName, email, address, password].forEach(el => el.value = '');
    course.value = ''; yearLevel.value = '';
    renderTable();
  });

  // ── EDIT MODAL ──
  const editOverlay = document.getElementById('editStudentOverlay');
  document.getElementById('closeEditStudentBtn').addEventListener('click',  () => editOverlay.classList.remove('active'));
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
    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const idx   = users.findIndex(u => u.idNumber === currentEditId);
    if (idx === -1) return;
    users[idx] = { ...users[idx], lastName: document.getElementById('editLastName').value.trim(), firstName: document.getElementById('editFirstName').value.trim(), middleName: document.getElementById('editMiddleName').value.trim(), course: document.getElementById('editCourse').value, yearLevel: document.getElementById('editYearLevel').value, email: document.getElementById('editEmail').value.trim(), address: document.getElementById('editAddress').value.trim(), sessions: parseInt(document.getElementById('editSessions').value) || 0 };
    localStorage.setItem('ccs_users', JSON.stringify(users));
    editOverlay.classList.remove('active');
    renderTable();
  });

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

  let entriesLimit = 10, searchQuery = '', currentPage = 1;
  function getSitins() { return JSON.parse(localStorage.getItem('ccs_sitins') || '[]'); }

  function renderSitin() {
    const sitins = getSitins();
    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const filtered = sitins.filter(s => { const user = users.find(u => u.idNumber === s.idNumber); const name = user ? `${user.firstName} ${user.lastName}`.toLowerCase() : ''; return name.includes(searchQuery.toLowerCase()) || s.idNumber.toLowerCase().includes(searchQuery.toLowerCase()); });
    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;
    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);
    sitinTableBody.innerHTML = '';
    if (shown.length === 0) { sitinTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No data available</td></tr>`; }
    else {
      shown.forEach(s => {
        const user = users.find(u => u.idNumber === s.idNumber);
        const name = user ? `${user.lastName}, ${user.firstName}` : s.idNumber;
        const status  = s.status === 'active' ? `<span class="badge-active">Active</span>` : `<span class="badge-done">Done</span>`;
        const actions = s.status === 'active' ? `<button class="btn-end-session" onclick="endSession('${s.sitId}')">End Session</button>` : '—';
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${s.sitId}</td><td>${s.idNumber}</td><td>${name}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.session||'—'}</td><td>${status}</td><td>${actions}</td>`;
        sitinTableBody.appendChild(tr);
      });
    }
    const from = filtered.length === 0 ? 0 : start + 1;
    const to = Math.min(start + entriesLimit, filtered.length);
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

  window.endSession = function(sitId) {
    if (!confirm('End this sit-in session?')) return;
    const sitins = getSitins(); const idx = sitins.findIndex(s => s.sitId === sitId);
    if (idx !== -1) {
      sitins[idx].status = 'done'; sitins[idx].timeOut = new Date().toLocaleTimeString();
      const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
      const userIdx = users.findIndex(u => u.idNumber === sitins[idx].idNumber);
      if (userIdx !== -1 && users[userIdx].sessions > 0) { users[userIdx].sessions -= 1; localStorage.setItem('ccs_users', JSON.stringify(users)); }
      localStorage.setItem('ccs_sitins', JSON.stringify(sitins)); renderSitin();
    }
  };

  document.getElementById('entriesPerPage').addEventListener('change', (e) => { entriesLimit = parseInt(e.target.value); currentPage = 1; renderSitin(); });
  document.getElementById('tableSearchInput').addEventListener('input', (e) => { searchQuery = e.target.value; currentPage = 1; renderSitin(); });
  const adminLogout2 = document.getElementById('adminLogoutBtn');
  if (adminLogout2) adminLogout2.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });
  initSearchModal(); renderSitin();
}


// ======================================
//  VIEW SIT-IN RECORDS (admin-records.html)
// ======================================

const recordsTableBody = document.getElementById('recordsTableBody');
if (recordsTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let entriesLimit = 10, searchQuery = '', currentPage = 1;
  function getRecords() { return JSON.parse(localStorage.getItem('ccs_sitins') || '[]'); }

  function renderCharts() {
    const sitins = getRecords(); const purposeCounts = {}, labCounts = {};
    sitins.forEach(s => { const pk = s.purpose||'Unknown'; purposeCounts[pk]=(purposeCounts[pk]||0)+1; const lk=s.lab||'Unknown'; labCounts[lk]=(labCounts[lk]||0)+1; });
    const barOpts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true,ticks:{stepSize:1}},x:{ticks:{font:{size:11}}}} };
    new Chart(document.getElementById('langChart').getContext('2d'),{type:'bar',data:{labels:Object.keys(purposeCounts).length?Object.keys(purposeCounts):['No Data'],datasets:[{data:Object.keys(purposeCounts).length?Object.values(purposeCounts):[0],backgroundColor:'#2b7de9',borderRadius:4}]},options:barOpts});
    new Chart(document.getElementById('labChart').getContext('2d'), {type:'bar',data:{labels:Object.keys(labCounts).length?Object.keys(labCounts):['No Data'],datasets:[{data:Object.keys(labCounts).length?Object.values(labCounts):[0],backgroundColor:'#4caf50',borderRadius:4}]},options:barOpts});
  }

  function renderRecords() {
    const sitins=getRecords(); const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');
    const filtered=sitins.filter(s=>{const user=users.find(u=>u.idNumber===s.idNumber);const name=user?`${user.firstName} ${user.lastName}`.toLowerCase():'';return name.includes(searchQuery.toLowerCase())||s.idNumber.toLowerCase().includes(searchQuery.toLowerCase());});
    const totalPages=Math.max(1,Math.ceil(filtered.length/entriesLimit)); if(currentPage>totalPages)currentPage=totalPages;
    const start=(currentPage-1)*entriesLimit; const shown=filtered.slice(start,start+entriesLimit);
    recordsTableBody.innerHTML='';
    if(shown.length===0){recordsTableBody.innerHTML=`<tr><td colspan="8" class="table-empty">No data available</td></tr>`;}
    else{shown.forEach((s,i)=>{const user=users.find(u=>u.idNumber===s.idNumber);const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber;const tr=document.createElement('tr');tr.innerHTML=`<td>${start+i+1}</td><td>${s.idNumber}</td><td>${name}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.timeIn||'—'}</td><td>${s.timeOut||'—'}</td><td>${s.date||'—'}</td>`;recordsTableBody.appendChild(tr);});}
    const from=filtered.length===0?0:start+1; const to=Math.min(start+entriesLimit,filtered.length);
    document.getElementById('entriesInfo').textContent=filtered.length===0?'Showing 0 entries':`Showing ${from} to ${to} of ${filtered.length} entries`;
    buildRecordsPagination(totalPages);
  }

  function buildRecordsPagination(totalPages){const pg=document.getElementById('pagination');pg.innerHTML='';const prev=document.createElement('button');prev.className='page-btn';prev.innerHTML='&#171;';prev.disabled=currentPage===1;prev.addEventListener('click',()=>{if(currentPage>1){currentPage--;renderRecords();}});pg.appendChild(prev);for(let i=1;i<=totalPages;i++){const btn=document.createElement('button');btn.className=`page-btn${i===currentPage?' active':''}`;btn.textContent=i;btn.addEventListener('click',()=>{currentPage=i;renderRecords();});pg.appendChild(btn);}const next=document.createElement('button');next.className='page-btn';next.innerHTML='&#187;';next.disabled=currentPage===totalPages;next.addEventListener('click',()=>{if(currentPage<totalPages){currentPage++;renderRecords();}});pg.appendChild(next);}

  document.getElementById('resetSessionsBtn').addEventListener('click',()=>{if(!confirm('Reset all student sessions to 30?'))return;const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');users.forEach(u=>u.sessions=30);localStorage.setItem('ccs_users',JSON.stringify(users));alert('All sessions have been reset to 30.');});
  document.getElementById('clearRecordsBtn').addEventListener('click',()=>{if(!confirm('Clear ALL sit-in records? This cannot be undone.'))return;localStorage.setItem('ccs_sitins','[]');renderRecords();});
  document.getElementById('entriesPerPage').addEventListener('change',(e)=>{entriesLimit=parseInt(e.target.value);currentPage=1;renderRecords();});
  document.getElementById('tableSearchInput').addEventListener('input',(e)=>{searchQuery=e.target.value;currentPage=1;renderRecords();});
  const adminLogout3=document.getElementById('adminLogoutBtn');if(adminLogout3)adminLogout3.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('ccs_admin');window.location.href='index.html';});
  initSearchModal(); renderCharts(); renderRecords();
}


// ======================================
//  SIT-IN REPORTS (admin-reports.html)
// ======================================

const reportsTableBody = document.getElementById('reportsTableBody');
if (reportsTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let currentPage=1,entriesLimit=10,filterQuery='',dateFilter='';
  function getFiltered(){const sitins=JSON.parse(localStorage.getItem('ccs_sitins')||'[]');const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');return sitins.filter(s=>{const user=users.find(u=>u.idNumber===s.idNumber);const name=user?`${user.firstName} ${user.lastName}`.toLowerCase():'';const str=(name+s.idNumber+(s.purpose||'')+(s.lab||'')+(s.date||'')).toLowerCase();return str.includes(filterQuery.toLowerCase())&&(dateFilter?s.date===dateFilter:true);});}
  function renderReports(){const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');const filtered=getFiltered();const totalPages=Math.max(1,Math.ceil(filtered.length/entriesLimit));if(currentPage>totalPages)currentPage=totalPages;const start=(currentPage-1)*entriesLimit;const shown=filtered.slice(start,start+entriesLimit);reportsTableBody.innerHTML='';if(shown.length===0){reportsTableBody.innerHTML=`<tr><td colspan="7" class="table-empty">No records found.</td></tr>`;}else{shown.forEach(s=>{const user=users.find(u=>u.idNumber===s.idNumber);const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber;const tr=document.createElement('tr');tr.innerHTML=`<td>${s.idNumber}</td><td>${name}</td><td>${s.purpose||'—'}</td><td>${s.lab||'—'}</td><td>${s.timeIn||'—'}</td><td>${s.timeOut||'—'}</td><td>${s.date||'—'}</td>`;reportsTableBody.appendChild(tr);});}const from=filtered.length===0?0:start+1;const to=Math.min(start+entriesLimit,filtered.length);document.getElementById('entriesInfo').textContent=filtered.length===0?'Showing 0 entries':`Showing ${from} to ${to} of ${filtered.length} entries`;buildReportsPagination(totalPages);}
  function buildReportsPagination(totalPages){const pg=document.getElementById('pagination');pg.innerHTML='';const mk=(label,page,disabled)=>{const b=document.createElement('button');b.className=`page-btn${page===currentPage?' active':''}`;b.innerHTML=label;b.disabled=disabled;b.addEventListener('click',()=>{if(!disabled){currentPage=page;renderReports();}});return b;};pg.appendChild(mk('&#8249;',1,currentPage===1));pg.appendChild(mk('&#171;',Math.max(1,currentPage-1),currentPage===1));for(let i=1;i<=totalPages;i++)pg.appendChild(mk(i,i,false));pg.appendChild(mk('&#187;',Math.min(totalPages,currentPage+1),currentPage===totalPages));pg.appendChild(mk('&#8250;',totalPages,currentPage===totalPages));}
  document.getElementById('reportSearchBtn').addEventListener('click',()=>{dateFilter=document.getElementById('reportDateInput').value;currentPage=1;renderReports();});
  document.getElementById('reportResetBtn').addEventListener('click',()=>{document.getElementById('reportDateInput').value='';document.getElementById('reportFilterInput').value='';dateFilter='';filterQuery='';currentPage=1;renderReports();});
  document.getElementById('reportFilterInput').addEventListener('input',(e)=>{filterQuery=e.target.value;currentPage=1;renderReports();});
  document.getElementById('exportCsvBtn').addEventListener('click',()=>{const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');const filtered=getFiltered();if(!filtered.length){alert('No records to export.');return;}let csv='ID Number,Name,Purpose,Laboratory,Login,Logout,Date\n';filtered.forEach(s=>{const user=users.find(u=>u.idNumber===s.idNumber);const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber;csv+=`${s.idNumber},"${name}","${s.purpose||''}","${s.lab||''}","${s.timeIn||''}","${s.timeOut||''}","${s.date||''}"\n`;});const blob=new Blob([csv],{type:'text/csv'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sitin-report.csv';a.click();URL.revokeObjectURL(url);});
  document.getElementById('exportExcelBtn').addEventListener('click',()=>{const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');const filtered=getFiltered();if(!filtered.length){alert('No records to export.');return;}let tsv='ID Number\tName\tPurpose\tLaboratory\tLogin\tLogout\tDate\n';filtered.forEach(s=>{const user=users.find(u=>u.idNumber===s.idNumber);const name=user?`${user.lastName}, ${user.firstName}`:s.idNumber;tsv+=`${s.idNumber}\t${name}\t${s.purpose||''}\t${s.lab||''}\t${s.timeIn||''}\t${s.timeOut||''}\t${s.date||''}\n`;});const blob=new Blob([tsv],{type:'application/vnd.ms-excel'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sitin-report.xls';a.click();URL.revokeObjectURL(url);});
  document.getElementById('exportPdfBtn').addEventListener('click',()=>window.print());
  document.getElementById('printBtn').addEventListener('click',()=>window.print());
  const adminLogout4=document.getElementById('adminLogoutBtn');if(adminLogout4)adminLogout4.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('ccs_admin');window.location.href='index.html';});
  initSearchModal(); renderReports();
}


// ======================================
//  FEEDBACK REPORTS (admin-feedback.html)
// ======================================

const feedbackTableBody = document.getElementById('feedbackTableBody');
if (feedbackTableBody) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  let currentPage=1,entriesLimit=10,filterQuery='';
  function getFbFiltered(){const feedbacks=JSON.parse(localStorage.getItem('ccs_feedbacks')||'[]');return feedbacks.filter(f=>`${f.idNumber} ${f.lab||''} ${f.date||''} ${f.message||''}`.toLowerCase().includes(filterQuery.toLowerCase()));}
  function renderFeedback(){const filtered=getFbFiltered();const totalPages=Math.max(1,Math.ceil(filtered.length/entriesLimit));if(currentPage>totalPages)currentPage=totalPages;const start=(currentPage-1)*entriesLimit;const shown=filtered.slice(start,start+entriesLimit);feedbackTableBody.innerHTML='';if(shown.length===0){feedbackTableBody.innerHTML=`<tr><td colspan="4" class="table-empty">No feedback found.</td></tr>`;}else{shown.forEach(f=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${f.idNumber}</td><td>${f.lab||'—'}</td><td>${f.date||'—'}</td><td class="feedback-msg">${f.message||'—'}</td>`;feedbackTableBody.appendChild(tr);});}const from=filtered.length===0?0:start+1;const to=Math.min(start+entriesLimit,filtered.length);document.getElementById('entriesInfo').textContent=filtered.length===0?'Showing 0 entries':`Showing ${from} to ${to} of ${filtered.length} entries`;buildFbPagination(totalPages);}
  function buildFbPagination(totalPages){const pg=document.getElementById('pagination');pg.innerHTML='';const mk=(label,page,disabled)=>{const b=document.createElement('button');b.className=`page-btn${page===currentPage?' active':''}`;b.innerHTML=label;b.disabled=disabled;b.addEventListener('click',()=>{if(!disabled){currentPage=page;renderFeedback();}});return b;};pg.appendChild(mk('&#8249;',1,currentPage===1));pg.appendChild(mk('&#171;',Math.max(1,currentPage-1),currentPage===1));for(let i=1;i<=totalPages;i++)pg.appendChild(mk(i,i,false));pg.appendChild(mk('&#187;',Math.min(totalPages,currentPage+1),currentPage===totalPages));pg.appendChild(mk('&#8250;',totalPages,currentPage===totalPages));}
  document.getElementById('feedbackFilterInput').addEventListener('input',(e)=>{filterQuery=e.target.value;currentPage=1;renderFeedback();});
  document.getElementById('feedbackPrintBtn').addEventListener('click',()=>window.print());
  const adminLogout5=document.getElementById('adminLogoutBtn');if(adminLogout5)adminLogout5.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('ccs_admin');window.location.href='index.html';});
  initSearchModal(); renderFeedback();
}


// ======================================
//  RESERVATION (admin-reservation.html)
// ======================================

const computerGrid = document.getElementById('computerGrid');
if (computerGrid) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }
  const TOTAL=20;
  function getComputers(lab){const data=JSON.parse(localStorage.getItem(`ccs_computers_${lab}`)||'null');if(data)return data;const d={};for(let i=1;i<=TOTAL;i++)d[i]='available';return d;}
  function saveComputers(lab,data){localStorage.setItem(`ccs_computers_${lab}`,JSON.stringify(data));}
  function renderComputers(){const lab=document.getElementById('labInput').value.trim()||'524';const computers=getComputers(lab);computerGrid.innerHTML='';for(let i=1;i<=TOTAL;i++){const status=computers[i]||'available';const btn=document.createElement('button');btn.className=`computer-btn ${status}`;btn.textContent=i;btn.addEventListener('click',()=>{if(status==='available'){if(!confirm(`Mark Computer ${i} as Used?`))return;computers[i]='used';}else{if(!confirm(`Mark Computer ${i} as Available?`))return;computers[i]='available';}saveComputers(lab,computers);renderComputers();});computerGrid.appendChild(btn);}}
  function renderRequests(){const requests=JSON.parse(localStorage.getItem('ccs_reservations')||'[]');const pending=requests.filter(r=>r.status==='pending');const panel=document.getElementById('reservationRequests');panel.innerHTML='';if(!pending.length){panel.innerHTML='<p class="res-empty">No pending reservation requests.</p>';return;}pending.forEach(r=>{const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');const user=users.find(u=>u.idNumber===r.idNumber);const name=user?`${user.firstName} ${user.lastName}`:r.idNumber;const item=document.createElement('div');item.className='res-request-item';item.innerHTML=`<p><strong>${name}</strong> (${r.idNumber})</p><p>Lab: ${r.lab} &nbsp;|&nbsp; PC: ${r.computer}</p><p>Date: ${r.date}</p><div class="res-request-actions"><button class="btn-approve" onclick="handleReservation('${r.resId}','approved')">Approve</button><button class="btn-reject" onclick="handleReservation('${r.resId}','rejected')">Reject</button></div>`;panel.appendChild(item);});}
  function renderLogs(){const requests=JSON.parse(localStorage.getItem('ccs_reservations')||'[]');const done=requests.filter(r=>r.status!=='pending');const panel=document.getElementById('reservationLogs');panel.innerHTML='';if(!done.length){panel.innerHTML='<p class="res-empty">No reservation logs yet.</p>';return;}[...done].reverse().forEach(r=>{const users=JSON.parse(localStorage.getItem('ccs_users')||'[]');const user=users.find(u=>u.idNumber===r.idNumber);const name=user?`${user.firstName} ${user.lastName}`:r.idNumber;const color=r.status==='approved'?'#4caf50':'#e02020';const item=document.createElement('div');item.className='res-log-item';item.innerHTML=`<strong>${name}</strong> — Lab ${r.lab}, PC ${r.computer}<br/><span style="color:${color};font-weight:600;text-transform:capitalize;">${r.status}</span> &nbsp;|&nbsp; ${r.date}`;panel.appendChild(item);});}
  window.handleReservation=function(resId,action){const requests=JSON.parse(localStorage.getItem('ccs_reservations')||'[]');const idx=requests.findIndex(r=>r.resId===resId);if(idx!==-1){requests[idx].status=action;if(action==='approved'){const lab=requests[idx].lab;const computer=requests[idx].computer;const computers=getComputers(lab);computers[computer]='used';saveComputers(lab,computers);renderComputers();}localStorage.setItem('ccs_reservations',JSON.stringify(requests));renderRequests();renderLogs();}};
  document.getElementById('labFilterBtn').addEventListener('click',renderComputers);
  document.getElementById('labInput').addEventListener('keydown',(e)=>{if(e.key==='Enter')renderComputers();});
  const adminLogout6=document.getElementById('adminLogoutBtn');if(adminLogout6)adminLogout6.addEventListener('click',(e)=>{e.preventDefault();localStorage.removeItem('ccs_admin');window.location.href='index.html';});
  initSearchModal(); renderComputers(); renderRequests(); renderLogs();
}


// ======================================
//  STUDENT HISTORY (history.html)
// ======================================

const historyTableBody = document.getElementById('historyTableBody');
if (historyTableBody) {
  const currentUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
  if (!currentUser) { window.location.href = 'index.html'; }

  let entriesLimit = 10;
  let searchQuery  = '';
  let currentPage  = 1;
  let feedbackSitId = null;
  let feedbackLab   = null;

  // ── LOAD NOTIFICATIONS ──
  function loadNotifications() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const readKey       = `ccs_notif_read_${currentUser.idNumber}`;
    const lastRead      = parseInt(localStorage.getItem(readKey) || '0');
    const unread        = announcements.filter(a => a.id > lastRead);
    const badge         = document.getElementById('notifBadge');
    const menu          = document.getElementById('notifMenu');
    if (badge) {
      if (unread.length > 0) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = 'flex'; }
      else badge.style.display = 'none';
    }
    if (menu) {
      menu.innerHTML = '';
      if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No announcements yet</a></li>'; return; }
      [...announcements].reverse().forEach(a => {
        const li = document.createElement('li');
        const isNew = a.id > lastRead;
        li.innerHTML = `<a class="notif-item"><p class="notif-item-date">CCS Admin | ${a.date}${isNew ? ' 🔵' : ''}</p><p class="notif-item-text">${a.text}</p></a>`;
        menu.appendChild(li);
      });
      if (unread.length > 0) {
        const markLi = document.createElement('li');
        markLi.innerHTML = `<a class="notif-mark-read" id="markReadBtn">Mark all as read</a>`;
        menu.appendChild(markLi);
        document.getElementById('markReadBtn').addEventListener('click', (e) => {
          e.preventDefault();
          const latest = Math.max(...announcements.map(a => a.id || 0));
          localStorage.setItem(readKey, latest);
          loadNotifications();
        });
      }
    }
  }

  loadNotifications();

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('ccs_current_user');
    window.location.href = 'index.html';
  });

  // ── RENDER HISTORY TABLE ──
  function renderHistory() {
    const allSitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
    // Only show this student's sit-ins
    const mySitins  = allSitins.filter(s => s.idNumber === currentUser.idNumber);

    const filtered = mySitins.filter(s => {
      const str = `${s.purpose || ''} ${s.lab || ''} ${s.date || ''}`.toLowerCase();
      return str.includes(searchQuery.toLowerCase());
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / entriesLimit));
    if (currentPage > totalPages) currentPage = totalPages;

    const start = (currentPage - 1) * entriesLimit;
    const shown = filtered.slice(start, start + entriesLimit);

    historyTableBody.innerHTML = '';

    if (shown.length === 0) {
      historyTableBody.innerHTML = `<tr><td colspan="8" class="table-empty">No sit-in history found.</td></tr>`;
    } else {
      shown.forEach(s => {
        const tr = document.createElement('tr');
        // Show Feedback button only for done sessions
        const actionBtn = s.status === 'done'
          ? `<button class="btn-feedback" onclick="openFeedback('${s.sitId}', '${s.lab || ''}')">Feedback</button>`
          : `<span style="font-size:12px;color:#aaa;">Active</span>`;

        tr.innerHTML = `
          <td>${s.idNumber}</td>
          <td>${currentUser.firstName} ${currentUser.lastName}</td>
          <td>${s.purpose || '—'}</td>
          <td>${s.lab     || '—'}</td>
          <td>${s.timeIn  || '—'}</td>
          <td>${s.timeOut || '—'}</td>
          <td>${s.date    || '—'}</td>
          <td>${actionBtn}</td>`;
        historyTableBody.appendChild(tr);
      });
    }

    const from = filtered.length === 0 ? 0 : start + 1;
    const to   = Math.min(start + entriesLimit, filtered.length);
    document.getElementById('entriesInfo').textContent =
      filtered.length === 0
        ? 'Showing 0 entries'
        : `Showing ${from} to ${to} of ${filtered.length} entries`;

    buildHistoryPagination(totalPages);
  }

  function buildHistoryPagination(totalPages) {
    const pg = document.getElementById('pagination');
    pg.innerHTML = '';

    const prev = document.createElement('button');
    prev.className = 'page-btn'; prev.innerHTML = '&#171;'; prev.disabled = currentPage === 1;
    prev.addEventListener('click', () => { if (currentPage > 1) { currentPage--; renderHistory(); } });
    pg.appendChild(prev);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.className = `page-btn${i === currentPage ? ' active' : ''}`;
      btn.textContent = i;
      btn.addEventListener('click', () => { currentPage = i; renderHistory(); });
      pg.appendChild(btn);
    }

    const next = document.createElement('button');
    next.className = 'page-btn'; next.innerHTML = '&#187;'; next.disabled = currentPage === totalPages;
    next.addEventListener('click', () => { if (currentPage < totalPages) { currentPage++; renderHistory(); } });
    pg.appendChild(next);
  }

  document.getElementById('entriesPerPage').addEventListener('change', (e) => {
    entriesLimit = parseInt(e.target.value); currentPage = 1; renderHistory();
  });
  document.getElementById('tableSearchInput').addEventListener('input', (e) => {
    searchQuery = e.target.value; currentPage = 1; renderHistory();
  });

  renderHistory();

  // ── FEEDBACK MODAL ──
  const feedbackOverlay = document.getElementById('feedbackOverlay');

  window.openFeedback = function(sitId, lab) {
    feedbackSitId = sitId;
    feedbackLab   = lab;
    document.getElementById('feedbackLab').value     = lab || '—';
    document.getElementById('feedbackMessage').value = '';
    feedbackOverlay.classList.add('active');
  };

  document.getElementById('closeFeedbackBtn').addEventListener('click',  () => feedbackOverlay.classList.remove('active'));
  document.getElementById('cancelFeedbackBtn').addEventListener('click', () => feedbackOverlay.classList.remove('active'));
  feedbackOverlay.addEventListener('click', (e) => { if (e.target === feedbackOverlay) feedbackOverlay.classList.remove('active'); });

  document.getElementById('submitFeedbackBtn').addEventListener('click', () => {
    const message = document.getElementById('feedbackMessage').value.trim();
    if (!message) { alert('Please write your feedback message.'); return; }

    const feedbacks = JSON.parse(localStorage.getItem('ccs_feedbacks') || '[]');
    feedbacks.push({
      id:       Date.now(),
      idNumber: currentUser.idNumber,
      sitId:    feedbackSitId,
      lab:      feedbackLab,
      message:  message,
      date:     getNow(),
    });
    localStorage.setItem('ccs_feedbacks', JSON.stringify(feedbacks));

    feedbackOverlay.classList.remove('active');
    showPopup({
      title:   'Feedback Sent!',
      message: 'Your feedback has been submitted to the admin.',
      btnText: 'OK',
      type:    'success',
    });
  });
}


// ======================================
//  LEADERBOARD (leaderboard.html)
// ======================================

const leaderboardTableBody = document.getElementById('leaderboardTableBody');
if (leaderboardTableBody) {
  const currentUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
  if (!currentUser) { window.location.href = 'index.html'; }

  // ── NOTIFICATIONS ──
  function loadNotifLeaderboard() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const readKey  = `ccs_notif_read_${currentUser.idNumber}`;
    const lastRead = parseInt(localStorage.getItem(readKey) || '0');
    const unread   = announcements.filter(a => a.id > lastRead);
    const badge    = document.getElementById('notifBadge');
    const menu     = document.getElementById('notifMenu');
    if (badge) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = unread.length > 0 ? 'flex' : 'none'; }
    if (menu) {
      menu.innerHTML = '';
      if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No announcements yet</a></li>'; return; }
      [...announcements].reverse().forEach(a => {
        const li = document.createElement('li');
        const isNew = a.id > lastRead;
        li.innerHTML = `<a class="notif-item"><p class="notif-item-date">CCS Admin | ${a.date}${isNew?' 🔵':''}</p><p class="notif-item-text">${a.text}</p></a>`;
        menu.appendChild(li);
      });
      if (unread.length > 0) {
        const markLi = document.createElement('li');
        markLi.innerHTML = `<a class="notif-mark-read" id="markReadBtn">Mark all as read</a>`;
        menu.appendChild(markLi);
        document.getElementById('markReadBtn').addEventListener('click', (e) => {
          e.preventDefault();
          const latest = Math.max(...announcements.map(a => a.id || 0));
          localStorage.setItem(readKey, latest);
          loadNotifLeaderboard();
        });
      }
    }
  }

  loadNotifLeaderboard();

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_current_user'); window.location.href = 'index.html'; });

  // ── BUILD LEADERBOARD ──
  const users  = JSON.parse(localStorage.getItem('ccs_users')  || '[]');
  const sitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');

  // Calculate sit-in count and points per student (1 point per completed sit-in)
  const studentStats = users.map(u => {
    const mySitins   = sitins.filter(s => s.idNumber === u.idNumber && s.status === 'done');
    const sitinCount = mySitins.length;
    const points     = sitinCount; // 1 point per sit-in
    return { ...u, sitinCount, points };
  });

  // Sort by points descending
  studentStats.sort((a, b) => b.points - a.points);

  // Render table
  leaderboardTableBody.innerHTML = '';

  if (studentStats.length === 0) {
    leaderboardTableBody.innerHTML = `<tr><td colspan="5" class="lb-empty">No students registered yet.</td></tr>`;
  } else {
    studentStats.forEach((u, idx) => {
      const rank    = idx + 1;
      const isMe    = u.idNumber === currentUser.idNumber;
      const tr      = document.createElement('tr');
      if (isMe) tr.className = 'lb-my-row';

      // Medal
      let medalClass = 'normal';
      let medalContent = rank;
      if (rank === 1) { medalClass = 'gold';   medalContent = '🥇'; }
      if (rank === 2) { medalClass = 'silver';  medalContent = '🥈'; }
      if (rank === 3) { medalClass = 'bronze';  medalContent = '🥉'; }

      const youBadge = isMe ? '<span class="lb-you-badge">You</span>' : '';

      tr.innerHTML = `
        <td><div class="lb-rank-medal ${medalClass}">${medalContent}</div></td>
        <td>${u.firstName} ${u.lastName}${youBadge}</td>
        <td>${u.course}</td>
        <td>${u.sitinCount}</td>
        <td><span class="lb-points-badge">${u.points}</span></td>`;
      leaderboardTableBody.appendChild(tr);
    });
  }

  // ── YOUR RANKING ──
  const myStats = studentStats.find(u => u.idNumber === currentUser.idNumber);
  const myRank  = myStats ? studentStats.indexOf(myStats) + 1 : '—';

  document.getElementById('lbRankNumber').textContent    = myRank ? `#${myRank}` : '#—';
  document.getElementById('lbPoints').textContent        = myStats ? myStats.points     : 0;
  document.getElementById('lbSitins').textContent        = myStats ? myStats.sitinCount : 0;
  document.getElementById('lbTotalStudents').textContent = users.length;
}


// ======================================
//  MY SUMMARY (mysummary.html)
// ======================================

const summaryMain = document.querySelector('.summary-main');
if (summaryMain) {
  const currentUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
  if (!currentUser) { window.location.href = 'index.html'; }

  // Notifications
  function loadNotifSummary() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const readKey  = `ccs_notif_read_${currentUser.idNumber}`;
    const lastRead = parseInt(localStorage.getItem(readKey) || '0');
    const unread   = announcements.filter(a => a.id > lastRead);
    const badge    = document.getElementById('notifBadge');
    const menu     = document.getElementById('notifMenu');
    if (badge) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = unread.length > 0 ? 'flex' : 'none'; }
    if (menu) {
      menu.innerHTML = '';
      if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No announcements yet</a></li>'; return; }
      [...announcements].reverse().forEach(a => {
        const li = document.createElement('li');
        const isNew = a.id > lastRead;
        li.innerHTML = `<a class="notif-item"><p class="notif-item-date">CCS Admin | ${a.date}${isNew?' 🔵':''}</p><p class="notif-item-text">${a.text}</p></a>`;
        menu.appendChild(li);
      });
    }
  }
  loadNotifSummary();

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_current_user'); window.location.href = 'index.html'; });

  // ── GET DATA ──
  const allSitins  = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  const mySitins   = allSitins.filter(s => s.idNumber === currentUser.idNumber);
  const doneSitins = mySitins.filter(s => s.status === 'done');
  const sessions   = currentUser.sessions !== undefined ? currentUser.sessions : 30;
  const used       = 30 - sessions;
  const points     = doneSitins.length;

  // ── STAT CARDS ──
  document.getElementById('statTotalSitins').textContent = doneSitins.length;
  document.getElementById('statTotalPoints').textContent = points;

  // Avg session — average lab time if timeIn/timeOut recorded
  const timed = doneSitins.filter(s => s.timeIn && s.timeOut);
  if (timed.length > 0) {
    const totalMins = timed.reduce((acc, s) => {
      const parseTime = t => { const [h,m,rest] = t.split(':'); const sec = rest ? parseInt(rest) : 0; const pm = t.toLowerCase().includes('pm'); const hr = parseInt(h) + (pm && parseInt(h) !== 12 ? 12 : 0); return hr * 60 + parseInt(m) + sec/60; };
      return acc + Math.abs(parseTime(s.timeOut) - parseTime(s.timeIn));
    }, 0);
    const avgMins = Math.round(totalMins / timed.length);
    document.getElementById('statTotalHours').textContent = `${Math.floor(totalMins/60)}h ${Math.round(totalMins%60)}m`;
    document.getElementById('statAvgSession').textContent = `${avgMins}m`;
  }

  // ── RECENT ACTIVITY ──
  const activityList = document.getElementById('activityList');
  if (mySitins.length === 0) {
    activityList.innerHTML = '<p class="summary-empty">No sit-in records yet.</p>';
  } else {
    activityList.innerHTML = '';
    [...mySitins].reverse().slice(0, 20).forEach(s => {
      const item = document.createElement('div');
      item.className = 'summary-activity-item';
      const dotClass = s.status === 'done' ? 'done' : 'active';
      item.innerHTML = `
        <div class="summary-activity-dot ${dotClass}"></div>
        <div class="summary-activity-info">
          <p class="summary-activity-purpose">${s.purpose || '—'} &nbsp;·&nbsp; Lab ${s.lab || '—'}</p>
          <p class="summary-activity-meta">${s.timeIn || '—'} → ${s.timeOut || 'Active'}</p>
        </div>
        <span class="summary-activity-date">${s.date || '—'}</span>`;
      activityList.appendChild(item);
    });
  }

  // ── GAUGE CHART ──
  document.getElementById('gaugeNumber').textContent  = sessions;
  document.getElementById('sessUsed').textContent      = used;
  document.getElementById('sessTotal').textContent     = 30;
  document.getElementById('sessRemaining').textContent = sessions;

  const gaugeCtx  = document.getElementById('gaugeChart').getContext('2d');
  const pct       = sessions / 30;
  new Chart(gaugeCtx, {
    type: 'doughnut',
    data: {
      datasets: [{
        data: [sessions, 30 - sessions],
        backgroundColor: ['#4caf50', '#e8edf5'],
        borderWidth: 0,
        circumference: 180,
        rotation: 270,
      }]
    },
    options: {
      responsive: false,
      cutout: '75%',
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
    }
  });

  // ── SIT-IN BY PURPOSE ──
  const purposeWrap = document.getElementById('purposeWrap');
  const purposeCounts = {};
  doneSitins.forEach(s => { const k = s.purpose || 'Other'; purposeCounts[k] = (purposeCounts[k] || 0) + 1; });

  if (Object.keys(purposeCounts).length === 0) {
    purposeWrap.innerHTML = '<p class="summary-empty">No data yet.</p>';
  } else {
    purposeWrap.innerHTML = '';
    const max = Math.max(...Object.values(purposeCounts));
    Object.entries(purposeCounts).sort((a,b) => b[1]-a[1]).forEach(([label, count]) => {
      const pct = Math.round((count / max) * 100);
      const row = document.createElement('div');
      row.className = 'summary-purpose-bar-row';
      row.innerHTML = `
        <span class="summary-purpose-label">${label}</span>
        <div class="summary-purpose-bar-bg">
          <div class="summary-purpose-bar-fill" style="width:${pct}%"></div>
        </div>
        <span class="summary-purpose-count">${count}</span>`;
      purposeWrap.appendChild(row);
    });
  }
}


// ======================================
//  LAB STATUS (labstatus.html)
// ======================================

const labsGrid = document.getElementById('labsGrid');
if (labsGrid) {
  const currentUser = JSON.parse(localStorage.getItem('ccs_current_user') || 'null');
  if (!currentUser) { window.location.href = 'index.html'; }

  // ── NOTIFICATIONS ──
  function loadNotifLab() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const readKey  = `ccs_notif_read_${currentUser.idNumber}`;
    const lastRead = parseInt(localStorage.getItem(readKey) || '0');
    const unread   = announcements.filter(a => a.id > lastRead);
    const badge    = document.getElementById('notifBadge');
    const menu     = document.getElementById('notifMenu');
    if (badge) { badge.textContent = unread.length > 9 ? '9+' : unread.length; badge.style.display = unread.length > 0 ? 'flex' : 'none'; }
    if (menu) {
      menu.innerHTML = '';
      if (!announcements.length) { menu.innerHTML = '<li><a class="notif-empty">No announcements yet</a></li>'; return; }
      [...announcements].reverse().forEach(a => {
        const li = document.createElement('li');
        const isNew = a.id > lastRead;
        li.innerHTML = `<a class="notif-item"><p class="notif-item-date">CCS Admin | ${a.date}${isNew?' 🔵':''}</p><p class="notif-item-text">${a.text}</p></a>`;
        menu.appendChild(li);
      });
      if (unread.length > 0) {
        const markLi = document.createElement('li');
        markLi.innerHTML = `<a class="notif-mark-read" id="markReadBtn">Mark all as read</a>`;
        menu.appendChild(markLi);
        document.getElementById('markReadBtn').addEventListener('click', (e) => {
          e.preventDefault();
          const latest = Math.max(...announcements.map(a => a.id || 0));
          localStorage.setItem(readKey, latest);
          loadNotifLab();
        });
      }
    }
  }
  loadNotifLab();

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', (e) => {
    e.preventDefault(); localStorage.removeItem('ccs_current_user'); window.location.href = 'index.html';
  });

  // ── LABS CONFIG ──
  const LABS = [
    { id: '524', name: 'Laboratory 524', total: 40 },
    { id: '525', name: 'Laboratory 525', total: 40 },
    { id: '526', name: 'Laboratory 526', total: 40 },
    { id: '527', name: 'Laboratory 527', total: 40 },
    { id: '528', name: 'Laboratory 528', total: 40 },
  ];

  // ── RENDER LABS ──
  function renderLabs() {
    const sitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
    const activeSitins = sitins.filter(s => s.status === 'active');

    labsGrid.innerHTML = '';

    LABS.forEach(lab => {
      // Count active sit-ins in this lab
      const inUse = activeSitins.filter(s => s.lab === lab.id).length;
      const free  = lab.total - inUse;

      const card = document.createElement('div');
      card.className = 'lab-card';
      card.innerHTML = `
        <div class="lab-card-header">
          <span class="lab-card-icon">&#128187;</span>
          <div>
            <p class="lab-card-name">${lab.name}</p>
            <p class="lab-card-pcs">${inUse} / ${lab.total} PCs available</p>
          </div>
        </div>
        <div class="lab-card-footer">
          <span class="lab-free-count">${free} free</span>
          <span class="lab-inuse-count">${inUse} in use</span>
        </div>`;
      labsGrid.appendChild(card);
    });

    // Update last updated time
    const now = new Date();
    document.getElementById('lastUpdated').textContent = now.toLocaleTimeString();
  }

  renderLabs();

  // Auto-refresh every 30 seconds
  setInterval(renderLabs, 30000);
}


// ======================================
//  ADMIN ANALYTICS (admin-analytics.html)
// ======================================

const analyticsMain = document.querySelector('.analytics-main');
if (analyticsMain) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  const users  = JSON.parse(localStorage.getItem('ccs_users')  || '[]');
  const sitins = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  const done   = sitins.filter(s => s.status === 'done');
  const active = sitins.filter(s => s.status === 'active');

  // ── STAT CARDS ──
  document.getElementById('aStatStudents').textContent = users.length;
  document.getElementById('aStatSitins').textContent   = sitins.length;
  document.getElementById('aStatActive').textContent   = active.length;

  // ── COLORS ──
  const COLORS = ['#2b7de9','#f0a500','#4caf50','#e05c5c','#9c5cf0','#00bcd4','#ff7043','#8bc34a'];

  // ── SIT-INS OVER TIME CHART ──
  let timeChart = null;

  function buildTimeChart(mode) {
    const ctx = document.getElementById('timeChart').getContext('2d');
    if (timeChart) timeChart.destroy();

    const now   = new Date();
    let labels  = [];
    let counts  = [];

    if (mode === 'daily') {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
        labels.push(key.slice(5)); // MM-DD
        counts.push(sitins.filter(s => s.date === key).length);
      }
    } else if (mode === 'weekly') {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - (i * 7 + 6));
        const end   = new Date(now);
        end.setDate(end.getDate() - (i * 7));
        const label = `W${4-i}`;
        labels.push(label);
        counts.push(sitins.filter(s => {
          if (!s.date) return false;
          const d = new Date(s.date);
          return d >= start && d <= end;
        }).length);
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        labels.push(key.slice(2));
        counts.push(sitins.filter(s => s.date && s.date.startsWith(key)).length);
      }
    }

    timeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data: counts,
          borderColor: '#2b7de9',
          backgroundColor: 'rgba(43,125,233,0.08)',
          borderWidth: 2,
          pointBackgroundColor: '#2b7de9',
          pointRadius: 4,
          tension: 0.3,
          fill: true,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
          x: { ticks: { font: { size: 11 } } }
        }
      }
    });
  }

  buildTimeChart('daily');

  // Time filter buttons
  ['btnDaily','btnWeekly','btnMonthly'].forEach((id, idx) => {
    const modes = ['daily','weekly','monthly'];
    document.getElementById(id).addEventListener('click', () => {
      document.querySelectorAll('.analytics-time-btn').forEach(b => b.classList.remove('active'));
      document.getElementById(id).classList.add('active');
      buildTimeChart(modes[idx]);
    });
  });

  // ── BY PURPOSE CHART ──
  const purposeCounts = {};
  sitins.forEach(s => { const k = s.purpose || 'Other'; purposeCounts[k] = (purposeCounts[k] || 0) + 1; });

  new Chart(document.getElementById('purposeChart').getContext('2d'), {
    type: 'doughnut',
    data: {
      labels: Object.keys(purposeCounts).length ? Object.keys(purposeCounts) : ['No data'],
      datasets: [{
        data: Object.keys(purposeCounts).length ? Object.values(purposeCounts) : [1],
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'bottom', labels: { font: { size: 10 }, boxWidth: 12, padding: 8 } } }
    }
  });

  // ── BY LAB CHART ──
  const labCounts = {};
  sitins.forEach(s => { const k = `Lab ${s.lab||'?'}`; labCounts[k] = (labCounts[k] || 0) + 1; });

  new Chart(document.getElementById('labChart2').getContext('2d'), {
    type: 'bar',
    data: {
      labels: Object.keys(labCounts).length ? Object.keys(labCounts) : ['No data'],
      datasets: [{
        data: Object.keys(labCounts).length ? Object.values(labCounts) : [0],
        backgroundColor: COLORS,
        borderRadius: 4,
        borderWidth: 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1, font: { size: 11 } } },
        x: { ticks: { font: { size: 11 } } }
      }
    }
  });

  // ── TOP STUDENTS TABLE ──
  const studentStats = users.map(u => {
    const mySitins   = done.filter(s => s.idNumber === u.idNumber);
    return { ...u, sitinCount: mySitins.length, points: mySitins.length };
  }).sort((a, b) => b.points - a.points);

  const topBody = document.getElementById('analyticsTopStudents');
  if (studentStats.length === 0) {
    topBody.innerHTML = `<tr><td colspan="5" class="table-empty">No data yet.</td></tr>`;
  } else {
    studentStats.slice(0, 10).forEach((u, idx) => {
      const rank   = idx + 1;
      const medal  = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
      const tr     = document.createElement('tr');
      tr.innerHTML = `
        <td><span class="a-medal">${medal}</span></td>
        <td>
          <div>${u.firstName} ${u.lastName}</div>
          <div class="a-student-id">${u.idNumber}</div>
        </td>
        <td>${u.course}</td>
        <td>${u.sitinCount}</td>
        <td><span class="a-points-badge">${u.points} pts</span></td>`;
      topBody.appendChild(tr);
    });
  }

  // ── BY COURSE TABLE ──
  const courseCounts = {};
  const courseSitins = {};
  users.forEach(u => {
    courseCounts[u.course] = (courseCounts[u.course] || 0) + 1;
  });
  done.forEach(s => {
    const user = users.find(u => u.idNumber === s.idNumber);
    if (user) { courseSitins[user.course] = (courseSitins[user.course] || 0) + 1; }
  });

  const courseBody    = document.getElementById('analyticsByCourse');
  const totalStudents = users.length || 1;

  if (Object.keys(courseCounts).length === 0) {
    courseBody.innerHTML = `<tr><td colspan="4" class="table-empty">No data yet.</td></tr>`;
  } else {
    Object.entries(courseCounts).forEach(([course, count]) => {
      const sits = courseSitins[course] || 0;
      const pct  = Math.round((count / totalStudents) * 100);
      const tr   = document.createElement('tr');
      tr.innerHTML = `
        <td>${course}</td>
        <td>${count}</td>
        <td>${sits}</td>
        <td>
          <div class="a-share-bar-bg">
            <div class="a-share-bar-fill" style="width:${pct}%"></div>
          </div>
        </td>`;
      courseBody.appendChild(tr);
    });
  }

  // ── EXPORT CSV ──
  document.getElementById('exportCsvAnalytics').addEventListener('click', () => {
    if (!studentStats.length) { alert('No data to export.'); return; }
    let csv = 'Rank,ID Number,Name,Course,Sit-ins,Points\n';
    studentStats.forEach((u, i) => {
      csv += `${i+1},${u.idNumber},"${u.firstName} ${u.lastName}",${u.course},${u.sitinCount},${u.points}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'analytics-report.csv'; a.click();
    URL.revokeObjectURL(url);
  });

  initSearchModal();
}


// ======================================
//  ADMIN SOFTWARE (admin-software.html)
// ======================================

const uploadSwBtn = document.getElementById('uploadSwBtn');
if (uploadSwBtn) {
  if (!localStorage.getItem('ccs_admin')) { window.location.href = 'index.html'; }

  const adminLogoutBtn = document.getElementById('adminLogoutBtn');
  if (adminLogoutBtn) adminLogoutBtn.addEventListener('click', (e) => { e.preventDefault(); localStorage.removeItem('ccs_admin'); window.location.href = 'index.html'; });

  const LABS = ['524','525','526','527','528'];

  // ── DROP ZONE ──
  const dropZone  = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const fileDisplay = document.getElementById('fileNameDisplay');

  dropZone.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) fileDisplay.textContent = '📎 ' + fileInput.files[0].name;
  });
  dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) fileDisplay.textContent = '📎 ' + e.dataTransfer.files[0].name;
  });

  // ── RENDER REGISTERED LIST ──
  function renderRegistered(filter = '') {
    const softwares = JSON.parse(localStorage.getItem('ccs_softwares') || '[]');
    const list      = document.getElementById('registeredList');
    const filtered  = softwares.filter(s =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      (s.category || '').toLowerCase().includes(filter.toLowerCase())
    );

    list.innerHTML = '';
    if (filtered.length === 0) {
      list.innerHTML = `<div class="software-empty-state"><span style="font-size:40px;">&#128188;</span><p>No software registered yet.</p></div>`;
      return;
    }

    filtered.forEach(s => {
      const item = document.createElement('div');
      item.className = 'software-reg-item';
      item.innerHTML = `
        <div class="software-reg-info">
          <p class="software-reg-name">${s.name}</p>
          <p class="software-reg-meta">${s.category || 'Uncategorized'} ${s.desc ? '· ' + s.desc.slice(0,40) + (s.desc.length>40?'…':'') : ''}</p>
          <p class="software-reg-labs">Labs: ${s.labs && s.labs.length ? s.labs.map(l=>'Lab '+l).join(', ') : 'None'}</p>
        </div>
        <button class="software-reg-delete" onclick="deleteSoftware(${s.id})" title="Delete">&#128465;</button>`;
      list.appendChild(item);
    });
  }

  // ── RENDER LAB OVERVIEW ──
  function renderLabOverview() {
    const softwares = JSON.parse(localStorage.getItem('ccs_softwares') || '[]');
    const overview  = document.getElementById('labsOverview');
    overview.innerHTML = '';

    LABS.forEach(lab => {
      const count = softwares.filter(s => s.labs && s.labs.includes(lab)).length;
      const tile  = document.createElement('div');
      tile.className = 'software-lab-tile';
      tile.innerHTML = `
        <p class="software-lab-tile-name">LAB ${lab}</p>
        <p class="software-lab-tile-count">${count}</p>
        <p class="software-lab-tile-label">SOFTWARE</p>`;
      overview.appendChild(tile);
    });
  }

  renderRegistered();
  renderLabOverview();

  // ── SEARCH ──
  document.getElementById('swSearchInput').addEventListener('input', (e) => {
    renderRegistered(e.target.value);
  });

  // ── DELETE SOFTWARE ──
  window.deleteSoftware = function(id) {
    if (!confirm('Delete this software?')) return;
    let softwares = JSON.parse(localStorage.getItem('ccs_softwares') || '[]');
    softwares = softwares.filter(s => s.id !== id);
    localStorage.setItem('ccs_softwares', JSON.stringify(softwares));
    renderRegistered(document.getElementById('swSearchInput').value);
    renderLabOverview();
  };

  // ── UPLOAD & REGISTER ──
  uploadSwBtn.addEventListener('click', () => {
    const name     = document.getElementById('swName').value.trim();
    const category = document.getElementById('swCategory').value;
    const desc     = document.getElementById('swDesc').value.trim();
    const labs     = [...document.querySelectorAll('.sw-lab-check:checked')].map(c => c.value);

    if (!name) { alert('Please enter a software / file name.'); return; }
    if (!category) { alert('Please select a category.'); return; }

    const softwares = JSON.parse(localStorage.getItem('ccs_softwares') || '[]');
    softwares.push({
      id:       Date.now(),
      name,
      category,
      desc,
      labs,
      date:     getNow(),
    });
    localStorage.setItem('ccs_softwares', JSON.stringify(softwares));

    // Clear form
    document.getElementById('swName').value     = '';
    document.getElementById('swCategory').value = '';
    document.getElementById('swDesc').value     = '';
    document.querySelectorAll('.sw-lab-check').forEach(c => c.checked = false);
    fileDisplay.textContent = '';

    renderRegistered(document.getElementById('swSearchInput').value);
    renderLabOverview();

    showPopup({
      title:   'Software Registered!',
      message: `<strong>${name}</strong> has been added successfully.`,
      btnText: 'OK',
      type:    'success',
    });
  });

  initSearchModal();
}