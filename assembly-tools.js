import Alpine from 'alpinejs'

class AssemblyTools {
  constructor() {
    this.currentMode = 'x86'
    this.x86Editor = null
    this.armEditor = null
    this.registers = {
      x86: {
        EAX: 0x00000000,
        EBX: 0x00000000,
        ECX: 0x00000000,
        EDX: 0x00000000,
        ESP: 0x7FFFFFFF,
        EBP: 0x00000000,
        ESI: 0x00000000,
        EDI: 0x00000000,
        EIP: 0x00000000
      },
      arm: {
        R0: 0x00000000,
        R1: 0x00000000,
        R2: 0x00000000,
        R3: 0x00000000,
        R4: 0x00000000,
        R5: 0x00000000,
        R6: 0x00000000,
        R7: 0x00000000,
        SP: 0x7FFFFFFF,
        LR: 0x00000000,
        PC: 0x00000000
      }
    }
    
    this.init()
  }
  
  init() {
    this.setupEditors()
    this.setupEventListeners()
  }
  
  setupEditors() {
    // Standard CodeMirror configuration
    const editorConfig = {
      theme: 'monokai',
      lineNumbers: true,
      lineWrapping: false,
      autoCloseBrackets: true,
      matchBrackets: true,
      indentUnit: 4,
      tabSize: 4,
      gutters: ['CodeMirror-linenumbers'],
      extraKeys: {
        'Tab': function(cm) {
          if (cm.somethingSelected()) {
            cm.indentSelection('add')
          } else {
            cm.replaceSelection('    ', 'end')
          }
        }
      }
    }
    
    // Initialize CodeMirror editors
    if (typeof CodeMirror !== 'undefined') {
      this.x86Editor = CodeMirror.fromTextArea(document.getElementById('x86Editor'), {
        ...editorConfig,
        mode: 'gas'
      })
      this.armEditor = CodeMirror.fromTextArea(document.getElementById('armEditor'), {
        ...editorConfig,
        mode: 'gas'
      })
      
      // Set default code
      this.x86Editor.setValue(`section .text
    global _start

_start:
    mov eax, 42      ; Load value into EAX
    add eax, 8       ; Add 8 to EAX
    mov ebx, eax     ; Copy result to EBX
    int 0x80         ; System call`)
      
      this.armEditor.setValue(`.section .text
.global _start

_start:
    mov r0, #42        @ Load immediate value
    add r1, r0, #8     @ Add 8 to r0, store in r1
    mov r2, r1         @ Copy result to r2
    swi 0x0            @ Software interrupt`)
    }
  }
  
