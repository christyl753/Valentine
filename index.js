// Frontend client for Vercel: use relative /api endpoints
const API_BASE = '/api';

function getSessionId() {
  let sid = localStorage.getItem('sessionId');
  if (!sid) {
    if (window.crypto && crypto.randomUUID) sid = crypto.randomUUID();
    else sid = 'sid-' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('sessionId', sid);
  }
  return sid;
}

const sessionId = getSessionId();

async function sendName(name) {
  const res = await fetch(`${API_BASE}/name`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, sessionId })
  });
  return res.json();
}

async function sendAnswer(answer) {
  const res = await fetch(`${API_BASE}/answer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answer, sessionId })
  });
  return res.json();
}

// On load, try to fetch user data (name) for this session
async function fetchUserData() {
  try {
    const res = await fetch(`${API_BASE}/user-data?sessionId=${encodeURIComponent(sessionId)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data?.name) {
      const el = document.getElementById('greeting');
      if (el) el.innerText = `${data.name}, VEUX TU ETRE MA VALENTINE ?`;
    }
  } catch (e) {
    console.error('fetchUserData error', e);
  }
}

fetchUserData();

// Buttons
const yesBtn = document.getElementById('yes');
const noBtn = document.getElementById('no');

if (yesBtn) {
  yesBtn.addEventListener('click', async () => {
    try {
      await sendAnswer('oui');
    } catch (e) { console.error(e); }
    document.body.innerHTML = `
      <div class="message">
        <dotlottie-wc src="https://lottie.host/25eb1912-f42f-430e-ac57-30a9fd067929/JHQBgiluvG.lottie" speed="0.75" autoplay loop></dotlottie-wc>
        <h1>MERCI D'AVOIR ACCEPTÉ</h1>
      </div>
    `;
  });
}

if (noBtn) {
  noBtn.addEventListener('click', async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    try { await sendAnswer('non'); } catch (e) { /* silent */ }
    document.body.innerHTML = `
      <div class="message" style="min-height:100vh; justify-content:center;">
        <dotlottie-wc src="https://lottie.host/0093e7b7-be68-498f-8cfd-7e651301159b/SX4DYhZRPR.lottie" autoplay loop></dotlottie-wc>
        <h1 style="font-size:20px; text-align:center; margin-top:12px;">J'accepte ton choix — merci d'avoir répondu</h1>
      </div>
    `;
  });
}