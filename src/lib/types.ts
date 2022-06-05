
export type Gear = {
    id: number;
    position: GearPosition;
}

export type Pid = {
    Kp: number;
    Ki: number;
    Kd: number;
}

export type GearPosition = {
    up: number;
    down: number;
}

export type Servo = {
    id: number; // 1 || 2
    name: string; // servo1 || servo2
    gears: Gear[];
}

export type BikeInfo = {
    name: string;
    gear: number;
    servo: number;
    last_calibration: string;
}