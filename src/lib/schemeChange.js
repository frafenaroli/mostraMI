// When the OS flips between light and dark, every color transition would fire
// at once and the switch would smear. Turn transitions off for that one frame.
export function suppressTransitionsOnSchemeChange() {
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  mql.addEventListener('change', () => {
    const style = document.createElement('style');
    style.append(document.createTextNode('*,*::before,*::after{transition:none !important}'));
    document.head.append(style);
    void document.body.offsetHeight; // force a style flush while the override applies
    requestAnimationFrame(() => requestAnimationFrame(() => style.remove()));
  });
}
