export const STUDY_PROMPTS = {
  generateStory: (topic: string, level: string, wordsStr: string) => `You are a professional Chinese language teacher. Write a short, engaging story in simplified Chinese based on the topic "${topic}" suitable for a student at the "${level}" proficiency level.
You MUST include all of the following vocabulary words naturally in the story: ${wordsStr}.

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting or backticks:
{
  "storyZh": "The Chinese story here...",
  "storyVi": "The Vietnamese translation here..."
}`,

  generateGrammarExamples: (title: string, structure: string, explanation: string) => `You are a professional Chinese language teacher. The student is learning the following grammar point:
Title: ${title}
Structure: ${structure}
Explanation: ${explanation}

Generate exactly 3 practical and common examples using this grammar structure.
Return ONLY a valid JSON array of objects matching this schema exactly, with no markdown formatting:
[
  {
    "zh": "Chinese sentence here",
    "pinyin": "Pinyin here (with tone marks)",
    "vi": "Vietnamese translation here"
  }
]`,

  generateGrammarPractice: (title: string, structure: string) => `You are a professional Chinese language teacher. The student is practicing the grammar point:
Title: ${title}
Structure: ${structure}

Generate 1 sentence in Vietnamese that the student must translate into Chinese using this exact grammar structure.
Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "promptVi": "Vietnamese sentence for the student to translate",
  "expectedZh": "The expected Chinese translation"
}`,

  gradeGrammarPractice: (title: string, structure: string, promptVi: string, userAnswer: string) => `You are a strict but encouraging Chinese language teacher. The student is practicing the grammar point:
Title: ${title}
Structure: ${structure}

The student was asked to translate this Vietnamese sentence into Chinese: "${promptVi}"
The student's answer: "${userAnswer}"

Evaluate their answer. 
1. Is it grammatically correct and natural?
2. Did they successfully use the required grammar structure?

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "isCorrect": boolean,
  "score": number (0-100),
  "feedback": "Your detailed feedback in Vietnamese explaining what was good, what was wrong, and how to improve. If incorrect, provide the correct answer."
}`,

  generateGrammarStory: (topic: string, level: string, grammarsStr: string) => `You are a professional Chinese language teacher. Write a short, engaging dialogue or story in simplified Chinese based on the topic "${topic}" suitable for a student at the "${level}" proficiency level.
You MUST include all of the following grammar points naturally in the text: ${grammarsStr}.

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "storyZh": "The Chinese text here...",
  "storyVi": "The Vietnamese translation here..."
}`,

  checkSpelling: (text: string) => `You are a professional Chinese language teacher and proofreader.
Analyze the following sentence written by a student:
"${text}"

Identify any spelling errors, wrong characters, or significant grammatical mistakes.
IMPORTANT: If the text contains meaningless gibberish, English words where Chinese is expected, or random letters (e.g., if the user forgot to switch to a Chinese keyboard), you MUST treat it as an error and provide a suggestion (e.g., correct it to the intended Chinese or point out the wrong text).

Return ONLY a valid JSON object matching this schema exactly, with no markdown formatting:
{
  "hasError": boolean,
  "suggestions": [
    {
      "wrong": "the exact wrong substring from the original text",
      "correct": "the corrected substring"
    }
  ]
}
If there are no errors, return {"hasError": false, "suggestions": []}.`
};

export const GEMINI_JSON_CONFIG = {
  model: 'gemini-3.5-flash-lite',
  config: {
    responseMimeType: 'application/json',
  }
};

export const GEMINI_FALLBACK_MODELS = [
  "gemini-3.5-flash-lite",
  'gemini-3.1-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-pro'
];

