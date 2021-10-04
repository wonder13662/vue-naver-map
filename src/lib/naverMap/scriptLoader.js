export class ScriptLoader {
  constructor({
    id,
    url,
    async,
    defer,
    onLoad = () => {},
    onError = () => {},
  }) {
    this.options = {
      id,
      url,
      async,
      defer,
      onLoad,
      onError,
    };
  }

  load() {
    const {
      id,
      url,
      async,
      defer,
      onLoad,
      onError,
    } = this.options;
    const script = document.createElement('script');
    if (script) {
      script.id = id;
      script.setAttribute('src', url);
      script.onload = onLoad;
      script.onerror = onError;
      if (async) {
        script.setAttribute('async', '');
      }
      if (defer) {
        script.setAttribute('defer', '');
      }
      document.body.appendChild(script);
    } else throw new Error('script loading failed');
  }
}

export function scriptLoad({
  id,
  url,
  async,
  defer,
  onLoad = () => {},
  onError = () => {},
}) {
  new ScriptLoader({
    id,
    url,
    async,
    defer,
    onLoad,
    onError,
  }).load();
}
