const CUSTOM_KEY = 'altintug_customVehicles';
const BOOKINGS_KEY = 'altintug_bookings';
const REVIEWS_KEY = 'altintug_reviews';
const UNLOCK_KEY = 'altintug_admin_unlocked';

// ============ LOG OUT ============
document.getElementById('lockOut').addEventListener('click', ()=>{
  sessionStorage.removeItem(UNLOCK_KEY);
  location.href = 'admin-login.html';
});

// ============ THEME TOGGLE (shared look with main site) ============
document.getElementById('themeToggle').addEventListener('click', ()=>{
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
});

// ============ STORAGE HELPERS ============
function loadCustomVehicles(){
  try{
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.warn('Could not read custom vehicles', e);
    return [];
  }
}
function saveCustomVehicles(list){
  try{
    localStorage.setItem(CUSTOM_KEY, JSON.stringify(list));
    return true;
  }catch(e){
    console.warn('Could not save custom vehicles', e);
    showToast('Storage is full — try removing some photos or listings.');
    return false;
  }
}

function loadBookings(){
  try{
    const raw = localStorage.getItem(BOOKINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.warn('Could not read bookings', e);
    return [];
  }
}
function saveBookings(list){
  try{
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    return true;
  }catch(e){
    console.warn('Could not save bookings', e);
    return false;
  }
}

function loadReviews(){
  try{
    const raw = localStorage.getItem(REVIEWS_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.warn('Could not read reviews', e);
    return [];
  }
}
function saveReviews(list){
  try{
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(list));
    return true;
  }catch(e){
    console.warn('Could not save reviews', e);
    return false;
  }
}

// ============ TOAST ============
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 2600);
}

// ============ PHOTO HANDLING ============
let currentPhotos = []; // dataURLs for the vehicle currently being added/edited

