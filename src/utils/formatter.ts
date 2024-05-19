import { TextFormatterRegistry } from "../interfaces";
import { TextFormatter } from "../types";

export const bold = (s: string): string => `*${s}*`
export const italic = (s: string): string => `_${s}_`;
export const monospace = (s: string): string => `\`\`\`${s}\`\`\``;
export const stroke = (s: string): string => `~${s}~`;

class FormatterRegistry implements TextFormatterRegistry {
    private formatters: Map<string, TextFormatter>;

    constructor() {
        this.formatters = new Map<string, TextFormatter>();
    }

    registerFormatter(name: string, formatter: TextFormatter): void {
        this.formatters.set(name, formatter);
    }

    getFormatter(name: string): TextFormatter | undefined {
        return this.formatters.get(name);
    }
}

const formatterRegistry = new FormatterRegistry();
export { formatterRegistry };