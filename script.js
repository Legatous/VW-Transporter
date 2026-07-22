const van = document.getElementById('van');
const dimsLine = document.getElementById('dimsLine');
const specBox = document.getElementById('vanSpecBox');
const archZoneL = document.getElementById('archZoneL');
const archZoneR = document.getElementById('archZoneR');
const archLabelL = document.getElementById('archLabelL');
const archLabelR = document.getElementById('archLabelR');

// Real interior specs, all in cm. Arch zone = the middle stretch (roughly)
// where the wheel arches intrude, narrowing usable width from maxWidth to archWidth.
const VANS = {
  vw: {
    name: 'VW Transporter T6/T6.1 L2 (LWB)',
    length: 295, maxWidth: 165, archWidth: 132,
    archStart: 0.30, archEnd: 0.62, // fraction of length where arches sit
    height: 132,
    note: 'Standard roof height ~132 cm — no standing room, fine for sit/crouch use.'
  },
  ford: {
    name: 'Ford Transit Custom L2 H1',
    length: 292, maxWidth: 177, archWidth: 139,
    archStart: 0.32, archEnd: 0.60,
    height: 141,
    note: 'Widest arch-to-arch gap of the three — easiest fit for a 65-75cm bed plus cabinets.'
  },
  renault: {
    name: 'Renault Trafic L2 H1',
    length: 294, maxWidth: 166, archWidth: 127,
    archStart: 0.30, archEnd: 0.62,
    height: 139,
    note: 'Narrowest arch-to-arch width of the three — tightest squeeze for wide beds.'
  }
};

let PX_PER_CM_X, PX_PER_CM_Y;
const VAN_PX_W = 330, VAN_PX_H = 590;

function applyVan(key){
  const v = VANS[key];
  PX_PER_CM_X = VAN_PX_W / v.maxWidth;
  PX_PER_CM_Y = VAN_PX_H / v.length;

  dimsLine.textContent = v.length + ' × ' + v.maxWidth + ' cm interior (L × W), ' + v.archWidth + ' cm between wheel arches';

  specBox.innerHTML =
    '<b>' + v.name + '</b><br>' +
    'Max floor width: <b>' + v.maxWidth + ' cm</b> · Between wheel arches: <b>' + v.archWidth + ' cm</b><br>' +
    'Load length: <b>' + v.length + ' cm</b> · Roof height: <b>' + v.height + ' cm</b><br>' +
    v.note;

  // arch intrusion per side, in px
  const totalNarrow = v.maxWidth - v.archWidth; // total cm lost across both sides
  const perSideCm = totalNarrow / 2;
  const perSidePx = perSideCm * PX_PER_CM_X;

  const zoneTop = v.archStart * VAN_PX_H;
  const zoneH = (v.archEnd - v.archStart) * VAN_PX_H;

  archZoneL.style.top = zoneTop + 'px';
  archZoneL.style.height = zoneH + 'px';
  archZoneL.style.left = '0px';
  archZoneL.style.width = perSidePx + 'px';

  archZoneR.style.top = zoneTop + 'px';
  archZoneR.style.height = zoneH + 'px';
  archZoneR.style.right = '0px';
  archZoneR.style.width = perSidePx + 'px';

  archLabelL.style.top = (zoneTop + zoneH/2 - 5) + 'px';
  archLabelL.style.left = '2px';
  archLabelR.style.top = (zoneTop + zoneH/2 - 5) + 'px';
  archLabelR.style.right = '2px';

  archZoneL.style.display = perSidePx > 2 ? 'block' : 'none';
  archZoneR.style.display = perSidePx > 2 ? 'block' : 'none';
  archLabelL.style.display = perSidePx > 14 ? 'block' : 'none';
  archLabelR.style.display = perSidePx > 14 ? 'block' : 'none';

  document.querySelectorAll('.cell').forEach(updateLiveCm);
}

const initialState = {};
function captureInitial(){
  document.querySelectorAll('.cell, .seat').forEach(el=>{
    initialState[el.id] = el.getAttribute('style');
  });
}

function updateLiveCm(el){
  const liveEl = el.querySelector('.livecm');
  if(!liveEl) return;
  const hCm = Math.round(el.offsetHeight / PX_PER_CM_Y);
  const wCm = Math.round(el.offsetWidth / PX_PER_CM_X);
  liveEl.textContent = hCm + ' × ' + wCm + ' cm';
}

