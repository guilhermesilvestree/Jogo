// =================================================================
// JOGO: ECO-LOCALIZADOR (Edição Gemini)
// =================================================================

// --- SETUP INICIAL ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');
const cooldownsHud = document.getElementById('cooldowns-hud');
const qCooldownFill = document.getElementById('q-cooldown-fill');
const eCooldownFill = document.getElementById('e-cooldown-fill');
const messageOverlay = document.getElementById('message-overlay');
const messageTitle = document.getElementById('message-title');
const messageText = document.getElementById('message-text');
const loadingIndicator = document.getElementById('loading-indicator');
const mainMenu = document.getElementById('main-menu');
const startGameButton = document.getElementById('start-game-button');
const optionsMenu = document.getElementById('options-menu');
const creditsMenu = document.getElementById('credits-menu');
const optionsButton = document.getElementById('options-button');
const creditsButton = document.getElementById('credits-button');
const backButtons = document.querySelectorAll('.back-button');
const lojaButton = document.getElementById('shop-button');
const shopMenu = document.getElementById('shop-menu');
const pauseMenu = document.getElementById('pause-menu');
const resumeButton = document.getElementById('resume-button');
const pauseOptionsButton = document.getElementById('pause-options-button');
const backToMainMenuButton = document.getElementById('back-to-main-menu-button');
const pauseLevelName = document.getElementById('pause-level-name');
const pauseTimePlayed = document.getElementById('pause-time-played');
const pauseTotalCoins = document.getElementById('pause-total-coins');
const saveSlotMenu = document.getElementById('save-slot-menu');
const saveSlotsContainer = document.getElementById('save-slots-container');
const saveSlotBackButton = document.getElementById('save-slot-back-button');
const currentSaveIndicator = document.getElementById('current-save-indicator');
const changeSaveButton = document.getElementById('change-save-button');
const nameSaveOverlay = document.getElementById('name-save-overlay');
const newSaveNameInput = document.getElementById('new-save-name-input');
const confirmSaveNameButton = document.getElementById('confirm-save-name-button');


// --- NOVO SISTEMA DE SAVE SLOTS ---
let currentSlotId = null;
let pendingSlotId = null;
const TOTAL_SLOTS = 5;
let gameContextLoaded = false;

function getSaveKey(slotId, key) {
    return `eco_save_${slotId}_${key}`;
}

function isPremiumUnlocked() {
    return localStorage.getItem('eco_premium_unlocked') === 'true';
}

function createNewSave(slotId, saveName) {
    currentSlotId = slotId;
    upgradesState = { speed: 0, jump: 0, shortPing: 0, longPing: 0, health: 0, stealth: 0, vision: 0, luck: 0 };
    totalCoins = 0;
    collectedCoins = [];
    currentLevelIndex = 0;
    gameStartTime = null;

    const metadata = {
        saveName: saveName,
        levelName: levels[currentLevelIndex].name,
        totalCoins: totalCoins,
        lastSaved: new Date().toISOString()
    };

    localStorage.setItem(getSaveKey(currentSlotId, 'metadata'), JSON.stringify(metadata));
    saveGameState();

    gameContextLoaded = true;
    saveSlotMenu.classList.remove('visible'); // <-- CORREÇÃO APLICADA AQUI
    nameSaveOverlay.classList.remove('visible');
    mainMenu.classList.add('visible');
    updateCurrentSaveIndicator();
    updateGlitchBgVisibility();
}

function loadGameState(slotId) {
    const savedUpgrades = localStorage.getItem(getSaveKey(slotId, 'upgrades'));
    upgradesState = savedUpgrades ? JSON.parse(savedUpgrades) : { speed: 0, jump: 0, shortPing: 0, longPing: 0, health: 0, stealth: 0, vision: 0, luck: 0 };

    const savedCoins = localStorage.getItem(getSaveKey(slotId, 'totalCoins'));
    totalCoins = savedCoins ? parseInt(savedCoins, 10) : 0;

    const savedCollectedCoins = localStorage.getItem(getSaveKey(slotId, 'collectedCoins'));
    collectedCoins = savedCollectedCoins ? JSON.parse(savedCollectedCoins) : [];

    const savedLevel = localStorage.getItem(getSaveKey(slotId, 'level'));
    currentLevelIndex = savedLevel ? parseInt(savedLevel, 10) : 0;

    const savedTime = localStorage.getItem(getSaveKey(slotId, 'startTime'));
    gameStartTime = savedTime ? parseInt(savedTime, 10) : null;
}

function saveGameState() {
    if (currentSlotId === null) return;

    const oldMetadataStr = localStorage.getItem(getSaveKey(currentSlotId, 'metadata'));
    const oldMetadata = oldMetadataStr ? JSON.parse(oldMetadataStr) : {};

    const metadata = {
        saveName: oldMetadata.saveName || `Jogo Salvo ${currentSlotId}`,
        levelName: levels[currentLevelIndex] ? levels[currentLevelIndex].name : "Novo Jogo",
        totalCoins: totalCoins,
        lastSaved: new Date().toISOString()
    };

    localStorage.setItem(getSaveKey(currentSlotId, 'metadata'), JSON.stringify(metadata));
    localStorage.setItem(getSaveKey(currentSlotId, 'upgrades'), JSON.stringify(upgradesState));
    localStorage.setItem(getSaveKey(currentSlotId, 'totalCoins'), totalCoins);
    localStorage.setItem(getSaveKey(currentSlotId, 'collectedCoins'), JSON.stringify(collectedCoins));
    localStorage.setItem(getSaveKey(currentSlotId, 'level'), currentLevelIndex);
    if (gameStartTime) localStorage.setItem(getSaveKey(currentSlotId, 'startTime'), gameStartTime);
}

function deleteSaveSlot(slotId) {
    if (!confirm(`Tem certeza que deseja apagar este save? Esta ação não pode ser desfeita.`)) {
        return;
    }
    Object.keys(localStorage)
        .filter(key => key.startsWith(`eco_save_${slotId}_`))
        .forEach(key => localStorage.removeItem(key));
    renderSaveSlots();
}

function updateCurrentSaveIndicator() {
    if (currentSlotId !== null) {
        const metadataStr = localStorage.getItem(getSaveKey(currentSlotId, 'metadata'));
        const metadata = metadataStr ? JSON.parse(metadataStr) : {};
        const saveName = metadata.saveName || `Jogo Salvo ${currentSlotId}`;
        const isPremium = currentSlotId > 3;
        currentSaveIndicator.innerHTML = `Jogo Ativo: ${isPremium ? '★' : ''} ${saveName} ${isPremium ? '★' : ''}`;
        currentSaveIndicator.style.display = 'block';
    } else {
        currentSaveIndicator.style.display = 'none';
    }
}

