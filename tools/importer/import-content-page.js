/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS - reuse existing hero parser
import heroPharmaParser from './parsers/hero-pharma.js';

// TRANSFORMER IMPORTS - reuse existing transformers
import cleanupTransformer from './transformers/vyeptihcp-cleanup.js';
import sectionsTransformer from './transformers/vyeptihcp-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'content-page',
  description: 'Standard VYEPTI HCP content page with hero banner, main content, ISI, and references',
  blocks: [
    {
      name: 'hero-pharma',
      instances: ['.hero-component'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Banner',
      selector: '.herocomponent.banner-component',
      style: null,
      blocks: ['hero-pharma'],
      defaultContent: [],
    },
    {
      id: 'section-2-isi',
      name: 'Important Safety Information',
      selector: '#SafetyPanelInfo',
      style: 'grey',
      blocks: [],
      defaultContent: [
        '#SafetyPanelInfo .panel-heading',
        '#SafetyPanelInfo #safetyInformationBody',
        '#SafetyPanelInfo .indicationText',
      ],
    },
    {
      id: 'section-3-references',
      name: 'References',
      selector: '.reference-section',
      style: null,
      blocks: [],
      defaultContent: ['.reference-section p', '.reference-section ol'],
    },
  ],
};

// PARSER REGISTRY
const parsers = {
  'hero-pharma': heroPharmaParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [sectionsTransformer]
    : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE,
  };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
        });
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
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name}:`, e);
        }
      }
    });

    executeTransformers('afterTransform', main, payload);

    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/\/$/, '')
        .replace(/\.html$/, '') || '/index',
    );

    return [
      {
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
        },
      },
    ];
  },
};
