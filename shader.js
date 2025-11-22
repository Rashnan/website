import{m as c}from"./module.esm.js";class u{constructor(e){this.canvas=document.getElementById(e),this.gl=null,this.program=null,this.animationId=null,this.isPaused=!1,this.startTime=Date.now(),this.mouseX=.5,this.mouseY=.5,this.speed=1,this.intensity=1,this.colorScheme="rainbow",this.currentShader="plasma",this.shaders={plasma:{vertex:`
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,fragment:`
          precision mediump float;
          varying vec2 v_texCoord;
          uniform float u_time;
          uniform vec2 u_resolution;
          uniform vec2 u_mouse;
          uniform float u_speed;
          uniform float u_intensity;
          uniform int u_colorScheme;
          
          vec3 getColor(float value) {
            if (u_colorScheme == 0) { // Rainbow
              return vec3(
                sin(value * 6.28318) * 0.5 + 0.5,
                sin(value * 6.28318 + 2.094) * 0.5 + 0.5,
                sin(value * 6.28318 + 4.189) * 0.5 + 0.5
              );
            } else if (u_colorScheme == 1) { // Ocean
              return vec3(
                0.0,
                    value * 0.8,
                    value
              );
            } else if (u_colorScheme == 2) { // Fire
              return vec3(
                value,
                value * 0.5,
                0.0
              );
            } else { // Monochrome
              return vec3(value);
            }
          }
          
          void main() {
            vec2 uv = v_texCoord;
            vec2 mouse = u_mouse;
            
            float t = u_time * u_speed;
            
            float plasma = 
              sin(uv.x * 10.0 + t) +
              sin(10.0 * (uv.x * sin(t / 2.0) + uv.y * cos(t / 3.0)) + t) +
              sin(sqrt(50.0 * (uv.x * uv.x + uv.y * uv.y) + 1.0) + t);
            
            float mouseInfluence = 1.0 - distance(uv, mouse) * 2.0;
            mouseInfluence = max(0.0, mouseInfluence);
            
            float value = (plasma / 3.0 + 0.5) * u_intensity + mouseInfluence * 0.3;
            value = fract(value);
            
            gl_FragColor = vec4(getColor(value), 1.0);
          }
        `},waves:{vertex:`
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,fragment:`
          precision mediump float;
          varying vec2 v_texCoord;
          uniform float u_time;
          uniform vec2 u_resolution;
          uniform vec2 u_mouse;
          uniform float u_speed;
          uniform float u_intensity;
          uniform int u_colorScheme;
          
          vec3 getColor(float value) {
            if (u_colorScheme == 0) {
              return vec3(
                sin(value * 6.28318) * 0.5 + 0.5,
                sin(value * 6.28318 + 2.094) * 0.5 + 0.5,
                sin(value * 6.28318 + 4.189) * 0.5 + 0.5
              );
            } else if (u_colorScheme == 1) {
              return vec3(0.0, value * 0.8, value);
            } else if (u_colorScheme == 2) {
              return vec3(value, value * 0.5, 0.0);
            } else {
              return vec3(value);
            }
          }
          
          void main() {
            vec2 uv = v_texCoord;
            float t = u_time * u_speed;
            
            float wave1 = sin(distance(uv, vec2(0.5, 0.5)) * 20.0 - t * 3.0);
            float wave2 = sin(distance(uv, u_mouse) * 15.0 - t * 2.0);
            float wave3 = sin(uv.x * 10.0 + uv.y * 10.0 - t);
            
            float value = (wave1 + wave2 + wave3) / 3.0 * u_intensity;
            value = (value + 1.0) * 0.5;
            
            gl_FragColor = vec4(getColor(value), 1.0);
          }
        `},fractal:{vertex:`
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,fragment:`
          precision mediump float;
          varying vec2 v_texCoord;
          uniform float u_time;
          uniform vec2 u_resolution;
          uniform vec2 u_mouse;
          uniform float u_speed;
          uniform float u_intensity;
          uniform int u_colorScheme;
          
          vec3 getColor(float value) {
            if (u_colorScheme == 0) {
              return vec3(
                sin(value * 6.28318) * 0.5 + 0.5,
                sin(value * 6.28318 + 2.094) * 0.5 + 0.5,
                sin(value * 6.28318 + 4.189) * 0.5 + 0.5
              );
            } else if (u_colorScheme == 1) {
              return vec3(0.0, value * 0.8, value);
            } else if (u_colorScheme == 2) {
              return vec3(value, value * 0.5, 0.0);
            } else {
              return vec3(value);
            }
          }
          
          void main() {
            vec2 uv = v_texCoord;
            vec2 mouse = u_mouse;
            float t = u_time * u_speed * 0.5;
            
            vec2 z = uv * 3.0 - 1.5;
            z += vec2(sin(t), cos(t)) * 0.5;
            
            float iterations = 0.0;
            for(int i = 0; i < 50; i++) {
              float x = z.x * z.x - z.y * z.y + mouse.x;
              float y = 2.0 * z.x * z.y + mouse.y;
              z = vec2(x, y);
              
              if(length(z) > 2.0) break;
              iterations++;
            }
            
            float value = iterations / 50.0 * u_intensity;
            value = pow(value, 0.5);
            
            gl_FragColor = vec4(getColor(value), 1.0);
          }
        `},tunnel:{vertex:`
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,fragment:`
          precision mediump float;
          varying vec2 v_texCoord;
          uniform float u_time;
          uniform vec2 u_resolution;
          uniform vec2 u_mouse;
          uniform float u_speed;
          uniform float u_intensity;
          uniform int u_colorScheme;
          
          vec3 getColor(float value) {
            if (u_colorScheme == 0) {
              return vec3(
                sin(value * 6.28318) * 0.5 + 0.5,
                sin(value * 6.28318 + 2.094) * 0.5 + 0.5,
                sin(value * 6.28318 + 4.189) * 0.5 + 0.5
              );
            } else if (u_colorScheme == 1) {
              return vec3(0.0, value * 0.8, value);
            } else if (u_colorScheme == 2) {
              return vec3(value, value * 0.5, 0.0);
            } else {
              return vec3(value);
            }
          }
          
          void main() {
            vec2 uv = v_texCoord - 0.5;
            float t = u_time * u_speed;
            
            float angle = atan(uv.y, uv.x);
            float radius = length(uv);
            
            float tunnel = sin(radius * 20.0 - t * 3.0) * sin(angle * 8.0 + t);
            
            float mouseInfluence = 1.0 - distance(v_texCoord, u_mouse) * 2.0;
            mouseInfluence = max(0.0, mouseInfluence);
            
            float value = (tunnel + 1.0) * 0.5 * u_intensity + mouseInfluence * 0.2;
            value = fract(value);
            
            gl_FragColor = vec4(getColor(value), 1.0);
          }
        `}},this.init()}init(){if(this.gl=this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl){this.showError("WebGL not supported");return}this.setupCanvas(),this.setupShaders(),this.setupEventListeners(),this.animate(),setTimeout(()=>{const e=document.getElementById("loadingIndicator");e&&(e.style.display="none")},500)}showError(e){const t=document.getElementById("loadingIndicator"),i=document.getElementById("errorIndicator"),o=document.getElementById("errorMessage");t&&(t.style.display="none"),i&&(i.classList.remove("hidden"),o&&(o.textContent=e))}setupCanvas(){const e=()=>{const t=this.canvas.parentElement.getBoundingClientRect();this.canvas.width=t.width,this.canvas.height=t.height,this.gl&&this.gl.viewport(0,0,this.canvas.width,this.canvas.height)};e(),window.addEventListener("resize",e)}createShader(e,t){const i=this.gl.createShader(e);if(this.gl.shaderSource(i,t),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const o=this.gl.getShaderInfoLog(i);throw this.gl.deleteShader(i),new Error(o)}return i}setupShaders(){try{const e=this.shaders[this.currentShader],t=this.createShader(this.gl.VERTEX_SHADER,e.vertex),i=this.createShader(this.gl.FRAGMENT_SHADER,e.fragment);if(this.program&&this.gl.deleteProgram(this.program),this.program=this.gl.createProgram(),this.gl.attachShader(this.program,t),this.gl.attachShader(this.program,i),this.gl.linkProgram(this.program),!this.gl.getProgramParameter(this.program,this.gl.LINK_STATUS))throw new Error(this.gl.getProgramInfoLog(this.program));const o=new Float32Array([-1,-1,1,-1,-1,1,1,1]),a=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,a),this.gl.bufferData(this.gl.ARRAY_BUFFER,o,this.gl.STATIC_DRAW);const n=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(n),this.gl.vertexAttribPointer(n,2,this.gl.FLOAT,!1,0,0);const r=document.getElementById("errorIndicator");r&&r.classList.add("hidden")}catch(e){this.showError("Shader compilation failed: "+e.message)}}setupEventListeners(){this.canvas.addEventListener("mousemove",e=>{const t=this.canvas.getBoundingClientRect();this.mouseX=(e.clientX-t.left)/t.width,this.mouseY=1-(e.clientY-t.top)/t.height}),this.canvas.addEventListener("touchmove",e=>{e.preventDefault();const t=this.canvas.getBoundingClientRect(),i=e.touches[0];this.mouseX=(i.clientX-t.left)/t.width,this.mouseY=1-(i.clientY-t.top)/t.height}),document.getElementById("shaderType").addEventListener("change",e=>{this.currentShader=e.target.value,this.setupShaders()}),document.getElementById("speedControl").addEventListener("input",e=>{this.speed=parseFloat(e.target.value),document.getElementById("speedValue").textContent=this.speed.toFixed(1)+"x"}),document.getElementById("intensityControl").addEventListener("input",e=>{this.intensity=parseFloat(e.target.value),document.getElementById("intensityValue").textContent=this.intensity.toFixed(1)+"x"}),document.getElementById("pauseBtn").addEventListener("click",()=>{this.isPaused=!this.isPaused,document.getElementById("pauseBtn").textContent=this.isPaused?"Resume Animation":"Pause Animation",this.isPaused||this.animate()}),document.getElementById("resetBtn").addEventListener("click",()=>{this.speed=1,this.intensity=1,this.colorScheme="rainbow",document.getElementById("speedControl").value=1,document.getElementById("speedValue").textContent="1.0x",document.getElementById("intensityControl").value=1,document.getElementById("intensityValue").textContent="1.0x",document.querySelectorAll(".color-scheme").forEach(e=>{e.classList.remove("bg-blue-600"),e.classList.add("bg-gray-800")}),document.querySelector('[data-scheme="rainbow"]').classList.remove("bg-gray-800"),document.querySelector('[data-scheme="rainbow"]').classList.add("bg-blue-600")}),document.getElementById("fullscreenBtn").addEventListener("click",()=>{this.canvas.requestFullscreen?this.canvas.requestFullscreen():this.canvas.webkitRequestFullscreen?this.canvas.webkitRequestFullscreen():this.canvas.msRequestFullscreen&&this.canvas.msRequestFullscreen()}),document.querySelectorAll(".color-scheme").forEach(e=>{e.addEventListener("click",t=>{document.querySelectorAll(".color-scheme").forEach(i=>{i.classList.remove("bg-blue-600"),i.classList.add("bg-gray-800")}),e.classList.remove("bg-gray-800"),e.classList.add("bg-blue-600"),this.colorScheme=t.target.dataset.scheme})}),document.querySelector('[data-scheme="rainbow"]').classList.remove("bg-gray-800"),document.querySelector('[data-scheme="rainbow"]').classList.add("bg-blue-600")}animate(){if(this.isPaused)return;const e=(Date.now()-this.startTime)/1e3;if(this.program&&this.gl){this.gl.useProgram(this.program);const t=this.gl.getUniformLocation(this.program,"u_time");t&&this.gl.uniform1f(t,e);const i=this.gl.getUniformLocation(this.program,"u_resolution");i&&this.gl.uniform2f(i,this.canvas.width,this.canvas.height);const o=this.gl.getUniformLocation(this.program,"u_mouse");o&&this.gl.uniform2f(o,this.mouseX,this.mouseY);const a=this.gl.getUniformLocation(this.program,"u_speed");a&&this.gl.uniform1f(a,this.speed);const n=this.gl.getUniformLocation(this.program,"u_intensity");n&&this.gl.uniform1f(n,this.intensity);const r=this.gl.getUniformLocation(this.program,"u_colorScheme");if(r){const l={rainbow:0,ocean:1,fire:2,monochrome:3};this.gl.uniform1i(r,l[this.colorScheme])}this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}this.animationId=requestAnimationFrame(()=>this.animate())}destroy(){this.animationId&&cancelAnimationFrame(this.animationId)}}class m{constructor(){this.canvas=document.getElementById("customShaderCanvas"),this.gl=null,this.program=null,this.animationId=null,this.startTime=Date.now(),this.mouseX=.5,this.mouseY=.5,this.defaultVertexShader=`
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_position * 0.5 + 0.5;
}`.trim(),this.defaultFragmentShader=`
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = v_texCoord;
  vec3 color = vec3(uv.x, uv.y, abs(sin(u_time)));
  gl_FragColor = vec4(color, 1.0);
}`.trim(),this.templates={gradient:`
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = v_texCoord;
  float gradient = uv.y + sin(u_time + uv.x * 10.0) * 0.1;
  vec3 color = mix(vec3(0.1, 0.2, 0.8), vec3(0.8, 0.2, 0.9), gradient);
  gl_FragColor = vec4(color, 1.0);
}`.trim(),mandelbrot:`
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = (v_texCoord - 0.5) * 3.0;
  vec2 c = uv + vec2(sin(u_time * 0.1) * 0.5, cos(u_time * 0.1) * 0.5);
  vec2 z = vec2(0.0);
  
  float iterations = 0.0;
  for(int i = 0; i < 100; i++) {
    if(length(z) > 2.0) break;
    z = vec2(z.x * z.x - z.y * z.y, 2.0 * z.x * z.y) + c;
    iterations++;
  }
  
  float color = iterations / 100.0;
  gl_FragColor = vec4(vec3(color * 0.9, color * 0.3, color), 1.0);
}`.trim(),raymarching:`
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float sphere(vec3 p, float r) {
  return length(p) - r;
}

float scene(vec3 p) {
  return sphere(p - vec3(0.0, 0.0, sin(u_time) * 2.0), 1.0);
}

void main() {
  vec2 uv = (v_texCoord - 0.5) * 2.0;
  vec3 ro = vec3(0.0, 0.0, 5.0);
  vec3 rd = normalize(vec3(uv, -1.0));
  
  float t = 0.0;
  for(int i = 0; i < 100; i++) {
    vec3 p = ro + rd * t;
    float d = scene(p);
    if(d < 0.001) break;
    t += d;
    if(t > 20.0) break;
  }
  
  vec3 color = vec3(0.1, 0.2, 0.3);
  if(t < 20.0) {
    vec3 p = ro + rd * t;
    color = vec3(abs(sin(p.x + u_time)), abs(cos(p.y)), abs(sin(p.z)));
  }
  
  gl_FragColor = vec4(color, 1.0);
}`.trim(),voronoi:`
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec2 random2(vec2 st) {
  st = vec2(dot(st, vec2(127.1, 311.7)),
            dot(st, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(st) * 43758.5453123);
}

void main() {
  vec2 uv = v_texCoord * 10.0;
  uv += u_time * 0.5;
  
  vec2 i_st = floor(uv);
  vec2 f_st = fract(uv);
  
  float m_dist = 1.0;
  vec2 m_point;
  
  for(int j = -1; j <= 1; j++) {
    for(int i = -1; i <= 1; i++) {
      vec2 neighbor = vec2(float(i), float(j));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(u_time + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if(dist < m_dist) {
        m_dist = dist;
        m_point = point;
      }
    }
  }
  
  vec3 color = vec3(m_point.x, m_point.y, m_dist * 2.0);
  gl_FragColor = vec4(color, 1.0);
}`.trim()},this.init()}init(){if(this.gl=this.canvas.getContext("webgl")||this.canvas.getContext("experimental-webgl"),!this.gl){this.showCustomError("WebGL not supported");return}this.setupCanvas(),this.setupEditors(),this.setupEventListeners(),this.compileAndRun()}setupCanvas(){const e=()=>{const t=this.canvas.parentElement.getBoundingClientRect();this.canvas.width=t.width,this.canvas.height=t.height,this.gl&&this.gl.viewport(0,0,this.canvas.width,this.canvas.height)};e(),window.addEventListener("resize",e)}setupEditors(){typeof CodeMirror<"u"?(this.fragmentEditor=CodeMirror.fromTextArea(document.getElementById("fragmentShaderEditor"),{mode:"x-shader/x-fragment",theme:"monokai",lineNumbers:!0,autoCloseBrackets:!0,matchBrackets:!0,indentUnit:2,tabSize:2,lineWrapping:!0}),this.vertexEditor=CodeMirror.fromTextArea(document.getElementById("vertexShaderEditor"),{mode:"x-shader/x-vertex",theme:"monokai",lineNumbers:!0,autoCloseBrackets:!0,matchBrackets:!0,indentUnit:2,tabSize:2,lineWrapping:!0}),this.fragmentEditor.setValue(this.defaultFragmentShader),this.vertexEditor.setValue(this.defaultVertexShader)):(document.getElementById("fragmentShaderEditor").value=this.defaultFragmentShader,document.getElementById("vertexShaderEditor").value=this.defaultVertexShader)}setupEventListeners(){this.canvas.addEventListener("mousemove",e=>{const t=this.canvas.getBoundingClientRect();this.mouseX=(e.clientX-t.left)/t.width,this.mouseY=1-(e.clientY-t.top)/t.height}),document.getElementById("compileBtn").addEventListener("click",()=>{this.compileAndRun()}),document.getElementById("formatBtn").addEventListener("click",()=>{this.formatShader()}),document.getElementById("resetVertexBtn").addEventListener("click",()=>{this.vertexEditor?this.vertexEditor.setValue(this.defaultVertexShader):document.getElementById("vertexShaderEditor").value=this.defaultVertexShader}),document.querySelectorAll(".template-btn").forEach(e=>{e.addEventListener("click",t=>{const i=t.target.dataset.template;this.templates[i]&&(this.fragmentEditor?this.fragmentEditor.setValue(this.templates[i]):document.getElementById("fragmentShaderEditor").value=this.templates[i],this.compileAndRun())})})}formatShader(){let e=this.fragmentEditor?this.fragmentEditor.getValue():document.getElementById("fragmentShaderEditor").value;e=e.replace(/\s+/g," "),e=e.replace(/;\s*/g,`;
`),e=e.replace(/\{\s*/g,` {
  `),e=e.replace(/\}\s*/g,`
}
`),e=e.replace(/\n\s*\n/g,`
`),e=e.trim(),this.fragmentEditor?this.fragmentEditor.setValue(e):document.getElementById("fragmentShaderEditor").value=e}compileAndRun(){try{const e=this.vertexEditor?this.vertexEditor.getValue():document.getElementById("vertexShaderEditor").value,t=this.fragmentEditor?this.fragmentEditor.getValue():document.getElementById("fragmentShaderEditor").value,i=this.createShader(this.gl.VERTEX_SHADER,e),o=this.createShader(this.gl.FRAGMENT_SHADER,t);if(this.program&&this.gl.deleteProgram(this.program),this.program=this.gl.createProgram(),this.gl.attachShader(this.program,i),this.gl.attachShader(this.program,o),this.gl.linkProgram(this.program),!this.gl.getProgramParameter(this.program,this.gl.LINK_STATUS))throw new Error(this.gl.getProgramInfoLog(this.program));const a=new Float32Array([-1,-1,1,-1,-1,1,1,1]),n=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,n),this.gl.bufferData(this.gl.ARRAY_BUFFER,a,this.gl.STATIC_DRAW);const r=this.gl.getAttribLocation(this.program,"a_position");this.gl.enableVertexAttribArray(r),this.gl.vertexAttribPointer(r,2,this.gl.FLOAT,!1,0,0);const l=document.getElementById("customErrorIndicator");l&&l.classList.add("hidden"),this.animationId||this.animate()}catch(e){this.showCustomError("Compilation failed: "+e.message)}}createShader(e,t){const i=this.gl.createShader(e);if(this.gl.shaderSource(i,t),this.gl.compileShader(i),!this.gl.getShaderParameter(i,this.gl.COMPILE_STATUS)){const o=this.gl.getShaderInfoLog(i);throw this.gl.deleteShader(i),new Error(o)}return i}showCustomError(e){const t=document.getElementById("customErrorIndicator"),i=document.getElementById("customErrorMessage");t&&(t.classList.remove("hidden"),i&&(i.textContent=e))}animate(){const e=(Date.now()-this.startTime)/1e3;if(this.program&&this.gl){this.gl.useProgram(this.program);const t=this.gl.getUniformLocation(this.program,"u_time");t&&this.gl.uniform1f(t,e);const i=this.gl.getUniformLocation(this.program,"u_resolution");i&&this.gl.uniform2f(i,this.canvas.width,this.canvas.height);const o=this.gl.getUniformLocation(this.program,"u_mouse");o&&this.gl.uniform2f(o,this.mouseX,this.mouseY),this.gl.drawArrays(this.gl.TRIANGLE_STRIP,0,4)}this.animationId=requestAnimationFrame(()=>this.animate())}}document.addEventListener("DOMContentLoaded",()=>{const s=document.getElementById("presetMode"),e=document.getElementById("customMode"),t=document.getElementById("presetContent"),i=document.getElementById("customContent");s.addEventListener("click",()=>{s.classList.add("bg-blue-600","text-white"),s.classList.remove("text-gray-400"),e.classList.remove("bg-blue-600","text-white"),e.classList.add("text-gray-400"),t.classList.remove("hidden"),i.classList.add("hidden")}),e.addEventListener("click",()=>{e.classList.add("bg-blue-600","text-white"),e.classList.remove("text-gray-400"),s.classList.remove("bg-blue-600","text-white"),s.classList.add("text-gray-400"),i.classList.remove("hidden"),t.classList.add("hidden")}),window.shaderRenderer=new u("shaderCanvas"),window.customShaderEditor=new m});c.start();
//# sourceMappingURL=shader.js.map