function renderSaveSlots() {
    saveSlotsContainer.innerHTML = '';
    saveSlotBackButton.style.display = gameContextLoaded ? 'block' : 'none';

    for (let i = 1; i <= TOTAL_SLOTS; i++) {
        const isPremiumSlot = i > 3;
        const metadataStr = localStorage.getItem(getSaveKey(i, 'metadata'));
        const metadata = metadataStr ? JSON.parse(metadataStr) : null;

        const slotDiv = document.createElement('div');
        slotDiv.className = `save-slot ${isPremiumSlot ? 'premium' : ''}`;

        let detailsHTML = '<div class="slot-details">Vazio</div>';
        const saveName = metadata ? (metadata.saveName || `Jogo Salvo ${i}`) : `Jogo Salvo ${i}`;

        if (metadata) {
            detailsHTML = `<div class="slot-details">
                        Fase: ${metadata.levelName} | Moedas: ${metadata.totalCoins} 🪙
                    </div>`;
        }

        slotDiv.innerHTML = `
                    <div class="save-slot-info">
                        <div class="slot-name">${isPremiumSlot ? '★' : ''} ${saveName} ${isPremiumSlot ? '★' : ''}</div>
                        ${detailsHTML}
                    </div>
                    <div class="slot-actions">
                        <button class="slot-play-button">${metadata ? 'Carregar' : 'Novo Jogo'}</button>
                        <button class="slot-delete-button" ${!metadata ? 'disabled' : ''}>Apagar</button>
                    </div>
                `;

        const playButton = slotDiv.querySelector('.slot-play-button');
        if (metadata) {
            playButton.addEventListener('click', () => {
                currentSlotId = i;
                loadGameState(i);
                gameContextLoaded = true;
                saveSlotMenu.classList.remove('visible');
                mainMenu.classList.add('visible');
                updateCurrentSaveIndicator();
                updateGlitchBgVisibility();
            });
        } else {
            playButton.addEventListener('click', () => {
                if (isPremiumSlot && !isPremiumUnlocked()) {
                    alert("Você precisa terminar o jogo ao menos uma vez para desbloquear os saves Premium!");
                    return;
                }
                pendingSlotId = i;
                newSaveNameInput.value = `Jogo Salvo ${i}`;
                nameSaveOverlay.classList.add('visible');
                newSaveNameInput.focus();
            });
        }

        slotDiv.querySelector('.slot-delete-button').addEventListener('click', (e) => {
            e.stopPropagation();
            deleteSaveSlot(i);
        });

        saveSlotsContainer.appendChild(slotDiv);
    }
}

