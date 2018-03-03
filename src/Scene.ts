import ShapeParser, {pyramid, setPyrOff, highTower1, highTower2, house1, house2} from './ShapeParser';
import Drawable from './rendering/gl/Drawable';
import ShapeSet, { Shape, GeoType} from './Shape';
import Branch from "./Branch";
import {vec3, vec4, mat4} from 'gl-matrix';
import {ObjInfo} from './Object';
import fbm, { gaussian } from './Map';
import { win32 } from 'path';
import { Z_BLOCK } from 'zlib';

var base : ObjInfo;
var roof1 : ObjInfo;
var roof2 : ObjInfo;
var cylinder : ObjInfo;
var cap1 : ObjInfo;
var cap2 : ObjInfo;
var hunit1 : ObjInfo;
var GeoMap = new Map();

export function setBase(m : ObjInfo) {
    base = m;
    GeoMap.set("base", base);
}
export function setRoof1(m : ObjInfo) {
    roof1 = m;
    GeoMap.set("roof1", roof1);
}
export function setCylinder(c : ObjInfo) {
    cylinder = c;
    GeoMap.set("cbase", cylinder);
}
export function setCap1(c : ObjInfo) {
    cap1 = c;
    GeoMap.set("cap1", cap1);
}
export function setRoof2(r : ObjInfo) {
    roof2 = r;
    GeoMap.set("roof2", roof2);
}
export function setHouse1(h : ObjInfo) {
    hunit1 = h;
    GeoMap.set("hunit1", hunit1);
}



class Scene
{
    geo : Branch;
    iter : number;

    pos : Array<vec4>;
    idx : Array<number>;
    nor : Array<vec4>;
    col : Array<vec4>;

    width : number;
    height : number;

    constructor(i : number, w : number, h : number) {
        this.geo = new Branch();
        this.pos = new Array<vec4>();
        this.idx = new Array<number>();
        this.nor = new Array<vec4>();
        this.col = new Array<vec4>();
        this.iter = i;
        this.width = w;
        this.height = h;
    }

    create() {
        this.generateScene();
        this.geo.generateInfo(this.idx, this.pos, this.nor, this.col);
        this.geo.create();
    }

    destroy() {
        this.pos = new Array<vec4>();
        this.idx = new Array<number>();
        this.nor = new Array<vec4>();
        this.geo.destory();
    }

    generateScene() {

        let initialSet = this.initializeSet();
        
        // let initialSet = house2([0, 0, 0, 5, 8, 5], 10, 20.0);

        let finalSet = ShapeParser(initialSet, this.iter);

        
        
        for(let shape of finalSet.shapes) {

            let trans = vec4.fromValues(finalSet.location[0] + shape.location[0],
                                        finalSet.location[1] + shape.location[1],
                                        finalSet.location[2] + shape.location[2], 1.0);
            let m = mat4.create();
            mat4.fromScaling(m, shape.scale);

            let cur = this.pos.length;

            let ob = GeoMap.get(GeoType[shape.geo]);

            let color = vec4.create();

            if(GeoType[shape.geo] === "roof1") {
                color = vec4.fromValues(19. / 255., 121. / 255., 97. / 255., 1.0);
            } else {
                let dis = 1 - Math.sqrt(Math.pow(shape.location[0], 2.0) + Math.pow(shape.location[2], 2.0)) / Math.sqrt(30.0 * 30.0 * 100.0 * 2);
                dis *= (Math.random() / 2.0 + 1.0);
                color = vec4.fromValues(248. / 255. * dis, 196. / 255. * dis, 113. / 255. * dis, 1.0);
            }

            let rotationMat = mat4.create();
            mat4.fromYRotation(rotationMat, shape.orientation[1]);

            let finalM = mat4.create();
            mat4.multiply(finalM, m, rotationMat);

            for(let i = 0; i < ob.positions.length; i++) {
                let p = vec4.create();
                vec4.add(p, p, ob.positions[i]);
                vec4.transformMat4(p, p, finalM);
                vec4.add(p, p, trans);
                this.pos.push(p);
            }

            for(let i = 0; i < ob.normals.length; i++) {
                let n = vec4.create();
                vec4.add(n, n, ob.normals[i]);
                vec4.transformMat4(n, n, finalM);
                this.nor.push(n);
            }

            for(let i = 0; i < ob.indices.length; i++) {
                this.idx.push(cur + ob.indices[i]);
            }

            for(let i = 0; i < ob.positions.length; i++) {
                this.col.push(color);
            }
        }
        
    }

