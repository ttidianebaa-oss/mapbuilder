const BASE_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { projectName, category, currency, founderCountry, targetCountry, description, targetMarket, problem } = req.body || {};
  if (!description) return res.status(400).json({ error: 'Champ description requis' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' });

  const prompt = `Analyse cette idée de projet business et réponds UNIQUEMENT en JSON valide (sans markdown, sans commentaires).

Projet: ${projectName}
Catégorie: ${category}
Devise: ${currency}
Pays fondateur: ${founderCountry}
Marché cible (pays): ${targetCountry}
Description: ${description}
Marché cible (clients): ${targetMarket}
Problème résolu: ${problem}

JSON attendu :
{
  "reformulation": "<reformulation claire en 2-3 phrases — problème, cible, solution, valeur différenciante>",
  "hypotheses": [
    "<Ce qui doit être vrai pour que ça marche — hypothèse 1>",
    "<hypothèse 2>",
    "<hypothèse 3>"
  ],
  "risques": [
    "<Risque identifiable dès l'idée — risque 1>",
    "<risque 2>",
    "<risque 3>"
  ],
  "complexite": "<Simple|Moyen|Complexe>",
  "complexite_note": "<10 mots max>"
}`;

  try {
    const apiRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: "Tu es un expert en stratégie business et validation d'idées. Tu réponds toujours en JSON valide strict, sans markdown, sans commentaires.",
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
