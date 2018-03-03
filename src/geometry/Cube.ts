import {vec3, vec4} from 'gl-matrix';
import Drawable from '../rendering/gl/Drawable';
import {gl} from '../globals';
import { F_OK } from 'constants';

class Cube extends Drawable {
    indices: Uint32Array;
    positions: Float32Array;
    normals: Float32Array;
    center: vec4;

    constructor(center: vec3) {
        super();
        this.center = vec4.fromValues(center[0], center[1], center[2], 1);
    }

    create() {
        
        this.positions = new Float32Array(24 * 4);
        this.normals = new Float32Array(24 * 4);
        this.indices = new Uint32Array(12 * 3);


        var i, j, k;
        
        let pos = new Float32Array([1, 1, 1, 1,
                                        -1, 1, 1, 1,
                                        -1, -1, 1, 1,
                                        1, -1, 1, 1,
                                        1, 1, -1, 1,
                                        -1, 1, -1, 1,
                                        -1, -1, -1, 1,
                                        1, -1, -1, 1]);


        let map = new Uint32Array([0, 1, 2, 3, 4, 0, 3, 7, 5, 4, 7, 6,
                                   1, 5, 6, 2, 4, 5, 1, 0, 3, 2, 6, 7]);

        // Add vertex position data
        for(i = 0; i < 24; ++i) {
            for(j = 0; j < 4; ++j) {
                this.positions[4 * i + j] = pos[map[i] * 4 + j];
            }
        }


        let nor = new Float32Array([0, 0, 1, 0, 1, 0, 0, 0, 0, 0, -1, 0,
                                    -1, 0, 0, 0, 0, 1, 0, 0, 0, -1, 0, 0]);

        // Add vertex normals data
        for(i = 0; i < 6; ++i) {
            for(j = 0; j < 4; ++j) {
                for(k = 0; k < 4; ++k) {
                    this.normals[i * 16 + 4 * j + k] = nor[4 * i + k];
                }
            }
        }

        // Add indices data
        for(i = 0; i < 6; ++i) {
            for(j = 0; j < 2; ++j) {
                this.indices[i * 6 + j * 3] = 4 * i;
                this.indices[i * 6 + j * 3 + 1] = 4 * i + 1 + j;
                this.indices[i * 6 + j * 3 + 2] = 4 * i + 2 + j;
            }
        }
        
        
        // console.log(this.positions);
        // console.log(this.normals);
        // console.log(this.indices);




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

        console.log('Created cube');
    }
};

export default Cube;

