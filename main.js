
const API_BASE = '/api';

function getOrCreateSessionId() {
  let sessionId = localStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = 'session-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
}

const sessionId = getOrCreateSessionId();

// Global scope so onclick attribute can call it
async function submitName() {
  const nameInput = document.getElementById('answer');
  const name = nameInput ? nameInput.value.trim() : '';
  if (!name) {
    alert('Veuillez entrer votre nom!');
    return;
  }

  console.log('submitName clicked', { name, sessionId });
  const btn = document.getElementById('yes');
  if (btn) btn.disabled = true;

  try {
    const res = await fetch(`${API_BASE}/name`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, sessionId })
    });
    if (!res.ok) {
      let msg = res.statusText;
      try { const j = await res.json(); if (j?.error) msg = j.error; } catch(e){}
      throw new Error(msg || ('HTTP ' + res.status));
    }
    // after saving name, go to main page
    window.location.href = '/html/hello.html';
  } catch (err) {
    console.error('submitName error', err);
    alert('Erreur lors de l'envoi. Détail: ' + (err.message || err));
  } finally {
    if (btn) btn.disabled = false;
  }
}

const submitButton = document.getElementById('yes');
if (submitButton) {
    submitButton.addEventListener('click', submitName);
}
