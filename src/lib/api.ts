import type { BikeInfo, Gear, Servo, Pid } from "./types";
import { convertGears } from "./utils";

const endpoint = '__API_ENDPOINT'; // replaced by rollup based on an environment variable called 'API_ENDPOINT' in a .env file

console.log(endpoint);

export async function getBikeInfo(): Promise<BikeInfo> {
    const response = await fetch(`${endpoint}api/info`);
    const data = await response.json();
    return data as BikeInfo;
}

export async function getPid(): Promise<Pid> {
    const response = await fetch(`${endpoint}api/pid`);
    const data = await response.json();
    return data as Pid;
}

export async function setPid(data: Pid): Promise<string> {
    const res = await fetch(`${endpoint}api/pid`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
    if (res.ok) {
        return "ok";
    }
    else {
        throw new Error(`${res.status} ${res.statusText}`);
    }
}

export async function getGearValues(): Promise<Servo[]> {
    const response = await fetch(`${endpoint}api/gear/configuration`);
    const data = await response.json();


    let values: Servo[] = [];
    values[0] = {
        id: 1,
        name: "servo1",
        gears: convertGears(data["servo1"])
    }
    if (data["servo2"]) {
        values[1] = {
            id: 2,
            name: "servo2",
            gears: convertGears(data["servo2"])
        }
    }
    return values;
}

export async function sendGear(gear_id: number, payload: object): Promise<string> {
    const res = await fetch(`${endpoint}api/gear?id=${gear_id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    if (res.ok) {
        return "ok";
    }
    else {
        throw new Error(`${res.status} ${res.statusText}`);
    }
}

export async function sendBikeData(gears: Gear[]): Promise<number> {
    // gears contains one value if bike has one servo
    // gears contains two values if bike has two servos, both with the same gear
    console.log("Sending: ", gears);
    
    if (gears.length > 0) {
        let payload = {
            "servo1": gears[0]
        };
        if (gears.length > 1)
            payload["servo2"] = gears[1];
        
        console.log("Sending: ", payload);
        await sendGear(gears[0].id, payload);
        return 0;
    }
    else
        throw "No values to send";
}