import {vec3, vec4, mat4} from 'gl-matrix';
import ShapeSet, { Shape, GeoType} from './Shape';


var iter = 0;
var pyroff = -1.0;

export function setPyrOff(t : number) {
    pyroff = t;
}

var heightT = 0.0;
var heightL = 0.0;
export function resetHeightT() {
    heightT = 0.0;
}


class Rule
{
    oper : string;
    suc : string[];
    para : any[];
    terminal : boolean[];
    prob : number;
    axis : number;
    constructor(oper : string, suc : string[], para : any[], axis: number, term : boolean[], prob : number) {
        this.oper = oper;
        this.suc = suc;
        this.para = para;
        this.terminal = term;
        this.prob = prob;
        this.axis = axis;
    }
};


//-------------------------------------------------------rule list------------------------------------------------------------

var RuleList : {
    [key : string] : Rule[]
};
RuleList = {};
// rule for pyramid
RuleList["pb"] = [
    new Rule("tdo", ["pb", "pb"],
    [0, 0.5, 0, 0.0,
    pyroff * Math.pow(0.5, iter), 0.5, pyroff * Math.pow(0.5, iter), 0.0],
     1, [false], 1.0), //up
];


//rule for high tower 1
RuleList["pc"] = [
    new Rule("tdo", ["pc", "pc"], [0, 0.5, 0, 0, 0, 0.5, 0, 0], 1, [true, true], 0.7),
    new Rule("tds", ["pc", "pcap"], [1, 0.5, 1, 0, 1.2, 0.5, 1.2, 0], 1, [true, true], 0.3),
];
RuleList["tr1"] = [
    new Rule("tds", ["pc", "pc", "pcap", "tr1"], 
             [1, 1, 1, 0, 1, 1, 1, 0, 1.2, 0.5, 1.2, 0, 1, 1, 1, 0],
              1, [false, false, true, false], 1.0),
];

