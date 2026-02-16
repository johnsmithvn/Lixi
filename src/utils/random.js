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
