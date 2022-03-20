import type { BikeInfo, Gear, GearPosition, Servo } from "./types";
import axios from "axios";

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

function convertGears(values: object[]): Gear[] {
    return values.map((gear: object) => {
        return {
            id: gear["id"],
            position: {
                shift_up: +gear["position"]["shift_up"],
                shift_down: +gear["position"]["shift_down"]
            } as GearPosition
        } as Gear;
    })
}

export async function getBikeInfo(): Promise<BikeInfo> {
    //const { data } = await axios.get(`${process.env.API_URL}/api/info/`);
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
    //const { data } = await axios.get(`${process.env.API_URL}/api/gear/configuration`);
    await waitFor(500);
    let data = {} as object;
    data = {
        "servo2": [ 
            { "id": 1, "position": { "shift_up": 1, "shift_down": 2 } },
            { "id": 2, "position": { "shift_up": 3, "shift_down": 4 } },
            { "id": 3, "position": { "shift_up": 5, "shift_down": 6 } },
            { "id": 4, "position": { "shift_up": 7, "shift_down": 8 } },
            { "id": 5, "position": { "shift_up": 9, "shift_down": 10 } },
            { "id": 6, "position": { "shift_up": 11, "shift_down": 12 } },
            { "id": 7, "position": { "shift_up": 13, "shift_down": 14 } },
            { "id": 8, "position": { "shift_up": 15, "shift_down": 16 } },
            { "id": 9, "position": { "shift_up": 17, "shift_down": 18 } },
            { "id": 10, "position": { "shift_up": 19, "shift_down": 20 } },
            { "id": 11, "position": { "shift_up": 21, "shift_down": 22 } },
        ],
        "servo1": [ 
            { "id": 1, "position": { "shift_up": 101, "shift_down": 102 } },
            { "id": 2, "position": { "shift_up": 103, "shift_down": 104 } },
            { "id": 3, "position": { "shift_up": 105, "shift_down": 106 } },
            { "id": 4, "position": { "shift_up": 107, "shift_down": 108 } },
            { "id": 5, "position": { "shift_up": 109, "shift_down": 110 } },
            { "id": 6, "position": { "shift_up": 111, "shift_down": 112 } },
            { "id": 7, "position": { "shift_up": 113, "shift_down": 114 } },
            { "id": 8, "position": { "shift_up": 115, "shift_down": 116 } },
            { "id": 9, "position": { "shift_up": 117, "shift_down": 118 } },
            { "id": 10, "position": { "shift_up": 119, "shift_down": 120 } },
            { "id": 11, "position": { "shift_up": 121, "shift_down": 122 } },
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

export async function sendBikeData(positions: Servo[]): Promise<string> {
    let servo1 = {};
    let servo2 = {};
    servo1[positions[0].name] = positions[0].gears;
    if (positions[1]){
        servo2[positions[1].name] = positions[1].gears;
    }
    const payload = servo2 ? {...servo1, ...servo2} : servo1;
    console.log(payload);
    try {
        const response = await axios.post(`${process.env.API_URL}/api/gear/configuration`, payload);
        return response.data.message;
    } catch (error) {
        return error;
    }
}