import express from 'express';

// filepath: c:\Users\tiant\OneDrive\Bureau\valentine\back\route.js
const router = express.Router();

// Route pour récupérer les réponses depuis la BD
router.get('/responses', (req, res) => {
    try {
        // À connecter à votre base de données
        // const responses = db.query("SELECT * FROM responses");
        res.json({ message: 'Responses fetched', data: [] });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

// Route pour sauvegarder la réponse (Oui/Non)
router.post('/responses', (req, res) => {
    try {
        const { answer } = req.body;
        // À connecter à votre base de données
        // db.query("INSERT INTO responses (answer, date) VALUES (?, ?)", [answer, new Date()]);
        res.json({ message: 'Response saved', answer });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

export default router;