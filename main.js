import { APP_CONFIG } from './src/core/config.js';
import { eventBus } from './src/core/eventBus.js';
import { createGameEngine } from './src/game/gameEngine.js';
import { createQuizEngine } from './src/game/quizEngine.js';
import { createRenderer } from './src/ui/renderer.js';
import { playRevealAnimation } from './src/ui/envelope.js';
import { createModalController } from './src/ui/modal.js';
import { createOpenFlowModalController } from './src/ui/openFlowModal.js';
import { createQuizModalController } from './src/ui/quizModal.js';
import { createConfettiController } from './src/effects/confetti.js';
import { createSoundController } from './src/effects/sound.js';
import { vibrate } from './src/effects/vibration.js';

const renderer = createRenderer();
const modal = createModalController();
const openFlow = createOpenFlowModalController();
const quizModal = createQuizModalController();
const confetti = createConfettiController();
const sounds = createSoundController();
const game = createGameEngine(eventBus);

let lastSpeechAt = 0;
let openingInProgress = false;
const preOpenQuiz = createQuizEngine();
const lockedFunQuiz = createQuizEngine();

const preOpenState = {
    activeQuiz: false,
    played: 0,
    correct: 0
};

const gateRefs = {
    screen: null,
    subtitle: null,
    openAt: null,
    stats: null,
    days: null,
    hours: null,
    minutes: null,
    seconds: null,
    quizBtn: null,
    enterBtn: null
};

let gateTimerId;
let quizContext = 'game';

function cacheGateRefs() {
    gateRefs.screen = document.getElementById('opening-screen');
    gateRefs.subtitle = document.getElementById('opening-subtitle');
    gateRefs.openAt = document.getElementById('opening-open-at');
    gateRefs.stats = document.getElementById('opening-quiz-stats');
    gateRefs.days = document.getElementById('opening-days');
    gateRefs.hours = document.getElementById('opening-hours');
    gateRefs.minutes = document.getElementById('opening-minutes');
    gateRefs.seconds = document.getElementById('opening-seconds');
    gateRefs.quizBtn = document.getElementById('opening-quiz-btn');
    gateRefs.enterBtn = document.getElementById('opening-enter-btn');
}

function isOpenGateEnabled() {
    return APP_CONFIG.openGate.enabled === true && Number.isFinite(APP_CONFIG.openGate.openAtMs);
}

function hasOpenGatePassed() {
    if (!isOpenGateEnabled()) {
        return true;
    }

    return Date.now() >= APP_CONFIG.openGate.openAtMs;
}

