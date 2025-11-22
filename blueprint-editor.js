import Alpine from 'alpinejs'

class BlueprintEditor {
  constructor() {
    this.canvas = document.getElementById('canvas')
    this.connectionSvg = document.getElementById('connectionSvg')
    this.tempConnectionSvg = document.getElementById('tempConnectionSvg')
    this.selectionBox = document.getElementById('selectionBox')
    this.nodes = []
    this.connections = []
    this.groups = []
    this.customComponents = []
    this.selectedNodes = new Set()
    this.selectedGroup = null
    this.isDragging = false
    this.isConnecting = false
    this.isSelecting = false
    this.isDraggingConnection = false
    this.connectionStart = null
    this.tempConnectionEnd = null
    this.nodeIdCounter = 0
    this.groupIdCounter = 0
    this.currentLanguage = 'javascript'
    this.mode = 'normal' // 'normal' or 'select'
    
    this.nodeTypes = {
      input: {
        name: 'Input',
        inputs: [],
        outputs: ['value'],
        color: 'blue',
        generateCode: (node, lang) => {
          if (lang === 'javascript') return `const input = prompt("Enter value:");`
          if (lang === 'python') return `input_value = input("Enter value: ")`
          if (lang === 'cpp') return `std::cout << "Enter value: "; std::cin >> input;`
          if (lang === 'rust') return `let mut input = String::new();\n    io::stdin().read_line(&mut input).unwrap();`
          return `// Input node`
        }
      },
      output: {
        name: 'Output',
        inputs: ['value'],
        outputs: [],
        color: 'green',
        generateCode: (node, lang) => {
          const input = this.getConnectedInput(node, 'value')
          if (lang === 'javascript') return `console.log(${input});`
          if (lang === 'python') return `print(${input})`
          if (lang === 'cpp') return `std::cout << ${input} << std::endl;`
          if (lang === 'rust') return `println!("{}", ${input});`
          return `// Output node`
        }
      },
      if: {
        name: 'If Statement',
        inputs: ['condition', 'true', 'false'],
        outputs: ['result'],
        color: 'purple',
        generateCode: (node, lang) => {
          const condition = this.getConnectedInput(node, 'condition')
          const trueBranch = this.getConnectedInput(node, 'true')
          const falseBranch = this.getConnectedInput(node, 'false')
          if (lang === 'javascript') return `if (${condition}) {\n    ${trueBranch}\n} else {\n    ${falseBranch}\n}`
          if (lang === 'python') return `if ${condition}:\n    ${trueBranch}\nelse:\n    ${falseBranch}`
          if (lang === 'cpp') return `if (${condition}) {\n    ${trueBranch}\n} else {\n    ${falseBranch}\n}`
          if (lang === 'rust') return `if ${condition} {\n    ${trueBranch}\n} else {\n    ${falseBranch}\n}`
          return `// If statement`
        }
      },
      loop: {
        name: 'Loop',
        inputs: ['condition', 'body'],
        outputs: ['result'],
        color: 'orange',
        generateCode: (node, lang) => {
          const condition = this.getConnectedInput(node, 'condition')
          const body = this.getConnectedInput(node, 'body')
          if (lang === 'javascript') return `while (${condition}) {\n    ${body}\n}`
          if (lang === 'python') return `while ${condition}:\n    ${body}`
          if (lang === 'cpp') return `while (${condition}) {\n    ${body}\n}`
          if (lang === 'rust') return `while ${condition} {\n    ${body}\n}`
          return `// Loop`
        }
      },
      add: {
        name: 'Add',
        inputs: ['a', 'b'],
        outputs: ['result'],
        color: 'cyan',
        generateCode: (node, lang) => {
          const a = this.getConnectedInput(node, 'a')
          const b = this.getConnectedInput(node, 'b')
          return `(${a} + ${b})`
        }
      },
      multiply: {
        name: 'Multiply',
        inputs: ['a', 'b'],
        outputs: ['result'],
        color: 'pink',
        generateCode: (node, lang) => {
          const a = this.getConnectedInput(node, 'a')
          const b = this.getConnectedInput(node, 'b')
          return `(${a} * ${b})`
        }
      },
      compare: {
        name: 'Compare',
        inputs: ['a', 'b'],
        outputs: ['result'],
        color: 'yellow',
        generateCode: (node, lang) => {
          const a = this.getConnectedInput(node, 'a')
          const b = this.getConnectedInput(node, 'b')
          return `(${a} == ${b})`
        }
      },
      variable: {
        name: 'Variable',
        inputs: [],
        outputs: ['value'],
        color: 'indigo',
        generateCode: (node, lang) => {
          const varName = node.data.name || 'variable'
          if (lang === 'javascript') return varName
          if (lang === 'python') return varName
          if (lang === 'cpp') return varName
          if (lang === 'rust') return `&${varName}`
          return varName
        }
      },
      assign: {
        name: 'Assign',
        inputs: ['variable', 'value'],
        outputs: ['result'],
        color: 'teal',
        generateCode: (node, lang) => {
          const variable = this.getConnectedInput(node, 'variable')
          const value = this.getConnectedInput(node, 'value')
          if (lang === 'javascript') return `${variable} = ${value};`
          if (lang === 'python') return `${variable} = ${value}`
          if (lang === 'cpp') return `${variable} = ${value};`
          if (lang === 'rust') return `let ${variable} = ${value};`
          return `${variable} = ${value}`
        }
      }
    }
    
    this.init()
  }
  
