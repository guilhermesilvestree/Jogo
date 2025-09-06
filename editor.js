import { levelData } from './scripts/mapData.js';

// --- INICIALIZAÇÃO GERAL ---
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.querySelector('.main-container');

    const startupModal = document.getElementById('startup-modal');
    const startNewBtn = document.getElementById('start-new-btn');
    const loadLevelBtn = document.getElementById('load-level-btn');
    const levelSelect = document.getElementById('level-select');

    // Popula o dropdown com as fases
    levelData.forEach((level, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = level.name;
        levelSelect.appendChild(option);
    });

    startNewBtn.addEventListener('click', () => {
        initializeEditor(); // Inicia com dados padrão
    });

    loadLevelBtn.addEventListener('click', () => {
        const selectedIndex = levelSelect.value;
        const data = levelData[selectedIndex];
        initializeEditor(data); // Inicia com dados da fase carregada
    });
    
    function initializeEditor(baseData = null) {
        // Esconde o modal e mostra o editor principal
        startupModal.style.display = 'none';
        mainContainer.style.visibility = 'visible';
        
        // Insere a estrutura do editor no container principal
        mainContainer.innerHTML = `
            <div id="toolbar">
                <h3>Ferramentas</h3>
                <button class="tool-button active" data-tool="platform" title="Criar Plataforma (P)"><div class="tool-label"><i class="fas fa-layer-group"></i><span>Plataforma</span></div><span class="shortcut">P</span></button>
                <button class="tool-button" data-tool="enemy" title="Adicionar Inimigo (E)"><div class="tool-label"><i class="fas fa-bug"></i><span>Inimigo</span></div><span class="shortcut">E</span></button>
                <button class="tool-button" data-tool="player" title="Definir Início do Jogador (J)"><div class="tool-label"><i class="fas fa-user"></i><span>Jogador</span></div><span class="shortcut">J</span></button>
                <button class="tool-button" data-tool="exit" title="Definir Saída (X)"><div class="tool-label"><i class="fas fa-door-open"></i><span>Saída</span></div><span class="shortcut">X</span></button>
                <button class="tool-button" data-tool="select" title="Selecionar/Mover (S)"><div class="tool-label"><i class="fas fa-mouse-pointer"></i><span>Selecionar</span></div><span class="shortcut">S</span></button>
                <hr style="border-color: #00ffff55; width: 100%;">
                <button id="save-button" class="tool-button" title="Salvar (Ctrl+S)"><div class="tool-label"><i class="fas fa-save"></i><span>Salvar</span></div></button>
            </div>
            <div id="editor-container"><canvas id="editorCanvas" width="1000" height="600"></canvas></div>
            <div id="inspector-panel"><h3>Propriedades</h3><div id="inspector-content"></div></div>
        `;
        
        runEditorLogic(baseData);
    }
});

