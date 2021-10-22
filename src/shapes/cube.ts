import { Vec4, Vec3, normal } from "../utils/graphics";
import { vec4 } from "../utils/base";
import Shape from "./shape";

class Cube extends Shape {
    _points: Vec4[] = [];
    _normals: Vec3[] = [];
    _colors: Vec3[] = [];

    colors = [
        [0.0, 1.0, 1.0] as Vec3, // cyan
        [1.0, 0.0, 0.0] as Vec3, // red
        [1.0, 1.0, 0.0] as Vec3, // yellow
        [0.0, 1.0, 0.0] as Vec3, // green
        [0.0, 0.0, 1.0] as Vec3, // blue
        [1.0, 0.0, 1.0] as Vec3, // magenta
        [0.0, 1.0, 1.0] as Vec3, // cyan
        [1.0, 0.0, 0.0] as Vec3, // red
        [1.0, 1.0, 0.0] as Vec3, // yellow
        [0.0, 1.0, 0.0] as Vec3, // green
        [0.0, 0.0, 1.0] as Vec3, // blue
        [1.0, 0.0, 1.0] as Vec3, // magenta
    ];

    setup(gl: WebGLRenderingContext): void {
        const cubeVertices = [
            vec4(-0.5, -0.5, 0.5, 1.0),
            vec4(-0.5, 0.5, 0.5, 1.0),
            vec4(0.5, 0.5, 0.5, 1.0),
            vec4(0.5, -0.5, 0.5, 1.0),
            vec4(-0.5, -0.5, -0.5, 1.0),
            vec4(-0.5, 0.5, -0.5, 1.0),
            vec4(0.5, 0.5, -0.5, 1.0),
            vec4(0.5, -0.5, -0.5, 1.0),
        ];

        const cubePoints = [
            [1, 0, 3, 2],
            [2, 3, 7, 6],
            [3, 0, 4, 7],
            [6, 5, 1, 2],
            [4, 5, 6, 7],
            [5, 4, 0, 1],
        ];

        let i = 0;
        for (const [a, b, c, d] of cubePoints) {
            const indices = [a, b, c, a, c, d];
            const pointNormal = normal(
                cubeVertices[a].slice(0, 3) as Vec3,
                cubeVertices[b].slice(0, 3) as Vec3,
                cubeVertices[c].slice(0, 3) as Vec3
            );
            for (const index of indices) {
                this._points.push(cubeVertices[index]);
                this._normals.push(pointNormal);
                this._colors.push(this.colors[i]);
            }
            i++;
        }

        this.attributes = {
            vPosition: {
                size: 4,
                type: gl.FLOAT,
                data: this._points.flat(),
            },
            vColor: {
                size: 3,
                type: gl.FLOAT,
                data: this._colors.flat(),
            },
            vNormal: {
                size: 3,
                type: gl.FLOAT,
                data: this._normals.flat(),
            },
        };
    }

    render(gl: WebGLRenderingContext) {
        return [
            {
                method: gl.TRIANGLES,
                count: this._points.length,
            },
        ];
    }
}

export default Cube;
