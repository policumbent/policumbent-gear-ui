import type { BikeInfo, Servo } from "./types";
import { convertGears, waitFor } from "./utils";

export async function getBikeInfo(): Promise<BikeInfo> {
    // const response = await fetch('/api/info');
    // const data = await response.json();
    let data = {} as object;
    await waitFor(500);
    data = {
        name: "phoenix",
        gear: 11,
        servo: 2,
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
        "servo2": [ 
            { "id": 1, "position": { "up": 1, "down": 2 } },
            { "id": 2, "position": { "up": 3, "down": 4 } },
            { "id": 3, "position": { "up": 5, "down": 6 } },
            { "id": 4, "position": { "up": 7, "down": 8 } },
            { "id": 5, "position": { "up": 9, "down": 10 } },
            { "id": 6, "position": { "up": 11, "down": 12 } },
            { "id": 7, "position": { "up": 13, "down": 14 } },
            { "id": 8, "position": { "up": 15, "down": 16 } },
            { "id": 9, "position": { "up": 17, "down": 18 } },
            { "id": 10, "position": { "up": 19, "down": 20 } },
            { "id": 11, "position": { "up": 21, "down": 22 } },
        ],
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

export async function sendGear(payload: object): Promise<string> {
    const res = await fetch(`/api/gear?id=${payload[Object.keys(payload)[0]].id}`, {
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

export async function sendBikeData(old_positions: Servo[], new_positions: Servo[]): Promise<number> {
    console.log("old_positions: ", old_positions);
    console.log("new_positions: ", new_positions);
    if (new_positions.length > 0) {
        let payload: object[] = [];
        
        // get diffs between old and new
        new_positions.forEach(servo => {
            const old_servo = old_positions.find(old_servo => old_servo.id === servo.id);
            if (old_servo) {
                let diffs = servo.gears.filter(gear => {
                    const old_gear = old_servo.gears.find(old_gear => old_gear.id === gear.id);
                    return !old_gear || old_gear.position.up !== gear.position.up || old_gear.position.down !== gear.position.down;
                });
                if (diffs.length > 0) {
                    diffs.forEach(gear => {
                        let data = {};
                        data[servo.name] = {
                            id: gear.id,
                            position: gear.position
                        }
                        if (payload.filter(d => d[Object.keys(d)[0]].id === gear.id).length === 0) {
                            const other_servo_gear = new_positions.find(other_servo => servo.id !== other_servo.id).gears.find(other_gear => other_gear.id === gear.id);
                            if (other_servo_gear) {
                                data[new_positions.find(other_servo => servo.id !== other_servo.id).name] = {
                                    id: other_servo_gear.id,
                                    position: other_servo_gear.position
                                }
                            }
                            payload.push(data);
                        }
                    });
                }
            }
        });

        console.log("Sending: ", payload);
        await Promise.all(payload.map(diff => sendGear(diff)));
        return 0;
    }
    else
        throw "No values to send";
}