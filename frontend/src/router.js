// Rotas por hash: #/entrar, #/criar-conta, #/esqueci-senha, #/nova-senha?token=..., #/

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

export function createRouter({ routes, mount, beforeEach }) {
  let cleanup = null;
  let renderId = 0;

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

    const id = ++renderId;
    cleanup?.();
    cleanup = null;
    mount.replaceChildren();

    const result = await view({ mount, query, navigate });
    if (typeof result !== 'function') return;
    if (id === renderId) cleanup = result;
    else result();
  }

  window.addEventListener('hashchange', render);
  return { start: render };
}
