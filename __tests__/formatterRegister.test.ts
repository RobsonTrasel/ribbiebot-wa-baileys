import { bold, formatterRegistry, italic, monospace, stroke } from "../src/utils/formatter";

describe('Formatter Registry', () => {
    it('should register and retrieve formatters', () => {
        formatterRegistry.registerFormatter('bold', bold);
        formatterRegistry.registerFormatter('italic', italic);
        formatterRegistry.registerFormatter('monospace', monospace);
        formatterRegistry.registerFormatter('stroke', stroke);

        expect(formatterRegistry.getFormatter('bold')).toBe(bold);
        expect(formatterRegistry.getFormatter('italic')).toBe(italic);
        expect(formatterRegistry.getFormatter('monospace')).toBe(monospace);
        expect(formatterRegistry.getFormatter('stroke')).toBe(stroke);
    });

    it('should return undefined for unregistered formatters', () => {
        expect(formatterRegistry.getFormatter('nonexistent')).toBeUndefined();
    });
});