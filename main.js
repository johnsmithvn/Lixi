import { APP_CONFIG } from './src/core/config.js';
import { eventBus } from './src/core/eventBus.js';
import { createGameEngine } from './src/game/gameEngine.js';
import { createRenderer } from './src/ui/renderer.js';
import { playRevealAnimation } from './src/ui/envelope.js';
import { createModalController } from './src/ui/modal.js';
import { createQuizModalController } from './src/ui/quizModal.js';
import { createConfettiController } from './src/effects/confetti.js';
import { createSoundController } from './src/effects/sound.js';
import { vibrate } from './src/effects/vibration.js';

const renderer = createRenderer();
const modal = createModalController();
const quizModal = createQuizModalController();
const confetti = createConfettiController();
const sounds = createSoundController();
const game = createGameEngine(eventBus);

let lastSpeechAt = 0;
let openingInProgress = false;

function buildShareText(result) {
    const streakLine = result.streak > 0 ? `🔥 Chuỗi may mắn: x${result.streak}` : '🔥 Chuỗi may mắn: reset';
    const claimLine = result.type === 'money'
        ? (result.claimNote ?? '📸 Chụp ảnh màn hình gửi chủ thớt để lĩnh xèng nha!')
        : null;

    const lines = [
        '🧧 Máy Lì Xì PRO++',
        result.title,
        result.text,
        streakLine,
        result.blessing ?? 'Chúc bạn năm mới nhiều may mắn và bình an! ✨'
    ];

    if (claimLine) {
        lines.push(claimLine);
    }

    lines.push('', `Thử vận may tại đây: ${window.location.href}`);
    return lines.join('\n');
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

function getEnvelopeHandlers() {
    return {
        onHover: () => eventBus.emit('ui:hover-envelope'),
        onLeave: () => eventBus.emit('ui:hover-leave'),
        onOpen: (index, element) => eventBus.emit('ui:open-envelope', { index, element })
    };
}

function renderCurrentGrid() {
    renderer.renderEnvelopes(game.getState().envelopes, getEnvelopeHandlers());
    renderer.showScreen('game-screen');
}

function showLockedState(payload) {
    modal.hide();
    quizModal.close();
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

function maybeShowExtraChancePrompt() {
    if (!game.canOfferExtraChance()) {
        return false;
    }

    modal.hide();
    quizModal.close();

    renderer.showExtraChanceScreen(
        {
            result: game.getState().currentResult,
            quiz: game.getQuizStatus()
        },
        {
            onStartQuiz: () => eventBus.emit('ui:start-quiz')
        }
    );

    return true;
}

function openQuizKindPicker() {
    const quizKinds = game.getQuizKinds();
    quizModal.openCategoryPicker(quizKinds, game.getQuizStatus());
}

function handleRoundReady(payload) {
    renderer.renderEnvelopes(payload.envelopes, getEnvelopeHandlers());
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
            showExtraChanceButton: game.canOfferExtraChance(),
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

function handleStartQuiz() {
    if (!game.canOfferExtraChance()) {
        return;
    }

    modal.hide();
    openQuizKindPicker();
}

function handleQuizKindSelected(payload) {
    if (!payload?.quizKind) {
        return;
    }

    const question = game.startQuizChallenge(payload.quizKind);
    if (!question) {
        return;
    }

    quizModal.openQuestion(question, game.getQuizStatus());
}

function handleQuizAnswer(payload) {
    const feedback = game.submitQuizAnswer(payload);
    if (!feedback) {
        return;
    }

    quizModal.showFeedback(feedback);
}

function handleQuizContinue() {
    if (game.hasUnlockedExtraChance()) {
        quizModal.close();
        renderCurrentGrid();
        renderer.showSpeech('🎯 Chính xác! Bạn có thêm 1 cơ hội mở bao nhé.');
        window.setTimeout(() => renderer.hideSpeech(true), 1600);
        return;
    }

    if (game.canOfferExtraChance()) {
        openQuizKindPicker();
        return;
    }

    quizModal.close();

    if (maybeShowExtraChancePrompt()) {
        return;
    }

    maybeShowLockedState();
}

function handleQuizCancel() {
    game.cancelQuizChallenge();
    quizModal.close();

    if (maybeShowExtraChancePrompt()) {
        return;
    }

    maybeShowLockedState();
}

function handlePlayAgain() {
    modal.hide();

    const currentResult = game.getState().currentResult;
    if (game.canOfferExtraChance() && currentResult?.type === 'money') {
        openQuizKindPicker();
        return;
    }

    if (maybeShowExtraChancePrompt()) {
        return;
    }

    if (maybeShowLockedState()) {
        return;
    }

    if (game.isRoundComplete()) {
        game.startRound();
    }
}

function handleCloseModal() {
    modal.hide();

    if (maybeShowExtraChancePrompt()) {
        return;
    }

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
        onShare: (result) => eventBus.emit('ui:share-result', { result }),
        onExtraChance: () => eventBus.emit('ui:start-quiz')
    });

    quizModal.init({
        onCancel: () => eventBus.emit('ui:quiz-cancel'),
        onSelectKind: (quizKind) => eventBus.emit('ui:quiz-kind-selected', { quizKind }),
        onAnswer: (payload) => eventBus.emit('ui:quiz-answer', payload),
        onContinue: () => eventBus.emit('ui:quiz-continue')
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

    eventBus.on('ui:start-quiz', handleStartQuiz);
    eventBus.on('ui:quiz-kind-selected', handleQuizKindSelected);
    eventBus.on('ui:quiz-answer', handleQuizAnswer);
    eventBus.on('ui:quiz-continue', handleQuizContinue);
    eventBus.on('ui:quiz-cancel', handleQuizCancel);

    eventBus.on('ui:play-again', handlePlayAgain);
    eventBus.on('ui:modal-close', handleCloseModal);
    eventBus.on('ui:share-result', (payload) => {
        void shareResult(payload.result);
    });

    renderer.showScreen('welcome-screen');
    window.addEventListener('load', () => sounds.preload());
}

document.addEventListener('DOMContentLoaded', bootstrap);
