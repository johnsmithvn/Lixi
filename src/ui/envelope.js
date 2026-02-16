import { APP_CONFIG } from '../core/config.js';

export function createEnvelopeElement(envelope, handlers) {
    const card = document.createElement('div');
    card.className = 'envelope';
    card.dataset.index = String(envelope.index);

    if (envelope.face.hyperShake) {
        card.classList.add('troll-envelope');
    }

    const eyes = document.createElement('div');
    eyes.className = 'envelope-eyes';
    eyes.textContent = '👀';
    eyes.style.animationDelay = `${Math.random() * 2}s`;

    const face = document.createElement('div');
    face.className = 'envelope-face';
    face.textContent = envelope.face.emoji;

    const label = document.createElement('div');
    label.className = 'envelope-label';
    label.textContent = envelope.face.label;

    card.appendChild(eyes);
    card.appendChild(face);
    card.appendChild(label);

    card.addEventListener('mouseenter', () => handlers.onHover(envelope.index));
    card.addEventListener('mouseleave', handlers.onLeave);
    card.addEventListener('click', () => handlers.onOpen(envelope.index, card));

    return card;
}

export function markEnvelopeOpened(element) {
    element.classList.add('opened');
}

export async function playRevealAnimation(sourceEnvelope) {
    if (!sourceEnvelope) {
        return;
    }

    const rect = sourceEnvelope.getBoundingClientRect();
    const clone = sourceEnvelope.cloneNode(true);
    clone.classList.remove('opened');
    clone.classList.add('reveal-clone', 'revealing');

    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;

    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const fromX = rect.left + rect.width / 2;
    const fromY = rect.top + rect.height / 2;
    const translateX = centerX - fromX;
    const translateY = centerY - fromY;

    document.body.classList.add('reveal-active');
    sourceEnvelope.classList.add('source-hidden');
    document.body.appendChild(clone);

    const animation = clone.animate(
        [
            { transform: 'translate(0px, 0px) scale(1)', opacity: 0.96 },
            { transform: `translate(${translateX}px, ${translateY}px) scale(2.18)`, opacity: 1 }
        ],
        {
            duration: APP_CONFIG.timings.revealDurationMs,
            easing: 'cubic-bezier(0.17, 0.85, 0.22, 1)',
            fill: 'forwards'
        }
    );

    await animation.finished.catch(() => undefined);

    clone.remove();
    sourceEnvelope.classList.remove('source-hidden');
    document.body.classList.remove('reveal-active');
}
