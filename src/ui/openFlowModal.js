import { APP_CONFIG } from '../core/config.js';

const OPEN_FLOW_STEPS = Object.freeze({
    TALK: 'TALK',
    CONFIRM: 'CONFIRM',
    FINAL_CONFIRM: 'FINAL_CONFIRM'
});

const DEFAULT_CONFIRM_FACE = '🤔';
const DEFAULT_FINAL_FACE = '⚠️';

function hasImageSrc(value) {
    return typeof value === 'string' && value.trim().length > 0;
}

export function createOpenFlowModalController() {
    const refs = {};
    let handlers = null;
    let context = null;
    let currentStep = OPEN_FLOW_STEPS.TALK;

    function cacheRefs() {
        refs.modal = document.getElementById('open-flow-modal');
        refs.sheet = document.getElementById('open-flow-sheet');
        refs.step = document.getElementById('open-flow-step');
        refs.face = document.getElementById('open-flow-face');
        refs.title = document.getElementById('open-flow-title');
        refs.message = document.getElementById('open-flow-message');
        refs.primary = document.getElementById('open-flow-primary');
        refs.secondary = document.getElementById('open-flow-secondary');
    }

    function showModal() {
        if (!refs.modal) {
            return;
        }

        refs.modal.classList.remove('hidden');
        document.body.classList.add('modal-open');
    }

    function hideModal() {
        if (!refs.modal) {
            return;
        }

        refs.modal.classList.add('hidden');
        document.body.classList.remove('modal-open');
    }

    function setDangerState(isDanger) {
        refs.sheet.classList.toggle('open-flow-sheet--danger', isDanger);
    }

    function renderFace({ emoji = '', imageSrc = null, imageAlt = '' }) {
        refs.face.classList.remove('open-flow-face--image');
        refs.face.textContent = '';
        refs.face.innerHTML = '';

        if (hasImageSrc(imageSrc)) {
            const image = document.createElement('img');
            image.className = 'open-flow-face-image';
            image.src = imageSrc.trim();
            image.alt = imageAlt || 'Ảnh minh họa mở bao';
            refs.face.appendChild(image);
            refs.face.classList.add('open-flow-face--image');
            return;
        }

        refs.face.textContent = emoji;
    }

    function renderStepTalk() {
        refs.step.textContent = 'Lời thì thầm của vũ trụ...';
        renderFace({
            emoji: context?.faceEmoji ?? '🧧',
            imageSrc: context?.faceImage ?? null,
            imageAlt: context?.faceLabel ?? 'Bao lì xì'
        });
        refs.title.textContent = context?.faceLabel ?? 'Bao lì xì bí ẩn';
        refs.message.textContent = context?.quote ?? 'Chọn tui đi, tui giữ bí mật dễ thương nè!';
        refs.primary.textContent = 'Mở bao này';
        refs.secondary.textContent = 'Thôi để tui suy nghĩ lại';
        setDangerState(false);
    }

    function renderStepConfirm() {
        refs.step.textContent = 'Chắc chưa? =)))))))';
        renderFace({
            emoji: DEFAULT_CONFIRM_FACE,
            imageSrc: APP_CONFIG.openFlow.confirmFaceImage,
            imageAlt: 'Xác nhận vận mệnh'
        });
        refs.title.textContent = 'Vận mệnh chỉ có 1 lần thôi nha!';
        refs.message.textContent = 'Bạn có chắc muốn mở bao này không?';
        refs.primary.textContent = 'Chắc chắn mở';
        refs.secondary.textContent = 'Đổi bao khác';
        setDangerState(false);
    }

    function renderStepFinalConfirm() {
        refs.step.textContent = 'Bước 3: Cảnh báo cấp cao';
        renderFace({
            emoji: DEFAULT_FINAL_FACE,
            imageSrc: APP_CONFIG.openFlow.finalFaceImage,
            imageAlt: 'Cảnh báo cấp cao'
        });
        refs.title.textContent = 'Bao này đang rung mạnh...';
        refs.message.textContent = 'Năng lượng lộc đang rất lớn. Bạn có thật sự sẵn sàng?';
        refs.primary.textContent = 'MỞ NGAY';
        refs.secondary.textContent = 'Thôi tôi sợ rồi';
        setDangerState(true);
    }

    function renderCurrentStep() {
        if (currentStep === OPEN_FLOW_STEPS.TALK) {
            renderStepTalk();
            return;
        }

        if (currentStep === OPEN_FLOW_STEPS.CONFIRM) {
            renderStepConfirm();
            return;
        }

        renderStepFinalConfirm();
    }

    function emitStepChange() {
        handlers?.onStepChange?.(currentStep, context);
    }

    function nextStep() {
        if (!context) {
            return;
        }

        if (currentStep === OPEN_FLOW_STEPS.TALK) {
            currentStep = OPEN_FLOW_STEPS.CONFIRM;
            renderCurrentStep();
            emitStepChange();
            return;
        }

        if (currentStep === OPEN_FLOW_STEPS.CONFIRM) {
            if (context.showFinalConfirm === true) {
                currentStep = OPEN_FLOW_STEPS.FINAL_CONFIRM;
                renderCurrentStep();
                emitStepChange();
                return;
            }

            handlers?.onConfirm?.(context);
            close();
            return;
        }

        handlers?.onConfirm?.(context);
        close();
    }

    function cancelFlow() {
        const payload = context;
        close();
        handlers?.onCancel?.(payload);
    }

    function open(payload) {
        context = payload;
        currentStep = payload?.talkStepEnabled === false
            ? OPEN_FLOW_STEPS.CONFIRM
            : OPEN_FLOW_STEPS.TALK;

        renderCurrentStep();
        showModal();
        handlers?.onOpen?.(context);
        emitStepChange();
    }

    function close() {
        hideModal();
        refs.sheet?.classList.remove('open-flow-sheet--danger');
        context = null;
    }

    function isOpen() {
        if (!refs.modal) {
            return false;
        }

        return !refs.modal.classList.contains('hidden');
    }

    function init(nextHandlers) {
        handlers = nextHandlers;
        cacheRefs();

        refs.modal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeOpenFlow === 'true') {
                cancelFlow();
            }
        });

        refs.primary.addEventListener('click', nextStep);
        refs.secondary.addEventListener('click', cancelFlow);

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen()) {
                cancelFlow();
            }
        });
    }

    return {
        init,
        open,
        close,
        isOpen
    };
}
