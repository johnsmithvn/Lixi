/* ===================================================
   BAO LÌ XÌ BIẾT NÓI — MAIN APP
   =================================================== */

// ─── DATA ────────────────────────────────────────

const ENVELOPE_FACES = [
    { emoji: '😎', label: 'Bao Ngầu' },
    { emoji: '😴', label: 'Bao Buồn Ngủ' },
    { emoji: '🤪', label: 'Bao Tăng Động', hyperShake: true },
    { emoji: '🥰', label: 'Bao Dễ Thương' },
    { emoji: '🤑', label: 'Bao Đại Gia' },
    { emoji: '😏', label: 'Bao Bí Ẩn' },
    { emoji: '🥺', label: 'Bao Tội Nghiệp' },
    { emoji: '😤', label: 'Bao Giận Dỗi' },
    { emoji: '🤡', label: 'Bao Hề' },
];

const HOVER_QUOTES = [
    'Chọn tui đi, tui chứa tiền thiệt mà 🤫',
    'Đừng bỏ tui, tui giàu lắm! 💰',
    'Tui là bao may mắn nhất đó nha 🍀',
    'Mở tui ra, không hối hận đâu! 😆',
    'Tui đẹp nhất, chọn tui đi! ✨',
    'Tết mà cũng phải làm việc hả… 😴',
    'Bốc tui đi, tui hứa không troll 🤞',
    'Hmmm… chọn tui hay không chọn tui? 🤔',
    'Tui chứa bất ngờ lớn lắm nha 🎁',
    'Psst… tui là jackpot đó! 🤫',
    'Đừng ngại, cứ bốc tui đi 😉',
    'Tui tuy nhỏ nhưng tiền nhiều 💸',
];

const MONEY_REWARDS = [
    '99999đ', '50.000đ', '100.000đ', '100.000đ', '50.000đ'
];

const JOKE_REWARDS = [
    'Bạn vừa nhận được năng lượng ngủ nướng +100 😴',
    'Tết này tránh hỏi: Bao giờ lấy vợ/chồng nhé 🙈',
    'Tiền không nhiều, nhưng vibe rất giàu 💅',
    'Lì xì tinh thần, dùng cả năm không hết ✨',
    'Bạn nhận được 1 cái ôm miễn phí 🤗',
    'Chúc bạn năm nay ăn gì cũng không mập 🍜',
    'Tiền thì ít, nhưng nhan sắc thì vô hạn 💖',
    'Bạn được tặng 1 ngày không ai hỏi lương 🤣',
    'Năm mới, tiền mới... à mà chưa có 😆',
    'Lì xì yêu thương — giá trị hơn tiền bạc 🥰',
    'Bạn trúng vé nghỉ phép tưởng tượng 🏖️',
    'Chúc bạn Wi-Fi mạnh cả năm 📶',
];

const TROLL_JACKPOT = {
    fake: '999.999.999đ',
    reveal: 'À nhầm 😆\nChúc bạn may mắn lần sau nhé!',
};

// ─── STATE ─────────────────────────────────────

let openedCount = 0;
const TOTAL_ENVELOPES = 6;
let envelopeData = [];

// ─── PETALS ────────────────────────────────────

function spawnPetals() {
    const container = document.getElementById('petals-container');
    const petalSymbols = ['🌸', '🏵️', '✿', '❀', '🌺'];
    for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.classList.add('petal');
        p.textContent = petalSymbols[Math.floor(Math.random() * petalSymbols.length)];
        p.style.left = Math.random() * 100 + '%';
        p.style.fontSize = (Math.random() * 14 + 16) + 'px';
        p.style.animationDuration = (Math.random() * 6 + 6) + 's';
        p.style.animationDelay = (Math.random() * 8) + 's';
        container.appendChild(p);
    }
}
spawnPetals();

// ─── SCREENS ───────────────────────────────────

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function startGame() {
    openedCount = 0;
    buildEnvelopes();
    showScreen('game-screen');
}

// ─── BUILD ENVELOPES ───────────────────────────

function buildEnvelopes() {
    const grid = document.getElementById('envelope-grid');
    grid.innerHTML = '';
    envelopeData = [];

    // shuffle faces & pick TOTAL
    const shuffled = [...ENVELOPE_FACES].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, TOTAL_ENVELOPES);

    // decide which one is the troll (5% per envelope ≈ ~26% chance at least one)
    const trollIdx = Math.random() < 0.30 ? Math.floor(Math.random() * TOTAL_ENVELOPES) : -1;

    chosen.forEach((face, i) => {
        const isTroll = i === trollIdx;
        const isMoney = !isTroll && Math.random() > 0.45; // ~55% money, ~45% joke when not troll

        envelopeData.push({ face, isTroll, isMoney });

        const div = document.createElement('div');
        div.classList.add('envelope');
        if (face.hyperShake) div.classList.add('troll-envelope');
        div.dataset.index = i;

        // blinking eyes
        const eyes = document.createElement('div');
        eyes.classList.add('envelope-eyes');
        eyes.textContent = '👀';
        eyes.style.animationDelay = (Math.random() * 2) + 's';

        const faceEl = document.createElement('div');
        faceEl.classList.add('envelope-face');
        faceEl.textContent = face.emoji;

        const label = document.createElement('div');
        label.classList.add('envelope-label');
        label.textContent = face.label;

        div.appendChild(eyes);
        div.appendChild(faceEl);
        div.appendChild(label);

        div.addEventListener('mouseenter', () => showSpeech(i));
        div.addEventListener('mouseleave', hideSpeech);
        div.addEventListener('click', () => openEnvelope(i, div));

        grid.appendChild(div);
    });
}

