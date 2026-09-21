const WHATSAPP = '5491164227116';
const FALLBACK_PRODUCTS = [{"id": 1, "name": "Kit de limpieza con escurridor y repuestos", "description": "Kit completo para lavar y escurrir pisos con practicidad.", "category": "Kit para pisos", "image": "producto1.png"}, {"id": 2, "name": "Paños de microfibra", "description": "Paños reutilizables para secar y limpiar superficies sin dejar pelusa.", "category": "Microfibra", "image": "producto2.png"}, {"id": 3, "name": "Balde plástico", "description": "Balde resistente para agua y soluciones de limpieza.", "category": "Accesorios", "image": "producto3.png"}, {"id": 4, "name": "Plumero de plumas blancas", "description": "Ideal para quitar polvo de muebles, objetos y rincones altos.", "category": "Accesorios", "image": "producto4.png"}, {"id": 5, "name": "Escoba de cerdas plásticas", "description": "Escoba práctica para polvo y suciedad de uso diario.", "category": "Accesorios", "image": "producto5.png"}, {"id": 6, "name": "Trapeador con balde escurridor", "description": "Sistema práctico para una limpieza profunda de pisos.", "category": "Kit para pisos", "image": "producto6.png"}, {"id": 7, "name": "Plumero de plumas oscuras", "description": "Captura polvo fino en superficies y objetos delicados.", "category": "Accesorios", "image": "producto7.png"}, {"id": 8, "name": "Detergente líquido", "description": "Para lavar vajilla y ayudar a remover suciedad y grasa.", "category": "Limpieza", "image": "producto8.png"}, {"id": 9, "name": "Esponjas con fibra abrasiva", "description": "Para utensilios y suciedad difícil en superficies resistentes.", "category": "Limpieza", "image": "producto9.png"}, {"id": 10, "name": "Suavizante / detergente para ropa", "description": "Opciones para acompañar el lavado y cuidado de prendas.", "category": "Limpieza", "image": "producto10.png"}];
const state = { products: [], cart: JSON.parse(localStorage.getItem('cleanfull_cart') || '[]'), filter: 'Todos' };
const $ = (s) => document.querySelector(s);
const grid = $('#productGrid');
const filters = $('#filters');
const drawer = $('#cartDrawer');
const backdrop = $('#cartBackdrop');
const nav = $('#mainNav');

function saveCart(){ localStorage.setItem('cleanfull_cart', JSON.stringify(state.cart)); renderCart(); }
function countCart(){ return state.cart.reduce((sum,item)=>sum+item.qty,0); }
function addToCart(id){ const found=state.cart.find(i=>i.id===id); if(found) found.qty++; else state.cart.push({id,qty:1}); saveCart(); openCart(); }
function changeQty(id,delta){ const item=state.cart.find(i=>i.id===id); if(!item)return; item.qty+=delta; if(item.qty<=0) state.cart=state.cart.filter(i=>i.id!==id); saveCart(); }
function openCart(){ drawer.classList.add('open'); backdrop.classList.add('open'); drawer.setAttribute('aria-hidden','false'); }
function closeCart(){ drawer.classList.remove('open'); backdrop.classList.remove('open'); drawer.setAttribute('aria-hidden','true'); }
function renderFilters(){ const cats=['Todos',...new Set(state.products.map(p=>p.category))]; filters.innerHTML=cats.map(c=>`<button class="filter-btn ${state.filter===c?'active':''}" data-filter="${c}">${c}</button>`).join(''); filters.querySelectorAll('button').forEach(b=>b.addEventListener('click',()=>{state.filter=b.dataset.filter;renderFilters();renderProducts()})); }
function renderProducts(){ const list=state.filter==='Todos'?state.products:state.products.filter(p=>p.category===state.filter); grid.innerHTML=list.map(p=>`<article class="product-card"><div class="product-media"><img src="./Assets/img/${p.image}" alt="${p.name}" loading="lazy"></div><div class="product-info"><span class="product-category">${p.category}</span><h3>${p.name}</h3><p>${p.description}</p><button class="add-btn" data-id="${p.id}">Agregar al pedido +</button></div></article>`).join(''); grid.querySelectorAll('.add-btn').forEach(b=>b.addEventListener('click',()=>addToCart(Number(b.dataset.id)))); const counter=document.querySelector('#productCount'); if(counter) counter.textContent=`${list.length} ${list.length===1?'producto':'productos'}`; }
function renderCart(){ const total=countCart(); $('#cartBadge').textContent=total; $('#cartCount').textContent=total; const items=state.cart.map(item=>{const p=state.products.find(x=>x.id===item.id);return p?`<div class="cart-item"><img src="./Assets/img/${p.image}" alt="${p.name}"><div><h4>${p.name}</h4><div class="qty"><button data-id="${p.id}" data-delta="-1">−</button><small>${item.qty}</small><button data-id="${p.id}" data-delta="1">+</button></div></div><button class="remove-item" data-id="${p.id}" aria-label="Quitar">×</button></div>`:''}).join(''); $('#cartItems').innerHTML=items||'<p class="empty-cart">Todavía no agregaste productos.</p>'; $('#cartItems').querySelectorAll('.qty button').forEach(b=>b.addEventListener('click',()=>changeQty(Number(b.dataset.id),Number(b.dataset.delta)))); $('#cartItems').querySelectorAll('.remove-item').forEach(b=>b.addEventListener('click',()=>{state.cart=state.cart.filter(i=>i.id!==Number(b.dataset.id));saveCart()})); const text=state.cart.map(item=>{const p=state.products.find(x=>x.id===item.id);return p?`• ${p.name} x${item.qty}`:''}).filter(Boolean).join('\n'); $('#whatsappOrder').href=`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hola Cleanfull, quiero consultar por este pedido:\n'+text)}`; }
async function loadProducts(){
  const urls=['./data/productos.json','./data_productos.json','../data/productos.json'];
  for(const url of urls){
    try{
      const res=await fetch(url,{cache:'no-store'});
      if(!res.ok) continue;
      const data=await res.json();
      if(Array.isArray(data) && data.length){ state.products=data; renderFilters(); renderProducts(); renderCart(); return; }
    }catch(err){ console.warn('No se pudo cargar',url,err); }
  }
  // Fallback: el catálogo también viaja dentro de app.js, así GitHub Pages no puede dejarlo vacío por una ruta/404 del JSON.
  state.products=FALLBACK_PRODUCTS;
  renderFilters(); renderProducts(); renderCart();
}
$('#openCart').addEventListener('click',openCart); $('#closeCart').addEventListener('click',closeCart); backdrop.addEventListener('click',closeCart); $('#menuBtn').addEventListener('click',()=>{const open=nav.classList.toggle('open');$('#menuBtn').setAttribute('aria-expanded',open)}); nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open'))); document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeCart();nav.classList.remove('open')}}); loadProducts();
