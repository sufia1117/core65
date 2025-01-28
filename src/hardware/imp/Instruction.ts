import { Cpu } from "../Cpu";

/**
 * Holds the overall details of each instruction in the instruction set
 */
export class Instruction {
    // LMC mnemonic of instruction
    public mnemonic: string; 
    // Defines how a specific insrtuction will behave
    public execute: (cpu: Cpu, decoded: {address?: number; literal?: number}) => void;
    // True if second execute is required, false otherwise
    public secExecuteRequired: boolean;
    // True if instruction has HOB, false otherwise
    public hobRequired: boolean;
    // True if writeback is required, false otherwise
    public writebackReq: boolean;

    constructor (
        mnemonic: string, 
        execute: (cpu: Cpu, decoded: {address?: number; literal?: number}) => void, 
        secExecuteRequired: boolean = false,
        hobRequired: boolean = false,
        writebackReq: boolean = false) 
    {
        this.mnemonic = mnemonic;
        this.execute = execute;
        this.secExecuteRequired = secExecuteRequired;
        this.hobRequired = hobRequired;
        this.writebackReq = writebackReq;
    }
}