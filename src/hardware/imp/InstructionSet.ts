import { Cpu } from "../Cpu";
import { Ascii } from "./Ascii";
import {Instruction} from "./Instruction";
/**
 * Contains and defines all instructions in the 6502 Tsiram Instruction Set
 */
export class InstructionSet {
    // An array of instructions with each opcode being an instruction or undefined
    public instructions: (Instruction)[];

    constructor() {
        // Length of array is 18 for possible opcodes
        this.instructions = new Array(18);

        // Instruction definitions
        this.instructions[0xA9] = new Instruction("LDA", this.ldaImm, false, false, false);
        this.instructions[0xAD] = new Instruction("LDA", this.ldaAbs, false, true, true);
        this.instructions[0x8D] = new Instruction("STA", this.staAbs, false, true, true);
        this.instructions[0x8A] = new Instruction("TXA", this.txa, false, false, false);
        this.instructions[0x98] = new Instruction("TYA", this.tya, false, false, false);
        this.instructions[0x6D] = new Instruction("ADC", this.adcAbs, false, true, true);
        this.instructions[0xA2] = new Instruction("LDX", this.ldxImm, false, false, false);
        this.instructions[0xAE] = new Instruction("LDX", this.ldxAbs, false, true, true);
        this.instructions[0xAA] = new Instruction("TAX", this.tax, false, false, false);
        this.instructions[0xA0] = new Instruction("LDY", this.ldyImm, false, false, false);
        this.instructions[0xAC] = new Instruction("LDY", this.ldyAbs, false, true, true);
        this.instructions[0xA8] = new Instruction("TAY", this.tay, false, false, false);
        this.instructions[0xEA] = new Instruction("NOP", this.nop, false, false, false);
        this.instructions[0xEC] = new Instruction("CPX", this.cpxAbs, false, true);
        this.instructions[0xEE] = new Instruction("INC", this.incAbs, true, true, true);
        this.instructions[0xD0] = new Instruction("BNE", this.bne, false, false, false);
        this.instructions[0xFF] = new Instruction("SYS", this.sysCall, false, false, false);
        this.instructions[0x00] = new Instruction("BRK", this.brk, false, false, false);
    }

    // Instruction Implementations
    
    // Load accumulator with a constant
    private ldaImm(cpu: Cpu, decoded: {literal?: number}): void {
        // set the accumulator to be non-null
        cpu.accumulator = decoded.literal!;
        // set the Zero flag
        cpu.zFlag = cpu.accumulator === 0;
    }

    // Load accumulator from memory
    private ldaAbs(cpu: Cpu, decoded: {address?: number}): void {
        const value = cpu.mmu.readImmediate(decoded.address!);
        cpu.accumulator = value;
        cpu.zFlag = value === 0;
    }

    // Store value from accumulator in memory
    private staAbs(cpu: Cpu, decoded: {address?: number}): void {
        cpu.mmu.writeImmediate(decoded.address!, cpu.accumulator);
    }

    // Load accumulator from x register
    private txa(cpu: Cpu): void {
        cpu.accumulator = cpu.xReg;
        // Set zero flag if accumulator is 0
        cpu.zFlag = cpu.accumulator === 0; 
    }

    // Load accumulator from y register
    private tya(cpu: Cpu): void {
        cpu.accumulator = cpu.yReg;
        cpu.zFlag = cpu.accumulator === 0; 
    }

    // Add contents of address to accumulator and keep result in accumulator
    private adcAbs(cpu: Cpu, decoded: {address?: number}): void {
        const value = cpu.mmu.readImmediate(decoded.address!);
        const result = cpu.accumulator + value;
        cpu.accumulator = result & 0xFF; // Ensure result is 8 bits
        cpu.zFlag = cpu.accumulator === 0; 
    }

    // Load x register with a constant
    private ldxImm(cpu: Cpu, decoded: {literal?: number}): void {
         // debugging
         console.log(`LDX Immediate Executed. Literal: ${decoded.literal}`);
        cpu.xReg = decoded.literal!;
        cpu.zFlag = cpu.xReg === 0; 
    }

    // Load x register from memory
    private ldxAbs(cpu: Cpu, decoded: {address?: number}): void {
        const value = cpu.mmu.readImmediate(decoded.address!);
        cpu.xReg = value;
        cpu.zFlag = cpu.xReg === 0; 
    }

    // Load x register from accumulator
    private tax(cpu: Cpu): void {
        cpu.xReg = cpu.accumulator;
        cpu.zFlag = cpu.xReg === 0; 
    }

    // Load y register with a constant
    private ldyImm(cpu: Cpu, decoded: {literal?: number}): void {
        cpu.yReg = decoded.literal!;
        cpu.zFlag = cpu.yReg === 0; 
    }

    // Load y register from memory
    private ldyAbs(cpu: Cpu, decoded: {address?: number}): void {
        const value = cpu.mmu.readImmediate(decoded.address!);
        cpu.yReg = value;
        cpu.zFlag = cpu.yReg === 0; 
    }

    // Load y register from accumulator
    private tay(cpu: Cpu): void {
        cpu.yReg = cpu.accumulator;
        cpu.zFlag = cpu.yReg === 0; 
    }

    private nop(): void {
        // No operation, does nothing
    }

    // Compare a byte in memory to the x register. Sets the zero flag is equal
    private cpxAbs(cpu: Cpu, decoded: {address?: number}): void {
        const value = cpu.mmu.readImmediate(decoded.address!);
        const result = cpu.xReg - value;
        cpu.zFlag = result === 0;
    }

    // Increment the value of a byte from memory
    private incAbs(cpu: Cpu, decoded: {address?: number}): void {
        const value = cpu.mmu.readImmediate(decoded.address!);
        const incremented = (value + 1) & 0xFF;  // wraps to 8-bit
        cpu.mmu.writeImmediate(decoded.address!, incremented);
        cpu.zFlag = incremented === 0;
    }

    // Branch if z flag is 0
    private bne(cpu: Cpu, decoded: {literal?: number}): void {
        // If z flag is not set
        if (!cpu.zFlag) {
            // Signed offset. Checks whether operand is negative or positive
            // If operand is positive (0x80 in hex = 128 in decimal), it stays the same. Else, If negative, find 2's complement by subtracting 256 (0x100 in hex)
            const offset = decoded.literal! < 0x80 ? decoded.literal! : decoded.literal! - 0x100; 
            cpu.progCounter += offset; // Adjust program counter
        }
    }

    // Print integer or string depending on value in x register
    private sysCall(cpu: Cpu): void {
        switch (cpu.xReg) {
            case 0x01: // Print integer
                console.log(cpu.log(cpu.yReg.toString() + "\n"));
                break;
            case 0x03: // Print string
                let address = cpu.yReg;
                let output = "";
                while (true) {
                    const byte = cpu.mmu.readImmediate(address);  // read a byte from memory
                    if (byte === 0x00) break;

                    output += Ascii.byteToChar(byte); // Use Ascii class to convert the byte to a character
                    address++;
                }

                console.log(cpu.log(output + "\n"));  // Output decoded string
                break;
            default:
                throw new Error(`Unknown system call: ${cpu.xReg}`);
        }
    }

    // Break. End of program.
    private brk(cpu: Cpu): void {
        cpu.log("Program stopped.");
        process.exit(0);
    }
}