// --- SISTEMA DA LOJA ---
const upgrades = [
    { key: 'speed', name: 'Velocidade +1', desc: 'Aumenta a velocidade do personagem.', price: 5, max: 3, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 17l5-5-5-5M6 17l5-5-5-5"/></svg>' },
    { key: 'jump', name: 'Pulo +2', desc: 'Aumenta a força do pulo.', price: 7, max: 2, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>' },
    { key: 'shortPing', name: 'Eco Curto Rápido', desc: 'Reduz o cooldown do Q.', price: 8, max: 2, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>' },
    { key: 'longPing', name: 'Eco Longo Rápido', desc: 'Reduz o cooldown do E.', price: 10, max: 2, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.01 3.99c0-.05.04-.1.1-.1h15.8c.05 0 .1.04.1.1v15.8c0 .05-.04.1-.1.1H4.1c-.05 0-.1-.04-.1-.1z"></path><path d="M8.5 8.5c0-.06.04-.1.1-.1h6.8c.05 0 .1.04.1.1v6.8c0 .06-.04.1-.1.1H8.6c-.06 0-.1-.04-.1-.1z"></path><path d="M12 12c0-.06.04-.1.1-.1h-.2c.06 0 .1.04.1.1v-.2c0 .06-.04.1-.1.1h.2c-.06 0-.1-.04-.1-.1z"></path></svg>' },
    { key: 'health', name: 'Vida Extra', desc: 'Aumenta a resistência a danos.', price: 15, max: 2, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V12H7v-4h3V6c0-2.21 1.79-4 4-4h4v4h-2.81c-.7 0-1.19.59-1.19 1.19V8h4l-.5 4h-3.5v9.8c4.56-.93 8-4.96 8-9.8z"></path></svg>' },
    { key: 'stealth', name: 'Furtividade', desc: 'Reduz o alcance de detecção dos inimigos.', price: 12, max: 2, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>' },
    { key: 'vision', name: 'Visão Melhorada', desc: 'Aumenta o alcance dos ecos.', price: 20, max: 1, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>' },
    { key: 'luck', name: 'Sorte', desc: 'Aumenta a chance de encontrar moedas.', price: 25, max: 1, icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00ffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>' },
];
let upgradesState = {};

function updateShopHUD() { const shopCoinCount = document.getElementById('shop-coin-count'); if (shopCoinCount) shopCoinCount.textContent = totalCoins; }
function renderShop() {
    const shopItems = document.getElementById('shop-items');
    shopItems.innerHTML = '';
    upgrades.forEach(upg => {
        const level = upgradesState[upg.key] || 0;
        const canBuy = totalCoins >= upg.price && level < upg.max;
        const isMax = level >= upg.max;
        const itemDiv = document.createElement('div');
        itemDiv.className = `shop-item ${isMax ? 'maxed' : ''}`;
        itemDiv.innerHTML = `
                    <div class="shop-item-content">
                        <div class="shop-item-icon">${upg.icon}</div>
                        <div class="shop-item-info">
                            <span class="shop-item-name">${upg.name}</span>
                            <span class="shop-item-desc">${upg.desc}</span>
                        </div>
                    </div>
                    <div class="shop-item-actions">
                        <span class="shop-item-price">${isMax ? '---' : upg.price} 🪙</span>
                        <span class="shop-item-level">${level}/${upg.max}</span>
                        <button class="shop-buy-button ${isMax ? 'maxed' : (canBuy ? 'available' : 'unavailable')}" ${!canBuy || isMax ? 'disabled' : ''}>
                            ${isMax ? 'Máximo' : 'Comprar'}
                        </button>
                    </div>`;
        const buyBtn = itemDiv.querySelector('.shop-buy-button');
        buyBtn.onclick = () => {
            if (totalCoins >= upg.price && (upgradesState[upg.key] || 0) < upg.max) {
                totalCoins -= upg.price;
                upgradesState[upg.key] = (upgradesState[upg.key] || 0) + 1;
                if (player) player.applyUpgrades();
                updateCoinHUD();
                updateShopHUD();
                renderShop();
                saveGameState();
            }
        };
        shopItems.appendChild(itemDiv);
    });
}

let gameRunning = false;
let isLevelEnding = false;
let isGameEnding = false;
let gameStartTime = null;
let cameFromPauseMenu = false;

function resizeCanvas() { const container = document.querySelector('.game-container'); canvas.width = container.clientWidth; canvas.height = container.clientHeight; }
window.addEventListener('resize', resizeCanvas);
resizeCanvas();


const keys = { a: { pressed: false }, d: { pressed: false }, arrowLeft: { pressed: false }, arrowRight: { pressed: false }, w: { pressed: false }, arrowUp: { pressed: false }, space: { pressed: false } };
window.addEventListener('keydown', (e) => {
    if (nameSaveOverlay.classList.contains('visible')) return;
    if (!gameRunning && e.key !== 'Escape') return;
    switch (e.key.toLowerCase()) {
        case 'a': keys.a.pressed = true; break;
        case 'd': keys.d.pressed = true; break;
        case 'arrowleft': keys.arrowLeft.pressed = true; break;
        case 'arrowright': keys.arrowRight.pressed = true; break;
        case 'w': case 'arrowup': case ' ': if (!keys.space.pressed) { player.jump(); keys.space.pressed = true; } break;
        case 'q': player.createPing('short'); break;
        case 'e': player.createPing('long'); break;
        case 'escape': togglePause(); break;
    }
});
window.addEventListener('keyup', (e) => {
    switch (e.key.toLowerCase()) {
        case 'a': keys.a.pressed = false; break;
        case 'd': keys.d.pressed = false; break;
        case 'arrowleft': keys.arrowLeft.pressed = false; break;
        case 'arrowright': keys.arrowRight.pressed = false; break;
        case 'w': case 'arrowup': case ' ': keys.space.pressed = false; break;
    }
});

const GRAVITY = 0.5;
const playerSprite = new window.Image();
playerSprite.src = 'assets/ecoskin.png';
let playerSpriteLoaded = false;
playerSprite.onload = () => { playerSpriteLoaded = true; };

const enemySprite = new window.Image();
enemySprite.src = 'assets/inimigo1.png';
let enemySpriteLoaded = false;
enemySprite.onload = () => { enemySpriteLoaded = true; };

const deathSprites = [];
const deathSpriteUrls = [
    'assets/morte/ecoskin-morte1.png',
    'assets/morte/ecoskin-morte2.png',
    'assets/morte/ecoskin-morte3.png',
    'assets/morte/ecoskin-morte4.png'
];
let deathSpritesLoaded = 0;
deathSpriteUrls.forEach((url, index) => {
    const sprite = new window.Image();
    sprite.src = url;
    sprite.onload = () => {
        deathSpritesLoaded++;
    };
    deathSprites[index] = sprite;
});

setTimeout(() => { 
    if (!playerSpriteLoaded) { console.log('Atenção: Não foi possível carregar o sprite do personagem.'); } 
    if (!enemySpriteLoaded) { console.log('Atenção: Não foi possível carregar o sprite do inimigo.'); } 
}, 2000);

class Player {
    constructor() {
        this.width = 40; this.height = 50; this.position = { x: 100, y: 100 }; this.velocity = { x: 0, y: 0 };
        this.baseSpeed = 2;
        this.baseJumpForce = 12; this.baseShortPingCooldown = 500; this.baseLongPingCooldown = 3000;
        this.onGround = false; this.lastShortPing = 0; this.lastLongPing = 0; this.stepSoundInterval = 250;
        this.lastStepTime = 0; this.lastY = this.position.y; this.revealTime = 0; this.finalAnimationState = null;
        this.spawnTime = 0; this.breathOffset = 0;
        this.facing = 'right';
        this.deathState = null;
        this.applyUpgrades();
    }
    applyUpgrades() {
        this.speed = this.baseSpeed + ((upgradesState.speed || 0) * 1);
        this.jumpForce = this.baseJumpForce + ((upgradesState.jump || 0) * 2);
        this.shortPingCooldown = this.baseShortPingCooldown - ((upgradesState.shortPing || 0) * 100);
        this.longPingCooldown = this.baseLongPingCooldown - ((upgradesState.longPing || 0) * 250);
    }
    reset(x, y) {
        this.position = { x, y };
        this.velocity = { x: 0, y: 0 };
        this.onGround = false;
        this.revealTime = 0;
        this.spawnTime = Date.now();
        this.resetDeathState();
        this.applyUpgrades();
    }
    draw() {
        if (this.finalAnimationState) { this.drawWinAnimation(); return; }
        if (this.deathState) {
            this.drawDeathAnimation();
            if (this.deathState.finished) return;
            return;
        }

        this.breathOffset = Math.sin(Date.now() / 400) * 0.5;
        const alpha = (Date.now() < this.revealTime) ? 1 : 0.6;
        ctx.save();
        let flip = this.facing === 'left';
        let px = this.position.x;
        let glowX = px + this.width / 2;
        const glowY = this.position.y + this.height / 2 + this.breathOffset;
        const glowRadius = Math.max(this.width, this.height) * 0.7;
        ctx.save();
        ctx.globalAlpha = 0.35 * alpha;
        ctx.shadowBlur = 32;
        ctx.shadowColor = '#ffd700';
        if (flip) {
            ctx.translate(px + this.width / 2, 0);
            ctx.scale(-1, 1);
            glowX = 0;
        }
        ctx.beginPath();
        ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0)';
        ctx.fill();
        ctx.restore();

        if (playerSpriteLoaded) {
            ctx.globalAlpha = alpha;
            if (flip) {
                ctx.save();
                ctx.translate(px + this.width / 2, 0);
                ctx.scale(-1, 1);
                ctx.drawImage(
                    playerSprite,
                    0, 0, playerSprite.width, playerSprite.height,
                    -this.width / 2, this.position.y + this.breathOffset, this.width, this.height
                );
                ctx.restore();
            } else {
                ctx.drawImage(
                    playerSprite,
                    0, 0, playerSprite.width, playerSprite.height,
                    this.position.x, this.position.y + this.breathOffset, this.width, this.height
                );
            }
        } else {
            ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            if (alpha === 1) { ctx.shadowColor = 'rgba(255, 255, 255, 0.7)'; ctx.shadowBlur = 15; }
            const x = this.position.x; const y = this.position.y + this.breathOffset; const w = this.width; const h = this.height;
            ctx.beginPath(); ctx.moveTo(x + w * 0.3, y + h); ctx.lineTo(x + w * 0.3, y + h * 0.5); ctx.quadraticCurveTo(x + w * 0.4, y + h * 0.4, x + w * 0.5, y + h * 0.4); ctx.quadraticCurveTo(x + w * 0.6, y + h * 0.4, x + w * 0.7, y + h * 0.5); ctx.lineTo(x + w * 0.7, y + h); ctx.closePath(); ctx.fill(); ctx.beginPath(); ctx.arc(x + w / 2, y + h * 0.2, w * 0.4, 0, Math.PI * 2); ctx.fill(); if (alpha === 1) { ctx.shadowBlur = 0; }
        }
        ctx.restore();
        ctx.save();
        const auraX = this.position.x + this.width / 2;
        const auraY = this.position.y + this.height / 2 + this.breathOffset;
        const auraRadius = Math.max(this.width, this.height) * 0.55;
        const auraGradient = ctx.createRadialGradient(auraX, auraY, auraRadius * 0.2, auraX, auraY, auraRadius);
        auraGradient.addColorStop(0, 'rgba(255,215,0,0.12)');
        auraGradient.addColorStop(0.7, 'rgba(255,215,0,0.04)');
        auraGradient.addColorStop(1, 'rgba(255,215,0,0)');
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(auraX, auraY, auraRadius, 0, Math.PI * 2);
        ctx.fillStyle = auraGradient;
        ctx.fill();
        ctx.restore();
    }
    drawWinAnimation() { /* Lógica original mantida */ }

    startDeathAnimation() {
        this.deathState = {
            startTime: Date.now(),
            frameDuration: 100,
            currentFrame: 0,
            totalFrames: 4,
            startY: this.position.y,
            finished: false
        };
    }

    drawDeathAnimation() {
        if (!this.deathState || deathSpritesLoaded < 4) return;

        const elapsed = Date.now() - this.deathState.startTime;
        const totalDuration = this.deathState.frameDuration * this.deathState.totalFrames;

        if (elapsed >= totalDuration) {
            this.deathState.finished = true;
            return;
        }

        const frameIndex = Math.min(Math.floor(elapsed / this.deathState.frameDuration), this.deathState.totalFrames - 1);

        const progress = Math.min(elapsed / totalDuration, 1);
        const riseDistance = 30;
        this.position.y = this.deathState.startY - (riseDistance * progress);

        const sprite = deathSprites[frameIndex];
        if (!sprite) return;

        // Adicionar efeito de fundo escuro durante a morte
        ctx.save();
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Desenhar o sprite de morte
        ctx.save();
        ctx.globalAlpha = 1.0;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 0, 0, 0.5)';
        ctx.drawImage(sprite, 0, 0, sprite.width, sprite.height, this.position.x, this.position.y, this.width, this.height);
        ctx.restore();
    }

    resetDeathState() { this.deathState = null; }
    update(platforms, waterRects) { this.handleMovement(waterRects); this.applyGravity(); this.checkCollisions(platforms, waterRects); this.lastY = this.position.y; }
    handleMovement(waterRects) {
        this.velocity.x = 0;
        if (keys.a.pressed || keys.arrowLeft.pressed) { this.velocity.x = -this.speed; this.facing = 'left'; }
        if (keys.d.pressed || keys.arrowRight.pressed) { this.velocity.x = this.speed; this.facing = 'right'; }
        const moving = this.velocity.x !== 0;
        const isInWater = waterRects.some(water => this.isCollidingWith(water));
        if (moving && this.onGround && Date.now() - this.lastStepTime > this.stepSoundInterval) {
            this.lastStepTime = Date.now();
            if (!isInWater) { GameAudio.sounds.step.triggerAttack("8n"); createNoise(this.position.x + this.width / 2, this.position.y + this.height, 80, 0.1); }
        }
    }
    applyGravity() { this.onGround = false; this.position.y += this.velocity.y; this.position.x += this.velocity.x; this.velocity.y += GRAVITY; if (this.position.x < 0) { this.position.x = 0; } if (this.position.x + this.width > canvas.width) { this.position.x = canvas.width - this.width; } }
    checkCollisions(platforms, waterRects) { for (const platform of platforms) { if (this.position.y + this.height <= platform.position.y && this.position.y + this.height + this.velocity.y >= platform.position.y && this.position.x + this.width > platform.position.x && this.position.x < platform.position.x + platform.width) { this.velocity.y = 0; this.onGround = true; this.position.y = platform.position.y - this.height; } } for (const platform of platforms) { if (this.isCollidingWith(platform)) { if (this.velocity.x > 0 && this.position.x + this.width - this.velocity.x <= platform.position.x) { this.position.x = platform.position.x - this.width; this.velocity.x = 0; } if (this.velocity.x < 0 && this.position.x - this.velocity.x >= platform.position.x + platform.width) { this.position.x = platform.position.x + platform.width; this.velocity.x = 0; } } } const wasInWater = waterRects.some(water => this.wasCollidingWith(water, this.lastY)); const isInWater = waterRects.some(water => this.isCollidingWith(water)); if (!wasInWater && isInWater && this.velocity.y > 2) { GameAudio.sounds.splash.triggerAttackRelease("C2", "0.5s"); createNoise(this.position.x + this.width / 2, this.position.y + this.height, 300, 0.8); } }
    isCollidingWith(rect) { return this.position.x < rect.position.x + rect.width && this.position.x + this.width > rect.position.x && this.position.y < rect.position.y + rect.height && this.position.y + this.height > rect.position.y; }
    wasCollidingWith(rect, lastY) { return this.position.x < rect.position.x + rect.width && this.position.x + this.width > rect.position.x && lastY < rect.position.y + rect.height && lastY + this.height > rect.position.y; }
    jump() { if (this.onGround) { this.velocity.y = -this.jumpForce; GameAudio.sounds.jump.triggerAttackRelease("C3", "0.1s"); } }
    createPing(type) {
        const now = Date.now(); const center = { x: this.position.x + this.width / 2, y: this.position.y + this.height / 2 }; const isInWater = game.level.water.some(water => this.isCollidingWith(water));
        if (type === 'short' && now - this.lastShortPing > this.shortPingCooldown) {
            this.lastShortPing = now; let radius = isInWater ? 60 : 120; pings.push(new Ping(center.x, center.y, radius, 1500, 'rgba(0, 255, 255, 1)', 4, 15)); createNoise(center.x, center.y, radius * 2, 0.3); GameAudio.sounds.shortPing.triggerAttackRelease("C5", "8n");
        } else if (type === 'long' && now - this.lastLongPing > this.longPingCooldown) { this.lastLongPing = now; let radius = isInWater ? 120 : 300; pings.push(new Ping(center.x, center.y, radius, 4000, 'rgba(255, 255, 255, 1)', 6, 40)); createNoise(center.x, center.y, radius * 2.5, 1.0); GameAudio.sounds.longPing.triggerAttackRelease("C3", "0.5s"); }
    }
}
class Ping { constructor(x, y, maxRadius, duration, color, speed, particleCount) { this.position = { x, y }; this.radius = 0; this.maxRadius = maxRadius; this.duration = duration; this.color = color; this.speed = speed; this.creationTime = Date.now(); this.active = true; this.particles = []; for (let i = 0; i < particleCount; i++) { this.particles.push(new PingParticle(this.position.x, this.position.y, this.color)); } } update() { this.radius += this.speed; this.particles.forEach(p => { if (p.life > 0) p.update(); }); if (this.radius >= this.maxRadius) { this.radius = this.maxRadius; if (Date.now() - this.creationTime > 500) { this.active = false; } } } draw() { const elapsed = Date.now() - this.creationTime; const alpha = Math.max(0, 1 - elapsed / (this.duration * 0.5)); for (let i = 0; i < 3; i++) { ctx.beginPath(); const currentRadius = this.radius - i * 15; if (currentRadius > 0) { ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * (1 - i * 0.3)})`; ctx.lineWidth = 1 + (1 - alpha); ctx.arc(this.position.x, this.position.y, currentRadius, 0, Math.PI * 2); ctx.stroke(); } } this.particles.forEach(p => { if (p.life > 0) p.draw(); }); } }
class PingParticle { constructor(x, y, color) { this.x = x; this.y = y; const angle = Math.random() * Math.PI * 2; const speed = Math.random() * 2 + 1; this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed; this.lifespan = 50 + Math.random() * 50; this.life = this.lifespan; this.color = color; } update() { this.x += this.vx; this.y += this.vy; this.life--; } draw() { ctx.fillStyle = this.color.replace('1)', `${this.life / this.lifespan})`); ctx.beginPath(); ctx.arc(this.x, this.y, 2, 0, Math.PI * 2); ctx.fill(); } }
class Enemy { constructor(x, y) { this.width = 25; this.height = 45; this.startPosition = { x, y }; this.position = { x, y }; this.velocity = { x: 1, y: 0 }; this.speed = 1; this.state = 'patrol'; this.target = null; this.revealTime = 0; this.onGround = false; } reset() { this.position = { ...this.startPosition }; this.state = 'patrol'; this.target = null; this.velocity.x = this.speed; } draw(player) { 
        const distanceToPlayer = Math.hypot(this.position.x - player.position.x, this.position.y - player.position.y); 
        if (Date.now() < this.revealTime || distanceToPlayer < 150) { 
            ctx.save(); 
            
            // Desenhar glow vermelho
            const glowX = this.position.x + this.width / 2;
            const glowY = this.position.y + this.height / 2;
            const glowRadius = Math.max(this.width, this.height) * 0.6;
            ctx.globalAlpha = 0.1;
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff0000';
            ctx.beginPath();
            ctx.arc(glowX, glowY, glowRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 0, 0, 0.08)';
            ctx.fill();
            
            // Desenhar sprite do inimigo
            if (enemySpriteLoaded) {
                ctx.globalAlpha = 0.9;
                
                // Calcular proporções para manter aspect ratio
                const spriteAspectRatio = enemySprite.width / enemySprite.height;
                const enemyAspectRatio = this.width / this.height;
                
                let drawWidth, drawHeight, drawX, drawY;
                
                if (spriteAspectRatio > enemyAspectRatio) {
                    // Sprite é mais larga, ajustar pela altura
                    drawHeight = this.height;
                    drawWidth = this.height * spriteAspectRatio;
                    drawX = this.position.x - (drawWidth - this.width) / 2;
                    drawY = this.position.y;
                } else {
                    // Sprite é mais alta, ajustar pela largura
                    drawWidth = this.width;
                    drawHeight = this.width / spriteAspectRatio;
                    drawX = this.position.x;
                    drawY = this.position.y - (drawHeight - this.height) / 2;
                }
                
                ctx.drawImage(
                    enemySprite,
                    0, 0, enemySprite.width, enemySprite.height,
                    drawX, drawY, drawWidth, drawHeight
                );
            } else {
                // Fallback para forma geométrica se a sprite não carregou
                ctx.fillStyle = 'rgba(255, 0, 0, 0.7)'; 
                ctx.beginPath(); 
                ctx.moveTo(this.position.x, this.position.y + this.height); 
                ctx.lineTo(this.position.x + this.width / 2, this.position.y + this.height * 0.7); 
                ctx.lineTo(this.position.x + this.width, this.position.y + this.height); 
                ctx.lineTo(this.position.x + this.width * 0.8, this.position.y + this.height * 0.5); 
                ctx.arc(this.position.x + this.width / 2, this.position.y + this.height * 0.3, this.width / 2.5, 0, Math.PI, true); 
                ctx.lineTo(this.position.x + this.width * 0.2, this.position.y + this.height * 0.5); 
                ctx.closePath(); 
                ctx.fill(); 
            }
            
            ctx.restore(); 
        } 
    } update(player, platforms, noises) { this.onGround = false; this.velocity.y += GRAVITY; this.position.y += this.velocity.y; this.position.x += this.velocity.x; for (const platform of platforms) { if (this.position.y + this.height <= platform.position.y && this.position.y + this.height + this.velocity.y >= platform.position.y && this.position.x + this.width > platform.position.x && this.position.x < platform.position.x + platform.width) { this.velocity.y = 0; this.onGround = true; this.position.y = platform.position.y - this.height; } if (this.isCollidingWith(platform)) { if (this.velocity.x > 0 && this.position.x + this.width - this.velocity.x <= platform.position.x) { this.position.x = platform.position.x - this.width; this.velocity.x *= -1; } else if (this.velocity.x < 0 && this.position.x - this.velocity.x >= platform.position.x + platform.width) { this.position.x = platform.position.x + platform.width; this.velocity.x *= -1; } } } for (const platform of platforms) { if (Math.abs(this.position.y + this.height - platform.position.y) < 2 && this.position.x + this.width > platform.position.x && this.position.x < platform.position.x + platform.width) { this.velocity.y = 0; this.onGround = true; this.position.y = platform.position.y - this.height; } } this.handleAI(player, platforms, noises); } isCollidingWith(rect) { return this.position.x < rect.position.x + rect.width && this.position.x + this.width > rect.position.x && this.position.y < rect.position.y + rect.height && this.position.y + this.height > rect.position.y; } handleAI(player, platforms, noises) { for (const noise of noises) { const distance = Math.hypot(this.position.x - noise.x, this.position.y - noise.y); if (distance < noise.radius * noise.intensity) { if (this.state === 'patrol') { GameAudio.sounds.enemyAlert.triggerAttackRelease("A4", "0.2s"); } this.state = 'investigating'; this.target = { x: noise.x, y: noise.y }; this.revealTime = Date.now() + 500; } } if (Date.now() < player.revealTime) { const distanceToPlayer = Math.hypot(this.position.x - player.position.x, this.position.y - player.position.y); if (distanceToPlayer < 200) { this.state = 'chasing'; this.target = player.position; } } if (this.state === 'patrol' && this.onGround) { const lookAheadX = this.velocity.x > 0 ? this.position.x + this.width : this.position.x - 1; const groundCheckY = this.position.y + this.height + 5; let groundAhead = false; for (const platform of platforms) { if (lookAheadX >= platform.position.x && lookAheadX <= platform.position.x + platform.width && groundCheckY >= platform.position.y && groundCheckY <= platform.position.y + platform.height) { groundAhead = true; break; } } if (!groundAhead) { this.velocity.x *= -1; } } switch (this.state) { case 'patrol': this.velocity.x = this.speed * Math.sign(this.velocity.x || 1); break; case 'investigating': if (!this.target) { this.state = 'patrol'; return; } this.velocity.x = this.speed * 1.5 * Math.sign(this.target.x - this.position.x); if (Math.abs(this.position.x - this.target.x) < 10) { this.state = 'patrol'; this.target = null; this.velocity.x = this.speed * Math.sign(this.velocity.x); } break; case 'chasing': if (!this.target) { this.state = 'patrol'; return; } this.velocity.x = this.speed * 2 * Math.sign(this.target.x - this.position.x); const distanceToPlayer = Math.hypot(this.position.x - player.position.x, this.position.y - player.position.y); if (distanceToPlayer > 400) { this.state = 'patrol'; this.target = null; } break; } } reveal() { this.revealTime = Date.now() + 3000; } }
class RevealedObject { constructor(platform, duration) { this.platform = platform; this.revealTime = Date.now(); this.duration = duration; } draw() { const elapsed = Date.now() - this.revealTime; if (elapsed > this.duration) return false; const alpha = 1 - (elapsed / this.duration); this.platform.draw(alpha); return true; } }
class Platform { constructor(x, y, width, height) { this.position = { x, y }; this.width = width; this.height = height; } draw(alpha = 1) { ctx.save(); ctx.globalAlpha = alpha; const grad = ctx.createLinearGradient(this.position.x, this.position.y, this.position.x, this.position.y + this.height); grad.addColorStop(0, '#334'); grad.addColorStop(0.5, '#223'); grad.addColorStop(1, '#112'); ctx.fillStyle = grad; ctx.fillRect(this.position.x, this.position.y, this.width, this.height); ctx.strokeStyle = `rgba(0, 255, 255, ${alpha * 0.7})`; ctx.lineWidth = 1; ctx.strokeRect(this.position.x, this.position.y, this.width, this.height); ctx.restore(); } }
class HeartOfLight { constructor(x, y, width, height) { this.position = { x, y }; this.width = width; this.height = height; this.revealTime = 0; this.isAbsorbed = false; } draw() { if (Date.now() < this.revealTime && !this.isAbsorbed) { const timeleft = this.revealTime - Date.now(); const alpha = Math.min(1, timeleft / 5000); const centerX = this.position.x + this.width / 2; const centerY = this.position.y + this.height / 2; const pulse = Math.sin(Date.now() / 200) * 5 + (this.width / 2); const gradient = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, pulse); gradient.addColorStop(0, `rgba(255, 255, 180, ${alpha})`); gradient.addColorStop(0.8, `rgba(255, 255, 0, ${alpha * 0.8})`); gradient.addColorStop(1, `rgba(255, 200, 0, 0)`); ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(centerX, centerY, pulse, 0, Math.PI * 2); ctx.fill(); } } reveal() { this.revealTime = Date.now() + 5000; } absorb() { if (this.isAbsorbed) return; this.isAbsorbed = true; isLevelEnding = true; gameRunning = false; GameAudio.sounds.levelWinExplosion.triggerAttackRelease("2n"); pings.push(new Ping(this.position.x + this.width / 2, this.position.y + this.height / 2, canvas.width * 1.5, 1500, 'rgba(255, 255, 255, 0.9)', 25, 0)); setTimeout(() => { GameAudio.sounds.levelWin.triggerAttackRelease("C5", "0.5s"); currentLevelIndex++; saveGameState(); showMessage("Nível Concluído!", "A luz ressoa através de você.", "Próxima Fase", () => { isLevelEnding = false; game.loadLevel(currentLevelIndex); }); }, 1500); } }
class Water { constructor(x, y, width, height) { this.position = { x, y }; this.width = width; this.height = height; } draw() { ctx.fillStyle = 'rgba(0, 50, 150, 0.3)'; ctx.fillRect(this.position.x, this.position.y, this.width, this.height); } }
class AcidWater { constructor(x, y, width, height) { this.position = { x, y }; this.width = width; this.height = height; } draw() { const grad = ctx.createLinearGradient(this.position.x, this.position.y, this.position.x, this.position.y + this.height); grad.addColorStop(0, `rgba(100, 255, 100, 0.4)`); grad.addColorStop(1, `rgba(50, 200, 50, 0.7)`); ctx.fillStyle = grad; ctx.fillRect(this.position.x, this.position.y, this.width, this.height); } }
class Coin { constructor(x, y) { this.x = x; this.y = y; this.radius = 14; this.collected = false; this.animation = Math.random() * Math.PI * 2; } draw() { if (this.collected) return; const pulse = Math.sin(Date.now() / 200 + this.animation) * 3; ctx.save(); ctx.beginPath(); ctx.arc(this.x + this.radius, this.y + this.radius + pulse, this.radius, 0, Math.PI * 2); ctx.fillStyle = 'gold'; ctx.shadowColor = '#fff200'; ctx.shadowBlur = 10; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = '#fff'; ctx.stroke(); ctx.restore(); } isCollidingWith(player) { const px = player.position.x + player.width / 2; const py = player.position.y + player.height / 2; const dx = (this.x + this.radius) - px; const dy = (this.y + this.radius) - py; const dist = Math.sqrt(dx * dx + dy * dy); return dist < this.radius + Math.max(player.width, player.height) / 2 - 8; } }

let currentLevelIndex = 0;

// Array do mapeamento dos mapas.
import { levelData } from "./scripts/mapData.js";

const levels = levelData.map(data => ({ ...data, platforms: data.platforms.map(p => new Platform(p.x, p.y, p.w, p.h)), water: data.water.map(w => new Water(w.x, w.y, w.w, w.h)), acid: data.acid.map(a => new AcidWater(a.x, a.y, a.w, a.h)), coins: data.coins ? data.coins.map(c => new Coin(c.x, c.y)) : [] }));

let coins = []; let totalCoins = 0; let collectedCoins = [];
function getCoinId(levelIndex, coin) { return `${levelIndex}-${Math.round(coin.x)}-${Math.round(coin.y)}`; }

function updateCoinHUD() {
    const coinCountCenter = document.getElementById('coin-count-center');
    if (coinCountCenter) coinCountCenter.textContent = totalCoins;
}

let player, pings, enemies, revealedObjects, noises, heartOfLight;
const game = {
    level: null,
    loadLevel: function (levelIndex) {
        if (levelIndex >= levels.length) { this.winGame(); return; }
        this.level = { ...levels[levelIndex] };
        player = new Player(); player.reset(this.level.playerStart.x, this.level.playerStart.y);
        enemies = this.level.enemies.map(e => new Enemy(e.x, e.y));
        heartOfLight = new HeartOfLight(this.level.exit.x, this.level.exit.y, this.level.exit.width, this.level.exit.height);
        pings = []; revealedObjects = []; noises = [];
        coins = this.level.coins.map(c => { const coin = Object.assign(Object.create(Object.getPrototypeOf(c)), c); const coinId = getCoinId(levelIndex, coin); if (collectedCoins.includes(coinId)) coin.collected = true; return coin; });
        showLevelIntro(this.level);
        updateCoinHUD();
        updateHUD();
    },
    restartLevel: function () {
        loadGameState(currentSlotId);
        player.reset(this.level.playerStart.x, this.level.playerStart.y);
        enemies.forEach(e => e.reset());
        pings = []; revealedObjects = []; noises = [];
        heartOfLight = new HeartOfLight(this.level.exit.x, this.level.exit.y, this.level.exit.width, this.level.exit.height);
        coins = this.level.coins.map(c => { const coin = Object.assign(Object.create(Object.getPrototypeOf(c)), c); const coinId = getCoinId(currentLevelIndex, coin); if (collectedCoins.includes(coinId)) coin.collected = true; return coin; });
        gameRunning = true;
    },
    winGame: function () {
        gameRunning = false; isGameEnding = true;
        GameAudio.sounds.gameWin.triggerAttackRelease("C3", "4s");
        localStorage.setItem('eco_premium_unlocked', 'true');

        const endTime = Date.now(); const timeTaken = Math.round((endTime - gameStartTime) / 1000);
        const minutes = Math.floor(timeTaken / 60); const seconds = timeTaken % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        player.finalAnimationState = { y: player.position.y, alpha: 1, pulse: 0, finalMessage: `Você escapou! Tempo: ${timeString}` };
    }
};

function createNoise(x, y, radius, intensity) { noises.push({ x, y, radius, intensity, creationTime: Date.now() }); }

function checkCollisionsAndReveal() {
    if (isLevelEnding || isGameEnding || !game.level) return;
    for (const ping of pings) {
        for (const platform of game.level.platforms) { if (isCircleIntersectingRect(ping, platform)) { revealedObjects.push(new RevealedObject(platform, ping.duration)); } }
        for (const enemy of enemies) { if (isCircleIntersectingRect(ping, enemy)) { enemy.reveal(); } }
        if (isCircleIntersectingRect(ping, player)) { player.revealTime = Date.now() + ping.duration; }
        if (isCircleIntersectingRect(ping, heartOfLight)) { heartOfLight.reveal(); }
    }
    if (Date.now() - player.spawnTime > 1000) {
        for (const enemy of enemies) {
            if (player.isCollidingWith(enemy) && !player.deathState) {
                gameRunning = false;
                GameAudio.sounds.gameOver.triggerAttackRelease("C1", "1s");
                player.startDeathAnimation();
                setTimeout(() => {
                    showMessage("Você foi Ouvido", "O silêncio era sua única defesa.", "Tentar Novamente", () => {
                        player.resetDeathState();
                        game.restartLevel();
                    });
                }, 1000);
                return;
            }
        }
    }
    for (const acidPool of game.level.acid) {
        if (player.isCollidingWith(acidPool) && !player.deathState) {
            gameRunning = false;
            GameAudio.sounds.gameOver.triggerAttackRelease("C1", "1s");
            player.startDeathAnimation();
            setTimeout(() => {
                showMessage("Corroído", "A escuridão líquida te consome.", "Tentar Novamente", () => {
                    player.resetDeathState();
                    game.restartLevel();
                });
            }, 1000);
            return;
        }
    }
    if (player.isCollidingWith(heartOfLight)) { heartOfLight.absorb(); }
    for (const coin of coins) {
        if (!coin.collected && coin.isCollidingWith(player)) {
            coin.collected = true; totalCoins++;
            const coinId = getCoinId(currentLevelIndex, coin);
            if (!collectedCoins.includes(coinId)) collectedCoins.push(coinId);
            updateCoinHUD(); saveGameState();
            if (GameAudio.sounds && GameAudio.sounds.levelWin) GameAudio.sounds.levelWin.triggerAttackRelease("C6", "0.1s");
        }
    }
}

function isCircleIntersectingRect(circle, rect) { const distX = Math.abs(circle.position.x - rect.position.x - rect.width / 2); const distY = Math.abs(circle.position.y - rect.position.y - rect.height / 2); if (distX > (rect.width / 2 + circle.radius) || distY > (rect.height / 2 + circle.radius)) return false; if (distX <= (rect.width / 2) || distY <= (rect.height / 2)) return true; const dx = distX - rect.width / 2; const dy = distY - rect.height / 2; return (dx * dx + dy * dy <= (circle.radius * circle.radius)); }

function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isGameEnding && player && player.finalAnimationState) {
        const anim = player.finalAnimationState; anim.y -= 0.5; anim.pulse = Math.sin(Date.now() / 300) * 40 + 50;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * (1 - anim.alpha)})`; ctx.fillRect(0, 0, canvas.width, canvas.height);
        player.draw();
        if (anim.alpha > 0) { anim.alpha -= 0.005; }
        else {
            isGameEnding = false;
            showMessage("Vitória!", anim.finalMessage, "Menu Principal", () => {
                mainMenu.classList.add('visible');
                hud.classList.remove('visible'); cooldownsHud.classList.remove('visible');
                document.getElementById('coin-hud').classList.remove('visible');
                GameAudio.stopAmbientMusic();
            });
        }
        return;
    }

    if (!game.level) return;

    // Desenhar elementos do nível mesmo quando o jogo não está rodando (para animação de morte)
    revealedObjects = revealedObjects.filter(ro => ro.draw());
    game.level.water.forEach(w => w.draw());
    game.level.acid.forEach(a => a.draw());
    heartOfLight.draw();
    coins.forEach(c => c.draw());

    // Desenhar o player (incluindo animação de morte)
    if (player) {
        player.draw();
    }

    // Desenhar inimigos
    if (enemies) {
        enemies.forEach(e => e.draw(player));
    }

    // Desenhar pings
    if (pings) {
        pings.forEach(p => p.draw());
        pings = pings.filter(p => p.active);
    }

    // Filtrar ruídos
    if (noises) {
        noises = noises.filter(n => Date.now() - n.creationTime < 100);
    }

    // Atualizar lógica do jogo apenas se estiver rodando
    if (gameRunning && player) {
        player.update(game.level.platforms, game.level.water);
        enemies.forEach(e => e.update(player, game.level.platforms, noises));
        pings.forEach(p => p.update());
        checkCollisionsAndReveal();
        updateHUD();
    }
}

function updateHUD() {
    if (!game.level) return;

    if (hud && hud.firstChild) {
        hud.firstChild.textContent = `Fase ${currentLevelIndex + 1}: ${game.level.name}`;
    }

    if (player && qCooldownFill) {
        qCooldownFill.style.width = `${Math.min(100, ((Date.now() - player.lastShortPing) / player.shortPingCooldown) * 100)}%`;
    }

    if (player && eCooldownFill) {
        eCooldownFill.style.width = `${Math.min(100, ((Date.now() - player.lastLongPing) / player.longPingCooldown) * 100)}%`;
    }

    updateCoinHUD();
}

function showMessage(title, text, buttonText, callback) { messageTitle.textContent = title; messageText.textContent = text; messageOverlay.classList.add('visible'); const oldButton = document.getElementById('message-button'); const newButton = oldButton.cloneNode(true); oldButton.parentNode.replaceChild(newButton, oldButton); newButton.textContent = buttonText; newButton.addEventListener('click', async () => { await GameAudio.initAudio(); messageOverlay.classList.remove('visible'); callback(); }, { once: true }); }

async function showLevelIntro(level) {
    const staticInstructions = currentLevelIndex === 0 ? "Use [A/D] ou Setas, [Espaço] para pular. [Q] é um eco curto, [E] é um eco longo. Aperte [ESC] para pausar." : "";
    showMessage(`Nível ${currentLevelIndex + 1}: ${level.name}`, staticInstructions, "✨ Iniciar Fase ✨", () => { gameRunning = true; });
}

function formatTime(ms) {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${seconds}`;
}

function togglePause() {
    if (!gameStartTime || isLevelEnding || isGameEnding) return;
    if (gameRunning) {
        gameRunning = false;
        pauseLevelName.textContent = levels[currentLevelIndex].name;
        pauseTimePlayed.textContent = formatTime(Date.now() - gameStartTime);
        pauseTotalCoins.textContent = totalCoins;
        pauseMenu.classList.add('visible');
        GameAudio.sounds.pauseIn.triggerAttackRelease("C3", "0.1s");
        GameAudio.stopAmbientMusic();
    } else if (pauseMenu.classList.contains('visible')) {
        gameRunning = true;
        pauseMenu.classList.remove('visible');
        GameAudio.sounds.pauseOut.triggerAttackRelease("G3", "0.1s");
        GameAudio.startAmbientMusic();
        if (document.activeElement) document.activeElement.blur();
    }
}

// --- LISTENERS DOS BOTÕES ---

startGameButton.addEventListener('click', () => {
    mainMenu.classList.remove('visible');
    hud.classList.add('visible');
    cooldownsHud.classList.add('visible');
    document.getElementById('coin-hud').classList.add('visible');

    if (!gameStartTime) gameStartTime = Date.now();

    GameAudio.startAmbientMusic();
    game.loadLevel(currentLevelIndex);
    updateGlitchBgVisibility();
});

confirmSaveNameButton.addEventListener('click', () => {
    const name = newSaveNameInput.value.trim();
    if (!name) {
        alert("Por favor, digite um nome para o save.");
        return;
    }
    createNewSave(pendingSlotId, name);
});

optionsButton.addEventListener('click', () => { mainMenu.classList.remove('visible'); optionsMenu.classList.add('visible'); cameFromPauseMenu = false; });
creditsButton.addEventListener('click', () => { mainMenu.classList.remove('visible'); creditsMenu.classList.add('visible'); });

saveSlotBackButton.addEventListener('click', () => {
    saveSlotMenu.classList.remove('visible');
    mainMenu.classList.add('visible');
    updateGlitchBgVisibility();
});

backButtons.forEach(button => {
    if (button.id === 'save-slot-back-button') return;
    button.addEventListener('click', () => {
        const parentOverlay = button.closest('.overlay');
        parentOverlay.classList.remove('visible');

        if (cameFromPauseMenu && parentOverlay.id === 'options-menu') {
            pauseMenu.classList.add('visible');
        } else {
            mainMenu.classList.add('visible');
        }
        cameFromPauseMenu = false;
    });
});

resumeButton.addEventListener('click', togglePause);
pauseOptionsButton.addEventListener('click', () => { pauseMenu.classList.remove('visible'); optionsMenu.classList.add('visible'); cameFromPauseMenu = true; });

backToMainMenuButton.addEventListener('click', () => {
    saveGameState();
    GameAudio.stopAmbientMusic();
    gameRunning = false;
    game.level = null;
    pauseMenu.classList.remove('visible');
    mainMenu.classList.add('visible');
    hud.classList.remove('visible');
    cooldownsHud.classList.remove('visible');
    document.getElementById('coin-hud').classList.remove('visible');
});

changeSaveButton.addEventListener('click', () => {
    mainMenu.classList.remove('visible');
    saveSlotMenu.classList.add('visible');
    renderSaveSlots();
    updateGlitchBgVisibility();
});


const glitchBg = document.getElementById('glitch-bg'); const glitchCtx = glitchBg.getContext('2d');
function resizeGlitchBg() { glitchBg.width = glitchBg.parentElement.clientWidth; glitchBg.height = glitchBg.parentElement.clientHeight; }
window.addEventListener('resize', resizeGlitchBg); resizeGlitchBg();

function updateGlitchBgVisibility() {
    const showGlitch = mainMenu.classList.contains('visible');
    glitchBg.style.display = showGlitch ? 'block' : 'none';
}

const menuObserver = new MutationObserver(updateGlitchBgVisibility);
menuObserver.observe(mainMenu, { attributes: true, attributeFilter: ['class'] });
menuObserver.observe(saveSlotMenu, { attributes: true, attributeFilter: ['class'] });

function glitchBgLoop() {
    const showGlitch = mainMenu.classList.contains('visible');

    if (showGlitch) {
        drawGlitchPlayer();
        requestAnimationFrame(glitchBgLoop);
    } else {
        requestAnimationFrame(glitchBgLoop);
    }
}

function drawGlitchPlayer() {
    glitchCtx.save(); glitchCtx.globalAlpha = 1; glitchCtx.fillStyle = '#000'; glitchCtx.fillRect(0, 0, glitchBg.width, glitchBg.height); glitchCtx.restore();

    for (let i = 0; i < 7; i++) { const y = Math.random() * glitchBg.height; glitchCtx.save(); glitchCtx.globalAlpha = 0.08 + Math.random() * 0.08; glitchCtx.fillStyle = Math.random() > 0.7 ? '#00ffff' : '#fff'; glitchCtx.fillRect(0, y, glitchBg.width, 1 + Math.random() * 2); glitchCtx.restore(); }

    if (playerSpriteLoaded) {
        const w = playerSprite.width; const h = playerSprite.height;
        const scale = Math.min(glitchBg.width, glitchBg.height) / Math.max(w, h) * 0.7;
        const menuWidth = mainMenu.classList.contains('visible') ? mainMenu.offsetWidth : 0;
        const paddingLeft = mainMenu.classList.contains('visible') ? 40 : 0;
        const usableWidth = glitchBg.width - menuWidth - paddingLeft;
        const centerX = menuWidth + paddingLeft + usableWidth / 2;
        const baseY = glitchBg.height;
        glitchCtx.save(); glitchCtx.translate(centerX, baseY); glitchCtx.scale(scale, scale); glitchCtx.drawImage(playerSprite, -w / 2, -h, w, h); glitchCtx.restore();
    }
}

lojaButton.addEventListener('click', () => {
    if (currentSlotId === null) {
        alert("Nenhum jogo carregado. Selecione um save para acessar a loja.");
        return;
    }
    mainMenu.classList.remove('visible');
    shopMenu.classList.add('visible');
    updateShopHUD();
    renderShop();
});
shopMenu.querySelector('.back-button').addEventListener('click', () => {
    shopMenu.classList.remove('visible');
    mainMenu.classList.add('visible');
});

// --- INICIALIZAÇÃO DO JOGO ---
window.onload = () => {
    renderSaveSlots();
    updateGlitchBgVisibility();
    glitchBgLoop();
    GameAudio.loadVolumeSettings(); // Chamada para o sistema de áudio
    GameAudio.updateVolumes();    // Chamada para o sistema de áudio
    animate();
};