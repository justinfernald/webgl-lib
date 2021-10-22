import { initShaders } from "../lib/webgl/initShaders";
import { cross, normalize, subtract } from "../lib/webgl/MV";
import { vec3 } from "./base";
import { DEG_TO_RAD } from "./math";

export type Vec2 = [x: number, y: number];
export type Vec3 = [x: number, y: number, z: number];
export type Vec4 = [x: number, y: number, z: number, w: number];

export type Mat2 = [[a: number, b: number], [c: number, d: number]];

export type Mat3 = [
    [a: number, b: number, c: number],
    [d: number, e: number, f: number],
    [g: number, h: number, i: number]
];

export type Mat4 = [
    [a: number, b: number, c: number, d: number],
    [e: number, f: number, g: number, h: number],
    [i: number, j: number, k: number, l: number],
    [m: number, n: number, o: number, p: number]
];

export enum RenderMethod {
    NONE = -1,
    TRIANGLES = 4,
    STRIPS = 5,
    FAN = 6,
}

export enum Axis {
    X = 0,
    Y = 1,
    Z = 2,
}

export abstract class Transformable {
    position: Vec3 = [0, 0, 0];
    rotation: Vec3 = [0, 0, 0];
    scale: Vec3 = [1, 1, 1];

    get forward(): Vec3 {
        return forward(this.rotation[0], this.rotation[1]);
    }

    get backward(): Vec3 {
        return backward(this.rotation[0], this.rotation[1]);
    }

    get up(): Vec3 {
        return up(this.rotation[0], this.rotation[2]);
    }

    get down(): Vec3 {
        return down(this.rotation[0], this.rotation[2]);
    }

    get left(): Vec3 {
        return left(this.rotation[1], this.rotation[2]);
    }

    get right(): Vec3 {
        return right(this.rotation[1], this.rotation[2]);
    }

    getPosition(): Vec3 {
        return this.position;
    }

    setPosition(x: number, y: number, z: number) {
        this.position = [x, y, z];
        return this;
    }

    mapPosition(f: (this: this, position: Vec3, that?: this) => Vec3) {
        this.position = f.call(this, this.position, this);
        return this;
    }

    getScale(): Vec3 {
        return this.scale;
    }

    setScale(x = 1, y = 1, z = 1) {
        this.scale = [x, y, z];
        return this;
    }

    mapScale(f: (this: this, scale: Vec3, that?: this) => Vec3) {
        this.rotation = f.call(this, this.scale, this);
        return this;
    }

    getRotation(): Vec3 {
        return this.rotation;
    }

    setRotation(x: number, y: number, z: number) {
        this.rotation = [x, y, z];
        return this;
    }

    mapRotation(f: (this: this, eulerAngles: Vec3, that?: this) => Vec3) {
        this.rotation = f.call(this, this.rotation, this);
        return this;
    }
}

export const Direction = {
    forward: vec3(0, 0, 1),
    back: vec3(0, 0, -1),
    up: vec3(0, 1, 0),
    down: vec3(0, -1, 0),
    right: vec3(1, 0, 0),
    left: vec3(-1, 0, 0),
};

/**
 * Setups up viewport of the rendering context
 * @param gl
 * @param canvasElement
 */
export function viewportSetup(
    gl: WebGLRenderingContext,
    canvasElement: HTMLCanvasElement
) {
    gl.viewport(0, 0, canvasElement.width, canvasElement.height);
}

/**
 * Sets the clear color of the rendering context
 * @param gl
 * @param color
 */
export function clearSetup(gl: WebGLRenderingContext, color: Vec4) {
    gl.clearColor(...color);
    gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * Load in vertex and fragment shaders from html id
 * @param gl
 * @param vertexShaderSource
 * @param fragmentShaderSource
 * @returns
 */
export function loadShaders(
    gl: WebGLRenderingContext,
    vertexShaderSource: string,
    fragmentShaderSource: string
) {
    const program = initShaders(gl, vertexShaderSource, fragmentShaderSource);
    gl.useProgram(program);
    return program;
}

/**
 * Set up attribute buffers for vertex shaders
 * @param gl
 * @param program
 * @param name
 * @param size
 * @param type
 * @param data
 * @param options
 * @returns
 */
export function setupAttribute(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    name: string,
    size: number,
    type: number,
    data: BufferSource,
    options?: {
        stride?: number;
        offset?: number;
        normalize?: boolean;
    }
) {
    options = options || {};
    let { stride = 0, offset = 0, normalize = false } = options;

    const bufferId = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferId);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);

    const attributeLocation = gl.getAttribLocation(program, name);
    gl.vertexAttribPointer(
        attributeLocation,
        size,
        type,
        normalize,
        stride,
        offset
    );
    gl.enableVertexAttribArray(attributeLocation);

    return { bufferId, attributeLocation };
}

/**
 * Finds distance between two vectors
 * @param a vector a
 * @param b vector b
 * @returns
 */
export function distance(a: Vec2 | Vec3 | Vec4, b: Vec2 | Vec3 | Vec4) {
    if (a.length !== b.length) throw new Error("Vectors are different lengths");
    let sum = 0;
    for (let i = 0; i < a.length; i++) sum += Math.pow(a[i] - b[i], 2);
    return Math.sqrt(sum);
}

