import { LavaLamp } from './lava-lamp';

(function () {
    // 1. Define the init function
    function startLavaLampAnimation() {
        // Prevent double-init
        if (window.hasLavaLampAnimationStarted) return;
        window.hasLavaLampAnimationStarted = true;

        console.log('Starting Lava Lamp Animation...');

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

    // 2. EXPOSE GLOBALLY (Crucial for transition engine!)
    window.initializeOnPageCanvasAfterTransition = startLavaLampAnimation;

    // 3. Handle Normal Page Loads (Fallback)
    window.addEventListener('load', () => {
        // If NO transition overlay is present, start immediately.
        // If an overlay IS present, do nothing; the engine will call the hook above.
        if (!document.querySelector('.transition-overlay')) {
            startLavaLampAnimation();
        }
    });
})();
