// Données fictives réalistes utilisées quand NEXT_PUBLIC_DEMO_MODE=true ou ANTHROPIC_API_KEY absent

export const isDemoMode = () =>
  process.env.NEXT_PUBLIC_DEMO_MODE === 'true' || !process.env.ANTHROPIC_API_KEY;

export const demoM1 = {
  reformulation:
    "Une plateforme SaaS qui aide les PME à centraliser leur gestion de projets et à collaborer en temps réel, éliminant les silos d'information qui coûtent en moyenne 2h/jour par employé. La valeur différenciante est une IA intégrée qui priorise automatiquement les tâches selon les deadlines critiques.",
  hypotheses: [
    "Les PME de 10-50 personnes sont prêtes à payer pour un outil de gestion de projets si l'onboarding prend moins de 30 minutes",
    "L'intégration IA de priorisation réduit le temps de planification de 40% vs les outils manuels",
    "Le marché B2B SaaS PME accepte un prix entre 29$ et 79$/mois par équipe",
  ],
  risques: [
    "Marché saturé avec des acteurs établis (Notion, Asana, Monday) qui ont des ressources marketing massives",
    "Le cycle de vente B2B PME peut s'étirer à 3-6 mois, retardant les revenus",
    "La dépendance à l'IA augmente les coûts d'infrastructure à mesure que la base client grandit",
  ],
  complexite: 'Moyen',
  complexite_note: 'Stack technique standard mais différenciation IA à valider',
};

export const demoM2 = {
  step1: {
    taille: '47,2 milliards USD',
    source_nom: 'Gartner Market Research',
    source_url: 'https://www.gartner.com/en/newsroom/press-releases/2024-04-11-gartner-forecasts',
    source_date: 'avril 2024',
    croissance: '12,3%',
    maturite: 'en croissance',
    tendance:
      "Le marché des outils de gestion de projet IA devrait atteindre 9,8 milliards USD d'ici 2027 selon IDC 2024",
  },
  step2: {
    concurrents: [
      { nom: 'Asana', detail: 'Leader du marché avec 131 000 clients payants, positionné sur les grandes entreprises' },
      { nom: 'Monday.com', detail: 'Croissance de 34% YoY, très fort sur les PME avec une interface no-code' },
      { nom: 'ClickUp', detail: "Stratégie d'acquisition agressive, freemium généreux ciblant les startups et équipes tech" },
      { nom: 'Notion', detail: 'Hybride docs/projets, fort en Europe et chez les créateurs de contenu' },
    ],
    pour: [
      'Le marché SaaS de gestion de projets croît à 12,3% annuellement, laissant de la place aux nouveaux entrants avec une niche claire',
      'Les PME sous-équipées représentent 78% du tissu économique et sont sous-servies par les outils enterprise',
      "L'IA de priorisation est un différenciateur réel — aucun concurrent direct ne propose ça en natif sous 50$/mois",
      'Un CAC faible est atteignable via le SEO et le bouche-à-oreille en B2B PME',
      'Les marges SaaS typiques (70-80%) permettent une scalabilité rapide une fois le seuil de rentabilité atteint',
    ],
    contre: [
      "Asana et Monday disposent de budgets marketing 100x supérieurs, rendant l'acquisition payante très chère",
      "Le churn en B2B SaaS PME est élevé (15-25% annuel) si l'onboarding n'est pas parfait",
      "La différenciation IA peut être copiée par les acteurs établis en 6-12 mois",
    ],
  },
  step3: {
    score_final: 68,
    verdict: 'MAYBE',
    recommendation:
      "Valide d'abord l'hypothèse de différenciation IA avec 10 entretiens PME avant de coder quoi que ce soit. Si 7/10 voient la valeur, lance une landing page et vise 20 pre-signups en 30 jours.",
    confiance: 3,
    note_confiance: 'Données marché disponibles mais niche IA peu documentée',
    dimensions: {
      désirabilité: { score: 7, note: 'Douleur réelle mais solutions alternatives nombreuses' },
      faisabilité:  { score: 7, note: 'Stack technique accessible, compétences requises standard' },
      viabilité:    { score: 6, note: 'Unit economics tenables si CAC < 150$' },
      timing:       { score: 8, note: "Adoption IA en forte hausse en 2024-2025" },
    },
  },
};

