import 'dotenv/config';

const TASKS = [
    { type: 'traduction', prompt: "Traduire en anglais : 'Le chat dort sur le canapé.'" },
    { type: 'résumé', prompt: "Résumer en une phrase : L'intelligence artificielle générative est un système capable de créer du contenu original (texte, images, code) en apprenant des structures à partir de données existantes." },
    { type: 'code', prompt: "Écrire une fonction JS qui inverse une chaîne de caractères." },
    { type: 'créatif', prompt: "Donne une métaphore originale pour expliquer ce qu'est un LLM." },
    { type: 'factuel', prompt: "Qui a inventé l'architecture Transformer en 2017 ?" }
];

const PROVIDERS = [
    { name: 'Mistral', url: 'https://api.mistral.ai/v1/chat/completions', key: process.env.MISTRAL_API_KEY, model: 'mistral-small-latest', format: 'openai' },
    { name: 'Groq', url: 'https://api.groq.com/openai/v1/chat/completions', key: process.env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile', format: 'openai' }
];

async function callProvider(provider, prompt) {
    try {
        const body = provider.format === 'openai' 
            ? { model: provider.model, messages: [{ role: 'user', content: prompt }], temperature: 0.3 }
            : { inputs: prompt, parameters: { temperature: 0.3 } };

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
            ? data.choices[0].message.content.replace(/\n/g, ' ') // On nettoie les sauts de ligne pour le tableau
            : data[0].generated_text.replace(/\n/g, ' ');

        return { type: provider.name, content };
    } catch (err) {
        return { type: provider.name, content: `Erreur: ${err.message}` };
    }
}

// Exécution de toutes les tâches pour tous les providers
console.log("Comparaison en cours... (Température 0.3)");

const allTests = TASKS.flatMap(task => 
    PROVIDERS.map(provider => 
        callProvider(provider, task.prompt).then(res => ({ ...res, taskType: task.type }))
    )
);

const results = await Promise.all(allTests);

// Affichage en tableau Markdown 
console.log("\n| Type | Mistral | Groq |");
console.log("| :--- | :--- | :--- |");

TASKS.forEach(task => {
    const mistralRes = results.find(r => r.taskType === task.type && r.type === 'Mistral').content;
    const groqRes = results.find(r => r.taskType === task.type && r.type === 'Groq').content;
    console.log(`| ${task.type.padEnd(10)} | ${mistralRes.substring(0, 50)}... | ${groqRes.substring(0, 50)}... |`);
});