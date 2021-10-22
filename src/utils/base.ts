import { Vec2, Vec3, Vec4 } from "./graphics";

/**
 * Sleep for a given number of milliseconds
 * @example
 * await sleep(1000); // sleeps for 1 second
 * @param ms time in milliseconds
 * @returns
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Memoizes a function
 * @param f function to memoize
 * @returns memoized function
 */
export function memo<IT, OT>(
    f: (...args: IT[]) => OT
): ((...args: IT[]) => OT) & { dp?: Map<any, any> } {
    let dp = new Map<string, any>();
    let memoFunc: ((...args: IT[]) => OT) & { dp?: Map<any, any> } = (
        ...args: IT[]
    ) => {
        let savedValue = memoFunc?.dp?.get(args.toString());
        if (savedValue != undefined) return savedValue;
        let output = f(...args);
        memoFunc?.dp?.set(args.toString(), output);
        return output;
    };
    memoFunc.dp = dp;
    return memoFunc;
}

/**
 * Gives the dimensions of the canvas
 * @returns
 */
export function dimensions(): [width: number, height: number] {
    return [window.innerWidth, window.innerHeight];
}

/**
 * Gives the width of the canvas
 * @returns
 */
export function width(): number {
    return window.innerWidth;
}

/**
 * Gives the height of the canvas
 * @returns
 */
export function height(): number {
    return window.innerHeight;
}

export function vec2(x = 0, y = 0): Vec2 {
    return [x, y];
}

export function vec3(x = 0, y = 0, z = 0): Vec3 {
    return [x, y, z];
}

export function vec4(x = 0, y = 0, z = 0, w = 0): Vec4 {
    return [x, y, z, w];
}

/**
 * For vec4 ready to be used in a shader
 * @param x
 * @param y
 * @param z
 * @returns
 */
export function vec4s(x = 0, y = 0, z = 0): Vec4 {
    return [x, y, z, 1];
}

export function vec3ToVec4s(v: Vec3): Vec4 {
    return [...v, 1];
}

export function location2DToTuple(location: { x: number; y: number }): Vec2 {
    return [location.x, location.y];
}

export function location2DToPair(location: Vec2): {
    x: number;
    y: number;
} {
    return { x: location[0], y: location[1] };
}

export function location3DToTuple(location: {
    x: number;
    y: number;
    z: number;
}): Vec3 {
    return [location.x, location.y, location.z];
}

export function location3DToPair(location: Vec3): {
    x: number;
    y: number;
    z: number;
} {
    return { x: location[0], y: location[1], z: location[2] };
}

export function location4DToTuple(location: {
    x: number;
    y: number;
    z: number;
    w: number;
}): Vec4 {
    return [location.x, location.y, location.z, location.w];
}

export function location4DToPair(location: Vec4): {
    x: number;
    y: number;
    z: number;
    w: number;
} {
    return { x: location[0], y: location[1], z: location[2], w: location[3] };
}

export function onResize(listener: (this: Window, ev: UIEvent) => any) {
    window.addEventListener("resize", listener);
}

export function onLoad(listener: (this: Window, ev: Event) => any) {
    window.addEventListener("load", listener);
}

export function onKeyDown(listener: (this: Window, ev: KeyboardEvent) => any) {
    window.addEventListener("keydown", listener);
}

export function onKeyPress(listener: (this: Window, ev: KeyboardEvent) => any) {
    window.addEventListener("keypress", listener);
}

export const mouseDown = { left: false, middle: false, right: false };
window.addEventListener(
    "mouseup",
    (e) => ((mouseDown as any)[["left", "middle", "right"][e.button]] = false)
);
window.addEventListener(
    "mousedown",
    (e) => ((mouseDown as any)[["left", "middle", "right"][e.button]] = true)
);

export const pressedKeys: { [key: string]: boolean } = {};
window.addEventListener("keyup", (e) => (pressedKeys[e.code] = false));
window.addEventListener("keydown", (e) => (pressedKeys[e.code] = true));
