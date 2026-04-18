/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero-patient.
 * Base: hero. Source: https://www.vyepti.com/
 *
 * Patient site hero uses cmp-teaser with background image,
 * heading (h1/h3), description text, and CTA link.
 */
export default function parse(element, { document }) {
  // Extract background image
  const bgImg = element.querySelector('.cmp-teaser__image img, .banner-img img, picture img');

  // Extract content from teaser description
  const description = element.querySelector('.cmp-teaser__description, .rteComponent, .banner-content .rte');

  const cells = [];

  // Row for background image
  if (bgImg) {
    cells.push([bgImg]);
  }

  // Row for text content
  const contentCell = [];
  if (description) {
    const children = Array.from(description.children);
    children.forEach((child) => contentCell.push(child));
  }

  // Add CTA if present
  const cta = element.querySelector('.cmp-teaser__action-link');
  if (cta) {
    const ctaImgs = cta.querySelectorAll('img');
    ctaImgs.forEach((img) => img.remove());
    const ctaText = cta.textContent.replace(/^\s*arrow\s*/i, '').trim();
    if (ctaText) {
      cta.textContent = ctaText;
      contentCell.push(cta);
    }
  }

  if (contentCell.length > 0) {
    cells.push(contentCell);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-patient', cells });
  element.replaceWith(block);
}
