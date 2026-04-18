/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: vyepti.com patient site cleanup.
 * Selectors from captured DOM of https://www.vyepti.com/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent banner
    WebImporter.DOMUtils.remove(element, [
      '#cookie-information-template-wrapper',
      '#coiOverlay',
    ]);

    // Remove chat widget
    WebImporter.DOMUtils.remove(element, [
      '[class*="lumi-chat"]',
      '.lumi-chat-backdrop',
    ]);

    // Fix overflow
    if (element.style && element.style.overflow === 'hidden') {
      element.style.overflow = 'scroll';
    }
  }

  if (hookName === H.after) {
    // Remove header/footer/ISI experience fragments
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      '.cmp-experiencefragment--marster',
      '.cmp-experiencefragment--isi',
      'iframe',
      'link',
      'noscript',
    ]);

    // Remove tracking pixels
    const trackingImages = element.querySelectorAll('img[src*="demdex.net"], img[src*="2o7.net"], img[src*="analytics"], img[src*="pixel"], img[src*="greencolumnart"], img[src*="mookie1"], img[src*="adsct"], img[src*="adservice.google"]');
    trackingImages.forEach((img) => img.remove());

    // Remove empty source elements
    const emptySources = element.querySelectorAll('source:not([srcset])');
    emptySources.forEach((s) => s.remove());

    // Clean data attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('onkeypress');
    });
  }
}
