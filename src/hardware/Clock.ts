import {Hardware} from "./Hardware";
import {ClockListener} from "./imp/ClockListener";

export class Clock extends Hardware {

    private clockListeners: ClockListener[] = [];  

    constructor(Id: number, name: string, debug: boolean) {
        super(Id, name, debug);

        // Sends pulse every 500 milliseconds
        setInterval(() => this.sendPulse(), 500);
    }

    /**
     * Add specific clock listener to the clock listeners array.
     */
    public addCl(cl: ClockListener): void {

        this.clockListeners.push(cl);
    }

    /**
     * Iterate through each member of array 
     * and send a pulse for each.
     */
    sendPulse(): void {
        console.log(this.log("Clock Pulse Initialized"));
        for (const cl of this.clockListeners)
            cl.pulse();

    }
}
