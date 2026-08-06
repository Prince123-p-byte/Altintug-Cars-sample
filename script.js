// ============ DATA ============
const RED='#c9a227', BLUE='#3763e0', CHR='#b9c0ca', GRA='#5b5f68';

const vehicles = [
  {id:'v1', name:'Meridian Zenith GT', make:'Meridian', year:2026, mileage:'1,200', fuel:'Petrol', trans:'8-Spd Auto', engine:'3.0L V6', hp:'420 HP', price:78400, finance:'$1,120', badge:'Featured', tint:RED, cats:['featured','luxury','sport']},
  {id:'v2', name:'Arclight Voyager', make:'Arclight', year:2026, mileage:'80', fuel:'Electric', trans:'Single-Speed', engine:'Dual Motor', hp:'480 HP', price:61900, finance:'$885', badge:'New', tint:BLUE, cats:['new','ev','suv','featured']},
  {id:'v3', name:'Voss Sterling Sedan', make:'Voss', year:2025, mileage:'8,340', fuel:'Hybrid', trans:'CVT', engine:'2.5L I4', hp:'218 HP', price:38200, finance:'$540', badge:'Used', tint:CHR, cats:['sedan','budget']},
  {id:'v4', name:'Halcyon Ridgeline SUV', make:'Halcyon', year:2026, mileage:'450', fuel:'Petrol', trans:'10-Spd Auto', engine:'3.5L V6', hp:'355 HP', price:54700, finance:'$780', badge:'New', tint:CHR, cats:['suv','new']},
  {id:'v5', name:'Meridian Onyx Coupe', make:'Meridian', year:2024, mileage:'12,900', fuel:'Petrol', trans:'7-Spd DCT', engine:'4.0L V8', hp:'520 HP', price:94500, finance:'$1,340', badge:'Luxury', tint:RED, cats:['luxury','sport','featured']},
  {id:'v6', name:'Arclight Current EV', make:'Arclight', year:2026, mileage:'0', fuel:'Electric', trans:'Single-Speed', engine:'Dual Motor', hp:'340 HP', price:44300, finance:'$630', badge:'New', tint:BLUE, cats:['ev','sedan','new']},
  {id:'v7', name:'Voss Commuter Hatch', make:'Voss', year:2023, mileage:'21,500', fuel:'Petrol', trans:'6-Spd Man', engine:'1.6L I4', hp:'128 HP', price:16900, finance:'$240', badge:'Used', tint:GRA, cats:['budget']},
  {id:'v8', name:'Halcyon Summit SUV', make:'Halcyon', year:2025, mileage:'5,100', fuel:'Diesel', trans:'8-Spd Auto', engine:'3.0L I6', hp:'295 HP', price:49800, finance:'$710', badge:'Used', tint:CHR, cats:['suv','budget']},
  {id:'v9', name:'Meridian Apex Track', make:'Meridian', year:2026, mileage:'60', fuel:'Petrol', trans:'7-Spd DCT', engine:'4.4L V8', hp:'610 HP', price:142000, finance:'$2,010', badge:'Featured', tint:RED, cats:['sport','luxury','featured']},
];

// ============ CUSTOM (ADMIN-UPLOADED) VEHICLES ============
// Vehicles added via admin.html are stored in this browser's localStorage
// under 'altintug_customVehicles' and merged in here so they appear in the
// live inventory grid on this device.
const CUSTOM_KEY = 'altintug_customVehicles';
function loadCustomVehicles(){
  try{
    const raw = localStorage.getItem(CUSTOM_KEY);
    return raw ? JSON.parse(raw) : [];
  }catch(e){
    console.warn('Could not read custom vehicles from storage', e);
    return [];
  }
}
vehicles.push(...loadCustomVehicles());

const state = { favorites: new Set(), compare: [] };

