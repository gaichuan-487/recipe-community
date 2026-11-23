'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createSeedData } = require('./seed');

const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'data');
const DB_PATH = path.join(DATA_DIR, 'db.json');
const SECRET_PATH = path.join(DATA_DIR, '.secret');

fs.mkdirSync(DATA_DIR, { recursive: true });

let db = null;

function ensureDirectory() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  if (typeof stored !== 'string' || !stored.includes(':')) return false;
  const [salt, original] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const known = Buffer.from(original, 'hex');
  if (candidate.length !== known.length) return false;
  return crypto.timingSafeEqual(candidate, known);
}

function makeId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${crypto.randomBytes(3).toString('hex')}`;
}

function saveDb() {
  ensureDirectory();
  const temp = `${DB_PATH}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(db, null, 2), 'utf8');
  fs.renameSync(temp, DB_PATH);
}

function loadDb() {
  if (db) return db;
  ensureDirectory();

  if (fs.existsSync(DB_PATH)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
      if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.recipes)) {
        throw new Error('数据文件结构无效');
      }
      parsed.comments = parsed.comments || [];
      parsed.reviews = parsed.reviews || [];
      db = parsed;
      return db;
    } catch (error) {
      const backup = `${DB_PATH}.broken-${Date.now()}`;
      fs.renameSync(DB_PATH, backup);
      console.warn(`[store] 数据文件读取失败，已备份到 ${backup}，将重新生成示例数据。`);
    }
  }

  db = createSeedData(hashPassword);
  saveDb();
  return db;
}

function getSecret() {
  if (fs.existsSync(SECRET_PATH)) {
    return fs.readFileSync(SECRET_PATH, 'utf8').trim();
  }
  const secret = crypto.randomBytes(48).toString('hex');
  fs.writeFileSync(SECRET_PATH, secret, 'utf8');
  return secret;
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    username: user.username,
    nickname: user.nickname,
    role: user.role,
    avatarColor: user.avatarColor,
    bio: user.bio,
    createdAt: user.createdAt
  };
}

module.exports = {
  DB_PATH,
  ROOT,
  loadDb,
  saveDb,
  hashPassword,
  verifyPassword,
  makeId,
  getSecret,
  publicUser
};
