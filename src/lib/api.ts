import type { BikeInfo, Gear, Servo } from "./types";
import { convertGears, waitFor } from "./utils";

export async function getBikeInfo(): Promise<BikeInfo> {
    // const response = await fetch('/api/info');
    // const data = await response.json();
    let data = {} as object;
    await waitFor(500);
    data = {
        name: "phoenix",
        gear: 11,
        servo: 1,
        last_calibration: "2020-01-01"
    }
    return data as BikeInfo;
}

export async function getGearValues(): Promise<Servo[]> {
    //const response = await fetch('/api/gear/configuration');
    // const data = await response.json();
    await waitFor(500);
    let data = {} as object;
    data = {
        "servo1": [ 
            { "id": 1, "position": { "up": 101, "down": 102 } },
            { "id": 2, "position": { "up": 103, "down": 104 } },
            { "id": 3, "position": { "up": 105, "down": 106 } },
            { "id": 4, "position": { "up": 107, "down": 108 } },
            { "id": 5, "position": { "up": 109, "down": 110 } },
            { "id": 6, "position": { "up": 111, "down": 112 } },
            { "id": 7, "position": { "up": 113, "down": 114 } },
            { "id": 8, "position": { "up": 115, "down": 116 } },
            { "id": 9, "position": { "up": 117, "down": 118 } },
            { "id": 10, "position": { "up": 119, "down": 120 } },
            { "id": 11, "position": { "up": 121, "down": 122 } },
        ]
    };


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
    const res = await fetch(`/api/gear?id=${gear_id}`, {
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