import 'dotenv/config';

console.log("Vérification des variables d'environnement...");
console.log(`MISTRAL_API_KEY: ${process.env.MISTRAL_API_KEY ? 'présente' : 'MANQUANTE'}`);
console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'présente' : 'MANQUANTE'}`);
console.log(`HF_API_KEY: ${process.env.HF_API_KEY ? 'présente' : 'MANQUANTE'}`);

async function checkMistral() {
    const start = Date.now();
    try {
        const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MISTRAL_API_KEY}`
            },
            body: JSON.stringify({
                model: 'mistral-small-latest',
                messages: [{ role: 'user', content: 'Ping' }],
                max_tokens: 5 // Pour ne pas gaspiller [cite: 541]
            })
        });

        const latency = Date.now() - start;

        if (response.ok) {
            return { provider: 'Mistral', status: 'OK', latency };
        } else {
            return { provider: 'Mistral', status: 'ERROR', latency, error: `HTTP ${response.status}` };
        }
    } catch (err) {
        return { provider: 'Mistral', status: 'ERROR', latency: Date.now() - start, error: err.message };
    }
}

// Test de l'appel
const result = await checkMistral();
console.log(result);