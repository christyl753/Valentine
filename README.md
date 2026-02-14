# Valentine (déploiement Vercel)

Ce dépôt contient une petite appli frontend + API serverless pour Vercel.

Prérequis
- Un compte GitHub
- Un compte Vercel
- Une base PostgreSQL (ex : Supabase, ElephantSQL) avec l'URL `DATABASE_URL`

Fichiers importants
- `api/` : fonctions serverless (name, answer, all, user-data)
- `.env.example` : exemple des variables d'environnement
- `migrate.sql` : script SQL minimal pour créer les tables

Sécurité des secrets
- NE COMMITEZ JAMAIS votre `.env` contenant `DATABASE_URL`.
- `.env` est listé dans `.gitignore`.
- Si vous avez accidentellement commité `.env, exécutez :

```powershell
git rm --cached .env
git commit -m "Remove .env from repository"
git push
```

Déploiement sur GitHub + Vercel (résumé)
1. Initialiser et valider localement :

```powershell
cd "C:\Users\tiant\OneDrive\Bureau\valentine vercel"
git init
git add .
git commit -m "Initial commit"
git branch -M main
```

2. Créer un repo GitHub (via `gh` ou web) puis lier et pousser :

```powershell
# si vous utilisez gh
gh repo create <votre-user>/<repo> --public --source=. --remote=origin --push
# sinon via le web puis
git remote add origin https://github.com/<votre-user>/<repo>.git
git push -u origin main
```

3. Sur Vercel : importer le repo GitHub et dans **Settings → Environment Variables** ajouter `DATABASE_URL` pour les environnements `Preview` et `Production` (et `Development` si besoin).

4. Exécuter les migrations sur votre base (exécuter `migrate.sql` contre votre base) :

```powershell
# Exemple avec psql
psql <DATABASE_URL> -f migrate.sql
# ou via l'interface Supabase / client SQL
```

5. Vercel déploiera automatiquement. Testez l'URL fournie.

Support & suggestions
- Si vous voulez, je peux :
  - initialiser le repo Git localement et pousser (j'aurai besoin d'autorisation/infos),
  - exécuter la migration si vous me fournissez l'accès à la DB (non recommandé),
  - ou guider pas à pas pendant que vous exécutez les commandes.
# projet-perso-pour-s-amuser
Quelques projets personnelles que je fais pour m'amuser.
