/**
 * Returns a random number between 0 (inclusive) and 1 (exclusive)
 * using a cryptographically secure random number generator.
 */
export function secureRandom(): number {
  const array = new Uint32Array(1);
  window.crypto.getRandomValues(array);
  return array[0] / (0xffffffff + 1);
}

/**
 * Returns a random integer between min (inclusive) and max (inclusive)
 */
export function getRandomInt(min: number, max: number): number {
  const range = max - min + 1;
  return Math.floor(secureRandom() * range) + min;
}

/**
 * Shuffles an array using the Fisher-Yates algorithm with secure randomness.
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(secureRandom() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
