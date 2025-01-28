export interface Interrupt {
    irqNumber: number;  // Unique IRQ number for each interrupt generating device
    priority: number;   // Priority of the device
    deviceName: string; // Name of device generating the interrupt

    inputBuffer?: string[]; // Optional input buffer
    outputBuffer?: string[];    // Optional output buffer
}