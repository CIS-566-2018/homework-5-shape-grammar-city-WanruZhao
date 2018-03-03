import {vec3, vec4} from 'gl-matrix';
import Drawable from './rendering/gl/Drawable';
import {gl} from './globals';

export default class Obj extends Drawable
{
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    colors: Float32Array;

    center: vec4;

    constructor(mesh: any, center: vec4) {
        super();
        
        this.indices = new Uint32Array(mesh.indices.length);
        this.positions = new Float32Array(mesh.vertices.length / 3 * 4);
        this.normals = new Float32Array(mesh.vertexNormals.length / 3 * 4);

        for(let i = 0; i < this.indices.length; i++) {
            this.indices[i] = mesh.indices[i];
        }

        for(let i = 0; i < this.positions.length / 4; i++) {
            this.positions[4 * i] = mesh.vertices[3 * i] + center[0];
            this.positions[4 * i + 1] = mesh.vertices[3 * i + 1] + center[1];
            this.positions[4 * i + 2] = mesh.vertices[3 * i + 2] + center[2];
            this.positions[4 * i + 3] = 1;
        }

        for(let i = 0; i < this.normals.length / 4; i++) {
            this.normals[4 * i] = mesh.vertexNormals[3 * i];
            this.normals[4 * i + 1] = mesh.vertexNormals[3 * i + 1];
            this.normals[4 * i + 2] = mesh.vertexNormals[3 * i + 2];
            this.normals[4 * i + 3] = 1;
        }

        

    }

    create() {

        this.generateIdx();
        this.generatePos();
        this.generateNor();

        this.count = this.indices.length;

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufIdx);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufNor);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.bufPos);
        gl.bufferData(gl.ARRAY_BUFFER, this.positions, gl.STATIC_DRAW);

        console.log('Created object');

    }

};


export class ObjInfo
{
    indices : Array<number>;
    normals : Array<vec4>;
    positions : Array<vec4>

    constructor(mesh: any) {

        this.indices = new Array<number>(mesh.indices.length);
        this.positions = new Array<vec4>(mesh.vertices.length / 3);
        this.normals = new Array<vec4>(mesh.vertexNormals.length / 3);

        for(let i = 0; i < this.indices.length; i++) {
            this.indices[i] = mesh.indices[i];
        }

        for(let i = 0; i < this.positions.length; i++) {
            this.positions[i] = vec4.fromValues(mesh.vertices[3 * i],
                                                mesh.vertices[3 * i + 1],
                                                mesh.vertices[3 * i + 2],
                                                1);
            
        }

        for(let i = 0; i < this.normals.length; i++) {
            this.normals[i] = vec4.fromValues(mesh.vertexNormals[3 * i],
                                              mesh.vertexNormals[3 * i + 1],
                                              mesh.vertexNormals[3 * i + 2],
                                              1);
        }
    }

};