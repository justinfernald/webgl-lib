import { inverse4, mult, perspective } from "../lib/webgl/MV";
import { vec3 } from "../utils/base";
import { Mat4, Transformable, transformTRS, Vec3 } from "../utils/graphics";

class Camera extends Transformable {
    position: Vec3;
    rotation: Vec3 = [0, 0, 0];
    scale: Vec3 = [1, 1, 1];
    matrix?: Mat4;
    update?: (
        frameCount: number,
        timeElapsed: number,
        deltaTime: number
    ) => void;
    fov: number;
    near: number;
    far: number;

    constructor(x = 0, y = 0, z = 0, { fov = 45, near = 0.1, far = 200 } = {}) {
        super();
        this.fov = fov;
        this.near = near;
        this.far = far;
        this.position = vec3(x, y, z);
    }

    save() {
        localStorage.setItem(
            "camera",
            JSON.stringify({
                position: this.position,
                rotation: this.rotation,
            })
        );
    }

    load() {
        const data = localStorage.getItem("camera");
        if (!data) return console.error("No camera data found");
        const { position, rotation } = JSON.parse(data);
        this.position = position;
        this.rotation = rotation;
    }

    updatePerspective(gl: WebGLRenderingContext) {
        this.matrix = perspective(
            this.fov,
            gl.canvas.clientWidth / gl.canvas.clientHeight,
            this.near,
            this.far
        ) as any;
    }

    genMatrix(gl: WebGLRenderingContext): Mat4 {
        if (!this.matrix) this.updatePerspective(gl);
        const tMatrix = mult(
            this.matrix,
            inverse4(
                transformTRS(...this.position, ...this.rotation, ...this.scale)
            )
        );
        return tMatrix as any;
    }

    setUpdate(
        f: (
            this: this,
            data: {
                frameCount: number;
                timeElapsed: number;
                deltaTime: number;
            },
            that: this
        ) => void
    ) {
        this.update = (
            frameCount: number,
            timeElapsed: number,
            deltaTime: number
        ) => f.call(this, { frameCount, timeElapsed, deltaTime }, this);
        return this;
    }
}

export default Camera;
