# 🍲 Rasoi Record

**Rasoi Record** is an AI-powered food wastage tracking and reporting application designed for restaurants and kitchens to monitor, record, and analyse food wastage data easily.

---

## ✨ Features

- ✅ Log daily food wastage with quantity & cost.
- ✅ AI-generated weekly summary reports.
- ✅ Printable reports for record-keeping.
- ✅ User authentication.
- ✅ Fully responsive design.

---

## 🧩 Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Hosting:** Netlify
- **Styling:** Tailwind CSS
- **Icons:** Lucide-react

---

## 🚀 Live Demo

👉 [View Live Site](https:rasoirecord.netlify.app)

---

## ⚙️ Local Setup

1️⃣ Clone this repo:
```bash
git clone https://github.com/your-username/rasoi-record.git
cd rasoi-record
2️⃣ Install dependencies:


npm install
3️⃣ Create a .env.local file for your Firebase keys:

env
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID

4️⃣ Run locally:
npm run dev
Visit http://localhost:3000.

📦 Build & Deploy
To build for production:

npm run build
npm start
To deploy on Netlify:

Connect your GitHub repo.

Use:

Build Command: npm run build

Publish Directory: .next

Add @netlify/next plugin in netlify.toml:

[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/next"
Netlify will handle serverless SSR automatically.

📄 License
This project is licensed under the MIT License — feel free to use and expand!

🙌 Contribution
PRs, issues & feature suggestions are welcome!
Star ⭐ this repo if you find it useful.