function runEditorLogic(baseData) {
    const canvas = document.getElementById('editorCanvas');
    const ctx = canvas.getContext('2d');
    const inspectorContent = document.getElementById('inspector-content');

    // O resto do seu código do editor vai aqui...
    let history = [], historyIndex = -1, clipboard = [], lastMousePos = { x: 0, y: 0 };
    let currentTool = 'platform', isMouseDown = false, startX, startY, selectedObjects = [];
    let resizeHandle = null, isDragging = false, isMarqueeSelecting = false, marqueeRect = { x: 0, y: 0, w: 0, h: 0 };
    
    const floor = { x: 0, y: 630, w: 1482, h: 20, isFixed: true };
    let platforms, enemies, playerStart, exit;

    if (baseData) {
        platforms = JSON.parse(JSON.stringify(baseData.platforms.filter(p => p.y !== 580 && p.w !== 1000))); // Ignora o chão antigo
        enemies = JSON.parse(JSON.stringify(baseData.enemies || []));
        playerStart = JSON.parse(JSON.stringify(baseData.playerStart));
        exit = JSON.parse(JSON.stringify(baseData.exit));
    } else {
        platforms = []; enemies = [];
        playerStart = { x: 100, y: 500 }; exit = { x: 900, y: 100, width: 50, height: 60 };
    }

    const playerSprite = new Image(); playerSprite.src = 'assets/ecoskin.png';
    const enemySprite = new Image(); enemySprite.src = 'assets/inimigo1.png';

    // ... (Cole aqui TODAS as outras funções do editor: draw, drawResizeHandles, mousedown, etc.)
    // COLEI ABAIXO PARA FACILITAR:

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#334'; ctx.fillRect(floor.x, floor.y, floor.w, floor.h);
        ctx.strokeStyle = '#00ffff88'; ctx.strokeRect(floor.x, floor.y, floor.w, floor.h);
        
        platforms.forEach(p => { ctx.fillStyle = '#223'; ctx.fillRect(p.x, p.y, p.w, p.h); ctx.strokeStyle = '#00ffff'; ctx.strokeRect(p.x, p.y, p.w, p.h); });
        enemies.forEach(e => { if (enemySprite.complete) { ctx.drawImage(enemySprite, e.x, e.y, 25, 45); } else { ctx.fillStyle = 'red'; ctx.fillRect(e.x, e.y, 25, 45); } });
        if (playerSprite.complete) { ctx.drawImage(playerSprite, playerStart.x, playerStart.y, 40, 50); } else { ctx.fillStyle = 'white'; ctx.fillRect(playerStart.x, playerStart.y, 40, 50); }
        ctx.fillStyle = 'rgba(255, 255, 0, 0.5)'; ctx.fillRect(exit.x, exit.y, exit.width, exit.height);
        ctx.strokeStyle = 'yellow'; ctx.strokeRect(exit.x, exit.y, exit.width, exit.height);

        selectedObjects.forEach(obj => {
            if (obj.isFixed) return;
            ctx.strokeStyle = '#00ff88'; ctx.lineWidth = 2;
            const width = obj.w ?? (obj === playerStart ? 40 : 25);
            const height = obj.h ?? (obj === playerStart ? 50 : 45);
            ctx.strokeRect(obj.x, obj.y, width, height);
            
            if (selectedObjects.length === 1 && obj.w !== undefined) {
                drawResizeHandles(obj);
            }
        });

        if (isMarqueeSelecting) {
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)'; ctx.fillRect(marqueeRect.x, marqueeRect.y, marqueeRect.w, marqueeRect.h);
            ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)'; ctx.strokeRect(marqueeRect.x, marqueeRect.y, marqueeRect.w, marqueeRect.h);
        }
    }
    
    function drawResizeHandles(platform) {
        ctx.fillStyle = '#00ff88'; const handleSize = 8; const handles = getResizeHandles(platform);
        for (const handle in handles) { const pos = handles[handle]; ctx.fillRect(pos.x - handleSize / 2, pos.y - handleSize / 2, handleSize, handleSize); }
    }

    function getResizeHandles(platform) {
        return {
            nw: { x: platform.x, y: platform.y }, ne: { x: platform.x + platform.w, y: platform.y },
            sw: { x: platform.x, y: platform.y + platform.h }, se: { x: platform.x + platform.w, y: platform.y + platform.h },
            n: { x: platform.x + platform.w / 2, y: platform.y }, s: { x: platform.x + platform.w / 2, y: platform.y + platform.h },
            w: { x: platform.x, y: platform.y + platform.h / 2 }, e: { x: platform.x + platform.w, y: platform.y + platform.h / 2 }
        };
    }

    canvas.addEventListener('mousedown', (e) => {
        const { x, y } = getMousePos(e);
        startX = x; startY = y; isMouseDown = true;

        if (currentTool === 'select') {
            resizeHandle = getHandleUnderMouse(x, y);
            if (resizeHandle) {
                const obj = selectedObjects[0];
                obj.startX = obj.x; obj.startY = obj.y; obj.startW = obj.w; obj.startH = obj.h;
                return;
            }
            
            const clickedObject = getObjectUnderMouse(x, y);
            if (clickedObject) {
                isDragging = true;
                if (e.shiftKey) {
                    if (selectedObjects.includes(clickedObject)) {
                        selectedObjects = selectedObjects.filter(obj => obj !== clickedObject);
                    } else { selectedObjects.push(clickedObject); }
                } else if (!selectedObjects.includes(clickedObject)) {
                    selectedObjects = [clickedObject];
                }
            } else { 
                if(!e.shiftKey) selectedObjects = [];
                isMarqueeSelecting = true;
                marqueeRect = { x, y, w: 0, h: 0 };
            }
        } else if (currentTool === 'platform') {
            const newPlatform = { x: startX, y: startY, w: 0, h: 0 };
            platforms.push(newPlatform);
            selectedObjects = [newPlatform];
            isDragging = true;
        }
        updateInspector();
    });

    canvas.addEventListener('mousemove', (e) => {
        const { x, y } = getMousePos(e);
        lastMousePos = { x, y };
        
        if (currentTool === 'select') {
            const handle = getHandleUnderMouse(x,y);
            if (handle) { canvas.style.cursor = handle + '-resize'; }
            else if (getObjectUnderMouse(x,y)) { canvas.style.cursor = 'move'; }
            else { canvas.style.cursor = 'default'; }
        } else { canvas.style.cursor = 'crosshair'; }
        
        if (!isMouseDown) return;
        const dx = x - startX; const dy = y - startY;

        if (resizeHandle) {
            const obj = selectedObjects[0];
            if (resizeHandle.includes('e')) { obj.w = obj.startW + dx; }
            if (resizeHandle.includes('w')) { obj.x = obj.startX + dx; obj.w = obj.startW - dx; }
            if (resizeHandle.includes('s')) { obj.h = obj.startH + dy; }
            if (resizeHandle.includes('n')) { obj.y = obj.startY + dy; obj.h = obj.startH - dy; }
            updateInspector();
        } else if (isMarqueeSelecting) {
            marqueeRect.w = dx; marqueeRect.h = dy;
        } else if (isDragging && currentTool === 'select' && selectedObjects.length > 0) {
            selectedObjects.forEach(obj => { obj.x += dx; obj.y += dy; });
            startX = x; startY = y;
            if (selectedObjects.length === 1) updateInspector();
        } else if (isDragging && currentTool === 'platform' && selectedObjects.length === 1) {
            selectedObjects[0].w = dx;
            selectedObjects[0].h = dy;
            updateInspector();
        }
    });

    canvas.addEventListener('mouseup', (e) => {
        if (!isMouseDown) return;
        
        let stateShouldBeSaved = false;

        if (isMarqueeSelecting) {
            const oldSelectionCount = selectedObjects.length;
            const allObjects = [...platforms, ...enemies];
            const normalizedMarquee = normalizeRect(marqueeRect);
            const objectsInMarquee = allObjects.filter(obj => {
                const objWidth = obj.w || 25; const objHeight = obj.h || 45;
                return rectsIntersect(normalizedMarquee, {x: obj.x, y: obj.y, w: objWidth, h: objHeight});
            });
            if(e.shiftKey) { objectsInMarquee.forEach(obj => { if(!selectedObjects.includes(obj)) selectedObjects.push(obj); }); } 
            else { selectedObjects = objectsInMarquee; }
            if(oldSelectionCount !== selectedObjects.length || objectsInMarquee.length > 0) stateShouldBeSaved = true;
        }

        if (isDragging || resizeHandle) {
            stateShouldBeSaved = true;
        }

        if (selectedObjects.length > 0 && (selectedObjects[0].w < 0 || selectedObjects[0].h < 0)) {
            const plat = selectedObjects[0];
            if (plat.w < 0) { plat.x += plat.w; plat.w = Math.abs(plat.w); }
            if (plat.h < 0) { plat.y += plat.h; plat.h = Math.abs(plat.h); }
        } else if (['enemy', 'player', 'exit'].includes(currentTool)) {
            const { x, y } = getMousePos(e);
            if (currentTool === 'enemy') enemies.push({ x: x - 12, y: y - 45 });
            else if (currentTool === 'player') playerStart = { x: x - 20, y: y - 50 };
            else if (currentTool === 'exit') { exit.x = x - exit.width / 2; exit.y = y - exit.height / 2; }
            stateShouldBeSaved = true;
        }
        
        isMouseDown = false;
        isDragging = false;
        isMarqueeSelecting = false;
        resizeHandle = null;

        if (stateShouldBeSaved) saveState();
        updateInspector();
    });
    
    function updateInspector() {
        inspectorContent.innerHTML = '';
        if (selectedObjects.length === 0) {
            inspectorContent.innerHTML = `<div id="inspector-empty-state"><i class="fas fa-mouse-pointer"></i><p>Nada selecionado</p></div>`;
        } else if (selectedObjects.length > 1) {
             inspectorContent.innerHTML = `<div id="inspector-empty-state"><i class="fas fa-check-double"></i><p>${selectedObjects.length} objetos selecionados</p></div>`;
        } else {
            const obj = selectedObjects[0];
            let content = '';
            if (obj.w !== undefined) { // Plataforma
                content = `<div class="property-group"><label>Tipo: Plataforma</label></div><div class="property-group"><label>Largura (W)</label><input type="number" id="prop-w" value="${Math.round(obj.w)}"></div><div class="property-group"><label>Altura (H)</label><input type="number" id="prop-h" value="${Math.round(obj.h)}"></div><button id="reset-height-btn" class="btn">Redefinir Altura (20px)</button>`;
            } else { // Inimigo
                 content = `<div class="property-group"><label>Tipo: Inimigo</label></div>`;
            }
            inspectorContent.innerHTML = content;
            const wInput = document.getElementById('prop-w'), hInput = document.getElementById('prop-h'), resetBtn = document.getElementById('reset-height-btn');
            if(wInput) wInput.oninput = (e) => { obj.w = parseFloat(e.target.value); };
            if(wInput) wInput.onblur = () => saveState();
            if(hInput) hInput.oninput = (e) => { obj.h = parseFloat(e.target.value); };
            if(hInput) hInput.onblur = () => saveState();
            if(resetBtn) resetBtn.onclick = () => { obj.h = 20; updateInspector(); saveState(); };
        }
    }
    
    function saveState() {
        if (historyIndex < history.length - 1) { history = history.slice(0, historyIndex + 1); }
        history.push(JSON.parse(JSON.stringify({ platforms, enemies, playerStart, exit })));
        historyIndex++;
    }

    function restoreState(state) {
        if (!state) return;
        platforms = JSON.parse(JSON.stringify(state.platforms));
        enemies = JSON.parse(JSON.stringify(state.enemies));
        playerStart = JSON.parse(JSON.stringify(state.playerStart));
        exit = JSON.parse(JSON.stringify(state.exit));
        selectedObjects = [];
        updateInspector();
    }

    function undo() { if (historyIndex > 0) { historyIndex--; restoreState(history[historyIndex]); } }
    function redo() { if (historyIndex < history.length - 1) { historyIndex++; restoreState(history[historyIndex]); } }
    function copy() { if(selectedObjects.length > 0) clipboard = JSON.parse(JSON.stringify(selectedObjects)); }
    function cut() {
        if(selectedObjects.length > 0) {
            copy();
            platforms = platforms.filter(p => !selectedObjects.includes(p));
            enemies = enemies.filter(en => !selectedObjects.includes(en));
            selectedObjects = [];
            saveState();
            updateInspector();
        }
    }
    function paste() {
        if (clipboard.length > 0) {
            selectedObjects = [];
            clipboard.forEach(obj => {
                let newObj = JSON.parse(JSON.stringify(obj));
                newObj.x = lastMousePos.x;
                newObj.y = lastMousePos.y;
                if (newObj.w !== undefined) { platforms.push(newObj); } 
                else { enemies.push(newObj); }
                selectedObjects.push(newObj);
            });
            saveState();
        }
    }

    function getMousePos(evt) { const rect = canvas.getBoundingClientRect(); return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }; }
    function getObjectUnderMouse(x, y) {
        const allObjects = [...enemies, ...platforms];
        for(let i = allObjects.length - 1; i >= 0; i--){
            const obj = allObjects[i]; const width = obj.w || 25; const height = obj.h || 45;
            if(x >= obj.x && x <= obj.x + width && y >= obj.y && y <= obj.y + height) return obj;
        }
        return null;
    }
    function normalizeRect(rect) { return { x: rect.w < 0 ? rect.x + rect.w : rect.x, y: rect.h < 0 ? rect.y + rect.h : rect.y, w: Math.abs(rect.w), h: Math.abs(rect.h) }; }
    function rectsIntersect(r1, r2) { return !(r2.x > r1.x + r1.w || r2.x + r2.w < r1.x || r2.y > r1.y + r1.h || r2.y + r2.h < r1.y); }

    const toolButtons = document.querySelectorAll('.tool-button'), saveButton = document.getElementById('save-button');
    function setActiveTool(toolName) {
        toolButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tool === toolName));
        currentTool = toolName; if(toolName !== 'select') { selectedObjects = []; updateInspector(); }
    }
    toolButtons.forEach(button => { if(button.id === 'save-button') return; button.addEventListener('click', () => setActiveTool(button.dataset.tool)); });
    saveButton.addEventListener('click', () => {
        const levelName = prompt("Digite o nome da fase:"); if (!levelName) return;
        const allPlatforms = [floor, ...platforms];
        const levelData = { name: levelName, playerStart, platforms: allPlatforms.map(p => ({ x: Math.round(p.x), y: Math.round(p.y), w: Math.round(p.w), h: Math.round(p.h) })), enemies: enemies.map(e => ({ x: Math.round(e.x), y: Math.round(e.y) })), water: [], acid: [], coins: [], exit };
        const jsonString = JSON.stringify(levelData, null, 4);
        const indentedJsonString = jsonString.split('\n').map(line => `    ${line}`).join('\n');
        const finalOutput = `${indentedJsonString},`;
        document.getElementById('json-output').style.display = 'block';
        document.getElementById('json-textarea').value = finalOutput;
    });
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName.match(/INPUT|TEXTAREA/)) return;
        if (e.key === 'Delete' && selectedObjects.length > 0) { platforms = platforms.filter(p => !selectedObjects.includes(p)); enemies = enemies.filter(en => !selectedObjects.includes(en)); selectedObjects = []; saveState(); updateInspector(); }
        if (e.ctrlKey) { e.preventDefault(); switch (e.key.toLowerCase()) { case 's': saveButton.click(); break; case 'z': undo(); break; case 'y': redo(); break; case 'c': copy(); break; case 'x': cut(); break; case 'v': paste(); break; } return; }
        const shortcuts = { p: 'platform', e: 'enemy', j: 'player', x: 'exit', s: 'select' };
        const tool = shortcuts[e.key.toLowerCase()]; if (tool) setActiveTool(tool);
    });
    
    saveState();
    updateInspector();
    requestAnimationFrame(function gameLoop() { draw(); requestAnimationFrame(gameLoop); });
}