function formatCountdownParts(diffMs) {
    const safe = Math.max(0, diffMs);
    const days = Math.floor(safe / (24 * 60 * 60 * 1000));
    const hours = Math.floor((safe % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((safe % (60 * 60 * 1000)) / (60 * 1000));
    const seconds = Math.floor((safe % (60 * 1000)) / 1000);

    return {
        days,
        hours,
        minutes,
        seconds
    };
}

function formatUnit(value) {
    return String(value).padStart(2, '0');
}

function updatePreOpenStats() {
    if (!gateRefs.stats) {
        return;
    }

    gateRefs.stats.textContent = `🎯 Quiz chờ mở cửa: ${preOpenState.correct}/${preOpenState.played} câu đúng`;
}

function updateOpenGateCountdown() {
    if (!isOpenGateEnabled()) {
        return;
    }

    const diff = APP_CONFIG.openGate.openAtMs - Date.now();
    const countdown = formatCountdownParts(diff);

    gateRefs.days.textContent = formatUnit(countdown.days);
    gateRefs.hours.textContent = formatUnit(countdown.hours);
    gateRefs.minutes.textContent = formatUnit(countdown.minutes);
    gateRefs.seconds.textContent = formatUnit(countdown.seconds);

    if (diff <= 0) {
        stopOpenGateCountdown();
        gateRefs.subtitle.textContent = '🎉 Đã đến giờ mở cổng lộc, vào bốc bao thôi!';
        gateRefs.enterBtn.classList.remove('hidden');
        gateRefs.quizBtn.classList.add('hidden');
    }
}

function startOpenGateCountdown() {
    stopOpenGateCountdown();
    updateOpenGateCountdown();
    gateTimerId = window.setInterval(updateOpenGateCountdown, 1000);
}

function stopOpenGateCountdown() {
    if (gateTimerId) {
        clearInterval(gateTimerId);
        gateTimerId = undefined;
    }
}

function showOpenGateScreen() {
    if (!isOpenGateEnabled()) {
        return false;
    }

    if (hasOpenGatePassed()) {
        stopOpenGateCountdown();
        return false;
    }

    modal.hide();
    openFlow.close();
    quizModal.close();

    const openAtText = new Date(APP_CONFIG.openGate.openAtMs).toLocaleString('vi-VN', {
        hour12: false
    });

    gateRefs.subtitle.textContent = 'Web sẽ mở đúng giờ khai xuân. Trong lúc chờ, bạn có thể chơi quiz cho vui nè!';
    gateRefs.openAt.textContent = `🕒 Giờ mở cổng: ${openAtText}`;
    gateRefs.enterBtn.classList.add('hidden');
    gateRefs.quizBtn.classList.toggle('hidden', APP_CONFIG.openGate.allowQuizWhileWaiting !== true);
    updatePreOpenStats();

    renderer.showScreen('opening-screen');
    startOpenGateCountdown();
    return true;
}

function openPreOpenQuizPicker() {
    quizContext = 'pre_open';
    preOpenState.activeQuiz = true;
    const quizKinds = preOpenQuiz.getQuizKinds();

    quizModal.openCategoryPicker(quizKinds, {
        attemptsUsed: preOpenState.played,
        maxAttempts: Math.max(1, preOpenState.played + 1)
    });
}

function getEnvelopeHandlers() {
    return {
        onHover: () => eventBus.emit('ui:hover-envelope'),
        onLeave: () => eventBus.emit('ui:hover-leave'),
        onOpen: (index, element) => eventBus.emit('ui:open-envelope', { index, element })
    };
}

function shouldUseFinalConfirm() {
    if (APP_CONFIG.openFlow.finalStepEnabled !== true) {
        return false;
    }

    return Math.random() < APP_CONFIG.openFlow.finalStepChance;
}

function renderCurrentGrid() {
    renderer.renderEnvelopes(game.getState().envelopes, getEnvelopeHandlers());
    renderer.showScreen('game-screen');
}

function showLockedState(payload) {
    modal.hide();
    openFlow.close();
    quizModal.close();
    quizContext = 'game';
    preOpenState.activeQuiz = false;
    renderer.showLockedScreen(payload, {
        onPlayQuiz: () => eventBus.emit('ui:start-locked-quiz')
    });
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
    openFlow.close();
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
    quizContext = 'game';
    preOpenState.activeQuiz = false;
    const quizKinds = game.getQuizKinds();
    quizModal.openCategoryPicker(quizKinds, game.getQuizStatus());
}

function openLockedFunQuizPicker() {
    quizContext = 'locked_fun';
    const quizKinds = lockedFunQuiz.getQuizKinds();
    quizModal.openCategoryPicker(quizKinds);
}

function handleNoMoreQuizQuestions() {
    quizModal.close();

    if (quizContext === 'pre_open') {
        showOpenGateScreen();
        gateRefs.subtitle.textContent = 'Bạn đã chơi hết câu hỏi mới trên thiết bị này rồi. Chờ mở cổng lộc nhé!';
        return;
    }

    if (quizContext === 'locked_fun') {
        maybeShowLockedState();
        renderer.showSpeech('📚 Hết câu mới trên thiết bị này rồi, chơi lại sau nha!');
        window.setTimeout(() => renderer.hideSpeech(true), 1800);
        return;
    }

    renderer.showSpeech('📚 Hết câu hỏi mới trên thiết bị này rồi nè!');
    window.setTimeout(() => renderer.hideSpeech(true), 1800);
}

function handleRoundReady(payload) {
    stopOpenGateCountdown();
    openFlow.close();
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

function handleEnvelopeOpenRequest(payload) {
    if (openingInProgress || !payload) {
        return;
    }

    const envelope = game.getEnvelopePreview(payload.index);
    if (!envelope || envelope.opened) {
        return;
    }

    if (APP_CONFIG.openFlow.mode === 'QUICK') {
        eventBus.emit('ui:open-envelope-confirmed', payload);
        return;
    }

    renderer.hideSpeech(true);

    openFlow.open({
        index: payload.index,
        element: payload.element,
        faceEmoji: envelope.face?.modalEmoji ?? envelope.face?.emoji ?? '🧧',
        faceLabel: envelope.face?.label ?? 'Bao li xi',
        quote: game.getHoverQuote(),
        talkStepEnabled: APP_CONFIG.openFlow.talkStepEnabled,
        showFinalConfirm: shouldUseFinalConfirm()
    });
}

async function handleEnvelopeOpenConfirmed(payload) {
    if (openingInProgress) {
        return;
    }

    const { index, element } = payload;
    const result = game.openEnvelope(index);
    if (!result) {
        maybeShowLockedState();
        return;
    }

    openingInProgress = true;
    game.setBusy(true);

    try {
        openFlow.close();
        renderer.markEnvelopeOpened(element);
        renderer.hideSpeech(true);

        vibrate(APP_CONFIG.effects.vibrationMs);
        sounds.playClick();

        await playRevealAnimation(element);

        confetti.fire(result.confettiCount);
        if (result.type === 'special') {
            sounds.playSpecial();
            vibrate(APP_CONFIG.effects.vibrationMs * 2);
            window.setTimeout(() => confetti.fire(Math.round(result.confettiCount * 0.65)), 200);
            window.setTimeout(() => confetti.fire(Math.round(result.confettiCount * 0.45)), 420);
        } else if (result.type === 'money') {
            sounds.playWin();
        }

        modal.show(result, {
            showExtraChanceButton: game.canOfferExtraChance(),
            showPlayAgainButton: true,
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
    openFlow.close();
    openQuizKindPicker();
}

function handleStartLockedQuiz() {
    modal.hide();
    openFlow.close();
    openLockedFunQuizPicker();
}

function handleQuizKindSelected(payload) {
    if (!payload?.quizKind) {
        return;
    }

    if (quizContext === 'pre_open') {
        const question = preOpenQuiz.start(payload.quizKind);
        if (!question) {
            handleNoMoreQuizQuestions();
            return;
        }

        quizModal.openQuestion(question, {
            attemptsUsed: preOpenState.played,
            maxAttempts: Math.max(1, preOpenState.played + 1)
        });
        return;
    }

    if (quizContext === 'locked_fun') {
        const question = lockedFunQuiz.start(payload.quizKind);
        if (!question) {
            handleNoMoreQuizQuestions();
            return;
        }

        quizModal.openQuestion(question);
        return;
    }

    const question = game.startQuizChallenge(payload.quizKind);
    if (!question) {
        handleNoMoreQuizQuestions();
        return;
    }

    quizModal.openQuestion(question, game.getQuizStatus());
}

function handleQuizAnswer(payload) {
    if (quizContext === 'pre_open') {
        const evaluation = preOpenQuiz.submit(payload);
        if (!evaluation) {
            return;
        }

        preOpenState.played += 1;
        if (evaluation.correct) {
            preOpenState.correct += 1;
        }

        updatePreOpenStats();

        quizModal.showFeedback({
            ...evaluation,
            correct: evaluation.correct,
            title: evaluation.correct ? 'Ê sao biết vậy!' : '😆 Sai một chút xíu xiu à!',
            message: evaluation.correct
                ? 'Bạn trả lời chuẩn luôn. Chơi thêm câu khác trong lúc chờ nha!'
                : 'Không sao, làm thêm câu nữa để lấy hên nè!',
            continueLabel: '🎯 Chơi câu khác',
            canRetryQuiz: false
        });

        return;
    }

    if (quizContext === 'locked_fun') {
        const evaluation = lockedFunQuiz.submit(payload);
        if (!evaluation) {
            return;
        }

        quizModal.showFeedback({
            ...evaluation,
            correct: evaluation.correct,
            title: evaluation.correct ? '🎉 Chuẩn bài luôn!' : '😆 Trượt nhẹ thôi!',
            message: evaluation.correct
                ? 'Giải trí quá mượt, làm thêm câu nữa nhé!'
                : 'Không tính điểm đâu, thử câu khác cho vui nè.',
            continueLabel: '🎯 Câu khác',
            canRetryQuiz: false
        });
        return;
    }

    const feedback = game.submitQuizAnswer(payload);
    if (!feedback) {
        return;
    }

    quizModal.showFeedback(feedback);
}

function handleQuizContinue() {
    if (quizContext === 'pre_open') {
        if (hasOpenGatePassed()) {
            quizModal.close();
            preOpenState.activeQuiz = false;
            quizContext = 'game';
            game.startSession();
            return;
        }

        openPreOpenQuizPicker();
        return;
    }

    if (quizContext === 'locked_fun') {
        openLockedFunQuizPicker();
        return;
    }

    if (game.hasUnlockedExtraChance()) {
        quizModal.close();
        renderCurrentGrid();
        renderer.showSpeech('🎯 Nice xừ! Bạn có thêm 1 cơ hội mở bao nhé.');
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
    if (quizContext === 'pre_open') {
        preOpenQuiz.clear();
        preOpenState.activeQuiz = false;
        quizContext = 'game';
        quizModal.close();

        if (showOpenGateScreen()) {
            return;
        }

        game.startSession();
        return;
    }

    if (quizContext === 'locked_fun') {
        lockedFunQuiz.clear();
        quizContext = 'game';
        quizModal.close();
        maybeShowLockedState();
        return;
    }

    game.cancelQuizChallenge();
    quizModal.close();
    openFlow.close();

    if (maybeShowExtraChancePrompt()) {
        return;
    }

    maybeShowLockedState();
}

function handlePlayAgain() {
    modal.hide();
    openFlow.close();

    const currentResult = game.getState().currentResult;
    if (game.canOfferExtraChance() && (currentResult?.type === 'money' || currentResult?.type === 'special')) {
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
    openFlow.close();

    if (maybeShowExtraChancePrompt()) {
        return;
    }

    maybeShowLockedState();
}

function handleStartIntent() {
    if (showOpenGateScreen()) {
        return;
    }

    game.startSession();
}

function handleEnterFromOpenGate() {
    if (!hasOpenGatePassed()) {
        showOpenGateScreen();
        return;
    }

    stopOpenGateCountdown();
    quizModal.close();
    preOpenState.activeQuiz = false;
    quizContext = 'game';
    game.startSession();
}

function bootstrap() {
    sounds.init();
    cacheGateRefs();

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
        onExtraChance: () => eventBus.emit('ui:start-quiz')
    });

    openFlow.init({
        onOpen: () => {
            sounds.playClick();
        },
        onStepChange: (step) => {
            if (step === 'FINAL_CONFIRM') {
                vibrate(48);
            }
        },
        onConfirm: (payload) => eventBus.emit('ui:open-envelope-confirmed', payload),
        onCancel: () => renderer.hideSpeech(true)
    });

    quizModal.init({
        onCancel: () => eventBus.emit('ui:quiz-cancel'),
        onSelectKind: (quizKind) => eventBus.emit('ui:quiz-kind-selected', { quizKind }),
        onAnswer: (payload) => eventBus.emit('ui:quiz-answer', payload),
        onContinue: () => eventBus.emit('ui:quiz-continue')
    });

    gateRefs.quizBtn?.addEventListener('click', () => {
        if (APP_CONFIG.openGate.allowQuizWhileWaiting !== true) {
            return;
        }

        openPreOpenQuizPicker();
    });

    gateRefs.enterBtn?.addEventListener('click', handleEnterFromOpenGate);

    eventBus.on('ui:start', handleStartIntent);
    eventBus.on('round:ready', handleRoundReady);
    eventBus.on('state:updated', handleStateUpdated);
    eventBus.on('session:locked', showLockedState);

    eventBus.on('ui:hover-envelope', handleEnvelopeHover);
    eventBus.on('ui:hover-leave', () => renderer.hideSpeech(false));
    eventBus.on('ui:open-envelope', handleEnvelopeOpenRequest);
    eventBus.on('ui:open-envelope-confirmed', (payload) => {
        void handleEnvelopeOpenConfirmed(payload);
    });

    eventBus.on('ui:start-quiz', handleStartQuiz);
    eventBus.on('ui:start-locked-quiz', handleStartLockedQuiz);
    eventBus.on('ui:quiz-kind-selected', handleQuizKindSelected);
    eventBus.on('ui:quiz-answer', handleQuizAnswer);
    eventBus.on('ui:quiz-continue', handleQuizContinue);
    eventBus.on('ui:quiz-cancel', handleQuizCancel);

    eventBus.on('ui:play-again', handlePlayAgain);
    eventBus.on('ui:modal-close', handleCloseModal);

    renderer.showScreen('welcome-screen');
    window.addEventListener('load', () => sounds.preload());
}

document.addEventListener('DOMContentLoaded', bootstrap);
