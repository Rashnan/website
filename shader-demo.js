import Alpine from 'alpinejs'

class ShaderRenderer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId)
    this.gl = null
    this.program = null
    this.animationId = null
    this.isPaused = false
    this.startTime = Date.now()
    this.mouseX = 0.5
    this.mouseY = 0.5
    this.speed = 1.0
    this.intensity = 1.0
    this.colorScheme = 'rainbow'
    this.currentShader = 'plasma'
    
    this.shaders = {
      plasma: {
        vertex: `
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,
        fragment: `
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
        `
      },
      waves: {
        vertex: `
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,
        fragment: `
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
        `
      },
      fractal: {
        vertex: `
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,
        fragment: `
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
        `
      },
      tunnel: {
        vertex: `
          attribute vec2 a_position;
          varying vec2 v_texCoord;
          
          void main() {
            gl_Position = vec4(a_position, 0.0, 1.0);
            v_texCoord = a_position * 0.5 + 0.5;
          }
        `,
        fragment: `
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
        `
      }
    }
    
    this.init()
  }
  
  init() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
    
    if (!this.gl) {
      this.showError('WebGL not supported')
      return
    }
    
    this.setupCanvas()
    this.setupShaders()
    this.setupEventListeners()
    this.animate()
    
    // Hide loading indicator
    setTimeout(() => {
      const indicator = document.getElementById('loadingIndicator')
      if (indicator) indicator.style.display = 'none'
    }, 500)
  }
  
  showError(message) {
    const indicator = document.getElementById('loadingIndicator')
    const errorIndicator = document.getElementById('errorIndicator')
    const errorMessage = document.getElementById('errorMessage')
    
    if (indicator) indicator.style.display = 'none'
    if (errorIndicator) {
      errorIndicator.classList.remove('hidden')
      if (errorMessage) errorMessage.textContent = message
    }
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect()
      this.canvas.width = rect.width
      this.canvas.height = rect.height
      if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
      }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type)
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader)
      this.gl.deleteShader(shader)
      throw new Error(error)
    }
    
    return shader
  }
  
  setupShaders() {
    try {
      const shader = this.shaders[this.currentShader]
      
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, shader.vertex)
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, shader.fragment)
      
      if (this.program) {
        this.gl.deleteProgram(this.program)
      }
      
      this.program = this.gl.createProgram()
      this.gl.attachShader(this.program, vertexShader)
      this.gl.attachShader(this.program, fragmentShader)
      this.gl.linkProgram(this.program)
      
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(this.program))
      }
      
      // Set up geometry
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ])
      
      const positionBuffer = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW)
      
      const positionLocation = this.gl.getAttribLocation(this.program, 'a_position')
      this.gl.enableVertexAttribArray(positionLocation)
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0)
      
      // Hide error if shown
      const errorIndicator = document.getElementById('errorIndicator')
      if (errorIndicator) errorIndicator.classList.add('hidden')
      
    } catch (error) {
      this.showError('Shader compilation failed: ' + error.message)
    }
  }
  
  setupEventListeners() {
    // Mouse movement
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = (e.clientX - rect.left) / rect.width
      this.mouseY = 1.0 - (e.clientY - rect.top) / rect.height
    })
    
    // Touch movement
    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault()
      const rect = this.canvas.getBoundingClientRect()
      const touch = e.touches[0]
      this.mouseX = (touch.clientX - rect.left) / rect.width
      this.mouseY = 1.0 - (touch.clientY - rect.top) / rect.height
    })
    
    // Control listeners
    document.getElementById('shaderType').addEventListener('change', (e) => {
      this.currentShader = e.target.value
      this.setupShaders()
    })
    
    document.getElementById('speedControl').addEventListener('input', (e) => {
      this.speed = parseFloat(e.target.value)
      document.getElementById('speedValue').textContent = this.speed.toFixed(1) + 'x'
    })
    
    document.getElementById('intensityControl').addEventListener('input', (e) => {
      this.intensity = parseFloat(e.target.value)
      document.getElementById('intensityValue').textContent = this.intensity.toFixed(1) + 'x'
    })
    
    document.getElementById('pauseBtn').addEventListener('click', () => {
      this.isPaused = !this.isPaused
      document.getElementById('pauseBtn').textContent = this.isPaused ? 'Resume Animation' : 'Pause Animation'
      if (!this.isPaused) this.animate()
    })
    
    document.getElementById('resetBtn').addEventListener('click', () => {
      this.speed = 1.0
      this.intensity = 1.0
      this.colorScheme = 'rainbow'
      
      document.getElementById('speedControl').value = 1.0
      document.getElementById('speedValue').textContent = '1.0x'
      document.getElementById('intensityControl').value = 1.0
      document.getElementById('intensityValue').textContent = '1.0x'
      
      document.querySelectorAll('.color-scheme').forEach(btn => {
        btn.classList.remove('bg-blue-600')
        btn.classList.add('bg-gray-800')
      })
      document.querySelector('[data-scheme="rainbow"]').classList.remove('bg-gray-800')
      document.querySelector('[data-scheme="rainbow"]').classList.add('bg-blue-600')
    })
    
    document.getElementById('fullscreenBtn').addEventListener('click', () => {
      if (this.canvas.requestFullscreen) {
        this.canvas.requestFullscreen()
      } else if (this.canvas.webkitRequestFullscreen) {
        this.canvas.webkitRequestFullscreen()
      } else if (this.canvas.msRequestFullscreen) {
        this.canvas.msRequestFullscreen()
      }
    })
    
    // Color scheme buttons
    document.querySelectorAll('.color-scheme').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.color-scheme').forEach(b => {
          b.classList.remove('bg-blue-600')
          b.classList.add('bg-gray-800')
        })
        btn.classList.remove('bg-gray-800')
        btn.classList.add('bg-blue-600')
        
        this.colorScheme = e.target.dataset.scheme
      })
    })
    
    // Set initial active color scheme
    document.querySelector('[data-scheme="rainbow"]').classList.remove('bg-gray-800')
    document.querySelector('[data-scheme="rainbow"]').classList.add('bg-blue-600')
  }
  
  animate() {
    if (this.isPaused) return
    
    const currentTime = (Date.now() - this.startTime) / 1000
    
    if (this.program && this.gl) {
      this.gl.useProgram(this.program)
      
      // Set uniforms
      const timeLocation = this.gl.getUniformLocation(this.program, 'u_time')
      if (timeLocation) this.gl.uniform1f(timeLocation, currentTime)
      
      const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution')
      if (resolutionLocation) this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height)
      
      const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse')
      if (mouseLocation) this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY)
      
      const speedLocation = this.gl.getUniformLocation(this.program, 'u_speed')
      if (speedLocation) this.gl.uniform1f(speedLocation, this.speed)
      
      const intensityLocation = this.gl.getUniformLocation(this.program, 'u_intensity')
      if (intensityLocation) this.gl.uniform1f(intensityLocation, this.intensity)
      
      const colorSchemeLocation = this.gl.getUniformLocation(this.program, 'u_colorScheme')
      if (colorSchemeLocation) {
        const schemeMap = { 'rainbow': 0, 'ocean': 1, 'fire': 2, 'monochrome': 3 }
        this.gl.uniform1i(colorSchemeLocation, schemeMap[this.colorScheme])
      }
      
      // Draw
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
    }
    
    this.animationId = requestAnimationFrame(() => this.animate())
  }
  
  destroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
    }
  }
}

class CustomShaderEditor {
  constructor() {
    this.canvas = document.getElementById('customShaderCanvas')
    this.gl = null
    this.program = null
    this.animationId = null
    this.startTime = Date.now()
    this.mouseX = 0.5
    this.mouseY = 0.5
    
    this.defaultVertexShader = `
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_position * 0.5 + 0.5;
}`.trim()

    this.defaultFragmentShader = `
precision mediump float;
varying vec2 v_texCoord;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = v_texCoord;
  vec3 color = vec3(uv.x, uv.y, abs(sin(u_time)));
  gl_FragColor = vec4(color, 1.0);
}`.trim()

    this.templates = {
      gradient: `
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
}`.trim(),
      mandelbrot: `
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
}`.trim(),
      raymarching: `
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
}`.trim(),
      voronoi: `
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
}`.trim()
    }
    
    this.init()
  }
  
  init() {
    this.gl = this.canvas.getContext('webgl') || this.canvas.getContext('experimental-webgl')
    
    if (!this.gl) {
      this.showCustomError('WebGL not supported')
      return
    }
    
    this.setupCanvas()
    this.setupEditors()
    this.setupEventListeners()
    this.compileAndRun()
  }
  
  setupCanvas() {
    const resizeCanvas = () => {
      const rect = this.canvas.parentElement.getBoundingClientRect()
      this.canvas.width = rect.width
      this.canvas.height = rect.height
      if (this.gl) {
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
      }
    }
    
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
  }
  
  setupEditors() {
    // Initialize CodeMirror editors
    if (typeof CodeMirror !== 'undefined') {
      this.fragmentEditor = CodeMirror.fromTextArea(document.getElementById('fragmentShaderEditor'), {
        mode: 'x-shader/x-fragment',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true
      })
      
      this.vertexEditor = CodeMirror.fromTextArea(document.getElementById('vertexShaderEditor'), {
        mode: 'x-shader/x-vertex',
        theme: 'monokai',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 2,
        tabSize: 2,
        lineWrapping: true
      })
      
      // Set default values
      this.fragmentEditor.setValue(this.defaultFragmentShader)
      this.vertexEditor.setValue(this.defaultVertexShader)
    } else {
      // Fallback to regular textareas
      document.getElementById('fragmentShaderEditor').value = this.defaultFragmentShader
      document.getElementById('vertexShaderEditor').value = this.defaultVertexShader
    }
  }
  
  setupEventListeners() {
    // Mouse movement for custom canvas
    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect()
      this.mouseX = (e.clientX - rect.left) / rect.width
      this.mouseY = 1.0 - (e.clientY - rect.top) / rect.height
    })
    
    // Compile button
    document.getElementById('compileBtn').addEventListener('click', () => {
      this.compileAndRun()
    })
    
    // Format button
    document.getElementById('formatBtn').addEventListener('click', () => {
      this.formatShader()
    })
    
    // Reset vertex button
    document.getElementById('resetVertexBtn').addEventListener('click', () => {
      if (this.vertexEditor) {
        this.vertexEditor.setValue(this.defaultVertexShader)
      } else {
        document.getElementById('vertexShaderEditor').value = this.defaultVertexShader
      }
    })
    
    // Template buttons
    document.querySelectorAll('.template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template
        if (this.templates[template]) {
          if (this.fragmentEditor) {
            this.fragmentEditor.setValue(this.templates[template])
          } else {
            document.getElementById('fragmentShaderEditor').value = this.templates[template]
          }
          this.compileAndRun()
        }
      })
    })
  }
  
  formatShader() {
    // Basic GLSL formatting
    let source = this.fragmentEditor ? this.fragmentEditor.getValue() : document.getElementById('fragmentShaderEditor').value
    
    // Simple formatting rules
    source = source.replace(/\s+/g, ' ')           // Multiple spaces to single
    source = source.replace(/;\s*/g, ';\n')        // Newlines after semicolons
    source = source.replace(/\{\s*/g, ' {\n  ')    // Opening braces
    source = source.replace(/\}\s*/g, '\n}\n')    // Closing braces
    source = source.replace(/\n\s*\n/g, '\n')      // Remove empty lines
    source = source.trim()
    
    if (this.fragmentEditor) {
      this.fragmentEditor.setValue(source)
    } else {
      document.getElementById('fragmentShaderEditor').value = source
    }
  }
  
  compileAndRun() {
    try {
      const vertexSource = this.vertexEditor ? this.vertexEditor.getValue() : document.getElementById('vertexShaderEditor').value
      const fragmentSource = this.fragmentEditor ? this.fragmentEditor.getValue() : document.getElementById('fragmentShaderEditor').value
      
      const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexSource)
      const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentSource)
      
      if (this.program) {
        this.gl.deleteProgram(this.program)
      }
      
      this.program = this.gl.createProgram()
      this.gl.attachShader(this.program, vertexShader)
      this.gl.attachShader(this.program, fragmentShader)
      this.gl.linkProgram(this.program)
      
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        throw new Error(this.gl.getProgramInfoLog(this.program))
      }
      
      // Set up geometry
      const positions = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1,
      ])
      
      const positionBuffer = this.gl.createBuffer()
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer)
      this.gl.bufferData(this.gl.ARRAY_BUFFER, positions, this.gl.STATIC_DRAW)
      
      const positionLocation = this.gl.getAttribLocation(this.program, 'a_position')
      this.gl.enableVertexAttribArray(positionLocation)
      this.gl.vertexAttribPointer(positionLocation, 2, this.gl.FLOAT, false, 0, 0)
      
      // Hide error if shown
      const errorIndicator = document.getElementById('customErrorIndicator')
      if (errorIndicator) errorIndicator.classList.add('hidden')
      
      // Start animation
      if (!this.animationId) {
        this.animate()
      }
      
    } catch (error) {
      this.showCustomError('Compilation failed: ' + error.message)
    }
  }
  
  createShader(type, source) {
    const shader = this.gl.createShader(type)
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)
    
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const error = this.gl.getShaderInfoLog(shader)
      this.gl.deleteShader(shader)
      throw new Error(error)
    }
    
    return shader
  }
  
  showCustomError(message) {
    const errorIndicator = document.getElementById('customErrorIndicator')
    const errorMessage = document.getElementById('customErrorMessage')
    
    if (errorIndicator) {
      errorIndicator.classList.remove('hidden')
      if (errorMessage) errorMessage.textContent = message
    }
  }
  
  animate() {
    const currentTime = (Date.now() - this.startTime) / 1000
    
    if (this.program && this.gl) {
      this.gl.useProgram(this.program)
      
      // Set uniforms
      const timeLocation = this.gl.getUniformLocation(this.program, 'u_time')
      if (timeLocation) this.gl.uniform1f(timeLocation, currentTime)
      
      const resolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution')
      if (resolutionLocation) this.gl.uniform2f(resolutionLocation, this.canvas.width, this.canvas.height)
      
      const mouseLocation = this.gl.getUniformLocation(this.program, 'u_mouse')
      if (mouseLocation) this.gl.uniform2f(mouseLocation, this.mouseX, this.mouseY)
      
      // Draw
      this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
    }
    
    this.animationId = requestAnimationFrame(() => this.animate())
  }
}

// Mode switching
document.addEventListener('DOMContentLoaded', () => {
  const presetMode = document.getElementById('presetMode')
  const customMode = document.getElementById('customMode')
  const presetContent = document.getElementById('presetContent')
  const customContent = document.getElementById('customContent')
  
  presetMode.addEventListener('click', () => {
    presetMode.classList.add('bg-blue-600', 'text-white')
    presetMode.classList.remove('text-gray-400')
    customMode.classList.remove('bg-blue-600', 'text-white')
    customMode.classList.add('text-gray-400')
    
    presetContent.classList.remove('hidden')
    customContent.classList.add('hidden')
  })
  
  customMode.addEventListener('click', () => {
    customMode.classList.add('bg-blue-600', 'text-white')
    customMode.classList.remove('text-gray-400')
    presetMode.classList.remove('bg-blue-600', 'text-white')
    presetMode.classList.add('text-gray-400')
    
    customContent.classList.remove('hidden')
    presetContent.classList.add('hidden')
  })
  
  // Initialize renderers
  window.shaderRenderer = new ShaderRenderer('shaderCanvas')
  window.customShaderEditor = new CustomShaderEditor()
})

// Initialize Alpine
Alpine.start()