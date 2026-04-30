const BASE_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { m1Data, m2Data, m3Data } = req.body || {};
  if (!m1Data || !m3Data) return res.status(400).json({ error: 'm1Data et m3Data requis' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' });

  const currency = m1Data.currency || 'CAD';
  const v1Features = (m3Data.v1 || []).map(f => f.nom).join(', ');

  const prompt = `Tu es un expert en modèles économiques SaaS/tech. Génère le modèle économique pour ce projet.

PROJET :
Nom: ${m1Data.projectName}
Catégorie: ${m1Data.category}
Devise: ${currency}
Marché: ${m1Data.targetCountry}
Marché cible: ${m1Data.targetMarket}
Brief produit: ${m3Data.brief}
Fonctionnalités V1: ${v1Features}
${m2Data ? `Taille marché: ${m2Data.marche?.taille || 'N/A'}` : ''}
${m2Data ? `Concurrents: ${(m2Data.result?.concurrents || []).map(c => c.nom).join(', ')}` : ''}

RÈGLES :
- Devise = ${currency} pour TOUS les montants
- 3 modèles différents adaptés à ce projet spécifique
- Pricing ancré sur la réalité du marché et des concurrents
- Projections conservatrices avec hypothèses explicites
- Seuil rentabilité = nombre de clients minimum pour couvrir les coûts de base

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "modeles": [
    {
      "nom": "<nom du modèle>",
      "type": "<Abonnement|Freemium|Usage-based|Commission|Service|Autre>",
      "description": "<1-2 phrases>",
      "pour": ["<avantage 1>", "<avantage 2>"],
      "contre": ["<inconvénient 1>"]
    }
  ],
  "recommandation": "<nom du modèle recommandé et pourquoi en 1 phrase>",
  "pricing": {
    "gratuit": { "nom": "<nom plan>", "prix": 0, "features": ["<feature 1>", "<feature 2>"] },
    "pro": { "nom": "<nom plan>", "prix": <montant>, "features": ["<feature 1>", "<feature 2>", "<feature 3>"] },
    "business": { "nom": "<nom plan>", "prix": <montant>, "features": ["<feature 1>", "<feature 2>", "<feature 3>", "<feature 4>"] }
  },
  "projections": {
    "hypothese_clients_m6": <nombre>,
    "hypothese_clients_m12": <nombre>,
    "mrr_m6": <montant en ${currency}>,
    "mrr_m12": <montant en ${currency}>,
    "ltv_estime": <montant en ${currency}>,
    "cac_cible": <montant en ${currency}>,
    "seuil_rentabilite_clients": <nombre>,
    "note": "<hypothèse principale derrière ces projections>"
  }
}`;

  try {
    const apiRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: "Tu es un expert en business models et pricing SaaS/tech. Tu réponds uniquement en JSON valide strict, sans markdown.",
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await apiRes.json();
    if (!apiRes.ok) throw new Error(data.error?.message || 'Erreur Anthropic');
    let text = '';
    for (const block of data.content || []) {
      if (block.type === 'text') text += block.text;
    }
    return res.status(200).json(JSON.parse(text.replace(/```json|```/g, '').trim()));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
