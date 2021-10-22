import { onLoad, onResize, pressedKeys } from "./utils/base";
import WebGLUtils from "./lib/webgl/webgl-utils";
import {
    clearSetup,
    Direction,
    loadShaders,
    Vec3,
    viewportSetup,
} from "./utils/graphics";
import Renderer from "./renderer/renderer";
import Cube from "./shapes/cube";
import Camera from "./renderer/camera";
import { add, scale } from "./lib/webgl/MV";
import { clamp, DEG_TO_RAD } from "./utils/math";
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

    const camera = new Camera(0, -1.5, 10).setUpdate(({ deltaTime }, that) => {
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

    new Cube(0,0,0).build(renderer);

    renderer.setup(gl, program, camera);

    const tMatrixLoc = gl.getUniformLocation(program, "tMatrix");
    const tNormalMatrixLoc = gl.getUniformLocation(program, "tNormalMatrix");

    startTime = Date.now();
    lastRan = startTime;
    setupRender(gl, { tMatrixLoc, tNormalMatrixLoc });
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
