import 'dotenv/config';

console.log("Vérification des variables d'environnement...");
console.log(`MISTRAL_API_KEY: ${process.env.MISTRAL_API_KEY ? 'présente' : 'MANQUANTE'}`);
console.log(`GROQ_API_KEY: ${process.env.GROQ_API_KEY ? 'présente' : 'MANQUANTE'}`);
console.log(`HF_API_KEY: ${process.env.HF_API_KEY ? 'présente' : 'MANQUANTE'}`);