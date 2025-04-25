// NEW VERSION - Original backed up to: orig.map_project_functions_2025-04-23_23-43.js 
// Version date: Wed Apr 23 11:43:22 PM EDT 2025 
// Git branch: feature/bq-connector-implimentation 
// Last commit: Modified Function: getProjectStats()

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  🗺️  Function Map CLI
 *  • remembers your scan settings in .function-map-config.json
 *  • lets you reuse / update them on every run
 *  • never overwrites a previous map – adds a timestamp
 *  Author: Trauco (trau.co) – 2025-04-23
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const path      = require('node:path');
const fs        = require('node:fs');
const fg        = require('fast-glob');
const inquirer  = require('inquirer');
const { parse } = require('@babel/parser');
const traverse  = require('@babel/traverse').default;
const chalk     = require('chalk');

/* ── constants ────────────────────────────────────────────── */
const ROOT          = process.cwd();
const SCRIPT_DIR    = path.dirname(__filename);
const CONFIG_FILE   = path.join(SCRIPT_DIR, '.function-map-config.json');
const DEFAULT_CFG   = {
  startDir: '.',                // relative to repo root
  pattern : '**/*.js',          // files to scan
  exclude : [],                 // additional ignore globs
  format  : 'csv',              // json | csv
  outBase : 'function-map'      // base filename (timestamp appended)
};
const DEFAULT_IGNORE = ['**/node_modules/**', '**/.git/**', '**/dist/**'];

/* ── bootstrap ────────────────────────────────────────────── */
(async function () {
  const cfgOnDisk = loadConfig();
  const cfg = await obtainConfig(cfgOnDisk);
  const absStart = path.resolve(ROOT, cfg.startDir);

  /* gather files */
  const files = await fg(cfg.pattern, {
    cwd: absStart,
    ignore: [...DEFAULT_IGNORE, ...cfg.exclude.map(d => `${d}/**`)],
    absolute: true
  });
  if (!files.length) exitWith('No matching source files found.');

  /* parse & harvest functions */
  const map = {};
  for (const fp of files) parseFile(fp, map);

  /* write output */
  const stamp   = new Date().toISOString().replace(/[-:]/g, '').replace('T','_').slice(0,15);
  const outName = `${cfg.outBase}-${stamp}.${cfg.format}`;
  const outPath = path.join(SCRIPT_DIR, outName);
  writeOutput(cfg.format, map, outPath, absStart);
  console.log(chalk.green(`✅  Map written → ${path.relative(ROOT, outPath)}`));
})();

/* ── helpers ──────────────────────────────────────────────── */
function loadConfig () {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); }
  catch { return null; }
}

async function obtainConfig (existing) {
  if (existing) {
    const { mode } = await inquirer.prompt([{
      name: 'mode',
      type: 'list',
      message: 'Config found – choose an option:',
      choices: ['Use last config', 'Update config', 'Exit']
    }]);
    if (mode === 'Use last config') return existing;
    if (mode === 'Exit') process.exit(0);
  }
  /* ask for new settings */
  const answers = await inquirer.prompt([
    { name:'startDir', message:'Start directory to scan (relative to repo root):',
      default: existing?.startDir ?? DEFAULT_CFG.startDir },
    { name:'pattern',  message:'File glob to scan:', default: existing?.pattern ?? DEFAULT_CFG.pattern },
    { name:'exclude',  message:'Directories to exclude (comma-separated):',
      filter: i => i.split(',').map(s=>s.trim()).filter(Boolean),
      default: (existing?.exclude ?? []).join(',') },
    { name:'format',   type:'list', message:'Output format:', choices:['csv','json'],
      default: existing?.format ?? DEFAULT_CFG.format },
    { name:'outBase',  message:'Output filename base (timestamp appended):',
      default: existing?.outBase ?? DEFAULT_CFG.outBase },
    { name:'save',     type:'confirm', message:'Save as default config?', default:true }
  ]);
  const cfg = { startDir:answers.startDir, pattern:answers.pattern,
                exclude:answers.exclude, format:answers.format, outBase:answers.outBase };
  if (answers.save) fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg,null,2));
  return cfg;
}

function parseFile (absPath, map) {
  const code = fs.readFileSync(absPath, 'utf8');
  let ast;
  try { ast = parse(code, { sourceType:'unambiguous', plugins:['typescript','jsx'] }); }
  catch { console.warn(chalk.yellow(`⚠️  skipped (parse error): ${absPath}`)); return; }
  traverse(ast, {
    FunctionDeclaration({node}) { if (node.id?.name) register(node.id.name, absPath, map); },
    VariableDeclarator({node}) {
      const init = node.init;
      if (init && ['FunctionExpression','ArrowFunctionExpression'].includes(init.type) &&
          node.id.type === 'Identifier')
        register(node.id.name, absPath, map);
    }
  });
}
function register (name, file, map) {
  (map[name] = map[name] || new Set()).add(file);
}
function writeOutput (format, map, outPath, absStart) {
  const rel = p => path.relative(absStart, p);
  let out;
  if (format === 'json') {
    const obj={}; for (const [fn,paths] of Object.entries(map)) obj[fn]=[...paths].map(rel);
    out = JSON.stringify(obj,null,2);
  } else {
    const rows=[]; for (const [fn,paths] of Object.entries(map))
      paths.forEach(p=>rows.push(`${fn},${rel(p)}`));
    out = rows.join('\n');
  }
  fs.writeFileSync(outPath, out);
}
function exitWith (msg) { console.error(chalk.red(msg)); process.exit(1); }
