export const QUIZ_KINDS = Object.freeze({
  CHOICE: "choice",
  WORD: "word",
});

export const QUIZ_KIND_OPTIONS = [
  {
    id: QUIZ_KINDS.CHOICE,
    label: "🧠 Trắc nghiệm",
    description: "Chọn 1 đáp án đúng.",
  },
  {
    id: QUIZ_KINDS.WORD,
    label: "🔤 Word Puzzle",
    description: "Sắp xếp chữ cái để ra đáp án đúng.",
  },
];

export const CHOICE_QUIZ_SET = [
  {
    id: "q12",
    type: "text",
    question: "Tết thường có mấy ngày nghỉ chính thức?",
    media: null,
    answers: [
      { text: "1 ngày", correct: false },
      { text: "2 ngày", correct: false },
      { text: "10 ngày", correct: false },
      { text: "Tùy mood sếp 😆", correct: true },
    ],
  },
  {
    id: "q13",
    type: "image",
    question: "Trong hình là món gì ngày Tết?",
    media: "/assets/images/banhchung.png",
    answers: [
      { text: "Bánh pizza", correct: false },
      { text: "Bánh chưng", correct: true },
      { text: "Bánh donut", correct: false },
      { text: "Bánh Vẽ", correct: false },
    ],
  },
  {
    id: "q14",
    type: "text",
    question: "Đi chúc Tết người lớn, câu nào lịch sự nhất?",
    media: null,
    answers: [
      { text: "Con chúc ông bà nhiều sức khỏe ạ", correct: true },
      { text: "Con xin pass năm nay", correct: false },
      { text: "Con chào cho có lệ", correct: false },
      { text: "Con tới nhận lì xì thôi ạ", correct: false },
    ],
  },
  {
    id: "q15",
    type: "text",
    question: "Lì xì thường tượng trưng cho điều gì?",
    media: null,
    answers: [
      { text: "May mắn và lời chúc tốt lành", correct: true },
      { text: "Nợ đầu năm", correct: false },
      { text: "Điểm danh họ hàng", correct: false },
    ],
  },
  {
    id: "q16",
    type: "text",
    question: "Món nào hay có trong mâm cỗ Tết miền Bắc?",
    media: null,
    answers: [
      { text: "Phở cuốn", correct: false },
      { text: "Canh măng", correct: true },
      { text: "Hamburger", correct: false },
    ],
  },
  {
    id: "q1",
    type: "text",
    question:
      "Thân em vừa trắng lại vừa tròn, được chàng xoa nắn cho mòn cả thân. Là gì?",
    media: null,
    answers: [
      { text: "Cục xà phòng", correct: true },
      { text: "Cục tẩy", correct: true },
      { text: "Bánh bao", correct: false },
      { text: "Quả trứng", correct: false },
    ],
  },
  {
    id: "q2",
    type: "text",
    question: "Cái gì không chân, không tay mà vẫn leo từ dưới lên trên?",
    media: null,
    answers: [
      { text: "Khói", correct: true },
      { text: "Bóng bay", correct: false },
      { text: "Cầu thang", correct: false },
    ],
  },
  {
    id: "q3",
    type: "text",
    question:
      "Cái gì mà người bán biết, người mua biết, người dùng không bao giờ biết?",
    media: null,
    answers: [
      { text: "Quan tài", correct: true },
      { text: "Quà bí mật", correct: false },
      { text: "Hộp quà", correct: false },
    ],
  },
  {
    id: "q4",
    type: "text",
    question: "Cái gì càng bóp càng ra nước?",
    media: null,
    answers: [
      { text: "Quả cam", correct: true },
      { text: "Quả chanh", correct: true },
      { text: "Khăn giấy", correct: false },
    ],
  },
  {
    id: "q7",
    type: "text",
    question: "Cái gì mà bạn phải cởi ra trước khi sử dụng?",
    media: null,
    answers: [
      { text: "Vỏ chuối", correct: true },
      { text: "Vỏ kẹo", correct: true },
      { text: "Áo khoác", correct: false },
    ],
  },
  {
    id: "q8",
    type: "text",
    question:
      "Một người đàn ông đi dưới mưa mà không đội mũ, không mặc áo mưa, nhưng tóc anh ta lại không ướt. Tại sao?",
    media: null,
    answers: [
      { text: "Anh ta bị hói", correct: true },
      { text: "Mưa giả", correct: false },
      { text: "Anh ta chạy rất nhanh", correct: false },
    ],
  },
  {
    id: "q9",
    type: "text",
    question: "Cái gì ai cũng có nhưng chỉ dùng khi cần?",
    media: null,
    answers: [
      { text: "Não", correct: true },
      { text: "Điện thoại", correct: false },
      { text: "Tiền", correct: false },
    ],
  },
  {
    id: "q10",
    type: "text",
    question: "Cái gì chứa được nhiều nước nhưng không bao giờ bị ướt?",
    media: null,
    answers: [
      { text: "Bản đồ", correct: true },
      { text: "Cái ly", correct: false },
      { text: "Bể nước", correct: false },
    ],
  },
  {
    id: "q11",
    type: "text",
    question: "Món nào hay có trong mâm cỗ Tết miền Bắc?",
    media: null,
    answers: [
      { text: "Phở cuốn", correct: false },
      { text: "Canh măng", correct: true },
      { text: "Hamburger", correct: false },
    ],
  },
  {
    id: "q17",
    type: "text",
    question: "Deadline đáng sợ nhất khi nào?",
    media: null,
    answers: [
      { text: "Khi còn 1 tuần", correct: false },
      { text: "Khi còn 1 ngày", correct: false },
      { text: "Khi mình vẫn chưa thấy sợ", correct: true },
    ],
  },
  {
    id: "q19",
    type: "text",
    question: "Tiền của mình thường đi đâu?",
    media: null,
    answers: [
      { text: "Đầu tư sinh lời", correct: false },
      { text: "Tự chuyển sang tài khoản người khác", correct: true },
      { text: "Nằm yên trong ví", correct: false },
    ],
  },
  {
    id: "q21",
    type: "text",
    question: "Mỗi sáng mình thức dậy để làm gì?",
    media: null,
    answers: [
      { text: "Đón chào ngày mới đầy năng lượng", correct: false },
      { text: "Ngủ thêm 5 phút nữa", correct: true },
      { text: "Tập thể dục ngay lập tức", correct: false },
    ],
  },
  {
    id: "q22",
    type: "text",
    question: "Khi crush không rep tin nhắn nghĩa là gì?",
    media: null,
    answers: [
      { text: "Họ đang bận thật", correct: false },
      { text: "Mình là lốp", correct: true },
      { text: "Mạng họ yếu", correct: false },
    ],
  },
];