//rule for high tower 2
RuleList["phb"] = [
    new Rule("tr", ["phb"], [0.25, 0.25, 0.5, 1, 0.375, 0.25], -1, [true], 0.5),
    new Rule("tr", ["phb"], [0.25, 0.25, 0.5, -0.25, 0.375, 0.25], -1, [true], 1.5),
];
RuleList["ph"] = [
    new Rule("rpl", ["phb"], [], -1, [false], 0.4),
    new Rule("nan", [], [], -1, [false], 0.6),
]
RuleList["tr2"] = [
    new Rule("tds", ["phb", "ph", "ph", "tr2"], 
             [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
              1, [false, false, true, false], 1.0),
]


//rule for house
RuleList["hb"] = [
    new Rule("tr", ["hb"], [0.3, 0.2, 0.3, 0.35, 0, 1], -1, [true], 0.2),
    new Rule("rpl", ["hh"], [], -1, [false], 0.8),
];
RuleList["hh"] = [
    new Rule("rpl", ["hb"], [], -1, [false], 0.3),
    new Rule("nan", [], [], -1, [false], 0.7),
]
RuleList["hr1"] = [
    new Rule("tds", ["hb", "hh", "hr1"], 
             [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
              1, [false, false, false], 0.5),
    new Rule("tds", ["hh", "hb", "hr1"], 
             [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
              1, [false, false, false], 0.5),
];



//rule for house 2
RuleList["hb2"] = [
    new Rule("tds", ["hb2", "hh2"], 
            [ 1, 1, 1, 0, 1, 1, 1, 0],
            1, [true, true], 0.5),
    new Rule("tds", ["hh2", "hb2"], 
            [ 1, 1, 1, 0, 1, 1, 1, 0],
            1, [true, true], 0.5),
];
RuleList["hh2"] = [
    new Rule("tds", ["hb2", "hh2"], 
            [ 1, 1, 1, 0, 1, 1, 1, 0],
            1, [true, true], 0.5),
    new Rule("tds", ["hh2", "hb2"], 
            [ 1, 1, 1, 0, 1, 1, 1, 0],
            1, [true, true], 0.5),
]




//------------------------------------------------update rule according to current status--------------------------------------

function updateRule() {
    RuleList["pb"] = [new Rule("tdo", ["pb", "pb"],
        [0, 0.5, 0, 0.0,
        pyroff * Math.pow(0.5, iter), 0.5, pyroff * Math.pow(0.5, iter), 0.0],
         1, [false, false], 1.0)];

    if(heightT > heightL) {
        RuleList["tr1"] = [
            new Rule("tm",[], [], -1, [true], 1.0),
        ];
    } else {
        RuleList["tr1"] = [
            new Rule("tds", ["pc", "pc", "pcap", "tr1"], 
                     [1, 1, 1, 0, 1, 1, 1, 0, 1.2, 0.5, 1.2, 0, 1, 1, 1, 0],
                      1, [false, false, true, false], 1.0),
        ];
    }

    if(heightT > heightL) {
        RuleList["tr2"] = [
            new Rule("tm",[], [], -1, [true], 1.0),
        ];
    } else {
        RuleList["tr2"] = [
            new Rule("tds", ["phb", "ph", "ph", "tr2"], 
                     [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
                      1, [false, false, true, false], 1.0),
        ]
    }

    if(heightT > 30.0) {
        RuleList["hr1"] = [
            new Rule("tm", [], [], -1, [true], 1.0),
        ];
    } else {
        RuleList["hr1"] = [
            new Rule("tds", ["hb", "hh", "hr1"], 
                     [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
                      1, [false, false, false], 0.5),
            new Rule("tds", ["hh", "hb", "hr1"], 
                     [ 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0],
                      1, [false, false, false], 0.5),
        ]
    }
}


//----------------------------------------------------initial building functions----------------------------------------------------

export function pyramid(initialPara : number[], bounding: number, divi:  number) : ShapeSet {
    let shapes = new ShapeSet();
    shapes.bounding = [bounding, bounding];

    let s1 = new Shape("pb", GeoType.base);
    let offset = bounding / divi;
    s1.scale = vec3.fromValues(bounding, bounding / divi, bounding);
    s1.location = vec3.fromValues(initialPara[0] + offset / 2,
                                  initialPara[1] ,
                                  initialPara[2] + offset / 2);
    s1.orientation = vec3.create();
    s1.terminal = false;
    shapes.shapes.add(s1);

    let curScale = vec3.create();
    vec3.add(curScale, curScale, s1.scale);
    let curPos = vec3.create();
    vec3.add(curPos, curPos, s1.location);

    for(let i = 1; i < divi; i++) {
        let tmp = new Shape("pb", GeoType.base);
        tmp.scale = vec3.fromValues(curScale[0] - offset, curScale[1], curScale[2] - offset);
        tmp.location = vec3.fromValues(curPos[0] + offset / 2, curPos[1] + curScale[1], curPos[2] + offset / 2);
        tmp.orientation = vec3.create();
        tmp.terminal = false;
        shapes.shapes.add(tmp);

        vec3.add(curPos, vec3.create(), tmp.location);
        vec3.add(curScale, vec3.create(), tmp.scale);
    }

    return shapes;
}


export function highTower1(initialPara : number[], bounding : number, height : number) : ShapeSet{
    let shapes = new ShapeSet();
    shapes.bounding = [bounding, bounding];

    heightT = 0.0;
    heightL = height;

    let s1 = new Shape("pc", GeoType.cbase);
    s1.location = vec3.fromValues(initialPara[0], initialPara[1], initialPara[2]);
    s1.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
    s1.orientation = vec3.create();
    s1.terminal = false;
    shapes.shapes.add(s1);

    let s2 = new Shape("pc", GeoType.cbase);
    s2.location = vec3.fromValues(s1.location[0], s1.location[1] + s1.scale[1], s1.location[2]);
    s2.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
    s2.orientation = vec3.create();
    s2.terminal = false;
    shapes.shapes.add(s2);

    let s3 = new Shape("pcap", GeoType.cap1);
    s3.scale = vec3.fromValues(initialPara[3] * 1.2, initialPara[3] / 2.0, initialPara[5] * 1.2);
    s3.location = vec3.fromValues(s2.location[0] + s2.scale[0] / 2.0 - s3.scale[0] / 2.0,
                                  s2.location[1] + s2.scale[1],
                                  s2.location[2] + s2.scale[0] / 2.0 - s3.scale[0] / 2.0);
    s3.orientation = vec3.create();
    s3.terminal = true;
    shapes.shapes.add(s3);

    let s4 = new Shape("tr1", GeoType.roof1);
    s4.location = vec3.fromValues(s1.location[0] , s3.location[1] + s3.scale[1], s1.location[2]);
    s4.scale = vec3.fromValues(initialPara[3], initialPara[3], initialPara[3]);
    s4.orientation = vec3.create();
    s4.terminal = false;
    shapes.shapes.add(s4);

    heightT = s4.location[1];

    return shapes;
}


export function highTower2(initialPara : number[], bounding : number, height :number) : ShapeSet {
    let shapes = new ShapeSet();
    shapes.bounding = [bounding, bounding];

    heightT = 0.0;
    heightL = height;

    let s1 = new Shape("phb", GeoType.base);
    s1.location = vec3.fromValues(initialPara[0], initialPara[1], initialPara[2]);
    s1.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
    s1.orientation = vec3.create();
    s1.terminal = false;
    shapes.shapes.add(s1);


    let s2 = new Shape("ph", GeoType.hunit1);
    s2.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
    s2.location = vec3.fromValues(s1.location[0] + s1.scale[0] / 2.0 - s2.scale[0] / 2.0,
                                  s1.location[1] + s1.scale[1],
                                  s1.location[2] + s1.scale[0] / 2.0 - s2.scale[0] / 2.0);
    s2.orientation = vec3.create();
    s2.terminal = false;
    shapes.shapes.add(s2);

    let s3 = new Shape("tr2", GeoType.roof1);
    s3.location = vec3.fromValues(s1.location[0] , s2.location[1] + s2.scale[1], s1.location[2]);
    s3.scale = vec3.fromValues(initialPara[3], initialPara[3], initialPara[3]);
    s3.orientation = vec3.create();
    s3.terminal = false;
    shapes.shapes.add(s3);

    heightT = s3.location[1];


    return shapes;
}


export function house1(initialPara : number[], bounding : number, height : number) : ShapeSet {
    let shapes = new ShapeSet();

    heightT = 0.0;
    heightL = height;
    
    shapes.bounding = [bounding, bounding];

    let numW = Math.floor(bounding / initialPara[3]);

    let curPos = vec3.fromValues(initialPara[0], initialPara[1], initialPara[2]);
    let name = ["hb", "hh"];

    for(let i = 0; i < numW; i++) {
        let t = new Shape(name[i % 2], GeoSymbolMap.get(name[i % 2]));
        t.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
        t.location = vec3.fromValues(curPos[0] + initialPara[3], curPos[1], curPos[2]);
        t.orientation = vec3.create();
        t.terminal = false;
        shapes.shapes.add(t);

        let r = new Shape("hr1", GeoType.roof2);
        r.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
        r.location = vec3.fromValues(t.location[0], t.location[1] + t.scale[1], t.location[2]);
        r.orientation = vec3.create();
        r.terminal = false;
        shapes.shapes.add(r);

        curPos = vec3.fromValues(t.location[0], t.location[1], t.location[2]);

        heightT = Math.max(heightT, r.location[1]);
    }

    return shapes;
}


export function house2(initialPara : number[], bounding : number, height : number) : ShapeSet {
    let shapes = new ShapeSet();

    shapes.bounding = [bounding, bounding];

    heightT = 0.0;
    heightL = height;

    let s1 = new Shape("hb2", GeoType.base);
    s1.location = vec3.fromValues(initialPara[0], initialPara[1], initialPara[2]);
    s1.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
    s1.orientation = vec3.create();
    s1.terminal = false;
    shapes.shapes.add(s1);


    let s2 = new Shape("hh2", GeoType.hunit1);
    s2.scale = vec3.fromValues(initialPara[3], initialPara[4], initialPara[5]);
    s2.location = vec3.fromValues(s1.location[0] + s1.scale[0],
                                  s1.location[1] ,
                                  s1.location[2] );
    s2.orientation = vec3.create();
    s2.terminal = false;
    shapes.shapes.add(s2);


    return shapes;
}


//------------------------------------------------------Geo symbol map------------------------------------------------------------


var GeoSymbolMap = new Map<string, GeoType>();
GeoSymbolMap.set("b", GeoType.base);
GeoSymbolMap.set("pb", GeoType.base);
GeoSymbolMap.set("r1", GeoType.roof1);
GeoSymbolMap.set("pc", GeoType.cbase);
GeoSymbolMap.set("pcap", GeoType.cap1);
GeoSymbolMap.set("tr1", GeoType.roof1);
GeoSymbolMap.set("phb", GeoType.base);
GeoSymbolMap.set("ph", GeoType.hunit1);
GeoSymbolMap.set("tr2", GeoType.roof1);
GeoSymbolMap.set("hb", GeoType.base);
GeoSymbolMap.set("hh", GeoType.hunit1);
GeoSymbolMap.set("hr1", GeoType.roof2);
GeoSymbolMap.set("hb2", GeoType.base);
GeoSymbolMap.set("hh2", GeoType.hunit1);


//-----------------------------------------------------------shape parser----------------------------------------------------------

function ShapeParser (shapes: ShapeSet, iteration : number) : ShapeSet
{
    let origin = new ShapeSet();
    for(let i = 0; i < iteration; i++) {
        iter = i;
        updateRule();
        heightT = 0;
        let tmp = new ShapeSet();
        for(let shape of shapes.shapes) {
            if(shape.terminal === false) {
                let newShape = applyRule(shape); 
                if(newShape === null) {
                    return shapes;
                } 
                for(let k = 0; k < newShape[0].length; k++) {
                    heightT = Math.max(heightT, newShape[1][k].location[1]);
                    origin.shapes.add(newShape[0][k]);
                }
                for(let k = 0; k < newShape[1].length; k++) {
                    heightT = Math.max(heightT, newShape[1][k].location[1]);
                    tmp.shapes.add(newShape[1][k]);
                }
            } else {
                origin.shapes.add(shape);
            }
        }
        shapes = tmp;
    }
    for(let s of origin.shapes) {
        shapes.shapes.add(s);
    }
    
    return shapes;
}


function applyRule(shape : Shape) : [Shape[], Shape[]] {
    let next : Rule = pickRule(shape.symbol);
    let shapes : Shape[] = new Array<Shape>();
    let origins : Shape[] = new Array<Shape>();

    if(next === null) return null;
    
    if(next.oper === "^") {
        origins.push(shape);
        let n = up(shape, next.suc[0], next.para, next.terminal[0]);
        shapes.push(n);
    } else if(next.oper === "tr") {
        origins.push(shape);
        let n = trans(shape, next.suc[0], next.para, next.terminal[0]);
        shapes.push(n);
    } else if(next.oper === "tdo") {
        let n = subd("o", shape, next.suc, next.para, 1, next.terminal);
        for(let i = 0; i < n.length; i++) {
            shapes.push(n[i]);
        }
    } else if(next.oper === "rp"){
        let pp = next.para.slice(1, next.para.length);
        let n = repeat(shape, next.para[0], pp, 0);
        for(let i = 0; i < n.length; i++) {
            shapes.push(n[i]);
        }
    } else if(next.oper === "tds") {
        let n = subd("s", shape, next.suc, next.para, 1, next.terminal);
        for(let i = 0; i < n.length; i++) {
            shapes.push(n[i]);
        }
    } else if(next.oper === "tm") {
        let n = terminate(shape);
        shapes.push(n);
    } else if(next.oper === "rpl") {
        let n = replace(shape, next.suc[0]);
        shapes.push(n);
    } else if(next.oper === "nan") {
        shapes.push(shape);
    }

    return [origins, shapes];
}

function pickRule(s:string) : Rule {
    let candidates : Rule[] = RuleList[s];
    if(candidates === undefined) {
        return null;
    }
    let r : Rule;
    let seed = Math.random();
    let cur = 0.0;
    for(let i = 0; i < candidates.length; i++) {
        if(seed > cur && seed <= cur + candidates[i].prob) {
            r = candidates[i];
        }
        cur += candidates[i].prob;
    }
    return r;
}


//---------------------------------------------------operation functions-----------------------------------------------------------


//^
function up(parent : Shape, s : string, p : number[], t : boolean) : Shape {

    let scl = vec3.fromValues(parent.scale[0] * p[0], parent.scale[1] * p[1], parent.scale[2] * p[2]);
    let pos = vec3.fromValues(parent.location[0] + parent.scale[0] / 2.0 - scl[0] / 2.0,
                              parent.location[1] +  parent.scale[1],
                              parent.location[2]+ parent.scale[2] / 2.0 - scl[2] / 2.0);

    let n = new Shape(s, GeoSymbolMap.get(s));
    n.location = pos;
    n.scale = scl;
    n.orientation = parent.orientation;
    n.terminal = t;
    return n;
}

//tr
function trans(parent : Shape, s : string, p: number[], t : boolean) : Shape {
    
    let scl = vec3.fromValues(parent.scale[0] * p[0],
                              parent.scale[1] * p[1],
                              parent.scale[2] * p[2]);

    let pos = vec3.fromValues(parent.location[0] + p[3] * parent.scale[0], 
                              parent.location[1] + p[4] * parent.scale[1], 
                              parent.location[2] + p[5] * parent.scale[2]);

    let off = vec3.create();
    vec3.sub(off, pos, parent.location);

    let n = new Shape(s, GeoSymbolMap.get(s));
    n.location = pos;
    n.scale = scl;
    n.orientation = parent.orientation;
    n.terminal = t;

    //need to deal with bounding
    
    return n;
}


//td
function subd(mode: string, parent : Shape, s : string[], scl: number[], id: number, t : boolean[]) : Shape[] {
    let number = s.length;
    let shapes = new Array<Shape>();

    if(mode === "s") {
        let curPos = vec3.fromValues(parent.location[0],
            parent.location[1],
            parent.location[2]);
    
        for(let i = 0; i < number; i++) {
            let n = new Shape(s[i], GeoSymbolMap.get(s[i]));
    
            let scale = vec3.fromValues(parent.scale[0] ,
                        parent.scale[1],
                        parent.scale[2]);
            for(let j = 0; j < 3; j++) {
                scale[j] *= scl[4 * i + j];
            }
            n.location = vec3.fromValues(curPos[0] + parent.scale[0] / 2 - scale[0] / 2,
                                         curPos[1],
                                         curPos[2] + parent.scale[2] / 2 - scale[2] / 2);
            n.scale = scale;
            n.terminal = t[i];
            n.orientation = parent.orientation;
            shapes.push(n);
            let offset = vec3.create();
            offset[id] += scale[id] + scl[4 * i + 3] * parent.scale[id];
            vec3.add(curPos, offset, curPos);
        }
    } else if(mode === "o") {
        let curPos = vec3.fromValues(parent.location[0],
            parent.location[1],
            parent.location[2]);
    
        for(let i = 0; i < number; i++) {
            let n = new Shape(s[i], GeoSymbolMap.get(s[i]));
    
            let scale = vec3.fromValues(parent.scale[0] ,
                        parent.scale[1],
                        parent.scale[2]);
            for(let j = 0; j < 3; j++) {
                if(j === id) {
                    scale[j] *= scl[4 * i + j]; 
                } else {
                    scale[j] += scl[4 * i + j];
                }
            }
            n.location = vec3.fromValues(curPos[0] + parent.scale[0] / 2 - scale[0] / 2,
                                         curPos[1],
                                         curPos[2] + parent.scale[2] / 2 - scale[2] / 2);
            n.scale = scale;
            n.terminal = t[i];
            n.orientation = parent.orientation;
            if(Math.abs(n.scale[0] / parent.scale[0]) < 0.5 || 
               Math.abs(n.scale[2] / parent.scale[2]) < 0.5) {
                   n.terminal = true;
               }
            shapes.push(n);
            let offset = vec3.create();
            offset[id] += scale[id] + scl[4 * i + 3] * parent.scale[id];
            vec3.add(curPos, offset, curPos);
        }
    }

    //check bounding
    
    return shapes;
}

//rp
function repeat(parent : Shape, n : number, p : number[], id : number) : Shape[] {
    let shapes = new Array<Shape>();

    let curPos = vec3.fromValues(parent.location[0],
                                 parent.location[1],
                                 parent.location[2]);
    for(let i = 0; i < n; i++) {
        let scale = vec3.fromValues(parent.scale[0],
                                    parent.scale[1],
                                    parent.scale[2]);
        let pos = vec3.create();
        vec3.add(pos, pos, curPos);
        let offset = vec3.create();
        offset[id] += p[i] * parent.scale[id] + parent.scale[id];
        vec3.add(curPos, curPos, offset);

        let n = new Shape(parent.symbol, GeoSymbolMap.get(parent.symbol));
        n.location = pos;
        n.scale = scale;
        n.orientation = parent.orientation;
        n.terminal = parent.terminal;

        shapes.push(n);
    }

    //check bounding

    return shapes;
}

//tm
function terminate(parent : Shape) : Shape {
    parent.terminal = true;
    return parent;
}

//rpl
function replace(parent : Shape, s : string) : Shape{
    parent.symbol = s;
    parent.geo = GeoSymbolMap.get(s);
    return parent;
}


export default ShapeParser;