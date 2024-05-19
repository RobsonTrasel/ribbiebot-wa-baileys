import { TextFormatter } from "../types";

export interface TextFormatterRegistry {
    registerFormatter(name: string, formatter: TextFormatter): void;
    getFormatter(name: string): TextFormatter | undefined;
}

export interface ILetterNormalizer {
    normalize(letter: string): string;
    addNormalization(letter: string, normalized: string): void;
}