// ============ ICONS ============
function carSVG(tint){
  return `<svg class="car-silhouette" viewBox="0 0 240 110" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 74 C14 60 30 54 52 53 C64 36 88 20 122 17 C156 14 184 21 202 34 C222 32 232 44 232 58 L232 66 L14 66 Z"
      fill="none" stroke="${tint}" stroke-width="2.2"/>
    <circle cx="60" cy="76" r="13" fill="none" stroke="${tint}" stroke-width="2.2"/>
    <circle cx="186" cy="76" r="13" fill="none" stroke="${tint}" stroke-width="2.2"/>
    <path d="M72 52 C86 38 100 30 116 28 C110 38 108 48 108 55 Z" fill="${tint}" opacity="0.18"/>
    <path d="M126 27 C150 26 170 31 184 40 C176 45 164 49 146 47 Z" fill="${tint}" opacity="0.18"/>
  </svg>`;
}
const iconSVG = (name) => ({
  fuel: '<svg viewBox="0 0 24 24"><path d="M6 3h9v18H6z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M15 8l3 2v7a1.5 1.5 0 003 0v-5l-2-2" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>',
  trans: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 3v4M12 17v4M3 12h4M17 12h4" stroke="currentColor" stroke-width="1.5"/></svg>',
  speed: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 100 18 9 9 0 000-18z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M12 12l5-4" stroke="currentColor" stroke-width="1.5"/></svg>',
  mile:  '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="10" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M7 7v10M17 7v10" stroke="currentColor" stroke-width="1.5"/></svg>'
}[name] || '');

// ============ RENDER GRID ============
const grid = document.getElementById('grid');

function renderGrid(list){
  grid.innerHTML = '';
  if(list.length === 0){
    grid.innerHTML = '<div class="empty-state">No vehicles match those filters. Try widening your search.</div>';
    return;
  }
  list.forEach(v=>{
    const badgeClass = v.badge==='Used' ? 'used' : (v.cats.includes('ev') ? 'ev' : '');
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.cats = v.cats.join(' ');
    card.dataset.id = v.id;
    const isFav = state.favorites.has(v.id);
    const isComparing = state.compare.includes(v.id);
    const hasPhoto = Array.isArray(v.photos) && v.photos.length > 0;
    card.innerHTML = `
      <div class="card-media ${hasPhoto?'has-photo':''}">
        <span class="badge ${badgeClass}">${v.badge}</span>
        <button class="fav ${isFav?'active':''}" title="Save to wishlist" data-id="${v.id}">
          <svg viewBox="0 0 24 24"><path d="M12 21s-7.5-4.6-10-9.3C.4 8 2 4.5 5.6 4A6 6 0 0112 7a6 6 0 016.4-3c3.6.5 5.2 4 3.6 7.7C19.5 16.4 12 21 12 21z"/></svg>
        </button>
        ${hasPhoto ? `<img class="car-photo" src="${v.photos[0]}" alt="${v.name}">` : carSVG(v.tint)}
        <div class="card-hover-actions">
          <button data-action="quick-view" data-id="${v.id}">Quick View</button>
          <button data-action="compare" data-id="${v.id}" class="${isComparing?'is-added':''}">${isComparing?'Added ✓':'Compare'}</button>
        </div>
      </div>
      <div class="card-body">
        <div class="card-top">
          <div class="card-name">${v.name}</div>
          <div class="card-year mono">${v.year}</div>
        </div>
        <div class="card-specs">
          <span>${iconSVG('mile')}${v.mileage} mi</span>
          <span>${iconSVG('fuel')}${v.fuel}</span>
          <span>${iconSVG('trans')}${v.trans}</span>
          <span>${iconSVG('speed')}${v.hp}</span>
        </div>
        <div class="card-price-row">
          <div>
            <div class="card-price mono">$${v.price.toLocaleString()}</div>
            <div class="card-finance">Est. <b>${v.finance}</b>/mo</div>
          </div>
          <button class="view-details" data-action="quick-view" data-id="${v.id}">View Details →</button>
        </div>
      </div>`;
    grid.appendChild(card);
  });
  requestAnimationFrame(revealCards);
}

function revealCards(){
  document.querySelectorAll('.card').forEach((c,i)=>{
    setTimeout(()=>c.classList.add('show'), i*40);
  });
}

renderGrid(vehicles);

// ============ TABS ============
document.getElementById('tabs').addEventListener('click', e=>{
  const btn = e.target.closest('.tab');
  if(!btn) return;
  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  const f = btn.dataset.filter;
  const filtered = f==='all' ? vehicles : vehicles.filter(v=>v.cats.includes(f));
  renderGrid(filtered);
});

