#!/usr/bin/env node
/**
 * Structural validator for the n8n workflow JSON files in workflow/.
 *
 * This does NOT talk to n8n or any external API — it only checks that the
 * exported JSON is internally consistent enough to import cleanly:
 *   - valid JSON
 *   - every node has a unique id and name
 *   - every connection references nodes that actually exist
 *   - node "type" strings look like real n8n package identifiers
 *   - flags leftover REPLACE_WITH_* credential/ID placeholders (warning, not a failure)
 *
 * Run: node scripts/validate-workflows.js
 */

const fs = require('fs');
const path = require('path');

const WORKFLOW_DIR = path.join(__dirname, '..', 'workflow');
const files = fs
  .readdirSync(WORKFLOW_DIR)
  .filter((f) => f.endsWith('.json'));

if (files.length === 0) {
  console.error('No workflow JSON files found in workflow/');
  process.exit(1);
}

let hadErrors = false;

for (const file of files) {
  const fullPath = path.join(WORKFLOW_DIR, file);
  console.log(`\n=== ${file} ===`);

  let wf;
  try {
    wf = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  } catch (err) {
    console.error(`  ERROR: invalid JSON — ${err.message}`);
    hadErrors = true;
    continue;
  }

  const errors = [];
  const warnings = [];

  if (!Array.isArray(wf.nodes)) {
    errors.push('missing or invalid "nodes" array');
  }
  if (typeof wf.connections !== 'object' || wf.connections === null) {
    errors.push('missing or invalid "connections" object');
  }

  const nodeNames = new Set();
  const nodeIds = new Set();

  for (const node of wf.nodes || []) {
    if (!node.name) {
      errors.push(`node with id ${node.id} is missing a "name"`);
      continue;
    }
    if (nodeNames.has(node.name)) {
      errors.push(`duplicate node name: "${node.name}"`);
    }
    nodeNames.add(node.name);

    if (!node.id) {
      errors.push(`node "${node.name}" is missing an "id"`);
    } else if (nodeIds.has(node.id)) {
      errors.push(`duplicate node id: "${node.id}" (node "${node.name}")`);
    } else {
      nodeIds.add(node.id);
    }

    if (!node.type || !/^(n8n-nodes-base\.|@n8n\/n8n-nodes-langchain\.)/.test(node.type)) {
      errors.push(`node "${node.name}" has an unrecognized type: "${node.type}"`);
    }

    const serialized = JSON.stringify(node.parameters || {}) + JSON.stringify(node.credentials || {});
    if (/REPLACE_WITH_/.test(serialized)) {
      warnings.push(`node "${node.name}" still has a REPLACE_WITH_* placeholder — fill in before activating`);
    }
  }

  for (const [sourceName, byConnType] of Object.entries(wf.connections || {})) {
    if (!nodeNames.has(sourceName)) {
      errors.push(`connection source node not found: "${sourceName}"`);
      continue;
    }
    for (const [connType, branches] of Object.entries(byConnType)) {
      for (const branch of branches) {
        for (const conn of branch) {
          if (!nodeNames.has(conn.node)) {
            errors.push(
              `connection target node not found: "${conn.node}" (from "${sourceName}", type "${connType}")`
            );
          }
        }
      }
    }
  }

  console.log(`  nodes: ${wf.nodes.length}`);
  console.log(`  connections: ${Object.keys(wf.connections || {}).length} source node(s)`);

  if (warnings.length > 0) {
    console.log('  warnings:');
    for (const w of warnings) console.log(`    - ${w}`);
  }

  if (errors.length > 0) {
    console.log('  ERRORS:');
    for (const e of errors) console.log(`    - ${e}`);
    hadErrors = true;
  } else {
    console.log('  OK — structurally valid');
  }
}

console.log('');
if (hadErrors) {
  console.error('Validation FAILED — see errors above.');
  process.exit(1);
} else {
  console.log('All workflow files passed structural validation.');
  process.exit(0);
}
