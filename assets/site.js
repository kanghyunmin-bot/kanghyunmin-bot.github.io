// Navigation uses native links; no account, analytics or third-party scripts.
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', () => {
    const target = document.getElementById(link.hash.slice(1));
    if (target) { target.setAttribute('tabindex', '-1'); target.focus({preventScroll:true}); }
  });
});
// liquidGL is vendored at a pinned MIT-licensed revision. No CDN required.
(() => {
  const button = document.querySelector('.glass-toggle');
  if (!button || typeof window.liquidGL !== 'function') return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const reducedTransparency = matchMedia('(prefers-reduced-transparency: reduce)');
  let pane;
  let enabled = !reducedTransparency.matches;
  function setEnabled(next) {
    enabled = next;
    if (pane) { pane.destroy(); pane = null; }
    button.setAttribute('aria-pressed', String(enabled));
    button.textContent = enabled ? '유리 효과 켜짐' : '유리 효과 꺼짐';
    if (!enabled) return;
    try {
      pane = liquidGL({target:'header', snapshot:'body', resolution:1,
        refraction:0.026, aberration:0.12, bevelDepth:0.085, bevelWidth:0.12,
        frost:0.6, shadow:false, specular:!reducedMotion.matches,
        reveal:'none', tilt:false, magnify:1.012, zIndex:20,
        interaction:reducedMotion.matches?'none':'fluid',
        interactionStrength:0.13, interactionRadius:0.3, interactionViscosity:0.65,
        tint:'rgba(218,235,255,0.16)',
        on:{init(){document.documentElement.dataset.glassReady='true';}}
      });
    } catch (error) {
      enabled = false;
      button.setAttribute('aria-pressed','false');
      button.textContent='기본 유리 스타일';
      console.warn('Optical glass unavailable; using CSS fallback.', error);
    }
  }
  button.addEventListener('click', () => setEnabled(!enabled));
  setEnabled(enabled);
})();
