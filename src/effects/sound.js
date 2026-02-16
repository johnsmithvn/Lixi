let audioContext;

function getAudioContext() {
    if (!audioContext) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioContext = new AudioContextClass();
        }
    }

    return audioContext;
}

async function unlockAudioContext() {
    const ctx = getAudioContext();
    if (!ctx) {
        return;
    }

    if (ctx.state === 'suspended') {
        try {
            await ctx.resume();
        } catch {
            // Ignore resume errors.
        }
    }
}

function hasPlayableSource(audioElement) {
    return Boolean(audioElement && (audioElement.currentSrc || audioElement.src));
}

async function tryPlayElement(id) {
    const element = document.getElementById(id);
    if (!hasPlayableSource(element)) {
        return false;
    }

    try {
        element.currentTime = 0;
        await element.play();
        return true;
    } catch {
        return false;
    }
}

function playTonePattern(notes) {
    const ctx = getAudioContext();
    if (!ctx) {
        return;
    }

    let cursor = ctx.currentTime;

    notes.forEach((note) => {
        const oscillator = ctx.createOscillator();
        const gain = ctx.createGain();

        oscillator.type = note.type ?? 'sine';
        oscillator.frequency.setValueAtTime(note.frequency, cursor);

        gain.gain.setValueAtTime(0.0001, cursor);
        gain.gain.exponentialRampToValueAtTime(note.gain ?? 0.12, cursor + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, cursor + note.duration);

        oscillator.connect(gain);
        gain.connect(ctx.destination);

        oscillator.start(cursor);
        oscillator.stop(cursor + note.duration);

        cursor += note.duration + 0.02;
    });
}

function playFallback(effectType) {
    if (effectType === 'click') {
        playTonePattern([
            { frequency: 820, duration: 0.05, type: 'triangle', gain: 0.08 },
            { frequency: 980, duration: 0.06, type: 'triangle', gain: 0.07 }
        ]);
        return;
    }

    if (effectType === 'win') {
        playTonePattern([
            { frequency: 660, duration: 0.09, type: 'sine', gain: 0.12 },
            { frequency: 880, duration: 0.11, type: 'sine', gain: 0.12 },
            { frequency: 1180, duration: 0.12, type: 'sine', gain: 0.12 }
        ]);
        return;
    }

    playTonePattern([
        { frequency: 480, duration: 0.08, type: 'sawtooth', gain: 0.11 },
        { frequency: 380, duration: 0.08, type: 'sawtooth', gain: 0.11 },
        { frequency: 300, duration: 0.12, type: 'triangle', gain: 0.1 }
    ]);
}

async function playEffect(audioId, fallbackType) {
    await unlockAudioContext();
    const played = await tryPlayElement(audioId);
    if (!played) {
        playFallback(fallbackType);
    }
}

export function createSoundController() {
    function init() {
        const unlockHandler = () => {
            void unlockAudioContext();
        };

        window.addEventListener('pointerdown', unlockHandler, { once: true });
        window.addEventListener('keydown', unlockHandler, { once: true });
    }

    function preload() {
        document.querySelectorAll('audio').forEach((audio) => {
            audio.load();
        });
    }

    function playClick() {
        void playEffect('click-sfx', 'click');
    }

    function playWin() {
        void playEffect('win-sfx', 'win');
    }

    function playTroll() {
        void playEffect('troll-sfx', 'troll');
    }

    return {
        init,
        preload,
        playClick,
        playWin,
        playTroll
    };
}
