import {
    CHOICE_QUIZ_SET,
    QUIZ_KINDS,
    QUIZ_KIND_OPTIONS,
    WORD_PUZZLE_SET
} from './quizData.js';

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function normalizeText(raw) {
    return String(raw ?? '')
        .toUpperCase()
        .replace(/[Đ]/g, 'D')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '');
}

function shuffleLetters(rawWord) {
    const letters = rawWord.split('');

    for (let i = letters.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = letters[i];
        letters[i] = letters[j];
        letters[j] = tmp;
    }

    return letters.join('');
}

function toSpacedWord(word) {
    return word.split('').join(' ');
}

function sanitizeChoiceQuestion(question) {
    if (!question || typeof question !== 'object') {
        return null;
    }

    if (question.type !== 'text' && question.type !== 'image') {
        return null;
    }

    if (!Array.isArray(question.answers) || question.answers.length < 2) {
        return null;
    }

    return {
        id: question.id,
        quizKind: QUIZ_KINDS.CHOICE,
        type: question.type,
        question: question.question,
        media: question.media ?? null,
        answers: question.answers.map((answer) => ({
            text: answer.text,
            correct: answer.correct === true
        }))
    };
}

function sanitizeWordPuzzle(question) {
    if (!question || typeof question !== 'object') {
        return null;
    }

    const answer = normalizeText(question.answer);
    if (!answer || answer.length < 2) {
        return null;
    }

    return {
        id: question.id,
        quizKind: QUIZ_KINDS.WORD,
        type: 'word',
        question: question.question,
        hint: question.hint,
        answer,
        placeholder: question.placeholder ?? 'Nhập đáp án không dấu...'
    };
}

function buildWordQuestion(baseQuestion) {
    if (!baseQuestion) {
        return null;
    }

    let scrambled = baseQuestion.answer;
    let attempt = 0;

    while (scrambled === baseQuestion.answer && attempt < 8) {
        scrambled = shuffleLetters(baseQuestion.answer);
        attempt += 1;
    }

    return {
        id: baseQuestion.id,
        quizKind: QUIZ_KINDS.WORD,
        type: 'word',
        question: baseQuestion.question,
        hint: baseQuestion.hint,
        letters: scrambled.split(''),
        scrambled: toSpacedWord(scrambled),
        placeholder: baseQuestion.placeholder,
        normalizedAnswer: baseQuestion.answer
    };
}

export function createQuizEngine() {
    const choicePool = CHOICE_QUIZ_SET.map(sanitizeChoiceQuestion).filter(Boolean);
    const wordPool = WORD_PUZZLE_SET.map(sanitizeWordPuzzle).filter(Boolean);

    let currentQuestion = null;

    function getQuizKinds() {
        return QUIZ_KIND_OPTIONS;
    }

    function start(quizKind = QUIZ_KINDS.CHOICE) {
        if (quizKind === QUIZ_KINDS.WORD) {
            currentQuestion = buildWordQuestion(randomItem(wordPool));
            return currentQuestion;
        }

        currentQuestion = randomItem(choicePool);
        return currentQuestion;
    }

    function submit(answerPayload) {
        if (!currentQuestion) {
            return null;
        }

        if (currentQuestion.quizKind === QUIZ_KINDS.WORD) {
            const textAnswer = typeof answerPayload === 'object' && answerPayload !== null
                ? answerPayload.textAnswer
                : answerPayload;

            const guess = String(textAnswer ?? '').trim();
            if (!guess) {
                return null;
            }

            return {
                correct: normalizeText(guess) === currentQuestion.normalizedAnswer,
                answerText: guess,
                questionId: currentQuestion.id,
                questionType: currentQuestion.type,
                quizKind: currentQuestion.quizKind
            };
        }

        const rawIndex = typeof answerPayload === 'object' && answerPayload !== null
            ? answerPayload.answerIndex
            : answerPayload;

        const idx = Number(rawIndex);
        if (!Number.isInteger(idx) || idx < 0 || idx >= currentQuestion.answers.length) {
            return null;
        }

        const selected = currentQuestion.answers[idx];

        return {
            correct: selected.correct,
            answerText: selected.text,
            questionId: currentQuestion.id,
            questionType: currentQuestion.type,
            quizKind: currentQuestion.quizKind
        };
    }

    function getCurrentQuestion() {
        return currentQuestion;
    }

    function clear() {
        currentQuestion = null;
    }

    return {
        getQuizKinds,
        start,
        submit,
        getCurrentQuestion,
        clear
    };
}
