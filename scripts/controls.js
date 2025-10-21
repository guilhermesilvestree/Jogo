import { alertMessage, log } from "./alertas.js"
const controlOptions = document.getElementById('optionControlDocument')
const gamepadBtn = document.getElementById('gamepadInput')
const gamepadBtnLabel = document.querySelector('.option-item-stacked .option-label-group .inputs-control label[for="gamepadInput"]')
const keyboardBtn = document.getElementById('keyboardInput')
const keyboardBtnLabel = document.querySelector('.option-item-stacked .option-label-group .inputs-control label[for="keyboardInput"]')

export const keys = {
    a: { pressed: false },
    d: { pressed: false },
    arrowLeft: { pressed: false },
    arrowRight: { pressed: false },
    w: { pressed: false },
    arrowUp: { pressed: false },
    space: { pressed: false }
};

export function keyDownFunction(togglePause, player, nameSaveOverlay, gameRunning, e) {
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

        case 'c': player.fireProjectile(); break;

        case 'escape': togglePause(); break;

    }

    if (gameRunning && e.key !== 'Escape' && gamepadOptionSelect) {
        alertMessage(5000, 'alertaKeyboardOption')
    }
}

export function keyUpFunction(e) {
    switch (e.key.toLowerCase()) {

        case 'a': keys.a.pressed = false; break;

        case 'd': keys.d.pressed = false; break;

        case 'arrowleft': keys.arrowLeft.pressed = false; break;

        case 'arrowright': keys.arrowRight.pressed = false; break;

        case 'w': case 'arrowup': case ' ': keys.space.pressed = false; break;

    }
}

let gamepad = null;
const DEAD_ZONE = 0.15;
let ConnectedControls = 0
let gamepadOptionSelect = false


keyboardBtn.addEventListener('click', () => {
    gamepadOptionSelect = false
    gamepadBtnLabel.classList.remove('checked-label')
    keyboardBtnLabel.classList.add('checked-label')
})
gamepadBtn.addEventListener('click', () => {
    gamepadOptionSelect = true
    gamepadBtnLabel.classList.add('checked-label')
    keyboardBtnLabel.classList.remove('checked-label')
})


// 1. Eventos de Conexão/Desconexão
window.addEventListener('gamepadconnected', (e) => {
    log('Gamepad conectado: ' + e.gamepad.id, false)
    controlOptions.style.display = 'flex'
    gamepad = e.gamepad;
    ConnectedControls++
    gamepadOptionSelect = true
    gamepadBtnLabel.classList.add('checked-label')
    keyboardBtnLabel.classList.remove('checked-label')
});

window.addEventListener('gamepaddisconnected', () => {
    log('Gamepad desconectado.', false)
    keys.arrowLeft.pressed = false;
    keys.a.pressed = false;
    keys.arrowRight.pressed = false;
    keys.d.pressed = false;
    keys.space.pressed = false;
    ConnectedControls--
    gamepad = null;
    if (ConnectedControls === 0) {
        controlOptions.style.display = 'none'
    }
});

export function handleGamepadInput(player) {
    if (gamepadOptionSelect === true) {
        const currentPads = navigator.getGamepads();
        gamepad = currentPads[gamepad ? gamepad.index : 0];

        if (gamepad || gamepad.mapping === 'standard') {

            const isGamepadActive = !!gamepad;

            // Mapeamento de acoes de continuidade
            if (isGamepadActive) {
                const eixoX = gamepad.axes[0];

                if (eixoX < -DEAD_ZONE || gamepad.buttons[14].pressed) {
                    keys.arrowLeft.pressed = true;
                    keys.a.pressed = true;
                }
                else if (eixoX > DEAD_ZONE || gamepad.buttons[15].pressed) {
                    keys.arrowRight.pressed = true;
                    keys.d.pressed = true;
                }
                else {
                    keys.arrowLeft.pressed = false;
                    keys.a.pressed = false;
                    keys.arrowRight.pressed = false;
                    keys.d.pressed = false;
                }
            }
            else {
                keys.arrowLeft.pressed = false;
                keys.a.pressed = false;
                keys.arrowRight.pressed = false;
                keys.d.pressed = false;
            }

            // Mapeamento de botões de acao unica

            if (isGamepadActive) {
                // Botão A/X (índice 0) -> Mapeia para Pulo/Espaço
                const A_Button = gamepad.buttons[0];
                if (A_Button.pressed) {
                    // Ação de Pulo: Replicamos a lógica do seu 'keydown' original.
                    if (!keys.space.pressed) {
                        player.jump();
                        keys.space.pressed = true;
                    }
                } else {
                    keys.space.pressed = false;
                }

                // --- Ações de Disparo Único (Ping, Tiro, Pausa) ---

                // Botão Right Bumper (índice 5) -> Mapeia para Ping Curto ('q' original)
                if (gamepad.buttons[5].pressed && !gamepad.buttons[5].wasPressed) {
                    player.createPing('short');
                }

                // Botão Left Bumper (índice 4) -> Mapeia para Ping Longo ('e' original)
                if (gamepad.buttons[4].pressed && !gamepad.buttons[4].wasPressed) {
                    player.createPing('long');
                }

                // Botão X/Quadrado (índice 2) -> Mapeia para Tiro ('c' original)
                if (gamepad.buttons[2].pressed && !gamepad.buttons[2].wasPressed) {
                    player.fireProjectile();
                }

                // Botão Start/Menu (índice 9) -> Mapeia para Pausa ('escape' original)
                if (gamepad.buttons[9].pressed && !gamepad.buttons[9].wasPressed) {
                    togglePause();
                }

                // 3. ATUALIZAÇÃO DO ESTADO ANTERIOR DOS BOTÕES
                // Crucial para detectar a transição de 'não pressionado' para 'pressionado'
                gamepad.buttons.forEach(button => {
                    button.wasPressed = button.pressed;
                });
            }
        }
    }
}