/**
 * creates transformation matrix without matrix multiplication (for performance)
 * orders is: translation * rotation * scale
 * @param x x position
 * @param y y position
 * @param z z position
 * @param xAngle x angle
 * @param yAngle y angle
 * @param zAngle z angle
 * @param xScale x scale
 * @param yScale y scale
 * @param zScale z scale
 * @returns
 */
export function transformTRS(
    x: number,
    y: number,
    z: number,
    xAngle: number,
    yAngle: number,
    zAngle: number,
    xScale: number,
    yScale: number,
    zScale: number
): Mat4 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    const matrix: any = [
        [
            xScale * cosY * cosZ,
            yScale * (sinX * sinY * cosZ - cosX * sinZ),
            zScale * (cosX * sinY * cosZ + sinX * sinZ),
            x,
        ],
        [
            xScale * cosY * sinZ,
            yScale * (sinX * sinY * sinZ + cosX * cosZ),
            zScale * (cosX * sinY * sinZ - sinX * cosZ),
            y,
        ],
        [xScale * -sinY, yScale * sinX * cosY, zScale * cosX * cosY, z],
        [0, 0, 0, 1],
    ];
    matrix.matrix = true;

    return matrix;
}

/**
 * creates transformation matrix without matrix multiplication (for performance)
 * orders is: translation * rotation
 * @param x x position
 * @param y y position
 * @param z z position
 * @param xAngle x angle
 * @param yAngle y angle
 * @param zAngle z angle
 * @returns
 */
export function transformTR(
    x: number,
    y: number,
    z: number,
    xAngle: number,
    yAngle: number,
    zAngle: number
): Mat4 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    const matrix: any = [
        [
            cosY * cosZ,
            sinX * sinY * cosZ - cosX * sinZ,
            cosX * sinY * cosZ + sinX * sinZ,
            x,
        ],
        [
            cosY * sinZ,
            sinX * sinY * sinZ + cosX * cosZ,
            cosX * sinY * sinZ - sinX * cosZ,
            y,
        ],
        [-sinY, sinX * cosY, cosX * cosY, z],
        [0, 0, 0, 1],
    ];
    matrix.matrix = true;

    return matrix;
}

/**
 * creates rotation matrix without matrix multiplication (for performance)
 * @param xAngle x angle
 * @param yAngle y angle
 * @param zAngle z angle
 * @returns
 */
export function rotate(xAngle: number, yAngle: number, zAngle: number): Mat4 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    const matrix: any = [
        [
            cosY * cosZ,
            sinX * sinY * cosZ - cosX * sinZ,
            cosX * sinY * cosZ + sinX * sinZ,
            0,
        ],
        [
            cosY * sinZ,
            sinX * sinY * sinZ + cosX * cosZ,
            cosX * sinY * sinZ - sinX * cosZ,
            0,
        ],
        [-sinY, sinX * cosY, cosX * cosY, 0],
        [0, 0, 0, 1],
    ];
    matrix.matrix = true;

    return matrix;
}

export function rotateXY(xAngle: number, yAngle: number): Mat4 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);

    const matrix: any = [
        [cosY, sinX * sinY, cosX * sinY, 0],
        [0, cosX, -sinX, 0],
        [-sinY, sinX * cosY, cosX * cosY, 0],
        [0, 0, 0, 1],
    ];
    matrix.matrix = true;

    return matrix;
}

export function rotateXZ(xAngle: number, zAngle: number): Mat4 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    const matrix: any = [
        [cosZ, -cosX * sinZ, sinX * sinZ, 0],
        [sinZ, cosX * cosZ, -sinX * cosZ, 0],
        [0, sinX, cosX, 0],
        [0, 0, 0, 1],
    ];
    matrix.matrix = true;

    return matrix;
}

export function rotateYZ(yAngle: number, zAngle: number): Mat4 {
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    const matrix: any = [
        [cosY * cosZ, -sinZ, sinY * cosZ, 0],
        [cosY * sinZ, cosZ, sinY * sinZ, 0],
        [-sinY, 0, cosY, 0],
        [0, 0, 0, 1],
    ];
    matrix.matrix = true;

    return matrix;
}

export function forward(xAngle: number, yAngle: number): Vec3 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);

    return [cosX * sinY, -sinX, cosX * cosY];
}

export function backward(xAngle: number, yAngle: number): Vec3 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);

    return [-cosX * sinY, sinX, -cosX * cosY];
}

export function up(xAngle: number, zAngle: number): Vec3 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    return [-cosX * sinZ, cosX * cosZ, sinX];
}

export function down(xAngle: number, zAngle: number): Vec3 {
    const cosX = Math.cos(xAngle * DEG_TO_RAD);
    const sinX = Math.sin(xAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    return [cosX * sinZ, -cosX * cosZ, -sinX];
}

export function right(yAngle: number, zAngle: number): Vec3 {
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    return [cosY * cosZ, cosY * sinZ, -sinY];
}

export function left(yAngle: number, zAngle: number): Vec3 {
    const cosY = Math.cos(yAngle * DEG_TO_RAD);
    const sinY = Math.sin(yAngle * DEG_TO_RAD);
    const cosZ = Math.cos(zAngle * DEG_TO_RAD);
    const sinZ = Math.sin(zAngle * DEG_TO_RAD);

    return [-cosY * cosZ, -cosY * sinZ, sinY];
}

export function normal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
    const v1 = subtract(b, a);
    const v2 = subtract(c, a);

    return normalize(cross(v1, v2));
}
