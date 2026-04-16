/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPharmaParser from './parsers/hero-pharma.js';
import cardsNavParser from './parsers/cards-nav.js';
import tabsClinicalParser from './parsers/tabs-clinical.js';
import accordionStudyParser from './parsers/accordion-study.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/vyeptihcp-cleanup.js';
import sectionsTransformer from './transformers/vyeptihcp-sections.js';

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'efficacy-and-patient-outcomes',
  description: 'Efficacy and patient outcomes page for VYEPTI HCP site - clinical data, study results, and patient-reported outcomes',
  urls: ['https://www.vyeptihcp.com/efficacy-and-patient-outcomes'],
  blocks: [
    {
      name: 'hero-pharma',
      instances: [
        '.herocomponent.banner-component .hero-component',
        '.herocomponent.percentage-migraine-treated-graph .hero-component',
      ],
    },
    {
      name: 'cards-nav',
      instances: ['.teaser.efficacy-banner-links'],
    },
    {
      name: 'tabs-clinical',
      instances: ['.tab.tabs.panelcontainer'],
    },
    {
      name: 'accordion-study',
      instances: ['.two-years-study-design'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Banner',
      selector: '.herocomponent.banner-component',
      style: null,
      blocks: ['hero-pharma', 'cards-nav'],
      defaultContent: [],
    },
    {
      id: 'section-2-stats-hero',
      name: '100% Migraine Freedom Stats',
      selector: '.herocomponent.percentage-migraine-treated-graph',
      style: null,
      blocks: ['hero-pharma'],
      defaultContent: [],
    },
    {
      id: 'section-3-efficacy-tabs',
      name: 'Efficacy Data Tabs',
      selector: '.tab.tabs.panelcontainer',
      style: null,
      blocks: ['tabs-clinical'],
      defaultContent: [],
    },
    {
      id: 'section-4-2year-data',
      name: '2-Year Data',
      selector: '.two-years-study-design',
      style: null,
      blocks: ['accordion-study'],
      defaultContent: [],
    },
    {
      id: 'section-5-isi',
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
      id: 'section-6-references',
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
  'cards-nav': cardsNavParser,
  'tabs-clinical': tabsClinicalParser,
  'accordion-study': accordionStudyParser,
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
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
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

    // 1. Execute beforeTransform transformers
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname
        .replace(/\/$/, '')
        .replace(/\.html$/, '') || '/efficacy-and-patient-outcomes',
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
