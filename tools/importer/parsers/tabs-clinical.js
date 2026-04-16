/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs-clinical.
 * Base: tabs. Source: https://www.vyeptihcp.com/efficacy-and-patient-outcomes
 * Generated: 2026-04-14
 *
 * Tabs block structure (from block library):
 * Row 1: block name
 * Each subsequent row: [tab label cell] [tab content cell]
 *
 * Source DOM: .cmp-tabs with:
 *   .cmp-tabs__tablist ol > li.cmp-tabs__tab (tab labels)
 *   .cmp-tabs__tabpanel (tab content panels with nested accordions, graphs, text)
 */
export default function parse(element, { document }) {
  const tabsContainer = element.querySelector('.cmp-tabs') || element;

  // Get tab labels
  const tabLabels = Array.from(tabsContainer.querySelectorAll('.cmp-tabs__tablist > li.cmp-tabs__tab'));

  // Get tab panels
  const tabPanels = Array.from(tabsContainer.querySelectorAll(':scope > .cmp-tabs__tabpanel, .cmp-tabs > .cmp-tabs__tabpanel'));

  const cells = [];

  // Build one row per tab: [label, content]
  tabLabels.forEach((label, i) => {
    // Clean label text (remove hidden chevron icons)
    const chevron = label.querySelector('.icon-cheveron');
    if (chevron) chevron.remove();
    const labelText = label.textContent.trim();

    // Get corresponding panel content
    const panel = tabPanels[i];

    if (panel) {
      cells.push([labelText, panel]);
    } else {
      cells.push([labelText, '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-clinical', cells });
  element.replaceWith(block);
}