// ============ SEARCH DOCK ============
document.getElementById('searchGo').addEventListener('click', ()=>{
  const make = document.getElementById('fMake').value;
  const body = document.getElementById('fBody').value;
  const priceRange = document.getElementById('fPrice').value;

  let result = vehicles.filter(v=>{
    if(make && v.make !== make) return false;
    if(body && !v.cats.includes(body)) return false;
    if(priceRange){
      const [min,max] = priceRange.split('-').map(Number);
      if(v.price < min || v.price > max) return false;
    }
    return true;
  });

  document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  document.querySelector('.tab[data-filter="all"]').classList.add('active');
  renderGrid(result);
  document.getElementById('inventory').scrollIntoView({behavior:'smooth', block:'start'});
  showToast(`${result.length} vehicle${result.length===1?'':'s'} found`);
});

// ============ SCROLL / NAV ACTIONS ============
document.querySelectorAll('[data-action="scroll-inventory"]').forEach(btn=>{
  btn.addEventListener('click', ()=> document.getElementById('inventory').scrollIntoView({behavior:'smooth'}));
});
document.querySelectorAll('[data-action="scroll-contact"]').forEach(btn=>{
  btn.addEventListener('click', ()=> document.getElementById('contact').scrollIntoView({behavior:'smooth'}));
});

// ============ COLLECTIONS ============
document.getElementById('collectionsGrid').addEventListener('click', e=>{
  const card = e.target.closest('.collection-card');
  if(!card) return;
  const filter = card.dataset.filter;
  const tabBtn = document.querySelector(`.tab[data-filter="${filter}"]`);
  if(tabBtn) tabBtn.click();
  document.getElementById('inventory').scrollIntoView({behavior:'smooth'});
});

window.addEventListener('scroll', ()=>{
  document.getElementById('nav').classList.toggle('scrolled', window.scrollY > 40);
});

// ============ THEME TOGGLE ============
document.getElementById('themeToggle').addEventListener('click', ()=>{
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'light' ? 'dark' : 'light';
});

// ============ GAUGE COUNT-UP ============
const gauges = document.querySelectorAll('.gauge-value');
const gaugeObs = new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      const dur = 1400;
      const t0 = performance.now();
      function tick(t){
        const p = Math.min((t - t0)/dur, 1);
        const eased = 1 - Math.pow(1-p, 3);
        el.textContent = Math.round(eased * target).toLocaleString();
        if(p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      gaugeObs.unobserve(el);
    }
  });
}, {threshold:0.4});
gauges.forEach(g=>gaugeObs.observe(g));

// ============ MODAL SYSTEM ============
const overlay = document.getElementById('modalOverlay');
const modalBody = document.getElementById('modalBody');

function openModal(html){
  modalBody.innerHTML = html;
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  overlay.classList.remove('open');
  document.body.style.overflow = '';
}
overlay.addEventListener('click', e=>{ if(e.target === overlay) closeModal(); });
document.addEventListener('keydown', e=>{ if(e.key === 'Escape') closeModal(); });

function galleryHTML(photos){
  if(!photos || photos.length === 0) return '';
  const dots = photos.length > 1
    ? `<div class="gallery-dots">${photos.map((_,i)=>`<button type="button" data-action="gallery-dot" data-idx="${i}" class="${i===0?'active':''}"></button>`).join('')}</div>`
    : '';
  const arrows = photos.length > 1
    ? `<button type="button" class="gallery-arrow prev" data-action="gallery-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 6l-6 6 6 6"/></svg></button>
       <button type="button" class="gallery-arrow next" data-action="gallery-next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 6l6 6-6 6"/></svg></button>`
    : '';
  return `
    <div class="modal-hero-gallery" data-gallery-index="0">
      <div class="hero-img-wrap"><img src="${photos[0]}" alt=""></div>
      ${arrows}
      ${dots}
    </div>`;
}

function quickViewHTML(v){
  modalBody.dataset.currentId = v.id;
  return `
    <div class="modal-head">
      <div>
        <div class="modal-title">${v.name}</div>
        <div class="mono" style="color:var(--text-dim); font-size:13px; margin-top:4px;">${v.make} · ${v.year}</div>
      </div>
      <button class="modal-x" data-close>✕</button>
    </div>
    ${galleryHTML(v.photos)}
    <div class="modal-specs">
      <div>Mileage<b>${v.mileage} mi</b></div>
      <div>Fuel Type<b>${v.fuel}</b></div>
      <div>Transmission<b>${v.trans}</b></div>
      <div>Engine<b>${v.engine}</b></div>
      <div>Horsepower<b>${v.hp}</b></div>
      <div>Condition<b>${v.badge==='Used' ? 'Used' : 'New'}</b></div>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <div class="card-price mono" style="font-size:32px;">$${v.price.toLocaleString()}</div>
        <div class="card-finance">Est. <b>${v.finance}</b>/mo financing</div>
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" data-action="book-test-drive" data-id="${v.id}">Book a Test Drive</button>
      <button class="btn-ghost" data-action="compare" data-id="${v.id}">${state.compare.includes(v.id) ? 'Remove from Compare' : 'Add to Compare'}</button>
    </div>`;
}

