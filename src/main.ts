import {vec3, vec4} from 'gl-matrix';
import * as Stats from 'stats-js';
import * as DAT from 'dat-gui';
import Icosphere from './geometry/Icosphere';
import Square from './geometry/Square';
import Cube from './geometry/Cube';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';
import { GUIController } from 'dat-gui';
import Obj, {ObjInfo} from './Object';
import Scene, {setBase, setRoof1, setCylinder, setRoof2, setCap1, setHouse1} from './Scene';


const controls = {
  tesselations: 5,
  'Load Scene': loadScene, 
  // Color: "#EC2D7A",
  Color: "#FFDE83",
  Iteration : 0,
};

// read text file function
// reference: https://stackoverflow.com/questions/14446447/how-to-read-a-local-text-file
function readTextFile(file : string) : string
{
  var allText : string;
    var rawFile = new XMLHttpRequest();
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function ()
    {
        if(rawFile.readyState === 4)
        {
            if(rawFile.status === 200 || rawFile.status == 0)
            {
                allText = rawFile.responseText;
                return allText;
            }
        }
    }
    rawFile.send(null);
    return allText;
}

//----------------------------load scene--------------------------------------------
let icosphere: Icosphere;
let square: Square;
let cube: Cube;
let ground : Obj;
let scene : Scene;


function loadScene() {
  icosphere = new Icosphere(vec3.fromValues(0, 0, 0), 1, controls.tesselations);
  icosphere.create();
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  cube = new Cube(vec3.fromValues(0, 0, 0));
  cube.create();


  // load obj
  var OBJ = require('webgl-obj-loader');
  var meshPathB = './obj/tinyCube.obj';
  var dataB = readTextFile(meshPathB);
  var meshB = new OBJ.Mesh(dataB);
  setBase(new ObjInfo(meshB));

  var meshPathF = './obj/tinyCylinder.obj';
  var dataF = readTextFile(meshPathF);
  var meshF = new OBJ.Mesh(dataF);
  setCylinder(new ObjInfo(meshF));

  var meshPathR1 = './obj/roof.obj';
  var dataR1 = readTextFile(meshPathR1);
  var meshR1 = new OBJ.Mesh(dataR1);
  setRoof1(new ObjInfo(meshR1));

  var meshPathR2 = './obj/ruinRoof.obj';
  var dataR2 = readTextFile(meshPathR2);
  var meshR2 = new OBJ.Mesh(dataR2);
  setRoof2(new ObjInfo(meshR2));

  var meshPathH = './obj/houseUnit2.obj';
  var dataH = readTextFile(meshPathH);
  var meshH = new OBJ.Mesh(dataH);
  setHouse1(new ObjInfo(meshH));

  var meshPathC = './obj/cap.obj';
  var dataC = readTextFile(meshPathC);
  var meshC = new OBJ.Mesh(dataC);
  setCap1(new ObjInfo(meshC));

  var meshPathG = './obj/ground.obj';
  var dataG = readTextFile(meshPathG);
  var meshG = new OBJ.Mesh(dataG);
  ground = new Obj(meshG, vec4.fromValues(0, -15, 0, 0));
  ground.create();

  scene = new Scene(4, 30, 30);
  scene.create();
  
  
}

//--------------------------------------load music--------------------------------------
function loadMusic() {
  var audio = document.createElement("audio");
  audio.src = "./music/m1.mp3";
  audio.setAttribute('loop', "loop");
  audio.play();
}

// Used to assign color to object
var objColor: vec4;
// Used to change shader
var prog: ShaderProgram[];
// time
var time = 0;

//--------------------------------------main------------------------------------------
function main() {
  loadMusic();
  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // Initialize obj color
  // objColor = vec4.fromValues(0.93, 0.18, 0.48, 1);
  objColor = vec4.fromValues(255. / 255., 222. / 255., 131. / 255., 1.0);

  
  //----------------------------set webgl and canvas----------------------------
  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  setGL(gl);


  //------------------------------GUI----------------------------------------
  // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Load Scene');
  
  // Change color of cube
  gui.addColor(controls,'Color').onChange(function(){
 
    let color = [];

    color[0] = parseInt(controls.Color.slice(1, 3), 16);
    color[1] = parseInt(controls.Color.slice(3, 5), 16);
    color[2] = parseInt(controls.Color.slice(5, 7), 16);

    objColor = vec4.fromValues(color[0] / 255, 
                                color[1] / 255,
                                color[2] / 255,
                                1);
  });

  gui.add(controls,'Iteration', 0, 5).step(1).onChange(function() {
    scene.destroy();
    scene = new Scene(controls.Iteration, 30, 30);
    scene.create();
  })


  
  //-------------------set up scene, gl and camera-----------------
  // Initial call to load scene
  loadScene();
  const camera = new Camera(vec3.fromValues(65, 10, 55), vec3.fromValues(0, 10, 0));
  const renderer = new OpenGLRenderer(canvas);
  // renderer.setClearColor(1.0, 0.72, 0.75, 1);
  renderer.setClearColor(255. / 255., 232. / 255., 169. / 255., 1.0);
  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.cullFace(gl.FRONT);
  gl.cullFace(gl.BACK);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);


  //-------------------shaders----------------------------
  const lambert1 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/lambert-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/lambert-frag.glsl')),
  ]);

  const lambert2 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/custom-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/custom-frag.glsl')),
  ]);

  const lambert3 = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/ground-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/ground-frag.glsl')),
  ]);

  prog = new Array<ShaderProgram>();
  prog.push(lambert1);
  prog.push(lambert3);
  prog.push(lambert2);


  //--------------------tick---------------------------------
  // call every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);

    renderer.clear();
    renderer.render(camera, prog, [
      
      scene.geo,
      ground,
      square,
      
    ], [
      objColor,
      objColor,
      vec4.fromValues(1.0, 1.0, 0.5, 0.1),
      
    ]
    , time);

    time++;
    stats.end();
    requestAnimationFrame(tick);
  }


  //---------------------window listener-------------------------
  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();

  tick();
}

main();
