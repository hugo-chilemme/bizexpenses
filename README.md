# BizExpenses

BizExpenses is an application designed to simplify expense report management in companies 🧾  
Each employee can submit receipts, a manager approves or rejects them, and HR oversees the entire system.

---

## Main Features 💡

- Secure authentication with JWT
- Role management: employee, manager, admin
- Create expenses with online receipt upload
- Managers can approve or reject expenses
- HR can configure rules (limits, forbidden categories, deadlines)
- Export validated expenses to CSV
- Automatic receipt scanning (OCR)
- Responsive design for mobile

---

## Technologies Used 🛠️

- **Frontend**: Next.js, Tailwind CSS, TypeScript
- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB
- **File Handling**: Multer (local storage)
- **Security**: JWT, Bcrypt
- **CI/CD**: GitHub Actions
- **Deployment**: Personal VPS (Nginx + PM2)

---

## Project Structure 📁

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

## Local Installation ⚙️

1. Clone the repository
2. Install dependencies
3. Start the backend, then the frontend

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

## Environment Variables 🔐

Copy the `.env.example` file to `.env` in the `backend` folder and fill in the required variables:

```env
MONGODB_URL = "mongodb://localhost:27017"
MONGODB_DB = ""

NSCALE_BASE_URL = "https://inference.api.nscale.com/v1";
NSCALE_API_KEY = "";

JWT_SECRET = ""
```

---

## Tests ✅

- Run tests with:
```bash
npm run test
```
- Manual tests available in `jeux-tests.xlsx`
- API tests in `postman_collection.json`

---

## Deployment 🌐

Deployed on a personal VPS:
- Backend via PM2
- Frontend via Next.js build + Nginx
- SSL certificate with Let's Encrypt
- Files uploaded locally and served securely

---

## Author 🧑‍💻

Developed by **Hugo Chilemme** – as part of the RNCP level 6 graduation project.

---

## License 📄

Internal project, open source license coming soon.

