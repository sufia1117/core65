import {System} from "../System";
import {Hardware} from "./Hardware";
import {ClockListener} from "./imp/ClockListener";


export class Memory extends Hardware implements ClockListener {
    private memoryArray: number[]; // Private array which stores 2 hexadecimal digits per array element
    public MAR: number;
    public MDR: number;

    constructor(Id: number, name: string, debug: boolean) {

        super(Id, name, debug);  

        this.memoryArray = new Array(0x10000); // Size of array is the total size of addressable memory: 65536 or 10000 in hexadecimal format
    }

    /** Public function to initialize memoryArray. 
     * Each element in memoryArray is set to 0x00.
     */
    public initializeMemory() : void {
        for (let i = 0x0000; i < 0x1000; i++) {
            this.memoryArray[i] = 0x00;
        }
    }

    /** Function to iterate through requested addresses of Memory.
     * Returns correct format of output messages.
     */
    public displayMemory(startAddress : number, endAddress? : number) : string  {
        let errorMsg : string;

        // Checks to see if given address has an undefined value
        if (typeof this.memoryArray[startAddress] === 'undefined') {
            errorMsg =  "Addr " + this.hexLog(startAddress, 4) + ":  | ERR [hexValue conversion]: number undefined";

            this.log(errorMsg);
            return;
           
        }

        if (endAddress !== undefined && typeof this.memoryArray[endAddress] === 'undefined') {
            errorMsg = "Addr " + this.hexLog(endAddress, 4) + ":  | ERR [hexValue conversion]: number undefined";

            this.log(errorMsg);
            return;
        } 

        // if a start and end range is given, iterate through each address and print their values
        if (endAddress !== undefined) {
            for (let i = startAddress; i <= endAddress; i++) {
                const memoryMsg = "Addr " + this.hexLog(i, 4) + ":  | " + this.hexLog(this.memoryArray[i], 2);
                
                this.log(memoryMsg);
            }
        }
        else {
            // if only one address given, return value of just that address
            const memoryMsg = "Addr " + this.hexLog(startAddress, 4) + ":  | " + this.hexLog(this.memoryArray[startAddress], 2);
            
            this.log(memoryMsg);
        }   

       return '';  // return empty string to keep return type constant
        
    }

    /**
     * Send message when pulse is received.
     */
    public pulse(): void {

        let memClockMsg = "received clock pulse"; 
        
       // console.log(this.log(memClockMsg));
    }

    /**
     * Overwrite all elements MAR, MDR, and Memory with 0x0
     */
    public reset(): void {
        for (let i = 0x0000; i < 0x1000; i++) {
            this.memoryArray[i] = 0x00;
        }

        this.MAR = 0x00;
        this.MDR = 0x00;
    }

    /**
     * Setter for MAR
     */
    public setMAR(Address: number) : void {
        this.MAR = Address;
    }

    /**
     * Setter for MDR
     */
    public setMDR(Data: number) : void {
        this.MDR = Data;
    }

    /**
     * Getter for MAR
     */
    public getMAR() : number {
        return this.MAR;
    }

    /**
     * Getter for MDR
     */
    public getMDR() : number {
        return this.MDR;
    }

    /**
     * Read memory at the location in the MAR and update the MDR
     */
    public read(): number {
        const address = this.getMAR();
        // Reads memory at location of MAR
        let data = this.memoryArray[address];
        // Update the MDR with this new data
        this.setMDR(data);
        return data;

    }

    /**
     * Write the contents of the MDR to memory at the location indicated by the MAR
     */
    public write(): void {
        let address = this.getMAR();
        let data = this.getMDR();
        this.memoryArray[address] = data;
    }

}