function resizeImage(file, maxWidth = 900, quality = 0.72){
  return new Promise((resolve, reject)=>{
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const photoInput = document.getElementById('f-photos');
const photoPreview = document.getElementById('photoPreview');

photoInput.addEventListener('change', async () => {
  const files = Array.from(photoInput.files).slice(0, 8 - currentPhotos.length);
  for(const file of files){
    try{
      const dataUrl = await resizeImage(file);
      currentPhotos.push(dataUrl);
    }catch(e){
      console.warn('Could not process image', e);
    }
  }
  photoInput.value = '';
  renderPhotoPreview();
});

function renderPhotoPreview(){
  photoPreview.innerHTML = currentPhotos.map((src, i) => `
    <div class="thumb">
      <img src="${src}" alt="photo ${i+1}">
      <button type="button" data-idx="${i}" title="Remove">✕</button>
    </div>`).join('');
}
photoPreview.addEventListener('click', e=>{
  const btn = e.target.closest('button[data-idx]');
  if(!btn) return;
  currentPhotos.splice(Number(btn.dataset.idx), 1);
  renderPhotoPreview();
});

// ============ FORM: ADD / EDIT ============
const form = document.getElementById('vehicleForm');
const editingIdField = document.getElementById('editingId');
const submitBtn = document.getElementById('submitBtn');
const cancelEditBtn = document.getElementById('cancelEdit');
const formModeLabel = document.getElementById('formMode');

function resetForm(){
  form.reset();
  currentPhotos = [];
  renderPhotoPreview();
  editingIdField.value = '';
  submitBtn.textContent = 'Add to Inventory';
  cancelEditBtn.style.display = 'none';
  formModeLabel.textContent = 'Add a Vehicle';
}

cancelEditBtn.addEventListener('click', resetForm);

form.addEventListener('submit', e=>{
  e.preventDefault();

  const cats = Array.from(document.querySelectorAll('#catChecks input:checked')).map(c=>c.value);
  const price = Number(document.getElementById('f-price').value) || 0;

  const vehicle = {
    id: editingIdField.value || ('c' + Date.now()),
    name: document.getElementById('f-name').value.trim(),
    make: document.getElementById('f-make').value.trim(),
    year: Number(document.getElementById('f-year').value),
    mileage: document.getElementById('f-mileage').value.trim(),
    fuel: document.getElementById('f-fuel').value,
    trans: document.getElementById('f-trans').value.trim(),
    engine: document.getElementById('f-engine').value.trim(),
    color: document.getElementById('f-color').value.trim(),
    hp: document.getElementById('f-hp').value.trim(),
    price: price,
    finance: document.getElementById('f-finance').value.trim(),
    badge: document.getElementById('f-badge').value,
    tint: '#c9a227',
    cats: cats.length ? cats : ['new'],
    photos: currentPhotos.slice()
  };

  const list = loadCustomVehicles();
  const existingIdx = list.findIndex(v => v.id === vehicle.id);
  if(existingIdx > -1){
    list[existingIdx] = vehicle;
  } else {
    list.push(vehicle);
  }

  if(saveCustomVehicles(list)){
    showToast(existingIdx > -1 ? 'Listing updated' : 'Listing added — check the live site');
    resetForm();
    renderList();
  }
});

// ============ LISTINGS ============
const adminList = document.getElementById('adminList');

function carIconSVG(){
  return `<svg viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 74 C14 60 30 54 52 53 C64 36 88 20 122 17 C156 14 184 21 202 34 C222 32 232 44 232 58 L232 66 L14 66 Z" fill="none" stroke="var(--text-dim)" stroke-width="2.2"/>
    <circle cx="60" cy="76" r="13" fill="none" stroke="var(--text-dim)" stroke-width="2.2"/>
    <circle cx="186" cy="76" r="13" fill="none" stroke="var(--text-dim)" stroke-width="2.2"/>
  </svg>`;
}

function renderList(){
  const list = loadCustomVehicles();
  if(list.length === 0){
    adminList.innerHTML = '<div class="admin-list-empty">No listings added yet on this device. Use the form above to add your first car.</div>';
    return;
  }
  adminList.innerHTML = list.map(v => `
    <div class="admin-row" data-id="${v.id}">
      <div class="thumb">${v.photos && v.photos[0] ? `<img src="${v.photos[0]}" alt="${v.name}">` : carIconSVG()}</div>
      <div class="info">
        <div class="name">${v.name}</div>
        <div class="meta mono">${v.year} · $${(v.price||0).toLocaleString()} · ${v.badge}</div>
      </div>
      <div class="actions">
        <button type="button" data-action="edit">Edit</button>
        <button type="button" data-action="delete" class="danger">Delete</button>
      </div>
    </div>`).join('');
}

adminList.addEventListener('click', e=>{
  const row = e.target.closest('.admin-row');
  if(!row) return;
  const id = row.dataset.id;
  const action = e.target.closest('button')?.dataset.action;
  if(!action) return;

  const list = loadCustomVehicles();
  const vehicle = list.find(v => v.id === id);
  if(!vehicle) return;

  if(action === 'delete'){
    if(!confirm(`Remove "${vehicle.name}" from the live inventory?`)) return;
    saveCustomVehicles(list.filter(v => v.id !== id));
    showToast('Listing removed');
    renderList();
  } else if(action === 'edit'){
    document.getElementById('f-name').value = vehicle.name || '';
    document.getElementById('f-make').value = vehicle.make || '';
    document.getElementById('f-year').value = vehicle.year || '';
    document.getElementById('f-mileage').value = vehicle.mileage || '';
    document.getElementById('f-fuel').value = vehicle.fuel || 'Petrol';
    document.getElementById('f-trans').value = vehicle.trans || '';
    document.getElementById('f-engine').value = vehicle.engine || '';
    document.getElementById('f-color').value = vehicle.color || '';
    document.getElementById('f-hp').value = vehicle.hp || '';
    document.getElementById('f-price').value = vehicle.price || '';
    document.getElementById('f-finance').value = vehicle.finance || '';
    document.getElementById('f-badge').value = vehicle.badge || 'New';
    document.querySelectorAll('#catChecks input').forEach(c=>{
      c.checked = (vehicle.cats || []).includes(c.value);
    });
    currentPhotos = (vehicle.photos || []).slice();
    renderPhotoPreview();
    editingIdField.value = vehicle.id;
    submitBtn.textContent = 'Save Changes';
    cancelEditBtn.style.display = 'inline-flex';
    formModeLabel.textContent = 'Editing Listing';
    window.scrollTo({top:0, behavior:'smooth'});
  }
});

// ============ BOOKINGS ============
const bookingsList = document.getElementById('bookingsList');

function renderBookings(){
  const list = loadBookings().slice().sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
  if(list.length === 0){
    bookingsList.innerHTML = '<div class="admin-list-empty">No test drive bookings yet on this device.</div>';
    return;
  }
  bookingsList.innerHTML = list.map(b => `
    <div class="admin-row" data-id="${b.id}">
      <div class="info">
        <div class="name">${b.vehicleName || 'Unspecified vehicle'}</div>
        <div class="meta mono">${b.name || 'No name'} · ${b.phone || 'No phone'} · ${b.date || 'No date'} ${b.time || ''}</div>
      </div>
      <div class="actions">
        <button type="button" data-action="delete-booking" class="danger">Delete</button>
      </div>
    </div>`).join('');
}

bookingsList.addEventListener('click', e=>{
  const row = e.target.closest('.admin-row');
  const btn = e.target.closest('button[data-action="delete-booking"]');
  if(!row || !btn) return;
  const id = row.dataset.id;
  if(!confirm('Remove this booking?')) return;
  saveBookings(loadBookings().filter(b => b.id !== id));
  showToast('Booking removed');
  renderBookings();
});

// ============ REVIEWS ============
const reviewsList = document.getElementById('reviewsList');

function renderReviews(){
  const list = loadReviews().slice().sort((a,b)=> new Date(b.date) - new Date(a.date));
  if(list.length === 0){
    reviewsList.innerHTML = '<div class="admin-list-empty">No customer-submitted reviews yet on this device.</div>';
    return;
  }
  reviewsList.innerHTML = list.map(r => `
    <div class="admin-row" data-id="${r.id}">
      <div class="info">
        <div class="name">${r.name || 'Anonymous'} — ${'★'.repeat(r.rating||0)}${'☆'.repeat(5-(r.rating||0))}</div>
        <div class="meta mono">${r.email || 'No email'} · ${r.date || ''}</div>
        <div class="meta" style="margin-top:6px; font-family:'Inter',sans-serif; letter-spacing:0; text-transform:none;">${r.text || ''}</div>
      </div>
      <div class="actions">
        <button type="button" data-action="delete-review" class="danger">Delete</button>
      </div>
    </div>`).join('');
}

reviewsList.addEventListener('click', e=>{
  const row = e.target.closest('.admin-row');
  const btn = e.target.closest('button[data-action="delete-review"]');
  if(!row || !btn) return;
  const id = row.dataset.id;
  if(!confirm('Remove this review from the live site?')) return;
  saveReviews(loadReviews().filter(r => r.id !== id));
  showToast('Review removed');
  renderReviews();
});

renderPhotoPreview();
renderList();
renderBookings();
renderReviews();
