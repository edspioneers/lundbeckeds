/* eslint-disable */
/* global WebImporter */

import heroPatientParser from './parsers/hero-patient.js';
import cleanupTransformer from './transformers/vyepti-patient-cleanup.js';

const PAGE_TEMPLATE = {
  name: 'vyepti-patient-page',
  blocks: [
    { name: 'hero-patient', instances: ['.cmp-teaser'] },
  ],
  sections: [
    { id: 'section-1-hero', name: 'Hero', selector: '.herocomponent', style: null, blocks: ['hero-patient'], defaultContent: [] },
    { id: 'section-2-isi', name: 'ISI', selector: '#SafetyPanelInfo', style: 'grey', blocks: [], defaultContent: ['#SafetyPanelInfo .panel-heading', '#SafetyPanelInfo #safetyInformationBody', '#SafetyPanelInfo .indicationText'] },
    { id: 'section-3-references', name: 'References', selector: '.reference-section', style: null, blocks: [], defaultContent: ['.reference-section p', '.reference-section ol'] },
  ],
};

const parsers = { 'hero-patient': heroPatientParser };
const transformers = [cleanupTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Parse failed:`, e); }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const pathname = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index';
    const path = WebImporter.FileUtils.sanitizePath('/vyepti' + pathname);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
