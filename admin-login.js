// =====================================================================
// STAFF PASSCODE — change this before giving the site to a client.
// This is a simple deterrent for a static site with no backend, not
// real security (anyone who reads this file can see the passcode).
// If you want real login protection, this page needs a small backend.
// =====================================================================
const ADMIN_PASSCODE = 'altintug2026';
const UNLOCK_KEY = 'altintug_admin_unlocked';

const lockForm = document.getElementById('lockForm');
const lockError = document.getElementById('lockError');

lockForm.addEventListener('submit', e=>{
  e.preventDefault();
  const val = document.getElementById('lockPass').value;
  if(val === ADMIN_PASSCODE){
    lockError.classList.remove('show');
    sessionStorage.setItem(UNLOCK_KEY, '1');
    location.href = 'admin.html';
  } else {
    lockError.classList.add('show');
    document.getElementById('lockPass').value = '';
  }
});
