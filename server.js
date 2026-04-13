import 'dotenv/config';
import express from 'express';

const app = express();
const PORT = 3000;

// --- REUTILISATION DES LOGIQUES PRECEDENTES ---

// Configuration des providers (simplifiée pour l'exemple)
const PROVIDERS = {
    mistral: { name: 'Mistral', url: 'https://api.mistral.ai/v1/chat/completions', key: process.env.MISTRAL_API_KEY, model: 'mistral-small-latest' },
    groq: { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile' }
};

// --- ROUTES ---

// Route 1 : Vérification globale [cite: 692, 699, 700]
app.get('/check', async (req, res) => {
    // Note: On pourrait réutiliser checkProvider ici
    res.json({ status: "OK", message: "Le serveur répond bien !" });
});

// Route 2 : Poser une question [cite: 693, 701, 702]
app.get('/ask', async (req, res) => {
    const { q, provider } = req.query;
    const config = PROVIDERS[provider?.toLowerCase()];

    if (!q || !config) {
        return res.status(400).json({ error: "Paramètres 'q' ou 'provider' manquants ou invalides." });
    }

    try {
        const response = await fetch(config.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.key}`
            },
            body: JSON.stringify({
                model: config.model,
                messages: [{ role: 'user', content: q }]
            })
        });

        const data = await response.json();
        res.json({
            provider: config.name,
            response: data.choices[0].message.content
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Route 3 : Estimation de coût [cite: 693, 703, 704]
app.get('/cost', (req, res) => {
    const { text } = req.query;
    if (!text) return res.status(400).json({ error: "Texte manquant." });

    const tokens = Math.ceil(text.length / 4);
    res.json({
        tokens,
        estimatedCostMistral: `${((tokens / 1000000) * 0.20).toFixed(8)}€`
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Serveur actif sur http://localhost:${PORT}`);
});