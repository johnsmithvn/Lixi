export const QUIZ_KINDS = Object.freeze({
    CHOICE: 'choice',
    WORD: 'word'
});

export const QUIZ_KIND_OPTIONS = [
    {
        id: QUIZ_KINDS.CHOICE,
        label: '🧠 Trắc nghiệm',
        description: 'Chọn 1 đáp án đúng.'
    },
    {
        id: QUIZ_KINDS.WORD,
        label: '🔤 Word Puzzle',
        description: 'Giải mã chữ cái bị xáo trộn.'
    }
];

export const CHOICE_QUIZ_SET = [
    {
        id: 'q1',
        type: 'text',
        question: 'Tết thường có mấy ngày nghỉ chính thức?',
        media: null,
        answers: [
            { text: '1 ngày', correct: false },
            { text: '3 ngày', correct: true },
            { text: '7 ngày', correct: false },
            { text: 'Tùy mood sếp 😆', correct: false }
        ]
    },
    {
        id: 'q2',
        type: 'image',
        question: 'Trong hình là món gì ngày Tết?',
        media: '/assets/images/banhchung.png',
        answers: [
            { text: 'Bánh pizza', correct: false },
            { text: 'Bánh chưng', correct: true },
            { text: 'Bánh donut', correct: false }
        ]
    },
    {
        id: 'q3',
        type: 'text',
        question: 'Đi chúc Tết người lớn, câu nào lịch sự nhất?',
        media: null,
        answers: [
            { text: 'Con chúc ông bà nhiều sức khỏe ạ', correct: true },
            { text: 'Con xin pass năm nay', correct: false },
            { text: 'Con chào cho có lệ', correct: false }
        ]
    },
    {
        id: 'q4',
        type: 'text',
        question: 'Lì xì thường tượng trưng cho điều gì?',
        media: null,
        answers: [
            { text: 'May mắn và lời chúc tốt lành', correct: true },
            { text: 'Nợ đầu năm', correct: false },
            { text: 'Điểm danh họ hàng', correct: false }
        ]
    },
    {
        id: 'q5',
        type: 'text',
        question: 'Món nào hay có trong mâm cỗ Tết miền Bắc?',
        media: null,
        answers: [
            { text: 'Phở cuốn', correct: false },
            { text: 'Canh măng', correct: true },
            { text: 'Hamburger', correct: false }
        ]
    }
];

export const WORD_PUZZLE_SET = [
    {
        id: 'w1',
        question: 'Giải mã từ khóa Tết sau',
        hint: 'Loại cây vàng rực hay chưng ở miền Nam',
        answer: 'HOAMAI'
    },
    {
        id: 'w2',
        question: 'Giải mã từ khóa Tết sau',
        hint: 'Món bánh truyền thống gói lá dong',
        answer: 'BÁNHCHƯNG'
    },
    {
        id: 'w3',
        question: 'Giải mã từ khóa Tết sau',
        hint: 'Nghi thức đi thăm và chúc đầu năm',
        answer: 'CHÚCTẾT'
    },
    {
        id: 'w4',
        question: 'Giải mã từ khóa Tết sau',
        hint: 'Phong tục tặng bao đỏ đầu năm',
        answer: 'LIXI'
    },
    {
        id: 'w5',
        question: 'Giải mã từ khóa Tết sau',
        hint: 'Loại trái cây hay bày mâm ngũ quả',
        answer: 'BƯỞI'
    }
];
