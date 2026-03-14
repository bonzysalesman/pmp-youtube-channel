#!/usr/bin/env node
/**
 * PMP Mastery Framework — Marp Batch Export Pipeline
 * 
 * Finds all slides.md files under src/generated/ and exports
 * them as PDF and PPTX using the pmp-mastery.css brand theme.
 *
 * Usage:
 *   node scripts/export-slides.js            # all decks → dist/slides/
 *   node scripts/export-slides.js --day 1    # single day
 *   node scripts/export-slides.js --week 3   # all days in week 3
 *   node scripts/export-slides.js --html     # HTML preview (faster, no PPTX dep)
 *   node scripts/export-slides.js --pdf      # PDF only
 *   node scripts/export-slides.js --pptx     # PPTX only
 */

import { execSync, spawn } from 'child_process';
import { glob } from 'glob';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ─── Config ─────────────────────────────────────────────────
const CONFIG = {
  theme:      path.join(ROOT, 'src/themes/pmp-mastery.css'),
  inputGlob:  'src/generated/**/slides.md',
  outputDir:  path.join(ROOT, 'dist/slides'),
  formats:    ['pdf', 'pptx'],   // change to ['html'] for quick previews
  resolution: 150,               // DPI for PDF image quality
  allowLocal: true,              // Allow local file access (images etc.)
};

// ─── Parse CLI args ─────────────────────────────────────────
const args = process.argv.slice(2);
const opts = {
  day:   args.find((_, i) => args[i - 1] === '--day')   || null,
  week:  args.find((_, i) => args[i - 1] === '--week')  || null,
  html:  args.includes('--html'),
  pdf:   args.includes('--pdf'),
  pptx:  args.includes('--pptx'),
  watch: args.includes('--watch'),
};

// Determine output formats
if (opts.html)       CONFIG.formats = ['html'];
else if (opts.pdf)   CONFIG.formats = ['pdf'];
else if (opts.pptx)  CONFIG.formats = ['pptx'];

// ─── Helpers ─────────────────────────────────────────────────
function log(msg, type = 'info') {
  const colors = { info: '\x1b[36m', ok: '\x1b[32m', warn: '\x1b[33m', err: '\x1b[31m', dim: '\x1b[90m' };
  const reset = '\x1b[0m';
  console.log(`${colors[type] ?? ''}${msg}${reset}`);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getOutputPath(inputFile, format) {
  // src/generated/week-1/day-1/slides.md → dist/slides/week-1/day-1/slides.pdf
  const rel   = path.relative(path.join(ROOT, 'src/generated'), inputFile);
  const out   = path.join(CONFIG.outputDir, rel.replace('slides.md', `slides.${format}`));
  ensureDir(path.dirname(out));
  return out;
}

function buildArgs(inputFile, outputFile, format) {
  const base = [
    `--theme`, CONFIG.theme,
    `--${format}`,
    `--output`, outputFile,
  ];
  if (CONFIG.allowLocal) base.push('--allow-local-files');
  if (format === 'html')  base.push('--html');
  base.push(inputFile);
  return base;
}

async function exportDeck(inputFile, format) {
  const outputFile = getOutputPath(inputFile, format);
  const marpArgs   = buildArgs(inputFile, outputFile, format);
  const label      = path.relative(ROOT, inputFile);

  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['marp', ...marpArgs], { cwd: ROOT, stdio: 'pipe' });
    let stderr = '';
    proc.stderr.on('data', d => stderr += d.toString());
    proc.on('close', code => {
      if (code === 0) {
        log(`  ✓  [${format.toUpperCase()}] ${label} → ${path.relative(ROOT, outputFile)}`, 'ok');
        resolve({ input: inputFile, output: outputFile, format });
      } else {
        log(`  ✗  [${format.toUpperCase()}] ${label} — ${stderr.trim()}`, 'err');
        reject(new Error(`marp exited ${code}: ${stderr}`));
      }
    });
  });
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  log('\n┌─────────────────────────────────────────────────┐');
  log('│  PMP Mastery Framework — Slide Export Pipeline   │');
  log('└─────────────────────────────────────────────────┘\n');

  // Verify theme exists
  if (!fs.existsSync(CONFIG.theme)) {
    log(`✗ Theme not found: ${CONFIG.theme}`, 'err');
    log('  Create src/themes/pmp-mastery.css first.', 'dim');
    process.exit(1);
  }

  // Discover slide files
  let files = await glob(CONFIG.inputGlob, { cwd: ROOT, absolute: true });

  // Apply filters
  if (opts.week) {
    files = files.filter(f => f.includes(`/week-${opts.week}/`));
    log(`Filtering to Week ${opts.week}: ${files.length} deck(s) found`, 'dim');
  }
  if (opts.day) {
    files = files.filter(f => f.includes(`/day-${opts.day}/`));
    log(`Filtering to Day ${opts.day}: ${files.length} deck(s) found`, 'dim');
  }

  if (!files.length) {
    log('No slides.md files found. Check src/generated/ structure.', 'warn');
    process.exit(0);
  }

  log(`Found ${files.length} deck(s) — exporting as: ${CONFIG.formats.join(', ').toUpperCase()}\n`);

  // Export all decks
  let succeeded = 0, failed = 0;
  const start = Date.now();

  for (const file of files) {
    for (const format of CONFIG.formats) {
      try {
        await exportDeck(file, format);
        succeeded++;
      } catch {
        failed++;
      }
    }
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  log(`\n────────────────────────────────────────────`);
  log(`  Exported: ${succeeded}  |  Failed: ${failed}  |  ${elapsed}s`, failed ? 'warn' : 'ok');
  log(`  Output:   ${path.relative(ROOT, CONFIG.outputDir)}/`);
  log(`────────────────────────────────────────────\n`);

  if (failed > 0) process.exit(1);
}

// ─── Watch mode ───────────────────────────────────────────────
if (opts.watch) {
  log('Watch mode — monitoring src/generated/ for changes...', 'dim');
  const { watch } = await import('fs');
  watch(path.join(ROOT, 'src/generated'), { recursive: true }, async (event, filename) => {
    if (filename?.endsWith('slides.md')) {
      log(`\nChange detected: ${filename}`, 'dim');
      await main();
    }
  });
} else {
  main().catch(err => { console.error(err); process.exit(1); });
}
