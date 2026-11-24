#!/usr/bin/env node
// Validate manifests/*.json and generate registry.json deterministically.
// Run with `--check` in CI to verify manifests are valid and registry.json is up to date.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const MANIFESTS_DIR = join(ROOT, 'manifests')
const REGISTRY_PATH = join(ROOT, 'registry.json')
const CHECK = process.argv.includes('--check')

const ID_RE = /^(dsh|mcp):[a-z0-9][a-z0-9._/@-]{1,100}$/i
const SLOT_RE = /^[a-z][a-z0-9-]{0,31}$/
const CATEGORIES = new Set(['browser', 'tools', 'productivity', 'dev', 'data', 'other'])
const SENSITIVE_KEY_RE = /(?:^|[_-])(auth|authorization|cookie|token|secret|password|passwd|pass|api[_-]?key|access[_-]?key|private[_-]?key|credential|session)(?:$|[_-])/i
const SECRET_REF_RE = /^\$DSH_SECRET_[A-Z][A-Z0-9_]*$/

function fail(file, message) {
  throw new Error(`${file}: ${message}`)
}

function checkHttpsUrl(file, field, value) {
  if (value === undefined) return
  let parsed
  try { parsed = new URL(String(value)) } catch { fail(file, `${field} must be a valid URL`) }
  if (parsed.protocol !== 'https:') fail(file, `${field} must use https://`)
  if (parsed.username || parsed.password) fail(file, `${field} must not embed credentials`)
}

function validateManifest(file, doc) {
  if (!doc || typeof doc !== 'object' || Array.isArray(doc)) fail(file, 'must be a JSON object')
  if (typeof doc.id !== 'string' || !ID_RE.test(doc.id)) fail(file, `invalid id "${doc.id}"`)
  if (!['dsh', 'mcp'].includes(doc.kind)) fail(file, `kind must be "dsh" or "mcp"`)
  if (!doc.id.startsWith(`${doc.kind}:`)) fail(file, `id "${doc.id}" must start with "${doc.kind}:"`)
  if (typeof doc.name !== 'string' || !doc.name.trim()) fail(file, 'name is required')
  if (typeof doc.description !== 'string' || !doc.description.trim()) fail(file, 'description is required')
  if (!CATEGORIES.has(doc.category)) fail(file, `invalid category "${doc.category}"`)
  if (doc.slot !== undefined && doc.slot !== null && (typeof doc.slot !== 'string' || !SLOT_RE.test(doc.slot))) {
    fail(file, `invalid slot "${doc.slot}"`)
  }
  checkHttpsUrl(file, 'homepage', doc.homepage)
  checkHttpsUrl(file, 'repository', doc.repository)

  if (!doc.install || typeof doc.install !== 'object') fail(file, 'install object is required')
  if (doc.kind === 'dsh') {
    if (!doc.install.packageName || !doc.install.spec) fail(file, 'dsh plugin requires install.packageName and install.spec')
  } else {
    const mcp = doc.install.mcp
    if (!mcp || typeof mcp !== 'object') fail(file, 'mcp plugin requires install.mcp')
    if (mcp.transport === 'stdio') {
      if (!mcp.packageSpec && !mcp.command) fail(file, 'stdio mcp requires packageSpec or command')
      for (const [k, v] of Object.entries(mcp.env ?? {})) {
        if (SENSITIVE_KEY_RE.test(k) && v !== '' && !SECRET_REF_RE.test(String(v))) {
          fail(file, `sensitive env "${k}" must reference $DSH_SECRET_<NAME>`)
        }
      }
    } else if (mcp.transport === 'streamable-http') {
      checkHttpsUrl(file, 'install.mcp.url', mcp.url)
      for (const [k, v] of Object.entries(mcp.headers ?? {})) {
        if (SENSITIVE_KEY_RE.test(k) && v !== '' && !SECRET_REF_RE.test(String(v))) {
          fail(file, `sensitive header "${k}" must reference $DSH_SECRET_<NAME>`)
        }
      }
    } else {
      fail(file, `invalid mcp transport "${mcp.transport}"`)
    }
  }
  return doc
}

const files = readdirSync(MANIFESTS_DIR).filter(name => name.endsWith('.json')).sort()
const seen = new Set()
const plugins = []

for (const file of files) {
  const doc = JSON.parse(readFileSync(join(MANIFESTS_DIR, file), 'utf8'))
  validateManifest(file, doc)
  if (seen.has(doc.id)) fail(file, `duplicate plugin id "${doc.id}"`)
  seen.add(doc.id)
  plugins.push(doc)
}

plugins.sort((a, b) => {
  if (Boolean(b.featured) !== Boolean(a.featured)) return b.featured ? 1 : -1
  return a.id.localeCompare(b.id)
})

const output = `${JSON.stringify({ schemaVersion: 1, plugins }, null, 2)}\n`

if (CHECK) {
  let existing = ''
  try { existing = readFileSync(REGISTRY_PATH, 'utf8') } catch { /* missing */ }
  if (existing !== output) {
    console.error('registry.json is out of date. Run `npm run build` and commit the result.')
    process.exit(1)
  }
  console.log(`Validated ${plugins.length} plugin manifests; registry.json is up to date.`)
} else {
  writeFileSync(REGISTRY_PATH, output)
  console.log(`Generated registry.json with ${plugins.length} plugins.`)
}
