import { performance } from "perf_hooks";
import { toASCII } from "punycode";
import { freemem } from "os";



function rand(n : number[]) : number{
    let r = Math.sin(n[0] * 12.9898 + n[1] * 4.1414) * 43758.5453;
    return r - Math.floor(r);
}

function interpNoise(x : number, y : number) :  number {
    let intX = Math.floor(x);
    let fractX = x - intX;
    let intY = Math.floor(y);
    let fractY = y - intY;

    let v1 = rand([intX, intY]);
    let v2 = rand([intX + 1, intY]);
    let v3 = rand([intX, intY + 1]);
    let v4 = rand([intX + 1, intY + 1]);

    let i1 = (1 - fractX) * v1 + fractX * v2;
    let i2 = (1 - fractX) * v3 + fractX * v4;
    return (1 - fractY) * i1 + fractY * i2;
}

function fbm(x : number, y : number) : number {
    let total = 0;
    let persistence = 0.75;
    let octaves = 10;
    let maxVal = 0.0;

    for(let i = 0; i < octaves; i++) {
        let freq = Math.pow(2.0, i);
        let amp = Math.pow(persistence, i);

        total += amp * interpNoise(x * freq, y * freq);
        maxVal += amp;
    }
    return total / maxVal;
}

export function gaussian(x : number, y : number) : number{
    let a = 1.0;
    let sig = 0.5;

    return a * Math.exp(-(Math.pow(x, 2.0) / 2 * Math.pow(sig, 2.0) + Math.pow(y, 2.0) / 2 * Math.pow(sig, 2.0)));
}


class City
{
    width : number;
    height : number;
    blockSize : number;
    
};

export default fbm;