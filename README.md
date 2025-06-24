# BizExpenses

BizExpenses est une application conçue pour simplifier la gestion des notes de frais en entreprise 🧾  
Chaque salarié peut soumettre ses justificatifs, un manager les valide ou les refuse, et les RH pilotent l'ensemble du système.

---

## Fonctionnalités principales 💡

- Authentification sécurisée par JWT
- Gestion des rôles : salarié, manager, admin
- Création de frais avec justificatif en ligne
- Validation ou refus des dépenses par les managers
- Configuration des règles (plafond, catégorie interdite, délai) par les RH
- Export CSV des dépenses validées
- Scanning automatique des tickets (OCR)
- Design responsive adapté au mobile

---

## Technologies utilisées 🛠️

- **Frontend** : Next.js, Tailwind CSS, TypeScript
- **Backend** : Node.js, Express, TypeScript
- **Base de données** : MongoDB
- **Fichiers** : Multer (stockage local)
- **Sécurité** : JWT, Bcrypt
- **CI/CD** : GitHub Actions
- **Déploiement** : VPS personnel (Nginx + PM2)

---

## Arborescence du projet 📁

```
bizexpenses/
├── backend/
│   ├── routes/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   └── uploads/
├── frontend/
│   ├── pages/
│   ├── components/
│   └── styles/
└── README.md
```

---

## Installation locale ⚙️

1. Clonez le dépôt
2. Installez les dépendances
3. Lancez le backend puis le frontend

```bash
git clone https://github.com/ton-user/bizexpenses.git
cd backend
npm install
cp .env.example .env
npm run dev

cd ../frontend
npm install
npm run dev
```

---

## Variables d’environnement 🔐

Copiez le fichier `.env.example` en `.env` dans le dossier `backend` et renseignez les variables nécessaires :

```env
MONGODB_URL = "mongodb://localhost:27017"
MONGODB_DB = ""

NSCALE_BASE_URL = "https://inference.api.nscale.com/v1";
NSCALE_API_KEY = "";

JWT_SECRET = ""
```

---

## Tests ✅

- Vous pouvez lancer les tests avec :
```bash
npm run test
```
- Tests manuels disponibles dans `jeux-tests.xlsx`
- Tests API dans `postman_collection.json`

---

## Déploiement 🌐

Déploiement réalisé sur un VPS personnel :
- Backend via PM2
- Front via Next.js build + Nginx
- Certificat SSL avec Let's Encrypt
- Fichiers uploadés localement et servis de façon sécurisée

---

## Auteur 🧑‍💻

Développé par **Hugo Chilemme** – dans le cadre du projet de fin d'études RNCP niveau 6.

---

## Licence 📄

Projet interne à vocation open source (licence à venir).
