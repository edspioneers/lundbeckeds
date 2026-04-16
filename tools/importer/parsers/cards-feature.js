/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-feature.
 * Base: cards. Source: https://www.vyeptihcp.com/
 * Generated: 2026-04-14
 *
 * Cards block structure (from block library):
 * Row 1: block name
 * Each subsequent row: [image cell] [text cell with title + description + CTA]
 *
 * Source DOM: .home-two-card-section .narrow--teaser--cta elements containing:
 *   .cmp-teaser__image picture > a > img (icon)
 *   .cmp-teaser__description h4 > a (title with link)
 *   .cmp-teaser__action-link (arrow CTA)
 */
export default function parse(element, { document }) {
  // element matches .home-two-card-section .narrow--teaser--cta
  // Find the parent section to get all feature teasers
  const section = element.closest('.home-two-card-section') || element.parentElement;

  const teasers = section
    ? Array.from(section.querySelectorAll('.narrow--teaser--cta'))
    : [element];

  const cells = [];

  for (const teaser of teasers) {
    // Extract icon image
    const img = teaser.querySelector('.cmp-teaser__image img');

    // Extract title heading with link
    const title = teaser.querySelector('.cmp-teaser__description h4, .cmp-teaser__description h3');

    // Build image cell
    const imageCell = img || '';

    // Build text cell
    const textCell = [];
    if (title) {
      textCell.push(title);
    }

    cells.push([imageCell, textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-feature', cells });
  element.replaceWith(block);
}
