import { removeKey, writeJSON } from '../utils/storage.js';

const DEFAULT_STORAGE_KEY = 'lixi_app_config_overrides_v1';

const SETTINGS_SCHEMA = Object.freeze([
    {
        key: 'GAME',
        title: 'Game',
        fields: [
            {
                path: ['GAME', 'totalEnvelopes'],
                key: 'GAME.totalEnvelopes',
                label: 'Tong so bao li xi',
                type: 'number',
                min: 1,
                step: 1,
                integer: true
            },
            {
                path: ['GAME', 'rewardMode'],
                key: 'GAME.rewardMode',
                label: 'Che do phan thuong',
                type: 'select',
                options: ['COUNT', 'CHANCE']
            },
            {
                path: ['GAME', 'trollChance'],
                key: 'GAME.trollChance',
                label: 'Ti le troll (0-1)',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
                visibility: 'CHANCE'
            },
            {
                path: ['GAME', 'specialChance'],
                key: 'GAME.specialChance',
                label: 'Ti le special (0-1)',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
                visibility: 'CHANCE'
            },
            {
                path: ['GAME', 'moneyChance'],
                key: 'GAME.moneyChance',
                label: 'Ti le money (0-1)',
                type: 'number',
                min: 0,
                max: 1,
                step: 0.01,
                visibility: 'CHANCE'
            },
            {
                path: ['GAME', 'trollCount'],
                key: 'GAME.trollCount',
                label: 'So luong troll',
                type: 'number',
                min: 0,
                step: 1,
                integer: true,
                visibility: 'COUNT'
            },
            {
                path: ['GAME', 'specialCount'],
                key: 'GAME.specialCount',
                label: 'So luong special',
                type: 'number',
                min: 0,
                step: 1,
                integer: true,
                visibility: 'COUNT'
            },
            {
                path: ['GAME', 'moneyCount'],
                key: 'GAME.moneyCount',
                label: 'So luong money',
                type: 'number',
                min: 0,
                step: 1,
                integer: true,
                visibility: 'COUNT'
            }
        ]
    },
    {
        key: 'TIMINGS',
        title: 'Timings',
        fields: [
            {
                path: ['TIMINGS', 'trollRevealDelayMs'],
                key: 'TIMINGS.trollRevealDelayMs',
                label: 'Delay reveal troll (ms)',
                type: 'number',
                min: 0,
                step: 50,
                integer: true
            }
        ]
    },
    {
        key: 'QUIZ',
        title: 'Quiz',
        fields: [
            {
                path: ['QUIZ', 'maxAttempts'],
                key: 'QUIZ.maxAttempts',
                label: 'So lan toi da',
                type: 'number',
                min: 1,
                step: 1,
                integer: true
            },
            {
                path: ['QUIZ', 'enabledInLockedMode'],
                key: 'QUIZ.enabledInLockedMode',
                label: 'Cho phep quiz o che do locked',
                type: 'checkbox'
            },
            {
                path: ['QUIZ', 'winContinueMode'],
                key: 'QUIZ.winContinueMode',
                label: 'Win continue mode',
                type: 'checkbox'
            },
            {
                path: ['QUIZ', 'uniquePerDevice'],
                key: 'QUIZ.uniquePerDevice',
                label: 'Moi cau hoi 1 lan / thiet bi',
                type: 'checkbox'
            }
        ]
    }
]);

function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readPath(source, path, fallback = undefined) {
    if (!isPlainObject(source)) {
        return fallback;
    }

    let current = source;
    for (const key of path) {
        if (!isPlainObject(current) && !Array.isArray(current)) {
            return fallback;
        }

        if (!(key in current)) {
            return fallback;
        }

        current = current[key];
    }

    return current;
}

function writePath(target, path, value) {
    if (!isPlainObject(target) || !Array.isArray(path) || path.length === 0) {
        return;
    }

    let current = target;
    for (let i = 0; i < path.length - 1; i += 1) {
        const key = path[i];
        if (!isPlainObject(current[key])) {
            current[key] = {};
        }

        current = current[key];
    }

    current[path[path.length - 1]] = value;
}