    initializeSet() : ShapeSet {
        let shapes = new ShapeSet();

        let step = 5.0;


        for(let i = - this.width / 2.0; i < this.width / 2.0; i++) {
            for(let j = - this.height / 2.0; j < this.height / 2.0; j++) {

                //inner city, block size 5 * 5
                if(i < 10 && i >= -10 && j < 10 && j >= -10) {

                    let blockSize = 6;
                    let coresize = 3;

                    //core buidlings
                    if(i < coresize && i >= -coresize && j < coresize && j >= -coresize) {
                        let height = 6, limit = 100;
                        
                        let dis = Math.sqrt(Math.pow(coresize - Math.abs(i), 2.0) +
                                            Math.pow(coresize - Math.abs(j), 2.0)) / coresize;
                        
                        limit *= (0.6 * (Math.random() - 0.5) + 1.0) * dis; 
                        height *= (dis + Math.random() * 2.0);

                        let s = house1([i * blockSize, 0, j * blockSize, 4, height, 4], 4, limit);
            
                        let angle = Math.random() * 2 * Math.PI;
                        for(let k of s.shapes) {
                            k.orientation = vec3.fromValues(0, angle, 0);
                            shapes.shapes.add(k);
                        }
                    } else {
                        // buildings and high tower
                        let idx = Math.random(); 

                        let height = 5;
                        let limit = 60;

                        
                        let dis = Math.sqrt(Math.pow(10 - Math.abs(i), 2.0) +
                                            Math.pow(10 - Math.abs(j), 2.0)) / 10;

                        limit *= (0.6 * (Math.random() - 0.5) + 1.0) * dis; 
                        height *= (1.0 + Math.random() * dis);

                        if(idx > 0.03) //house1
                        {
                            let s = house1([i * blockSize, 0, j * blockSize, 5, height, 5], 5, limit / 2.0);
                            let angle = Math.random() * 2 * Math.PI;
                            for(let k of s.shapes) {
                                k.orientation = vec3.fromValues(0, angle, 0);
                                shapes.shapes.add(k);
                            }
                        }
                        else if(idx > 0.015) //high tower1
                        {
                            let s = highTower1([i * blockSize, 0, j * blockSize, 5, height * 2.5, 5], 5, limit * 5.0);
                            for(let k of s.shapes) {
                                shapes.shapes.add(k);
                            }
                        }
                        else //high tower 2
                        {
                            let s = highTower2([i * blockSize, 0, j * blockSize, 5, height * 2.5, 5], 5, limit * 5.0);
                            let angle = Math.random() * 2 * Math.PI;
                            for(let k of s.shapes) {
                                k.orientation = vec3.fromValues(0, angle, 0);
                                shapes.shapes.add(k);
                            }
                        }
                    }

                } 
                else if (i < 13 && i >= -13 && j < 13 && j >= -13){
                    let blockSize = 10.0;

                    let height = 4, limit = 4.0;
                    height *= (Math.random() + 0.5);


                    let prob = Math.random();
                    if(prob < 0.1) {
                        let s = house1([i * blockSize, 0, j * blockSize, 4, height, 4], 10.0, limit);
                        let angle = Math.random() * 2 * Math.PI;
                        for(let k of s.shapes) {
                            k.orientation = vec3.fromValues(0, angle, 0);
                            shapes.shapes.add(k);
                        }
                    } else if (prob < 0.2){
                        let s = house2([i * blockSize, 0, j * blockSize, 4, height, 4], 10.0, limit);
                        let angle = Math.random() * 2 * Math.PI;
                        for(let k of s.shapes) {
                            k.orientation = vec3.fromValues(0, angle, 0);
                            shapes.shapes.add(k);
                        }
                    }
                } else {
                    let prob = Math.random();

                    if(prob < 0.1) {
                        let s = pyramid([i * 15, 0, j * 15], 20 * (1 + Math.random()), 10);
                        for(let k of s.shapes) {
                            shapes.shapes.add(k);
                        }
                    }
                }


            }
        }

        return shapes;
    }
};

export default Scene;


//map not using noise map