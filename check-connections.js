import 'dotenv/config';

console.log("Vérification des variables d'environnement...");
const keys = ['MISTRAL_API_KEY', 'GROQ_API_KEY', 'HF_API_KEY', 'HF_MODEL_ID', 'PINECONE_API_KEY'];
keys.forEach(key => {
    console.log(`${key.padEnd(20)}: ${process.env[key] ? '✅ présente' : '❌ MANQUANTE'}`);
});

const PROVIDERS = [
    {
        name: 'Mistral',
        url: 'https://api.mistral.ai/v1/chat/completions',
        key: process.env.MISTRAL_API_KEY,
        model: 'mistral-small-latest',
        format: 'openai'
    },
    {
        name: 'Groq',
        url: 'https://api.groq.com/openai/v1/chat/completions',
        key: process.env.GROQ_API_KEY,
        model: 'llama-3.3-70b-versatile',
        format: 'openai'
    },
    {
        name: 'HuggingFace',
        url: 'https://router.huggingface.co/v1/chat/completions',
        key: process.env.HF_API_KEY,
        keyType: 'Bearer',
        format: 'openai',
        model: 'meta-llama/Llama-3.1-8B-Instruct:novita'
    }
];

async function checkProvider(provider) {
    const start = Date.now();
    try {
        const body = provider.format === 'openai' 
            ? { model: provider.model, messages: [{ role: 'user', content: 'Ping' }], max_tokens: 5 }
            : { inputs: 'Ping', parameters: { max_new_tokens: 5 } };

        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.key}`
            },
            body: JSON.stringify(body)
        });

        const latency = Date.now() - start;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { provider: provider.name, status: 'OK', latency };
    } catch (err) {
        return { provider: provider.name, status: 'ERROR', latency: Date.now() - start, error: err.message };
    }
}

// Phase 5 : Fonction spécifique pour Pinecone [cite: 589-594]
async function checkPinecone() {
    const start = Date.now();
    try {
        const response = await fetch('https://api.pinecone.io/indexes', {
            method: 'GET',
            headers: {
                'Api-Key': process.env.PINECONE_API_KEY, // Header Api-Key [cite: 593]
                'X-Pinecone-API-Version': '2024-07' // Version requise [cite: 594]
            }
        });
        const latency = Date.now() - start;
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return { provider: 'Pinecone', status: 'OK', latency };
    } catch (err) {
        return { provider: 'Pinecone', status: 'ERROR', latency: Date.now() - start, error: err.message };
    }
}

// Phase 4 : Affichage formaté [cite: 565-566]
function displayResult(results) {
    console.log("\n" + "-".repeat(50));
    console.log("Vérification des connexions API...");
    console.log("-".repeat(50));

    results.forEach(res => {
        const icon = res.status === 'OK' ? '✅' : '❌';
        const name = res.provider.padEnd(15);
        const latency = `${res.latency}ms`.padStart(8);
        console.log(`${icon} ${name} | ${latency}`);
        if (res.status === 'ERROR') console.log(`   └─ ⚠️ ${res.error}`);
    });

    const success = results.filter(r => r.status === 'OK').length;
    console.log("-".repeat(50));
    console.log(`${success}/${results.length} connexions actives`); /* [cite: 575] */
    console.log("-".repeat(50) + "\n");
}

// Lancement global en parallèle [cite: 557, 570]
const allResults = await Promise.all([
    ...PROVIDERS.map(p => checkProvider(p)),
    checkPinecone()
]);

displayResult(allResults);