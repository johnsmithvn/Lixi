import {
    CHOICE_QUIZ_SET,
    QUIZ_KINDS,
    QUIZ_KIND_OPTIONS,
    REACTION_DYNAMIC_CONFIG,
    STROOP_DYNAMIC_CONFIG,
    WORD_PUZZLE_SET
} from './quizData.js';
import { APP_CONFIG } from '../core/config.js';
import { readJSON, writeJSON } from '../utils/storage.js';

function randomItem(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function sortChars(raw) {
    return String(raw ?? '').split('').sort().join('');
}

function sanitizeSeenIds(raw) {
    if (!Array.isArray(raw)) {
        return [];
    }

    return raw
        .filter((item) => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
}

function readSeenMap() {
    const raw = readJSON(APP_CONFIG.storage.quizSeenKey, {});
    const seenChoice = sanitizeSeenIds(raw?.choice);
    const seenWord = sanitizeSeenIds(raw?.word);

    return {
        choice: seenChoice,
        word: seenWord
    };
}

function writeSeenMap(seenMap) {
    writeJSON(APP_CONFIG.storage.quizSeenKey, {
        choice: sanitizeSeenIds(seenMap?.choice),
        word: sanitizeSeenIds(seenMap?.word)
    });
}

function getKindKey(quizKind) {
    if (quizKind === QUIZ_KINDS.WORD) {
        return 'word';
    }

    return 'choice';
}

function pickQuestion(pool, quizKind, uniquePerDeviceEnabled) {
    if (!Array.isArray(pool) || pool.length === 0) {
        return null;
    }

    if (uniquePerDeviceEnabled !== true) {
        return randomItem(pool);
    }

    const kindKey = getKindKey(quizKind);
    const seenMap = readSeenMap();
    const seenSet = new Set(seenMap[kindKey] ?? []);
    const unseenPool = pool.filter((question) => !seenSet.has(question.id));

    if (unseenPool.length === 0) {
        return null;
    }

    const selected = randomItem(unseenPool);
    seenSet.add(selected.id);
    seenMap[kindKey] = Array.from(seenSet);
    writeSeenMap(seenMap);
    return selected;
}

function normalizeText(raw) {
    return String(raw ?? '')
        .toUpperCase()
        .replace(/[Đ]/g, 'D')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9]/g, '');
}

