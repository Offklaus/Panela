import { pencilIcon } from '../../assets/icons/icons.js';
import { h } from '../../utils/dom.js';
import { ageText, footText, initials } from '../../utils/format.js';

// Perfil do Craque (canvas "Craque · perfil"): iniciais, apelido, e-mail da conta e os blocos Posição,
// Idade e Perna, com "Editar perfil" (FR-010 da 006).
export function createProfileCard({ email, onEdit }) {
  const avatar = h('span', { class: 'craque-avatar', 'aria-hidden': 'true' });
  const name = h('h2', { class: 'display craque-name' });
  const position = h('dd', {});
  const age = h('dd', {});
  const foot = h('dd', {});
  const editButton = h('button', { type: 'button', class: 'btn btn-ghost craque-edit', onClick: onEdit }, pencilIcon(), 'Editar perfil');
  const stat = (label, value) => h('div', { class: 'craque-stat' }, h('dt', {}, label), value);

  return {
    el: h(
      'div',
      { class: 'craque-profile' },
      h(
        'div',
        { class: 'craque-identity' },
        avatar,
        h('div', { class: 'craque-identity-text' }, name, h('span', { class: 'craque-email' }, email ?? '')),
      ),
      h('dl', { class: 'craque-stats' }, stat('Posição', position), stat('Idade', age), stat('Perna', foot)),
      h('div', { class: 'craque-actions' }, editButton),
    ),
    update(profile) {
      avatar.textContent = initials(profile.nickname);
      name.textContent = profile.nickname;
      position.textContent = profile.position;
      age.textContent = ageText(profile.age);
      foot.textContent = footText(profile.foot);
    },
    focus: () => editButton.focus(),
  };
}