function bookTestDriveHTML(vehicle){
  const vehicleOptions = vehicles.map(v=>`<option value="${v.id}" ${vehicle && vehicle.id===v.id ? 'selected':''}>${v.name} (${v.year})</option>`).join('');
  return `
    <div class="modal-head">
      <div class="modal-title">Book a Test Drive</div>
      <button class="modal-x" data-close>✕</button>
    </div>
    <form id="testDriveForm">
      <div class="form-row">
        <label for="td-vehicle">Vehicle</label>
        <select id="td-vehicle">${vehicleOptions}</select>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="td-name">Full Name</label>
          <input id="td-name" type="text" required placeholder="Your name">
        </div>
        <div class="form-row">
          <label for="td-phone">Phone</label>
          <input id="td-phone" type="tel" required placeholder="+90 5XX XXX XX XX">
        </div>
      </div>
      <div class="form-grid">
        <div class="form-row">
          <label for="td-date">Date</label>
          <input id="td-date" type="date" required>
        </div>
        <div class="form-row">
          <label for="td-time">Time</label>
          <input id="td-time" type="time" required>
        </div>
      </div>
      <button type="submit" class="btn-primary" style="width:100%; justify-content:center; margin-top:6px;">Confirm Booking</button>
    </form>`;
}

function successHTML(title, message){
  return `
    <div class="success-box">
      <div class="check"><svg viewBox="0 0 24 24"><path d="M5 13l4 4L19 7"/></svg></div>
      <h3>${title}</h3>
      <p>${message}</p>
      <button class="btn-ghost" data-close style="margin-top:22px;">Close</button>
    </div>`;
}

function compareModalHTML(){
  const items = vehicles.filter(v=>state.compare.includes(v.id));
  if(items.length === 0){
    return `<div class="modal-head"><div class="modal-title">Compare Vehicles</div><button class="modal-x" data-close>✕</button></div>
      <p style="color:var(--text-dim); font-size:14px;">Add vehicles from any card to compare them side by side.</p>`;
  }
  const rows = [
    ['Price', v=>'$'+v.price.toLocaleString()],
    ['Year', v=>v.year],
    ['Mileage', v=>v.mileage+' mi'],
    ['Fuel', v=>v.fuel],
    ['Transmission', v=>v.trans],
    ['Engine', v=>v.engine],
    ['Horsepower', v=>v.hp],
    ['Est. Monthly', v=>v.finance+'/mo'],
  ];
  return `
    <div class="modal-head">
      <div class="modal-title">Compare Vehicles</div>
      <button class="modal-x" data-close>✕</button>
    </div>
    <div style="overflow-x:auto;">
    <table class="compare-table">
      <thead><tr><th></th>${items.map(v=>`<th>${v.name} <span class="remove" data-action="remove-compare" data-id="${v.id}" title="Remove">✕</span></th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(([label,fn])=>`<tr><th>${label}</th>${items.map(v=>`<td>${fn(v)}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
    </div>`;
}

// modal delegated actions
modalBody.addEventListener('click', e=>{
  if(e.target.closest('[data-close]')){ closeModal(); return; }

  const galleryWrap = e.target.closest('.modal-hero-gallery');
  const galleryAction = e.target.closest('[data-action="gallery-dot"], [data-action="gallery-prev"], [data-action="gallery-next"]');
  if(galleryWrap && galleryAction){
    const id = modalBody.dataset.currentId;
    const v = vehicles.find(x=>x.id===id);
    const photos = (v && v.photos) || [];
    if(photos.length === 0) return;
    let idx = Number(galleryWrap.dataset.galleryIndex || 0);
    const action = galleryAction.dataset.action;
    if(action === 'gallery-dot') idx = Number(galleryAction.dataset.idx);
    else if(action === 'gallery-next') idx = (idx + 1) % photos.length;
    else if(action === 'gallery-prev') idx = (idx - 1 + photos.length) % photos.length;
    galleryWrap.dataset.galleryIndex = idx;
    galleryWrap.querySelector('.hero-img-wrap img').src = photos[idx];
    galleryWrap.querySelectorAll('.gallery-dots button').forEach((d,i)=> d.classList.toggle('active', i===idx));
    return;
  }

  const actionBtn = e.target.closest('[data-action]');
  if(actionBtn){
    const id = actionBtn.dataset.id;
    const action = actionBtn.dataset.action;
    if(action === 'book-test-drive'){
      const v = vehicles.find(x=>x.id===id);
      openModal(bookTestDriveHTML(v));
    } else if(action === 'compare'){
      toggleCompare(id);
      openModal(quickViewHTML(vehicles.find(x=>x.id===id)));
    } else if(action === 'remove-compare'){
      toggleCompare(id);
      openModal(compareModalHTML());
    }
  }
});

modalBody.addEventListener('submit', e=>{
  if(e.target.id === 'testDriveForm'){
    e.preventDefault();
    const vSel = document.getElementById('td-vehicle');
    const vName = vSel.options[vSel.selectedIndex].text;
    const date = document.getElementById('td-date').value;
    const time = document.getElementById('td-time').value;
    const branch = 'our Gemikonağı showroom';
    openModal(successHTML('Test Drive Booked', `${vName} — ${date || 'a date'} at ${time || 'a time'}, ${branch}. We'll send a confirmation by SMS and email shortly.`));
  }
});

