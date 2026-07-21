const van = document.getElementById('van');
const PX_PER_CM_X = 330/165;
const PX_PER_CM_Y = 590/295;

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

  // touch support
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