import { letterNormalizer } from "../utils/normalizer";


/**
 * Normalizes a given string by converting special characters to their base forms.
 * @param input The string you want to normalize.
 */
export function normalizeString(input: string): string {
    return input.split('').map(letter => letterNormalizer.normalize(letter)).join('');
}
