import {Hardware} from "../Hardware";
import {Interrupt} from "./Interrupt";

export class InterruptController extends Hardware {
    private devices: Interrupt[] = [];  // Keeps track of devices generating interrupts
    public interrupts: Interrupt[] = [];   // Keeps track of all interrupts

    constructor(id: number, name: string, debug: boolean) {
        super(id, name, debug);
    }

    // Save a device for interrupt handling
    saveDevice(device: Interrupt): void {
        this.devices.push(device);
    }

    // Accept interrupt from device
    acceptInterrupt(device: Interrupt): void {
        this.interrupts.push(device);
        // Sort by priority with highest first
        this.interrupts.sort((a, b) => b.priority - a.priority)
    }

    // Makes sure highest priority interrupt is sent to CPU
    getInterrupt(): Interrupt {
        return this.interrupts.shift();
    }

    // Handle interrupts per Clock Cycle
    pulse(): void {
        const interrupt = this.getInterrupt();
        if (interrupt) {
            this.log(`Handling interrupt. Device: ${interrupt.deviceName}`)
        }
    }
}