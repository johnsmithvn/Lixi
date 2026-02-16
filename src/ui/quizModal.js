function buildStepLabel(baseText, quizStatus) {
    if (!quizStatus || typeof quizStatus !== 'object') {
        return baseText;
    }

    const maxAttempts = quizStatus?.maxAttempts ?? 3;
    const attemptsUsed = quizStatus?.attemptsUsed ?? 0;
    const nextAttempt = Math.min(maxAttempts, attemptsUsed + 1);
    return `${baseText} (${nextAttempt}/${maxAttempts})`;
}

export function createQuizModalController() {
    const refs = {};
    let handlers = null;
    let wordState = null;

    function cacheRefs() {
        refs.modal = document.getElementById('quiz-modal');
        refs.stepLabel = document.getElementById('quiz-step-label');
        refs.question = document.getElementById('quiz-question');

        refs.kindPicker = document.getElementById('quiz-kind-picker');
        refs.kindList = document.getElementById('quiz-kind-list');

        refs.mediaContainer = document.getElementById('quiz-media-container');
        refs.answers = document.getElementById('quiz-answers');

        refs.wordForm = document.getElementById('quiz-word-form');
        refs.wordHint = document.getElementById('quiz-word-hint');
        refs.wordScrambled = document.getElementById('quiz-word-scrambled');
        refs.wordSlots = document.getElementById('quiz-word-slots');
        refs.wordBank = document.getElementById('quiz-word-bank');
        refs.wordReset = document.getElementById('quiz-word-reset');
        refs.wordSubmit = document.getElementById('quiz-word-submit');

        refs.feedback = document.getElementById('quiz-feedback');
        refs.feedbackTitle = document.getElementById('quiz-feedback-title');
        refs.feedbackText = document.getElementById('quiz-feedback-text');

        refs.cancelBtn = document.getElementById('quiz-cancel-btn');
        refs.continueBtn = document.getElementById('quiz-continue-btn');
    }

    function showModal() {
        refs.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function clearMedia() {
        refs.mediaContainer.innerHTML = '';
        refs.mediaContainer.classList.add('hidden');
    }

    function clearAnswers() {
        refs.answers.innerHTML = '';
        refs.answers.classList.add('hidden');
    }

    function clearKindPicker() {
        refs.kindList.innerHTML = '';
        refs.kindPicker.classList.add('hidden');
    }

    function clearWordForm() {
        wordState = null;
        refs.wordHint.textContent = '';
        refs.wordScrambled.textContent = '';
        refs.wordSlots.innerHTML = '';
        refs.wordBank.innerHTML = '';
        refs.wordReset.removeAttribute('disabled');
        refs.wordSubmit.removeAttribute('disabled');
        refs.wordForm.classList.add('hidden');
    }

    function clearFeedback() {
        refs.feedback.classList.add('hidden');
        refs.feedback.classList.remove('quiz-feedback--ok', 'quiz-feedback--miss');
        refs.feedbackTitle.textContent = '';
        refs.feedbackText.textContent = '';
        refs.continueBtn.classList.add('hidden');
    }

    function renderMedia(question) {
        clearMedia();

        if (question.type === 'image' && question.media) {
            const image = document.createElement('img');
            image.className = 'quiz-media-image';
            image.src = question.media;
            image.alt = 'Quiz media';
            refs.mediaContainer.appendChild(image);
            refs.mediaContainer.classList.remove('hidden');
        }
    }

    function renderAnswers(question) {
        clearAnswers();
        refs.answers.classList.remove('hidden');

        question.answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'quiz-answer-btn';
            button.dataset.answerIndex = String(index);
            button.textContent = answer.text;
            button.addEventListener('click', () => {
                handlers?.onAnswer({ answerIndex: index });
            });

            refs.answers.appendChild(button);
        });
    }

    function resetAnswerResultStyles() {
        refs.answers.querySelectorAll('.quiz-answer-btn').forEach((button) => {
            button.classList.remove(
                'quiz-answer-btn--correct',
                'quiz-answer-btn--wrong',
                'quiz-answer-btn--muted'
            );
        });
    }

    function revealChoiceResult(feedback) {
        if (feedback?.quizKind !== 'choice') {
            return;
        }

        const selectedIndex = Number(feedback.selectedAnswerIndex);
        const correctIndexes = Array.isArray(feedback.correctAnswerIndexes)
            ? feedback.correctAnswerIndexes
                .map((value) => Number(value))
                .filter((value) => Number.isInteger(value) && value >= 0)
            : [];

        if (!Number.isInteger(selectedIndex) || correctIndexes.length === 0) {
            return;
        }

        const correctSet = new Set(correctIndexes);
        const answerButtons = Array.from(refs.answers.querySelectorAll('.quiz-answer-btn'));

        answerButtons.forEach((button, answerIndex) => {
            if (correctSet.has(answerIndex)) {
                button.classList.add('quiz-answer-btn--correct');
                return;
            }

            if (answerIndex === selectedIndex && feedback.correct === false) {
                button.classList.add('quiz-answer-btn--wrong');
                return;
            }

            button.classList.add('quiz-answer-btn--muted');
        });
    }

    function buildWordAnswer() {
        if (!wordState) {
            return '';
        }

        return wordState.slots
            .map((bankIndex) => (bankIndex === null ? '' : wordState.letters[bankIndex]))
            .join('');
    }

    function isWordFilled() {
        return Boolean(wordState) && wordState.slots.every((slot) => slot !== null);
    }

    function refreshWordPuzzleUI() {
        refs.wordSlots.innerHTML = '';
        refs.wordBank.innerHTML = '';

        if (!wordState) {
            refs.wordReset.setAttribute('disabled', 'disabled');
            refs.wordSubmit.setAttribute('disabled', 'disabled');
            return;
        }

        wordState.slots.forEach((bankIndex, slotIndex) => {
            const slotBtn = document.createElement('button');
            slotBtn.type = 'button';
            slotBtn.className = 'quiz-word-slot';

            if (bankIndex !== null) {
                slotBtn.classList.add('filled');
                slotBtn.textContent = wordState.letters[bankIndex];
            } else {
                slotBtn.textContent = '·';
            }

            const canRemove = bankIndex !== null && !wordState.locked;
            if (!canRemove) {
                slotBtn.setAttribute('disabled', 'disabled');
            } else {
                slotBtn.addEventListener('click', () => {
                    const selectedBankIndex = wordState?.slots[slotIndex];
                    if (selectedBankIndex === null || selectedBankIndex === undefined) {
                        return;
                    }

                    wordState.slots[slotIndex] = null;
                    wordState.used[selectedBankIndex] = false;
                    refreshWordPuzzleUI();
                });
            }

            refs.wordSlots.appendChild(slotBtn);

            if (wordState.breakpoints.has(slotIndex)) {
                const gap = document.createElement('span');
                gap.className = 'quiz-word-gap';
                gap.setAttribute('aria-hidden', 'true');
                refs.wordSlots.appendChild(gap);
            }
        });

        wordState.letters.forEach((letter, bankIndex) => {
            const letterBtn = document.createElement('button');
            letterBtn.type = 'button';
            letterBtn.className = 'quiz-word-letter';
            letterBtn.textContent = letter;

            const isUsed = wordState.used[bankIndex] === true;
            if (isUsed) {
                letterBtn.classList.add('used');
            }

            if (isUsed || wordState.locked) {
                letterBtn.setAttribute('disabled', 'disabled');
            } else {
                letterBtn.addEventListener('click', () => {
                    const nextSlot = wordState?.slots.findIndex((slot) => slot === null);
                    if (nextSlot === undefined || nextSlot < 0) {
                        return;
                    }

                    wordState.slots[nextSlot] = bankIndex;
                    wordState.used[bankIndex] = true;
                    refreshWordPuzzleUI();
                });
            }

            refs.wordBank.appendChild(letterBtn);
        });

        const hasSelection = wordState.slots.some((slot) => slot !== null);
        refs.wordReset.toggleAttribute('disabled', !hasSelection || wordState.locked);
        refs.wordSubmit.toggleAttribute('disabled', !isWordFilled() || wordState.locked);
    }

    function renderWordPuzzle(question) {
        clearWordForm();
        clearAnswers();
        clearMedia();

        const letters = Array.isArray(question.letters)
            ? question.letters.map((letter) => String(letter).toUpperCase())
            : String(question.scrambled ?? '').replace(/\s+/g, '').split('');

        const rawWordLengths = Array.isArray(question.wordLengths)
            ? question.wordLengths
                .map((length) => Number(length))
                .filter((length) => Number.isFinite(length) && length > 0)
            : [];
        const wordLengths = rawWordLengths.length > 0 ? rawWordLengths : [letters.length];
        const breakpoints = [];
        let cursor = 0;
        for (let i = 0; i < wordLengths.length - 1; i += 1) {
            cursor += wordLengths[i];
            breakpoints.push(cursor - 1);
        }

        wordState = {
            letters,
            slots: new Array(letters.length).fill(null),
            used: new Array(letters.length).fill(false),
            locked: false,
            breakpoints: new Set(breakpoints)
        };

        const wordCount = Number.isInteger(question.wordCount) && question.wordCount > 1
            ? question.wordCount
            : wordLengths.length;

        refs.wordHint.textContent = wordCount > 1
            ? `Gợi ý: ${question.hint} · Đáp án gồm ${wordCount} từ`
            : `Gợi ý: ${question.hint}`;
        refs.wordScrambled.textContent = question.scrambled;
        refs.wordForm.classList.remove('hidden');
        refreshWordPuzzleUI();
    }

    function lockAnswerInputs() {
        const answerButtons = refs.answers.querySelectorAll('.quiz-answer-btn');
        answerButtons.forEach((button) => {
            button.setAttribute('disabled', 'disabled');
        });

        if (wordState) {
            wordState.locked = true;
            refreshWordPuzzleUI();
            return;
        }

        refs.wordReset.setAttribute('disabled', 'disabled');
        refs.wordSubmit.setAttribute('disabled', 'disabled');
    }

    function openCategoryPicker(quizKinds, quizStatus) {
        clearFeedback();
        clearMedia();
        clearAnswers();
        clearWordForm();
        clearKindPicker();

        refs.stepLabel.textContent = buildStepLabel('🎯 Chọn thể loại quiz', quizStatus);
        refs.question.textContent = 'Bạn muốn thử thể loại nào?';

        quizKinds.forEach((kind) => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'quiz-kind-btn';
            btn.innerHTML = `
                <span class="quiz-kind-label">${kind.label}</span>
                <span class="quiz-kind-desc">${kind.description}</span>
            `;
            btn.addEventListener('click', () => handlers?.onSelectKind(kind.id));
            refs.kindList.appendChild(btn);
        });

        refs.kindPicker.classList.remove('hidden');
        refs.cancelBtn.classList.remove('hidden');
        showModal();
    }

    function openQuestion(question, quizStatus = null) {
        if (!question) {
            return;
        }

        clearFeedback();
        clearKindPicker();

        const baseLabel = question.quizKind === 'word'
            ? '🔤 Xếp chữ Tết'
            : '🧠 Trắc nghiệm';

        refs.stepLabel.textContent = buildStepLabel(baseLabel, quizStatus);
        refs.question.textContent = question.question;

        if (question.quizKind === 'word') {
            renderWordPuzzle(question);
        } else {
            clearWordForm();
            renderMedia(question);
            renderAnswers(question);
        }

        refs.cancelBtn.classList.remove('hidden');
        showModal();
    }

    function submitWordAnswer() {
        if (!isWordFilled() || wordState?.locked === true) {
            return;
        }

        handlers?.onAnswer({ textAnswer: buildWordAnswer() });
    }

    function init(nextHandlers) {
        handlers = nextHandlers;
        cacheRefs();

        refs.modal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeQuiz === 'true') {
                handlers?.onCancel();
            }
        });

        refs.cancelBtn.addEventListener('click', () => handlers?.onCancel());
        refs.continueBtn.addEventListener('click', () => handlers?.onContinue());

        refs.wordReset.addEventListener('click', () => {
            if (!wordState || wordState.locked) {
                return;
            }

            wordState.slots.fill(null);
            wordState.used.fill(false);
            refreshWordPuzzleUI();
        });

        refs.wordSubmit.addEventListener('click', submitWordAnswer);
    }

    function showFeedback(feedback) {
        if (!feedback) {
            return;
        }

        resetAnswerResultStyles();
        refs.feedbackTitle.textContent = feedback.title;
        refs.feedbackText.textContent = feedback.message;
        refs.feedback.classList.remove('hidden');
        refs.feedback.classList.add(feedback.correct ? 'quiz-feedback--ok' : 'quiz-feedback--miss');
        revealChoiceResult(feedback);

        if (typeof feedback.continueLabel === 'string' && feedback.continueLabel.trim()) {
            refs.continueBtn.textContent = feedback.continueLabel;
        } else if (feedback.correct) {
            refs.continueBtn.textContent = '🧧 Mở bao tiếp';
        } else if (feedback.canRetryQuiz) {
            refs.continueBtn.textContent = `🎯 Thử câu khác (${feedback.remainingAttempts} lượt)`;
        } else {
            refs.continueBtn.textContent = 'Đóng';
        }

        refs.continueBtn.classList.remove('hidden');
        lockAnswerInputs();
    }

    function close() {
        refs.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');

        clearFeedback();
        clearKindPicker();
        clearMedia();
        clearAnswers();
        clearWordForm();
    }

    return {
        init,
        openCategoryPicker,
        openQuestion,
        showFeedback,
        close
    };
}