// ─── SPEECH BUBBLE ─────────────────────────────

let speechTimeout;
function showSpeech(index) {
    clearTimeout(speechTimeout);
    const bubble = document.getElementById('envelope-speech');
    const text = document.getElementById('speech-text');
    text.textContent = HOVER_QUOTES[Math.floor(Math.random() * HOVER_QUOTES.length)];
    bubble.classList.remove('hidden');
}
function hideSpeech() {
    speechTimeout = setTimeout(() => {
        document.getElementById('envelope-speech').classList.add('hidden');
    }, 600);
}

// ─── OPEN ENVELOPE ─────────────────────────────

function openEnvelope(index, el) {
    if (el.classList.contains('opened')) return;
    el.classList.add('opened');
    openedCount++;

    const data = envelopeData[index];

    // shake animation
    el.style.animation = 'none';
    el.offsetHeight; // reflow
    el.style.animation = 'envelopeShake .3s ease-in-out 3';

    setTimeout(() => {
        ConfettiEngine.fire(140);
        showResult(data);
    }, 700);
}

// ─── SHOW RESULT ───────────────────────────────

function showResult(data) {
    const modal = document.getElementById('result-modal');
    const icon = document.getElementById('result-icon');
    const main = document.getElementById('result-main');
    const sub = document.getElementById('result-sub');
    const trollReveal = document.getElementById('troll-reveal');

    trollReveal.classList.add('hidden');
    trollReveal.textContent = '';

    if (data.isTroll) {
        // TROLL JACKPOT
        icon.textContent = '💥';
        main.textContent = 'BẠN TRÚNG JACKPOT!!!';
        sub.textContent = TROLL_JACKPOT.fake;
        modal.classList.remove('hidden');

        // reveal after 2.5s
        setTimeout(() => {
            ConfettiEngine.fire(60);
            trollReveal.textContent = TROLL_JACKPOT.reveal;
            trollReveal.classList.remove('hidden');
            sub.style.textDecoration = 'line-through';
            sub.style.opacity = '0.5';
            main.textContent = 'Haha gotcha! 🤡';
        }, 2500);
    } else if (data.isMoney) {
        const amount = MONEY_REWARDS[Math.floor(Math.random() * MONEY_REWARDS.length)];
        icon.textContent = '🧧';
        main.textContent = `Bạn nhận được: ${amount}`;
        sub.textContent = 'Chúc mừng năm mới! Tài lộc đầy nhà 🎊';
        sub.style.textDecoration = 'none';
        sub.style.opacity = '1';
        modal.classList.remove('hidden');
    } else {
        const joke = JOKE_REWARDS[Math.floor(Math.random() * JOKE_REWARDS.length)];
        icon.textContent = '😂';
        main.textContent = 'Lì xì tinh thần!';
        sub.textContent = joke;
        sub.style.textDecoration = 'none';
        sub.style.opacity = '1';
        modal.classList.remove('hidden');
    }
}

// ─── MODAL ACTIONS ─────────────────────────────

function closeModal() {
    document.getElementById('result-modal').classList.add('hidden');
}

function playAgain() {
    closeModal();
    // reset sub styles
    const sub = document.getElementById('result-sub');
    sub.style.textDecoration = 'none';
    sub.style.opacity = '1';

    if (openedCount >= TOTAL_ENVELOPES) {
        // all opened, regenerate
        startGame();
    }
}

function shareResult() {
    const main = document.getElementById('result-main').textContent;
    const sub = document.getElementById('result-sub').textContent;
    const text = `🧧 Bao Lì Xì Biết Nói 🧧\n${main}\n${sub}\n\nThử vận may tại đây: ${location.href}`;

    if (navigator.share) {
        navigator.share({ title: 'Bao Lì Xì Biết Nói', text }).catch(() => {});
    } else if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(() => {
            const btn = document.querySelector('.btn-share');
            const orig = btn.textContent;
            btn.textContent = '✅ Đã copy! Gửi cho bạn bè đi~';
            setTimeout(() => btn.textContent = orig, 2000);
        });
    }
}

// ─── INIT ──────────────────────────────────────
// preload
showScreen('welcome-screen');
