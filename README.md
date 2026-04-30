# PromptLab 🚀

### LLM Evaluation & Annotation Platform

A full-stack web application designed to simulate **real-world LLM post-training workflows**, including prompt-response evaluation, annotation, and quality benchmarking.

Built to demonstrate how AI systems are improved through structured human feedback.

---

## ✨ Key Features

* **Prompt Evaluation System**
  Submit prompt-response pairs and evaluate outputs using structured scoring.

* **Multi-Metric Scoring**
  Rate responses on:

  * Accuracy
  * Relevance
  * Coherence
  * Helpfulness

* **Annotation & Labeling**
  Tag responses with labels like *factual*, *hallucination*, *safe*, etc.

* **Workflow Status Tracking**
  Manage lifecycle: **Pending → Approved / Rejected**

* **Analytics Dashboard**
  Visual insights with charts and performance metrics.

* **Search & Filtering**
  Quickly find evaluations by status, type, or keywords.

* **Label Manager**
  Create, customize, and manage annotation labels.

* **REST API**
  Full CRUD operations for evaluations, labels, and stats.

---

## 🧠 Why This Project Matters

This platform replicates **human-in-the-loop AI training systems**, where:

* Data is annotated
* Outputs are evaluated
* Quality is benchmarked
* Feedback improves model performance

It reflects real workflows used in modern LLM pipelines.

---

## 🏗️ Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Frontend   | React 18, React Router |
| Charts     | Recharts               |
| Build Tool | Vite                   |
| Backend    | Node.js, Express       |
| Database   | JSON-based storage     |
| Styling    | Custom CSS             |

---

## ⚙️ Local Setup

### Prerequisites

* Node.js (v18+)
* npm

### Installation

```bash
git clone <your-repo-url>
cd promptlab
npm install
cd client && npm install
cd ../server && npm install
```

---

### Run the App

```bash
# Run both frontend + backend
npm run dev
```

OR run separately:

```bash
# Backend
cd server && node index.js

# Frontend
cd client && npm run dev
```

---

## 🌐 API Overview

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| GET    | /api/evaluations     | Fetch all evaluations |
| POST   | /api/evaluations     | Create evaluation     |
| PATCH  | /api/evaluations/:id | Update evaluation     |
| DELETE | /api/evaluations/:id | Delete evaluation     |
| GET    | /api/labels          | Fetch labels          |
| POST   | /api/labels          | Create label          |
| GET    | /api/stats           | Dashboard stats       |

---

## 🚀 Deployment

### Full Stack on Railway

1. Push project to GitHub

2. Deploy via Railway

3. Set environment variable:

   ```
   NODE_ENV=production
   ```

4. Use:

   ```
   Build Command: npm install && cd client && npm install && npm run build
   Start Command: node server/index.js
   ```

---

### Alternative Setup

* Frontend → Vercel
* Backend → Railway

---

## 📁 Project Structure

```
promptlab/
├── client/        # React frontend
├── server/        # Express backend
├── package.json
└── README.md
```

---

## 📊 Evaluation Criteria

| Metric      | Description           |
| ----------- | --------------------- |
| Accuracy    | Factual correctness   |
| Relevance   | Alignment with prompt |
| Coherence   | Clarity & structure   |
| Helpfulness | Practical usefulness  |

Score Range: **1–5 per metric**

---

## 🎯 What This Demonstrates

* Structured data handling
* API design & integration
* Real-world AI evaluation workflows
* Full-stack system design
* Problem-solving in applied AI contexts

---

## 🧩 Built For

Designed to align with roles involving:

* LLM evaluation
* Data annotation
* AI quality analysis
* Prompt engineering workflows

---

## 💬 Final Note

This isn’t just a project.
It’s a **simulation of how modern AI systems are trained, evaluated, and improved**.

---
