/* eslint-disable */
/* global WebImporter */

/**
 * Parser for accordion-study.
 * Base: accordion. Source: https://www.vyeptihcp.com/efficacy-and-patient-outcomes
 * Generated: 2026-04-14
 *
 * Accordion block structure (from block library):
 * Row 1: block name
 * Each subsequent row: [title cell] [content cell]
 *
 * Source DOM: .two-years-study-design .cmp-accordion with:
 *   .cmp-accordion__item containing:
 *     .cmp-accordion__header > button > .cmp-accordion__title (title)
 *     .cmp-accordion__panel (content body)
 */
export default function parse(element, { document }) {
  const accordion = element.querySelector('.cmp-accordion') || element;
  const items = Array.from(accordion.querySelectorAll(':scope > .cmp-accordion__item'));

  const cells = [];

  for (const item of items) {
    // Extract title from accordion header
    const titleEl = item.querySelector('.cmp-accordion__title');
    const title = titleEl ? titleEl.textContent.trim() : '';

    // Extract content from accordion panel
    const panel = item.querySelector('.cmp-accordion__panel');

    if (title && panel) {
      cells.push([title, panel]);
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-study', cells });
  element.replaceWith(block);
}
