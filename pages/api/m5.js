const BASE_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { m1Data, m2Data, m3Data, m4Data } = req.body || {};
  if (!m1Data || !m3Data || !m4Data) return res.status(400).json({ error: 'm1Data, m3Data et m4Data requis' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' });

  const currency = m1Data.currency || 'CAD';
  const prixPro  = m4Data.pricing?.pro?.prix || 0;

  const prompt = `Tu es un expert en growth marketing. Génère le plan de lancement pour ce projet.

PROJET :
Nom: ${m1Data.projectName}
Catégorie: ${m1Data.category}
Marché cible: ${m1Data.targetMarket}
Pays: ${m1Data.targetCountry}
Problème: ${m1Data.problem}
Brief: ${m3Data.brief}
Prix Pro: ${prixPro} ${currency}/mois
Modèle choisi: ${m4Data.modele_choisi || m4Data.recommandation || ''}
MRR cible M6: ${m4Data.projections?.mrr_m6 || 0} ${currency}
MRR cible M12: ${m4Data.projections?.mrr_m12 || 0} ${currency}
${m2Data ? `Concurrents: ${(m2Data.result?.concurrents || []).map(c => c.nom).join(', ')}` : ''}

RÈGLES :
- Maximum 3 canaux d'acquisition
- Chaque canal doit être justifié pour CE projet spécifiquement
- Action immédiate = ce que le fondateur peut faire cette semaine, concrètement
- Objectifs en ${currency}, réalistes et progressifs
- Plan B : actions concrètes si J60 non atteint

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "canaux": [
    {
      "nom": "<nom du canal>",
      "type": "<Organique|Payant|Partenariat|Communauté|Contenu|Direct>",
      "justification": "<pourquoi ce canal pour ce projet précis, 1-2 phrases>",
      "action_semaine": "<action concrète à faire cette semaine — très spécifique>"
    }
  ],
  "objectifs": {
    "j30": {
      "mrr": <montant ${currency}>,
      "clients_payants": <nombre>,
      "signups": <nombre>,
      "action_cle": "<ce qui doit absolument être fait à J30>"
    },
    "j60": {
      "mrr": <montant ${currency}>,
      "clients_payants": <nombre>,
      "signups": <nombre>,
      "action_cle": "<ce qui doit absolument être fait à J60>"
    },
    "j90": {
      "mrr": <montant ${currency}>,
      "clients_payants": <nombre>,
      "signups": <nombre>,
      "action_cle": "<ce qui doit absolument être fait à J90>"
    }
  },
  "plan_b": {
    "declencheur": "Si MRR < objectif J60",
    "actions": [
      "<action concrète B1 — changer de canal ou d'approche>",
      "<action concrète B2>",
      "<action concrète B3>"
    ]
  }
}`;

  try {
    const apiRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: "Tu es un expert en growth marketing et lancement de produit. Tu réponds uniquement en JSON valide strict, sans markdown.",
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
