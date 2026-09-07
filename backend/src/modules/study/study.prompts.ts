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
If there are no errors, return {"hasError": false, "suggestions": []}.`,

  generateExamQuestions: (level: string, wordsInfo: string, count: number, allowedTypes: string[]) => `You are an expert Chinese language teacher and exam test designer.
Create exactly ${count} diverse and pedagogically sound test/quiz questions for students learning Chinese at proficiency level: "${level}".
The questions MUST be focused on testing comprehension, usage, or grammar structure of the following vocabulary items:
${wordsInfo}

Allowed question types to generate: ${allowedTypes.join(', ')}.

Each generated question MUST strictly match one of the following schemas based on its type:

1. SINGLE_CHOICE (Multiple Choice with 4 choices):
{
  "type": "SINGLE_CHOICE",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "targetVocab": "the target Chinese word",
  "explanation": "Explanation in Vietnamese why this answer is correct",
  "content": {
    "questionText": "Question prompt in Vietnamese or Chinese (e.g. 'Chọn nghĩa đúng của từ:', or 'Chọn từ thích hợp điền vào chỗ trống: 他每天___去图书馆。')",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Exact text of the correct option (must be one of the items in options)"
  }
}

2. FILL_IN (Fill in the blank):
{
  "type": "FILL_IN",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "targetVocab": "the target Chinese word",
  "explanation": "Explanation in Vietnamese",
  "content": {
    "questionText": "Sentence with blank '___' (e.g. '我很___学中文。(Wǒ hěn ___ xué Zhōngwén.)')",
    "acceptedAnswers": ["the correct target word in Hanzi"],
    "options": ["word1", "word2", "word3", "word4"] // optional word bank suggestions
  }
}

3. ORDERING (Rearrange shuffled words to form a correct Chinese sentence):
{
  "type": "ORDERING",
  "difficulty": "EASY" | "MEDIUM" | "HARD",
  "targetVocab": "the target Chinese word",
  "explanation": "Explanation in Vietnamese of grammatical sentence structure",
  "content": {
    "question": "Sắp xếp các từ sau thành câu hoàn chỉnh:",
    "words": ["word1", "word2", "word3", "word4"], // array of tokens/words in shuffled order
    "correctOrder": ["word1", "word2", "word3", "word4"] // exact array of words in correct sequence
  }
}

Return ONLY a valid JSON array of question objects matching the schema above, with NO markdown formatting, NO extra text.
Format:
[
  { ...question1 },
  { ...question2 }
]`
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

