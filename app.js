
// Basic SPA navigation
const navLinks = document.querySelectorAll('#sidebar .nav a');
const sections = document.querySelectorAll('.section');
navLinks.forEach(a => {
  a.addEventListener('click', () => {
    navLinks.forEach(x=>x.classList.remove('active'));
    a.classList.add('active');
    sections.forEach(s => s.classList.remove('active'));
    const id = a.dataset.section + 'Section';
    document.getElementById(id).classList.add('active');
  });
});

// Charts (Chart.js)
const salesCtx = document.getElementById('salesChart').getContext('2d');
const trafficCtx = document.getElementById('trafficChart').getContext('2d');
const usersCtx = document.getElementById('usersChart').getContext('2d');

const salesChart = new Chart(salesCtx, {
  type: 'line',
  data: {
    labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    datasets: [{label:'Sales',data:[1200,1500,1400,1800,1700,2000],fill:true,tension:0.4,pointRadius:2}]
  },
  options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
});

const trafficChart = new Chart(trafficCtx, {
  type: 'bar',
  data: {
    labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
    datasets:[{label:'Visits',data:[300,420,350,480,520,610,720]}]
  },
  options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
});

const usersChart = new Chart(usersCtx, {
  type: 'doughnut',
  data: {
    labels:['Free','Pro','Enterprise'],
    datasets:[{data:[300,120,45]}]
  },
  options:{plugins:{legend:{position:'bottom'}}}
});

// Users table: load sample data
let users = [];
const USERS_PER_PAGE = 6;
let currentPage = 1;
let sortKey = 'id';
let sortDir = 1;

async function loadUsers(){
  // load static file
  const resp = await fetch('data/users.json');
  users = await resp.json();
  renderTable();
}

function compare(a,b){
  if(a[sortKey] < b[sortKey]) return -1*sortDir;
  if(a[sortKey] > b[sortKey]) return 1*sortDir;
  return 0;
}

function renderTable(){
  const tableBody = document.querySelector('#usersTable tbody');
  const search = document.querySelector('#tableSearch').value.toLowerCase();
  let filtered = users.filter(u => (u.name+u.email+u.role).toLowerCase().includes(search));
  filtered.sort(compare);
  const totalPages = Math.max(1, Math.ceil(filtered.length / USERS_PER_PAGE));
  if(currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage-1)*USERS_PER_PAGE;
  const pageData = filtered.slice(start, start + USERS_PER_PAGE);
  tableBody.innerHTML = '';
  pageData.forEach(u => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${u.id}</td><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td><button class='btn-edit' data-id='${u.id}'>Edit</button></td>`;
    tableBody.appendChild(tr);
  });
  document.getElementById('pageInfo').innerText = currentPage + ' / ' + totalPages;
}

// paging controls
document.getElementById('prevPage').addEventListener('click', ()=>{ if(currentPage>1){currentPage--; renderTable();}});
document.getElementById('nextPage').addEventListener('click', ()=>{ currentPage++; renderTable();});

// search/sort handlers
document.getElementById('tableSearch').addEventListener('input', ()=>{ currentPage=1; renderTable();});
document.querySelectorAll('#usersTable thead th[data-sort]').forEach(th => {
  th.addEventListener('click', ()=>{
    const key = th.dataset.sort;
    if(sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = 1; }
    renderTable();
  });
});

// top search (search across page navs - simple scroll to users)
document.getElementById('searchInput').addEventListener('keydown', (e)=>{
  if(e.key === 'Enter'){
    const q = e.target.value.toLowerCase();
    // switch to dashboard and highlight - simple behavior: filter table
    document.querySelector('#sidebar .nav a[data-section="dashboard"]').click();
    document.querySelector('#tableSearch').value = q;
    currentPage = 1;
    renderTable();
  }
});

// initial load
loadUsers();

// small UX: live click actions (example)
document.querySelector('#usersTable tbody').addEventListener('click', (e)=>{
  if(e.target.matches('button.btn-edit')){
    alert('Edit user id: ' + e.target.dataset.id);
  }
});
