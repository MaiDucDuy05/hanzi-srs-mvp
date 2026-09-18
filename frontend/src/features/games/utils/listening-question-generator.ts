export interface ListeningVocabItem {
  id: string;
  hanzi: string;
  pinyin: string;
  meaningVi: string;
  example?: string | null;
  audioKey?: string | null;
}

export interface ListeningOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ListeningQuestion {
  vocab: ListeningVocabItem;
  options: ListeningOption[];
}

/**
 * Tạo danh sách câu hỏi luyện nghe (20 câu ngẫu nhiên)
 * Mỗi câu hỏi gồm từ đích và 4 đáp án (1 đúng, 3 sai từ kho từ vựng)
 */
export function generateListeningQuestions(
  targetVocabs: ListeningVocabItem[],
  distractorPool: ListeningVocabItem[],
  count: number = 20
): ListeningQuestion[] {
  if (!targetVocabs || targetVocabs.length === 0) return [];

  const validTargets = targetVocabs.filter((v) => v.meaningVi && v.meaningVi.trim() !== '');
  if (validTargets.length === 0) return [];

  const validDistractors = (distractorPool || []).filter((v) => v.meaningVi && v.meaningVi.trim() !== '');

  let shuffledTargets = [...validTargets].sort(() => 0.5 - Math.random());

  // Nếu số từ ít hơn count (ví dụ bài có 10 từ), lặp lại để đủ số câu luyện tập (tối đa count)
  if (shuffledTargets.length < count && shuffledTargets.length > 0) {
    const repeated: ListeningVocabItem[] = [];
    while (repeated.length < count) {
      repeated.push(...[...shuffledTargets].sort(() => 0.5 - Math.random()));
    }
    shuffledTargets = repeated.slice(0, count);
  } else {
    shuffledTargets = shuffledTargets.slice(0, count);
  }

  const fallbackMeanings = ['Xin chào', 'Cảm ơn', 'Tạm biệt', 'Bạn bè', 'Học tập', 'Ăn cơm'];

  return shuffledTargets.map((vocab, index) => {
    const correctMeaning = vocab.meaningVi.trim();

    // Lấy các nghĩa sai từ distractor pool
    const otherMeanings = validDistractors
      .map((d) => d.meaningVi.trim())
      .filter((m) => m !== correctMeaning && m !== '');

    const uniqueOthers = Array.from(new Set(otherMeanings)).sort(() => 0.5 - Math.random());

    const chosenDistractors: string[] = [];
    for (const d of uniqueOthers) {
      if (chosenDistractors.length >= 3) break;
      chosenDistractors.push(d);
    }

    if (chosenDistractors.length < 3) {
      for (const fb of fallbackMeanings) {
        if (chosenDistractors.length >= 3) break;
        if (fb !== correctMeaning && !chosenDistractors.includes(fb)) {
          chosenDistractors.push(fb);
        }
      }
    }

    const options: ListeningOption[] = [
      { id: `q-${index}-correct`, text: correctMeaning, isCorrect: true },
      ...chosenDistractors.map((text, dIdx) => ({
        id: `q-${index}-d-${dIdx}`,
        text,
        isCorrect: false,
      })),
    ].sort(() => 0.5 - Math.random());

    return {
      vocab,
      options,
    };
  });
}
