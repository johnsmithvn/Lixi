import { APP_CONFIG, GAME_MODES } from '../core/config.js';
import { createEnvelopeElement, markEnvelopeOpened } from './envelope.js';

function formatDateTime(timestamp) {
    if (!Number.isFinite(timestamp)) {
        return null;
    }

    return new Date(timestamp).toLocaleString('vi-VN', {
        hour12: false
    });
}

function formatRemainingTime(expireAt) {
    if (!Number.isFinite(expireAt)) {
        return null;
    }

    const diff = expireAt - Date.now();
    if (diff <= 0) {
        return 'Bạn đã có thể thử lại rồi.';
    }

    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diff % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diff % (60 * 60 * 1000)) / (60 * 1000));

    if (days > 0) {
        return `Còn khoảng ${days} ngày ${hours} giờ để mở lại.`;
    }

    if (hours > 0) {
        return `Còn khoảng ${hours} giờ ${minutes} phút để mở lại.`;
    }

    return `Còn khoảng ${Math.max(1, minutes)} phút để mở lại.`;
}

function getModeLabel(mode) {
    if (mode === GAME_MODES.LOCKED) {
        return 'One-Time';
    }

    if (mode === GAME_MODES.EVENT) {
        return 'Event 24h';
    }

    if (mode === GAME_MODES.TEST) {
        return 'Test';
    }

    return 'Free';
}

function getLockedHint(mode) {
    if (mode === GAME_MODES.EVENT) {
        return 'Mỗi người chỉ có 1 lượt trong mỗi kỳ sự kiện thôi nha 😆';
    }

    if (mode === GAME_MODES.TEST) {
        return 'Đang ở chế độ test nên khóa tạm để kiểm tra flow.';
    }

    return 'Mỗi người chỉ có 1 vận may trong năm thôi nha 😆';
}

function getDefaultBlessing(resultType) {
    if (resultType === 'money') {
        return 'Chúc bạn năm mới tài lộc đầy nhà, tiền vô như nước! 🎊';
    }

    if (resultType === 'troll') {
        return 'Chúc bạn năm mới vững tâm, lộc to sẽ tới đúng lúc! 🍀';
    }

    return 'Chúc bạn năm mới cười thật nhiều, gặp toàn điều dễ thương! 🌸';
}

function getResultBadge(resultType) {
    if (resultType === 'money') {
        return { text: '💰 Trúng lộc to', tone: 'money' };
    }

    if (resultType === 'troll') {
        return { text: '😜 Troll thôi', tone: 'troll' };
    }

    return { text: '😂 Quà tinh thần', tone: 'joke' };
}

function extractMoneyAmount(title) {
    if (typeof title !== 'string') {
        return null;
    }

    const match = title.match(/([0-9][0-9.,]*đ)/i);
    return match ? match[1] : null;
}

function getLockStopMessage(reason) {
    if (reason === 'quiz_failed') {
        return 'Vận may đang ngủ trưa… nhắn chủ thớt đánh thức giúp!';
    }

    if (reason === 'second_miss') {
        return 'Vận may đang ngủ trưa… nhắn chủ thớt đánh thức giúp!';
    }

    return null;
}

function createLatestResultBlock(result, heading = '🎉 Kết quả gần nhất của bạn') {
    if (!result || (!result.title && !result.text)) {
        return null;
    }

    const latestBlock = document.createElement('section');
    latestBlock.className = 'latest-result';

    const latestTitle = document.createElement('h4');
    latestTitle.className = 'latest-result-title';
    latestTitle.textContent = heading;
    latestBlock.appendChild(latestTitle);

    const badge = getResultBadge(result.type);
    const badgeEl = document.createElement('p');
    badgeEl.className = `latest-result-badge latest-result-badge--${badge.tone}`;
    badgeEl.textContent = badge.text;
    latestBlock.appendChild(badgeEl);

    const resultMain = document.createElement('p');
    resultMain.className = 'latest-result-main';
    resultMain.textContent = result.title ?? 'Bạn đã mở 1 bao lì xì.';
    latestBlock.appendChild(resultMain);

    const moneyAmount = result.type === 'money'
        ? (extractMoneyAmount(result.title) ?? extractMoneyAmount(result.text))
        : null;

    if (moneyAmount) {
        const amountEl = document.createElement('p');
        amountEl.className = 'latest-result-amount';
        amountEl.textContent = `Giá trị nổi bật: ${moneyAmount}`;
        latestBlock.appendChild(amountEl);
    }

    const detailText = result.type === 'troll'
        ? (result.reveal ?? result.text)
        : result.text;

    if (detailText) {
        const detail = document.createElement('p');
        detail.className = 'latest-result-detail';
        detail.textContent = detailText;
        latestBlock.appendChild(detail);
    }

    if (result.type === 'money' && result.claimNote) {
        const claim = document.createElement('p');
        claim.className = 'latest-result-claim';
        claim.textContent = result.claimNote;
        latestBlock.appendChild(claim);
    }

    const blessing = document.createElement('p');
    blessing.className = 'latest-result-blessing';
    blessing.textContent = result.blessing ?? getDefaultBlessing(result.type);
    latestBlock.appendChild(blessing);

    return latestBlock;
}

