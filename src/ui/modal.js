import { APP_CONFIG } from '../core/config.js';

export function createModalController() {
    const refs = {};
    let latestResult = null;
    let trollRevealTimer;
    let shareFeedbackTimer;

    function cacheRefs() {
        refs.modal = document.getElementById('result-modal');
        refs.resultIcon = document.getElementById('result-icon');
        refs.resultMain = document.getElementById('result-main');
        refs.resultSub = document.getElementById('result-sub');
        refs.resultStreak = document.getElementById('result-streak');
        refs.resultLuckyCode = document.getElementById('result-lucky-code');
        refs.trollReveal = document.getElementById('troll-reveal');

        refs.playAgainBtn = document.getElementById('play-again-btn');
        refs.shareBtn = document.getElementById('share-btn');
    }

    function clearTimers() {
        if (trollRevealTimer) {
            clearTimeout(trollRevealTimer);
            trollRevealTimer = undefined;
        }

        if (shareFeedbackTimer) {
            clearTimeout(shareFeedbackTimer);
            shareFeedbackTimer = undefined;
        }
    }

    function init(handlers) {
        cacheRefs();

        refs.playAgainBtn.addEventListener('click', handlers.onPlayAgain);
        refs.shareBtn.addEventListener('click', () => handlers.onShare(latestResult));

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

        refs.resultStreak.textContent = result.type === 'money'
            ? `🔥 Chuỗi may mắn: x${result.streak}`
            : 'Chuỗi may mắn hiện tại: x0';

        refs.resultLuckyCode.textContent = `Mã may mắn của bạn: ${result.luckyCode}`;
        refs.trollReveal.classList.add('hidden');
        refs.trollReveal.textContent = '';

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
        refs.shareBtn.textContent = '📤 Gửi cho bạn bè troll';
    }

    function showShareFeedback(message) {
        refs.shareBtn.textContent = message;
        clearTimeout(shareFeedbackTimer);
        shareFeedbackTimer = window.setTimeout(() => {
            refs.shareBtn.textContent = '📤 Gửi cho bạn bè troll';
        }, 1800);
    }

    return {
        init,
        show,
        hide,
        showShareFeedback,
        getLatestResult: () => latestResult
    };
}
