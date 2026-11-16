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