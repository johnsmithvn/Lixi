export function vibrate(duration = 80) {
    if (navigator.vibrate) {
        navigator.vibrate(duration);
    }
}
