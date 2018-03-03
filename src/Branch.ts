import {vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';
import { F_OK } from 'constants';

class Branch extends Drawable
{
    idx : Array<number>;
    pos : Array<vec4>;
    nor : Array<vec4>;
    col : Array<vec4>;
 
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    colors: Float32Array;

    constructor(){
        super();
        this.idx = new Array<number>();
        this.pos = new Array<vec4>();
        this.nor = new Array<vec4>();
        this.col = new Array<vec4>();
    }

    create()
    {
        this.indices = new Uint32Array(this.idx.length);
        this.positions = new Float32Array(this.pos.length * 4);
        this.normals = new Float32Array(this.nor.length * 4);
        this.colors = new Float32Array(this.col.length * 4);

        for(let i = 0; i < this.idx.length; i++) {
            this.indices[i] = this.idx[i];
        }

        for(let i = 0; i < this.pos.length; i++) {
            for(let j = 0; j < 4; j++) {
                this.positions[4 * i + j] = this.pos[i][j];
            }
        }

        for(let i = 0; i < this.nor.length; i++) {
            for(let j = 0; j < 4; j++) {
                this.normals[4 * i + j] = this.nor[i][j];
            }
        }

        for(let i = 0; i < this.col.length; i++) {
            for(let j = 0; j < 4; j++) {
                this.colors[4 * i + j] = this.col[i][j];
            }
        }
        
        this.generateIdx();
        this.generatePos();
        this.generateNor();
        this.generateCol();

        this.count = this.indices.length;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufCol);
        gl.bufferData(gl.ARRAY_BUFFER, this.colors, gl.STATIC_DRAW);
    }

    generateInfo(id: Array<number>, p: Array<vec4>, n: Array<vec4>, c: Array<vec4>) {
        for(let i = 0; i < id.length; i++) {
            this.idx.push(0 + id[i]);
        }
        for(let i = 0; i < p.length; i++) {
            this.pos.push(vec4.create());
            vec4.add(this.pos[i], this.pos[i], p[i]);
        }
        for(let i = 0; i < n.length; i++) {
            this.nor.push(vec4.create());
            vec4.add(this.nor[i], this.nor[i], n[i]);
        }
        for(let i = 0; i < c.length; i++) {
            this.col.push(vec4.create());
            vec4.add(this.col[i], this.col[i], c[i]);
        }

    }
}

export default Branch;