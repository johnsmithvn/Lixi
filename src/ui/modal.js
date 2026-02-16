import { APP_CONFIG } from '../core/config.js';

export function createModalController() {
    const refs = {};
    let latestResult = null;
    let trollRevealTimer;

    function cacheRefs() {
        refs.modal = document.getElementById('result-modal');
        refs.resultIcon = document.getElementById('result-icon');
        refs.resultMain = document.getElementById('result-main');
        refs.resultSub = document.getElementById('result-sub');
        refs.resultClaimNote = document.getElementById('result-claim-note');
        refs.resultStreak = document.getElementById('result-streak');
        refs.trollReveal = document.getElementById('troll-reveal');

        refs.extraChanceBtn = document.getElementById('extra-chance-btn');
        refs.playAgainBtn = document.getElementById('play-again-btn');
    }

    function clearTimers() {
        if (trollRevealTimer) {
            clearTimeout(trollRevealTimer);
            trollRevealTimer = undefined;
        }
    }

    function init(handlers) {
        cacheRefs();

        refs.extraChanceBtn.addEventListener('click', handlers.onExtraChance);
        refs.playAgainBtn.addEventListener('click', handlers.onPlayAgain);

        refs.modal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeModal === 'true') {
                handlers.onClose();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && !refs.modal.classList.contains('hidden')) {
                handlers.onClose();
            }
        });
    }

    function show(result, options = {}) {
        clearTimers();
        latestResult = result;

        refs.resultIcon.textContent = result.icon;
        refs.resultMain.textContent = result.title;
        refs.resultSub.textContent = result.text;
        refs.resultSub.classList.remove('strike');
        refs.resultClaimNote.classList.add('hidden');
        refs.resultClaimNote.textContent = '';

        refs.resultStreak.textContent = result.type === 'money'
            ? `🔥 Chuỗi may mắn: x${result.streak}`
            : 'Chuỗi may mắn hiện tại: x0';

        if (result.type === 'money') {
            refs.resultClaimNote.textContent = result.claimNote ?? '📸 Chụp ảnh màn hình gửi chủ thớt để lĩnh xèng nha!';
            refs.resultClaimNote.classList.remove('hidden');
        }

        refs.trollReveal.classList.add('hidden');
        refs.trollReveal.textContent = '';
        refs.extraChanceBtn.classList.toggle('hidden', !options.showExtraChanceButton);

        if (result.type === 'troll') {
            trollRevealTimer = window.setTimeout(() => {
                refs.resultMain.textContent = 'Haha gotcha! 🤡';
                refs.resultSub.classList.add('strike');
                refs.trollReveal.textContent = result.reveal;
                refs.trollReveal.classList.remove('hidden');
                options.onTrollReveal?.(result);
            }, APP_CONFIG.timings.trollRevealDelayMs);
        }

        refs.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function hide() {
        clearTimers();
        refs.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
        refs.extraChanceBtn.classList.add('hidden');
        refs.resultClaimNote.classList.add('hidden');
    }

    return {
        init,
        show,
        hide,
        getLatestResult: () => latestResult
    };
}
