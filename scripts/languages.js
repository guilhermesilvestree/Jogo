// languages.js

export const translations = {
    'pt': {
        // Main Menu
        gameTitle: "Eco",
        gameSubtitle: "A escuridão ouve cada passo seu.",
        mainMenuStart: "Iniciar Aventura",
        mainMenuShop: "Loja",
        mainMenuRanking: "Ranking",
        mainMenuChangeSave: "Trocar Save",
        mainMenuOptions: "Opções",
        mainMenuCredits: "Créditos",
        activeSave: "Jogo Ativo: ", // Dynamic part will be appended

        // Overlays & Buttons
        buttonBack: "Voltar",
        buttonConfirm: "Confirmar",
        
        // Pause Menu
        pauseStatus: "STATUS",
        pauseLocation: "Local:",
        pauseTime: "Tempo de Jogo:",
        pauseFragments: "Fragmentos (Moedas):",
        pauseResume: "Continuar Jogo",
        pauseOptions: "Opções",
        pauseMainMenu: "Menu Principal",

        // Options Menu
        optionsTitle: "Opções",
        volumeGeneral: "Volume Geral",
        volumeMusic: "Música",
        volumeEffects: "Efeitos Sonoros",
        languageLabel: "Idioma",

        // Credits Menu
        creditsTitle: "Créditos",
        creditsProgramming: "Programação",
        creditsProgrammingNames: "Guilherme & Enzo",
        creditsStory: "História & Apoio",
        creditsStoryNames: "Gaby & Yuri",
        creditsIllustration: "Ilustração",
        creditsIllustrationNames: "Alexandre de Souza",
        creditsTech: "Tecnologias",
        creditsTechNames: "HTML, CSS, JavaScript, Tone.js",
        creditsProduction: "Uma produção de",

        // Shop
        shopTitle: "Loja de Melhorias",
        shopCoins: "Moedas: ",
        shopBuyButton: "Comprar",
        shopMaxButton: "Máximo",
        upgradeSpeedName: 'Velocidade +1',
        upgradeSpeedDesc: 'Aumenta a velocidade do personagem.',
        upgradeJumpName: 'Pulo +2',
        upgradeJumpDesc: 'Aumenta a força do pulo.',
        upgradeShortPingName: 'Eco Curto Rápido',
        upgradeShortPingDesc: 'Reduz o cooldown do Q.',
        upgradeLongPingName: 'Eco Longo Rápido',
        upgradeLongPingDesc: 'Reduz o cooldown do E.',
        upgradeHealthName: 'Vida Extra',
        upgradeHealthDesc: 'Aumenta a resistência a danos.',
        upgradeStealthName: 'Furtividade',
        upgradeStealthDesc: 'Reduz o alcance de detecção dos inimigos.',
        upgradeVisionName: 'Visão Melhorada',
        upgradeVisionDesc: 'Aumenta o alcance dos ecos.',
        upgradeLuckName: 'Sorte',
        upgradeLuckDesc: 'Aumenta a chance de encontrar moedas.',
        shopNoSave: "Nenhum jogo carregado. Selecione um save para acessar a loja.",

        // Save Slots
        saveSelectGame: "Selecionar Jogo",
        saveNameGame: "Nomear Jogo",
        saveNamePrompt: "Escolha um nome para seu novo jogo (máx. 15 caracteres).",
        saveNamePlaceholder: "Nome do Save",
        saveSlotEmpty: "Vazio",
        saveSlotLoad: "Carregar",
        saveSlotNewGame: "Novo Jogo",
        saveSlotDelete: "Apagar",
        deleteSaveConfirm: "Tem certeza que deseja apagar este save? Esta ação não pode ser desfeita.",
        premiumUnlockAlert: "Você precisa terminar o jogo ao menos uma vez para desbloquear os saves Premium!",
        saveNameAlert: "Por favor, digite um nome para o save.",

        // Leaderboard
        leaderboardTitle: "Ecos da Escuridão",
        leaderboardWeekly: "Ranking Semanal",
        leaderboardNextReset: "Próximo reset:",
        leaderboardResetDay: "Reseta toda segunda-feira",
        leaderboardLoading: "Sintonizando nos ecos passados...",
        leaderboardShowMore: "Ver mais",

        // Player Name Prompt
        promptNameTitle: "Quem é você?",
        promptNameSubtitle: "Seu nome ecoará na escuridão. (máx. 10 caracteres)",
        playerNamePlaceholder: "Digite seu nome...",

        // In-Game Messages
        hudLevel: "Fase",
        levelIntroButton: "Iniciar Fase",
        levelCompleteTitle: "Nível Concluído!",
        levelCompleteText: "A luz ressoa através de você.",
        nextLevelButton: "Próxima Fase",
        youWereHeardTitle: "Você foi Ouvido",
        youWereHeardText: "O silêncio era sua única defesa.",
        tryAgainButton: "Tentar Novamente",
        corrodedTitle: "Corroído",
        corrodedText: "A escuridão líquida te consome.",
        victoryTitle: "Vitória!",
        victoryText: "Você escapou!", // Dynamic time will be appended
        victoryTime: "Tempo:",
        mainMenuButton: "Menu Principal",
        levelIntroInstructions: "Use [A/D] ou Setas, [Espaço] para pular. [Q] é um eco curto, [E] é um eco longo. Aperte [ESC] para pausar."
    },
    'en': {
        // Main Menu
        gameTitle: "Echo",
        gameSubtitle: "The darkness hears your every step.",
        mainMenuStart: "Start Adventure",
        mainMenuShop: "Shop",
        mainMenuRanking: "Ranking",
        mainMenuChangeSave: "Change Save",
        mainMenuOptions: "Options",
        mainMenuCredits: "Credits",
        activeSave: "Active Save: ",

        // Overlays & Buttons
        buttonBack: "Back",
        buttonConfirm: "Confirm",

        // Pause Menu
        pauseStatus: "STATUS",
        pauseLocation: "Location:",
        pauseTime: "Play Time:",
        pauseFragments: "Fragments (Coins):",
        pauseResume: "Resume Game",
        pauseOptions: "Options",
        pauseMainMenu: "Main Menu",
        
        // Options Menu
        optionsTitle: "Options",
        volumeGeneral: "Master Volume",
        volumeMusic: "Music",
        volumeEffects: "Sound Effects",
        languageLabel: "Language",

        // Credits Menu
        creditsTitle: "Credits",
        creditsProgramming: "Programming",
        creditsProgrammingNames: "Guilherme & Enzo",
        creditsStory: "Story & Support",
        creditsStoryNames: "Gaby & Yuri",
        creditsIllustration: "Illustration",
        creditsIllustrationNames: "Alexandre de Souza",
        creditsTech: "Technologies",
        creditsTechNames: "HTML, CSS, JavaScript, Tone.js",
        creditsProduction: "A production by",

        // Shop
        shopTitle: "Upgrade Shop",
        shopCoins: "Coins: ",
        shopBuyButton: "Buy",
        shopMaxButton: "Maxed",
        upgradeSpeedName: 'Speed +1',
        upgradeSpeedDesc: 'Increases character speed.',
        upgradeJumpName: 'Jump +2',
        upgradeJumpDesc: 'Increases jump strength.',
        upgradeShortPingName: 'Quick Short Echo',
        upgradeShortPingDesc: 'Reduces the cooldown of Q.',
        upgradeLongPingName: 'Quick Long Echo',
        upgradeLongPingDesc: 'Reduces the cooldown of E.',
        upgradeHealthName: 'Extra Health',
        upgradeHealthDesc: 'Increases resistance to damage.',
        upgradeStealthName: 'Stealth',
        upgradeStealthDesc: 'Reduces the detection range of enemies.',
        upgradeVisionName: 'Improved Vision',
        upgradeVisionDesc: 'Increases the range of echoes.',
        upgradeLuckName: 'Luck',
        upgradeLuckDesc: 'Increases the chance of finding coins.',
        shopNoSave: "No game loaded. Select a save file to access the shop.",

        // Save Slots
        saveSelectGame: "Select Game",
        saveNameGame: "Name Save",
        saveNamePrompt: "Choose a name for your new save (max 15 characters).",
        saveNamePlaceholder: "Save Name",
        saveSlotEmpty: "Empty",
        saveSlotLoad: "Load",
        saveSlotNewGame: "New Game",
        saveSlotDelete: "Delete",
        deleteSaveConfirm: "Are you sure you want to delete this save? This action cannot be undone.",
        premiumUnlockAlert: "You need to finish the game at least once to unlock Premium saves!",
        saveNameAlert: "Please enter a name for the save.",

        // Leaderboard
        leaderboardTitle: "Echoes of Darkness",
        leaderboardWeekly: "Weekly Ranking",
        leaderboardNextReset: "Next reset:",
        leaderboardResetDay: "Resets every Monday",
        leaderboardLoading: "Tuning into past echoes...",
        leaderboardShowMore: "Show more",

        // Player Name Prompt
        promptNameTitle: "Who are you?",
        promptNameSubtitle: "Your name will echo in the darkness. (max 10 characters)",
        playerNamePlaceholder: "Enter your name...",

        // In-Game Messages
        hudLevel: "Stage",
        levelIntroButton: "✨ Start Stage ✨",
        levelCompleteTitle: "Level Complete!",
        levelCompleteText: "The light resonates through you.",
        nextLevelButton: "Next Stage",
        youWereHeardTitle: "You Were Heard",
        youWereHeardText: "Silence was your only defense.",
        tryAgainButton: "Try Again",
        corrodedTitle: "Corroded",
        corrodedText: "The liquid darkness consumes you.",
        victoryTitle: "Victory!",
        victoryText: "You have escaped!",
        victoryTime: "Time:",
        mainMenuButton: "Main Menu",
        levelIntroInstructions: "Use [A/D] or Arrow Keys, [Space] to jump. [Q] is a short echo, [E] is a long echo. Press [ESC] to pause."
    },
        'es': {
        // Main Menu
        gameTitle: "Eco",
        gameSubtitle: "La oscuridad escucha cada uno de tus pasos.",
        mainMenuStart: "Iniciar Aventura",
        mainMenuShop: "Almacenar",
        mainMenuRanking: "Categoría",
        mainMenuChangeSave: "Cambiar Guardar",
        mainMenuOptions: "opciones",
        mainMenuCredits: "Créditos",
        activeSave: "Juego activo: ", // Dynamic part will be appended

        // Overlays & Buttons
        buttonBack: "Volver",
        buttonConfirm: "Confirmar",
        
        // Pause Menu
        pauseStatus: "STATUS",
        pauseLocation: "Ubicación:",
        pauseTime: "Tiempo de juego:",
        pauseFragments: "Fragmentos (Monedas):",
        pauseResume: "Continuar juego",
        pauseOptions: "Opciones",
        pauseMainMenu: "Menú principal",

        // Options Menu
        optionsTitle: "Opciones",
        volumeGeneral: "Volumen general",
        volumeMusic: "Música",
        volumeEffects: "Efectos sonoros",
        languageLabel: "Idioma",

        // Credits Menu
        creditsTitle: "Créditos",
        creditsProgramming: "Programación",
        creditsProgrammingNames: "Guilherme & Enzo",
        creditsStory: "Historia & soporte",
        creditsStoryNames: "Gaby & Yuri",
        creditsIllustration: "Ilustración",
        creditsIllustrationNames: "Alexandre de Souza",
        creditsTech: "Tecnologías",
        creditsTechNames: "HTML, CSS, JavaScript, Tone.js",
        creditsProduction: "una producción de",

        // Shop
        shopTitle: "Tienda de actualización",
        shopCoins: "Monedas: ",
        shopBuyButton: "Comprar",
        shopMaxButton: "Máximo",
        upgradeSpeedName: 'Velocidad +1',
        upgradeSpeedDesc: 'Aumenta la velocidad del personaje.',
        upgradeJumpName: 'Saltar +2',
        upgradeJumpDesc: 'Aumenta la fuerza del salto.',
        upgradeShortPingName: 'Eco corto rápido',
        upgradeShortPingDesc: 'Reduce el tiempo de reutilización de Q.',
        upgradeLongPingName: 'Eco largo rápido',
        upgradeLongPingDesc: 'Reduce el tiempo de reutilización de la E.',
        upgradeHealthName: 'vida extra',
        upgradeHealthDesc: 'Aumenta la resistencia al daño.',
        upgradeStealthName: 'Sigilo',
        upgradeStealthDesc: 'Reduce el rango de detección del enemigo.',
        upgradeVisionName: 'Visión mejorada',
        upgradeVisionDesc: 'Aumenta el rango de ecos.',
        upgradeLuckName: 'Suerte',
        upgradeLuckDesc: 'Aumenta la posibilidad de encontrar monedas.',
        shopNoSave: "No hay juego cargado. Selecciona una partida guardada para acceder a la tienda.",

        // Save Slots
        saveSelectGame: "Seleccionar juego",
        saveNameGame: "Juego de nombres",
        saveNamePrompt: "Elige un nombre para tu nuevo juego (máximo 15 caracteres).",
        saveNamePlaceholder: "Guardar nombre",
        saveSlotEmpty: "Vacío",
        saveSlotLoad: "para cargar",
        saveSlotNewGame: "Nuevo juego",
        saveSlotDelete: "apagar",
        deleteSaveConfirm: "¿Seguro que quieres eliminar este archivo guardado? Esta acción no se puede deshacer.",
        premiumUnlockAlert: "¡Tienes que terminar el juego al menos una vez para desbloquear partidas guardadas Premium!",
        saveNameAlert: "Introduzca un nombre para guardar.",

        // Leaderboard
        leaderboardTitle: "Ecos de la oscuridad",
        leaderboardWeekly: "Clasificación Semanal",
        leaderboardNextReset: "Próximo reinicio:",
        leaderboardResetDay: "Se reinicia todos los lunes",
        leaderboardLoading: "Sintonizando con ecos del pasado...",
        leaderboardShowMore: "Ver más",

        // Player Name Prompt
        promptNameTitle: "¿Quién eres?",
        promptNameSubtitle: "Tu nombre resonará en la oscuridad. (máx. 10 caracteres)",
        playerNamePlaceholder: "Introduce tu nombre...",

        // In-Game Messages
        hudLevel: "Fase",
        levelIntroButton: "Iniciar la fase",
        levelCompleteTitle: "¡Nivel completado!",
        levelCompleteText: "La luz resuena a través de ti.",
        nextLevelButton: "Próxima fase",
        youWereHeardTitle: "fuiste escuchado",
        youWereHeardText: "El silencio era su única defensa.",
        tryAgainButton: "Intentar otra vez",
        corrodedTitle: "Corroído",
        corrodedText: "La oscuridad líquida te consume.",
        victoryTitle: "¡Victoria!",
        victoryText: "¡Escapaste!", // Dynamic time will be appended
        victoryTime: "Tiempo:",
        mainMenuButton: "Menú principal",
        levelIntroInstructions: "Usa [A/D] o las flechas, [Espacio] para saltar. [Q] es un eco corto, [E] es un eco largo. Pulsa [ESC] para pausar."
    }
};