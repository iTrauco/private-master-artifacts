// Original file: map_project_functions.js 
// Version date: Wed Apr 23 11:43:22 PM EDT 2025 
// Git branch: feature/bq-connector-implimentation 
// Last commit: Modified Function: getProjectStats()


/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 *  🗺️  Function Map CLI — defaults to:
 *      • scan every *.js file in the repo
 *      • write artifacts/function-map.csv
 *  Author: Trauco (trau.co) – 2025-04-23
 * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */

const path       = require('node:path');
const fs         = require('node:fs');
const fg         = require('fast-glob');
const inquirer   = require('inquirer');
const { parse }  = require('@babel/parser');
const traverse   = require('@babel/traverse').default;
const chalk      = require('chalk');

const ROOT         = process.cwd();
const SCRIPT_DIR   = path.dirname(__filename);          // where this script lives
const DEFAULT_IGNORE = ['**/node_modules/**','**/.git/**','**/dist/**'];

(async function main () {
  const answers = await inquirer.prompt([
    {
      name: 'pattern',
      message: 'File glob to scan:',
      default: '**/*.js'                                // 🟢 new default
    },
    {
      name: 'extraIgnore',
      message: 'Extra ignore globs (comma-separated, leave blank for none):',
      filter: input => input.split(',').map(s => s.trim()).filter(Boolean)
    },
    {
      name: 'format',
      type: 'list',
      message: 'Output format:',
      choices: ['json','csv'],
      default: 'csv'                                    // 🟢 new default
    },
    {
      name: 'outFile',
      message: 'Output file path:',
      default: path.relative(
                  ROOT,
                  path.join(SCRIPT_DIR,'function-map.csv')   // 🟢 same folder as script
               )
    }
  ]);

  /* 2️⃣  Collect file paths */
  const files = await fg(answers.pattern,{
    cwd: ROOT,
    ignore: [...DEFAULT_IGNORE, ...answers.extraIgnore],
    absolute: true
  });

  if (!files.length){
    console.error(chalk.red('No matching source files found – exiting.'));
    process.exit(1);
  }

  /* 3️⃣  Parse each file and harvest functions */
  const map = {};                       // { fnName: Set<relativePath> }
  const parserOpts = { sourceType:'unambiguous', plugins:['typescript','jsx'] };

  for (const absPath of files){
    const code = fs.readFileSync(absPath,'utf8');
    let ast;
    try   { ast = parse(code, parserOpts); }
    catch { console.warn(chalk.yellow(`⚠️  Skipped (parse error): ${absPath}`)); continue; }

    traverse(ast,{
      FunctionDeclaration({node}){ if(node.id?.name) register(node.id.name, absPath); },
      VariableDeclarator({node}){
        const isFunc = node.init &&
                       ['FunctionExpression','ArrowFunctionExpression'].includes(node.init.type);
        if(isFunc && node.id.type==='Identifier') register(node.id.name, absPath);
      },
    });
  }

  /* 4️⃣  Write the output */
  const rel = p => path.relative(ROOT,p);
  let outStr;

  if(answers.format==='json'){
    const obj={};
    for(const [fn,paths] of Object.entries(map)) obj[fn]=[...paths].map(rel);
    outStr = JSON.stringify(obj,null,2);
  } else {
    const rows=[];
    for(const [fn,paths] of Object.entries(map))
      paths.forEach(p=>rows.push(`${fn},${rel(p)}`));
    outStr = rows.join('\n');
  }

  fs.writeFileSync(path.resolve(ROOT,answers.outFile),outStr);
  console.log(chalk.green(`✅  Map created at ${answers.outFile}  (${Object.keys(map).length} unique functions)`));

  function register(fn,file){ (map[fn]=map[fn]||new Set()).add(file); }
})();
