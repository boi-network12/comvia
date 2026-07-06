// widget/src/polyfills.ts
// Polyfill process for browser environments
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.process = window.process || {
    env: {
      NODE_ENV: 'production',
    },
    cwd: () => '/',
    browser: true,
    version: '',
    nextTick: (fn: Function, ...args: any[]) => {
      setTimeout(() => fn(...args), 0);
    },
  };
}

// Polyfill global
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.global = window;
}