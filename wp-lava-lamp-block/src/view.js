import { LavaLamp } from './lava-lamp';

// 1. Encapsulate: Wrap your main start/loop function in a named function
function startAnimation() {
    document
        .querySelectorAll('.wp-block-antigravity-canvas-lava-lamp')
        .forEach((container) => {
            if (container.dataset.initialized) return; // Prevent double init

            const dataEl = container.querySelector('.lava-lamp-data');
            if (dataEl) {
                try {
                    const settings = JSON.parse(dataEl.textContent);
                    // Initialize LavaLamp
                    container.dataset.initialized = true;
                    new LavaLamp(container, settings);
                } catch (e) {
                    console.error('Failed to parse settings for Lava Lamp', e);
                }
            }
        });
}

// 2. Expose for WP Logo Explode
window.initializeOnPageCanvasAfterTransition = startAnimation;

// 3. Handle Normal Page Loads
document.addEventListener('DOMContentLoaded', () => {
    // Only start if NOT currently in a transition (overlay present)
    if (!document.querySelector('.transition-overlay')) {
        startAnimation();
    }
});
