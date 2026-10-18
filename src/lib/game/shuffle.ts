import { Question } from '../../types';

export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Shuffles question options while accurately updating correctAnswer index.
 */
export function shuffleQuestionOptions(question: Question): Question {
  const originalOptions = question.options;
  const originalCorrectAnswerText = originalOptions[question.correctAnswer];

  // Create array of indexed options to track new positions
  const mapped = originalOptions.map((text, index) => ({ text, isCorrect: index === question.correctAnswer }));
  const shuffled = shuffleArray(mapped);

  const newOptions = shuffled.map((item) => item.text);
  const newCorrectAnswer = shuffled.findIndex((item) => item.isCorrect);

  return {
    ...question,
    options: newOptions,
    correctAnswer: newCorrectAnswer >= 0 ? newCorrectAnswer : 0,
  };
}

export function prepareGameQuestions(
  questions: Question[],
  randomizeQuestions: boolean = false,
  randomizeAnswers: boolean = false
): Question[] {
  let processed = [...questions];

  if (randomizeQuestions) {
    processed = shuffleArray(processed);
  }

  if (randomizeAnswers) {
    processed = processed.map(shuffleQuestionOptions);
  }

  return processed;
}
