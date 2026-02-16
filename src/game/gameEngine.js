import { APP_CONFIG, GAME_MODES } from '../core/config.js';
import { resetRoundState, resetSessionState, snapshotState, state } from '../core/state.js';
import { eventBus as defaultEventBus } from '../core/eventBus.js';
import {
    createEnvelopeSet,
    getHoverQuote,
    getPetalSymbols,
    resolveEnvelopeResult
} from './rewardSystem.js';
import { createGameModeManager } from './gameMode.js';
import { createQuizEngine } from './quizEngine.js';
import { readNumber, writeNumber } from '../utils/storage.js';

const QUIZ_PASS_MESSAGE = {
    title: '🎉 Chính xác!',
    message: 'Vũ trụ cho bạn thêm 1 cơ hội!'
};

const QUIZ_FAIL_MESSAGE = {
    title: '😆Không sao, Thần Tài vẫn đang xem xét.!',
    message: 'May mắn tạm nghỉ giữa hiệp 😌 IB chủ thớt để đá hiệp 2~'
};

const QUIZ_RETRY_TITLE = '😆 Sai rồi, nhưng dễ thương nên tha!';

export function createGameEngine(eventBus = defaultEventBus) {
    const gameMode = createGameModeManager();
    const quizEngine = createQuizEngine();
    let persistedBestStreak = readNumber(APP_CONFIG.storage.bestStreakKey, 0);

    function emitState() {
        eventBus.emit('state:updated', snapshotState());
    }

    function emitLockedSession(fate) {
        eventBus.emit('session:locked', {
            mode: gameMode.mode,
            fate
        });
    }

    function isLockedMode() {
        return gameMode.mode === GAME_MODES.LOCKED;
    }

    function isStrictLockMode() {
        return gameMode.mode === GAME_MODES.EVENT || gameMode.mode === GAME_MODES.TEST;
    }

    function isExtraQuizEnabled() {
        return APP_CONFIG.quiz.enabledInLockedMode === true;
    }

    function hasRemainingQuizAttempts() {
        return state.quizAttemptsUsed < APP_CONFIG.quiz.maxAttempts;
    }

    function canOfferExtraChance() {
        return isLockedMode()
            && isExtraQuizEnabled()
            && state.played
            && state.extraChanceAvailable
            && hasRemainingQuizAttempts();
    }

    function setBusy(isBusy) {
        state.isBusy = isBusy;
        emitState();
    }

    function resetSessionFlags() {
        state.played = false;
        state.hasMoney = false;
        state.usedExtraChance = false;
        state.quizPassed = false;
        state.extraChanceAvailable = false;
        state.extraChanceUnlocked = false;
        state.quizAttemptsUsed = 0;
    }

    function startSession() {
        resetSessionState();
        persistedBestStreak = readNumber(APP_CONFIG.storage.bestStreakKey, 0);
        state.maxStreak = persistedBestStreak;

        const activeFate = gameMode.getActiveFate();
        if (activeFate) {
            emitLockedSession(activeFate);
            emitState();
            return;
        }

        startRound();
    }

    function startRound() {
        const activeFate = gameMode.getActiveFate();
        if (activeFate) {
            emitLockedSession(activeFate);
            emitState();
            return;
        }

        resetRoundState();
        resetSessionFlags();
        state.envelopes = createEnvelopeSet();
        quizEngine.clear();
        eventBus.emit('round:ready', { envelopes: state.envelopes });
        emitState();
    }

    function lockSessionWithResult(result, reason = 'locked') {
        const savedFate = gameMode.lockWithResult(result, {
            reason,
            hasMoney: state.hasMoney,
            usedExtraChance: state.usedExtraChance,
            quizPassed: state.quizPassed
        });

        if (savedFate) {
            eventBus.emit('session:lock-saved', {
                mode: gameMode.mode,
                fate: savedFate,
                result
            });
        }

        return savedFate;
    }

    function openEnvelope(index) {
        const activeFate = gameMode.getActiveFate();
        const isOverwritingLockedFate = Boolean(activeFate && state.extraChanceUnlocked);

        if (activeFate && !isOverwritingLockedFate) {
            emitLockedSession(activeFate);
            return null;
        }

        if (isLockedMode() && state.played && !state.extraChanceUnlocked) {
            return null;
        }

        const envelope = state.envelopes[index];
        if (!envelope || envelope.opened || state.isBusy) {
            return null;
        }

        if (isOverwritingLockedFate) {
            gameMode.clearLock();
        }

        const firstOpen = !state.played;
        const usingExtraTurn = state.extraChanceUnlocked;

        state.played = true;
        state.extraChanceUnlocked = false;

        envelope.opened = true;
        state.openedCount += 1;

        const outcome = resolveEnvelopeResult(envelope, state.streak);
        state.streak = outcome.nextStreak;
        state.currentResult = outcome.result;
        state.hasMoney = state.currentResult.type === 'money';

        if (state.streak > state.maxStreak) {
            state.maxStreak = state.streak;
        }

        if (state.maxStreak > persistedBestStreak) {
            persistedBestStreak = state.maxStreak;
            writeNumber(APP_CONFIG.storage.bestStreakKey, persistedBestStreak);
        }

        let shouldLock = false;
        let lockReason = 'locked';

        if (isStrictLockMode()) {
            shouldLock = true;
            lockReason = 'strict_mode_lock';
        } else if (isLockedMode()) {
            const canContinueQuiz = isExtraQuizEnabled() && hasRemainingQuizAttempts();

            if (state.hasMoney) {
                shouldLock = true;
                if (canContinueQuiz) {
                    lockReason = usingExtraTurn ? 'reroll_win' : 'first_win';
                    state.extraChanceAvailable = true;
                    eventBus.emit('session:extra-chance-offered', {
                        mode: gameMode.mode,
                        result: state.currentResult
                    });
                } else {
                    lockReason = usingExtraTurn ? 'second_win' : 'first_win';
                    state.extraChanceAvailable = false;
                }
            } else if (canContinueQuiz) {
                shouldLock = !firstOpen;
                lockReason = usingExtraTurn ? 'reroll_continue' : 'first_miss';
                state.extraChanceAvailable = true;
                eventBus.emit('session:extra-chance-offered', {
                    mode: gameMode.mode,
                    result: state.currentResult
                });
            } else {
                shouldLock = true;
                lockReason = usingExtraTurn ? 'second_miss' : 'first_miss';
                state.extraChanceAvailable = false;
            }
        }

        if (shouldLock) {
            lockSessionWithResult(state.currentResult, lockReason);
        }

        eventBus.emit('result:ready', {
            index,
            result: state.currentResult
        });

        emitState();
        return state.currentResult;
    }

    function startQuizChallenge(quizKind) {
        if (!canOfferExtraChance()) {
            return null;
        }

        const question = quizEngine.start(quizKind);
        if (!question) {
            return null;
        }

        eventBus.emit('quiz:started', {
            question,
            quiz: getQuizStatus()
        });

        return question;
    }

    function getQuizKinds() {
        return quizEngine.getQuizKinds();
    }

    function getQuizStatus() {
        const maxAttempts = APP_CONFIG.quiz.maxAttempts;
        const attemptsUsed = state.quizAttemptsUsed;

        return {
            maxAttempts,
            attemptsUsed,
            remainingAttempts: Math.max(0, maxAttempts - attemptsUsed)
        };
    }

    function submitQuizAnswer(answerPayload) {
        if (!canOfferExtraChance()) {
            return null;
        }

        const evaluation = quizEngine.submit(answerPayload);
        if (!evaluation) {
            return null;
        }

        state.quizAttemptsUsed += 1;

        const maxAttempts = APP_CONFIG.quiz.maxAttempts;
        const attemptsUsed = state.quizAttemptsUsed;
        const remainingAttempts = Math.max(0, maxAttempts - attemptsUsed);

        if (evaluation.correct) {
            state.usedExtraChance = true;
            state.extraChanceAvailable = false;
            state.quizPassed = true;
            state.extraChanceUnlocked = true;
            quizEngine.clear();
            emitState();

            const response = {
                ...evaluation,
                ...QUIZ_PASS_MESSAGE,
                canOpenOneMore: true,
                canRetryQuiz: false,
                attemptsUsed,
                maxAttempts,
                remainingAttempts
            };

            eventBus.emit('quiz:passed', response);
            return response;
        }

        state.quizPassed = false;
        state.extraChanceUnlocked = false;
        quizEngine.clear();

        if (remainingAttempts > 0) {
            state.usedExtraChance = false;
            state.extraChanceAvailable = true;
            emitState();

            const response = {
                ...evaluation,
                title: QUIZ_RETRY_TITLE,
                message: `Bạn vẫn còn ${remainingAttempts} lượt trả lời nữa, thử tiếp nhé!`,
                canOpenOneMore: false,
                canRetryQuiz: true,
                attemptsUsed,
                maxAttempts,
                remainingAttempts
            };

            eventBus.emit('quiz:retry', response);
            return response;
        }

        const lockResult = state.currentResult ?? {
            type: 'joke',
            title: 'Lì xì tinh thần!',
            text: 'Vận may hôm nay dừng lại tại đây nhé.',
            blessing: 'Chúc bạn năm mới nhiều niềm vui và bình an! 🌸'
        };

        state.usedExtraChance = true;
        state.extraChanceAvailable = false;

        const fate = lockSessionWithResult(lockResult, 'quiz_failed');
        void fate;

        emitState();

        const response = {
            ...evaluation,
            ...QUIZ_FAIL_MESSAGE,
            canOpenOneMore: false,
            canRetryQuiz: false,
            attemptsUsed,
            maxAttempts,
            remainingAttempts
        };

        eventBus.emit('quiz:failed', response);
        return response;
    }

    function cancelQuizChallenge() {
        quizEngine.clear();
    }

    function isRoundComplete() {
        return state.openedCount >= APP_CONFIG.totalEnvelopes;
    }

    return {
        startSession,
        startRound,
        openEnvelope,
        getQuizKinds,
        startQuizChallenge,
        submitQuizAnswer,
        cancelQuizChallenge,
        canOfferExtraChance,
        isRoundComplete,
        setBusy,
        getHoverQuote,
        getPetalSymbols,
        getState: snapshotState,
        getGameMode: () => gameMode.mode,
        getActiveFate: () => gameMode.getActiveFate(),
        hasUnlockedExtraChance: () => state.extraChanceUnlocked,
        getQuizStatus,
        isSessionLocked: () => gameMode.isLocked()
    };
}
