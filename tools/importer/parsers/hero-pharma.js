/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-pharma.
 * Base: hero. Source: https://www.vyeptihcp.com/
 * Generated: 2026-04-14
 *
 * Hero block structure (from block library):
 * Row 1: block name
 * Row 2: background image (optional)
 * Row 3: heading + subheading + CTA (optional)
 *
 * Source DOM: .hero-component with .banner-img picture and .banner-content with .rte text
 */
export default function parse(element, { document }) {
  // Extract background image from .banner-img picture > img
  const bgImg = element.querySelector('.banner-img img, .banner-img picture img');

  // Extract text content from .banner-content .rte, .rteComponent
  const rteContent = element.querySelector('.banner-content .rteComponent, .banner-content .rte');

  // Build cells matching hero block library structure:
  // Row 1 (after block name row): background image
  // Row 2: text content (heading/subheading/description)
  const cells = [];

  // Row for background image
  if (bgImg) {
    cells.push([bgImg]);
  }

  // Row for text content
  const contentCell = [];
  if (rteContent) {
    // Get all child elements from the rte content
    const children = Array.from(rteContent.children);
    children.forEach((child) => contentCell.push(child));
  }

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-pharma', cells });
  element.replaceWith(block);
}
