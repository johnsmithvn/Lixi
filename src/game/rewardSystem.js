import { APP_CONFIG } from '../core/config.js';
import { randomItem } from '../utils/random.js';

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
    { emoji: '😋', label: 'Bao Háu Ăn' },
    { emoji: '🤡', label: 'Bao Khôn Lanh' },
    { emoji: '👻', label: 'Bao Lầy Lội' }
];

const HOVER_QUOTES = [
    'Chọn tui đi, tui chứa tiền thiệt mà 🤫',
    'Đừng bỏ tui, tui giàu lắm! 💰',
    'Mở tui ra, không hối hận đâu! 😆',
    'Tui đẹp nhất, chọn tui đi! ✨',
    'Bốc tui đi, tui hứa không troll 🤞',
    'Psst... tui là bao meme dễ thương đó! 🤫',
    'Đừng ngại, cứ bốc tui đi 😉',
    'Tui tuy nhỏ nhưng tiền nhiều 💸',
    'Hôm nay vận may đứng ngay trong tui 😎',
    'Bốc tui xong nhớ khoe với bạn bè nha 📸'
];

const MONEY_REWARDS = ['99999đ', '50.000đ', '100.000đ', '200.000đ', '500.000đ'];

const JOKE_REWARDS = [
    'Bạn vừa nhận được năng lượng ngủ nướng +100 😴',
    'Tết này tránh hỏi: Bao giờ lấy vợ/chồng nhé 🙈',
    'Tiền không nhiều, nhưng vibe rất giàu 💅',
    'Bạn nhận được 1 cái ôm miễn phí 🤗',
    'Chúc bạn năm nay ăn gì cũng không mập 🍜',
    'Bạn được tặng 1 ngày không ai hỏi lương 🤣',
    'Lì xì yêu thương, giá trị hơn tiền bạc 🥰',
    'Bạn trúng vé nghỉ phép tưởng tượng 🏖️',
    'Chúc bạn Wi-Fi mạnh cả năm 📶',
    'Năm mới, tiền mới... à mà chưa có 😆'
];

const TROLL_JACKPOT = {
    title: 'BẠN TRÚNG JACKPOT!!!',
    text: '999.999.999đ',
    reveal: '😜 Troll nhẹ thôi nè! Lộc thật đang chạy tới rồi đó.'
};

const PETAL_SYMBOLS = ['🌸', '🏵️', '✿', '❀', '🌺'];

export function getPetalSymbols() {
    return PETAL_SYMBOLS;
}

export function getHoverQuote() {
    return randomItem(HOVER_QUOTES);
}

export function createEnvelopeSet() {
    const selectedFaces = Array.from({ length: APP_CONFIG.totalEnvelopes }, () => randomItem(ENVELOPE_FACES));
    const trollChance = APP_CONFIG.probabilities.trollChance;
    const moneyThreshold = trollChance + APP_CONFIG.probabilities.moneyChance;

    return selectedFaces.map((face, index) => {
        const roll = Math.random();
        const isTroll = roll < trollChance;
        const isMoney = !isTroll && roll < moneyThreshold;

        return {
            index,
            face,
            isTroll,
            isMoney,
            opened: false
        };
    });
}

export function resolveEnvelopeResult(envelope, currentStreak) {
    if (envelope.isTroll) {
        return {
            nextStreak: 0,
            result: {
                type: 'troll',
                icon: '💥',
                title: TROLL_JACKPOT.title,
                text: TROLL_JACKPOT.text,
                reveal: TROLL_JACKPOT.reveal,
                streak: 0,
                blessing: 'Chúc bạn năm mới cười tươi, lộc thật sẽ tới sau nhé! 🍀',
                confettiCount: APP_CONFIG.effects.confetti.troll
            }
        };
    }

    if (envelope.isMoney) {
        const nextStreak = currentStreak + 1;

        return {
            nextStreak,
            result: {
                type: 'money',
                icon: '🧧',
                title: `Bạn nhận được: ${randomItem(MONEY_REWARDS)}`,
                text: 'Đầu năm bốc trúng lộc, quá đã luôn! 💸',
                claimNote: '📸 Chụp ảnh màn hình gửi chủ thớt để lĩnh xèng nha!',
                streak: nextStreak,
                blessing: 'Chúc bạn năm mới tài lộc đầy nhà, tiền vô như nước! 🎊',
                confettiCount: nextStreak >= 3
                    ? APP_CONFIG.effects.confetti.moneyStreakBonus
                    : APP_CONFIG.effects.confetti.money
            }
        };
    }

    return {
        nextStreak: 0,
        result: {
            type: 'joke',
            icon: '😂',
            title: 'Lì xì tinh thần!',
            text: randomItem(JOKE_REWARDS),
            streak: 0,
            blessing: 'Chúc bạn năm mới cười thật nhiều, gặp toàn điều dễ thương! 🌸',
            confettiCount: APP_CONFIG.effects.confetti.joke
        }
    };
}
