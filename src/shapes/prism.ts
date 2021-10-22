import { Vec4, Vec3, Vec2, RenderMethod, normal } from "../utils/graphics";
import { vec2, vec3, vec3ToVec4s } from "../utils/base";
import Shape from "./shape";

class Prism extends Shape {
    points: Vec3[] = [];

    _points: Vec4[] = [];
    _normals: Vec3[] = [];
    _colors: Vec3[] = [];

    colors = [
        vec3(0.0, 1.0, 1.0), // cyan
        vec3(1.0, 0.0, 0.0), // red
        vec3(1.0, 1.0, 0.0), // yellow
        vec3(0.0, 1.0, 0.0), // green
        vec3(0.0, 0.0, 1.0), // blue
        vec3(1.0, 0.0, 1.0), // magenta
        vec3(0, 1, 0.5), // teal
        vec3(0, 0.5, 1), // aqua
        vec3(1, 0.5, 0.5), // pink
        vec3(0.5, 0.5, 1), // light blue
    ];

    parts: { count: number; method: RenderMethod }[];

    constructor(
        points: Vec3[],
        normals: Vec3[],
        parts: { count: number; method: RenderMethod }[]
    ) {
        super(0, 0, 0);
        this.points = points;
        this._normals = normals;
        this.parts = parts;
    }

    static #dual(
        firstSidePoints: Vec2[],
        secondSidePoints: Vec2[],
        method: RenderMethod,
        length: number,
        scaleOrigin: number,
        wallsOnly = false
    ) {
        if (firstSidePoints.length !== secondSidePoints.length)
            throw new Error(
                "Prism: firstSidePoints and secondSidePoints must be the same length"
            );

        let points: Vec3[] = [];
        let normals: Vec3[] = [];
        let parts: { count: number; method: RenderMethod }[] = [];
        const firstSidePoints3D = firstSidePoints.map((v) =>
            vec3(...v, (scaleOrigin - 0.5) * length - length / 2)
        );
        const secondSidePoints3D = secondSidePoints.map((v) =>
            vec3(...v, (scaleOrigin - 0.5) * length + length / 2)
        );
        if (!wallsOnly) {
            points = [...firstSidePoints3D, ...secondSidePoints3D];
            for (let i = 0; i < firstSidePoints3D.length; i++)
                normals.push([0, 0, -1]);

            for (let i = 0; i < secondSidePoints3D.length; i++)
                normals.push([0, 0, 1]);

            parts = [
                { count: firstSidePoints.length, method },
                { count: secondSidePoints.length, method },
            ];
        }
        for (let i = 0; i < firstSidePoints.length - 1; i++) {
            const pointNormal = normal(
                firstSidePoints3D[i],
                secondSidePoints3D[i],
                firstSidePoints3D[i + 1]
            );

            points.push(firstSidePoints3D[i]);
            points.push(secondSidePoints3D[i]);
            points.push(secondSidePoints3D[i + 1]);
            points.push(firstSidePoints3D[i + 1]);

            for (let i = 0; i < 4; i++) normals.push(pointNormal);
            parts.push({ count: 4, method: 6 });
        }
        const pointNormal = normal(
            firstSidePoints3D[firstSidePoints.length - 1],
            secondSidePoints3D[firstSidePoints.length - 1],
            firstSidePoints3D[0]
        );

        points.push(firstSidePoints3D[firstSidePoints.length - 1]);
        points.push(secondSidePoints3D[firstSidePoints.length - 1]);
        points.push(secondSidePoints3D[0]);
        points.push(firstSidePoints3D[0]);

        for (let i = 0; i < 4; i++) normals.push(pointNormal);
        parts.push({ count: 4, method: 6 });
        return new Prism(points, normals, parts);
    }

    static triangles(
        points: Vec2[] = [],
        length = 1,
        scaleOrigin = 0.5,
        wallsOnly = false
    ) {
        return Prism.dualTriangles(
            points,
            points,
            length,
            scaleOrigin,
            wallsOnly
        );
    }

    static dualTriangles(
        firstSidePoints: Vec2[] = [],
        secondSidePoints: Vec2[] = [],
        length = 1,
        scaleOrigin = 0.5,
        wallsOnly = false
    ) {
        return Prism.#dual(
            firstSidePoints,
            secondSidePoints,
            RenderMethod.TRIANGLES,
            length,
            scaleOrigin,
            wallsOnly
        );
    }

    static strips(
        points: Vec2[] = [],
        length = 1,
        scaleOrigin = 0.5,
        wallsOnly = false
    ) {
        return Prism.dualStrips(points, points, length, scaleOrigin, wallsOnly);
    }

    static dualStrips(
        firstSidePoints: Vec2[] = [],
        secondSidePoints: Vec2[] = [],
        length = 1,
        scaleOrigin = 0.5,
        wallsOnly = false
    ) {
        return Prism.#dual(
            firstSidePoints,
            secondSidePoints,
            RenderMethod.STRIPS,
            length,
            scaleOrigin,
            wallsOnly
        );
    }

    /**
     *
     * @param points
     * @param length
     * @param scaleOrigin domain of [0, 1]
     * @returns
     */
    static fan(
        points: Vec2[] = [],
        length = 1,
        scaleOrigin = 0.5,
        wallsOnly = false
    ) {
        return Prism.dualFan(points, points, length, scaleOrigin, wallsOnly);
    }

    static dualFan(
        firstSidePoints: Vec2[] = [],
        secondSidePoints: Vec2[] = [],
        length = 1,
        scaleOrigin = 0.5,
        wallsOnly = false
    ) {
        return Prism.#dual(
            firstSidePoints,
            secondSidePoints,
            RenderMethod.FAN,
            length,
            scaleOrigin,
            wallsOnly
        );
    }

    static rectangular(
        length: number = 1,
        scaleOrigin: number = 0.5,
        wallsOnly = false
    ) {
        return Prism.fan(
            [
                vec2(-0.5, -0.5),
                vec2(-0.5, 0.5),
                vec2(0.5, 0.5),
                vec2(0.5, -0.5),
            ],
            length,
            scaleOrigin,
            wallsOnly
        );
    }

    static rightTriangular(
        length: number = 1,
        scaleOrigin: number = 0.5,
        wallsOnly = false
    ) {
        return Prism.fan(
            [
                vec2(-0.5, -0.5), // point
                vec2(-0.5, 0.5), // point
                vec2(0.5, -0.5), // point
            ],
            length,
            scaleOrigin,
            wallsOnly
        );
    }

    setup(gl: WebGLRenderingContext): void {
        this._points = this.points.map((v) => vec3ToVec4s(v));
        let i = 0;
        for (let part of this.parts) {
            for (let j = 0; j < part.count; j++)
                this._colors.push(this.colors[i % this.colors.length]);
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
        return this.parts;
    }
}

export default Prism;
