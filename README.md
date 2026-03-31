# 📥 Ingestor Pro

**Ingestor Pro** is a high-performance, AI-powered data ingestion platform built for the modern web. It allows users to seamlessly ingest, process, and analyze data from local folders, single files, and live web URLs.

---

## ✨ Features

- **🌐 Web Scraping**: Ingest content directly from any URL with intelligent cleanup.
- **📁 Multi-source Ingestion**: Support for local directories, PDF, Excel (XLSX/CSV), and raw text.
- **🤖 AI Integration**: Built-in chat and summarization powered by Google Gemini.
- **📊 Interactive Visualization**: D3-powered relationship graphs of your ingested data.
- **⚡ Modern UI**: Sleek, glassmorphic design with dark mode and micro-animations.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Components**: [Shadcn/UI](https://ui.shadcn.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **AI**: [Google Generative AI](https://ai.google.dev/)
- **Visuals**: [D3.js](https://d3js.org/) & [Lucide React](https://lucide.dev/)

---

## 🚀 Getting Started

### Prerequisites

- [pnpm](https://pnpm.io/)
- Node.js 18.x +

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/achrafib1/ingestor-pro.git
   cd ingestor-pro
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Configure Environment**:
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Run Development Server**:
   ```bash
   pnpm dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## 🔒 Security & Best Practices

> [!CAUTION]
> **API Keys**: In the current version, the Gemini API key is used on the client-side for rapid development. For production, it is highly recommended to move LLM calls to Next.js Server Actions or Backend API routes.

---

## 📄 License


---

*Built with ❤️ by [Achrafib1](https://github.com/achrafib1)*
