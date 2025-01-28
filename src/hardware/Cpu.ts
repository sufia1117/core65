import {Clock} from "./Clock";
import {Hardware} from "./Hardware";
import {MMU} from "./Mmu";
import {ClockListener} from "./imp/ClockListener";
import {Logging} from "./imp/Logging";
import {InstructionSet} from "./imp/InstructionSet";
import {Instruction} from "./imp/Instruction";
import {Interrupt} from "./imp/Interrupt";
import {InterruptController} from "./imp/InterruptController";

export class Cpu extends Hardware implements ClockListener {

    public cpuClockCount: number = 0;

    public mmu: MMU;

    public instructionSet: InstructionSet;

    public interruptController: InterruptController;

    private clock: Clock;
    
    public step: number = 0;  // Keeps track of which step of the pipeline the CPU is currently on

    public accumulator: number = 0x00;  // Register which stores values in memory and does arithmetic

    public xReg: number = 0x00;  // general purpose register

    public yReg: number = 0x00;  // general purpose register

    public zFlag: boolean = false;  // Controls system call and branching

    public progCounter: number = 0x0000;  // Stores memory address the program is currently on

    public instructionReg: number = 0x00;  // Stores the current instruction that needs to be executed

    private logging: Logging;

    private instruction: Instruction;


    constructor(Id: number, name: string, debug: boolean, logging: Logging, mmu: MMU, instructionSet: InstructionSet, interruptController: InterruptController) {
        super(Id, name, debug);  
        this.logging = logging;
        this.mmu = mmu;
        this.instructionSet = instructionSet;
        this.interruptController = interruptController;

    }

    /** Send message when pulse is received. 
     * Increments clock count for each pulse.
     */
    public pulse(): void {
        this.cpuClockCount += 1;
        this.logging.clockLogMsg(this.cpuClockCount, this.clock);  // Log clock cycle

        // Pipeline steps to take place with each clock pulse with logging
        switch (this.step) {
            // Fetch
            case 0:   
                this.logging.cpuLogMsg(this);
                this.fetch();
                this.step = 1;
                break;

            // Decode Low Order Byte
            case 1:
                this.logging.cpuLogMsg(this);
                
                // Check if there is a HOB to decode
                if (this.instruction?.hobRequired) {
                    this.decodeLob();
                    this.step = 2;  // decode HOB
                } else {
                    this.decodeLob();
                    this.step = 3; // no HOB to decode
                }
                break;
               
            // Decode High Order Byte
            case 2:
                this.logging.cpuLogMsg(this);
                this.decodeHob();
                this.step = 3;
                break;

            // First Execute
            case 3:
                this.logging.cpuLogMsg(this);

                let decoded: { address?: number; literal?: number } = {};
                if (this.instruction?.hobRequired) { // If instruction requires HOB, it must have an address operand
                    decoded.address = (this.mmu.getHighOrderByte() << 8) | this.mmu.getLowOrderByte();
                    
                } else {  // Instruction requires a literal operand (only LOB in this case)
                    decoded.literal = this.mmu.getLowOrderByte();
                    
                }

                this.instruction.execute(this, decoded);

                // Check if instruction must be executed a second time
                if (this.instruction?.secExecuteRequired) {
                    this.step = 4;  // if yes, go to second execute
                } else {
                    this.step = 5;  // Go to writeback otherwise
                }
                break;

            // Second execute if required, else just write back
            case 4:
                this.logging.cpuLogMsg(this);
                this.secondExecute();
                this.step = 5;   // Can now proceed to writeBack
                break;

            // Write Back
            case 5:
                if (this.instruction?.writebackReq) {
                    this.logging.cpuLogMsg(this);
                    this.writeBack();
                }
                this.step = 6;
                break;
            
            // Interrupt Check
            case 6: 
                this.logging.cpuLogMsg(this);
                this.interruptCheck();
                this.step = 0;
                break;
        }
    }


    /**
     * Grabs the current instruction memory address
     * Increments Program Counter
     */
    public fetch() : void {
        this.instructionReg = this.mmu.readImmediate(this.progCounter);
        this.instruction = this.instructionSet.instructions[this.instructionReg];
        this.progCounter++;
    }

    /**
     * Decodes the current instruction and retreives the low order byte
     */
    public decodeLob() : number {
        const currentLob = this.mmu.readImmediate(this.progCounter);
        this.progCounter++;
        this.mmu.setLowOrderByte(currentLob);
        return currentLob;
    }

    /**
     * Decodes the current instruction and retrieves the high order byte
     */
    public decodeHob() : number {
        const currentHob = this.mmu.readImmediate(this.progCounter);
        this.progCounter++;
        this.mmu.setHighOrderByte(currentHob);
        return currentHob;
    }

    /**
     * Executes instruction a second time to allow the accumulator to perform an increment
     */
    public secondExecute() : void {
        this.accumulator++;
    }

    /**
     * Writes the data in accumulator back to a specific memory location
     */
    public writeBack() : void {
        this.mmu.mmuWrite(this.accumulator);
    }

    public handleInterrupt(interrupt: Interrupt): void {
        this.log(`Handling Interrupt. Device: ${interrupt.deviceName}`);
        if (interrupt.outputBuffer.length > 0) {
            const key = interrupt.outputBuffer.shift();
            this.log(`Input: ${key}`);
        }
    }

    /**
     * Check and handle interrupts, if any
     */
    public interruptCheck() : void {
        this.log("Interrupt Check");
        if (this.interruptController?.interrupts != undefined) {
            const interrupt = this.interruptController.getInterrupt();
            if (interrupt) {
                this.handleInterrupt(interrupt);
            }
        }
    }

}
