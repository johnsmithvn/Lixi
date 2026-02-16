import { APP_CONFIG } from './src/core/config.js';
import { eventBus } from './src/core/eventBus.js';
import { createGameEngine } from './src/game/gameEngine.js';
import { createRenderer } from './src/ui/renderer.js';
import { playRevealAnimation } from './src/ui/envelope.js';
import { createModalController } from './src/ui/modal.js';
import { createConfettiController } from './src/effects/confetti.js';
import { createSoundController } from './src/effects/sound.js';
import { vibrate } from './src/effects/vibration.js';

const renderer = createRenderer();
const modal = createModalController();
const confetti = createConfettiController();
const sounds = createSoundController();
const game = createGameEngine(eventBus);

let lastSpeechAt = 0;
let openingInProgress = false;

function buildShareText(result) {
    const streakLine = result.streak > 0 ? `🔥 Chuỗi may mắn: x${result.streak}` : '🔥 Chuỗi may mắn: reset';

    return [
        '🧧 Máy Lì Xì PRO++',
        result.title,
        result.text,
        streakLine,
        result.blessing ?? 'Chúc bạn năm mới nhiều may mắn và bình an! ✨',
        '',
        `Thử vận may tại đây: ${window.location.href}`
    ].join('\n');
}

async function shareResult(result) {
    if (!result) {
        return;
    }

    const text = buildShareText(result);

    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Máy Lì Xì PRO++',
                text
            });
            return;
        } catch {
            // Fallback to clipboard.
        }
    }

    if (navigator.clipboard) {
        try {
            await navigator.clipboard.writeText(text);
            modal.showShareFeedback('✅ Đã copy!');
            return;
        } catch {
            // Keep fallback message below.
        }
    }

    modal.showShareFeedback('❌ Trình duyệt chặn share');
}

function showLockedState(payload) {
    modal.hide();
    renderer.showLockedScreen(payload);
}

function maybeShowLockedState() {
    const fate = game.getActiveFate();
    if (!fate) {
        return false;
    }

    showLockedState({
        mode: game.getGameMode(),
        fate
    });
    return true;
}

function handleRoundReady(payload) {
    renderer.renderEnvelopes(payload.envelopes, {
        onHover: (index) => eventBus.emit('ui:hover-envelope', { index }),
        onLeave: () => eventBus.emit('ui:hover-leave'),
        onOpen: (index, element) => eventBus.emit('ui:open-envelope', { index, element })
    });

    renderer.showScreen('game-screen');
}

function handleStateUpdated(gameState) {
    renderer.updateHud(gameState);
}

function handleEnvelopeHover() {
    const now = Date.now();
    if (now - lastSpeechAt < APP_CONFIG.speechDebounceMs) {
        return;
    }

    lastSpeechAt = now;
    renderer.showSpeech(game.getHoverQuote());
}

async function handleEnvelopeOpen(payload) {
    if (openingInProgress) {
        return;
    }

    const { index, element } = payload;
    const result = game.openEnvelope(index);
    if (!result) {
        return;
    }

    openingInProgress = true;
    game.setBusy(true);

    try {
        renderer.markEnvelopeOpened(element);
        renderer.hideSpeech(true);

        vibrate(APP_CONFIG.effects.vibrationMs);
        sounds.playClick();

        await playRevealAnimation(element);

        confetti.fire(result.confettiCount);
        if (result.type === 'money') {
            sounds.playWin();
        }

        modal.show(result, {
            onTrollReveal: () => {
                sounds.playTroll();
                confetti.fire(APP_CONFIG.effects.confetti.trollReveal);
            }
        });
    } finally {
        game.setBusy(false);
        openingInProgress = false;
    }
}

function handlePlayAgain() {
    modal.hide();

    if (maybeShowLockedState()) {
        return;
    }

    if (game.isRoundComplete()) {
        game.startRound();
    }
}

function handleCloseModal() {
    modal.hide();
    maybeShowLockedState();
}

function bootstrap() {
    sounds.init();

    renderer.init(
        {
            onStart: () => eventBus.emit('ui:start')
        },
        {
            petalSymbols: game.getPetalSymbols()
        }
    );

    modal.init({
        onClose: () => eventBus.emit('ui:modal-close'),
        onPlayAgain: () => eventBus.emit('ui:play-again'),
        onShare: (result) => eventBus.emit('ui:share-result', { result })
    });

    eventBus.on('ui:start', () => game.startSession());
    eventBus.on('round:ready', handleRoundReady);
    eventBus.on('state:updated', handleStateUpdated);
    eventBus.on('session:locked', showLockedState);

    eventBus.on('ui:hover-envelope', handleEnvelopeHover);
    eventBus.on('ui:hover-leave', () => renderer.hideSpeech(false));
    eventBus.on('ui:open-envelope', (payload) => {
        void handleEnvelopeOpen(payload);
    });

    eventBus.on('ui:play-again', handlePlayAgain);
    eventBus.on('ui:modal-close', handleCloseModal);
    eventBus.on('ui:share-result', (payload) => {
        void shareResult(payload.result);
    });

    renderer.showScreen('welcome-screen');
    window.addEventListener('load', () => sounds.preload());
}

document.addEventListener('DOMContentLoaded', bootstrap);
