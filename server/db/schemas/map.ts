import {Schema, model, Document, Types} from 'mongoose';


// A layer where all tiles ids share the same
// chipset.
let mongooseLayerSchema = new Schema({
    tile_ids: Buffer,
    chipset: Schema.Types.ObjectId,
    depth: Number,
});

let mongooseMapSchema = new Schema({
    name: { type: String, maxlength: [
        30,
        'Name (`{VALUE}`) exceeds the ' +
        'maximum allowed length ({MAXLENGTH}).'
    ]},
    revisions: [{
        author: Schema.Types.ObjectId,
        comment: { type: String, maxlength: [
            60,
            'Comment (`{VALUE}`) exceeds the ' +
            'maximum allowed length ({MAXLENGTH}).'
        ] },
        layers: [mongooseLayerSchema],
        date: { type: Date, default: Date.now },
    }]
});

export interface Layer {
    tile_ids: Buffer;
    chipset: Types.ObjectId;
    depth: number;
}

export interface Revision {
    author: Types.ObjectId;
    comment: string;
    // Specifies which ones are the 'real' layers
    // having a specific depth.
    layers: Array<Layer>;
    date?: Date;
}

export interface MapProperties {
    name: string;
    revisions: Array<Revision>;
}

export interface MapJsmap {
    name: string;
    date: Date;
    layers: Array<Array<{
        tiles_ids: string;
        chipset: Types.ObjectId;
    }>>;
    revisions: Array<{
        author: Types.ObjectId;
        date: Date;
        comment: string;
    }>;
}

export interface MapSchema extends MapProperties {

    toJsmap(): MapJsmap;
    getRevision(id: number): Revision;
    getLatest(): Revision;
    commitRevision(rev: Revision, cb: (err: any) => void): void;
}

// TODO: To convert between a Buffer and an Uint16Array:
//
//  Super fast way:
//
//      const arr = new Uint16Array(2);
//      arr[0] = 5000;
//      arr[1] = 4000;
//
//      const buf1 = new Buffer(arr); // copies the buffer
//      const buf2 = new Buffer(arr.buffer); // shares the memory with arr;
//
//      console.log(buf1);
//      // Prints: <Buffer 88 a0>, copied buffer has only two elements
//      console.log(buf2);
//      // Prints: <Buffer 88 13 a0 0f>
//
// To have a view:
//
//      const buf = new Buffer(arr.buffer).slice(0, 1);
//
// From buffer:
//
//      const g = new Uint16Array(buf.byteLength / 2);
//      for (let i = 0; i < buf.byteLength / 2; ++i) {
//          // Is LE platform dependent?
//          g[i] = buf.readUInt16LE(i * 2);
//      }
//
// We should probably stick with Buffer within node.
// And we can encode to string with:
//
//      buf.toString('base64')
//
mongooseMapSchema.method({

    toJsmap: function (): MapJsmap {

        let self: MapSchema = this;
        let res: MapJsmap =  _.pick<any, MapSchema>(self,
            ['name', 'created_on']
        );

        let layers_base64 = [];
        let partial_layers_base64 = [];
        let current_depth: number = 0;

        for (let layer of self.revisions[self.revisions.length - 1].layers) {
            if (current_depth < layer.depth) {
                layers_base64.push(partial_layers_base64);
                partial_layers_base64 = [];
                current_depth = layer.depth;
            }
            let semi_serialized_layer = {
                tiles_ids: layer.tile_ids.toString('base64'),
                chipset: layer.chipset
            };
            partial_layers_base64.push(semi_serialized_layer);
        }

        res.layers = layers_base64;
        res.revisions = self.revisions.map(r => {
            return {
                author: r.author,
                date: r.date,
                comment: r.comment,
            };
        });

        return res;
    },

    getLatest: function (): any {
        let self: MapSchema = this;
        let id = self.revisions.length - 1;
        return _.pick(self.revisions[id], ['author', 'content', 'comment', 'date']);
    },

    getRevision: function (id: number): any {
        let self: MapSchema = this;
        return _.pick(self.revisions[id], ['author', 'content', 'comment', 'date']);
    },

    commitRevision: function (rev: Revision, cb: (err: any) => void): void {
        let self: MapDocument = this;
        // Make sure the order is correct.
        rev.layers.sort((a, b) => a.depth - b.depth);
        // Push the new revision.
        self.revisions.push(rev);
        self.save(cb);
    }
});

mongooseMapSchema.path('revisions').validate(function (revisions: Array<Revision>) {
    return revisions.length;
}, 'Revisions cannot be empty');

mongooseMapSchema.path('revisions').validate(function (revisions: Array<Revision>, cb) {
    if (this.isNew || this.isModified('revisions')) {
        for (let rev of revisions) {
            if (!rev.comment || !rev.comment.length) {
                cb(false);
                return;
            }
        }
    }
    cb(true);
}, 'Each revision must contains a non-empty comment');

mongooseMapSchema.path('name').validate(function (name) {
    return name.length;
}, 'Name cannot be empty');

mongooseMapSchema.path('name').validate(function (name, cb) {
    if (this.isNew || this.isModified('name')) {
        MapModel.find({ name: name }).exec((err, maps) => {
            cb(!err && maps.length === 0);
        });
    } else {
        cb(true);
    }
}, 'Name already exists');

/// Document interface for more type-checking
export interface MapDocument extends Document, MapSchema {}

/// Model<T> exported for convenience.
export var MapModel = model<MapDocument>('MapModel', mongooseMapSchema);