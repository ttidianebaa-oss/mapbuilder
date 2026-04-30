import { demoM3 } from '../../lib/demoData';

const BASE_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (process.env.DEMO_MODE === 'true') return res.status(200).json(demoM3);

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { m1Data, m2Data } = req.body || {};
  if (!m1Data) return res.status(400).json({ error: 'm1Data requis' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' });

  const prompt = `Tu es un expert en product management. Génère la structure produit pour ce projet.

PROJET :
Nom: ${m1Data.projectName}
Catégorie: ${m1Data.category}
Description: ${m1Data.description}
Marché cible: ${m1Data.targetMarket}
Problème résolu: ${m1Data.problem}
Reformulation: ${m1Data.aiResult?.reformulation || ''}
Complexité: ${m1Data.aiResult?.complexite || 'Moyen'}
${m2Data ? `Score validation: ${m2Data.result?.score_final}/100 — ${m2Data.result?.verdict}` : ''}
${m2Data ? `Concurrents: ${(m2Data.result?.concurrents || []).map(c => c.nom).join(', ')}` : ''}

RÈGLES ABSOLUES :
- V1 MVP : maximum 6 fonctionnalités — jamais plus
- Chaque fonctionnalité V1 a une priorité (Critique/Haute/Moyenne) et complexité (Simple/Moyen/Complexe)
- V2 : 3-5 fonctionnalités qui étendent la V1
- V3+ : 2-4 fonctionnalités vision long terme
- Brief produit : 2-3 phrases max — problème, cible, valeur différenciante

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "brief": "<2-3 phrases — problème, cible, valeur différenciante>",
  "v1": [
    {
      "nom": "<nom de la fonctionnalité>",
      "priorite": "<Critique|Haute|Moyenne>",
      "complexite": "<Simple|Moyen|Complexe>",
      "description": "<1-2 phrases>",
      "hypothese_liee": "<hypothèse critique que ça valide>"
    }
  ],
  "v2": [
    {
      "nom": "<nom>",
      "apport": "<ce que ça ajoute par rapport à V1, 1 phrase>"
    }
  ],
  "v3": [
    {
      "nom": "<nom>",
      "vision": "<vision long terme, 1 phrase>"
    }
  ]
}`;

  try {
    const apiRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: "Tu es un expert product manager. Tu réponds uniquement en JSON valide strict, sans markdown.",
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
