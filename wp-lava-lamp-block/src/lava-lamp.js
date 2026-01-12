export class LavaLamp {
    constructor(container, settings) {
        this.container = container;
        this.settings = {
            bgColor: '#f7f3e9',
            outlineColor: '#1a1a1a',
            numBlobs: 5,
            blobSizeMin: 15,
            blobSizeMax: 35,
            riseSpeed: 0.3,
            wobble: 0.0005,
            gooBlur: 8,
            strokeWidth: 3,
            animSpeed: 1.0,
            gravity: 0.00005,
            maxSpeed: 0.8,
            attractionForce: 0.0008,
            explosionForce: 0.05,
            ...settings,
        };

        this.canvas = container.querySelector('canvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');

        // Set resolution
        this.canvas.width = 209;
        this.canvas.height = 708;

        this.blobs = [];
        this.animationFrameId = null;
        this.blockId = this.settings.blockId || 'default';
        this.filterId = `goo-outline-${this.blockId}`;

        this.initBlobs();
        this.applySettings();
        this.animate = this.animate.bind(this);
        this.animate();

        // Interaction (Explode)
        this.canvas.addEventListener('mousedown', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
            const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
            this.explode(x, y);
        });
    }

    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        if ('numBlobs' in newSettings) {
            this.initBlobs();
        }
        this.applySettings();
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
    }

    initBlobs() {
        this.blobs = [];
        const count = Math.min(this.settings.numBlobs, 15);
        for (let i = 0; i < count; i++) {
            this.blobs.push(new Blob(this.settings));
        }
        this.blobs.push(new StickyBlob(104, 490, 70, 40, this.settings));
        this.blobs.push(new StickyBlob(104, 115, 35, 20, this.settings));
    }

    applySettings() {
        // Update CSS vars on the container to scope them
        this.container.style.setProperty('--bg-color', this.settings.bgColor);
        this.container.style.setProperty('--lamp-outline', this.settings.outlineColor);

        // Update SVG Filter attributes by finding them within the container or document
        // In render, the SVG is inside the container.
        const dilate = this.container.querySelector(`#${this.filterId} feMorphology`);
        if (dilate) {
            dilate.setAttribute('radius', this.settings.strokeWidth);
        }
        const blur = this.container.querySelector(`#${this.filterId} feGaussianBlur`);
        if (blur) {
            blur.setAttribute('stdDeviation', this.settings.gooBlur);
        }

        // Update references
        const foreignObject = this.container.querySelector('foreignObject');
        if (foreignObject) {
            const currentId = this.settings.blockId || 'default';
            foreignObject.setAttribute('clip-path', `url(#glass-clip-${currentId})`);
        }

        if (this.canvas) {
            this.canvas.style.filter = `url(#${this.filterId})`;
        }
    }

    explode(originX, originY) {
        if (!originX) originX = this.canvas.width / 2;
        if (!originY) originY = this.canvas.height / 2;
        this.blobs.forEach((b) => {
            if (!b.fixed) {
                const dx = b.x - originX;
                const dy = b.y - originY;
                const dist = Math.sqrt(dx * dx + dy * dy) || 0.1;
                const force = this.settings.explosionForce * 20.0;
                b.vx += (dx / dist) * force;
                b.vy += (dy / dist) * force;
            }
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyForces();
        this.blobs.forEach((b) => {
            if (!b.fixed) b.update();
            b.draw(this.ctx);
        });
        this.animationFrameId = requestAnimationFrame(this.animate);
    }

    applyForces() {
        const ATTRACTION_RANGE = 150;
        const SPLIT_THRESHOLD_MULT = 0.6;
        const SEPARATION_FORCE_MULT = 0.02;

        for (let i = 0; i < this.blobs.length; i++) {
            if (!this.blobs[i].fixed) {
                const maxSpeed = this.settings.maxSpeed;
                const speed = Math.sqrt(
                    this.blobs[i].vx * this.blobs[i].vx +
                    this.blobs[i].vy * this.blobs[i].vy
                );
                if (speed > maxSpeed) {
                    this.blobs[i].vx = (this.blobs[i].vx / speed) * maxSpeed;
                    this.blobs[i].vy = (this.blobs[i].vy / speed) * maxSpeed;
                }
            }

            for (let j = i + 1; j < this.blobs.length; j++) {
                const b1 = this.blobs[i];
                const b2 = this.blobs[j];
                const dx = b2.x - b1.x;
                const dy = b2.y - b1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist === 0) continue;

                if (dist < ATTRACTION_RANGE) {
                    const force =
                        (1 - dist / ATTRACTION_RANGE) *
                        this.settings.attractionForce *
                        this.settings.animSpeed;
                    if (!b1.fixed) {
                        b1.vx += (dx / dist) * force;
                        b1.vy += (dy / dist) * force;
                    }
                    if (!b2.fixed) {
                        b2.vx -= (dx / dist) * force;
                        b2.vy -= (dy / dist) * force;
                    }
                }

                const minDist = b1.r + b2.r;
                if (dist < minDist) {
                    const vRel = Math.sqrt(
                        (b2.vx - b1.vx) ** 2 + (b2.vy - b1.vy) ** 2
                    );

                    if (vRel > SPLIT_THRESHOLD_MULT) {
                        const overlap = minDist - dist;
                        const sep = SEPARATION_FORCE_MULT * overlap;
                        if (!b1.fixed) {
                            b1.vx -= (dx / dist) * sep;
                            b1.vy -= (dy / dist) * sep;
                        }
                        if (!b2.fixed) {
                            b2.vx += (dx / dist) * sep;
                            b2.vy += (dy / dist) * sep;
                        }
                    }
                }
            }
        }
    }
}

