#!/usr/bin/env node
// Project-level MCP server for the PhD website. Exposes tools to push content
// updates without hand-editing markup:
//   - add_news              append a news item to index.html (newest first)
//   - add_publication       add a publication to index.html AND data/cv.json, rebuild cv.pdf
//   - import_scholar        pull publications from a Google Scholar profile (best-effort)
//   - add_cv_item           add an Education/Experience entry to data/cv.json, rebuild cv.pdf
//
// Wired into Claude Code via .mcp.json at the repo root. All edits go through
// the pure functions in lib/, so behaviour is unit-tested there.
'use strict';

const fs = require('fs');
const path = require('path');

const { Server } = require('@modelcontextprotocol/sdk/server/index.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const {
  ListToolsRequestSchema,
  CallToolRequestSchema,
} = require('@modelcontextprotocol/sdk/types.js');

const { insertNews, insertPublication, KNOWN_TAGS } = require('../lib/site-edit');
const { addCvItem, addCvPublication } = require('../lib/cv-edit');
const { parseScholarProfile, fetchScholarProfile } = require('../lib/scholar');

const ROOT = path.resolve(__dirname, '..');
const INDEX = path.join(ROOT, 'index.html');
const CV_JSON = path.join(ROOT, 'data', 'cv.json');
const DEFAULT_SCHOLAR_ID = 'SGLEgJEAAAAJ';

const readIndex = () => fs.readFileSync(INDEX, 'utf8');
const writeIndex = (html) => fs.writeFileSync(INDEX, html);
const readCv = () => JSON.parse(fs.readFileSync(CV_JSON, 'utf8'));
const writeCv = (cv) => fs.writeFileSync(CV_JSON, JSON.stringify(cv, null, 2) + '\n');

/** Rebuild the PDF. Lazy-require puppeteer so news-only edits stay fast. */
async function rebuildCv() {
  const { buildCv } = require('../scripts/build-cv');
  await buildCv();
}

const ok = (text) => ({ content: [{ type: 'text', text }] });

const TOOLS = [
  {
    name: 'add_news',
    description:
      'Add a news item to the top of the News section in index.html. `text` may contain inline HTML (e.g. <a> links).',
    inputSchema: {
      type: 'object',
      properties: {
        date: { type: 'string', description: 'Year or date label, e.g. "2026"' },
        type: { type: 'string', enum: KNOWN_TAGS, description: 'Tag category (sets colour).' },
        label: { type: 'string', description: 'Optional tag text; defaults to capitalised type.' },
        text: { type: 'string', description: 'The news text (inline HTML allowed).' },
      },
      required: ['date', 'text'],
    },
  },
  {
    name: 'add_publication',
    description:
      'Add a publication to index.html and data/cv.json, then rebuild assets/files/cv.pdf.',
    inputSchema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        authors: { type: 'string' },
        venue: { type: 'string' },
        year: { type: 'string' },
        url: { type: 'string', description: 'Link to PDF or DOI (optional).' },
      },
      required: ['title', 'authors'],
    },
  },
  {
    name: 'import_scholar',
    description:
      'Best-effort import of publications from a Google Scholar profile into index.html and cv.json, then rebuild the PDF. Scholar may rate-limit; on failure, use add_publication.',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: `Scholar user id (the user= param). Defaults to ${DEFAULT_SCHOLAR_ID}.`,
        },
      },
    },
  },
  {
    name: 'add_cv_item',
    description:
      'Add an entry to a CV section (e.g. Education, Experience) in data/cv.json, then rebuild cv.pdf.',
    inputSchema: {
      type: 'object',
      properties: {
        section: { type: 'string', description: 'Section title, e.g. "Experience".' },
        when: { type: 'string', description: 'Date range, e.g. "2026 – present".' },
        what: { type: 'string', description: 'Role / qualification description.' },
        where: { type: 'string', description: 'Institution (optional).' },
      },
      required: ['section', 'when', 'what'],
    },
  },
];

/** Add a single publication to both stores + rebuild. Returns whether it was new. */
async function applyPublication(pub) {
  const cv = readCv();
  const before = (cv.publications || []).length;
  const nextCv = addCvPublication(cv, pub);
  const isNew = (nextCv.publications || []).length > before;
  if (isNew) {
    writeCv(nextCv);
    const links = pub.url ? [{ label: 'PDF', href: pub.url }] : [];
    const venue = [pub.venue, pub.year].filter(Boolean).join(', ');
    writeIndex(insertPublication(readIndex(), { ...pub, venue, links }));
  }
  return isNew;
}

async function handleCall(name, args) {
  switch (name) {
    case 'add_news': {
      writeIndex(insertNews(readIndex(), args));
      return ok(`Added news "${args.text.slice(0, 60)}…" (${args.date}).`);
    }
    case 'add_publication': {
      const isNew = await applyPublication(args);
      if (!isNew) return ok(`Publication already present (matched on title): "${args.title}".`);
      await rebuildCv();
      return ok(`Added publication "${args.title}" to site + CV, rebuilt cv.pdf.`);
    }
    case 'import_scholar': {
      const userId = args.userId || DEFAULT_SCHOLAR_ID;
      const html = await fetchScholarProfile(userId);
      const pubs = parseScholarProfile(html);
      if (!pubs.length) {
        throw new Error('No publications parsed (Scholar may have served a CAPTCHA / empty page).');
      }
      const added = [];
      for (const p of pubs) {
        if (await applyPublication(p)) added.push(p.title);
      }
      if (added.length) await rebuildCv();
      return ok(
        `Scholar import (${userId}): parsed ${pubs.length}, added ${added.length} new.` +
          (added.length ? '\n- ' + added.join('\n- ') : '')
      );
    }
    case 'add_cv_item': {
      const { section, when, what, where } = args;
      writeCv(addCvItem(readCv(), section, { when, what, where }));
      await rebuildCv();
      return ok(`Added "${what.slice(0, 60)}…" to CV section "${section}", rebuilt cv.pdf.`);
    }
    default:
      throw new Error(`unknown tool: ${name}`);
  }
}

async function main() {
  const server = new Server(
    { name: 'phd-website', version: '1.0.0' },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOLS }));
  server.setRequestHandler(CallToolRequestSchema, async (req) => {
    try {
      return await handleCall(req.params.name, req.params.arguments || {});
    } catch (e) {
      return { content: [{ type: 'text', text: `Error: ${e.message}` }], isError: true };
    }
  });

  await server.connect(new StdioServerTransport());
  console.error('phd-website MCP server running on stdio');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
