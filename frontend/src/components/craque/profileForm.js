import { checkIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { footText } from '../../utils/format.js';
import { showNotice } from '../../utils/notice.js';

const POSITIONS = [
  { value: 'ATA', text: 'ATA', label: 'ATA (ataque)' },
  { value: 'DEF', text: 'DEF', label: 'DEF (defesa)' },
];

const fieldError = (id) => h('span', { class: 'field-error', id, hidden: true });

// Data de hoje no aparelho, só para o calendário não oferecer o futuro; quem barra é o backend.
function todayOnDevice() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

// Grupo em que só um botão fica marcado (aria-pressed), como a posição do formulário de jogador.
function choiceGroup({ id, label, className, options, onPick }) {
  let value = null;
  const error = fieldError(`${id}-error`);
  const buttons = options.map((option) =>
    h(
      'button',
      {
        type: 'button',
        class: 'position-option',
        'aria-label': option.label,
        'aria-pressed': 'false',
        dataset: { value: option.value },
        onClick: () => {
          set(option.value);
          onPick();
        },
      },
      option.text,
    ),
  );

  function set(next) {
    value = next;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.dataset.value === next));
  }

  return {
    el: h(
      'div',
      { class: 'craque-field' },
      h('span', { class: 'eyebrow', id: `${id}-label` }, label),
      h('div', { class: className, role: 'group', 'aria-labelledby': `${id}-label`, 'aria-describedby': `${id}-error` }, buttons),
      error,
    ),
    error,
    get value() {
      return value;
    },
    set,
    focus: () => buttons[0].focus(),
  };
}

// Formulário do Craque (canvas "Craque · criar perfil" e "Craque · editar perfil"). O backend valida e
// devolve um erro por vez, que aparece junto do campo, com o foco nele (FR-009 da 006).
export function createProfileForm({ feet, editing = false, onSubmit, onCancel }) {
  const nickname = h('input', {
    id: 'craque-nickname',
    type: 'text',
    class: 'field-input',
    placeholder: 'Ex.: Pedrinho',
    autocomplete: 'nickname',
    'aria-describedby': 'craque-nickname-error',
  });
  const birthDate = h('input', {
    id: 'craque-birth-date',
    type: 'date',
    class: 'field-input',
    max: todayOnDevice(),
    autocomplete: 'bday',
    'aria-describedby': 'craque-birth-date-error',
  });
  const nicknameError = fieldError('craque-nickname-error');
  const birthDateError = fieldError('craque-birth-date-error');
  const position = choiceGroup({
    id: 'craque-position',
    label: 'Posição',
    className: 'position-options',
    options: POSITIONS,
    onPick: () => showError(position.error, null),
  });
  const foot = choiceGroup({
    id: 'craque-foot',
    label: 'Perna dominante',
    className: 'craque-foot-options',
    options: feet.map((value) => ({ value, text: footText(value) })),
    onPick: () => showError(foot.error, null),
  });

  const fields = {
    nickname: { error: nicknameError, input: nickname, focus: () => nickname.focus() },
    birthDate: { error: birthDateError, input: birthDate, focus: () => birthDate.focus() },
    position: { error: position.error, focus: position.focus },
    foot: { error: foot.error, focus: foot.focus },
  };

  const submit = h(
    'button',
    { type: 'submit', class: `btn btn-primary${editing ? '' : ' craque-submit'}` },
    checkIcon({ size: 18 }),
    editing ? 'Salvar' : 'Salvar perfil',
  );
  const buttons = editing
    ? h('div', { class: 'craque-buttons' }, h('button', { type: 'button', class: 'btn btn-ghost', onClick: onCancel }, 'Cancelar'), submit)
    : submit;

  function showError(element, message) {
    element.textContent = message ?? '';
    element.hidden = !message;
  }

  function setError(message, field) {
    for (const [name, entry] of Object.entries(fields)) {
      const own = name === field ? message : null;
      showError(entry.error, own);
      if (entry.input) {
        if (own) entry.input.setAttribute('aria-invalid', 'true');
        else entry.input.removeAttribute('aria-invalid');
      }
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    submit.disabled = true;
    try {
      await onSubmit({ nickname: nickname.value, birthDate: birthDate.value, position: position.value, foot: foot.value });
    } catch (apiError) {
      if (apiError.handled) return;
      const field = fields[apiError.field];
      if (apiError.code === 'VALIDATION_ERROR' && field) {
        setError(apiError.message, apiError.field);
        field.focus();
      } else {
        showNotice(apiError.message);
      }
    } finally {
      submit.disabled = false;
    }
  }

  // Ordem do canvas: apelido, data, posição, perna e os botões.
  return {
    el: h(
      'form',
      { class: 'craque-form', novalidate: true, onSubmit: handleSubmit },
      h('div', { class: 'craque-field' }, h('label', { class: 'eyebrow', for: 'craque-nickname' }, 'Apelido'), nickname, nicknameError),
      h(
        'div',
        { class: 'craque-field' },
        h('label', { class: 'eyebrow', for: 'craque-birth-date' }, 'Data de nascimento'),
        birthDate,
        birthDateError,
      ),
      position.el,
      foot.el,
      buttons,
    ),
    fill(profile) {
      nickname.value = profile.nickname;
      birthDate.value = profile.birthDate;
      position.set(profile.position);
      foot.set(profile.foot);
    },
  };
}
