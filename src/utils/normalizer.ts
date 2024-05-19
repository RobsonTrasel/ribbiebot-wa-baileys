import { ILetterNormalizer } from "../interfaces";
import { NormalizedLetterMap } from "../types";

class LetterNormalizer implements ILetterNormalizer {
    private readonly normalizedLetterMap: NormalizedLetterMap;
    private readonly cache: Map<string, string>;

    constructor(normalizedLetterMap: NormalizedLetterMap = {}) {
        this.normalizedLetterMap = normalizedLetterMap;
        this.cache = new Map<string, string>();
    }

    normalize(letter: string): string {
        if (this.cache.has(letter)) {
            return this.cache.get(letter)!;
        }

        const normalized = this.normalizedLetterMap[letter] || letter;
        this.cache.set(letter, normalized);
        return normalized;
    }

    addNormalization(letter: string, normalized: string): void {
        this.normalizedLetterMap[letter] = normalized;
        this.cache.clear(); 
    }
}

const defaultNormalizedLetterMap: NormalizedLetterMap = {
    'à': 'a',
    'á': 'a',
    'ã': 'a',
    'â': 'a',
    'é': 'e',
    'è': 'e',
    'í': 'i',
    'ì': 'i',
    'õ': 'o',
    'ô': 'o',
    'ò': 'o',
    'ó': 'o',
    'û': 'u',
    'ú': 'u',
    'ç': 'c',
};

const letterNormalizer = new LetterNormalizer(defaultNormalizedLetterMap);

export { letterNormalizer, LetterNormalizer, ILetterNormalizer };