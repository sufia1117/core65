// import statements for hardware
import {Cpu} from "./hardware/Cpu";
import {Hardware} from "./hardware/Hardware";
import {Clock} from "./hardware/Clock";
import {MMU} from "./hardware/Mmu";
import {Logging} from "./hardware/imp/Logging";
import {InstructionSet} from "./hardware/imp/InstructionSet";
import { InterruptController } from "./hardware/imp/InterruptController";
import { Keyboard } from "./hardware/Keyboard";


/*
    Constants
 */
// Initialization Parameters for Hardware
// Clock cycle interval
const CLOCK_INTERVAL= 500;               // This is in ms (milliseconds) so 1000 = 1 second, 100 = 1/10 second
                                        // A setting of 100 is equivalent to 10hz, 1 would be 1,000hz or 1khz,
                                        // .001 would be 1,000,000 or 1mhz. Obviously you will want to keep this
                                        // small, I recommend a setting of 100, if you want to slow things down
                                        // make it larger.


export class System extends Hardware {

    private _CPU : Cpu = null; // Create a new Cpu instance

    private _Clock : Clock = null;  // Create a new Clock instance

    private _MMU : MMU;  // Create a new MMU instance

    private logging: Logging;

    private _interruptController: InterruptController;

    private _keyboard: Keyboard;

    private _InstructionSet: InstructionSet;

    System: System;

    public running: boolean = false;

    constructor(Id: number, name: string, debug: boolean) {
        
        super(Id, name, debug);

        this.logging = new Logging();

        this._interruptController = new InterruptController(0, "InterruptController", true);

        this._keyboard = new Keyboard(0, "Keyboard", true, 1, 5, this._interruptController);

        this._InstructionSet = new InstructionSet();

        this._MMU = new MMU(0, "MMU", true, this._CPU);

        this._CPU = new Cpu(0 , "Cpu", true, this.logging, this._MMU, this._InstructionSet, this._interruptController);

        this._Clock = new Clock(0, "CLK", false);
        

        /*
        Start the system (Analogous to pressing the power button and having voltages flow through the components)
        When power is applied to the system clock, it begins sending pulses to all clock observing hardware
        components so they can act on each clock cycle.
         */

        this.startSystem();

    }

    public startSystem(): boolean {
        this._CPU.cpuClockCount = 0;  // CPU clock count starts at 0 every time system is booted
        this._MMU.initializeMemory(); // Initialize the memory array when the system starts
        this._MMU.helloWorld();      // static program is written to memory
        this._interruptController.saveDevice(this._keyboard);   // Save keyboard to interrupt controller
        this._keyboard.monitorKeys();   // start monitoring keyboard input

        this.log("Created");
        this._CPU.log("Created");
        this._Clock.log("Created");
        this._MMU.log("Created - Addressable space : 65536");
        this._MMU.log("Initialized Memory");

        this._MMU.log("Memory Dump: Debug");
        this._MMU.log("--------------------------------------------"); 
        this._MMU.log(this._MMU.displayMemory(0x0000, 0x0010));
        this._MMU.log("--------------------------------------------"); 
        this._MMU.log(this._MMU.displayMemory(0x0040, 0x0043));
        this._MMU.log("--------------------------------------------"); 
        this._MMU.log(this._MMU.displayMemory(0x0050, 0x005C));
        this._MMU.log("Memory Dump: Complete");

        this._Clock.addCl(this._interruptController);
        this._Clock.addCl(this._CPU);
        this._Clock.addCl(this._MMU);
        
        
        return true;
    }

    public stopSystem(): boolean {

        return false;

    }
}

let system: System = new System(0 , "System", true);

