import { APP_CONFIG } from '../core/config.js';
import { randomItem } from '../utils/random.js';

const ENVELOPE_FACES = [
    { emoji: '😎', label: 'Bao Ngầu', modalEmoji: 'ദ്ദി◝ ⩊ ◜.ᐟ' },
    { emoji: '😴', label: 'Bao Buồn Ngủ', modalEmoji: 'ദ്ദി(˵ •̀ ᴗ - ˵ ) ✧' },
    { emoji: '🤪', label: 'Bao Tăng Động', hyperShake: true, modalEmoji: '(˶ˆᗜˆ˵)' },
    { emoji: '🥰', label: 'Bao Dễ Thương', modalEmoji: '(づ> v <)づ♡' },
    { emoji: '🤑', label: 'Bao Đại Gia', modalEmoji: '≽^•⩊•^≼' },
    { emoji: '😏', label: 'Bao Bí Ẩn', modalEmoji: '(,,>﹏<,,)' },
    { emoji: '🥺', label: 'Bao Tội Nghiệp', modalEmoji: '৻( •̀ ᗜ •́ ৻)' },
    { emoji: '😤', label: 'Bao Giận Dỗi', modalEmoji: '( •̯́ ₃ •̯̀)' },
    { emoji: '🤡', label: 'Bao Hề', modalEmoji: '(„• ֊ •„)੭' },
    { emoji: '😋', label: 'Bao Háu Ăn', modalEmoji: 'ฅ^>⩊<^ ฅ' },
    { emoji: '🤡', label: 'Bao Khôn Lanh', modalEmoji: '(╥﹏╥)' },
    { emoji: '👻', label: 'Bao Lầy Lội', modalEmoji: '(˶˃𐃷˂˶)' }
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
    'Bốc tui xong nhớ giữ phong độ may mắn nha ✨'
];

const MONEY_REWARDS = ['99.999đ'];
const SPECIAL_REWARD = '200.000đ';
const SPECIAL_BLESSINGS = [
    'Chúc cho 1 năm mới vạn sự như ý  🌟',
    'Triệu sự như mơ  🤝',
    'Trăm sự bất ngờ và hàng giờ hạnh phúc . ❤️',
];

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
    const specialThreshold = trollChance + APP_CONFIG.probabilities.specialChance;
    const moneyThreshold = specialThreshold + APP_CONFIG.probabilities.moneyChance;
    let specialAssigned = false;

    return selectedFaces.map((face, index) => {
        const roll = Math.random();
        const isTroll = roll < trollChance;
        const isSpecialCandidate = !isTroll && roll < specialThreshold;
        const isSpecial = isSpecialCandidate && !specialAssigned;
        const isMoney = !isTroll && !isSpecial && roll < moneyThreshold;

        if (isSpecial) {
            specialAssigned = true;
        }

        return {
            index,
            face,
            isTroll,
            isSpecial,
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

    if (envelope.isSpecial) {
        const nextStreak = currentStreak + 2;

        return {
            nextStreak,
            result: {
                type: 'special',
                icon: '👑',
                title: `GIẢI ĐẶC BIỆT: ${SPECIAL_REWARD}`,
                text: 'Bạn vừa mở trúng giải to nhất mùa Tết này! 🎆',
                claimNote: '✨ Giải đặc biệt đã chốt. Không cần bốc lại nữa nha!',
                streak: nextStreak,
                blessing: 'Phúc - Lộc - Thọ hội tụ, năm nay chắc chắn khởi sắc! 🏮',
                blessingList: SPECIAL_BLESSINGS,
                confettiCount: APP_CONFIG.effects.confetti.special
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
