import { mult } from "../lib/webgl/MV";
import {
    Mat4,
    RenderMethod,
    rotate,
    Transformable,
    transformTRS,
    Vec3,
} from "../utils/graphics";
import Renderer from "../renderer/renderer";

abstract class Shape extends Transformable {
    position: Vec3;
    scale: Vec3 = [1, 1, 1];
    rotation: Vec3 = [0, 0, 0];
    attributes: {
        [key: string]: { size: number; type: number; data: number[] };
    } = {};
    colors: Vec3[] = [];
    renderer?: Renderer;
    preTransform?: Mat4;
    postTransform?: Mat4;

    parent: Shape | null = null;
    children: Shape[] = [];

    constructor(x = 0, y = 0, z = 0) {
        super();
        this.position = [x, y, z];
    }

    setChildren(...shapes: Shape[]) {
        this.children = shapes;
        for (let shape of shapes) {
            shape.renderer = this.renderer;
            shape.parent = this;
        }
        return this;
    }

    build(renderer: Renderer, level = 0) {
        renderer.addShape(this, level);
        const nextLevel = level + 1;
        for (let child of this.children) child.build(renderer, nextLevel);

        return this;
    }

    genMatrix(): Mat4 {
        let tMatrix: any = transformTRS(
            ...this.position,
            ...this.rotation,
            ...this.scale
        );

        if (this.preTransform) tMatrix = mult(this.preTransform, tMatrix);

        if (this.postTransform) tMatrix = mult(tMatrix, this.postTransform);

        return tMatrix;
    }

    genNormalMatrix(): Mat4 {
        return rotate(...this.rotation);
    }

    setPreRender(
        f: (
            this: this,
            data: {
                gl: WebGLRenderingContext;
                frameCount: number;
                timeElapsed: number;
                deltaTime: number;
            },
            that: this
        ) => void
    ) {
        this.preRender = (
            gl: WebGLRenderingContext,
            frameCount: number,
            timeElapsed: number,
            deltaTime: number
        ) => f.call(this, { gl, frameCount, timeElapsed, deltaTime }, this);
        return this;
    }

    setPostRender(
        f: (
            this: this,
            data: {
                gl: WebGLRenderingContext;
                frameCount: number;
                timeElapsed: number;
                deltaTime: number;
            },
            that: this
        ) => void
    ) {
        this.postRender = (
            gl: WebGLRenderingContext,
            frameCount: number,
            timeElapsed: number,
            deltaTime: number
        ) => f.call(this, { gl, frameCount, timeElapsed, deltaTime }, this);
        return this;
    }

    abstract setup(gl: WebGLRenderingContext): void;
    preRender(
        gl: WebGLRenderingContext,
        frameCount: number,
        timeElapsed: number,
        deltaTime: number
    ) {}
    abstract render(
        gl: WebGLRenderingContext,
        frameCount: number,
        timeElapsed: number,
        deltaTime: number
    ): {
        method: RenderMethod;
        count: number;
    }[];
    postRender(
        gl: WebGLRenderingContext,
        frameCount: number,
        timeElapsed: number,
        deltaTime: number
    ) {}
}

export default Shape;
