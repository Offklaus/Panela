// Rotas por hash: #/entrar, #/criar-conta, #/esqueci-senha, #/nova-senha?token=..., #/ (elenco), #/times

let previousPath = null;
let currentPath = null;
let rosterScroll = null;

export function parseHash(hash) {
  const raw = String(hash ?? '').replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', query: new URLSearchParams(query) };
}

export function navigate(path) {
  if (location.hash === `#${path}`) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = path;
  }
}

// Volta para `path` sem empilhar histórico: usa o voltar do navegador quando a tela anterior era essa
// e, se não era (página recarregada, endereço aberto direto), troca o endereço atual (research §2).
export function goBackTo(path) {
  if (previousPath === path) history.back();
  else location.replace(`#${path}`);
}

export function createRouter({ routes, mount, beforeEach }) {
  let cleanup = null;
  let renderId = 0;

  history.scrollRestoration = 'manual';

  async function render() {
    const { path, query } = parseHash(location.hash);

    const redirect = beforeEach?.(path);
    if (redirect && redirect !== path) {
      location.replace(`#${redirect}`);
      return;
    }

    const view = routes[path];
    if (!view) {
      location.replace('#/');
      return;
    }

    // Guarda a rolagem do elenco para devolvê-la quando o organizador voltar dos times (research §8).
    if (currentPath === '/') rosterScroll = window.scrollY;
    previousPath = currentPath;
    currentPath = path;

    const id = ++renderId;
    cleanup?.();
    cleanup = null;
    mount.replaceChildren();

    const result = await view({ mount, query, navigate, goBackTo });
    if (id !== renderId) {
      if (typeof result === 'function') result();
      return;
    }
    if (typeof result === 'function') cleanup = result;

    window.scrollTo(0, path === '/' && previousPath === '/times' ? (rosterScroll ?? 0) : 0);
    mount.querySelector('[data-screen-title]')?.focus({ preventScroll: true });
  }

  window.addEventListener('hashchange', render);
  return { start: render };
}
