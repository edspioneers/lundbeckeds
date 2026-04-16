/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: vyeptihcp cleanup.
 * Selectors from captured DOM of https://www.vyeptihcp.com/
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent banner (from captured DOM: #cookie-information-template-wrapper, #coiConsentBanner, #coiOverlay)
    WebImporter.DOMUtils.remove(element, [
      '#cookie-information-template-wrapper',
      '#coiOverlay',
    ]);

    // Remove chat widget (from captured DOM: .lumi-chat-backdrop, .lumi-chat-polygon, .lumi-chat-window)
    WebImporter.DOMUtils.remove(element, [
      '.lumi-chat-backdrop',
      '.lumi-chat-polygon',
      '[class*="lumi-chat"]',
    ]);

    // Fix overflow hidden on body that may block parsing
    if (element.style && element.style.overflow === 'hidden') {
      element.style.overflow = 'scroll';
    }
  }

  if (hookName === H.after) {
    // Remove header experience fragment (from captured DOM: .cmp-experiencefragment--header)
    // Remove footer experience fragment (from captured DOM: .cmp-experiencefragment--footer)
    // Remove ISI sticky bottom bar (from captured DOM: #isiFixedBottom) - duplicate of full ISI
    // Remove ISI master fragment (from captured DOM: .cmp-experiencefragment--marster) - contains #isiFixedBottom duplicate
    // Remove back-to-top button (from captured DOM: .sticky-top with back-to-top image)
    WebImporter.DOMUtils.remove(element, [
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      '.cmp-experiencefragment--marster',
      'iframe',
      'link',
      'noscript',
    ]);

    // Remove tracking pixels and invisible images (1x1 gifs, analytics beacons)
    const trackingImages = element.querySelectorAll('img[src*="demdex.net"], img[src*="2o7.net"], img[src*="analytics"], img[src*="pixel"], img[src*="greencolumnart"], img[src*="adsct"], img[src*="adservice.google"], img[src*="rlcdn.com"], img[src*="mookie1"]');
    trackingImages.forEach((img) => img.remove());

    // Remove empty source elements left from picture elements
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
