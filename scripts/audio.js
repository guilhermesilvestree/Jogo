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
    isTense: false,
    originalBpm: 120,

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
    // --- NOVOS SONS PARA TENSÃO ---
    heartbeat: new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 3, envelope: { attack: 0.001, decay: 0.25, sustain: 0 }, volume: -12 }).toDestination(),
    alarmSynth: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 }, volume: -18 }).toDestination(),
    
    shimmerReverb: new Tone.Reverb(5).toDestination(),
    delay: new Tone.FeedbackDelay("8n", 0.5).toDestination(),
    padSynth: null,
    musicLoop: null,
    // --- NOVOS LOOPS PARA TENSÃO ---
    heartbeatLoop: null,
    alarmLoop: null,

    /**
     * Inicia a reprodução da música ambiente do jogo.
     */
    startAmbientMusic: function () {
        if (this.musicLoop) return;
        Tone.Transport.bpm.value = this.originalBpm;

        this.musicLoop = new Tone.Loop(time => {
            this.padSynth.triggerAttackRelease("C3", "16n", time);
            this.padSynth.triggerAttackRelease("G2", "16n", time + 0.5);
            this.lowDrone.triggerAttackRelease("C1", "4n", time + Math.random() * 2);
            if (Math.random() < 0.2) {
                this.ambianceSynth.triggerAttackRelease(["C3", "Eb3", "G3"], "2n", time + Math.random() * 4);
            }
        }, "8n").start(0);
        Tone.Transport.start();
    },

    /**
     * Para a reprodução da música ambiente do jogo.
     */
    stopAmbientMusic: function () {
        if (this.musicLoop) {
            this.musicLoop.stop();
            this.musicLoop.dispose();
            this.musicLoop = null;
        }
        if (this.isTense) {
            this.decreaseTension(0);
        }
        Tone.Transport.stop();
    },
    
    /**
     * Inicia a transição para a música de perseguição.
     */
    increaseTension: function(time = 1.0) {
        if (this.isTense) return;
        this.isTense = true;
        
        // --- EFEITOS DE TENSÃO MAIS AGRESSIVOS ---
        Tone.Transport.bpm.rampTo(this.originalBpm * 1.6, time); 
        this.lowDrone.harmonicity.rampTo(3.5, time);
        this.lowDrone.volume.rampTo(-18, time); // Aumenta o volume do drone

        // Inicia o loop de batimento cardíaco
        if (!this.heartbeatLoop) {
            this.heartbeatLoop = new Tone.Loop(loopTime => {
                this.heartbeat.triggerAttackRelease("C1", "8n", loopTime);
            }, "4n").start(0);
        }
        
        // Inicia o loop do alarme
        if (!this.alarmLoop) {
            this.alarmLoop = new Tone.Loop(loopTime => {
                if(Math.random() < 0.4) { // Toca esporadicamente
                    this.alarmSynth.triggerAttackRelease("G#5", "16n", loopTime);
                }
            }, "2n").start(0);
        }
    },

    /**
     * Retorna a música ao estado normal.
     */
    decreaseTension: function(time = 2.0) {
        if (!this.isTense) return;
        this.isTense = false;

        // Retorna os parâmetros ao normal
        Tone.Transport.bpm.rampTo(this.originalBpm, time);
        this.lowDrone.harmonicity.rampTo(0.5, time);
        this.lowDrone.volume.rampTo(-25, time);

        // Para e remove os loops de tensão
        if (this.heartbeatLoop) {
            this.heartbeatLoop.stop();
            this.heartbeatLoop.dispose();
            this.heartbeatLoop = null;
        }
        if (this.alarmLoop) {
            this.alarmLoop.stop();
            this.alarmLoop.dispose();
            this.alarmLoop = null;
        }
    },

    /**
     * Inicia o contexto de áudio do Tone.js.
     */
    initAudio: async function () {
        if (this.audioReady) return;
        await Tone.start();
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
     * Atualiza os volumes dos sintetizadores e efeitos.
     */
    updateVolumes: function () {
        const masterValue = parseFloat(masterVolumeSlider.value);
        const masterdB = (masterValue / 100) * 40 - 40;
        Tone.Master.volume.value = masterdB > -40 ? masterdB : -Infinity;

        const musicValue = parseFloat(musicVolumeSlider.value);
        const musicdB = (musicValue / 100) * 40 - 40;
        const finalMusicVolume = musicdB > -40 ? musicdB : -Infinity;
        
        // Aplica o volume a todos os sons da música, incluindo os de tensão
        this.ambianceSynth.volume.value = finalMusicVolume;
        this.lowDrone.volume.value = this.isTense ? finalMusicVolume - 7 : finalMusicVolume; // Ajusta o volume do drone
        this.padSynth.volume.value = finalMusicVolume;
        this.heartbeat.volume.value = finalMusicVolume + 2; // Batimento cardíaco mais proeminente
        this.alarmSynth.volume.value = finalMusicVolume - 6; // Alarme um pouco mais baixo para não irritar

        const effectsValue = parseFloat(effectsVolumeSlider.value);
        const effectsdB = (effectsValue / 100) * 40 - 40;
        const finalEffectsVolume = effectsdB > -40 ? effectsdB : -Infinity;

        Object.values(this.sounds).forEach(sound => {
            if (sound.volume) sound.volume.value = finalEffectsVolume;
        });
    }
};

GameAudio.padSynth = new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 4, decay: 0, sustain: 1, release: 8 }, volume: -30 }).chain(GameAudio.delay, GameAudio.shimmerReverb, Tone.Destination);

if (masterVolumeSlider) masterVolumeSlider.addEventListener('input', () => { GameAudio.updateVolumes(); GameAudio.saveVolumeSettings(); });
if (musicVolumeSlider) musicVolumeSlider.addEventListener('input', () => { GameAudio.updateVolumes(); GameAudio.saveVolumeSettings(); });
if (effectsVolumeSlider) effectsVolumeSlider.addEventListener('input', () => { GameAudio.updateVolumes(); GameAudio.saveVolumeSettings(); });