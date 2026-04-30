import { isDemoMode, demoM7 } from '../../lib/demoData';

const BASE_URL = 'https://api.anthropic.com/v1/messages';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { m1Data, m3Data, m4Data } = req.body || {};
  if (!m1Data || !m3Data) return res.status(400).json({ error: 'm1Data et m3Data requis' });

  if (isDemoMode()) return res.status(200).json(demoM7);

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY non configurée' });

  const currency   = m1Data.currency || 'CAD';
  const v1Features = (m3Data.v1 || []).map(f => `${f.nom} (${f.complexite})`).join(', ');
  const prixPro    = m4Data?.pricing?.pro?.prix || 0;

  const prompt = `Tu es un expert en outils SaaS/tech. Génère la liste d'outils recommandés pour le stack de ce projet.

PROJET :
Nom: ${m1Data.projectName}
Catégorie: ${m1Data.category}
Fonctionnalités V1: ${v1Features}
Prix Pro: ${prixPro} ${currency}/mois
Pays fondateur: ${m1Data.founderCountry}
Devise: ${currency}

RÈGLES :
- Uniquement les outils essentiels pour buildre et lancer la V1
- Catégories : Hébergement, Base de données, Auth, Paiement, Email, Analytics, Design, Communication, Support, Autre
- Prix en ${currency}/mois (0 si gratuit)
- Lien officiel = URL réelle et vérifiable
- Coût_unique = frais ponctuels au lancement (domaine, compte etc.) — 0 si aucun
- Coût_mensuel = abonnement récurrent

Réponds UNIQUEMENT en JSON valide (sans markdown) :
{
  "outils": [
    {
      "nom": "<nom de l'outil>",
      "categorie": "<catégorie>",
      "plan": "<nom du plan recommandé>",
      "cout_mensuel": <montant en ${currency}>,
      "cout_unique": <montant en ${currency}>,
      "lien": "<URL officielle>",
      "pourquoi": "<1 phrase justifiant ce choix pour ce projet>"
    }
  ],
  "seuil_alerte": <MRR en ${currency} à partir duquel les coûts stack deviennent significatifs>
}`;

  try {
    const apiRes = await fetch(BASE_URL, {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 3000,
        system: "Tu es un expert en outils tech et SaaS. Tu réponds uniquement en JSON valide strict, sans markdown.",
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
