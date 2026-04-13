import 'dotenv/config';

const PROMPT = "Donne-moi une métaphore originale pour expliquer un LLM.";
const TEMPS = [0, 0.5, 1];

async function callProvider(provider, prompt, temp) {
    // Note : HuggingFace n'accepte pas 0, on passe 0.01 [cite: 639]
    const temperature = (provider.name === 'HuggingFace' && temp === 0) ? 0.01 : temp;
    
    try {
        const body = provider.format === 'openai' 
            ? { model: provider.model, messages: [{ role: 'user', content: prompt }], temperature }
            : { inputs: prompt, parameters: { temperature: temperature || 0.01 } };

        const response = await fetch(provider.url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${provider.key}`
            },
            body: JSON.stringify(body)
        });

        const data = await response.json();
        const content = provider.format === 'openai' 
            ? data.choices[0].message.content 
            : data[0].generated_text;

        return { provider: provider.name, temp, content };
    } catch (err) {
        return { provider: provider.name, temp, error: err.message };
    }
}

// Configuration simplifiée pour le lab
const PROVIDERS = [
    { name: 'Mistral', url: 'https://api.mistral.ai/v1/chat/completions', key: process.env.MISTRAL_API_KEY, model: 'mistral-small-latest', format: 'openai' },
    { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile', format: 'openai' }
];

// On génère toutes les combinaisons et on lance en parallèle [cite: 640]
const tests = PROVIDERS.flatMap(p => TEMPS.map(t => callProvider(p, PROMPT, t)));
const results = await Promise.all(tests);

results.forEach(r => {
    console.log(`\n--- ${r.provider} (Temp: ${r.temp}) ---`);
    console.log(r.content || `Erreur: ${r.error}`);
});