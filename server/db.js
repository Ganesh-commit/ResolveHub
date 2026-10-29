const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { generateSeedDatabase } = require('./scripts/seedJsonDatabase');

const SERVER_JSON_PATH = path.join(__dirname, 'data', 'resolvehub.json');
const ROOT_JSON_PATH = path.join(__dirname, '..', 'data', 'resolvehub.json');

// ── IN-MEMORY STATE SYNCHRONIZED ATOMICALLY WITH JSON DATABASE FILES ─────────
let dbState = {
  staff: [],
  users: [],
  signupRequests: [],
  tickets: [],
  settings: null,
  activityLogs: []
};

let writeQueuePromise = Promise.resolve();

function loadDatabaseFromDisk() {
  try {
    const targetPath = fs.existsSync(SERVER_JSON_PATH)
      ? SERVER_JSON_PATH
      : (fs.existsSync(ROOT_JSON_PATH) ? ROOT_JSON_PATH : null);

    if (targetPath) {
      const raw = fs.readFileSync(targetPath, 'utf8');
      const parsed = JSON.parse(raw);
      dbState.staff = Array.isArray(parsed.staff) ? parsed.staff : [];
      dbState.users = Array.isArray(parsed.users) ? parsed.users : [];
      dbState.signupRequests = Array.isArray(parsed.signupRequests) ? parsed.signupRequests : [];
      dbState.tickets = Array.isArray(parsed.tickets) ? parsed.tickets : [];
      dbState.settings = parsed.settings || null;
      dbState.activityLogs = Array.isArray(parsed.activityLogs) ? parsed.activityLogs : [];
      return true;
    }
  } catch (err) {
    console.error('⚠️ Error reading resolvehub.json:', err.message);
  }
  return false;
}

function persistDatabaseToDisk() {
  writeQueuePromise = writeQueuePromise.then(() => {
    try {
      const payload = JSON.stringify(dbState, null, 2);
      fs.mkdirSync(path.dirname(SERVER_JSON_PATH), { recursive: true });
      fs.mkdirSync(path.dirname(ROOT_JSON_PATH), { recursive: true });

      const tmpServer = `${SERVER_JSON_PATH}.tmp`;
      fs.writeFileSync(tmpServer, payload, 'utf8');
      fs.renameSync(tmpServer, SERVER_JSON_PATH);

      const tmpRoot = `${ROOT_JSON_PATH}.tmp`;
      fs.writeFileSync(tmpRoot, payload, 'utf8');
      fs.renameSync(tmpRoot, ROOT_JSON_PATH);
    } catch (err) {
      // Fallback direct write if rename across locks fails on Windows
      try {
        const payload = JSON.stringify(dbState, null, 2);
        fs.writeFileSync(SERVER_JSON_PATH, payload, 'utf8');
        fs.writeFileSync(ROOT_JSON_PATH, payload, 'utf8');
      } catch (innerErr) {
        console.error('⚠️ Failed to persist JSON database:', innerErr.message);
      }
    }
  });
  return writeQueuePromise;
}

// Helper to resolve nested property like 'complainant.regNo'
function getNestedValue(obj, keyPath) {
  if (!obj || !keyPath) return undefined;
  if (Object.prototype.hasOwnProperty.call(obj, keyPath)) return obj[keyPath];
  return keyPath.split('.').reduce((acc, part) => (acc && acc[part] !== undefined ? acc[part] : undefined), obj);
}

// Mongo-compatible query matcher for JSON documents
function matchesFilter(doc, filter = {}) {
  if (!filter || Object.keys(filter).length === 0) return true;

  for (const [key, condition] of Object.entries(filter)) {
    if (condition === undefined) continue;

    if (key === '$or' && Array.isArray(condition)) {
      const anyMatch = condition.some(subFilter => matchesFilter(doc, subFilter));
      if (!anyMatch) return false;
      continue;
    }

    if (key === '$and' && Array.isArray(condition)) {
      const allMatch = condition.every(subFilter => matchesFilter(doc, subFilter));
      if (!allMatch) return false;
      continue;
    }

    const val = getNestedValue(doc, key);

    if (condition instanceof RegExp) {
      if (!condition.test(String(val ?? ''))) return false;
      continue;
    }

    if (condition !== null && typeof condition === 'object' && !Array.isArray(condition)) {
      // Operator object ($regex, $in, $ne, $gte, $lte)
      if (condition.$regex !== undefined) {
        const flags = condition.$options || (condition.$regex instanceof RegExp ? condition.$regex.flags : 'i');
        const pattern = condition.$regex instanceof RegExp ? condition.$regex.source : String(condition.$regex);
        const re = new RegExp(pattern, flags);
        if (!re.test(String(val ?? ''))) return false;
      }
      if (condition.$in !== undefined && Array.isArray(condition.$in)) {
        const valLower = String(val ?? '').toLowerCase();
        const matched = condition.$in.some(item => String(item).toLowerCase() === valLower);
        if (!matched) return false;
      }
      if (condition.$ne !== undefined) {
        if (val === condition.$ne) return false;
      }
      if (condition.$gte !== undefined) {
        if (new Date(val) < new Date(condition.$gte)) return false;
      }
      if (condition.$lte !== undefined) {
        if (new Date(val) > new Date(condition.$lte)) return false;
      }
      continue;
    }

    // Direct equality (case-insensitive for status/username/regNo/email)
    if (typeof val === 'string' && typeof condition === 'string') {
      if (['status', 'username', 'regNo', 'email', 'complainant.regNo', 'priority', 'urgency'].includes(key)) {
        if (val.toLowerCase() !== condition.toLowerCase()) return false;
      } else if (val !== condition) {
        return false;
      }
    } else if (val !== condition) {
      return false;
    }
  }

  return true;
}

