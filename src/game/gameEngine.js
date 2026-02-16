import { APP_CONFIG } from '../core/config.js';
import { resetRoundState, resetSessionState, snapshotState, state } from '../core/state.js';
import { eventBus as defaultEventBus } from '../core/eventBus.js';
import {
    createEnvelopeSet,
    getHoverQuote,
    getPetalSymbols,
    resolveEnvelopeResult
} from './rewardSystem.js';
import { createGameModeManager } from './gameMode.js';
import { readNumber, writeNumber } from '../utils/storage.js';

export function createGameEngine(eventBus = defaultEventBus) {
    const gameMode = createGameModeManager();
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

    function setBusy(isBusy) {
        state.isBusy = isBusy;
        emitState();
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
        state.envelopes = createEnvelopeSet();
        eventBus.emit('round:ready', { envelopes: state.envelopes });
        emitState();
    }

    function openEnvelope(index) {
        const activeFate = gameMode.getActiveFate();
        if (activeFate) {
            emitLockedSession(activeFate);
            return null;
        }

        const envelope = state.envelopes[index];
        if (!envelope || envelope.opened || state.isBusy) {
            return null;
        }

        envelope.opened = true;
        state.openedCount += 1;

        const outcome = resolveEnvelopeResult(envelope, state.streak);
        state.streak = outcome.nextStreak;
        state.currentResult = outcome.result;

        if (state.streak > state.maxStreak) {
            state.maxStreak = state.streak;
        }

        if (state.maxStreak > persistedBestStreak) {
            persistedBestStreak = state.maxStreak;
            writeNumber(APP_CONFIG.storage.bestStreakKey, persistedBestStreak);
        }

        const savedFate = gameMode.lockWithResult(state.currentResult);
        if (savedFate) {
            eventBus.emit('session:lock-saved', {
                mode: gameMode.mode,
                fate: savedFate,
                result: state.currentResult
            });
        }

        eventBus.emit('result:ready', {
            index,
            result: state.currentResult
        });

        emitState();
        return state.currentResult;
    }

    function isRoundComplete() {
        return state.openedCount >= APP_CONFIG.totalEnvelopes;
    }

    return {
        startSession,
        startRound,
        openEnvelope,
        isRoundComplete,
        setBusy,
        getHoverQuote,
        getPetalSymbols,
        getState: snapshotState,
        getGameMode: () => gameMode.mode,
        getActiveFate: () => gameMode.getActiveFate(),
        isSessionLocked: () => gameMode.isLocked()
    };
}
