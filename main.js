let gl;
let canvas;
let timeUniformLocation;
let aspectUniformLocation;

async function init() {
  canvas = document.getElementById("canvas");
  gl = canvas.getContext("webgl2");

  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
    return;
  }

  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // Set the viewport to match the canvas resolution
  gl.viewport(0, 0, canvas.width, canvas.height);

  // Set the clear color to black
  gl.clearColor(0.0, 0.0, 0.0, 1.0);
  
  // Compile the vertex shader
  const vertexShaderSource = await fetchShaderSource('shaders/shader.vert');
  const vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);

  // Compile the fragment shader
  const fragmentShaderSource = await fetchShaderSource('shaders/shader.frag');
  const fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);

  // Link the shaders into a program
  const program = linkProgram(vertexShader, fragmentShader);

  // Set up the position attribute
  const positionAttributeLocation = gl.getAttribLocation(program, "in_pos");
  const uvAttributeLocation = gl.getAttribLocation(program, "in_uv");
  timeUniformLocation = gl.getUniformLocation(program, 'time')
  aspectUniformLocation = gl.getUniformLocation(program, 'aspect')
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  // const positions = [    0.0, 0.5, 0.0,    -0.5, -0.5, 0.0,    0.5, -0.5, 0.0  ];
  // const positions = [    -1.0, -1.0, 0.0, 0.0, 0.0,    1.0, -1.0, 0.0, 1.0, 0.0,    1.0, 1.0, 0.0, 1.0, 1.0,   -1.0, 1.0, 0.0, 0.0, 1.0  ];
  const vertex_data = [
    // position     // texture coordinates
    -1.0, -1.0, 0.0, 0.0, 0.0,
     1.0, -1.0, 0.0, 1.0, 0.0,
    -1.0,  1.0, 0.0, 0.0, 1.0,
     1.0,  1.0, 0.0, 1.0, 1.0,
  ];
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex_data), gl.STATIC_DRAW);
  gl.vertexAttribPointer(positionAttributeLocation, 3, gl.FLOAT, false, 4*5, 0);
  gl.vertexAttribPointer(uvAttributeLocation, 2, gl.FLOAT, false, 4*5, 4*3);
  gl.enableVertexAttribArray(positionAttributeLocation);
  gl.enableVertexAttribArray(uvAttributeLocation);

  // Render the scene
  render();
}

function render() {
  const time = performance.now() / 1000;
  gl.uniform1f(timeUniformLocation, time);
  
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

  requestAnimationFrame(render);
}

// Helper function to fetch the source code of a shader
async function fetchShaderSource(url) {
  const response = await fetch(url);
  const text = await response.text();
  return text;
}

// Helper function to compile a shader
function compileShader(source, type) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("An error occurred compiling the shaders:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

// Helper function to link a program
function linkProgram(vertexShader, fragmentShader) {
  const program = gl.createProgram();
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Unable to link the program:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  return program;
}

function resizeCanvas() {
  const canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.uniform1f(aspectUniformLocation, canvas.width/canvas.height);
  gl.viewport(0, 0, canvas.width, canvas.height);
}

init();