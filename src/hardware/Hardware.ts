export class Hardware {
    Id: number;
    name: string;
    debug: boolean = true;

    constructor(Id: number, name: string, debug: boolean) {
        this.Id = Id;
        this.name = name;
        this.debug = debug;
    }

    /** Output a logging message when the 
     * system starts if debug is set to true.
     */ 
    log(message: string): string{
        if (this.debug) {
            let time = Date.now()
            let logMsg = ("[HW - " + this.name + " id: " + this.Id + " - " + time + "]: " + message);

            console.log(logMsg);
        } else {
            return '';
        }

    }

    /** Takes in a number and a desired length.
     * Ouputs a properly formatted hexadecimal number.
     */ 
    public hexLog(givenNumber: number, desiredLength: number): string {
        let hexNumber = ((givenNumber.toString(16)).toUpperCase()).padStart(desiredLength, "0");       
        
        return hexNumber;

    }

}