export const demoM3 = {
  brief:
    "Une plateforme de gestion de projets pensée pour les PME qui perdent du temps à jongler entre emails, tableurs et réunions. L'IA intégrée priorise automatiquement les tâches critiques. La V1 cible les équipes de 5-20 personnes qui veulent de la clarté sans la complexité des outils enterprise.",
  v1: [
    { nom: 'Tableau de bord projets', priorite: 'Critique', complexite: 'Simple', description: 'Vue centralisée de tous les projets actifs avec statut, deadline et responsable. Point d\'entrée principal de l\'app.', hypothese_liee: "Les utilisateurs ont besoin d'une vue globale instantanée sans navigation complexe" },
    { nom: 'Gestion des tâches', priorite: 'Critique', complexite: 'Moyen', description: 'Créer, assigner et suivre les tâches avec priorité, deadline et commentaires. Base fonctionnelle indispensable.', hypothese_liee: "Les PME acceptent de migrer leurs tâches dans un nouvel outil si l'import est simple" },
    { nom: 'Priorisation IA', priorite: 'Critique', complexite: 'Complexe', description: 'Algorithme qui analyse deadlines et dépendances pour suggérer l\'ordre optimal de traitement des tâches.', hypothese_liee: "L'IA de priorisation réduit le temps de planification de 40%" },
    { nom: 'Collaboration en temps réel', priorite: 'Haute', complexite: 'Moyen', description: 'Commentaires et mises à jour instantanées sur les tâches, avec notifications push et email digest quotidien.', hypothese_liee: 'La collaboration temps réel réduit le nombre de réunions de synchronisation' },
    { nom: 'Onboarding guidé', priorite: 'Haute', complexite: 'Simple', description: 'Wizard de setup en 5 étapes avec templates de projets pré-configurés pour différentes industries.', hypothese_liee: "Un onboarding < 30 min est la condition principale d'activation" },
    { nom: 'Rapports hebdomadaires', priorite: 'Moyenne', complexite: 'Simple', description: 'Résumé automatique des tâches complétées, en retard et à venir, envoyé chaque lundi aux managers.', hypothese_liee: 'Les managers adoptent l\'outil si ça remplace leurs réunions de suivi' },
  ],
  v2: [
    { nom: 'Intégrations natives', apport: 'Connecte Slack, Google Drive et GitHub pour éviter les allers-retours entre outils' },
    { nom: 'Time tracking', apport: "Ajoute une couche de facturation et d'analyse de productivité par projet" },
    { nom: 'Gestion budgets projets', apport: 'Permet de tracker les coûts réels vs estimés et d\'anticiper les dépassements' },
    { nom: 'Portail client', apport: 'Ouvre un espace de visibilité aux clients sans leur donner accès à l\'outil complet' },
  ],
  v3: [
    { nom: 'IA générative de brief', vision: 'Génère automatiquement des briefs de projet complets à partir d\'une simple description' },
    { nom: 'Marketplace de templates sectoriels', vision: 'Écosystème communautaire de templates validés par industrie' },
    { nom: 'Prédiction de risques', vision: 'Détecte les projets à risque de dérapage avant qu\'ils ne déraillent' },
  ],
};

export const demoM4 = {
  modeles: [
    { nom: 'SaaS par siège', type: 'Abonnement', description: 'Facturation mensuelle par utilisateur, modèle standard et prévisible.', pour: ['Revenus récurrents prévisibles', "Simple à comprendre pour le client"], contre: ["Frein à l'adoption si l'équipe grandit vite"] },
    { nom: 'Freemium + upgrade', type: 'Freemium', description: "Plan gratuit limité pour générer de l'adoption organique, upgrade vers Pro pour les fonctionnalités IA.", pour: ['CAC faible via bouche-à-oreille', "Réduit la friction à l'entrée"], contre: ['Taux de conversion Free→Pro souvent < 5%', "Coûts d'infrastructure pour les utilisateurs gratuits"] },
    { nom: 'Par équipe', type: 'Abonnement', description: "Tarification à l'équipe (pas par siège) pour éliminer la friction de croissance.", pour: ["Encourage l'expansion dans les organisations", 'Valeur perçue élevée par les décideurs'], contre: ["Revenus par compte moins prévisibles", "Complexité de définir 'une équipe'"] },
  ],
  recommandation: "Freemium + upgrade — le CAC est critique en phase de lancement, l'adoption organique via un plan gratuit généreux est la meilleure façon de croître sans budget marketing massif.",
  pricing: {
    gratuit:  { nom: 'Starter',  prix: 0,   features: ['3 projets max', '5 utilisateurs max', 'Gestion des tâches basique', 'Rapports hebdomadaires'] },
    pro:      { nom: 'Pro',      prix: 49,  features: ['Projets illimités', '20 utilisateurs max', 'Priorisation IA', 'Collaboration temps réel', 'Intégrations (Slack, Drive)'] },
    business: { nom: 'Business', prix: 129, features: ['Utilisateurs illimités', 'Toutes fonctionnalités Pro', 'Portail client', 'SSO + contrôle admin avancé', 'Support prioritaire'] },
  },
  projections: {
    hypothese_clients_m6: 45,
    hypothese_clients_m12: 180,
    mrr_m6: 2205,
    mrr_m12: 8820,
    ltv_estime: 1176,
    cac_cible: 120,
    seuil_rentabilite_clients: 28,
    note: "Hypothèse : 70% des clients payants sur le plan Pro (49$/mois), taux de conversion Free→Pro de 4%, coûts fixes de 1 400$/mois",
  },
};

