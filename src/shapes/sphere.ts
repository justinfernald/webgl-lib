import { Vec4, Vec3, normal } from "../utils/graphics";
import { vec4 } from "../utils/base";
import Shape from "./shape";

class Sphere extends Shape {
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
    ];

    constructor(
        private radius = 0.5,
        private slices = 32,
        private stacks = 16,
        position: Vec3 = [0, 0, 0]
    ) {
        super(...position);
    }

    setup(gl: WebGLRenderingContext): void {
        const radius = this.radius;
        const slices = this.slices;
        const stacks = this.stacks;

        const points: Vec4[] = [];
        const colors: Vec3[] = [];

        for (let i = 0; i <= stacks; i++) {
            const v = i / stacks;
            const phi = v * Math.PI;

            for (let j = 0; j <= slices; j++) {
                const u = j / slices;
                const theta = u * 2 * Math.PI;

                const x = Math.cos(theta) * Math.sin(phi);
                const y = Math.cos(phi);
                const z = Math.sin(theta) * Math.sin(phi);

                points.push(vec4(x, y, z, 1));
                colors.push(this.colors[i % this.colors.length]);
            }
        }

        for (let i = 0; i < stacks; i++) {
            const row1 = i * (slices + 1);
            const row2 = (i + 1) * (slices + 1);

            for (let j = 0; j < slices; j++) {
                const p1 = row1 + j;
                const p2 = row2 + j;
                const p3 = row2 + j + 1;
                const p4 = row1 + j + 1;

                const normalPoint1 = normal(
                    points[p2].slice(0, 3) as Vec3,
                    points[p1].slice(0, 3) as Vec3,
                    points[p3].slice(0, 3) as Vec3
                );
                this._points.push(points[p1]);
                this._points.push(points[p2]);
                this._points.push(points[p3]);
                for (let i = 0; i < 3; i++) this._normals.push(normalPoint1);

                const normalPoint2 = normal(
                    points[p3].slice(0, 3) as Vec3,
                    points[p1].slice(0, 3) as Vec3,
                    points[p4].slice(0, 3) as Vec3
                );
                this._points.push(points[p1]);
                this._points.push(points[p3]);
                this._points.push(points[p4]);
                for (let i = 0; i < 3; i++) this._normals.push(normalPoint2);

                this._colors.push(colors[p1]);
                this._colors.push(colors[p2]);
                this._colors.push(colors[p3]);

                this._colors.push(colors[p1]);
                this._colors.push(colors[p3]);
                this._colors.push(colors[p4]);
            }
        }

        this._points = this._points.map((p) =>
            vec4(p[0] * radius, p[1] * radius, p[2] * radius, 1)
        );

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

export default Sphere;
