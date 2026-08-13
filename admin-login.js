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
