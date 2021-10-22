import Shape from "./shape";

class Empty extends Shape {
    setup(_: WebGLRenderingContext): void {}

    render(_: WebGLRenderingContext) {
        return [
            {
                method: -1,
                count: 0,
            },
        ];
    }
}

export default Empty;
