import 'dotenv/config';

// Tarifs indicatifs par million de tokens (Input) du PDF [cite: 614-617]
const PRICING = {
    'Mistral Small': 0.20,
    'Groq Llama 3': 0.05,
    'GPT-4o': 2.50
};

// Approximation : longueur du texte / 4 [cite: 613]
function estimateTokens(text) {
    return Math.ceil(text.length / 4);
}

function estimateCost(text) {
    const tokens = estimateTokens(text);
    console.log(`\nTexte: "${text}"`);
    console.log(`Estimation : ~${tokens} tokens\n`);

    console.log("Provider           | Coût (input)   | Pour 1000 req");
    console.log("-".repeat(50));

    for (const [provider, price] of Object.entries(PRICING)) {
        const costPerReq = (tokens / 1000000) * price;
        const cost1000 = costPerReq * 1000;
        
        console.log(
            `${provider.padEnd(18)} | ` +
            `${costPerReq.toFixed(8)}€ | ` +
            `${cost1000.toFixed(5)}€`
        );
    }
}

// Test avec la phrase du PDF [cite: 619]
estimateCost("Explique le concept de récursion à un lycéen, en 3 phrases maximum.");