function normalizeTextKeepSpaces(raw) {
    return String(raw ?? '')
        .toUpperCase()
        .replace(/[Đ]/g, 'D')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^A-Z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function normalizeDisplayTextKeepSpaces(raw) {
    return String(raw ?? '')
        .toUpperCase()
        .normalize('NFC')
        .replace(/[^0-9A-ZÀ-ỸĐ\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function getWordTokens(raw) {
    const normalized = normalizeTextKeepSpaces(raw);
    if (!normalized) {
        return [];
    }

    return normalized.split(' ').filter(Boolean);
}

function getDisplayWordTokens(raw) {
    const normalized = normalizeDisplayTextKeepSpaces(raw);
    if (!normalized) {
        return [];
    }

    return normalized.split(' ').filter(Boolean);
}

function resolvePresetScrambled(rawPreset, answerNormalized) {
    if (typeof rawPreset !== 'string') {
        return null;
    }

    const displayTokens = getDisplayWordTokens(rawPreset);
    if (displayTokens.length === 0) {
        return null;
    }

    const mergedDisplay = displayTokens.join('');
    const normalizedPreset = normalizeText(mergedDisplay);

    if (!normalizedPreset || normalizedPreset === answerNormalized) {
        return null;
    }

    if (normalizedPreset.length !== answerNormalized.length) {
        return null;
    }

    if (sortChars(normalizedPreset) !== sortChars(answerNormalized)) {
        return null;
    }

    return mergedDisplay;
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

function toGroupedSpacedWord(word, wordLengths = []) {
    if (!Array.isArray(wordLengths) || wordLengths.length === 0) {
        return toSpacedWord(word);
    }

    let cursor = 0;
    const groups = wordLengths.map((length) => {
        const segment = word.slice(cursor, cursor + length);
        cursor += length;
        return segment ? segment.split('').join(' ') : '';
    }).filter(Boolean);

    return groups.join('   ');
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

const DYNAMIC_STROOP_COLOR_POOL = Object.freeze(
    (Array.isArray(STROOP_DYNAMIC_CONFIG?.colors) ? STROOP_DYNAMIC_CONFIG.colors : [])
        .map((item) => ({
            token: String(item?.token ?? '').trim().toLowerCase(),
            label: String(item?.label ?? '').trim()
        }))
        .filter((item) => item.token.length > 0 && item.label.length > 0)
);

const DYNAMIC_STROOP_MEDIA_POOL = Object.freeze(
    (Array.isArray(STROOP_DYNAMIC_CONFIG?.mediaPool) ? STROOP_DYNAMIC_CONFIG.mediaPool : [])
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
);

const DYNAMIC_REACTION_MEDIA_POOL = Object.freeze(
    (Array.isArray(REACTION_DYNAMIC_CONFIG?.mediaPool) ? REACTION_DYNAMIC_CONFIG.mediaPool : [])
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
);

const DYNAMIC_REACTION_PROMPTS = Object.freeze(
    (Array.isArray(REACTION_DYNAMIC_CONFIG?.prompts) ? REACTION_DYNAMIC_CONFIG.prompts : [])
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
);

const DYNAMIC_REACTION_BUTTON_LABELS = Object.freeze(
    (Array.isArray(REACTION_DYNAMIC_CONFIG?.buttonLabels) ? REACTION_DYNAMIC_CONFIG.buttonLabels : [])
        .map((item) => String(item ?? '').trim())
        .filter(Boolean)
);

function shuffleList(list) {
    const next = Array.isArray(list) ? [...list] : [];
    for (let i = next.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        const tmp = next[i];
        next[i] = next[j];
        next[j] = tmp;
    }

    return next;
}

function createDynamicId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`;
}

function buildDynamicStroopQuestion() {
    if (DYNAMIC_STROOP_COLOR_POOL.length < 2) {
        return null;
    }

    const target = randomItem(DYNAMIC_STROOP_COLOR_POOL);
    const answerTexts = shuffleList(DYNAMIC_STROOP_COLOR_POOL.map((item) => item.label));
    const answerColors = shuffleList(DYNAMIC_STROOP_COLOR_POOL.map((item) => item.token));
    const correctIndex = answerColors.indexOf(target.token);

    // Keep Stroop effect: avoid letting the correct button text match target label.
    if (correctIndex >= 0 && answerTexts[correctIndex] === target.label && answerTexts.length > 1) {
        const swapIndex = answerTexts.findIndex((text, index) => index !== correctIndex && text !== target.label);
        if (swapIndex >= 0) {
            const tmp = answerTexts[correctIndex];
            answerTexts[correctIndex] = answerTexts[swapIndex];
            answerTexts[swapIndex] = tmp;
        }
    }

    const answerTimeMin = asPositiveInt(STROOP_DYNAMIC_CONFIG?.answerTimeMsMin, 4400);
    const answerTimeMax = asPositiveInt(STROOP_DYNAMIC_CONFIG?.answerTimeMsMax, 5600);
    const answerTimeMs = randomInt(Math.min(answerTimeMin, answerTimeMax), Math.max(answerTimeMin, answerTimeMax));
    const media = DYNAMIC_STROOP_MEDIA_POOL.length > 0 ? randomItem(DYNAMIC_STROOP_MEDIA_POOL) : null;

    return {
        id: createDynamicId('stroop'),
        quizKind: QUIZ_KINDS.STROOP,
        type: 'stroop',
        question: `Hãy bấm vào chữ ${target.label}`,
        media,
        answerTimeMs,
        targetColor: target.token,
        answers: answerTexts.map((text, index) => ({
            text,
            colorToken: answerColors[index],
            correct: answerColors[index] === target.token
        }))
    };
}

function buildDynamicReactionQuestion() {
    const waitMinMs = asPositiveInt(REACTION_DYNAMIC_CONFIG?.waitMinMs, 1000);
    const waitMaxMs = asPositiveInt(REACTION_DYNAMIC_CONFIG?.waitMaxMs, 4000);
    const responseWindowMs = asPositiveInt(REACTION_DYNAMIC_CONFIG?.responseWindowMs, 500);
    const media = DYNAMIC_REACTION_MEDIA_POOL.length > 0 ? randomItem(DYNAMIC_REACTION_MEDIA_POOL) : null;
    const question = DYNAMIC_REACTION_PROMPTS.length > 0
        ? randomItem(DYNAMIC_REACTION_PROMPTS)
        : 'Đợi tín hiệu rồi bấm thật nhanh!';
    const buttonLabel = DYNAMIC_REACTION_BUTTON_LABELS.length > 0
        ? randomItem(DYNAMIC_REACTION_BUTTON_LABELS)
        : '🎉 BẤM NGAY!';

    return {
        id: createDynamicId('reaction'),
        quizKind: QUIZ_KINDS.REACTION,
        type: 'reaction',
        question,
        buttonLabel,
        media,
        readyDelayMs: randomInt(Math.min(waitMinMs, waitMaxMs), Math.max(waitMinMs, waitMaxMs)),
        responseWindowMs
    };
}

function asPositiveInt(rawValue, fallback) {
    const value = Number(rawValue);
    if (!Number.isFinite(value) || value <= 0) {
        return fallback;
    }

    return Math.round(value);
}

function randomInt(min, max) {
    if (max <= min) {
        return min;
    }

    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function sanitizeWordPuzzle(question) {
    if (!question || typeof question !== 'object') {
        return null;
    }

    const wordTokens = getWordTokens(question.answer);
    const answer = wordTokens.join('');
    if (!answer || answer.length < 2) {
        return null;
    }

    const displayWordTokens = getDisplayWordTokens(question.answer);
    const safeDisplayTokens = displayWordTokens.length > 0 ? displayWordTokens : wordTokens;
    const displayAnswer = safeDisplayTokens.join('');
    const wordLengths = safeDisplayTokens.map((token) => token.length).filter((length) => length > 0);
    const presetScrambled = resolvePresetScrambled(
        question.presetScrambled ?? question.scrambled ?? null,
        answer
    );

    return {
        id: question.id,
        quizKind: QUIZ_KINDS.WORD,
        type: 'word',
        question: question.question,
        hint: question.hint,
        answer,
        displayAnswer,
        presetScrambled,
        wordLengths,
        wordCount: wordLengths.length,
        placeholder: question.placeholder ?? 'Nhập đáp án không dấu...'
    };
}

function buildWordQuestion(baseQuestion) {
    if (!baseQuestion) {
        return null;
    }

    let scrambled = baseQuestion.presetScrambled;

    if (!scrambled) {
        scrambled = baseQuestion.displayAnswer;
        let attempt = 0;

        while (normalizeText(scrambled) === baseQuestion.answer && attempt < 8) {
            scrambled = shuffleLetters(baseQuestion.displayAnswer);
            attempt += 1;
        }
    }

    return {
        id: baseQuestion.id,
        quizKind: QUIZ_KINDS.WORD,
        type: 'word',
        question: baseQuestion.question,
        hint: baseQuestion.hint,
        letters: scrambled.split(''),
        scrambled: toGroupedSpacedWord(scrambled, baseQuestion.wordLengths),
        wordLengths: baseQuestion.wordLengths,
        wordCount: baseQuestion.wordCount,
        placeholder: baseQuestion.placeholder,
        normalizedAnswer: baseQuestion.answer
    };
}

function buildReactionQuestion() {
    return buildDynamicReactionQuestion();
}

export function createQuizEngine(options = {}) {
    const uniquePerDeviceEnabled = typeof options?.uniquePerDevice === 'boolean'
        ? options.uniquePerDevice
        : APP_CONFIG.quiz.uniquePerDevice === true;

    const choicePool = CHOICE_QUIZ_SET.map(sanitizeChoiceQuestion).filter(Boolean);
    const wordPool = WORD_PUZZLE_SET.map(sanitizeWordPuzzle).filter(Boolean);

    let currentQuestion = null;

    function getQuizKinds() {
        return QUIZ_KIND_OPTIONS;
    }

    function start(quizKind = QUIZ_KINDS.CHOICE) {
        if (quizKind === QUIZ_KINDS.WORD) {
            currentQuestion = buildWordQuestion(
                pickQuestion(wordPool, QUIZ_KINDS.WORD, uniquePerDeviceEnabled)
            );
            return currentQuestion;
        }

        if (quizKind === QUIZ_KINDS.STROOP) {
            currentQuestion = buildDynamicStroopQuestion();
            return currentQuestion;
        }

        if (quizKind === QUIZ_KINDS.REACTION) {
            currentQuestion = buildReactionQuestion();
            return currentQuestion;
        }

        currentQuestion = pickQuestion(choicePool, QUIZ_KINDS.CHOICE, uniquePerDeviceEnabled);
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

        if (currentQuestion.quizKind === QUIZ_KINDS.REACTION) {
            const timing = typeof answerPayload === 'object' && answerPayload !== null
                ? answerPayload.timing
                : null;

            if (timing !== 'early' && timing !== 'ready' && timing !== 'late') {
                return null;
            }

            const reactionMs = Number(answerPayload?.reactionMs);
            const readyDelayMs = Number(answerPayload?.readyDelayMs ?? currentQuestion.readyDelayMs);
            const responseWindowMs = Number(answerPayload?.responseWindowMs ?? currentQuestion.responseWindowMs);

            return {
                correct: timing === 'ready',
                answerText: timing === 'ready'
                    ? `Phản xạ ${Number.isFinite(reactionMs) ? Math.max(0, Math.round(reactionMs)) : 0}ms`
                    : timing === 'early'
                        ? 'Bấm sớm mất rồi'
                        : 'Bấm trễ mất rồi',
                timing,
                reactionMs: Number.isFinite(reactionMs) ? Math.max(0, Math.round(reactionMs)) : null,
                readyDelayMs: Number.isFinite(readyDelayMs) ? Math.max(0, Math.round(readyDelayMs)) : currentQuestion.readyDelayMs,
                responseWindowMs: Number.isFinite(responseWindowMs)
                    ? Math.max(0, Math.round(responseWindowMs))
                    : currentQuestion.responseWindowMs,
                questionId: currentQuestion.id,
                questionType: currentQuestion.type,
                quizKind: currentQuestion.quizKind
            };
        }

        if (currentQuestion.quizKind === QUIZ_KINDS.STROOP && answerPayload?.timing === 'timeout') {
            const correctAnswerIndexes = currentQuestion.answers
                .map((answer, answerIndex) => (answer.correct ? answerIndex : -1))
                .filter((answerIndex) => answerIndex >= 0);

            return {
                correct: false,
                answerText: 'Hết giờ',
                selectedAnswerIndex: -1,
                correctAnswerIndexes,
                timing: 'timeout',
                answerTimeMs: currentQuestion.answerTimeMs,
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
        const correctAnswerIndexes = currentQuestion.answers
            .map((answer, answerIndex) => (answer.correct ? answerIndex : -1))
            .filter((answerIndex) => answerIndex >= 0);

        return {
            correct: selected.correct,
            answerText: selected.text,
            selectedAnswerIndex: idx,
            correctAnswerIndexes,
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
