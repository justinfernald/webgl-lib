import { Vec4, Vec3, RenderMethod, Vec2, normal } from "../utils/graphics";
import { vec2, vec3, vec3ToVec4s } from "../utils/base";
import Shape from "./shape";

class Plane extends Shape {
    points: Vec3[] = [];

    _points: Vec4[] = [];
    _normals: Vec3[] = [];
    _colors: Vec3[] = [];

    color = [0.0, 1.0, 0.0] as Vec3; // green

    method: RenderMethod;

    constructor(points: Vec3[] = [], method: RenderMethod = RenderMethod.FAN) {
        super(0, 0, 0);
        this.points = points;
        const normalPoint = normal(points[0], points[1], points[2]);
        for (let i = 0; i < points.length; i++) this._normals.push(normalPoint);

        this.method = method;
    }

    static trianglesMesh(points: Vec3[] = []) {
        return new Plane(points, RenderMethod.TRIANGLES);
    }

    static triangles(points: Vec2[] = []) {
        return Plane.trianglesMesh(points.map((points) => vec3(...points, 0)));
    }

    static stripsMesh(points: Vec3[] = []) {
        return new Plane(points, RenderMethod.STRIPS);
    }

    static strips(points: Vec2[] = []) {
        return Plane.stripsMesh(points.map((points) => vec3(...points, 0)));
    }

    static fanMesh(points: Vec3[] = []) {
        return new Plane(points, RenderMethod.FAN);
    }

    static fan(points: Vec2[] = []) {
        return Plane.fanMesh(points.map((points) => vec3(...points, 0)));
    }

    static strip(point1: Vec2, point2: Vec2, length: number) {
        return Plane.fanMesh([
            [...point1, 0],
            [...point2, 0],
            [...point2, length],
            [...point1, length],
        ]);
    }

    static square(x: number = 0, y: number = 0, z: number = 0) {
        return Plane.fan([
            vec2(-0.5, -0.5),
            vec2(-0.5, 0.5),
            vec2(0.5, 0.5),
            vec2(0.5, -0.5),
        ]).setPosition(x, y, z);
    }

    static rightTriangle(x: number = 0, y: number = 0, z: number = 0) {
        return Plane.fan([
            vec2(-0.5, -0.5),
            vec2(-0.5, 0.5),
            vec2(0.5, -0.5),
        ]).setPosition(x, y, z);
    }

    setColor(color: Vec3) {
        this.color = color;
        return this;
    }

    setup(gl: WebGLRenderingContext): void {
        this._points = this.points.map((v) => vec3ToVec4s(v));
        if (this._colors.length !== this._points.length)
            this._colors = this.points.map(() => this.color);

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
                method: this.method,
                count: this._points.length,
            },
        ];
    }
}

export default Plane;
