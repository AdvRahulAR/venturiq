// FIX: Removed invalid text from the start and end of the file that was causing parsing errors.
import { GoogleGenAI, GenerateContentResponse, Part, Chat } from "@google/genai";
import { AnalysisInput, GeminiAnalysisResult, Analysis } from '../types';

const constructPrompt = (input: AnalysisInput): string => {
  const pitchDeckSection = input.pitchDeckFile
    ? `**Pitch Deck/Document:**\n---\nA file named '${input.pitchDeckFile.name}' has been provided. Please analyze its content.\n---`
    : `**Pitch Deck/Document:**\n---\nNo file provided. Analyze based on other inputs.\n---`;

  const personaPrompt = input.investorProfile
    ? `You are a dedicated, world-class investment advisor preparing a confidential briefing for your client: **${input.investorProfile}**. Your entire analysis MUST be tailored to their specific perspective.
    
    **Action Items:**
    1.  **Research:** Use Google Search extensively to research your client's known investment thesis, past investments (e.g., via Crunchbase, news articles), public statements, and sector preferences.
    2.  **Analyze from their perspective:** Evaluate this startup (${input.companyName}) *through their eyes*. Does it align with their typical stage, sector, and risk tolerance? Does it fit their portfolio?
    3.  **Tailor the Output:** Frame the "Investment Thesis," "Key Risks," and all "Reasoning" sections as if you are advising them directly. The final recommendation should be a direct suggestion *for them*.`
    : `You are an elite, highly sought-after venture capital analyst and a legendary investor who has personally analyzed thousands of startups and generated billions in returns. Your market intuition is unparalleled. You identify patterns, risks, and outlier opportunities that others miss. Your analysis must be sharp, incisive, data-driven, and brutally honest, always aiming to determine if this is a potential billion-dollar company.`;

  return `
    ## STARTUP ANALYSIS REQUEST ##

    **Company Name:** ${input.companyName}
    **Sector:** ${input.sector}
    **Geography:** ${input.geography}
    **Stage:** ${input.stage}
    **Investor Profile to Tailor For:** ${input.investorProfile || 'N/A (General Analysis)'}

    **Custom Weightages:**
    - Team: ${input.weightages.team}%
    - Market: ${input.weightages.market}%
    - Product: ${input.weightages.product}%
    - Traction: ${input.weightages.traction}%
    - Unit Economics: ${input.weightages.unitEconomics}%
    - Risks (Penalty Multiplier): ${input.weightages.risks}%

    ${pitchDeckSection}

    **Founder Notes/Updates:**
    ---
    ${input.founderNotes || 'N/A'}
    ---
    
    **Public URLs for Analysis:**
    ${input.publicUrls || 'N/A'}

    ## YOUR TASK ##

    ${personaPrompt}

    Leverage Google Search extensively to ground your analysis in real-time market data, competitive landscapes, and emerging trends. If the geography is 'India', you MUST apply your deep knowledge of the Indian market, referencing specific benchmarks (ONDC, UPI adoption, RBI compliance, DPDP Act) and cultural context (vernacular support, WhatsApp-based distribution, affordability).

    Provide your output as a single, valid JSON object enclosed in \`\`\`json ... \`\`\`. Do not add any commentary before or after the JSON block. Ensure all string values within the JSON are properly escaped to prevent parsing errors. The JSON object must conform to this exact structure:

    {
      "executiveSummary": "A 2-3 sentence summary of the investment opportunity.",
      "scores": {
        "team": { "score": <0-100>, "reasoning": "Brief rationale on founder experience, team completeness, and execution ability." },
        "market": { "score": <0-100>, "reasoning": "Brief rationale on market size (TAM/SAM/SOM), growth, and competitive landscape." },
        "product": { "score": <0-100>, "reasoning": "Brief rationale on product differentiation, technology, and user experience." },
        "traction": { "score": <0-100>, "reasoning": "Brief rationale on current user growth, revenue, and key metrics." },
        "unitEconomics": { "score": <0-100>, "reasoning": "Brief rationale on CAC, LTV, margins, and path to profitability." }
      },
      "keyRisks": [
        { "risk": "Description of the risk.", "severity": "High|Medium|Low", "mitigation": "Suggested mitigation." }
      ],
      "investmentThesis": "A few bullet points forming the core investment thesis.",
      "benchmarkComparison": "How the startup compares to key competitors or sector benchmarks. Mention any India-specific benchmarks if relevant.",
      "metricsSnapshot": {
        "TAM": "Total Addressable Market size and rationale.",
        "SAM": "Serviceable Addressable Market.",
        "SOM": "Serviceable Obtainable Market."
      },
      "dataGaps": ["List of critical missing information."],
      "followUpQuestions": ["Specific questions to ask the founders."],
      "confidence": "High|Medium|Low"
    }
  `;
};