// ============ GRID DELEGATED ACTIONS ============
grid.addEventListener('click', e=>{
  const favBtn = e.target.closest('.fav');
  if(favBtn){
    const id = favBtn.dataset.id;
    if(state.favorites.has(id)){ state.favorites.delete(id); favBtn.classList.remove('active'); showToast('Removed from wishlist'); }
    else { state.favorites.add(id); favBtn.classList.add('active'); showToast('Saved to wishlist'); }
    return;
  }
  const actionBtn = e.target.closest('[data-action]');
  if(!actionBtn) return;
  const id = actionBtn.dataset.id;
  const v = vehicles.find(x=>x.id===id);
  const action = actionBtn.dataset.action;
  if(action === 'quick-view'){
    openModal(quickViewHTML(v));
  } else if(action === 'compare'){
    toggleCompare(id);
  }
});

// nav "Book a Test Drive" buttons (outside grid)
document.querySelectorAll('[data-action="book-test-drive"]').forEach(btn=>{
  if(btn.closest('.modal')) return;
  btn.addEventListener('click', ()=> openModal(bookTestDriveHTML(null)));
});

// ============ COMPARE TRAY ============
const tray = document.getElementById('compareTray');
const trayItems = document.getElementById('compareItems');
const trayCount = document.getElementById('compareCount');

function toggleCompare(id){
  const idx = state.compare.indexOf(id);
  if(idx > -1){ state.compare.splice(idx,1); }
  else {
    if(state.compare.length >= 3){ showToast('You can compare up to 3 vehicles'); return; }
    state.compare.push(id);
  }
  updateTray();
  // refresh any visible compare buttons in the grid
  document.querySelectorAll('[data-action="compare"]').forEach(b=>{
    if(b.dataset.id === id && b.closest('.card')){
      const added = state.compare.includes(id);
      b.classList.toggle('is-added', added);
      b.textContent = added ? 'Added ✓' : 'Compare';
    }
  });
}

function updateTray(){
  trayCount.textContent = state.compare.length;
  trayItems.innerHTML = vehicles.filter(v=>state.compare.includes(v.id)).map(v=>`<span>${v.name}</span>`).join('');
  tray.classList.toggle('show', state.compare.length > 0);
}

document.getElementById('compareGo').addEventListener('click', ()=> openModal(compareModalHTML()));
document.getElementById('compareClear').addEventListener('click', ()=>{
  state.compare = [];
  updateTray();
  document.querySelectorAll('.card-hover-actions [data-action="compare"]').forEach(b=>{ b.classList.remove('is-added'); b.textContent='Compare'; });
});

// ============ TOAST ============
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg){
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> toastEl.classList.remove('show'), 2400);
}
