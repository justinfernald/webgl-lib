import { mult as singleMult } from "../lib/webgl/MV";

/**
 * Used to clamp a value between a min and max value.
 * @param x input number
 * @param min lower bound
 * @param max upper bound
 * @returns values of x clamped to min and max
 */
export function clamp(
    x: number,
    min: number | undefined,
    max: number | undefined
) {
    if (min !== undefined && max !== undefined && min > max)
        throw Error("Invalid Min Max values");
    if (min !== undefined && x < min) return min;
    if (max !== undefined && x > max) return max;
    return x;
}

/**
 * Factor to multiply by to convert from degrees to radians
 */
export const DEG_TO_RAD = Math.PI / 180;

/**
 * Factor to multiply by to convert from radians to degrees
 */
export const RAD_TO_DEG = 180 / Math.PI;

/**
 * Value of TAU, which is 2 * PI
 */
export const TAU = 2 * Math.PI;

/**
 * Returns sign of number
 * @param x value to check sign
 * @returns value of -1, 0, or 1
 */
export function sign(x: number) {
    if (x === 0) return 0;
    return x < 0 ? -1 : 1;
}

/**
 * Lerps from min to max with a smooth step with input being in the range [0, 1]
 * @param min
 * @param max
 * @param input
 * @param clampValue
 * @returns
 */
export function lerp(
    min: number,
    max: number,
    input: number,
    clampValue = true
) {
    if (clampValue) input = clamp(input, 0, 1);
    return min + (max - min) * input;
}

/**
 * Division with floor on output
 * @param a numerator
 * @param b denominator
 * @returns
 */
export function intDivide(a: number, b: number) {
    return Math.floor(a / b);
}

/**
 * Same as lerp, but is unbounded
 * @param min
 * @param max
 * @param input
 * @returns
 */
export function lerpUnclamped(min: number, max: number, input: number) {
    return lerp(min, max, input, false);
}

/**
 * Fixed modulo function that always returns a positive value
 * @param x number to modulo
 * @param d divisor
 * @returns
 */
export function fixMod(x: number, d: number) {
    return ((x % d) + d) % d;
}

/**
 * Normalizes angle to be between 0 and 360
 * @param angle angle in degrees
 * @returns
 */
export function normalizeAngleDeg(angle: number) {
    return fixMod(angle, 360);
}

/**
 * Normalizes angle to be between 0 and 2*PI
 * @param angle angle in radians
 * @returns
 */
export function normalizeAngleRad(angle: number) {
    return fixMod(angle, TAU);
}

/**
 * Reduce Row Echelon form using Gauss Jordan method
 * Source: https://github.com/substack/rref
 * @param A matrix to take rref of
 * @returns rref of A
 */
export function rref(A: number[][]) {
    var rows = A.length;
    var columns = A[0].length;

    var lead = 0;
    for (var k = 0; k < rows; k++) {
        if (columns <= lead) return;

        var i = k;
        while (A[i][lead] === 0) {
            i++;
            if (rows === i) {
                i = k;
                lead++;
                if (columns === lead) return;
            }
        }
        var iRow = A[i],
            kRow = A[k];
        (A[i] = kRow), (A[k] = iRow);

        var val = A[k][lead];
        for (var j = 0; j < columns; j++) {
            A[k][j] /= val;
        }

        for (var i = 0; i < rows; i++) {
            if (i === k) continue;
            val = A[i][lead];
            for (var j = 0; j < columns; j++) {
                A[i][j] -= val * A[k][j];
            }
        }
        lead++;
    }
    return A;
}

export function matrixMinor(A: number[][], row: number, col: number) {
    const rows = A.length;
    const columns = A[0].length;
    const minor: number[][] = [];
    let currRow = 0;
    for (let i = 0; i < rows; i++) {
        if (i === row) continue;
        minor[currRow] = [];
        let currCol = 0;
        for (let j = 0; j < columns; j++) {
            if (j === col) continue;
            minor[currRow][currCol] = A[i][j];
            currCol++;
        }
        currRow++;
    }
    return minor;
}

export function mult(...matrices: number[][]): number[][] {
    if (matrices.length === 0) throw Error("No matrix passed");
    let output: any = matrices[0];
    for (let matrix of matrices.slice(1)) output = singleMult(output, matrix);

    return output;
}

export function ellipseGen(height = 1, width = 1, strength = 2) {
    return (x: number) =>
        height *
        (1 - (1 / width ** strength) * (x - width) ** strength) **
            (1 / strength);
}
