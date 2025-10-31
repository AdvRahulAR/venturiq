# VenturIQ - The AI Co-pilot for Smarter Startup Investing

![VenturIQ Dashboard](https://lh3.googleusercontent.com/d/1ZDvqPCD-VDe_jx0OTXGi4cbAWQJRnqJU)

**VenturIQ** is a powerful, client-side application designed to accelerate the startup evaluation process for investors. It leverages the Google Gemini API to transform unstructured data—such as pitch decks, founder updates, and public web data—into comprehensive, structured investment memos. This tool empowers VCs, angel investors, family offices, and accelerators to make faster, more data-driven decisions with confidence.

This application is built as a serverless, privacy-first tool. All document processing and data storage happens locally in your browser, ensuring your sensitive information remains confidential.

---

## ✨ Key Features

- **🧠 AI-Powered Analysis:** Generates executive summaries, scorecards across key verticals (Team, Market, Product, etc.), key risks, investment theses, and more.
- **📄 Deep Document Insight:** Ingests and understands content from PDF pitch decks, DOCX files, and user-provided notes.
- **🔎 Real-Time Grounding:** Integrates with Google Search to ensure analysis is based on the latest market data, competitive landscape, and news.
- **👤 Personalized Investor Lens:** Tailors the entire analysis to a specific investor's profile, fund, or thesis for bespoke recommendations.
- **🎙️ Interactive Voice Q&A:** Engage in a live, multilingual voice conversation with the AI analyst to dive deeper into the report using the Gemini Live API.
- **🤖 Context-Aware Research Assistant:** Ask follow-up questions and get real-time, sourced answers about the startup or the broader market.
- **🔒 Privacy-First Architecture:** All processing and data storage happens locally in your browser using `localStorage`. No sensitive data is ever sent to a server.
- **Professional Reports:** Download any analysis as a clean, shareable PDF with clickable links, perfect for sharing with your team or investment committee.

---

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Engine:** Google Gemini API (`gemini-2.5-pro`, `gemini-2.5-flash`, `gemini-2.5-flash-native-audio-preview-09-2025`)
- **File Processing:** PDF.js (Client-side)
- **PDF Generation:** jsPDF, html2canvas
- **Data Persistence:** Browser `localStorage`

---

## 🚀 How It Works

1.  **Upload & Input:** Securely upload a pitch deck and add any relevant founder notes, public URLs, or a specific investor profile to tailor the analysis.
2.  **AI Analyzes:** VenturIQ's advanced AI performs a deep, multi-faceted analysis, leveraging real-time Google Search to ground its insights in current market data.
3.  **Receive Insights:** Get a comprehensive, investor-grade report with a clear recommendation and downloadable PDF in minutes.

---

## ⚙️ Getting Started

This application is designed to be run in an environment where the Google Gemini API key is provided as an environment variable.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/venturiq.git
    cd venturiq
    ```

2.  **API Key Configuration:**
    This project requires a Google Gemini API key to function. The application is hardcoded to use `process.env.API_KEY`. You must ensure that this environment variable is available in your deployment environment (e.g., Vercel, Netlify, or a local development server).

3.  **Running Locally:**
    If you are using a tool like Vite, you can create a `.env.local` file in the root of the project and add your key:
    ```
    VITE_API_KEY=your_google_gemini_api_key
    ```
    And then reference it in your code as `import.meta.env.VITE_API_KEY`. *Note: The current codebase uses `process.env.API_KEY` directly and may need this adjustment for local development frameworks.*

---

## ✒️ Attribution

<p align="center">
  Developed by <a href="https://ubintelligence.tech/" target="_blank">UB Intelligence</a>
</p>

