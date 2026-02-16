export function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

export function shuffle(list) {
    const cloned = [...list];

    for (let i = cloned.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
    }

    return cloned;
}

export function createLuckyCode(length = 6) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '#';

    for (let i = 0; i < length; i += 1) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
    }

    return code;
}