  setupEventListeners() {
    // Tool switching
    document.getElementById('x86Compiler').addEventListener('click', () => {
      this.switchMode('x86')
    })
    
    document.getElementById('armAssembler').addEventListener('click', () => {
      this.switchMode('arm')
    })
    
    // x86 controls
    document.getElementById('x86CompileBtn').addEventListener('click', () => {
      this.compile('x86')
    })
    
    document.getElementById('x86RunBtn').addEventListener('click', () => {
      this.run('x86')
    })
    
    // ARM controls
    document.getElementById('armAssembleBtn').addEventListener('click', () => {
      this.compile('arm')
    })
    
    document.getElementById('armRunBtn').addEventListener('click', () => {
      this.run('arm')
    })
    
    // ARM template buttons
    document.querySelectorAll('.arm-template').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const template = e.target.dataset.template
        this.loadARMTemplate(template)
      })
    })
  }
  
  switchMode(mode) {
    this.currentMode = mode
    
    // Update UI
    document.querySelectorAll('.tool-btn').forEach(btn => {
      btn.classList.remove('bg-orange-600', 'text-white')
      btn.classList.add('text-gray-400')
    })
    
    if (mode === 'x86') {
      document.getElementById('x86Compiler').classList.add('bg-orange-600', 'text-white')
      document.getElementById('x86Compiler').classList.remove('text-gray-400')
      document.getElementById('x86Content').classList.remove('hidden')
      document.getElementById('armContent').classList.add('hidden')
    } else {
      document.getElementById('armAssembler').classList.add('bg-orange-600', 'text-white')
      document.getElementById('armAssembler').classList.remove('text-gray-400')
      document.getElementById('armContent').classList.remove('hidden')
      document.getElementById('x86Content').classList.add('hidden')
    }
  }
  
  compile(arch) {
    const code = arch === 'x86' ? this.x86Editor.getValue() : this.armEditor.getValue()
    const output = document.getElementById(`${arch}Output`)
    const status = document.getElementById(`${arch}Status`)
    const instructionCount = document.getElementById(`${arch}InstructionCount`)
    const errorCount = document.getElementById(`${arch}ErrorCount`)
    
    output.innerHTML = '<div class="text-yellow-400">🔄 Compiling...</div>'
    status.textContent = 'Compiling'
    status.className = 'text-yellow-400'
    
    // Simulate compilation
    setTimeout(() => {
      const lines = code.split('\n').filter(line => line.trim() && !line.trim().startsWith(';') && !line.trim().startsWith('@'))
      const errors = this.validateCode(code, arch)
      
      if (errors.length > 0) {
        output.innerHTML = `<div class="text-red-400">❌ Compilation failed:</div><pre class="text-red-300 mt-2">${errors.join('\n')}</pre>`
        status.textContent = 'Failed'
        status.className = 'text-red-400'
        instructionCount.textContent = '0'
        errorCount.textContent = errors.length.toString()
      } else {
        output.innerHTML = `<div class="text-green-400">✅ Compilation successful!</div>
          <div class="text-gray-300 mt-2">Compiled ${lines.length} instructions</div>
          <div class="text-gray-400 mt-1 text-sm">Ready to run...</div>`
        status.textContent = 'Ready'
        status.className = 'text-green-400'
        instructionCount.textContent = lines.length.toString()
        errorCount.textContent = '0'
      }
    }, 500)
  }
  
  validateCode(code, arch) {
    const errors = []
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith(';') || trimmed.startsWith('@')) return
      
      // Basic validation
      if (arch === 'x86') {
        if (!trimmed.match(/^(mov|add|sub|mul|div|int|jmp|call|push|pop|cmp|test|and|or|xor|not|neg|inc|dec|lea|nop)\s/i)) {
          errors.push(`Line ${index + 1}: Unknown instruction '${trimmed}'`)
        }
      } else {
        if (!trimmed.match(/^(mov|add|sub|mul|div|swi|b|bl|push|pop|cmp|tst|and|orr|eor|mvn|neg|ldr|str)\s/i)) {
          errors.push(`Line ${index + 1}: Unknown instruction '${trimmed}'`)
        }
      }
    })
    
    return errors
  }
  
  run(arch) {
    this.compile(arch)
    
    setTimeout(() => {
      const output = document.getElementById(`${arch}Output`)
      const status = document.getElementById(`${arch}Status`)
      
      output.innerHTML += '<div class="text-blue-400 mt-2">🚀 Running program...</div>'
      status.textContent = 'Running'
      status.className = 'text-blue-400'
      
      // Simulate execution
      this.simulateExecution(arch)
    }, 1000)
  }
  
  simulateExecution(arch) {
    const editor = arch === 'x86' ? this.x86Editor : this.armEditor
    const lines = editor.getValue().split('\n').filter(line => line.trim() && !line.trim().startsWith(';') && !line.trim().startsWith('@'))
    
    this.resetRegisters(arch)
    
    lines.forEach((line, index) => {
      setTimeout(() => {
        this.executeInstruction(line, arch)
        this.updateCurrentInstruction(line, arch)
      }, index * 300)
    })
    
    setTimeout(() => {
      const output = document.getElementById(`${arch}Output`)
      const status = document.getElementById(`${arch}Status`)
      
      output.innerHTML += '<div class="text-green-400 mt-2">✅ Program execution completed</div>'
      status.textContent = 'Completed'
      status.className = 'text-green-400'
      
      this.showFinalState(arch)
    }, lines.length * 300)
  }
  
  executeInstruction(instruction, arch) {
    // Simple instruction simulation
    if (arch === 'x86') {
      if (instruction.match(/mov\s+eax,\s*(\d+)/i)) {
        const value = parseInt(RegExp.$1)
        this.registers.x86.EAX = value
        this.updateRegisterDisplay('x86')
      } else if (instruction.match(/add\s+eax,\s*(\d+)/i)) {
        const value = parseInt(RegExp.$1)
        this.registers.x86.EAX += value
        this.updateRegisterDisplay('x86')
      } else if (instruction.match(/mov\s+ebx,\s*eax/i)) {
        this.registers.x86.EBX = this.registers.x86.EAX
        this.updateRegisterDisplay('x86')
      }
    } else {
      if (instruction.match(/mov\s+r0,\s*#(\d+)/i)) {
        const value = parseInt(RegExp.$1)
        this.registers.arm.R0 = value
        this.updateRegisterDisplay('arm')
      } else if (instruction.match(/add\s+r1,\s*r0,\s*#(\d+)/i)) {
        const value = parseInt(RegExp.$1)
        this.registers.arm.R1 = this.registers.arm.R0 + value
        this.updateRegisterDisplay('arm')
      } else if (instruction.match(/mov\s+r2,\s*r1/i)) {
        this.registers.arm.R2 = this.registers.arm.R1
        this.updateRegisterDisplay('arm')
      }
    }
  }
  
  updateCurrentInstruction(instruction, arch) {
    const currentInstDiv = document.getElementById('currentInstruction')
    if (currentInstDiv) {
      currentInstDiv.innerHTML = `<div class="text-green-400">Executing:</div><div class="text-white">${instruction.trim()}</div>`
    }
  }
  
  resetRegisters(arch) {
    if (arch === 'x86') {
      Object.keys(this.registers.x86).forEach(reg => {
        this.registers.x86[reg] = reg === 'ESP' ? 0x7FFFFFFF : 0x00000000
      })
    } else {
      Object.keys(this.registers.arm).forEach(reg => {
        this.registers.arm[reg] = reg === 'SP' ? 0x7FFFFFFF : 0x00000000
      })
    }
    this.updateRegisterDisplay(arch)
  }
  
  updateRegisterDisplay(arch) {
    const regs = this.registers[arch]
    
    if (arch === 'x86') {
      document.getElementById('regEAX').textContent = `0x${regs.EAX.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regEBX').textContent = `0x${regs.EBX.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regECX').textContent = `0x${regs.ECX.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regEDX').textContent = `0x${regs.EDX.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regESP').textContent = `0x${regs.ESP.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regEBP').textContent = `0x${regs.EBP.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regESI').textContent = `0x${regs.ESI.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regEDI').textContent = `0x${regs.EDI.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('regEIP').textContent = `0x${regs.EIP.toString(16).padStart(8, '0').toUpperCase()}`
    } else {
      document.getElementById('armR0').textContent = `0x${regs.R0.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR1').textContent = `0x${regs.R1.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR2').textContent = `0x${regs.R2.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR3').textContent = `0x${regs.R3.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR4').textContent = `0x${regs.R4.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR5').textContent = `0x${regs.R5.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR6').textContent = `0x${regs.R6.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armR7').textContent = `0x${regs.R7.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armSP').textContent = `0x${regs.SP.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armLR').textContent = `0x${regs.LR.toString(16).padStart(8, '0').toUpperCase()}`
      document.getElementById('armPC').textContent = `0x${regs.PC.toString(16).padStart(8, '0').toUpperCase()}`
    }
  }
  
  showFinalState(arch) {
    const output = document.getElementById(`${arch}Output`)
    const regs = this.registers[arch]
    
    output.innerHTML += '<div class="text-gray-400 mt-4">📊 Final Register State:</div>'
    
    if (arch === 'x86') {
      output.innerHTML += `<div class="font-mono text-sm mt-2">
        EAX: 0x${regs.EAX.toString(16).padStart(8, '0').toUpperCase()} (${regs.EAX})<br>
        EBX: 0x${regs.EBX.toString(16).padStart(8, '0').toUpperCase()} (${regs.EBX})
      </div>`
    } else {
      output.innerHTML += `<div class="font-mono text-sm mt-2">
        R0: 0x${regs.R0.toString(16).padStart(8, '0').toUpperCase()} (${regs.R0})<br>
        R1: 0x${regs.R1.toString(16).padStart(8, '0').toUpperCase()} (${regs.R1})<br>
        R2: 0x${regs.R2.toString(16).padStart(8, '0').toUpperCase()} (${regs.R2})
      </div>`
    }
  }
  
  loadARMTemplate(template) {
    const templates = {
      basic: `.section .text
.global _start

_start:
    mov r0, #10        @ Load 10 into r0
    mov r1, #20        @ Load 20 into r1
    add r2, r0, r1     @ r2 = r0 + r1 (30)
    sub r3, r1, r0     @ r3 = r1 - r0 (10)
    mul r4, r0, r1     @ r4 = r0 * r1 (200)
    swi 0x0            @ Exit`,
      
      loop: `.section .text
.global _start

_start:
    mov r0, #0         @ Initialize counter
    mov r1, #5         @ Loop count
    mov r2, #0         @ Sum accumulator

loop:
    add r2, r2, r0     @ Add counter to sum
    add r0, r0, #1     @ Increment counter
    cmp r0, r1         @ Compare counter with loop count
    blt loop           @ Branch if less than
    
    swi 0x0            @ Exit (r2 contains sum 0+1+2+3+4 = 10)`,
      
      fibonacci: `.section .text
.global _start

_start:
    mov r0, #0         @ F(0)
    mov r1, #1         @ F(1)
    mov r2, #8         @ Calculate first 8 numbers
    mov r3, #2         @ Counter

fib_loop:
    add r4, r0, r1     @ Next fibonacci number
    mov r0, r1         @ Shift: F(n-2) = F(n-1)
    mov r1, r4         @ Shift: F(n-1) = F(n)
    add r3, r3, #1     @ Increment counter
    cmp r3, r2         @ Compare with target
    ble fib_loop        @ Continue if less or equal
    
    swi 0x0            @ Exit (r1 contains F(8) = 21)`,
      
      memory: `.section .data
value: .word 42
result: .word 0

.section .text
.global _start

_start:
    ldr r0, =value     @ Load address of value
    ldr r1, [r0]       @ Load value (42) into r1
    add r1, r1, #8     @ Add 8 to r1 (50)
    ldr r0, =result    @ Load address of result
    str r1, [r0]       @ Store r1 into result
    ldr r2, [r0]       @ Load result back into r2
    
    swi 0x0            @ Exit`
    }
    
    if (templates[template] && this.armEditor) {
      this.armEditor.setValue(templates[template])
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.assemblyTools = new AssemblyTools()
})

// Initialize Alpine
Alpine.start()