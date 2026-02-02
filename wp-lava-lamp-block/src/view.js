import { LavaLamp } from './lava-lamp';

// 1. Define the init function
function startLavaLampAnimation(force = false) {
    // Prevent double-init unless forced (e.g. by transition engine)
    if (window.hasLavaLampAnimationStarted && !force) return;
    window.hasLavaLampAnimationStarted = true;

    // console.log('Starting Lava Lamp Animation' + (force ? ' (Forced)' : '') + '...');

    document
        .querySelectorAll('.wp-block-antigravity-canvas-lava-lamp')
        .forEach((container) => {
            if (container.dataset.initialized) {
                if (force) {
                    container.dataset.initialized = '';
                } else {
                    return;
                }
            }

            const dataEl = container.querySelector('.lava-lamp-data');
            if (dataEl) {
                try {
                    const settings = JSON.parse(dataEl.textContent);
                    container.dataset.initialized = 'true';
                    new LavaLamp(container, settings);
                } catch (e) {
                    // console.error('Failed to parse settings for Lava Lamp', e);
                }
            }
        });
}

// 2. EXPOSE GLOBALLY (Crucial for transition engine!)
// Use chaining to prevent overwriting other plugins using the same hook
var existingHook = window.initializeOnPageCanvasAfterTransition;
window.initializeOnPageCanvasAfterTransition = () => {
    if (typeof existingHook === 'function') existingHook();
    startLavaLampAnimation(true);
};

// 3. Listen for the Custom Event (Better for multiple plugins)
window.addEventListener('wpLogoExplodeTransitionComplete', () => {
    startLavaLampAnimation(true);
});

// 4. Handle Normal Page Loads (Fallback)
window.addEventListener('load', () => {
    // If NO transition overlay is present, start immediately.
    // If an overlay IS present, do nothing; the engine will call the hook or event.
    if (!document.querySelector('.transition-overlay')) {
        startLavaLampAnimation();
    }
});