export const analyzeStartup = async (input: AnalysisInput): Promise<{ result: GeminiAnalysisResult, sources?: {uri: string, title: string}[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
  const prompt = constructPrompt(input);
  
  const contentParts: Part[] = [{ text: prompt }];

  if (input.pitchDeckFile?.data) {
    contentParts.push({
      inlineData: {
        mimeType: input.pitchDeckFile.mimeType,
        data: input.pitchDeckFile.data,
      }
    });
  }
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        // FIX: Upgraded model to gemini-2.5-pro for higher quality, more complex analysis.
        model: 'gemini-2.5-pro',
        contents: [{ parts: contentParts }],
        config: {
          tools: [{googleSearch: {}}],
        }
    });

    const text = response.text;
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (!jsonMatch || !jsonMatch[1]) {
      throw new Error("Failed to extract JSON from Gemini response.");
    }
    const result: GeminiAnalysisResult = JSON.parse(jsonMatch[1]);
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const sources = groundingChunks
      ?.map((chunk: any) => chunk.web)
      .filter((web: any) => web)
      .map((web: any) => ({ uri: web.uri, title: web.title })) || [];

    return { result, sources };

  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error) {
        throw new Error(`Gemini API Error: ${error.message}`);
    }
    throw new Error("An unknown error occurred while contacting the Gemini API.");
  }
};

// --- AI Research Assistant Service ---

const createResearchSystemPrompt = (analysis: Analysis | null): string => {
    if (!analysis) {
        return 'You are an AI Research Assistant. Your primary function is to answer user queries by searching the web in real-time. Provide accurate, up-to-date information and always cite your sources from the web search results. Format your responses for clear readability, using bolding with **asterisks** for emphasis and bulleted lists starting with a hyphen (-) for clarity.';
    }

    const investmentThesisText = Array.isArray(analysis.fullAnalysis.investmentThesis)
        ? analysis.fullAnalysis.investmentThesis.join('\n- ')
        : analysis.fullAnalysis.investmentThesis;
    
    const keyRisksText = analysis.fullAnalysis.keyRisks.map(r => `${r.risk} (Severity: ${r.severity})`).join('\n- ');

    return `You are an AI Research Assistant currently discussing an investment analysis for the startup '${analysis.companyName}'.
Your primary goal is to answer user questions by combining insights from the provided analysis report with real-time information from Google Search.

**CONTEXT: ANALYSIS REPORT FOR ${analysis.companyName.toUpperCase()}**
---
**Company:** ${analysis.companyName}
**Recommendation:** ${analysis.recommendation} (Score: ${analysis.score}/100, Confidence: ${analysis.confidence})
**Executive Summary:** ${analysis.fullAnalysis.executiveSummary}
**Investment Thesis:**
- ${investmentThesisText}
**Key Risks:**
- ${keyRisksText}
---

**Your Task:**
1.  **Prioritize the Report:** When a user asks a question, first determine if the answer exists in the provided analysis report context above. If it does, use that information for your answer.
2.  **Use Real-Time Search:** If the question requires information NOT in the report (e.g., recent news, stock prices, competitor updates since the report was generated), use Google Search to find the most current information.
3.  **Cite Sources:** ALWAYS cite your sources when you use Google Search. You do not need to cite the analysis report itself.
4.  **Distinguish Information:** Clearly state whether your information comes from the provided analysis report or from a recent web search. For example: "According to the analysis report..." or "A recent search shows that...".
5.  **Formatting:** Format your responses for clear readability, using bolding with **asterisks** for emphasis and bulleted lists starting with a hyphen (-) for clarity.
`;
}

export const startResearchChat = (analysis: Analysis | null): Chat => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    return ai.chats.create({
        // FIX: Updated model to gemini-2.5-flash, a suitable model for general chat and Q&A.
        model: 'gemini-2.5-flash',
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: createResearchSystemPrompt(analysis)
        }
    });
}

export const askResearchAgent = async (chat: Chat, prompt: string): Promise<{ text: string, sources?: {uri: string, title: string}[] }> => {
    try {
        const response = await chat.sendMessage({ message: prompt });
        const text = response.text;

        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        const sources = groundingChunks
          ?.map((chunk: any) => chunk.web)
          .filter((web: any) => web)
          .map((web: any) => ({ uri: web.uri, title: web.title })) || [];

        return { text, sources };
    } catch (error) {
        console.error("Research Agent API call failed:", error);
        if (error instanceof Error) {
            throw new Error(`Gemini API Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while contacting the Gemini API.");
    }
}