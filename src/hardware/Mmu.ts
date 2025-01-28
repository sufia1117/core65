import {Cpu} from "./Cpu";
import {Memory} from "./Memory";

export class MMU extends Memory {
    private cpu: Cpu;

    public lob: number = 0x00;

    public hob: number = 0x00;

    constructor(Id: number, name: string, debug: boolean, cpu: Cpu) {

        super(Id, name, debug);  
        this.cpu = cpu;

    }

    /**
     * Update the last two hexdecimal digits in MAR to follow little endian format
     */
    public setLowOrderByte(lowOrder : number) {
        const MAR = this.getMAR();
        // Set low order byte by masking to 8 bits
        this.setMAR((MAR & 0xFF00) | (this.lob = lowOrder & 0xFF));
    }

    /**
     * Update the first two hexadecimal digits in MAR to follow little endian format
     */
    public setHighOrderByte(highOrder : number) {
        const MAR = this.getMAR();
        // preserve low order byte and shift high order byte's position
        this.setMAR((MAR & 0x00FF) | ((this.hob = highOrder & 0xFF) << 8));
    }

    /**
     * Get low order byte
     */
    public getLowOrderByte() : number {
        return this.lob;
    }

    /**
     * Get high order byte 
     */
    public getHighOrderByte() : number {
        return this.hob;

    }

    public read() : number {
        const address = (this.hob << 8) | this.lob;
        this.MAR = address;
        super.read();
        return this.getMDR();
    }

    public mmuWrite(data: number) : void {
        const address = (this.hob << 8) | this.lob;
        this.setMAR(address);
        this.setMDR(data); 
        super.write();
    }

    
    /**
     * Reads data in address using little endian format
     */
    public readData(lob: number, hob: number) : number {
        this.setLowOrderByte(lob);
        this.setHighOrderByte(hob);
        return this.read();
    }

    /**
     * Writes data in address using little endian format
     */
    public writeData(lob: number, hob: number, data: number) : void {
        this.setLowOrderByte(lob);
        this.setHighOrderByte(hob);
        this.setMDR(data);
        this.write();
    }


    /**
     * Loads a static 6502 Assembly program into memory
     */
    public writeImmediate(address: number, data: number) : void {
        this.setMAR(address);
        this.setMDR(data);
        this.write();
    }

    /**
     * Read data from specific 16-bit address
     */
    public readImmediate(address: number) : number {
        this.setMAR(address);
        return this.read();
        
    }

    /**
     * Holds the static assembly program to run
     */
    public powers() : void {
        // Powers Program

        // load constant 0
        this.writeImmediate(0x0000, 0xA9);
        this.writeImmediate(0x0001, 0x00);
        // write acc (0) to 0040
        this.writeImmediate(0x0002, 0x8D);
        this.writeImmediate(0x0003, 0x40);
        this.writeImmediate(0x0004, 0x00);
        // load constant 1
        this.writeImmediate(0x0005, 0xA9);
        this.writeImmediate(0x0006, 0x01);
        // add acc (?) to mem 0040 (?)
        this.writeImmediate(0x0007, 0x6D);
        this.writeImmediate(0x0008, 0x40);
        this.writeImmediate(0x0009, 0x00);
        // write acc ? to 0040
        this.writeImmediate(0x000A, 0x8D);
        this.writeImmediate(0x000B, 0x40);
        this.writeImmediate(0x000C, 0x00);
        // Load y from memory 0040
        this.writeImmediate(0x000D, 0xAC);
        this.writeImmediate(0x000E, 0x40);
        this.writeImmediate(0x000F, 0x00);
        // Load x with constant (1) (to make the first system call)
        this.writeImmediate(0x0010, 0xA2);
        this.writeImmediate(0x0011, 0x01);
        // make the system call to print the value in the y register (3)
        this.writeImmediate(0x0012, 0xFF);
        // Load x with constant (3) (to make the second system call for the string)
        this.writeImmediate(0x0013, 0xA2);
        this.writeImmediate(0x0014, 0x03);
        // make the system call to print the value in the y register (3)
        this.writeImmediate(0x0015, 0xFF);
        this.writeImmediate(0x0016, 0x50);
        this.writeImmediate(0x0017, 0x00);
        // test DO (Branch Not Equal) will be NE and branch (0x0021 contains 0x20 and xReg
        // contains B2)
        this.writeImmediate(0x0018, 0xD0);
        this.writeImmediate(0x0019, 0xED);
        // globals
        this.writeImmediate(0x0050, 0x2C);
        this.writeImmediate(0x0051, 0x20);
        this.writeImmediate(0x0052, 0x00);

        
    }

    public helloWorld() : void {
        // load constant 3
        this.writeImmediate(0x0000, 0xA9);
        this.writeImmediate(0x0001, 0x0A);
        // write acc (3) to 0040
        this.writeImmediate(0x0002, 0x8D);
        this.writeImmediate(0x0003, 0x40);
        this.writeImmediate(0x0004, 0x00);
        // :loop
        // Load y from memory (3)
        this.writeImmediate(0x0005, 0xAC);
        this.writeImmediate(0x0006, 0x40);
        this.writeImmediate(0x0007, 0x00);
        // Load x with constant (1) (to make the first system call)
        this.writeImmediate(0x0008, 0xA2);
        this.writeImmediate(0x0009, 0x01);
        // make the system call to print the value in the y register (3)
        this.writeImmediate(0x000A, 0xFF);
        // Load x with constant (3) (to make the second system call for the string)
        this.writeImmediate(0x000B, 0xA2);
        this.writeImmediate(0x000C, 0x03);
        // make the system call to print the value in the y register (3)
        this.writeImmediate(0x000D, 0xFF);
        this.writeImmediate(0x000E, 0x50);
        this.writeImmediate(0x000F, 0x00);
        // load the string
        // 0A 48 65 6c 6c 6f 20 57 6f 72 6c 64 21
        this.writeImmediate(0x0050, 0x0A);
        this.writeImmediate(0x0051, 0x48);
        this.writeImmediate(0x0052, 0x65);
        this.writeImmediate(0x0053, 0x6C);
        this.writeImmediate(0x0054, 0x6C);
        this.writeImmediate(0x0055, 0x6F);
        this.writeImmediate(0x0056, 0x20);
        this.writeImmediate(0x0057, 0x57);
        this.writeImmediate(0x0058, 0x6F);
        this.writeImmediate(0x0059, 0x72);
        this.writeImmediate(0x005A, 0x6C);
        this.writeImmediate(0x005B, 0x64);
        this.writeImmediate(0x005C, 0x21);
        this.writeImmediate(0x005D, 0x0A);
        this.writeImmediate(0x005E, 0x00);


    }

}