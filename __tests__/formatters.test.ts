import { bold, italic, monospace, stroke } from "../src/utils/formatter";

describe('Text Formatters', () => {
    it('should format text as bold', () => {
        expect(bold('test')).toBe('*test*');
    });

    it('should format text as italic', () => {
        expect(italic('test')).toBe('_test_');
    });

    it('should format text as monospace', () => {
        expect(monospace('test')).toBe('```test```');
    });

    it('should format text as stroke', () => {
        expect(stroke('test')).toBe('~test~');
    });
});
