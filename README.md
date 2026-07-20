# CodeRadar 🚀

CodeRadar is a high-fidelity cyberpunk developer profiling and telemetry visualization dashboard. It transforms GitHub contribution histories, developer activity, and coding metrics into an immersive, interactive HUD experience.

## 🌟 Key Features

- **Cybernetic Radar HUD Overlay**: An interactive, sweeping circular radar overlay visualizing active developer coordinates, sector pings, and telemetry logs.
- **3D Contribution Cube**: Interactive 3D voxel representation of developer contribution patterns.
- **High-Fidelity Telemetry Metrics**: Analytics panels tracking active PRs, commits, repositories, organization nodes, and language distributions.
- **Interactive TechieBot**: A built-in AI assistant to chat about developer stats, project analysis, and code diagnostics (powered by the Gemini API).
- **Preset Developer Profiles**: Instantly load and preview detailed profiles or query any GitHub user profile.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide Icons
- **Backend / Proxy**: Node.js, Express, tsx (for local development)
- **AI Integration**: `@google/genai` (Google Gemini SDK)
- **Build / Bundler**: Vite, esbuild

---

## 🚀 Getting Started

### 1. Prerequisites

Make sure you have Node.js (v18 or higher) and npm installed.

### 2. Clone the Repository

```bash
git clone <your-repository-url>
cd coderadar
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure Environment Variables

Create a `.env` file in the root directory of the project (at the same level as `package.json`).

Copy the variables from `.env.example`:

```env
# Gemini API Key for TechieBot AI Assistant
GEMINI_API_KEY="your_actual_gemini_api_key_here"

# Application hosting URL (used for endpoints and references)
APP_URL="http://localhost:3000"
```

> **Note**: Make sure to replace `your_actual_gemini_api_key_here` with a valid Google Gemini API key. Keep this key secret and never commit it to GitHub!

### 5. Start Development Server

Run the full-stack development server:

```bash
npm run dev
```

The application will be accessible at: **`http://localhost:3000`**

---

## 📦 Build & Production Deployment

To compile and bundle both the frontend static assets and the Express backend server:

```bash
npm run build
```

This will:
1. Build the React frontend SPA into the `dist/` directory.
2. Compile and bundle the `server.ts` file into a self-contained production file at `dist/server.cjs`.

To run the production build:

```bash
npm run start
```

---

## 📝 License

This project is licensed under the MIT License.