// Wrap a raw JSON object in a Document instance with `.save()` and `.toObject()`
function wrapDocument(rawObj, collectionKey) {
  if (!rawObj) return null;
  if (!rawObj._id) rawObj._id = rawObj.id || `${collectionKey}-${uuidv4().substring(0, 8)}`;

  Object.defineProperty(rawObj, 'save', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: async function () {
      if (collectionKey === 'settings') {
        dbState.settings = this;
      } else {
        const list = dbState[collectionKey];
        const idx = list.findIndex(item => (item._id && item._id === this._id) || (item.id && item.id === this.id));
        if (idx >= 0) {
          list[idx] = this;
        } else {
          list.unshift(this);
        }
      }
      await persistDatabaseToDisk();
      return this;
    }
  });

  Object.defineProperty(rawObj, 'toObject', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function () {
      return { ...this };
    }
  });

  return rawObj;
}

// Query chain helper supporting `.sort()`, `.limit()`, `.lean()`, and `await` (thenable)
class JsonQuery {
  constructor(collectionKey, filter = {}, isSingle = false) {
    this.collectionKey = collectionKey;
    this.filter = filter;
    this.isSingle = isSingle;
    this.sortSpec = null;
    this.limitCount = null;
    this.isLean = false;
  }

  sort(spec) {
    this.sortSpec = spec;
    return this;
  }

  limit(n) {
    this.limitCount = n;
    return this;
  }

  lean() {
    this.isLean = true;
    return this;
  }

  _execute() {
    if (this.collectionKey === 'settings') {
      const doc = dbState.settings;
      if (!doc) return this.isSingle ? null : [];
      const res = this.isLean ? { ...doc } : wrapDocument(doc, 'settings');
      return this.isSingle ? res : [res];
    }

    const list = dbState[this.collectionKey] || [];
    let matched = list.filter(item => matchesFilter(item, this.filter));

    if (this.sortSpec && matched.length > 1) {
      const [field, dir] = Object.entries(this.sortSpec)[0] || ['createdAt', -1];
      const multiplier = dir === -1 || dir === 'desc' ? -1 : 1;
      matched = [...matched].sort((a, b) => {
        if (field === 'createdAt' || field === 'submittedAt') {
          const timeA = new Date(a.createdAtIso || a.createdAt || a.submittedAt || 0).getTime() || 0;
          const timeB = new Date(b.createdAtIso || b.createdAt || b.submittedAt || 0).getTime() || 0;
          return (timeA - timeB) * multiplier;
        }
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        return (valA > valB ? 1 : valA < valB ? -1 : 0) * multiplier;
      });
    }

    if (this.limitCount && this.limitCount > 0) {
      matched = matched.slice(0, this.limitCount);
    }

    if (this.isSingle) {
      const first = matched[0] || null;
      if (!first) return null;
      return this.isLean ? { ...first } : wrapDocument(first, this.collectionKey);
    }

    return matched.map(item => (this.isLean ? { ...item } : wrapDocument(item, this.collectionKey)));
  }

  then(resolve, reject) {
    try {
      const result = this._execute();
      return Promise.resolve(result).then(resolve, reject);
    } catch (err) {
      return Promise.reject(err).then(resolve, reject);
    }
  }

  catch(reject) {
    return this.then(undefined, reject);
  }
}

