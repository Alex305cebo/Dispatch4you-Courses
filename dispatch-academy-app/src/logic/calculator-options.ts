const OPTION_COUNT = 6;

function inferDecimalPlaces(value: number): number {
  if (Number.isInteger(value)) return 0;
  if (Math.abs(value) < 100) return 2;
  return 1;
}

function hashNumber(n: number): number {
  return Math.abs(Math.round(n * 10000));
}

function seededShuffle<T>(array: T[], seed: number): T[] {
  const result = [...array];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function formatValue(value: number, decimals: number, unit: string): string {
  const formatted =
    decimals > 0 ? value.toFixed(decimals) : String(Math.round(value));
  return unit ? `${formatted} ${unit}` : formatted;
}

/**
 * Builds six multiple-choice options for a calculator task.
 * Distractors are derived from common calculation mistakes (±%, ±step offsets).
 */
export function generateCalculatorOptions(
  correctAnswer: number,
  unit: string,
  optionCount = OPTION_COUNT
): { options: string[]; correctIndex: number } {
  const decimals = inferDecimalPlaces(correctAnswer);
  const round = (n: number) => Number(n.toFixed(decimals));
  const distractors = new Set<number>();

  if (correctAnswer === 0) {
    for (const value of [5, 10, 25, 50, 100, 250, 500]) {
      distractors.add(value);
    }
  } else {
    for (const factor of [0.5, 0.65, 0.75, 0.85, 0.9, 1.1, 1.15, 1.25, 1.35, 1.5, 2.0]) {
      const candidate = round(correctAnswer * factor);
      if (candidate > 0 && candidate !== correctAnswer) {
        distractors.add(candidate);
      }
    }

    const step =
      correctAnswer >= 1000 ? 100 :
      correctAnswer >= 100 ? 25 :
      correctAnswer >= 10 ? 5 :
      correctAnswer >= 1 ? 0.25 : 0.05;

    for (const mult of [1, 2, 3, 4, 5, 6]) {
      const up = round(correctAnswer + step * mult);
      const down = round(correctAnswer - step * mult);
      if (up > 0 && up !== correctAnswer) distractors.add(up);
      if (down > 0 && down !== correctAnswer) distractors.add(down);
    }
  }

  const seed = hashNumber(correctAnswer + unit.length * 17);
  const shuffledDistractors = seededShuffle([...distractors], seed);
  const selectedValues = shuffledDistractors.slice(0, optionCount - 1);

  let attempt = 0;
  while (selectedValues.length < optionCount - 1 && attempt < 30) {
    const extra = round(correctAnswer * (0.55 + attempt * 0.07));
    if (
      extra > 0 &&
      extra !== correctAnswer &&
      !selectedValues.includes(extra)
    ) {
      selectedValues.push(extra);
    }
    attempt++;
  }

  const allValues = seededShuffle(
    [correctAnswer, ...selectedValues.slice(0, optionCount - 1)],
    seed + 1
  );
  const correctIndex = allValues.indexOf(correctAnswer);

  return {
    options: allValues.map((value) => formatValue(value, decimals, unit)),
    correctIndex,
  };
}
