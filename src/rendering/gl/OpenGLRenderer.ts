import {mat4, vec4, vec2} from 'gl-matrix';
import Drawable from './Drawable';
import Camera from '../../Camera';
import {gl} from '../../globals';
import ShaderProgram from './ShaderProgram';

// In this file, `gl` is accessible because it is imported above
class OpenGLRenderer {
  constructor(public canvas: HTMLCanvasElement) {
  }

  setClearColor(r: number, g: number, b: number, a: number) {
    gl.clearColor(r, g, b, a);
  }

  setSize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  clear() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  }

  render(camera: Camera, prog: Array<ShaderProgram>, drawables: Array<Drawable>, c: Array<vec4>, time: number) {
    let model = mat4.create();
    let viewProj = mat4.create();
    let color = c;

    mat4.identity(model);
    mat4.multiply(viewProj, camera.projectionMatrix, camera.viewMatrix);
    

    for (let i = 0; i < drawables.length;i++) {
      prog[i].setModelMatrix(model);
      prog[i].setViewProjMatrix(viewProj);
      prog[i].setGeometryColor(color[i]);
      prog[i].setTime(time);
      prog[i].setEye(vec4.fromValues(camera.position[0], camera.position[1],camera.position[2],1.0));
      prog[i].setDimension(vec2.fromValues(this.canvas.width, this.canvas.height));
      prog[i].draw(drawables[i]);
      prog[i].use();
    }
  }
};

export default OpenGLRenderer;
