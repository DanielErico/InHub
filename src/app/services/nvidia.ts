/// <reference types="vite/client" />

/**
 * NVIDIA NIM API Service Layer
 * Proxied through Vite dev server to avoid CORS
 * Supports: Nemotron Super (chat), Nemotron Nano (quick tasks), Llama Vision (image understanding)
 */

const NVIDIA_BASE_URL = "/api/nvidia/v1/chat/completions";

// Models
export const MODELS = {
  /** 120B reasoning model — chat, curriculum, insights */
  SUPER: "nvidia/nemotron-3-super-120b-a12b",
  /** 30B fast model — notes, quizzes, summaries */
  NANO: "nvidia/nemotron-3-nano-30b-a3b",
  /** 90B vision model — image/video frame analysis */
  VISION: "meta/llama-3.2-90b-vision-instruct",
} as const;

function getApiKey(): string {
  const key = import.meta.env.VITE_NVIDIA_API_KEY;
  if (!key || key === "your_nvapi_key_here") {
    throw new Error("NVIDIA API key not set. Please add your key to the .env file.");
  }
  return key;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
}

interface NvidiaResponse {
  choices: Array<{
    message: {
      content: string;
    };
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Send a chat completion request to NVIDIA NIM
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    topP?: number;
  } = {}
): Promise<string> {
  const {
    model = MODELS.SUPER,
    temperature = 0.7,
    maxTokens = 2048,
    topP = 0.9,
  } = options;

  const response = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const data: NvidiaResponse = await response.json();
  return data.choices[0]?.message?.content || "";
}

/**
 * Stream a chat completion response (returns an async generator of text chunks)
 */
export async function* streamCompletion(
  messages: ChatMessage[],
  options: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
  } = {}
): AsyncGenerator<string> {
  const {
    model = MODELS.SUPER,
    temperature = 0.7,
    maxTokens = 2048,
  } = options;

  const response = await fetch(NVIDIA_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getApiKey()}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`NVIDIA API error (${response.status}): ${errorText}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (!trimmed.startsWith("data: ")) continue;

      try {
        const json = JSON.parse(trimmed.slice(6));
        const content = json.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch {
        // Skip malformed JSON chunks
      }
    }
  }
}

// ============================================================
// PROMPT TEMPLATES — Domain-specific prompts for the LMS
// ============================================================

export const PROMPTS = {
  /** Student: AI-powered course chat assistant */
  studentChat: (courseName: string, lessonTitle: string) => ({
    role: "system" as const,
    content: `You are an expert AI tutor for the course "${courseName}". The student is currently on the lesson "${lessonTitle}". 

Your role:
- Explain concepts clearly using analogies and examples
- Be encouraging and supportive
- Use markdown formatting: **bold** for key terms, bullet points for lists, \`code\` for code snippets
- Keep responses concise but thorough (2-4 paragraphs max)
- If asked about topics outside this course, gently redirect to the course material
- Reference specific lessons when relevant`,
  }),

  /** Student: Generate structured notes from a lesson */
  generateNotes: (courseName: string, lessonTitle: string, lessonTopics: string) =>
    `You are an expert note-taking AI for the course "${courseName}". Generate comprehensive, well-structured study notes for the lesson "${lessonTitle}".

The lesson covers: ${lessonTopics}

Format your notes with these exact sections using markdown:
## Core Concept
A 2-3 sentence overview of the main idea.

## Key Takeaways
- Bullet point list of 5-7 important points
- Each point should be actionable and specific

## Important Terms
A comma-separated list of key vocabulary and technical terms with brief definitions.

## Code Examples
If applicable, include 1-2 small code examples with explanations.

## Next Steps
2-3 sentences on what to study next and how to practice.

Make the notes comprehensive but scannable. Use **bold** for key terms.`,

  /** Tutor: Generate a curriculum outline */
  curriculumGenerator: (topic: string, audience: string, weeks: number) =>
    `You are an expert curriculum designer. Create a detailed ${weeks}-week curriculum for the topic "${topic}" targeted at ${audience}.

For each week, provide:
## Week [N]: [Title]
**Learning Objectives:** 
- 2-3 specific, measurable objectives

**Topics Covered:**
- List of subtopics with brief descriptions

**Activities:**
- 1 hands-on activity or project
- 1 reading/resource recommendation

**Assessment:**
- How to evaluate understanding

Make it practical, progressive (build on previous weeks), and industry-relevant.`,

  /** Tutor: Generate structured quiz questions for CBT */
  quizGenerator: (topic: string, difficulty: string, count: number, customContext?: string) =>
    `You are an expert educator. Generate ${count} multiple-choice quiz questions about "${topic}" at a ${difficulty} difficulty level.
${customContext ? `\nBASE YOUR QUESTIONS STRICTLY ON THIS PROVIDED MATERIAL:\n\n${customContext}\n\n` : ""}
CRITICAL: You MUST output ONLY valid JSON without any markdown code blocks, backticks, or conversational text. Your entire response must be a JSON array of objects EXACTLY in this format:
[
  {
    "question": "Question text here",
    "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
    "correctAnswer": "Option A text",
    "explanation": "Short explanation of why this is correct"
  }
]

Note: The correctAnswer must be an exact string match to one of the strings in the options array. Make questions that test understanding.`,

  /** Tutor: Analyze student performance */
  studentInsights: (studentsData: string) =>
    `You are an educational data analyst. Analyze the following student performance data and provide actionable insights.

${studentsData}

Provide your analysis in this format:

## Class Overview
A brief summary of overall class performance.

## Students Needing Attention
For each at-risk student:
- **[Name]**: [specific concern] → [recommended action]

## Top Performers
Highlight students excelling and suggest how to challenge them further.

## Recommendations
3-5 specific, actionable recommendations for improving class outcomes.

## Trends
Any patterns you notice (common weak areas, engagement patterns, etc.)

Be specific and practical in your recommendations.`,
};
