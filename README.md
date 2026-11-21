# MultiMind AI

### AI-Powered Multi-Model Battle Arena

MultiMind AI is an AI-powered platform where multiple AI models compete to solve the same problem, while a selected AI judge evaluates their responses and determines the better solution.
It allows users to compare AI-generated answers, understand the reasoning behind evaluations, and explore different model capabilities through an interactive chat interface.


## Features

- **Multi-Model Responses:** Generate responses from Groq and Cohere simultaneously.
- **AI Judge:** Choose between Gemini, Groq, and Cohere to evaluate the generated responses.
- **Intelligent Evaluation:** Compare answers using scores and detailed reasoning.
- **Real-Time Streaming:** Receive responses through Server-Sent Events (SSE).
- **Chat History:** Save and revisit previous AI battles.
- **Authentication:** Secure user registration, login, and logout using JWT.
- **Battle Management:** Create new battles, switch between conversations, and delete chat history.
- **Chat-Specific Judge Selection:** Each battle maintains its own judge selection based on its conversation history.
- **Markdown Rendering:** Display formatted responses and highlighted code blocks.
- **Persistent Conversations:** Access saved conversations even after refreshing or logging back in.


### Tech Stack

## Frontend
- React.js
- Vite
- Tailwind CSS
- Axios
- React Router DOM
- Lucide React
- React Markdown
- Highlight.js

## Backend
- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JSON Web Token (JWT)
- LangChain
- LangGraph

## AI Models
- Google Gemini
- Groq
- Cohere

## Communication
- REST APIs
- Server-Sent Events (SSE)


## How It Works

1. A user enters a question or problem.
2. The backend sends the problem to multiple AI models.
3. Groq and Cohere generate their responses in parallel.
4. The selected judge model evaluates both responses.
5. The judge provides scores and reasoning.
6. Results are streamed to the frontend.
7. The conversation is saved for future access.


## Project Structure

MultiMind-AI/
│
├── backend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
└── README.md


## Getting Started


### Prerequisites

- Node.js
- npm
- MongoDB
- API keys for Google Gemini, Groq, and Cohere


### 1. Clone the Repository

```bash
git clone https://github.com/sarva1210/MultiMind-AI.git

```

### 2. Navigate to the Project

```bash
cd MultiMind-AI
```

### 3. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory and configure the required environment variables.

```env
PORT=
MONGODB_URI=
JWT_SECRET=
GOOGLE_API_KEY=
GROQ_API_KEY=
COHERE_API_KEY=
```

Add any additional variables required by your backend configuration.

Start the backend:

```bash
npm run dev
```

### 4. Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server will start using Vite. Open the local URL displayed in your terminal.

---

## Environment Variables

Keep API keys and sensitive credentials inside environment files.

**Important:** Never commit `.env` files or expose API keys in the frontend.