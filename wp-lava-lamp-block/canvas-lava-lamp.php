<?php
/**
 * Plugin Name: Canvas Lava Lamp Block
 * Description: A Gutenberg block that renders the high-performance canvas lava lamp.
 * Version: 1.0.0
 * Author: Antigravity
 *
 * @package canvas-lava-lamp
 */

defined( 'ABSPATH' ) || exit;

function canvas_lava_lamp_block_init() {
	register_block_type( __DIR__ . '/build' );
}
add_action( 'init', 'canvas_lava_lamp_block_init' );
