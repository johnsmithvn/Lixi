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
        refs.specialBlessing = document.getElementById('special-blessing');
        refs.specialBlessingTitle = refs.specialBlessing?.querySelector('.special-blessing-title') ?? null;
        refs.specialBlessingList = document.getElementById('special-blessing-list');
        refs.specialNote = document.getElementById('special-note');
        refs.specialNoteImage = document.getElementById('special-note-image');
        refs.specialNoteText = document.getElementById('special-note-text');
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
        refs.specialBlessing.classList.add('hidden');
        refs.specialBlessingList.innerHTML = '';
        refs.resultSub.classList.remove('result-sub--blessing');
        if (refs.specialBlessingTitle) {
            refs.specialBlessingTitle.textContent = '🌟 Lời chúc giải đặc biệt';
        }
        refs.resultSub.classList.remove('strike');
        refs.specialNote.classList.add('hidden');
        refs.resultClaimNote.classList.add('hidden');
        refs.resultClaimNote.textContent = '';
        refs.specialNoteText.textContent = '';
        refs.resultStreak.textContent = '';
        refs.resultStreak.classList.add('hidden');
        refs.resultStreak.classList.remove('result-streak--special');

        if (result.type === 'money' || result.type === 'special') {
            const blessingItems = result.type === 'special'
                ? (Array.isArray(result.blessingList) && result.blessingList.length > 0
                    ? result.blessingList
                    : (typeof result.blessing === 'string' && result.blessing.trim().length > 0 ? [result.blessing.trim()] : []))
                : (typeof result.blessing === 'string' && result.blessing.trim().length > 0 ? [result.blessing.trim()] : []);

            if (refs.specialBlessingTitle) {
                refs.specialBlessingTitle.textContent = result.type === 'special'
                    ? '🌟 Lời chúc giải đặc biệt'
                    : '🌿 Lời chúc nhận lộc';
            }

            blessingItems.forEach((item) => {
                const li = document.createElement('li');
                li.textContent = item;
                refs.specialBlessingList.appendChild(li);
            });
            refs.specialBlessing.classList.toggle('hidden', blessingItems.length === 0);
        }

        if (result.type === 'joke') {
            refs.resultSub.classList.add('result-sub--blessing');
        }

        if (result.type === 'special') {
            refs.resultStreak.textContent = '👑 Giải đặc biệt đã kích hoạt. Năm nay quá rực rỡ!';
            refs.resultStreak.classList.remove('hidden');
            refs.resultStreak.classList.add('result-streak--special');

            refs.specialNoteImage.src = '/assets/images/daudau.png';
            refs.specialNoteText.textContent = 'Chúc mừng! Bạn vừa móc được túi mình thành công';
            refs.specialNote.classList.remove('hidden');
        }

        if (result.type === 'money' || result.type === 'special') {
            refs.resultClaimNote.textContent = result.claimNote ?? '📸 Chụp ảnh màn hình gửi chủ thớt để lĩnh xèng nha!';
            refs.resultClaimNote.classList.remove('hidden');
        }

        refs.trollReveal.classList.add('hidden');
        refs.trollReveal.textContent = '';
        refs.extraChanceBtn.classList.toggle('hidden', !options.showExtraChanceButton);
        refs.playAgainBtn.classList.toggle('hidden', options.showPlayAgainButton === false);

        if (result.type === 'troll') {
            trollRevealTimer = window.setTimeout(() => {
                refs.resultMain.textContent = 'Haha gotcha! Không có đâu nỡm ạ!';
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
        refs.playAgainBtn.classList.remove('hidden');
        refs.resultStreak.classList.add('hidden');
        refs.resultStreak.classList.remove('result-streak--special');
        refs.specialBlessing.classList.add('hidden');
        refs.specialBlessingList.innerHTML = '';
    }

    return {
        init,
        show,
        hide,
        getLatestResult: () => latestResult
    };
}
