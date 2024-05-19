import { letterNormalizer, LetterNormalizer  } from "../src/utils/normalizer";

describe('Letter Normalizer', () => {
    it('should normalize letters based on default map', () => {
        expect(letterNormalizer.normalize('á')).toBe('a');
        expect(letterNormalizer.normalize('ç')).toBe('c');
    });

    it('should return original letter if not in map', () => {
        expect(letterNormalizer.normalize('b')).toBe('b');
    });

    it('should add new normalization and clear cache', () => {
        const normalizer = new LetterNormalizer();
        normalizer.addNormalization('ü', 'u');

        expect(normalizer.normalize('ü')).toBe('u');
    });

    it('should use cached values for normalization', () => {
        const normalizer = new LetterNormalizer({ 'é': 'e' });
        const spy = jest.spyOn(normalizer, 'normalize');

        normalizer.normalize('é');
        normalizer.normalize('é');

        expect(spy).toHaveBeenCalledTimes(2);
        expect(normalizer.normalize('é')).toBe('e');
    });
});