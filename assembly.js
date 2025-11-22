import{m}from"./module.esm.js";class l{constructor(){this.currentMode="x86",this.x86Editor=null,this.armEditor=null,this.registers={x86:{EAX:0,EBX:0,ECX:0,EDX:0,ESP:2147483647,EBP:0,ESI:0,EDI:0,EIP:0},arm:{R0:0,R1:0,R2:0,R3:0,R4:0,R5:0,R6:0,R7:0,SP:2147483647,LR:0,PC:0}},this.init()}init(){this.setupEditors(),this.setupEventListeners()}setupEditors(){const e={theme:"monokai",lineNumbers:!0,lineWrapping:!1,autoCloseBrackets:!0,matchBrackets:!0,indentUnit:4,tabSize:4,gutters:["CodeMirror-linenumbers"],extraKeys:{Tab:function(t){t.somethingSelected()?t.indentSelection("add"):t.replaceSelection("    ","end")}}};typeof CodeMirror<"u"&&(this.x86Editor=CodeMirror.fromTextArea(document.getElementById("x86Editor"),{...e,mode:"gas"}),this.armEditor=CodeMirror.fromTextArea(document.getElementById("armEditor"),{...e,mode:"gas"}),this.x86Editor.setValue(`section .text
    global _start

_start:
    mov eax, 42      ; Load value into EAX
    add eax, 8       ; Add 8 to EAX
    mov ebx, eax     ; Copy result to EBX
    int 0x80         ; System call`),this.armEditor.setValue(`.section .text
.global _start

_start:
    mov r0, #42        @ Load immediate value
    add r1, r0, #8     @ Add 8 to r0, store in r1
    mov r2, r1         @ Copy result to r2
    swi 0x0            @ Software interrupt`))}setupEventListeners(){document.getElementById("x86Compiler").addEventListener("click",()=>{this.switchMode("x86")}),document.getElementById("armAssembler").addEventListener("click",()=>{this.switchMode("arm")}),document.getElementById("x86CompileBtn").addEventListener("click",()=>{this.compile("x86")}),document.getElementById("x86RunBtn").addEventListener("click",()=>{this.run("x86")}),document.getElementById("armAssembleBtn").addEventListener("click",()=>{this.compile("arm")}),document.getElementById("armRunBtn").addEventListener("click",()=>{this.run("arm")}),document.querySelectorAll(".arm-template").forEach(e=>{e.addEventListener("click",t=>{const r=t.target.dataset.template;this.loadARMTemplate(r)})})}switchMode(e){this.currentMode=e,document.querySelectorAll(".tool-btn").forEach(t=>{t.classList.remove("bg-orange-600","text-white"),t.classList.add("text-gray-400")}),e==="x86"?(document.getElementById("x86Compiler").classList.add("bg-orange-600","text-white"),document.getElementById("x86Compiler").classList.remove("text-gray-400"),document.getElementById("x86Content").classList.remove("hidden"),document.getElementById("armContent").classList.add("hidden")):(document.getElementById("armAssembler").classList.add("bg-orange-600","text-white"),document.getElementById("armAssembler").classList.remove("text-gray-400"),document.getElementById("armContent").classList.remove("hidden"),document.getElementById("x86Content").classList.add("hidden"))}compile(e){const t=e==="x86"?this.x86Editor.getValue():this.armEditor.getValue(),r=document.getElementById(`${e}Output`),s=document.getElementById(`${e}Status`),o=document.getElementById(`${e}InstructionCount`),i=document.getElementById(`${e}ErrorCount`);r.innerHTML='<div class="text-yellow-400">🔄 Compiling...</div>',s.textContent="Compiling",s.className="text-yellow-400",setTimeout(()=>{const n=t.split(`
`).filter(d=>d.trim()&&!d.trim().startsWith(";")&&!d.trim().startsWith("@")),a=this.validateCode(t,e);a.length>0?(r.innerHTML=`<div class="text-red-400">❌ Compilation failed:</div><pre class="text-red-300 mt-2">${a.join(`
`)}</pre>`,s.textContent="Failed",s.className="text-red-400",o.textContent="0",i.textContent=a.length.toString()):(r.innerHTML=`<div class="text-green-400">✅ Compilation successful!</div>
          <div class="text-gray-300 mt-2">Compiled ${n.length} instructions</div>
          <div class="text-gray-400 mt-1 text-sm">Ready to run...</div>`,s.textContent="Ready",s.className="text-green-400",o.textContent=n.length.toString(),i.textContent="0")},500)}validateCode(e,t){const r=[];return e.split(`
`).forEach((o,i)=>{const n=o.trim();!n||n.startsWith(";")||n.startsWith("@")||(t==="x86"?n.match(/^(mov|add|sub|mul|div|int|jmp|call|push|pop|cmp|test|and|or|xor|not|neg|inc|dec|lea|nop)\s/i)||r.push(`Line ${i+1}: Unknown instruction '${n}'`):n.match(/^(mov|add|sub|mul|div|swi|b|bl|push|pop|cmp|tst|and|orr|eor|mvn|neg|ldr|str)\s/i)||r.push(`Line ${i+1}: Unknown instruction '${n}'`))}),r}run(e){this.compile(e),setTimeout(()=>{const t=document.getElementById(`${e}Output`),r=document.getElementById(`${e}Status`);t.innerHTML+='<div class="text-blue-400 mt-2">🚀 Running program...</div>',r.textContent="Running",r.className="text-blue-400",this.simulateExecution(e)},1e3)}simulateExecution(e){const r=(e==="x86"?this.x86Editor:this.armEditor).getValue().split(`
`).filter(s=>s.trim()&&!s.trim().startsWith(";")&&!s.trim().startsWith("@"));this.resetRegisters(e),r.forEach((s,o)=>{setTimeout(()=>{this.executeInstruction(s,e),this.updateCurrentInstruction(s,e)},o*300)}),setTimeout(()=>{const s=document.getElementById(`${e}Output`),o=document.getElementById(`${e}Status`);s.innerHTML+='<div class="text-green-400 mt-2">✅ Program execution completed</div>',o.textContent="Completed",o.className="text-green-400",this.showFinalState(e)},r.length*300)}executeInstruction(e,t){if(t==="x86")if(e.match(/mov\s+eax,\s*(\d+)/i)){const r=parseInt(RegExp.$1);this.registers.x86.EAX=r,this.updateRegisterDisplay("x86")}else if(e.match(/add\s+eax,\s*(\d+)/i)){const r=parseInt(RegExp.$1);this.registers.x86.EAX+=r,this.updateRegisterDisplay("x86")}else e.match(/mov\s+ebx,\s*eax/i)&&(this.registers.x86.EBX=this.registers.x86.EAX,this.updateRegisterDisplay("x86"));else if(e.match(/mov\s+r0,\s*#(\d+)/i)){const r=parseInt(RegExp.$1);this.registers.arm.R0=r,this.updateRegisterDisplay("arm")}else if(e.match(/add\s+r1,\s*r0,\s*#(\d+)/i)){const r=parseInt(RegExp.$1);this.registers.arm.R1=this.registers.arm.R0+r,this.updateRegisterDisplay("arm")}else e.match(/mov\s+r2,\s*r1/i)&&(this.registers.arm.R2=this.registers.arm.R1,this.updateRegisterDisplay("arm"))}updateCurrentInstruction(e,t){const r=document.getElementById("currentInstruction");r&&(r.innerHTML=`<div class="text-green-400">Executing:</div><div class="text-white">${e.trim()}</div>`)}resetRegisters(e){e==="x86"?Object.keys(this.registers.x86).forEach(t=>{this.registers.x86[t]=t==="ESP"?2147483647:0}):Object.keys(this.registers.arm).forEach(t=>{this.registers.arm[t]=t==="SP"?2147483647:0}),this.updateRegisterDisplay(e)}updateRegisterDisplay(e){const t=this.registers[e];e==="x86"?(document.getElementById("regEAX").textContent=`0x${t.EAX.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regEBX").textContent=`0x${t.EBX.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regECX").textContent=`0x${t.ECX.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regEDX").textContent=`0x${t.EDX.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regESP").textContent=`0x${t.ESP.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regEBP").textContent=`0x${t.EBP.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regESI").textContent=`0x${t.ESI.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regEDI").textContent=`0x${t.EDI.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("regEIP").textContent=`0x${t.EIP.toString(16).padStart(8,"0").toUpperCase()}`):(document.getElementById("armR0").textContent=`0x${t.R0.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR1").textContent=`0x${t.R1.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR2").textContent=`0x${t.R2.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR3").textContent=`0x${t.R3.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR4").textContent=`0x${t.R4.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR5").textContent=`0x${t.R5.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR6").textContent=`0x${t.R6.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armR7").textContent=`0x${t.R7.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armSP").textContent=`0x${t.SP.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armLR").textContent=`0x${t.LR.toString(16).padStart(8,"0").toUpperCase()}`,document.getElementById("armPC").textContent=`0x${t.PC.toString(16).padStart(8,"0").toUpperCase()}`)}showFinalState(e){const t=document.getElementById(`${e}Output`),r=this.registers[e];t.innerHTML+='<div class="text-gray-400 mt-4">📊 Final Register State:</div>',e==="x86"?t.innerHTML+=`<div class="font-mono text-sm mt-2">
        EAX: 0x${r.EAX.toString(16).padStart(8,"0").toUpperCase()} (${r.EAX})<br>
        EBX: 0x${r.EBX.toString(16).padStart(8,"0").toUpperCase()} (${r.EBX})
      </div>`:t.innerHTML+=`<div class="font-mono text-sm mt-2">
        R0: 0x${r.R0.toString(16).padStart(8,"0").toUpperCase()} (${r.R0})<br>
        R1: 0x${r.R1.toString(16).padStart(8,"0").toUpperCase()} (${r.R1})<br>
        R2: 0x${r.R2.toString(16).padStart(8,"0").toUpperCase()} (${r.R2})
      </div>`}loadARMTemplate(e){const t={basic:`.section .text
.global _start

_start:
    mov r0, #10        @ Load 10 into r0
    mov r1, #20        @ Load 20 into r1
    add r2, r0, r1     @ r2 = r0 + r1 (30)
    sub r3, r1, r0     @ r3 = r1 - r0 (10)
    mul r4, r0, r1     @ r4 = r0 * r1 (200)
    swi 0x0            @ Exit`,loop:`.section .text
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
    
    swi 0x0            @ Exit (r2 contains sum 0+1+2+3+4 = 10)`,fibonacci:`.section .text
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
    
    swi 0x0            @ Exit (r1 contains F(8) = 21)`,memory:`.section .data
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
    
    swi 0x0            @ Exit`};t[e]&&this.armEditor&&this.armEditor.setValue(t[e])}}document.addEventListener("DOMContentLoaded",()=>{window.assemblyTools=new l});m.start();
//# sourceMappingURL=assembly.js.map
