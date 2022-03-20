
export type Gear = {
    id: number;
    position: GearPosition;
}

export type GearPosition = {
    shift_up: number;
    shift_down: number;
}

export type Servo = {
    id: number;
    name: string; // servo1 || servo2
    gears: Gear[];
}

export type BikeInfo = {
    name: string;
    gear: number;
    servo: number;
    last_calibration: string;
}