export const WORD_PUZZLE_SET = [
  {
    id: "w1",
    question: "Giải mã từ khóa Tết sau",
    hint: "Loại cây vàng rực hay chưng ở miền Nam",
    answer: "HOA MAI",
  },
  {
    id: "w2",
    question: "Giải mã từ khóa Tết sau",
    hint: "Món bánh truyền thống gói lá dong",
    answer: "BÁNH CHƯNG",
    presetScrambled: "CHNƯ GHBÁN",
  },
  {
    id: "w3",
    question: "Giải mã từ khóa Tết sau",
    hint: "Nghi thức đi thăm và chúc đầu năm",
    answer: "CHÚC TẾT",
  },
  {
    id: "w4",
    question: "Giải mã từ khóa Tết sau",
    hint: "Phong tục tặng bao đỏ đầu năm",
    answer: "LÌ XÌ",
  },
  {
    id: "w5",
    question: "Giải mã từ khóa Tết sau",
    hint: "Loại trái cây hay bày mâm ngũ quả",
    answer: "BƯỞI",
  },
  {
    id: 'w_custom_1',
    question: 'Sắp xếp chữ thành từ có nghĩa',
    hint: 'Cảm giác bất an, lo âu',
    answer: 'LO LẮNG',
    presetScrambled: 'GẮNLOL'
  },
  {
    id: 'w_custom_4',
    question: 'Sắp xếp chữ thành từ có nghĩa',
    hint: 'Liên quan đến phim ảnh ',
    answer: 'ĐIỆN ẢNH',
  },
  {
    id: 'w_custom_7',
    question: 'Sắp xếp chữ thành từ có nghĩa',
    hint: 'Hành động tăng tốc (nghe giống Bốc...)',
    answer: 'BỨT TỐC',
    presetScrambled: 'BỐC TỨT'
  },
  {
    id: 'w_custom_13',
    question: 'Sắp xếp chữ thành từ có nghĩa',
    hint: 'Tên một loài cá (từng có trong truyện cổ tích t&c)',
    answer: 'CÁ BỐNG',
    presetScrambled: 'BÁC NGỐ'
  },
  {
    id: 'w_custom_16',
    question: 'Sắp xếp tên Idol',
    hint: 'Rapper trong Anh Trai Say Hi',
    answer: 'HIEUTHUHAI',
  },
  {
    id: 'w_custom_19',
    question: 'Sắp xếp chữ thành từ có nghĩa',
    hint: 'Giấy tờ tùy thân',
    answer: 'CĂN CƯỚC',
    presetScrambled: 'ĂNCỨCỚc'
  },
  {
    id: 'w_custom_24',
    question: 'Sắp xếp chữ thành từ có nghĩa',
    hint: 'Tên loài cá ',
    answer: 'CÁ MÈ',
  },

];
