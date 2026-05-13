/**
 * @fileoverview Responsive design utilities
 * @module utils/responsive
 */

import { CANVAS_WIDTH, CANVAS_HEIGHT, BREAKPOINTS } from './constants';
import { clamp } from './helpers';
import type { Viewport } from './types';

/**
 * Calculates responsive font size based on viewport
 */
export function getResponsiveFontSize(
  baseSize: number,
  viewport: { width: number; height: number }
): number {
  const minSize = baseSize * 0.6;
  const maxSize = baseSize * 1.2;
  const scaleFactor = Math.min(viewport.width / CANVAS_WIDTH, viewport.height / CANVAS_HEIGHT);
  return clamp(baseSize * scaleFactor, minSize, maxSize);
}

/**
 * Calculates responsive spacing based on viewport
 */
export function getResponsiveSpacing(
  baseSpacing: number,
  viewport: { width: number; height: number }
): number {
  const scaleFactor = Math.min(viewport.width / CANVAS_WIDTH, viewport.height / CANVAS_HEIGHT);
  return Math.max(baseSpacing * scaleFactor, baseSpacing * 0.5);
}

/**
 * Gets current viewport information
 */
export function getViewport(): Viewport {
  const width = window.innerWidth;
  const height = window.innerHeight;
  const isMobile = width <= BREAKPOINTS.MOBILE;
  const isPortrait = height > width;
  const scale = Math.min(width / CANVAS_WIDTH, height / CANVAS_HEIGHT);

  return {
    width,
    height,
    scale,
    isMobile,
    isPortrait,
  };
}

/**
 * Calculates canvas dimensions that fit within viewport while maintaining aspect ratio
 */
export function getCanvasDimensions(viewport: Viewport): { width: number; height: number } {
  const maxWidth = viewport.isMobile ? viewport.width * 0.95 : Math.min(viewport.width * 0.9, CANVAS_WIDTH);
  const maxHeight = viewport.isMobile ? viewport.height * 0.85 : Math.min(viewport.height * 0.9, CANVAS_HEIGHT);

  const scale = Math.min(maxWidth / CANVAS_WIDTH, maxHeight / CANVAS_HEIGHT);

  return {
    width: CANVAS_WIDTH * scale,
    height: CANVAS_HEIGHT * scale,
  };
}

/**
 * Converts screen coordinates to canvas coordinates
 */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  canvasRect: DOMRect
): { x: number; y: number } {
  const scaleX = CANVAS_WIDTH / canvasRect.width;
  const scaleY = CANVAS_HEIGHT / canvasRect.height;

  return {
    x: (screenX - canvasRect.left) * scaleX,
    y: (screenY - canvasRect.top) * scaleY,
  };
}

/**
 * Gets optimal button size for current viewport
 */
export function getButtonSize(viewport: Viewport): { width: number; height: number; fontSize: number } {
  if (viewport.isMobile) {
    return {
      width: Math.max(viewport.width * 0.7, 200),
      height: 48, // Minimum touch target size
      fontSize: getResponsiveFontSize(16, viewport),
    };
  }

  return {
    width: 250,
    height: 60,
    fontSize: 20,
  };
}
