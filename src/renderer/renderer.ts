import { flatten, mat4, mult } from "../lib/webgl/MV";
import { Mat4, RenderMethod, setupAttribute } from "../utils/graphics";
import Shape from "../shapes/shape";
import Camera from "./camera";

class Renderer {
    shapesData: { shape: Shape; level: number }[] = [];
    camera?: Camera;

    addShape(shape: Shape, level = 0) {
        shape.renderer = this;
        this.shapesData.push({ shape, level });
        return this;
    }

    setup(
        gl: WebGLRenderingContext,
        program: WebGLProgram,
        camera: Camera
    ): void {
        this.camera = camera;
        let attributeCollection: {
            [key: string]: { size: number; type: number; data: number[] };
        } = {};

        for (let { shape } of this.shapesData) {
            shape.setup(gl);
            for (let [name, { size, type, data }] of Object.entries(
                shape.attributes
            ))
                if (attributeCollection[name])
                    attributeCollection[name].data.push(...data);
                else attributeCollection[name] = { size, type, data };
        }

        for (let [name, { size, type, data }] of Object.entries(
            attributeCollection
        ))
            setupAttribute(gl, program, name, size, type, flatten(data));
    }

    frameCount = 0;

    render(
        gl: WebGLRenderingContext,
        tMatrixLoc: WebGLUniformLocation,
        tNormalMatrixLoc: WebGLUniformLocation,
        timeElapsed: number,
        deltaTime: number
    ): void {
        let offset = 0;
        if (!this.camera) throw Error("No camera on renderer");
        const cameraMatrix: Mat4 = this.camera.genMatrix(gl);
        const normalMatrix: Mat4 = mat4() as Mat4;
        const matrices: Mat4[] = [cameraMatrix];
        const normalMatrices: Mat4[] = [normalMatrix];
        let lastLevel = 0;
        for (let { shape, level } of this.shapesData) {
            if (level < lastLevel) {
                matrices.pop();
                normalMatrices.pop();
            }
            const matrix: any = mult(
                matrices[matrices.length - 1],
                shape.genMatrix()
            );
            const normalMatrix: any = mult(
                normalMatrices[matrices.length - 1],
                shape.genNormalMatrix()
            );
            if (shape.children.length > 0) {
                matrices.push(matrix);
                normalMatrices.push(normalMatrix);
            }

            lastLevel = level;

            shape.preRender(gl, this.frameCount, timeElapsed, deltaTime);
            gl.uniformMatrix4fv(tMatrixLoc, false, flatten(matrix));
            gl.uniformMatrix4fv(tNormalMatrixLoc, false, flatten(normalMatrix));

            const parts = shape.render(
                gl,
                this.frameCount,
                timeElapsed,
                deltaTime
            );
            for (let { count, method } of parts) {
                if (method !== RenderMethod.NONE)
                    gl.drawArrays(method, offset, count);
                shape.postRender(gl, this.frameCount, timeElapsed, deltaTime);
                offset += count;
            }
        }
        this.camera?.update?.(this.frameCount, timeElapsed, deltaTime);
        this.frameCount++;
    }
}

export default Renderer;
