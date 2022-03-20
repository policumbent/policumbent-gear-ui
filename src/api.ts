import type { BikeInfo, Gear, GearPosition, Servo } from "./types";
import axios from "axios";

const waitFor = delay => new Promise(resolve => setTimeout(resolve, delay));

function convertGears(values: object[]): Gear[] {
    return values.map((gear: object) => {
        return {
            id: gear["id"],
            position: {
                up: +gear["position"]["up"],
                down: +gear["position"]["down"]
            } as GearPosition
        } as Gear;
    })
}

export async function getBikeInfo(): Promise<BikeInfo> {
    //const { data } = await axios.get(`/api/info/`);
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
    //const { data } = await axios.get(`/api/gear/configuration`);
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

export async function sendBikeData(positions: Servo[]): Promise<string> {
    if (positions.length > 0) {
        let servo1 = {};
        let servo2 = {};
        servo1[positions[0].name] = positions[0].gears;
        if (positions.length > 1){
            servo2[positions[1].name] = positions[1].gears;
        }
        const payload = servo2 ? {...servo1, ...servo2} : servo1;
        console.log("Sending: ", payload);
        try {
            const response = await axios.post(`/api/gear/configuration`, payload);
            return response.data.message;
        } catch (error) {
            alert(error.message);
            return error;
        }
    }
    else
        throw "No values to send";
}

export function exportPositions(positions: Servo[], fileName: string){
    const content = JSON.stringify(positions);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}

export function readPositionsFromFile(fileInput: HTMLInputElement): Promise<Servo[]>{
    fileInput.click();
    return new Promise((resolve, reject) => {
        fileInput.addEventListener("change", function fileSelected() {
            try {
                fileInput.removeEventListener("change", fileSelected);
                const file = fileInput.files[0];
                const reader = new FileReader();
                reader.readAsText(file);
                reader.onload = () => {
                    const content = reader.result as string;
                    const positions = JSON.parse(content) as Servo[];
                    console.log(positions);
                    resolve(positions);
                }
            } catch (error) {
                reject(error);
            }
        });
    });
}