  init() {
    this.setupEventListeners()
    this.updateStats()
  }
  
  setupEventListeners() {
    // Drag and drop for node templates
    document.querySelectorAll('.node-template').forEach(template => {
      template.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('nodeType', template.dataset.type)
      })
    })
    
    // Canvas events
    this.setupCanvasEvents()
    
    // Toolbar buttons
    document.getElementById('clearCanvas').addEventListener('click', () => {
      this.clearCanvas()
    })
    
    document.getElementById('autoLayout').addEventListener('click', () => {
      this.autoLayout()
    })
    
    document.getElementById('selectMode').addEventListener('click', () => {
      this.toggleSelectMode()
    })
    
    document.getElementById('createFunction').addEventListener('click', () => {
      this.createFunctionFromSelection()
    })
    
    document.getElementById('generateCode').addEventListener('click', () => {
      this.generateCode()
    })
    
    document.getElementById('exportCode').addEventListener('click', () => {
      this.exportCode()
    })
    
    document.getElementById('copyCode').addEventListener('click', () => {
      this.copyCode()
    })
    
    document.getElementById('downloadCode').addEventListener('click', () => {
      this.downloadCode()
    })
    
    document.getElementById('languageSelect').addEventListener('change', (e) => {
      this.currentLanguage = e.target.value
      this.generateCode()
    })
  }
  
  setupCanvasEvents() {
    // Drag and drop
    this.canvas.addEventListener('dragover', (e) => {
      e.preventDefault()
      this.canvas.classList.add('border-blue-500', 'bg-blue-900/10')
    })
    
    this.canvas.addEventListener('dragleave', () => {
      this.canvas.classList.remove('border-blue-500', 'bg-blue-900/10')
    })
    
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault()
      this.canvas.classList.remove('border-blue-500', 'bg-blue-900/10')
      
      const nodeType = e.dataTransfer.getData('nodeType')
      const rect = this.canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      this.createNode(nodeType, x, y)
    })
    
    // Mouse events for selection and connections
    this.canvas.addEventListener('mousedown', (e) => {
      if (e.target === this.canvas) {
        if (this.mode === 'select') {
          this.startSelection(e)
        } else {
          this.deselectAll()
        }
      }
    })
    
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.isSelecting) {
        this.updateSelection(e)
      } else if (this.isConnecting && this.tempConnectionEnd) {
        this.updateTempConnection(e)
      }
    })
    
    this.canvas.addEventListener('mouseup', (e) => {
      if (this.isSelecting) {
        this.endSelection(e)
      }
    })
    
    // Global mouse up for connection dragging
    document.addEventListener('mouseup', () => {
      if (this.isConnecting) {
        this.cancelConnection()
      }
    })
  }
  
  createNode(type, x, y) {
    const nodeType = this.nodeTypes[type]
    if (!nodeType) return
    
    const nodeId = `node_${this.nodeIdCounter++}`
    const node = {
      id: nodeId,
      type: type,
      x: x,
      y: y,
      data: { name: `${type}_${this.nodeIdCounter}` }
    }
    
    this.nodes.push(node)
    
    // Create node element
    const nodeElement = document.createElement('div')
    nodeElement.id = nodeId
    nodeElement.className = `absolute bg-${nodeType.color}-600/20 border border-${nodeType.color}-500/30 rounded-lg p-3 cursor-move select-none`
    nodeElement.style.left = `${x - 60}px`
    nodeElement.style.top = `${y - 25}px`
    nodeElement.style.width = '120px'
    nodeElement.style.zIndex = '10'
    
    // Node header
    const header = document.createElement('div')
    header.className = 'flex items-center justify-between mb-2'
    header.innerHTML = `
      <span class="text-sm font-semibold text-${nodeType.color}-400">${nodeType.name}</span>
      <button class="text-red-400 hover:text-red-300 text-xs" onclick="blueprintEditor.removeNode('${nodeId}')">×</button>
    `
    
    // Node ports
    const portsContainer = document.createElement('div')
    portsContainer.className = 'space-y-1'
    
    // Input ports
    nodeType.inputs.forEach((input, index) => {
      const port = document.createElement('div')
      port.className = 'flex items-center gap-2'
      port.innerHTML = `
        <div class="w-3 h-3 bg-${nodeType.color}-500 rounded-full cursor-pointer port-input" 
             data-node="${nodeId}" data-port="${input}" data-type="input"></div>
        <span class="text-xs text-gray-400">${input}</span>
      `
      portsContainer.appendChild(port)
    })
    
    // Output ports
    nodeType.outputs.forEach((output, index) => {
      const port = document.createElement('div')
      port.className = 'flex items-center justify-end gap-2'
      port.innerHTML = `
        <span class="text-xs text-gray-400">${output}</span>
        <div class="w-3 h-3 bg-${nodeType.color}-500 rounded-full cursor-pointer port-output" 
             data-node="${nodeId}" data-port="${output}" data-type="output"></div>
      `
      portsContainer.appendChild(port)
    })
    
    nodeElement.appendChild(header)
    nodeElement.appendChild(portsContainer)
    
    // Add to canvas
    this.canvas.appendChild(nodeElement)
    
    // Make node draggable
    this.makeNodeDraggable(nodeElement, node)
    
    // Add port event listeners
    this.setupPortEventListeners(nodeElement)
    
    // Hide placeholder
    const placeholder = document.getElementById('canvasPlaceholder')
    if (placeholder) {
      placeholder.style.display = 'none'
    }
    
    this.updateStats()
  }
  
  makeNodeDraggable(element, node) {
    let isDragging = false
    let startX, startY, initialX, initialY
    
    const header = element.querySelector('.flex')
    
    header.addEventListener('mousedown', (e) => {
      isDragging = true
      startX = e.clientX
      startY = e.clientY
      initialX = node.x
      initialY = node.y
      element.style.zIndex = '1000'
      e.preventDefault()
      e.stopPropagation()
    })
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return
      
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      
      node.x = initialX + dx
      node.y = initialY + dy
      
      element.style.left = `${node.x - 60}px`
      element.style.top = `${node.y - 25}px`
      
      this.updateConnections()
    })
    
    document.addEventListener('mouseup', () => {
      isDragging = false
      element.style.zIndex = '10'
    })
  }
  
  setupPortEventListeners(nodeElement) {
    const ports = nodeElement.querySelectorAll('.port-input, .port-output')
    
    ports.forEach(port => {
      port.addEventListener('mousedown', (e) => {
        e.stopPropagation()
        this.handlePortMouseDown(port, e)
      })
      
      port.addEventListener('mouseup', (e) => {
        e.stopPropagation()
        this.handlePortMouseUp(port, e)
      })
      
      port.addEventListener('mouseenter', (e) => {
        if (this.isConnecting) {
          this.tempConnectionEnd = port
        }
      })
    })
  }
  
  handlePortMouseDown(port, e) {
    const nodeId = port.dataset.node
    const portName = port.dataset.port
    const portType = port.dataset.type
    
    if (portType === 'output') {
      this.isConnecting = true
      this.connectionStart = { nodeId, portName, element: port }
      port.classList.add('ring-2', 'ring-white')
    }
  }
  
  handlePortMouseUp(port, e) {
    const nodeId = port.dataset.node
    const portName = port.dataset.port
    const portType = port.dataset.type
    
    if (this.isConnecting && portType === 'input' && this.connectionStart.nodeId !== nodeId) {
      this.createConnection(this.connectionStart, { nodeId, portName, element: port })
      this.cancelConnection()
    }
  }
  
  updateTempConnection(e) {
    if (!this.connectionStart || !this.tempConnectionEnd) return
    
    const startRect = this.connectionStart.element.getBoundingClientRect()
    const endRect = this.tempConnectionEnd.getBoundingClientRect()
    const canvasRect = this.canvas.getBoundingClientRect()
    
    const startX = startRect.left + startRect.width / 2 - canvasRect.left
    const startY = startRect.top + startRect.height / 2 - canvasRect.top
    const endX = e.clientX - canvasRect.left
    const endY = e.clientY - canvasRect.top
    
    const tempLine = document.getElementById('tempLine')
    tempLine.setAttribute('x1', startX)
    tempLine.setAttribute('y1', startY)
    tempLine.setAttribute('x2', endX)
    tempLine.setAttribute('y2', endY)
    tempLine.style.display = 'block'
  }
  
  cancelConnection() {
    if (this.connectionStart) {
      this.connectionStart.element.classList.remove('ring-2', 'ring-white')
    }
    
    const tempLine = document.getElementById('tempLine')
    tempLine.style.display = 'none'
    
    this.isConnecting = false
    this.connectionStart = null
    this.tempConnectionEnd = null
  }
  
  createConnection(start, end) {
    // Check if connection already exists
    const exists = this.connections.some(conn => 
      conn.start.nodeId === start.nodeId && conn.start.portName === start.portName &&
      conn.end.nodeId === end.nodeId && conn.end.portName === end.portName
    )
    
    if (exists) return
    
    const connection = {
      id: `conn_${this.connections.length}`,
      start: start,
      end: end
    }
    
    this.connections.push(connection)
    this.drawConnection(connection)
    this.updateStats()
  }
  
  drawConnection(connection) {
    const startRect = connection.start.element.getBoundingClientRect()
    const endRect = connection.end.element.getBoundingClientRect()
    const canvasRect = this.canvas.getBoundingClientRect()
    
    const startX = startRect.left + startRect.width / 2 - canvasRect.left
    const startY = startRect.top + startRect.height / 2 - canvasRect.top
    const endX = endRect.left + endRect.width / 2 - canvasRect.left
    const endY = endRect.top + endRect.height / 2 - canvasRect.top
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    const midX = (startX + endX) / 2
    
    path.setAttribute('d', `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`)
    path.setAttribute('stroke', '#60a5fa')
    path.setAttribute('stroke-width', '2')
    path.setAttribute('fill', 'none')
    path.setAttribute('marker-end', 'url(#arrowhead)')
    path.setAttribute('data-connection-id', connection.id)
    
    this.connectionSvg.appendChild(path)
  }
  
  updateConnections() {
    // Clear existing SVG paths
    this.connectionSvg.innerHTML = `
      <defs>
        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="#60a5fa" />
        </marker>
      </defs>
    `
    
    // Redraw all connections
    this.connections.forEach(connection => {
      this.drawConnection(connection)
    })
  }
  
  // Selection functionality
  toggleSelectMode() {
    this.mode = this.mode === 'select' ? 'normal' : 'select'
    const button = document.getElementById('selectMode')
    
    if (this.mode === 'select') {
      button.classList.remove('bg-yellow-600')
      button.classList.add('bg-yellow-700')
      this.canvas.style.cursor = 'crosshair'
    } else {
      button.classList.remove('bg-yellow-700')
      button.classList.add('bg-yellow-600')
      this.canvas.style.cursor = 'default'
      this.clearSelection()
    }
  }
  
  startSelection(e) {
    if (this.mode !== 'select') return
    
    this.isSelecting = true
    const rect = this.canvas.getBoundingClientRect()
    const startX = e.clientX - rect.left
    const startY = e.clientY - rect.top
    
    this.selectionStart = { x: startX, y: startY }
    this.selectionBox.style.left = `${startX}px`
    this.selectionBox.style.top = `${startY}px`
    this.selectionBox.style.width = '0px'
    this.selectionBox.style.height = '0px'
    this.selectionBox.classList.remove('hidden')
  }
  
  updateSelection(e) {
    if (!this.isSelecting) return
    
    const rect = this.canvas.getBoundingClientRect()
    const currentX = e.clientX - rect.left
    const currentY = e.clientY - rect.top
    
    const width = currentX - this.selectionStart.x
    const height = currentY - this.selectionStart.y
    
    this.selectionBox.style.width = `${Math.abs(width)}px`
    this.selectionBox.style.height = `${Math.abs(height)}px`
    this.selectionBox.style.left = `${Math.min(this.selectionStart.x, currentX)}px`
    this.selectionBox.style.top = `${Math.min(this.selectionStart.y, currentY)}px`
  }
  
  endSelection(e) {
    if (!this.isSelecting) return
    
    this.isSelecting = false
    this.selectNodesInBox()
    this.selectionBox.classList.add('hidden')
  }
  
  selectNodesInBox() {
    const boxRect = this.selectionBox.getBoundingClientRect()
    const canvasRect = this.canvas.getBoundingClientRect()
    
    this.selectedNodes.clear()
    
    this.nodes.forEach(node => {
      const element = document.getElementById(node.id)
      if (!element) return
      
      const nodeRect = element.getBoundingClientRect()
      
      // Check if node is within selection box
      if (nodeRect.left >= boxRect.left &&
          nodeRect.right <= boxRect.right &&
          nodeRect.top >= boxRect.top &&
          nodeRect.bottom <= boxRect.bottom) {
        this.selectedNodes.add(node.id)
        element.classList.add('ring-2', 'ring-blue-400')
      } else {
        element.classList.remove('ring-2', 'ring-blue-400')
      }
    })
  }
  
  clearSelection() {
    this.selectedNodes.clear()
    this.nodes.forEach(node => {
      const element = document.getElementById(node.id)
      if (element) {
        element.classList.remove('ring-2', 'ring-blue-400')
      }
    })
  }
  
  createFunctionFromSelection() {
    if (this.selectedNodes.size === 0) {
      alert('Please select some nodes first to create a function')
      return
    }
    
    const functionName = prompt('Enter function name:')
    if (!functionName) return
    
    const groupId = `group_${this.groupIdCounter++}`
    const selectedNodeIds = Array.from(this.selectedNodes)
    
    // Create group
    const group = {
      id: groupId,
      name: functionName,
      nodes: selectedNodeIds,
      connections: this.connections.filter(conn => 
        selectedNodeIds.includes(conn.start.nodeId) && selectedNodeIds.includes(conn.end.nodeId)
      ),
      inputs: [],
      outputs: []
    }
    
    this.groups.push(group)
    
    // Create group visual
    this.createGroupVisual(group)
    
    // Add to custom components
    this.addCustomComponent(group)
    
    // Remove selected nodes from canvas
    selectedNodeIds.forEach(nodeId => {
      this.removeNode(nodeId)
    })
  }
  
  createGroupVisual(group) {
    const groupElement = document.createElement('div')
    groupElement.id = group.id
    groupElement.className = 'absolute bg-purple-600/10 border-2 border-purple-500/30 rounded-lg p-4'
    groupElement.style.zIndex = '5'
    
    // Add comment header
    const header = document.createElement('div')
    header.className = 'flex items-center justify-between mb-2'
    header.innerHTML = `
      <span class="text-sm font-bold text-purple-400">📦 ${group.name}</span>
      <button class="text-red-400 hover:text-red-300 text-xs" onclick="blueprintEditor.removeGroup('${group.id}')">×</button>
    `
    
    // Add comment input
    const commentInput = document.createElement('textarea')
    commentInput.className = 'w-full bg-gray-800/50 border border-gray-600 rounded p-2 text-xs text-gray-300 mb-2'
    commentInput.placeholder = 'Add comments about this function...'
    commentInput.rows = 2
    
    groupElement.appendChild(header)
    groupElement.appendChild(commentInput)
    
    this.canvas.appendChild(groupElement)
    
    // Position group
    const rect = this.canvas.getBoundingClientRect()
    groupElement.style.left = '50px'
    groupElement.style.top = '50px'
    groupElement.style.width = '200px'
  }
  
  addCustomComponent(group) {
    const component = {
      id: `custom_${this.customComponents.length}`,
      name: group.name,
      group: group,
      color: 'purple'
    }
    
    this.customComponents.push(component)
    this.updateCustomComponentsList()
  }
  
  updateCustomComponentsList() {
    const container = document.getElementById('customComponents')
    
    if (this.customComponents.length === 0) {
      container.innerHTML = '<div class="text-gray-500 text-sm">No custom components yet</div>'
      return
    }
    
    container.innerHTML = this.customComponents.map(comp => `
      <div class="node-template" data-type="custom" data-component="${comp.id}" draggable="true">
        <div class="bg-${comp.color}-600/20 border border-${comp.color}-500/30 rounded-lg p-3 cursor-move hover:bg-${comp.color}-600/30 transition-colors">
          <div class="flex items-center gap-2">
            <span class="text-${comp.color}-400">📦</span>
            <span class="text-sm">${comp.name}</span>
          </div>
        </div>
      </div>
    `).join('')
    
    // Add drag listeners to new components
    container.querySelectorAll('.node-template').forEach(template => {
      template.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('nodeType', 'custom')
        e.dataTransfer.setData('componentId', template.dataset.component)
      })
    })
  }
  
  removeNode(nodeId) {
    // Remove node from array
    this.nodes = this.nodes.filter(node => node.id !== nodeId)
    
    // Remove connections
    this.connections = this.connections.filter(conn => 
      conn.start.nodeId !== nodeId && conn.end.nodeId !== nodeId
    )
    
    // Remove element
    const element = document.getElementById(nodeId)
    if (element) {
      element.remove()
    }
    
    // Update connections display
    this.updateConnections()
    this.updateStats()
    
    // Show placeholder if no nodes
    if (this.nodes.length === 0) {
      const placeholder = document.getElementById('canvasPlaceholder')
      if (placeholder) {
        placeholder.style.display = 'flex'
      }
    }
  }
  
  removeGroup(groupId) {
    this.groups = this.groups.filter(group => group.id !== groupId)
    this.customComponents = this.customComponents.filter(comp => comp.group.id !== groupId)
    
    const element = document.getElementById(groupId)
    if (element) {
      element.remove()
    }
    
    this.updateCustomComponentsList()
  }
  
  clearCanvas() {
    this.nodes.forEach(node => {
      const element = document.getElementById(node.id)
      if (element) element.remove()
    })
    
    this.groups.forEach(group => {
      const element = document.getElementById(group.id)
      if (element) element.remove()
    })
    
    this.nodes = []
    this.connections = []
    this.groups = []
    this.selectedNodes.clear()
    this.updateConnections()
    this.updateStats()
    
    const placeholder = document.getElementById('canvasPlaceholder')
    if (placeholder) {
      placeholder.style.display = 'flex'
    }
  }
  
  autoLayout() {
    const cols = 4
    const spacing = 150
    const startX = 100
    const startY = 80
    
    this.nodes.forEach((node, index) => {
      const col = index % cols
      const row = Math.floor(index / cols)
      
      node.x = startX + col * spacing
      node.y = startY + row * spacing
      
      const element = document.getElementById(node.id)
      if (element) {
        element.style.left = `${node.x - 60}px`
        element.style.top = `${node.y - 25}px`
      }
    })
    
    this.updateConnections()
  }
  
  getConnectedInput(node, inputName) {
    const connection = this.connections.find(conn => 
      conn.end.nodeId === node.id && conn.end.portName === inputName
    )
    
    if (!connection) return 'null'
    
    const startNode = this.nodes.find(n => n.id === connection.start.nodeId)
    if (!startNode) return 'null'
    
    const nodeType = this.nodeTypes[startNode.type]
    if (!nodeType) return 'null'
    
    return nodeType.generateCode(startNode, this.currentLanguage)
  }
  
  generateCode() {
    if (this.nodes.length === 0) {
      document.getElementById('codeOutput').innerHTML = '<div class="text-gray-500">// No nodes to generate code from</div>'
      return
    }
    
    let code = ''
    
    // Add header based on language
    if (this.currentLanguage === 'javascript') {
      code += '// Generated JavaScript Code\\n\\n'
    } else if (this.currentLanguage === 'python') {
      code += '# Generated Python Code\\n\\n'
    } else if (this.currentLanguage === 'cpp') {
      code += '// Generated C++ Code\\n#include <iostream>\\nusing namespace std;\\n\\nint main() {\\n'
    } else if (this.currentLanguage === 'rust') {
      code += '// Generated Rust Code\\nuse std::io;\\n\\nfn main() {\\n'
    }
    
    // Generate code from nodes (simplified)
    const outputNodes = this.nodes.filter(node => node.type === 'output')
    
    outputNodes.forEach(node => {
      const nodeType = this.nodeTypes[node.type]
      if (nodeType) {
        const nodeCode = nodeType.generateCode(node, this.currentLanguage)
        if (this.currentLanguage === 'cpp' || this.currentLanguage === 'rust') {
          code += `    ${nodeCode}\\n`
        } else {
          code += `${nodeCode}\\n`
        }
      }
    })
    
    // Add footer
    if (this.currentLanguage === 'cpp') {
      code += '    return 0;\\n}'
    } else if (this.currentLanguage === 'rust') {
      code += '}'
    }
    
    // Display code
    const codeOutput = document.getElementById('codeOutput')
    codeOutput.innerHTML = `<pre class="text-green-400">${code}</pre>`
  }
  
  copyCode() {
    const codeOutput = document.getElementById('codeOutput')
    const text = codeOutput.textContent
    
    navigator.clipboard.writeText(text).then(() => {
      const button = document.getElementById('copyCode')
      const originalText = button.textContent
      button.textContent = '✅ Copied!'
      setTimeout(() => {
        button.textContent = originalText
      }, 2000)
    })
  }
  
  downloadCode() {
    const codeOutput = document.getElementById('codeOutput')
    const code = codeOutput.textContent
    
    const extensions = {
      javascript: 'js',
      python: 'py',
      cpp: 'cpp',
      rust: 'rs'
    }
    
    const extension = extensions[this.currentLanguage] || 'txt'
    const filename = `generated_code.${extension}`
    
    const blob = new Blob([code], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
  
  exportCode() {
    this.generateCode()
    this.downloadCode()
  }
  
  deselectAll() {
    this.clearSelection()
    this.cancelConnection()
  }
  
  updateStats() {
    document.getElementById('nodeCount').textContent = this.nodes.length
    document.getElementById('connectionCount').textContent = this.connections.length
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.blueprintEditor = new BlueprintEditor()
})

// Initialize Alpine
Alpine.start()