export const state = {
    openedCount: 0,
    streak: 0,
    maxStreak: 0,
    envelopes: [],
    currentResult: null,
    isBusy: false
};

export function snapshotState() {
    return {
        openedCount: state.openedCount,
        streak: state.streak,
        maxStreak: state.maxStreak,
        envelopes: state.envelopes,
        currentResult: state.currentResult,
        isBusy: state.isBusy
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
}
