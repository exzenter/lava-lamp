import { useBlockProps } from '@wordpress/block-editor';

export default function save({ attributes }) {
    const { blockId, bgColor, outlineColor, keepStrokeWidth, lampStrokeWidth, lampStrokeColor } = attributes;
    // Use blockId to create unique IDs for filters and clips
    const uniqueId = blockId || 'default';
    const clipId = `glass-clip-${uniqueId}`;
    const filterId = `goo-outline-${uniqueId}`;

    const style = {
        '--bg-color': bgColor,
        '--lamp-outline': outlineColor,
        '--lamp-stroke-color': lampStrokeColor,
    };

    return (
        <div {...useBlockProps.save({ style })} data-block-id={uniqueId}>
            <div className="lamp-container">
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
                        style={{
                            stroke: lampStrokeColor,
                            strokeWidth: lampStrokeWidth,
                            vectorEffect: keepStrokeWidth ? 'non-scaling-stroke' : 'none',
                        }}
                        d="M49.5599 98.5L65.0599 3H143.06L158.032 98.5M49.5599 98.5H158.032M49.5599 98.5L5.55989 382.5C5.55989 382.5 1.55985 406 3.55987 421.5C5.55989 437 11.5599 455.5 11.5599 455.5L30.0599 503.5M158.032 98.5L198.56 357C198.56 357 207.06 397 205.06 421.5C203.06 446 154.06 542 158.06 565.5C162.06 589 198.06 697 198.06 697C198.06 697 154.56 704.5 101.06 704.5C47.5599 704.5 10.0599 696.5 10.0599 696.5L48.5599 581C48.5599 581 50.0599 571.5 50.0599 565.5C50.0599 559.5 48.5599 551.5 48.5599 551.5L30.0599 503.5M30.0599 503.5C30.0599 503.5 81.0599 505.5 104.56 505.5C128.06 505.5 176.56 503.5 176.56 503.5"
                    />
                </svg>

                { /* We will output the configuration as a JSON script or data attributes for the view script */}
                <script
                    type="application/json"
                    className="lava-lamp-data"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(attributes),
                    }}
                />
            </div>
        </div>
    );
}
