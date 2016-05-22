import {Command, TextureGetter} from './interfaces';
import {Context} from './context';

/// The clear all pipeline element performs
/// a clearColor, clearDepth and clear operations
/// on the WebGL state.
export const ClearAll = (ctx: Context) => {
    ctx.gl.clearColor(1.0, 1.0, 1.0, 0.0);
    ctx.gl.clearDepth(1.0);
    ctx.gl.clear(ctx.gl.DEPTH_BUFFER_BIT | ctx.gl.COLOR_BUFFER_BIT);
};

/// Flip the y axis.
export const FlipY = (ctx: Context) => {
    ctx.flip_y = true;
};

/// Skip the node if the condition function returns true
export const SkipIf = (el: Command, test: (ctx: Context) => boolean) => {
    return (ctx: Context) => {
        if (!test(ctx)) {
            el.execute(ctx);
        }
    };
};

/// Change the filtering temporarily
/// of the passed object.
export class TmpLinearFiltering implements Command {
    constructor(
        private render_el: TextureGetter & Command
    ) {}

    execute(ctx: Context) {
        let texs = this.render_el.getTextures();
        for (let tex of texs) {
            ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, tex);
            ctx.gl.texParameteri(
                ctx.gl.TEXTURE_2D,
                ctx.gl.TEXTURE_MIN_FILTER,
                ctx.gl.LINEAR
            );
            ctx.gl.texParameteri(
                ctx.gl.TEXTURE_2D,
                ctx.gl.TEXTURE_MAG_FILTER,
                ctx.gl.LINEAR
            );
        }
        this.render_el.execute(ctx);
        for (let tex of texs) {
            ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, tex);
            ctx.gl.texParameteri(
                ctx.gl.TEXTURE_2D,
                ctx.gl.TEXTURE_MIN_FILTER,
                ctx.gl.NEAREST
            );
            ctx.gl.texParameteri(
                ctx.gl.TEXTURE_2D,
                ctx.gl.TEXTURE_MAG_FILTER,
                ctx.gl.NEAREST
            );
        }
    }
}

type CommandLambda = (ctx: Context) => void;

/// The pipeline class, this is where the execution
/// takes place. This is also the context owner.
export class CommandBuffer {

    private context: Context = undefined;
    private raw: Command[];

    constructor(
        raw: Array<Command | CommandLambda>
    ) {
        this.raw = raw.map(el => {
            if (typeof el == 'function') {
                // TODO: Remove 'as' in next version of TypeScript
                return {
                    execute: el as CommandLambda,
                };
            } else {
                // TODO: Remove 'as' in next version of TypeScript
                return el as Command;
            }
        });
    }

    execute(gl: WebGLRenderingContext) {
        this.reset_or_init(gl);
        for (let el of this.raw) {
            el.execute(this.context);
        }
    }

    private reset_or_init(gl: WebGLRenderingContext) {
        if (!this.context || this.context.gl !== gl) {
            this.context = new Context(gl);
        }
    }
}
