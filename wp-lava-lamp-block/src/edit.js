import { __ } from '@wordpress/i18n';
import {
    useBlockProps,
    InspectorControls,
    PanelColorSettings,
} from '@wordpress/block-editor';
import {
    PanelBody,
    RangeControl,
    TextControl,
    ToggleControl,
} from '@wordpress/components';
import { useEffect, useRef, useState } from '@wordpress/element';
import { LavaLamp } from './lava-lamp';

export default function Edit({ attributes, setAttributes, clientId }) {
    const {
        blockId,
        bgColor,
        outlineColor,
        numBlobs,
        blobSizeMin,
        blobSizeMax,
        riseSpeed,
        maxSpeed,
        attractionForce,
        explosionForce,
        gooBlur,
        animSpeed,
        strokeWidth,
        keepStrokeWidth,
    } = attributes;

    const containerRef = useRef(null);
    const lavaLampRef = useRef(null);

    // Initialize ID
    useEffect(() => {
        if (!blockId) {
            setAttributes({ blockId: clientId });
        }
    }, [clientId, blockId, setAttributes]);

    // Initialize / Update Lava Lamp
    useEffect(() => {
        if (!containerRef.current) return;

        if (!lavaLampRef.current) {
            // Init
            const settings = { ...attributes, blockId: clientId };
            lavaLampRef.current = new LavaLamp(containerRef.current, settings);
        } else {
            // Update
            const settings = { ...attributes, blockId: clientId };
            lavaLampRef.current.updateSettings(settings);
        }

        // Cleanup is handled by the return, but we want to keep the instance alive 
        // if we are just strictly updating props. 
        // However, if the element is removed from DOM, we must destroy.
        return () => {
            // We only destroy on unmount of the component, not on every prop update
            // But check how useEffect behaves.
        };
    }, [attributes, clientId]);

    // Strict cleanup on unmount
    useEffect(() => {
        return () => {
            if (lavaLampRef.current) {
                lavaLampRef.current.destroy();
                lavaLampRef.current = null;
            }
        };
    }, []);

    // Prepare styles and IDs for render
    const currentId = blockId || clientId;
    const clipId = `glass-clip-${currentId}`;
    const filterId = `goo-outline-${currentId}`;

    const style = {
        '--bg-color': bgColor,
        '--lamp-outline': outlineColor,
    };

    return (
        <div {...useBlockProps({ style })}>
            <InspectorControls>
                <PanelColorSettings
                    title={__('Colors', 'canvas-lava-lamp')}
                    initialOpen={true}
                    colorSettings={[
                        {
                            value: bgColor,
                            onChange: (value) => setAttributes({ bgColor: value }),
                            label: __('Background Color', 'canvas-lava-lamp'),
                            enableAlpha: true,
                        },
                        {
                            value: outlineColor,
                            onChange: (value) =>
                                setAttributes({ outlineColor: value }),
                            label: __('Outline Color', 'canvas-lava-lamp'),
                        },
                    ]}
                />
                <PanelBody title={__('Blob Settings', 'canvas-lava-lamp')}>
                    <RangeControl
                        label={__('Number of Blobs', 'canvas-lava-lamp')}
                        value={numBlobs}
                        onChange={(value) => setAttributes({ numBlobs: value })}
                        min={1}
                        max={15}
                    />
                    <RangeControl
                        label={__('Min Blob Size', 'canvas-lava-lamp')}
                        value={blobSizeMin}
                        onChange={(value) =>
                            setAttributes({ blobSizeMin: value })
                        }
                        min={5}
                        max={30}
                    />
                    <RangeControl
                        label={__('Max Blob Size', 'canvas-lava-lamp')}
                        value={blobSizeMax}
                        onChange={(value) =>
                            setAttributes({ blobSizeMax: value })
                        }
                        min={20}
                        max={60}
                    />
                </PanelBody>
                <PanelBody title={__('Physics', 'canvas-lava-lamp')} initialOpen={false}>
                    <RangeControl
                        label={__('Rise Speed', 'canvas-lava-lamp')}
                        value={riseSpeed}
                        onChange={(value) => setAttributes({ riseSpeed: value })}
                        min={0.05}
                        max={1}
                        step={0.05}
                    />
                    <RangeControl
                        label={__('Max Speed', 'canvas-lava-lamp')}
                        value={maxSpeed}
                        onChange={(value) => setAttributes({ maxSpeed: value })}
                        min={0.1}
                        max={3.0}
                        step={0.1}
                    />
                    <RangeControl
                        label={__('Attraction Force', 'canvas-lava-lamp')}
                        value={attractionForce}
                        onChange={(value) =>
                            setAttributes({ attractionForce: value })
                        }
                        min={0}
                        max={0.005}
                        step={0.0001}
                    />
                    <RangeControl
                        label={__('Explosion Force', 'canvas-lava-lamp')}
                        value={explosionForce}
                        onChange={(value) =>
                            setAttributes({ explosionForce: value })
                        }
                        min={0.01}
                        max={0.5}
                        step={0.01}
                    />
                </PanelBody>
                <PanelBody title={__('Visuals', 'canvas-lava-lamp')} initialOpen={false}>
                    <RangeControl
                        label={__('Goo Blur', 'canvas-lava-lamp')}
                        value={gooBlur}
                        onChange={(value) => setAttributes({ gooBlur: value })}
                        min={0}
                        max={20}
                    />
                    <RangeControl
                        label={__('Animation Speed', 'canvas-lava-lamp')}
                        value={animSpeed}
                        onChange={(value) => setAttributes({ animSpeed: value })}
                        min={0.05}
                        max={3}
                        step={0.05}
                    />
                    <RangeControl
                        label={__('Stroke Width', 'canvas-lava-lamp')}
                        value={strokeWidth}
                        onChange={(value) =>
                            setAttributes({ strokeWidth: value })
                        }
                        min={1}
                        max={8}
                    />
                    <ToggleControl
                        label={__('Keep Stroke Width on Rescale', 'canvas-lava-lamp')}
                        checked={keepStrokeWidth}
                        onChange={(value) =>
                            setAttributes({ keepStrokeWidth: value })
                        }
                    />
                </PanelBody>
            </InspectorControls>

            <div className="lamp-container" ref={containerRef}>
                <svg
                    viewBox="-2 -2 213 712"
                    preserveAspectRatio="xMidYMid meet"
                    className="lamp-overlay"
                >
                    <defs>
                        <filter id={filterId}>
                            <feGaussianBlur
                                in="SourceGraphic"
                                stdDeviation="8"
                                result="blur"
                            />
                            <feColorMatrix
                                in="blur"
                                mode="matrix"
                                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                                result="goo"
                            />
                            <feMorphology
                                in="goo"
                                operator="dilate"
                                radius="3"
                                result="thick"
                            />
                            <feComposite
                                in="thick"
                                in2="goo"
                                operator="out"
                                result="stroke"
                            />
                            <feFlood floodColor="var(--lamp-outline)" result="color" />
                            <feComposite in="color" in2="stroke" operator="in" />
                        </filter>

                        <clipPath id={clipId}>
                            <path
                                d="M51 98.5 
                             L7.0 382.5 
                             C7.0 382.5 3.0 406 5.0 421.5 
                             C7.0 437 13.0 455.5 13.0 455.5 
                             L31.5 502 
                             Q104.25 506 175.0 502
                             C183.5 480 201.5 446 203.5 421.5
                             C205.5 397 197.0 357 197.0 357
                             L156.5 98.5 
                             Z"
                            />
                        </clipPath>
                    </defs>

                    <foreignObject
                        x="0"
                        y="0"
                        width="209"
                        height="708"
                        clipPath={`url(#${clipId})`}
                    >
                        <canvas
                            className="lava-canvas"
                            style={{
                                width: '100%',
                                height: '100%',
                                filter: `url(#${filterId})`,
                            }}
                        ></canvas>
                    </foreignObject>


                    <path
                        className="outline"
                        d="M49.5599 98.5L65.0599 3H143.06L158.032 98.5M49.5599 98.5L5.55989 382.5C5.55989 382.5 1.55985 406 3.55987 421.5C5.55989 437 11.5599 455.5 11.5599 455.5L30.0599 503.5M158.032 98.5L198.56 357C198.56 357 207.06 397 205.06 421.5C203.06 446 154.06 542 158.06 565.5C162.06 589 198.06 697 198.06 697C198.06 697 154.56 704.5 101.06 704.5C47.5599 704.5 10.0599 696.5 10.0599 696.5L48.5599 581C48.5599 581 50.0599 571.5 50.0599 565.5C50.0599 559.5 48.5599 551.5 48.5599 551.5L30.0599 503.5M30.0599 503.5C30.0599 503.5 81.0599 505.5 104.56 505.5C128.06 505.5 176.56 503.5 176.56 503.5"
                    />
                </svg>
            </div>
        </div>
    );
}