function makeDraggable(el){
  if(el.id === 'cab' || el.id === 'rear') return; // fixed
  let startX, startY, startLeft, startTop, dragging=false;

  el.addEventListener('mousedown', (e)=>{
    if(e.target.classList.contains('resize-handle')) return;
    dragging = true;
    startX = e.clientX; startY = e.clientY;
    startLeft = el.offsetLeft; startTop = el.offsetTop;
    el.style.zIndex = 50;
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!dragging) return;
    let newLeft = startLeft + (e.clientX - startX);
    let newTop = startTop + (e.clientY - startY);
    newLeft = Math.max(0, Math.min(newLeft, van.clientWidth - el.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, van.clientHeight - el.offsetHeight));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
  });
  window.addEventListener('mouseup', ()=>{
    dragging = false;
    el.style.zIndex = '';
  });

  el.addEventListener('touchstart', (e)=>{
    if(e.target.classList.contains('resize-handle')) return;
    dragging = true;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startLeft = el.offsetLeft; startTop = el.offsetTop;
  }, {passive:true});
  window.addEventListener('touchmove', (e)=>{
    if(!dragging) return;
    const t = e.touches[0];
    let newLeft = startLeft + (t.clientX - startX);
    let newTop = startTop + (t.clientY - startY);
    newLeft = Math.max(0, Math.min(newLeft, van.clientWidth - el.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, van.clientHeight - el.offsetHeight));
    el.style.left = newLeft + 'px';
    el.style.top = newTop + 'px';
  }, {passive:true});
  window.addEventListener('touchend', ()=>{ dragging = false; });
}

function makeResizable(el){
  const handle = el.querySelector('.resize-handle');
  if(!handle) return;
  let startX, startY, startW, startH, resizing=false;

  handle.addEventListener('mousedown', (e)=>{
    resizing = true;
    startX = e.clientX; startY = e.clientY;
    startW = el.offsetWidth; startH = el.offsetHeight;
    el.style.zIndex = 50;
    e.stopPropagation();
    e.preventDefault();
  });
  window.addEventListener('mousemove', (e)=>{
    if(!resizing) return;
    let newW = Math.max(30, startW + (e.clientX - startX));
    let newH = Math.max(30, startH + (e.clientY - startY));
    newW = Math.min(newW, van.clientWidth - el.offsetLeft);
    newH = Math.min(newH, van.clientHeight - el.offsetTop);
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';
    updateLiveCm(el);
  });
  window.addEventListener('mouseup', ()=>{
    resizing = false;
    el.style.zIndex = '';
  });

  handle.addEventListener('touchstart', (e)=>{
    resizing = true;
    const t = e.touches[0];
    startX = t.clientX; startY = t.clientY;
    startW = el.offsetWidth; startH = el.offsetHeight;
    e.stopPropagation();
  }, {passive:true});
  window.addEventListener('touchmove', (e)=>{
    if(!resizing) return;
    const t = e.touches[0];
    let newW = Math.max(30, startW + (t.clientX - startX));
    let newH = Math.max(30, startH + (t.clientY - startY));
    newW = Math.min(newW, van.clientWidth - el.offsetLeft);
    newH = Math.min(newH, van.clientHeight - el.offsetTop);
    el.style.width = newW + 'px';
    el.style.height = newH + 'px';
    updateLiveCm(el);
  }, {passive:true});
  window.addEventListener('touchend', ()=>{ resizing = false; });
}

document.querySelectorAll('.cell').forEach(el=>{
  makeDraggable(el);
  makeResizable(el);
});
document.querySelectorAll('.seat').forEach(el=>{
  makeDraggable(el);
});

captureInitial();
applyVan('vw');

document.getElementById('vanSelect').addEventListener('change', (e)=>{
  applyVan(e.target.value);
});

document.getElementById('resetBtn').addEventListener('click', ()=>{
  Object.keys(initialState).forEach(id=>{
    const el = document.getElementById(id);
    el.setAttribute('style', initialState[id]);
  });
  document.querySelectorAll('.cell').forEach(updateLiveCm);
});

let zoomLevel = 1;
const planWrap = document.getElementById('planWrap');
function applyZoom(){
  planWrap.style.transform = 'scale(' + zoomLevel + ')';
}
document.getElementById('zoomOutBtn').addEventListener('click', ()=>{
  zoomLevel = Math.max(0.4, +(zoomLevel - 0.1).toFixed(2));
  applyZoom();
});
document.getElementById('zoomInBtn').addEventListener('click', ()=>{
  zoomLevel = Math.min(1.5, +(zoomLevel + 0.1).toFixed(2));
  applyZoom();
});
document.getElementById('zoomResetBtn').addEventListener('click', ()=>{
  zoomLevel = 1;
  applyZoom();
});
