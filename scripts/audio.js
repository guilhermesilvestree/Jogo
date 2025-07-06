// =================================================================
// JOGO: ECO-LOCALIZADOR (Edição Gemini) - SISTEMA DE ÁUDIO
// =================================================================

// Elementos HTML dos sliders de volume
const masterVolumeSlider = document.getElementById('master-volume-slider');
const musicVolumeSlider = document.getElementById('music-volume-slider');
const effectsVolumeSlider = document.getElementById('effects-volume-slider');

// Objeto global para gerenciar todo o áudio do jogo
const GameAudio = {
    audioReady: false,

    // Definições de sons usando a biblioteca Tone.js
    sounds: {
        shortPing: new Tone.Synth({ oscillator: { type: 'sine' }, envelope: { attack: 0.005, decay: 0.1, sustain: 0.3, release: 0.1 } }).toDestination(),
        longPing: new Tone.FMSynth({ modulationIndex: 10, envelope: { attack: 0.01, decay: 0.2 }, harmonicity: 3 }).toDestination(),
        jump: new Tone.MembraneSynth({ pitchDecay: 0.01, octaves: 2, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).toDestination(),
        step: new Tone.NoiseSynth({ noise: { type: 'pink' }, envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).toDestination(),
        enemyAlert: new Tone.AMSynth({ harmonicity: 1.5, envelope: { attack: 0.01, decay: 0.2 } }).toDestination(),
        splash: new Tone.MembraneSynth({ pitchDecay: 0.1, octaves: 4, envelope: { attack: 0.05, decay: 0.4, sustain: 0 } }).toDestination(),
        levelWin: new Tone.PluckSynth({ attackNoise: 1, dampening: 2000, resonance: 0.9 }).toDestination(),
        levelWinExplosion: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { attack: 0.1, decay: 1.5, sustain: 0 } }).toDestination(),
        gameWin: new Tone.Synth({ oscillator: { type: 'fatsawtooth' }, envelope: { attack: 0.5, decay: 2, sustain: 0.1, release: 1 } }).toDestination(),
        gameOver: new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 8, envelope: { attack: 0.01, decay: 0.8, sustain: 0 } }).toDestination(),
        pauseIn: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }, volume: -10 }).toDestination(),
        pauseOut: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.2, sustain: 0, release: 0.1 }, volume: -10 }).toDestination()
    },

    // Sintetizadores e efeitos para música ambiente
    ambianceSynth: new Tone.PolySynth(Tone.Synth, { oscillator: { type: "sawtooth" }, envelope: { attack: 2, decay: 1, sustain: 0.5, release: 3 }, volume: -20 }).toDestination(),
    lowDrone: new Tone.FMSynth({ harmonicity: 0.5, modulationIndex: 1, envelope: { attack: 5, decay: 0.1, sustain: 1, release: 10 }, modulation: { type: "sine" }, detune: 0, volume: -25 }).toDestination(),
    shimmerReverb: new Tone.Reverb(5).toDestination(),
    delay: new Tone.FeedbackDelay("8n", 0.5).toDestination(),
    padSynth: null, // Inicializado após a definição completa de GameAudio
    musicLoop: null,

    /**
     * Inicia a reprodução da música ambiente do jogo.
     */
    startAmbientMusic: function () {
        const self = this; // Captura o contexto do GameAudio
        if (self.musicLoop) return; // Evita iniciar múltiplos loops

        self.musicLoop = new Tone.Loop(time => {
            self.padSynth.triggerAttackRelease("C3", "16n", time);
            self.padSynth.triggerAttackRelease("G2", "16n", time + 0.5);
            self.lowDrone.triggerAttackRelease("C1", "4n", time + Math.random() * 2);
            if (Math.random() < 0.2) {
                self.ambianceSynth.triggerAttackRelease(["C3", "Eb3", "G3"], "2n", time + Math.random() * 4);
            }
        }, "8n");
        self.musicLoop.start(0); // Inicia o loop
        Tone.Transport.start(); // Inicia o transporte de áudio do Tone.js
    },

    /**
     * Para a reprodução da música ambiente do jogo.
     */
    stopAmbientMusic: function () {
        if (this.musicLoop) {
            this.musicLoop.stop();
            this.musicLoop.dispose(); // Libera os recursos do loop
            this.musicLoop = null;
        }
        Tone.Transport.stop(); // Para o transporte de áudio do Tone.js
    },

    /**
     * Inicializa o contexto de áudio do Tone.js, necessário para a reprodução.
     */
    initAudio: async function () {
        if (this.audioReady) return; // Evita inicializar múltiplas vezes
        await Tone.start(); // Inicia o contexto de áudio
        this.audioReady = true;
    },

    /**
     * Salva as configurações de volume no LocalStorage.
     */
    saveVolumeSettings: function () {
        localStorage.setItem('eco_volume_master', masterVolumeSlider.value);
        localStorage.setItem('eco_volume_music', musicVolumeSlider.value);
        localStorage.setItem('eco_volume_effects', effectsVolumeSlider.value);
    },

    /**
     * Carrega as configurações de volume do LocalStorage.
     */
    loadVolumeSettings: function () {
        const master = localStorage.getItem('eco_volume_master');
        const music = localStorage.getItem('eco_volume_music');
        const effects = localStorage.getItem('eco_volume_effects');
        if (master !== null) masterVolumeSlider.value = master;
        if (music !== null) musicVolumeSlider.value = music;
        if (effects !== null) effectsVolumeSlider.value = effects;
    },

    /**
     * Atualiza os volumes dos sintetizadores e efeitos com base nos sliders.
     */
    updateVolumes: function () {
        const masterValue = parseFloat(masterVolumeSlider.value);
        const masterdB = (masterValue / 100) * 40 - 40; // Converte para decibéis
        Tone.Master.volume.value = masterdB > -40 ? masterdB : -Infinity; // Define o volume mestre

        const musicValue = parseFloat(musicVolumeSlider.value);
        const musicdB = (musicValue / 100) * 40 - 40;
        this.ambianceSynth.volume.value = musicdB > -40 ? musicdB : -Infinity;
        this.lowDrone.volume.value = musicdB > -40 ? musicdB : -Infinity;
        this.padSynth.volume.value = musicdB > -40 ? musicdB : -Infinity;

        const effectsValue = parseFloat(effectsVolumeSlider.value);
        const effectsdB = (effectsValue / 100) * 40 - 40;
        // Percorre todos os sons e atualiza seus volumes
        Object.values(this.sounds).forEach(sound => {
            if (sound.volume) sound.volume.value = effectsdB > -40 ? effectsdB : -Infinity;
        });
    }
};

// Inicialização de padSynth após a definição de GameAudio para garantir que delay e shimmerReverb estejam disponíveis
GameAudio.padSynth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 4, decay: 0, sustain: 1, release: 8 }, volume: -30 }).chain(GameAudio.delay, GameAudio.shimmerReverb, Tone.Destination);

// --- LISTENERS DOS SLIDERS DE VOLUME ---
// Adiciona listeners para atualizar e salvar as configurações de volume quando os sliders são movidos
if (masterVolumeSlider) masterVolumeSlider.addEventListener('input', () => { GameAudio.updateVolumes(); GameAudio.saveVolumeSettings(); });
if (musicVolumeSlider) musicVolumeSlider.addEventListener('input', () => { GameAudio.updateVolumes(); GameAudio.saveVolumeSettings(); });
if (effectsVolumeSlider) effectsVolumeSlider.addEventListener('input', () => { GameAudio.updateVolumes(); GameAudio.saveVolumeSettings(); });