class Blob {
    constructor(settings) {
        this.settings = settings;
        this.reset();
    }

    reset() {
        const spawnAtTop = Math.random() > 0.5;
        this.x = 104 + (Math.random() - 0.5) * 80;
        if (spawnAtTop) {
            this.y = 120 + Math.random() * 50;
            this.vy = 0.05 + Math.random() * 0.1;
            this.state = 'falling';
        } else {
            this.y = 480 + Math.random() * 20;
            this.vy =
                -0.05 - Math.random() * this.settings.riseSpeed * 0.5;
            this.state = 'rising';
        }
        this.r =
            this.settings.blobSizeMin +
            Math.random() *
            (this.settings.blobSizeMax - this.settings.blobSizeMin);
        this.vx = (Math.random() - 0.5) * 0.01;
        this.phase = Math.random() * Math.PI * 2;
    }

    update() {
        this.phase += 0.005 * this.settings.animSpeed;
        this.x +=
            (this.vx + Math.sin(this.phase) * (this.settings.wobble || 0.0005)) *
            this.settings.animSpeed;
        this.y += this.vy * this.settings.animSpeed;
        this.vx += (104 - this.x) * 0.0001 * this.settings.animSpeed;

        // Hardcoded boundaries based on 209x708 canvas
        const progress = (this.y - 100) / 400;
        const halfWidth = 55 + progress * 45;
        const minX = 104 - halfWidth;
        const maxX = 104 + halfWidth;

        if (this.state === 'rising') {
            if (this.y < 130) {
                this.y = 130;
                this.vy = Math.abs(this.vy) * 0.3;
                this.state = 'suspended';
            }
        } else if (this.state === 'suspended') {
            this.vy *= 0.995;
            if (Math.abs(this.vy) < 0.005) {
                this.state = this.y < 300 ? 'falling' : 'rising';
            }
        } else if (this.state === 'falling') {
            this.vy += this.settings.gravity * this.settings.animSpeed;
            if (this.y > 480) {
                this.y = 480;
                this.vy = -Math.abs(this.vy) * 0.5 - 0.02;
                this.state = 'rising';
            }
        }

        const buffer = 10;
        const strictMinX = minX + buffer;
        const strictMaxX = maxX - buffer;

        if (this.x < strictMinX) {
            this.x = strictMinX;
            this.vx *= -0.5;
        }
        if (this.x > strictMaxX) {
            this.x = strictMaxX;
            this.vx *= -0.5;
        }
        if (this.y < 120) {
            this.y = 120;
            this.vy *= -0.5;
        }
        if (this.y > 480) {
            this.y = 480;
            this.vy *= -0.5;
        }

        this.x = Math.max(strictMinX, Math.min(strictMaxX, this.x));
    }

    draw(ctx) {
        ctx.fillStyle = this.settings.outlineColor;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
    }
}

class StickyBlob {
    constructor(x, y, rx, ry, settings) {
        this.x = x;
        this.y = y;
        this.rx = rx;
        this.ry = ry;
        this.vx = 0;
        this.vy = 0;
        this.r = (rx + ry) / 2;
        this.fixed = true;
        this.settings = settings;
    }
    update() { /* No movement */ }
    draw(ctx) {
        ctx.fillStyle = this.settings.outlineColor;
        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.rx, this.ry, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}