function parseFieldValue(input, field, fallbackValue) {
    if (field.type === 'checkbox') {
        return input.checked === true;
    }

    if (field.type === 'select') {
        return String(input.value ?? '').toUpperCase();
    }

    if (field.type === 'number') {
        const parsed = Number(input.value);
        if (!Number.isFinite(parsed)) {
            return fallbackValue;
        }

        let value = parsed;
        if (field.integer) {
            value = Math.floor(value);
        }

        if (Number.isFinite(field.min)) {
            value = Math.max(field.min, value);
        }

        if (Number.isFinite(field.max)) {
            value = Math.min(field.max, value);
        }

        return value;
    }

    return String(input.value ?? '');
}

function valuesEqual(a, b) {
    return a === b;
}

function getRuntimeConfig() {
    return isPlainObject(window.APP_CONFIG) ? window.APP_CONFIG : {};
}

function getDefaultConfig() {
    return isPlainObject(window.APP_DEFAULT_CONFIG) ? window.APP_DEFAULT_CONFIG : {};
}

function getStorageKey() {
    if (typeof window.APP_CONFIG_STORAGE_KEY === 'string' && window.APP_CONFIG_STORAGE_KEY.trim()) {
        return window.APP_CONFIG_STORAGE_KEY;
    }

    return DEFAULT_STORAGE_KEY;
}

function hasBlockingModalOpen() {
    return document.querySelector(
        '.modal:not(.hidden), .open-flow-modal:not(.hidden), .quiz-modal:not(.hidden)'
    ) !== null;
}

