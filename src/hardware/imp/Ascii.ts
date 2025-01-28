export class Ascii {
    /**
     * Convert a hexadecimal byte to its ASCII equivalent character
     */
    public static byteToChar(byte: number): string {
        if (byte >= 0x20 && byte <= 0x7E) {
            return String.fromCharCode(byte);
        } else if (byte === 0x0A) {
            // new line
            return '\n';
        } else if (byte === 0x0D) {
            // return
            return '\r';
        } else if (byte === 0x00) {
            // Null terminator
            return '\0';
        } else {
            // Random placeholder for unknown characters
            return '?';
        }
    }

    /**
     * Converts an ASCII character to its hexadecimal byte equivalent
     */
    public static charToByte(char: string): number {
        const charCode = char.charCodeAt(0);
        if (charCode >= 0x20 && charCode <= 0x7E) {
            return charCode;
        } else if (char === '\n') {
            // new line
            return 0x0A;
        } else if (char === '\r') {
            // return
            return 0x0D;
        } else if (char === '\0') {
            // Null terminator
            return 0x00;
        } else {
            // Unsupported characters
            throw new Error(`Unsupported character: ${char}`);
        }
    }
}
