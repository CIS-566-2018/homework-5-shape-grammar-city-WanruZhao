import {vec3, vec4, mat4} from 'gl-matrix';

export enum GeoType  {
    base = 0,
    roof1,
    roof2,
    cbase,
    cap1,
    hunit1, 
}


export class Shape
{
    //location, scale, orientation are w.r.t local coordinate
    symbol : string;
    geo : GeoType;
    location : vec3;
    scale : vec3;
    orientation: vec3;
    terminal : boolean;

    constructor(s : string, g : GeoType) {
        this.symbol = s;
        this.geo = g;
        this.location = vec3.create();
        this.scale = vec3.fromValues(1, 1, 1);
        this.orientation = vec3.create();
        this.terminal = false;
    }

};

// one block
export class ShapeSet
{
    //location is w.r.t world coord
    shapes : Set<Shape>;
    location : vec3;
    bounding : number[];
    
    constructor() {
        this.shapes = new Set<Shape>();
        this.location = vec3.create();
        this.bounding = [10, 10];
    }
};


export default ShapeSet;