export const demoM5 = {
  canaux: [
    { nom: 'SEO + contenu', type: 'Organique', justification: "Les PME cherchent activement des alternatives à Asana/Monday — un blog ciblant 'meilleur outil gestion projet PME' peut générer du trafic qualifié gratuitement.", action_semaine: "Publier 2 articles comparatifs : 'Asana vs Monday pour PME en 2025' et '5 erreurs de gestion de projet que font les équipes de 10 personnes' sur votre domaine." },
    { nom: 'Cold outreach LinkedIn', type: 'Direct', justification: 'Les directeurs de PME et chefs de projet sont très actifs sur LinkedIn — un message personnalisé avec demo gratuite a un taux de réponse de 15-25% sur cette cible.', action_semaine: "Identifier 50 chefs de projet dans des PME 10-50 personnes sur LinkedIn et envoyer un message personnalisé proposant une demo 20 min en échange d'un retour honnête." },
    { nom: 'Communautés et forums', type: 'Communauté', justification: "Reddit (r/projectmanagement), Indie Hackers et Product Hunt concentrent votre early adopter idéal qui cherche des alternatives aux gros acteurs.", action_semaine: "Poster un 'Show HN' et un post Reddit montrant l'interface et la feature IA — demander des retours, pas des ventes." },
  ],
  objectifs: {
    j30: { mrr: 0,    clients_payants: 0,  signups: 25,  action_cle: "Atteindre 25 signups sur la landing page et faire 15 entretiens utilisateurs pour valider le messaging" },
    j60: { mrr: 490,  clients_payants: 10, signups: 80,  action_cle: "Convertir 10 utilisateurs gratuits en Pro via une offre de lancement limitée à 39$/mois pour les 20 premiers" },
    j90: { mrr: 1470, clients_payants: 30, signups: 200, action_cle: "Activer le bouche-à-oreille via un programme de referral : 1 mois offert par client amené" },
  },
  plan_b: {
    declencheur: 'Si MRR < objectif J60',
    actions: [
      "Pivoter vers un service d'implémentation accompagné : vendre des sessions de setup à 299$/session pour financer le développement",
      "Contacter directement 20 PME locales pour proposer un accès bêta gratuit 6 mois en échange de témoignages et d'une étude de cas publique",
      "Revoir le pricing à la baisse (29$/mois) et augmenter la valeur du plan gratuit pour accélérer la conversion organique",
    ],
  },
};

export const demoM7 = {
  outils: [
    { nom: 'Vercel',       categorie: 'Hébergement',    plan: 'Pro',              cout_mensuel: 20, cout_unique: 0, lien: 'https://vercel.com',         pourquoi: 'Déploiement Next.js natif avec CDN global, parfait pour une app SaaS en phase de lancement' },
    { nom: 'Supabase',     categorie: 'Base de données', plan: 'Pro',              cout_mensuel: 25, cout_unique: 0, lien: 'https://supabase.com',        pourquoi: 'PostgreSQL managé avec auth, real-time et storage inclus — remplace Firebase avec plus de flexibilité' },
    { nom: 'Supabase Auth',categorie: 'Auth',            plan: 'Inclus Supabase',  cout_mensuel: 0,  cout_unique: 0, lien: 'https://supabase.com/auth',   pourquoi: "Auth complète (email, OAuth, magic link) incluse dans Supabase — aucune raison d'ajouter une autre solution" },
    { nom: 'Stripe',       categorie: 'Paiement',        plan: 'Pay-as-you-go',    cout_mensuel: 0,  cout_unique: 0, lien: 'https://stripe.com',          pourquoi: "Standard du marché pour le SaaS, gestion des abonnements et facturation automatisée sans frais fixes" },
    { nom: 'Resend',       categorie: 'Email',           plan: 'Pro',              cout_mensuel: 20, cout_unique: 0, lien: 'https://resend.com',          pourquoi: 'API email moderne pensée pour les développeurs, deliverability excellente et intégration Next.js triviale' },
    { nom: 'PostHog',      categorie: 'Analytics',       plan: 'Free',             cout_mensuel: 0,  cout_unique: 0, lien: 'https://posthog.com',         pourquoi: 'Analytics produit open-source avec replay de sessions et feature flags — 1M events gratuits/mois' },
    { nom: 'Figma',        categorie: 'Design',          plan: 'Starter',          cout_mensuel: 0,  cout_unique: 0, lien: 'https://figma.com',           pourquoi: 'Design collaboratif gratuit pour un fondateur solo ou une petite équipe en phase de lancement' },
    { nom: 'Slack',        categorie: 'Communication',   plan: 'Free',             cout_mensuel: 0,  cout_unique: 0, lien: 'https://slack.com',           pourquoi: 'Communication équipe et canal client/bêta testeurs, gratuit et suffisant pour moins de 10 personnes' },
  ],
  seuil_alerte: 500,
};
