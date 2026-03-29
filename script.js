// ======================================
//  SHARED HELPERS
// ======================================

function showError(input, message) {
  input.classList.add('input-error');
  const err = document.createElement('span');
  err.className   = 'error-msg';
  err.textContent = message;
  input.closest('.ep-group, .form-group') && input.closest('.ep-group, .form-group').appendChild(err);
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
      target.type = 'text';
      btn.style.color = '#2b7de9';
    } else {
      target.type = 'password';
      btn.style.color = '#999';
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
        <path fill="none" stroke="#2b7de9" stroke-width="2.5" stroke-linecap="round"
          d="M12 40 q2 -10 14 -10 q12 0 14 10"/>
      </svg>`
    : `<svg viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
        <circle cx="26" cy="26" r="25" fill="none" stroke="#4caf50" stroke-width="2"/>
        <path fill="none" stroke="#4caf50" stroke-width="3"
          stroke-linecap="round" stroke-linejoin="round"
          d="M14 27 l9 9 l16 -16"/>
      </svg>`;

  overlay.innerHTML = `
    <div class="popup-box">
      <div class="popup-icon popup-icon--${type}">${icon}</div>
      <h2 class="popup-title">${title}</h2>
      <p class="popup-msg">${message}</p>
      <button class="popup-btn popup-btn--${type}" id="popupOkBtn">${btnText}</button>
    </div>
  `;

  document.body.appendChild(overlay);
  requestAnimationFrame(() => overlay.classList.add('active'));

  document.getElementById('popupOkBtn').addEventListener('click', () => {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.remove();
      if (redirectUrl) window.location.href = redirectUrl;
    }, 300);
  });
}

function getNow() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
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
    if (!pwInput.value.trim()) { showError(pwInput, 'Please enter your password.');  valid = false; }
    if (!valid) return;

    // Check admin credentials first
    const ADMIN_ID = 'admin';
    const ADMIN_PW = 'admin123';
    if (idInput.value.trim() === ADMIN_ID && pwInput.value === ADMIN_PW) {
      localStorage.setItem('ccs_admin', 'true');
      showPopup({
        title: 'Admin Login!',
        message: 'Welcome, <strong>CCS Admin</strong>!',
        btnText: 'Go to Admin Panel',
        redirectUrl: 'admin.html',
        type: 'success',
      });
      return;
    }

    const users = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const user  = users.find(u => u.idNumber === idInput.value.trim());

    if (!user) { showError(idInput, 'ID number not found. Please register first.'); return; }
    if (user.password !== pwInput.value) { showError(pwInput, 'Incorrect password. Please try again.'); return; }

    localStorage.setItem('ccs_current_user', JSON.stringify(user));
    showPopup({
      title:       'Successful Login!',
      message:     `Welcome! <strong>${user.firstName} ${user.lastName}</strong>`,
      btnText:     'OK',
      redirectUrl: 'dashboard.html',
      type:        'success',
    });
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

    if (!email.value.trim()) {
      showError(email, 'Email address is required.'); valid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email.'); valid = false;
    }
    if (!password.value) {
      showError(password, 'Password is required.'); valid = false;
    } else if (password.value.length < 6) {
      showError(password, 'Password must be at least 6 characters.'); valid = false;
    }
    if (!repeatPw.value) {
      showError(repeatPw, 'Please confirm your password.'); valid = false;
    } else if (password.value !== repeatPw.value) {
      showError(repeatPw, 'Passwords do not match.'); valid = false;
    }

    if (!valid) return;

    const users  = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const exists = users.find(u => u.idNumber === idNumber.value.trim());
    if (exists) { showError(idNumber, 'This ID number is already registered.'); return; }

    const newUser = {
      idNumber:   idNumber.value.trim(),
      lastName:   lastName.value.trim(),
      firstName:  firstName.value.trim(),
      middleName: middleName.value.trim(),
      course:     course.value,
      yearLevel:  yearLevel.value,
      email:      email.value.trim(),
      address:    address.value.trim(),
      password:   password.value,
      username:   '',
      sessions:   0,
    };

    users.push(newUser);
    localStorage.setItem('ccs_users', JSON.stringify(users));

    showPopup({
      title:       'Registered Successfully!',
      message:     `Welcome, <strong>${newUser.firstName} ${newUser.lastName}</strong>!<br/>You can now log in.`,
      btnText:     'Go to Login',
      redirectUrl: 'index.html',
      type:        'register',
    });
  }
}


// ======================================
//  DASHBOARD PAGE (dashboard.html)
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
    document.getElementById('infoSession').textContent = currentUser.sessions  || 0;

    // Load announcements from admin into dashboard
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const list = document.getElementById('announcementList');
    if (list && announcements.length > 0) {
      list.innerHTML = '';
      announcements.forEach(a => {
        const item = document.createElement('div');
        item.className = 'announcement-item';
        item.innerHTML = `<p class="announce-author">CCS Admin | ${a.date}</p>
                          <p class="announce-body">${a.text}</p>`;
        list.appendChild(item);
      });
    }
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('ccs_current_user');
      window.location.href = 'index.html';
    });
  }
}


// ======================================
//  EDIT PROFILE PAGE (edit-profile.html)
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

    if (!email.value.trim()) {
      showError(email, 'Email address is required.'); valid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError(email, 'Please enter a valid email.'); valid = false;
    }

    if (newPw.value || confirmPw.value) {
      if (newPw.value.length < 6) { showError(newPw, 'New password must be at least 6 characters.'); valid = false; }
      if (newPw.value !== confirmPw.value) { showError(confirmPw, 'Passwords do not match.'); valid = false; }
    }

    if (!valid) return;

    const users     = JSON.parse(localStorage.getItem('ccs_users') || '[]');
    const userIndex = users.findIndex(u => u.idNumber === currentUser.idNumber);

    const updatedUser = {
      ...currentUser,
      lastName:   lastName.value.trim(),
      firstName:  firstName.value.trim(),
      middleName: document.getElementById('epMiddleName').value.trim(),
      course:     course.value,
      yearLevel:  yearLevel.value,
      email:      email.value.trim(),
      address:    address.value.trim(),
      username:   username.value.trim(),
      password:   newPw.value ? newPw.value : currentUser.password,
    };

    if (userIndex !== -1) users[userIndex] = updatedUser;
    localStorage.setItem('ccs_users', JSON.stringify(users));
    localStorage.setItem('ccs_current_user', JSON.stringify(updatedUser));

    showPopup({
      title:       'Profile Updated!',
      message:     'Your profile has been saved successfully.',
      btnText:     'Back to Dashboard',
      redirectUrl: 'dashboard.html',
      type:        'success',
    });
  });

  const epCancelBtn = document.getElementById('epCancelBtn');
  if (epCancelBtn) epCancelBtn.addEventListener('click', () => { window.location.href = 'dashboard.html'; });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('ccs_current_user');
      window.location.href = 'index.html';
    });
  }
}


// ======================================
//  ADMIN DASHBOARD (admin.html)
// ======================================

const adminLogoutBtn = document.getElementById('adminLogoutBtn');

if (adminLogoutBtn) {

  // Guard: redirect if not admin
  if (!localStorage.getItem('ccs_admin')) {
    window.location.href = 'index.html';
  }

  adminLogoutBtn.addEventListener('click', (e) => {
    e.preventDefault();
    localStorage.removeItem('ccs_admin');
    window.location.href = 'index.html';
  });

  // ── STATS ──
  const users    = JSON.parse(localStorage.getItem('ccs_users') || '[]');
  const sitIns   = JSON.parse(localStorage.getItem('ccs_sitins') || '[]');
  const currentSitIn = sitIns.filter(s => s.status === 'active').length;

  document.getElementById('statRegistered').textContent = users.length;
  document.getElementById('statCurrent').textContent    = currentSitIn;
  document.getElementById('statTotal').textContent      = sitIns.length;

  // ── PIE CHART ──
  const courseCounts = {};
  users.forEach(u => {
    courseCounts[u.course] = (courseCounts[u.course] || 0) + 1;
  });

  const chartLabels = Object.keys(courseCounts).length > 0
    ? Object.keys(courseCounts)
    : ['BSIT', 'BSCS', 'BSIS', 'ACT'];

  const chartData = Object.keys(courseCounts).length > 0
    ? Object.values(courseCounts)
    : [1, 1, 1, 1];

  const ctx = document.getElementById('sitinChart').getContext('2d');
  new Chart(ctx, {
    type: 'pie',
    data: {
      labels: chartLabels,
      datasets: [{
        data: chartData,
        backgroundColor: ['#2b7de9', '#e05c5c', '#f0a500', '#4caf50', '#9c5cf0'],
        borderWidth: 2,
        borderColor: '#fff',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: { font: { size: 12 }, boxWidth: 14 }
        }
      }
    }
  });

  // ── ANNOUNCEMENTS ──
  function renderAnnouncements() {
    const announcements = JSON.parse(localStorage.getItem('ccs_announcements') || '[]');
    const list = document.getElementById('postedList');
    if (!list) return;

    if (announcements.length === 0) {
      list.innerHTML = '<p class="posted-empty">No announcements yet.</p>';
      return;
    }

    list.innerHTML = '';
    // Show newest first
    [...announcements].reverse().forEach(a => {
      const item = document.createElement('div');
      item.className = 'posted-item';
      item.innerHTML = `
        <p class="posted-author">CCS Admin | ${a.date}</p>
        ${a.text ? `<p class="posted-body">${a.text}</p>` : ''}
      `;
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
}