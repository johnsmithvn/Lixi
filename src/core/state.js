export const state = {
    openedCount: 0,
    streak: 0,
    maxStreak: 0,
    envelopes: [],
    currentResult: null,
    isBusy: false,
    played: false,
    hasMoney: false,
    usedExtraChance: false,
    quizPassed: false,
    extraChanceAvailable: false,
    extraChanceUnlocked: false,
    quizAttemptsUsed: 0,
    missAttemptsUsed: 0
};

export function snapshotState() {
    return {
        openedCount: state.openedCount,
        streak: state.streak,
        maxStreak: state.maxStreak,
        envelopes: state.envelopes,
        currentResult: state.currentResult,
        isBusy: state.isBusy,
        played: state.played,
        hasMoney: state.hasMoney,
        usedExtraChance: state.usedExtraChance,
        quizPassed: state.quizPassed,
        extraChanceAvailable: state.extraChanceAvailable,
        extraChanceUnlocked: state.extraChanceUnlocked,
        quizAttemptsUsed: state.quizAttemptsUsed,
        missAttemptsUsed: state.missAttemptsUsed
    };
}

export function resetRoundState() {
    state.openedCount = 0;
    state.envelopes = [];
    state.currentResult = null;
    state.isBusy = false;
}

export function resetSessionState() {
    resetRoundState();
    state.streak = 0;
    state.played = false;
    state.hasMoney = false;
    state.usedExtraChance = false;
    state.quizPassed = false;
    state.extraChanceAvailable = false;
    state.extraChanceUnlocked = false;
    state.quizAttemptsUsed = 0;
    state.missAttemptsUsed = 0;
}
