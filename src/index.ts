import { onLoad, onResize, pressedKeys, vec4s } from "./utils/base";
import WebGLUtils from "./lib/webgl/webgl-utils";
import {
    clearSetup,
    Direction,
    loadShaders,
    rotate,
    Vec3,
    viewportSetup,
} from "./utils/graphics";
import Renderer from "./renderer/renderer";
import Cube from "./shapes/cube";
import Camera from "./renderer/camera";
import { add, mult, scale } from "./lib/webgl/MV";
import { clamp, DEG_TO_RAD } from "./utils/math";
import treeGen from "./tree-gen";
import Empty from "./shapes/empty";
import Shape from "./shapes/shape";

const renderer = new Renderer();
let cursorLock = false;

const main = () => {
    const canvasElement = document.getElementById(
        "main-canvas"
    ) as HTMLCanvasElement;
    if (!canvasElement) console.error("Canvas element not found");

    canvasElement.addEventListener("click", canvasElement.requestPointerLock);

    document.addEventListener(
        "pointerlockchange",
        () => (cursorLock = document.pointerLockElement === canvasElement)
    );

    canvasElement.addEventListener(
        "mousemove",
        (e) =>
            cursorLock &&
            camera.mapRotation(([x, y, z]) => [
                clamp(x - e.movementY * 0.05, -90, 90),
                y - e.movementX * 0.05,
                z,
            ])
    );

    const gl = WebGLUtils.setupWebGL(canvasElement, null);

    if (!gl) console.error("GL not setup");

    gl.enable(gl.DEPTH_TEST);

    viewportSetup(gl, canvasElement);
    clearSetup(gl, [0.3, 0.3, 1, 1]);

    const program = loadShaders(gl, "vertex-shader", "fragment-shader");

    const camera = new Camera(0, 30, 60).setUpdate(({ deltaTime }, that) => {
        const {
            ShiftLeft = false,
            Space = false,
            KeyW = false,
            KeyA = false,
            KeyS = false,
            KeyD = false,
            ShiftRight = false,
            Digit1 = false,
            Backquote = false,
        } = pressedKeys;

        const xMove = scale(+KeyD + -KeyA, that.right);
        const yMove = scale(+Space + -ShiftLeft, Direction.up);
        const zMove = scale(+KeyS + -KeyW, [
            Math.sin(that.rotation[1] * DEG_TO_RAD),
            0,
            Math.cos(that.rotation[1] * DEG_TO_RAD),
        ]);
        const position = add(
            that.position,
            scale(
                deltaTime * (ShiftRight ? 12 : 3),
                add(xMove, add(yMove, zMove))
            )
        );

        that.setPosition(...(position as Vec3));

        if (Backquote) that.save();
        if (Digit1) that.load();
    });

    onResize(() => camera.updatePerspective(gl));

    const genBranches = (
        input: string,
        turtle: { location: Vec3; rotation: Vec3 },
        length: number,
        angle: number
    ) => {
        const clone = (turtle: { location: Vec3; rotation: Vec3 }) =>
            JSON.parse(JSON.stringify(turtle)) as {
                location: Vec3;
                rotation: Vec3;
            };

        const getDirection = (rotation: Vec3) =>
            mult(rotate(...rotation), [...Direction.up, 1]).slice(0, 3);

        const branches: Shape[] = [];
        const turtleStack: { location: Vec3; rotation: Vec3 }[] = [];
        for (let instruction of input) {
            switch (instruction) {
                // F: Move forward a step of length len, drawing a line (or cylinder) to the new point.
                case "F":
                    branches.push(
                        branch(length, turtle.rotation, turtle.location)
                    );

                    turtle.location = add(
                        turtle.location,
                        scale(length, getDirection(turtle.rotation))
                    ) as Vec3;
                    break;
                // f: Move forward a step of length len without drawing
                case "f":
                    turtle.location = add(
                        turtle.location,
                        scale(length, getDirection(turtle.rotation))
                    ) as Vec3;
                    break;
                // +: Apply a positive rotation about the X-axis of xrot degrees.
                case "+":
                    turtle.rotation[0] += angle;
                    break;
                // -: Apply a negative rotation about the X-axis of xrot degrees.
                case "-":
                    turtle.rotation[0] -= angle;
                    break;
                // &: Apply a positive rotation about the Y-axis of yrot degrees.
                case "&":
                    turtle.rotation[1] += angle;
                    break;
                // ^: Apply a negative rotation about the Y-axis of yrot degrees.
                case "^":
                    turtle.rotation[1] -= angle;
                    break;
                // \: Apply a positive rotation about the Z-axis of zrot degrees.
                case "\\":
                    turtle.rotation[2] += angle;
                    break;
                // /: Apply a negative rotation about the Z-axis of zrot degrees.
                case "/":
                    turtle.rotation[2] -= angle;
                    break;
                // |: Turn around 180 degrees.
                case "|":
                    turtle.rotation = turtle.rotation.map(
                        (x) => x + 180
                    ) as Vec3;
                    break;
                // [: Push the current state of the turtle onto a pushdown stack.
                case "[":
                    turtleStack.push(clone(turtle));
                    break;
                // ]: Pop the state from the top of the turtle stack, and make it the current turtle stack
                case "]":
                    if (turtleStack.length === 0) {
                        throw new Error("Turtle stack is empty");
                    }
                    const newTurtle = turtleStack.pop();
                    if (newTurtle) turtle = newTurtle;
                    break;
            }
        }
        const tree = new Empty(0, 0, 0).setChildren(...branches);
        return tree;
    };

    const branch = (
        length: number,
        rotation: Vec3,
        location: Vec3 = [0, 0, 0]
    ) => {
        const branchObject: Empty = new Empty(...location)
            .setChildren(new Cube(0, length / 2, 0).setScale(0.1, length, 0.1))
            .setRotation(...rotation);
        return branchObject;
    };

    const n = 1;
    const angle = 60;

    const turtle = {
        location: [0, 0, 0] as Vec3,
        rotation: [0, 0, 0] as Vec3,
    };

    new Empty(0, 0, 0)
        .setChildren(genBranches(treeGen, turtle, n, angle))
        .setRotation(0, -90, 0)
        .setScale(0.5, 0.5, 0.5)
        .build(renderer);
    console.log(treeGen);

    renderer.setup(gl, program, camera);

    startTime = Date.now();
    lastRan = startTime;
    setupRender(gl, {
        tMatrixLoc: gl.getUniformLocation(program, "tMatrix"),
        tNormalMatrixLoc: gl.getUniformLocation(program, "tNormalMatrix"),
    });
};

let startTime = 0;
let lastRan = 0;

const setupRender = (
    gl: WebGLRenderingContext,
    payload: { [key: string]: any }
) => {
    setTimeout(() => {
        requestAnimationFrame(() => setupRender(gl, payload));
        const currTime = Date.now();
        render(
            gl,
            payload,
            (currTime - startTime) / 1000,
            (currTime - lastRan) / 1000
        );
        lastRan = currTime;
    }, 50);
};

const render = (
    gl: WebGLRenderingContext,
    payload: { [key: string]: any },
    timeElapsed: number,
    deltaTime: number
) => {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    renderer.render(
        gl,
        payload.tMatrixLoc,
        payload.tNormalMatrixLoc,
        timeElapsed,
        deltaTime
    );
};

onLoad(main);
