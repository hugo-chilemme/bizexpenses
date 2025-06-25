
const OpenAI = require("openai");

const prompt = `Récupère toutes les informations pertinentes du ticket de caisse présent sur l'image, notamment :
- Nom de l'entreprise ou du commerçant
- Adresse de l'entreprise (si présente)
- Date et heure de l'achat
- Numéro du ticket ou de la transaction (si présent)
- Liste des articles achetés, avec pour chaque article :
	- Nom ou description de l'article
	- Quantité
	- Prix unitaire
	- Prix total de l'article
	- Taux de TVA appliqué (si présent)
	- Montant de la TVA (si présent)
	- Catégorie de l'article (choisir parmi : 	"Transports",
	"Restauration",
	"Hotel",
	"Fournitures",
	"Alcools",
	"Autres", mais n'en invente pas, utilise uniquement celles présentes, tu peux regrouper certains par example Boissons dans Restauration, cependant les bières etc sont à mettre dans Alcools)
- Total HT (hors taxes)
- Total TVA (généralement il y a écrit "dont TVA" ou "TVA" suivi du montant)
- Total TTC (toutes taxes comprises)
- Moyen de paiement (si présent)
Pour chaque champ, ajoute un champ "error": true ou false pour indiquer si l'information a été trouvée ou non.
Si une information n'est pas présente, laisse le champ vide et mets "error": true.
Si ce n'est pas un ticket de caisse, retourne un json avec la raison de l'erreur dans le champ "error" et "error": true.
Vocii le format d'erruer attendu :
{
  "error": "This document is not a receipt or contains insufficient information.",
  "status": "error"
}
Réponds uniquement au format JSON sans bloc de code, par exemple :
{
  "company_name": { "value": "Supermarché Paris Centre", "error": false },
  "company_address": { "value": "12 rue de Paris, 75001 Paris", "error": false },
  "date": { "value": "2024-06-15", "error": false },
  "label": { "value": "Course suite au déplacement à Paris", "error": false },
  "items": [
	{
	  "name": { "value": "Baguette", "error": false },
	  "quantity": { "value": 2, "error": false },
	  "unit_price": { "value": 1.20, "error": false },
	  "total_price": { "value": 2.40, "error": false },
	  "vat_rate": { "value": "5.5%", "error": false },
	  "vat_amount": { "value": 0.13, "error": false },
	  "category": { "value": "alimentation", "error": false }
	},
	{
	  "name": { "value": "Lait", "error": false },
	  "quantity": { "value": 1, "error": false },
	  "unit_price": { "value": 0.90, "error": false },
	  "total_price": { "value": 0.90, "error": false },
	  "vat_rate": { "value": "5.5%", "error": false },
	  "vat_amount": { "value": 0.05, "error": false },
	  "category": { "value": "alimentation", "error": false }
	}
  ],
  "total_ttc": { "value": 3.48, "error": false },
  "payment_method": { "value": "Carte bancaire", "error": false }
}`;

async function analyzeImage(base64Image) {
    const client = new OpenAI({
        apiKey: process.env.NSCALE_API_KEY,
        baseURL: process.env.NSCALE_BASE_URL,
    });

    const response = await client.chat.completions.create({
        model: "meta-llama/Llama-4-Scout-17B-16E-Instruct",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: prompt },
                    {
                        type: "image_url",
                        image_url: {
                            url: base64Image,
                        },
                    },
                ],
            },
        ],
    });

	const brut = response.choices[0].message.content;
	console.log(brut);

	// Extract the JSON content from the response using a regular expression
	const match = brut.match(/\{[\s\S]*\}/);
	if (!match) {
		throw new Error("No JSON object found in the response");
	}
	const json = match[0];
	return JSON.parse(json);
}


module.exports = {
	analyzeImage,
};