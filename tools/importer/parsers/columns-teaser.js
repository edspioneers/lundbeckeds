/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns-teaser.
 * Base: columns. Source: https://www.vyeptihcp.com/
 * Generated: 2026-04-14
 *
 * Columns block structure (from block library):
 * Row 1: block name
 * Each subsequent row: [column1 cell] [column2 cell]
 * Each cell can contain text, images, or other inline elements.
 *
 * Source DOM instances:
 * 1. .home-image-content-wrapper-1 - Infusion Network (text left, map image right)
 * 2. .coverage-finder-section-two - Coverage Finder (image left, text right)
 * 3. .home-image-content-wrapper-3 - Copay Support (copay card image left, text right)
 *
 * Each contains .cmp-teaser with .cmp-teaser__image and .cmp-teaser__content,
 * or a .columncontainer with .image and .teaser side by side.
 */
export default function parse(element, { document }) {
  const cells = [];

  // Determine layout: check if this is a toggle--right teaser or a two-column container
  const teaser = element.querySelector('.cmp-teaser') || element;
  const teaserImage = teaser.querySelector(':scope > .cmp-teaser__image img, .cmp-teaser__image img');
  const teaserContent = teaser.querySelector(':scope > .cmp-teaser__content, .cmp-teaser__content');

  // Check for standalone image outside the teaser (coverage-finder pattern)
  const standaloneImage = element.querySelector('.cmp-image__image, .cmp-image img');
  const imageCaption = element.querySelector('.cmp-image__title');

  // Build column 1 (image side)
  const imageCol = [];
  if (standaloneImage) {
    imageCol.push(standaloneImage);
    if (imageCaption) {
      const em = document.createElement('em');
      em.textContent = imageCaption.textContent;
      imageCol.push(em);
    }
  } else if (teaserImage) {
    imageCol.push(teaserImage);
  }

  // Build column 2 (text side)
  const textCol = [];
  if (teaserContent) {
    // Extract heading
    const heading = teaserContent.querySelector('.cmp-teaser__description h2, .cmp-teaser__description h3');
    if (heading) textCol.push(heading);

    // Extract description paragraphs
    const descriptions = teaserContent.querySelectorAll('.cmp-teaser__description p');
    descriptions.forEach((p) => textCol.push(p));

    // Extract bullet lists
    const lists = teaserContent.querySelectorAll('.cmp-teaser__description ul, .cmp-teaser__description ol');
    lists.forEach((list) => textCol.push(list));

    // Extract CTA link
    const cta = teaserContent.querySelector('.cmp-teaser__action-link');
    if (cta) {
      // Clean up the CTA text (remove "arrow" prefix text and icon images)
      const ctaImgs = cta.querySelectorAll('img');
      ctaImgs.forEach((img) => img.remove());
      const ctaText = cta.textContent.replace(/^\s*arrow\s*/i, '').trim();
      if (ctaText) {
        cta.textContent = ctaText;
        const p = document.createElement('p');
        p.append(cta);
        textCol.push(p);
      }
    }

    // Extract secondary description / disclaimer
    const secondary = teaserContent.querySelector('.cmp-teaser__description__secondary p');
    if (secondary && secondary.textContent.trim()) {
      textCol.push(secondary);
    }
  }

  // Determine column order based on the source layout
  // .toggle--right means image is on the right side, text on left
  const isImageRight = element.classList.contains('toggle--right')
    || element.querySelector('.toggle--right');

  if (isImageRight) {
    // Text left, image right
    cells.push([textCol, imageCol]);
  } else {
    // Image left, text right (default and coverage-finder pattern)
    cells.push([imageCol, textCol]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-teaser', cells });
  element.replaceWith(block);
}
