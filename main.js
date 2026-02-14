// Générer un ID de session unique si pas existant
let sessionId = localStorage.getItem('valentine_session_id');
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem('valentine_session_id', sessionId);
}

const submitBtn = document.getElementById('yes');
const nameInput = document.getElementById('answer'); // L'ID dans votre HTML est "answer"

if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
        const name = nameInput.value;

        if (!name || !name.trim()) {
            alert("Mets ton nom stp !");
            return;
        }

        try {
            // On appelle l'API
            const response = await fetch('/api/name', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, name })
            });

            if (response.ok) {
                // Redirection vers la page suivante
                window.location.href = 'hello.html';
            } else {
                alert("Erreur lors de l'envoi...");
            }
        } catch (error) {
            console.error(error);
            alert("Erreur réseau");
        }
    });
}