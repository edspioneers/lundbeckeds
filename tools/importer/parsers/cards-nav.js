/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards-nav.
 * Base: cards. Source: https://www.vyeptihcp.com/
 * Generated: 2026-04-14
 *
 * Cards block structure (from block library):
 * Row 1: block name
 * Each subsequent row: [image cell] [text cell with title + description + CTA]
 *
 * Source DOM: .teaser.narrow--teaser--trans elements containing:
 *   .cmp-teaser__image picture > a > img (icon)
 *   .cmp-teaser__description h5 > a (title with link)
 *   .cmp-teaser__action-link (arrow CTA)
 */
export default function parse(element, { document }) {
  // element is a comma-separated selector match; we need to find parent and get all teasers
  // Navigate up to find the columncontainer that holds all 4 nav teasers
  const container = element.closest('.columncontainer') || element.closest('.row') || element.parentElement;

  // Find all nav teaser cards within the container
  const teasers = container
    ? Array.from(container.querySelectorAll('.teaser.narrow--teaser--trans'))
    : [element];

  const cells = [];

  for (const teaser of teasers) {
    // Extract icon image
    const img = teaser.querySelector('.cmp-teaser__image img');

    // Extract title and link from description
    const titleLink = teaser.querySelector('.cmp-teaser__description h5 a, .cmp-teaser__description a');
    const title = teaser.querySelector('.cmp-teaser__description h5');

    // Build image cell
    const imageCell = img || '';

    // Build text cell with title
    const textCell = [];
    if (title) {
      textCell.push(title);
    } else if (titleLink) {
      textCell.push(titleLink);
    }

    cells.push([imageCell, textCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-nav', cells });
  element.replaceWith(block);
}
