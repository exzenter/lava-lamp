import { LavaLamp } from './lava-lamp';

document.addEventListener('DOMContentLoaded', () => {
    const initBlocks = () => {
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
    };

    initBlocks();
});