function createJsonModel(collectionKey, defaultsFn = () => ({})) {
  function ModelConstructor(data = {}) {
    const base = {
      _id: data._id || `${collectionKey}-${uuidv4().substring(0, 8)}`,
      ...defaultsFn(),
      ...data
    };
    return wrapDocument(base, collectionKey);
  }

  ModelConstructor.find = function (filter = {}) {
    return new JsonQuery(collectionKey, filter, false);
  };

  ModelConstructor.findOne = function (filter = {}) {
    return new JsonQuery(collectionKey, filter, true);
  };

  ModelConstructor.create = async function (data = {}) {
    const doc = new ModelConstructor(data);
    await doc.save();
    return doc;
  };

  ModelConstructor.insertMany = async function (items = []) {
    const created = items.map(item => new ModelConstructor(item));
    if (collectionKey !== 'settings') {
      dbState[collectionKey].push(...created);
    }
    await persistDatabaseToDisk();
    return created;
  };

  ModelConstructor.findOneAndUpdate = async function (filter = {}, update = {}, _options = {}) {
    const existing = await ModelConstructor.findOne(filter);
    const changes = update.$set ? { ...update, ...update.$set } : { ...update };
    delete changes.$set;

    if (existing) {
      Object.assign(existing, changes);
      await existing.save();
      return existing;
    }
    return null;
  };

  ModelConstructor.updateOne = async function (filter = {}, update = {}) {
    const existing = await ModelConstructor.findOne(filter);
    if (!existing) return { modifiedCount: 0 };
    const changes = update.$set ? { ...update.$set } : { ...update };
    Object.assign(existing, changes);
    await existing.save();
    return { modifiedCount: 1 };
  };

  ModelConstructor.findOneAndDelete = async function (filter = {}) {
    const list = dbState[collectionKey] || [];
    const idx = list.findIndex(item => matchesFilter(item, filter));
    if (idx === -1) return null;
    const [removed] = list.splice(idx, 1);
    await persistDatabaseToDisk();
    return removed;
  };

  ModelConstructor.deleteOne = async function (filter = {}) {
    const removed = await ModelConstructor.findOneAndDelete(filter);
    return { deletedCount: removed ? 1 : 0 };
  };

  ModelConstructor.deleteMany = async function (filter = {}) {
    if (!filter || Object.keys(filter).length === 0) {
      const count = (dbState[collectionKey] || []).length;
      dbState[collectionKey] = [];
      await persistDatabaseToDisk();
      return { deletedCount: count };
    }
    const list = dbState[collectionKey] || [];
    const remaining = list.filter(item => !matchesFilter(item, filter));
    const deletedCount = list.length - remaining.length;
    dbState[collectionKey] = remaining;
    await persistDatabaseToDisk();
    return { deletedCount };
  };

  ModelConstructor.countDocuments = async function (filter = {}) {
    const list = dbState[collectionKey] || [];
    return list.filter(item => matchesFilter(item, filter)).length;
  };

  ModelConstructor.distinct = async function (field, filter = {}) {
    const list = (dbState[collectionKey] || []).filter(item => matchesFilter(item, filter));
    const set = new Set();
    list.forEach(item => {
      const val = getNestedValue(item, field);
      if (val !== undefined && val !== null && val !== '') set.add(val);
    });
    return Array.from(set);
  };

  return ModelConstructor;
}

// Create JSON-backed models
const Staff = createJsonModel('staff', () => ({ status: 'ACTIVE', role: 'dept_admin' }));
const User = createJsonModel('users', () => ({ status: 'ACTIVE', role: 'student', failedAttempts: 0 }));
const SignupRequest = createJsonModel('signupRequests', () => ({ status: 'PENDING' }));
const Ticket = createJsonModel('tickets', () => ({
  status: 'Pending',
  priority: 'Medium',
  urgency: 'medium',
  attachments: [],
  timeline: [],
  auditLogs: [],
  createdAtIso: new Date().toISOString()
}));
const ActivityLog = createJsonModel('activityLogs', () => ({
  createdAt: new Date().toISOString()
}));
const SystemSetting = createJsonModel('settings', () => ({
  key: 'global_settings'
}));

// Load immediately on module require so synchronous/early accesses always have data
loadDatabaseFromDisk();

async function logActivity(author, role, action, details) {
  try {
    const newLog = new ActivityLog({
      id: `log-${uuidv4().substring(0, 8)}`,
      timestamp: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }),
      author,
      role,
      action,
      details,
      createdAt: new Date().toISOString()
    });
    await newLog.save();
  } catch (err) {
    console.error('Failed to log activity:', err.message);
  }
}

async function connectAndSeedMongo() {
  const loaded = loadDatabaseFromDisk();
  if (!loaded || dbState.tickets.length < 60 || dbState.users.length < 40) {
    console.log('🌱 Initializing JSON Database with 48 students and 68 complaints...');
    await generateSeedDatabase();
    loadDatabaseFromDisk();
  }

  console.log('================================================================================');
  console.log('📂 JSON DATABASE ENGINE ACTIVE (server/data/resolvehub.json)');
  console.log(`   • Registered Students : ${dbState.users.length} (including 241FA07011 / 241FA07011)`);
  console.log(`   • Total Complaints    : ${dbState.tickets.length} across all departments & categories`);
  console.log(`   • Admin & HOD Accounts: ${dbState.staff.length}`);
  console.log('================================================================================');
}

module.exports = {
  Staff,
  User,
  SignupRequest,
  Ticket,
  ActivityLog,
  SystemSetting,
  uuidv4,
  logActivity,
  connectDB: connectAndSeedMongo,
  connectAndSeedMongo,
  loadDatabaseFromDisk,
  persistDatabaseToDisk
};