export function createSettingsPanelController() {
    const refs = {};
    const fieldRefs = new Map();
    const rewardModeRows = [];

    function cacheRefs() {
        refs.toggleButton = document.getElementById('settings-toggle-btn');
        refs.modal = document.getElementById('settings-modal');
        refs.form = document.getElementById('settings-form');
        refs.status = document.getElementById('settings-status');
        refs.saveButton = document.getElementById('settings-save-btn');
        refs.resetButton = document.getElementById('settings-reset-btn');
        refs.closeButton = document.getElementById('settings-close-btn');
    }

    function setStatus(message = '', level = 'info') {
        if (!refs.status) {
            return;
        }

        if (!message) {
            refs.status.textContent = '';
            refs.status.classList.add('hidden');
            refs.status.dataset.level = '';
            return;
        }

        refs.status.textContent = message;
        refs.status.dataset.level = level;
        refs.status.classList.remove('hidden');
    }

    function createFieldInput(field, value) {
        const id = `settings-${field.key.replace(/\./g, '-')}`;

        if (field.type === 'checkbox') {
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = id;
            input.checked = value === true;
            input.className = 'settings-input settings-input--checkbox';
            return input;
        }

        if (field.type === 'select') {
            const select = document.createElement('select');
            select.id = id;
            select.className = 'settings-input settings-input--select';

            (field.options ?? []).forEach((optionValue) => {
                const option = document.createElement('option');
                option.value = optionValue;
                option.textContent = optionValue;
                option.selected = String(value).toUpperCase() === String(optionValue).toUpperCase();
                select.appendChild(option);
            });

            return select;
        }

        const input = document.createElement('input');
        input.type = 'number';
        input.id = id;
        input.className = 'settings-input';
        input.value = Number.isFinite(Number(value)) ? String(value) : '';

        if (Number.isFinite(field.min)) {
            input.min = String(field.min);
        }

        if (Number.isFinite(field.max)) {
            input.max = String(field.max);
        }

        if (Number.isFinite(field.step)) {
            input.step = String(field.step);
        }

        return input;
    }

    function createFieldRow(field, runtimeConfig, defaultConfig) {
        const defaultValue = readPath(defaultConfig, field.path);
        const runtimeValue = readPath(runtimeConfig, field.path, defaultValue);
        const row = document.createElement('label');
        row.className = `settings-row settings-row--${field.type}`;
        row.setAttribute('for', `settings-${field.key.replace(/\./g, '-')}`);
        if (typeof field.visibility === 'string') {
            row.dataset.rewardScope = field.visibility.toUpperCase();
            rewardModeRows.push(row);
        }

        const title = document.createElement('span');
        title.className = 'settings-label';
        title.textContent = field.label;

        const input = createFieldInput(field, runtimeValue);
        fieldRefs.set(field.key, {
            field,
            input,
            defaultValue
        });

        row.appendChild(title);
        row.appendChild(input);
        return row;
    }

    function renderForm() {
        if (!refs.form) {
            return;
        }

        refs.form.innerHTML = '';
        fieldRefs.clear();
        rewardModeRows.length = 0;

        const runtimeConfig = getRuntimeConfig();
        const defaultConfig = getDefaultConfig();
        const fragment = document.createDocumentFragment();

        SETTINGS_SCHEMA.forEach((section) => {
            const sectionEl = document.createElement('fieldset');
            sectionEl.className = 'settings-section';

            const legend = document.createElement('legend');
            legend.className = 'settings-section-title';
            legend.textContent = section.title;
            sectionEl.appendChild(legend);

            section.fields.forEach((field) => {
                sectionEl.appendChild(createFieldRow(field, runtimeConfig, defaultConfig));
            });

            fragment.appendChild(sectionEl);
        });

        refs.form.appendChild(fragment);
        syncRewardModeVisibility();
    }

    function getRewardModeValue() {
        const ref = fieldRefs.get('GAME.rewardMode');
        if (!ref?.input) {
            return 'COUNT';
        }

        return String(ref.input.value ?? 'COUNT').toUpperCase();
    }

    function syncRewardModeVisibility() {
        const mode = getRewardModeValue();
        rewardModeRows.forEach((row) => {
            const scope = String(row.dataset.rewardScope ?? '');
            row.classList.toggle('hidden', scope && scope !== mode);
        });
    }

    function populateFromRuntimeConfig() {
        const runtimeConfig = getRuntimeConfig();

        fieldRefs.forEach((ref) => {
            const runtimeValue = readPath(runtimeConfig, ref.field.path, ref.defaultValue);
            if (ref.field.type === 'checkbox') {
                ref.input.checked = runtimeValue === true;
                return;
            }

            ref.input.value = runtimeValue ?? '';
        });

        syncRewardModeVisibility();
    }

    function isOpen() {
        return refs.modal && !refs.modal.classList.contains('hidden');
    }

    function open() {
        if (!refs.modal) {
            return;
        }

        if (hasBlockingModalOpen()) {
            return;
        }

        populateFromRuntimeConfig();
        setStatus('');
        refs.modal.classList.remove('hidden');
        refs.toggleButton?.setAttribute('aria-expanded', 'true');
    }

    function close() {
        if (!refs.modal) {
            return;
        }

        refs.modal.classList.add('hidden');
        refs.toggleButton?.setAttribute('aria-expanded', 'false');
        setStatus('');
    }

    function buildOverrides() {
        const overrides = {};

        fieldRefs.forEach((ref) => {
            const runtimeConfig = getRuntimeConfig();
            const runtimeValue = readPath(runtimeConfig, ref.field.path, ref.defaultValue);
            const value = parseFieldValue(ref.input, ref.field, runtimeValue);
            const fallbackValue = ref.defaultValue;

            if (!valuesEqual(value, fallbackValue)) {
                writePath(overrides, ref.field.path, value);
            }
        });

        return overrides;
    }

    function saveAndReload() {
        const storageKey = getStorageKey();
        const overrides = buildOverrides();

        if (Object.keys(overrides).length === 0) {
            removeKey(storageKey);
        } else {
            writeJSON(storageKey, overrides);
        }

        setStatus('Da luu cau hinh, dang tai lai...', 'success');
        window.setTimeout(() => {
            window.location.reload();
        }, 220);
    }

    function resetAndReload() {
        const storageKey = getStorageKey();
        removeKey(storageKey);
        setStatus('Da reset ve mac dinh, dang tai lai...', 'success');
        window.setTimeout(() => {
            window.location.reload();
        }, 220);
    }

    function init() {
        cacheRefs();
        if (!refs.modal || !refs.form || !refs.toggleButton) {
            return;
        }

        renderForm();

        const rewardModeRef = fieldRefs.get('GAME.rewardMode');
        rewardModeRef?.input?.addEventListener('change', syncRewardModeVisibility);

        refs.toggleButton.addEventListener('click', () => {
            if (isOpen()) {
                close();
                return;
            }

            open();
        });

        refs.saveButton?.addEventListener('click', saveAndReload);
        refs.resetButton?.addEventListener('click', resetAndReload);
        refs.closeButton?.addEventListener('click', close);

        refs.modal.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLElement && target.dataset.closeSettings === 'true') {
                close();
            }
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && isOpen()) {
                close();
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
