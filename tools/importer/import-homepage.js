/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroPharmaParser from './parsers/hero-pharma.js';
import cardsNavParser from './parsers/cards-nav.js';
import cardsFeatureParser from './parsers/cards-feature.js';
import columnsTeaserParser from './parsers/columns-teaser.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/vyeptihcp-cleanup.js';
import sectionsTransformer from './transformers/vyeptihcp-sections.js';

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Vyepta HCP homepage - main landing page for healthcare professionals',
  urls: ['https://www.vyeptihcp.com/'],
  blocks: [
    {
      name: 'hero-pharma',
      instances: ['.hero-component'],
    },
    {
      name: 'cards-nav',
      instances: [
        '.teaser.narrow--teaser--trans.teaser-efficacy-patient, .teaser.narrow--teaser--trans.teaser-vyepti-patient, .teaser.narrow--teaser--trans.teaser-dosing-safety, .teaser.narrow--teaser--trans.teaser-access-vyepti',
      ],
    },
    {
      name: 'cards-feature',
      instances: ['.home-two-card-section .narrow--teaser--cta'],
    },
    {
      name: 'columns-teaser',
      instances: [
        '.home-image-content-wrapper-1',
        '.coverage-finder-section-two',
        '.home-image-content-wrapper-3',
      ],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Banner',
      selector: '.hero-component',
      style: null,
      blocks: ['hero-pharma'],
      defaultContent: [],
    },
    {
      id: 'section-2-nav-cards',
      name: 'Navigation Teaser Cards',
      selector: '.hero-component .columncontainer:nth-of-type(2)',
      style: null,
      blocks: ['cards-nav'],
      defaultContent: [],
    },
    {
      id: 'section-3-two-cards',
      name: 'Featured Content Cards',
      selector: '.home-two-card-section',
      style: null,
      blocks: ['cards-feature'],
      defaultContent: [],
    },
    {
      id: 'section-4-infusion-network',
      name: 'Infusion Network Locator',
      selector: '.home-image-content-wrapper-1',
      style: null,
      blocks: ['columns-teaser'],
      defaultContent: [],
    },
    {
      id: 'section-5-coverage-finder',
      name: 'Coverage Finder',
      selector: '.coverage-finder-section-two',
      style: null,
      blocks: ['columns-teaser'],
      defaultContent: [],
    },
    {
      id: 'section-6-copay-support',
      name: 'Copay Support',
      selector: '.home-image-content-wrapper-3',
      style: null,
      blocks: ['columns-teaser'],
      defaultContent: [],
    },
    {
      id: 'section-7-isi',
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
      id: 'section-8-references',
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
  'cards-feature': cardsFeatureParser,
  'columns-teaser': columnsTeaserParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [sectionsTransformer]
    : []),
];

/**
 * Execute all page transformers for a specific hook
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration
 */
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

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
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

    // 4. Execute afterTransform transformers (final cleanup + section breaks/metadata)
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