export function createRenderer() {
    const refs = {};
    const defaults = {
        title: '',
        subtitle: ''
    };

    let hideSpeechTimer;

    function cacheRefs() {
        refs.startBtn = document.getElementById('start-btn');
        refs.petalsContainer = document.getElementById('petals-container');

        refs.gameTitle = document.querySelector('.game-title');
        refs.gameSubtitle = document.querySelector('.game-subtitle');
        refs.gameHud = document.querySelector('.game-hud');

        refs.envelopeGrid = document.getElementById('envelope-grid');
        refs.openedCounter = document.getElementById('opened-counter');
        refs.streakCounter = document.getElementById('streak-counter');

        refs.speechBubble = document.getElementById('envelope-speech');
        refs.speechText = document.getElementById('speech-text');
    }

    function spawnPetals(symbols) {
        refs.petalsContainer.innerHTML = '';

        for (let i = 0; i < 22; i += 1) {
            const petal = document.createElement('div');
            petal.className = 'petal';
            petal.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            petal.style.left = `${Math.random() * 100}%`;
            petal.style.fontSize = `${Math.random() * 14 + 16}px`;
            petal.style.animationDuration = `${Math.random() * 6 + 6}s`;
            petal.style.animationDelay = `${Math.random() * 6}s`;
            refs.petalsContainer.appendChild(petal);
        }
    }

    function init(handlers, options = {}) {
        cacheRefs();
        defaults.title = refs.gameTitle.textContent;
        defaults.subtitle = refs.gameSubtitle.textContent;

        spawnPetals(options.petalSymbols ?? ['🌸', '🏵️', '✿']);
        refs.startBtn.addEventListener('click', handlers.onStart);
    }

    function showScreen(id) {
        document.querySelectorAll('.screen').forEach((screen) => {
            screen.classList.remove('active');
        });

        document.getElementById(id)?.classList.add('active');
    }

    function resetLockedLayout() {
        refs.envelopeGrid.classList.remove('locked-grid');
        refs.gameTitle.textContent = defaults.title;
        refs.gameSubtitle.textContent = defaults.subtitle;
    }

    function renderEnvelopes(envelopes, handlers) {
        resetLockedLayout();
        refs.envelopeGrid.innerHTML = '';

        envelopes.forEach((envelope) => {
            refs.envelopeGrid.appendChild(createEnvelopeElement(envelope, handlers));
        });
    }

    function updateHud(gameState) {
        refs.openedCounter.textContent = `Đã mở: ${gameState.openedCount}/${APP_CONFIG.totalEnvelopes}`;
        refs.streakCounter.textContent = `🔥 Chuỗi may mắn: x${gameState.streak}`;
        refs.streakCounter.classList.toggle('hot', gameState.streak >= 3);
    }

    function showSpeech(message) {
        clearTimeout(hideSpeechTimer);
        refs.speechText.textContent = message;
        refs.speechBubble.classList.remove('hidden');
    }

    function hideSpeech(immediate = false) {
        clearTimeout(hideSpeechTimer);

        if (immediate) {
            refs.speechBubble.classList.add('hidden');
            return;
        }

        hideSpeechTimer = window.setTimeout(() => {
            refs.speechBubble.classList.add('hidden');
        }, APP_CONFIG.timings.speechHideMs);
    }

    function showExtraChanceScreen(payload, handlers) {
        const latestResult = payload?.result ?? null;
        const quizStatus = payload?.quiz ?? null;
        const maxAttempts = quizStatus?.maxAttempts ?? APP_CONFIG.quiz.maxAttempts;
        const remainingAttempts = quizStatus?.remainingAttempts ?? maxAttempts;
        const isMoneyReroll = latestResult?.type === 'money';

        showScreen('game-screen');
        hideSpeech(true);

        refs.gameTitle.textContent = isMoneyReroll
            ? '🧧 Bạn đã trúng rồi, muốn bốc lại không?'
            : '🧧 Hôm nay vận may chưa mỉm cười...';
        refs.gameSubtitle.textContent = isMoneyReroll
            ? 'Vượt quiz để mở thêm 1 bao và ghi đè kết quả cũ.'
            : 'Nhưng bạn có thể thử thêm 1 cơ hội nữa!';

        refs.openedCounter.textContent = isMoneyReroll
            ? '🎯 Bonus: Qua quiz để bốc lại kết quả'
            : '🎯 Bonus: Vượt quiz là được mở thêm 1 bao';
        refs.streakCounter.textContent = `Mini Quiz: còn ${remainingAttempts}/${maxAttempts} lượt trả lời`;
        refs.streakCounter.classList.remove('hot');

        refs.envelopeGrid.classList.add('locked-grid');
        refs.envelopeGrid.innerHTML = '';

        const card = document.createElement('article');
        card.className = 'locked-state';

        const title = document.createElement('h3');
        title.className = 'locked-title';
        title.textContent = isMoneyReroll
            ? '🎯 Quiz xác nhận bốc lại'
            : '🎯 Thử vận may lần nữa';

        const message = document.createElement('p');
        message.className = 'locked-text';
        message.textContent = isMoneyReroll
            ? `Bạn có tối đa ${maxAttempts} lần trả lời. Đúng 1 câu là được bốc lại và ghi đè kết quả cũ.`
            : `Bạn có tối đa ${maxAttempts} lần trả lời. Trúng 1 câu là được mở thêm 1 bao.`;

        card.appendChild(title);
        card.appendChild(message);

        const latestBlock = createLatestResultBlock(latestResult, 'Kết quả vừa rồi');
        if (latestBlock) {
            card.appendChild(latestBlock);
        }

        const actionBtn = document.createElement('button');
        actionBtn.type = 'button';
        actionBtn.className = 'extra-chance-btn';
        actionBtn.textContent = '🎯 Chọn thể loại quiz';
        actionBtn.addEventListener('click', handlers.onStartQuiz);

        card.appendChild(actionBtn);
        refs.envelopeGrid.appendChild(card);
    }

    function showLockedScreen(lockState) {
        const mode = lockState?.mode ?? GAME_MODES.LOCKED;
        const fate = lockState?.fate ?? null;

        showScreen('game-screen');
        hideSpeech(true);

        refs.gameTitle.textContent = '🧧 Vận may của bạn đã được mở rồi!';
        refs.gameSubtitle.textContent = getLockedHint(mode);

        refs.openedCounter.textContent = '🔒 Trạng thái: đã khóa lượt bốc';
        refs.streakCounter.textContent = `Mode: ${getModeLabel(mode)}`;
        refs.streakCounter.classList.remove('hot');

        refs.envelopeGrid.classList.add('locked-grid');
        refs.envelopeGrid.innerHTML = '';

        const card = document.createElement('article');
        card.className = 'locked-state';

        const title = document.createElement('h3');
        title.className = 'locked-title';
        title.textContent = '✨ Vũ trụ đã ghi nhận vận mệnh của bạn rồi';

        const message = document.createElement('p');
        message.className = 'locked-text';
        message.textContent = 'Không thể đổi kết quả bằng refresh đâu nhaaa 😆';

        card.appendChild(title);
        card.appendChild(message);

        const stopMessage = getLockStopMessage(fate?.meta?.reason);
        if (stopMessage) {
            const stopText = document.createElement('p');
            stopText.className = 'locked-remaining';
            stopText.textContent = stopMessage;
            card.appendChild(stopText);
        }

        const latestBlock = createLatestResultBlock(fate?.result, '🎉 Kết quả gần nhất của bạn');
        if (latestBlock) {
            card.appendChild(latestBlock);
        }

        const retryAt = formatDateTime(fate?.expireAt);
        if (retryAt) {
            const retryText = document.createElement('p');
            retryText.className = 'locked-meta';
            retryText.textContent = `Có thể mở lại từ: ${retryAt}`;
            card.appendChild(retryText);
        }

        const remainingText = formatRemainingTime(fate?.expireAt);
        if (remainingText) {
            const remaining = document.createElement('p');
            remaining.className = 'locked-remaining';
            remaining.textContent = remainingText;
            card.appendChild(remaining);
        }

        refs.envelopeGrid.appendChild(card);
    }

    return {
        init,
        showScreen,
        renderEnvelopes,
        updateHud,
        markEnvelopeOpened,
        showSpeech,
        hideSpeech,
        showLockedScreen,
        showExtraChanceScreen
    };
}
