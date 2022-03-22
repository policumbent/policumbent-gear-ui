import type { Gear, GearPosition, Servo } from "./types";

export function waitFor(delay) {
    new Promise(resolve => setTimeout(resolve, delay))
}

export function convertGears(values: object[]): Gear[] {
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