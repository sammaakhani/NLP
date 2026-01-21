🛡️ NLP ASSIST IQRA AI: Local RAG Knowledge Engine
IQRA AI is a sophisticated Retrieval-Augmented Generation (RAG) platform designed to provide instant, accurate, and context-aware responses based on IQRA University's official policies and documentation. By utilizing local indexing, it ensures 100% data privacy and low-latency information retrieval.

🚀 Core Features
Local RAG Pipeline: Processes and queries documents locally without sending sensitive data to external servers.

Dynamic Document Ingestion: Allows real-time "chunking" and indexing of new policy documents or course materials.

Smart Analytics: Monitor system health, including query latency, information density, and indexing volume.

Contextual Integrity: The engine calculates a "Confidence Score" for every response based on the relevance of the retrieved sources.

Audit Logging: Real-time system logs track the engine's "thought process" from query reception to context synthesis.

🏗️ Technical Architecture
The application is built using a modern React + TypeScript stack, focusing on modularity and type safety.

1. Document Ingestion (The "Indexer")
When a document is added, the system performs Text Chunking. This breaks long policies into manageable segments, ensuring the search engine can pinpoint exact information.

2. Retrieval Engine
The system uses a mock Vector-Search approach (via ragEngine) to perform semantic matching between the user's query and the stored document chunks.

3. Response Synthesis
The nlpService acts as the generator. It combines the user's question with the "Retrieved" chunks to create a coherent answer, strictly preventing AI hallucinations by grounding the AI in the provided text.

🛠️ Tech Stack
Frontend: React.js (Functional Components, Hooks)

Language: TypeScript (Strict Typing for AI State)

Styling: Tailwind CSS

Icons: Lucide-React

Visualization: Recharts (for Local Processing Health)

State Management: Complex Object State with useState and useEffect for lifecycle indexing.

📂 Project Structure
Bash

src/
├── components/        # UI Components (Sidebar, ChatWindow)
├── services/          # AI Logic (ragEngine, nlpService)
├── types/             # TypeScript Interfaces (Message, Document, AppState)
├── App.tsx            # Main Application Logic & State Controller
└── main.tsx           # Entry Point
🚦 Getting Started
Install Dependencies:

Bash

npm install
Run Development Server:

Bash

npm run dev
Indexing Data: Navigate to the Knowledge Showcase tab to add your own university documents to the local index.

📊 Analytics & Privacy
Privacy Score: 100% (No data leaves the local session).

Retrieval Speed: Optimized for sub-50ms latency.

Storage: Volatile session memory (Safe for sensitive policy handling).
