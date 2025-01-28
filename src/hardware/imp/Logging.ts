import {Clock} from "../Clock";
import {Cpu} from "../Cpu";
import {MMU} from "../Mmu";

/**
 * Controls switches for logging a clock cycle when running 
 * a program. Includes switches to change which hardware log
 * will be focused on. 
 */

export class Logging {
    private cpuLog: boolean;
    private memoryLog: boolean;
    private clockLog: boolean;

    constructor(cpuLog: boolean = true, memoryLog: boolean = false, clockLog: boolean = false) {
        this.cpuLog = cpuLog;
        this.memoryLog = memoryLog;
        this.clockLog = clockLog;
    }

    // Toggle logging for each hardware device
    public cpuLogToggle(state: boolean) {
        this.cpuLog = state;
    }

    public memLogToggle(state: boolean) {
        this.memoryLog = state;
    }

    public clockLogToggle(state: boolean) {
        this.clockLog = state;
    }

    // Log message for each step of program running through CPU
    public cpuLogMsg(cpu: Cpu) {
        this.cpuLogToggle(true);
        if (this.cpuLog) {
            cpu.log("CPU State | Mode: 0 PC: " + cpu.hexLog(cpu.progCounter, 4) + " IR: " + cpu.hexLog(cpu.instructionReg, 2) + " Acc: " + cpu.hexLog(cpu.accumulator, 2) + " xReg: " + cpu.hexLog(cpu.xReg, 2) + " yReg: " + cpu.hexLog(cpu.yReg, 2) + " zFlag: " + cpu.zFlag + " Step: " + cpu.step);
        }
    }

    // Log message for when a memory location is accessed
    public memoryLogMsg(address: number, data: number, mmu: MMU) {
        if (this.memoryLog) {
            mmu.log("Memory Accessed - Addr: " + mmu.hexLog(address, 4) + " | Data: " + mmu.hexLog(data, 2) );
        }
    }

    // Log message for current clock cycle
    public clockLogMsg(clockCycle: number, clock: Clock) {
        if (this.clockLog) {
            clock.log("Received clock pulse - CPU Clock Count: " + clockCycle);
        }
    }
}