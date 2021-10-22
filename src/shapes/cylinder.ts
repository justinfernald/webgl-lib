import { Vec2 } from "../utils/graphics";
import { vec2 } from "../utils/base";
import Prism from "./prism";
import { TAU } from "../utils/math";

class Cylinder {
    static pointsGenerator(
        radius: number,
        sides: number,
        offset: Vec2 = [0, 0]
    ): Vec2[] {
        const points = [];
        let angleIncrement = TAU / sides;
        for (let angle = TAU; angle > 0; angle -= angleIncrement) {
            points.push(
                vec2(
                    Math.cos(angle) * radius + offset[0],
                    Math.sin(angle) * radius + offset[1]
                )
            );
        }
        return points;
    }

    static singleRadius(
        radius = 0.5,
        height = 1,
        sides = 20,
        {
            wallsOnly = false,
            offset = [0, 0],
        }: { wallsOnly?: boolean; offset?: Vec2 } = {}
    ) {
        return Prism.fan(
            Cylinder.pointsGenerator(radius, sides, offset),
            height,
            0.5,
            wallsOnly
        );
    }

    static dualRadius(
        bottomRadius = 0.5,
        topRadius = 0.2,
        height = 1,
        sides = 20,
        {
            wallsOnly = false,
            topOffset = [0, 0],
            bottomOffset = [0, 0],
        }: { wallsOnly?: boolean; topOffset?: Vec2; bottomOffset?: Vec2 } = {}
    ) {
        return Prism.dualFan(
            Cylinder.pointsGenerator(bottomRadius, sides, bottomOffset),
            Cylinder.pointsGenerator(topRadius, sides, topOffset),
            height,
            0.5,
            wallsOnly
        );
    }
}

export default Cylinder;
