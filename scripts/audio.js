// =================================================================
// JOGO: ECO-LOCALIZADOR (Edição Gemini) - SISTEMA DE ÁUDIO (OTIMIZADO)
// =================================================================

const GameAudio = {
    audioReady: false,
    isTense: false,
    originalBpm: 120,
    isMusicPlaying: false,

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

    musicSynths: {
        pad: new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 4, decay: 0.1, sustain: 0.8, release: 4 }, volume: -22 }).chain(new Tone.Reverb(6).toDestination()),
        lowDrone: new Tone.FMSynth({ harmonicity: 0.5, modulationIndex: 1, envelope: { attack: 5, decay: 0.1, sustain: 1, release: 5 }, volume: -28 }).toDestination(),
        heartbeat: new Tone.MembraneSynth({ pitchDecay: 0.2, octaves: 3, envelope: { attack: 0.001, decay: 0.25, sustain: 0 }, volume: -12 }).toDestination(),
        alarm: new Tone.Synth({ oscillator: { type: 'triangle' }, envelope: { attack: 0.01, decay: 0.3, sustain: 0.1, release: 0.5 }, volume: -20 }).toDestination(),
        tensionSynth: new Tone.FMSynth({ harmonicity: 1.5, modulationIndex: 5, envelope: { attack: 0.01, decay: 0.1, release: 0.1 }, volume: -25 }).toDestination(),
        menuMelody: new Tone.Synth({ oscillator: { type: "sine" }, envelope: { attack: 2, decay: 0.5, sustain: 0.7, release: 3 }, volume: -20 }).chain(new Tone.Reverb(8), Tone.Destination),
        menuPad: new Tone.PolySynth(Tone.Synth, { oscillator: { type: "triangle" }, envelope: { attack: 4, decay: 1, sustain: 0.8, release: 4 }, volume: -25, maxPolyphony: 2 }).chain(new Tone.Reverb(10), Tone.Destination),
    },

    ambientPart: null,
    musicSchedulerLoop: null,
    tensionPart: null,
    tensionLoops: { heartbeat: null, alarm: null },
    menuLoop: null,

    releaseAllSynths: function() {
        for (const synth of Object.values(this.musicSynths)) {
            if (synth && typeof synth.releaseAll === 'function') {
                synth.releaseAll();
            }
        }
    },

    startAmbientMusic: async function () {
        if (this.isMusicPlaying && !this.menuLoop && !this.isTense) return;
        await this.initAudio();
        this.stopAllMusic();
        this.isMusicPlaying = true;
    
        Tone.Transport.bpm.value = this.originalBpm;
        if (Tone.Transport.state !== 'started') Tone.Transport.start();
    
        const patterns = [
            [["0:0", "C2"], ["0:2", "G2"]],
            [["0:1", "Eb2"], ["0:3", "Bb2"]],
            [["0:0", "F2"], ["0:2:2", "C3"]],
        ];
    
        this.ambientPart = new Tone.Part((time, note) => {
            this.musicSynths.pad.triggerAttackRelease(note, "2n", time);
        }, patterns[0]).start(0); // Inicia no tempo 0 do loop

        this.ambientPart.loop = true;
        this.ambientPart.loopEnd = "1m";
    
        this.musicSchedulerLoop = new Tone.Loop(time => {
            const currentPattern = patterns[Math.floor(Math.random() * patterns.length)];
            this.ambientPart.clear().set({ value: currentPattern });
            if (Math.random() < 0.5) {
                this.musicSynths.lowDrone.triggerAttackRelease("C1", "4m", time);
            }
        }, "2m").start(Tone.now());
    },
    
    startMenuMusic: async function () {
        if (this.isMusicPlaying && this.menuLoop) return;
        await this.initAudio();
        this.stopAllMusic();
        this.isMusicPlaying = true;
    
        Tone.Transport.bpm.value = 60;
        if (Tone.Transport.state !== 'started') Tone.Transport.start();
    
        this.menuLoop = new Tone.Loop(time => {
            const melodyNotes = ["C4", "E4", "G4", "A4", "G4", "E4"];
            const noteIndex = Math.floor((Tone.Transport.seconds / 2) % melodyNotes.length);
            this.musicSynths.menuMelody.triggerAttackRelease(melodyNotes[noteIndex], "2n", time);
    
            if (Math.random() < 0.3) {
                this.musicSynths.menuPad.triggerAttackRelease(["C3", "G3"], "1m", time);
            }
        }, "1n").start(0);
    },

    startAllMusic: async function() {
        if (this.menuLoop) {
            await this.startMenuMusic();
        } else {
            await this.startAmbientMusic();
        }
    },

    stopAllMusic: function() {
        if (this.ambientPart) { this.ambientPart.stop(0).dispose(); this.ambientPart = null; }
        if (this.musicSchedulerLoop) { this.musicSchedulerLoop.stop(0).dispose(); this.musicSchedulerLoop = null; }
        if (this.menuLoop) { this.menuLoop.stop(0).dispose(); this.menuLoop = null; }
        if (this.tensionPart) { this.tensionPart.stop(0).dispose(); this.tensionPart = null; }
        
        Object.values(this.tensionLoops).forEach((loop, i) => {
            if (loop) {
                loop.stop(0).dispose();
                this.tensionLoops[Object.keys(this.tensionLoops)[i]] = null;
            }
        });

        this.releaseAllSynths();
        this.isMusicPlaying = false;
        this.isTense = false;
    },

    increaseTension: function() {
        if (this.isTense) return;
        this.isTense = true;
        
        // Para a música ambiente IMEDIATAMENTE
        if (this.ambientPart) {
            this.ambientPart.stop(0).dispose();
            this.ambientPart = null;
        }
        if (this.musicSchedulerLoop) {
            this.musicSchedulerLoop.stop(0).dispose();
            this.musicSchedulerLoop = null;
        }
        this.releaseAllSynths();

        // Altera o BPM instantaneamente
        Tone.Transport.bpm.value = this.originalBpm * 1.5;
        if (Tone.Transport.state !== 'started') Tone.Transport.start();


        // Inicia os sons de perseguição
        if (!this.tensionLoops.heartbeat) {
            this.tensionLoops.heartbeat = new Tone.Loop(loopTime => {
                this.musicSynths.heartbeat.triggerAttackRelease("C1", "8n", loopTime);
            }, "4n").start(0); // Modificado para start(0) - Inicia no começo do próximo loop
        } else {
            this.tensionLoops.heartbeat.start(0); // Garante que, se já existia, inicie do 0
        }
        
        if (!this.tensionLoops.alarm) {
            this.tensionLoops.alarm = new Tone.Loop(loopTime => {
                if (Math.random() < 0.4) {
                    this.musicSynths.alarm.triggerAttackRelease("G#5", "16n", loopTime);
                }
            }, "2n").start(0); // Modificado para start(0) - Inicia no começo do próximo loop
        } else {
            this.tensionLoops.alarm.start(0); // Garante que, se já existia, inicie do 0
        }

        // Inicia a melodia de tensão
        const tensionPattern = [ ["0:0", "C#3"], ["0:1:2", "D3"], ["0:3", "C#3"] ];
        if (!this.tensionPart) {
            this.tensionPart = new Tone.Part((time, note) => {
                this.musicSynths.tensionSynth.triggerAttackRelease(note, "16n", time);
            }, tensionPattern).start(0); // Modificado para start(0) - Inicia no começo do próximo loop
            this.tensionPart.loop = true;
            this.tensionPart.loopEnd = "2n"; // Certifique-se que o loopEnd está correto para o padrão
        } else {
            this.tensionPart.start(0); // Garante que, se já existia, inicie do 0
        }
    },

    decreaseTension: function() {
        if (!this.isTense) return;
        this.isTense = false;

        // Para as partes de tensão IMEDIATAMENTE
        if (this.tensionPart) { 
            this.tensionPart.stop(0).dispose();
            this.tensionPart = null; 
        }
        Object.values(this.tensionLoops).forEach((loop, i) => {
            if (loop) {
                loop.stop(0).dispose();
                this.tensionLoops[Object.keys(this.tensionLoops)[i]] = null;
            }
        });
        
        this.releaseAllSynths();

        // Retorna o BPM ao normal instantaneamente
        Tone.Transport.bpm.value = this.originalBpm;

        this.isMusicPlaying = false;
        this.startAmbientMusic();
    },

    initAudio: async function () {
        if (this.audioReady) return;
        try {
            if (Tone.context.state === 'running') {
                this.audioReady = true;
                return;
            }
            await Tone.start();
            this.audioReady = true;
            console.log('AudioContext iniciado com sucesso');
        } catch (error) {
            console.error('Erro ao iniciar AudioContext:', error);
        }
    },

    updateVolumes: function () {
        if (!window.ecoGame || !window.ecoGame.gameSettings) return;

        const settings = window.ecoGame.gameSettings;
        const masterdB = (settings.masterVolume / 100) * 40 - 40;
        Tone.getDestination().volume.value = masterdB > -40 ? masterdB : -Infinity;

        const musicdB = (settings.musicVolume / 100) * 40 - 40;
        const finalMusicVolume = musicdB > -40 ? musicdB : -Infinity;
        
        for (const synth of Object.values(this.musicSynths)) {
            if (synth?.volume) {
                 synth.volume.value = finalMusicVolume;
            }
        }

        const effectsdB = (settings.effectsVolume / 100) * 40 - 40;
        const finalEffectsVolume = effectsdB > -40 ? effectsdB : -Infinity;

        for (const sound of Object.values(this.sounds)) {
            if (sound?.volume) {
                sound.volume.value = finalEffectsVolume;
            }
        }
    }
};