const BASE_HEADERS = (apiKey) => ({
  'Content-Type': 'application/json',
  'x-api-key': apiKey,
  'anthropic-version': '2023-06-01',
});

const WEB_HEADERS = (apiKey) => ({
  ...BASE_HEADERS(apiKey),
  'anthropic-beta': 'web-search-2025-03-05',
});

async function callAnthropic(headers, body) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Erreur Anthropic');
  let text = '';
  for (const block of data.content || []) {
    if (block.type === 'text') text += block.text;
  }
  return JSON.parse(text.replace(/```json|```/g, '').trim());
}

async function handleStep1(apiKey, idea, context) {
  return callAnthropic(WEB_HEADERS(apiKey), {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 20000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Recherche web : données de marché 2024-2025 pour cette idée business.
Idée: "${idea}"
Contexte: catégorie ${context.category || ''}, marché ${context.targetCountry || ''}, devise ${context.currency || 'CAD'}

RÈGLES STRICTES :
- Sources datées 2024-2025 obligatoires
- Si données non trouvées → "N/A", JAMAIS inventées
- Inclure source_nom, source_url complète, source_date

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "taille": "<valeur chiffrée ou N/A>",
  "source_nom": "<nom de la source ou N/A>",
  "source_url": "<URL complète ou N/A>",
  "source_date": "<mois année ou N/A>",
  "croissance": "<% annuel ou N/A>",
  "maturite": "<émergent|en croissance|mature|saturé>",
  "tendance": "<une phrase avec données chiffrées ou N/A>"
}`,
    }],
  });
}

async function handleStep2(apiKey, idea, context, marche) {
  return callAnthropic(WEB_HEADERS(apiKey), {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 20000,
    tools: [{ type: 'web_search_20250305', name: 'web_search' }],
    messages: [{
      role: 'user',
      content: `Recherche web : concurrents réels et arguments pour cette idée business.
Idée: "${idea}"
Données marché: ${JSON.stringify(marche)}

RÈGLES STRICTES :
- Concurrents = entreprises qui existent réellement (vérifiable en ligne)
- Arguments pour : minimum 5, chacun étayé par une donnée concrète
- Arguments contre : maximum 3, factuels uniquement
- Ne jamais inventer un concurrent

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "concurrents": [{ "nom": "<nom>", "detail": "<une phrase sur leur positionnement>" }],
  "pour": ["<argument étayé par donnée concrète>"],
  "contre": ["<risque factuel, une phrase>"]
}`,
    }],
  });
}

async function handleStep3(apiKey, idea, context, marche, s2) {
  return callAnthropic(BASE_HEADERS(apiKey), {
    model: 'claude-sonnet-4-20250514',
    max_tokens: 15000,
    messages: [{
      role: 'user',
      content: `Synthèse et score final — PAS de recherche web. Analyse critique et indépendante.
Idée: "${idea}"
Contexte: ${context.category || ''}, ${context.targetCountry || ''}
Données marché: ${JSON.stringify(marche)}
Concurrents + arguments: ${JSON.stringify(s2)}

RÈGLES :
- Peut contredire étapes 1 et 2 si les données sont insuffisantes ou contradictoires
- score_final calculé à partir des 4 dimensions (moyenne pondérée)
- verdict : GO si ≥70, MAYBE si 50-69, NO-GO si <50
- recommendation : 2 phrases directes et actionnables
- confiance 1-5 selon qualité des données trouvées

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "score_final": <0-100>,
  "verdict": "<GO|MAYBE|NO-GO>",
  "recommendation": "<2 phrases max>",
  "confiance": <1-5>,
  "note_confiance": "<10 mots max>",
  "dimensions": {
    "désirabilité": { "score": <0-10>, "note": "<10 mots max>" },
    "faisabilité":  { "score": <0-10>, "note": "<10 mots max>" },
    "viabilité":    { "score": <0-10>, "note": "<10 mots max>" },
    "timing":       { "score": <0-10>, "note": "<10 mots max>" }
  }
}`,
    }],
  });
}

import { isDemoMode, demoM2 } from '../../lib/demoData';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { step, idea, context, marche, step2Data } = req.body || {};
  if (!idea) return res.status(400).json({ error: 'Champ idea requis' });
  if (![1, 2, 3].includes(step)) return res.status(400).json({ error: 'step doit être 1, 2 ou 3' });

  if (isDemoMode()) {
    if (step === 1) return res.status(200).json(demoM2.step1);
    if (step === 2) return res.status(200).json(demoM2.step2);
    if (step === 3) return res.status(200).json(demoM2.step3);
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' });

  try {
    if (step === 1) return res.status(200).json(await handleStep1(apiKey, idea, context || {}));
    if (step === 2) return res.status(200).json(await handleStep2(apiKey, idea, context || {}, marche));
    if (step === 3) return res.status(200).json(await handleStep3(apiKey, idea, context || {}, marche, step2Data));
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
