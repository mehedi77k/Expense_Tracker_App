const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { signAccessToken, signRefreshToken, hashToken } = require('../../utils/jwt');

const users = [];
const refreshTokens = [];

function safeUser(user) {
  const { password_hash, ...rest } = user;
  return rest;
}

async function register(payload) {
  const existing = users.find((user) => user.email === payload.email);
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const user = {
    id: users.length + 1,
    name: payload.name,
    email: payload.email,
    password_hash: passwordHash,
    avatar_url: null,
    currency: payload.currency || 'USD',
    timezone: payload.timezone || 'UTC',
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  users.push(user);
  return issueTokens(user);
}

async function login(payload) {
  const user = users.find((item) => item.email === payload.email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const ok = await bcrypt.compare(payload.password, user.password_hash);
  if (!ok) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  return issueTokens(user);
}

function issueTokens(user) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, jti: crypto.randomUUID() });
  refreshTokens.push({ userId: user.id, tokenHash: hashToken(refreshToken) });

  return {
    user: safeUser(user),
    accessToken,
    refreshToken,
  };
}

function refresh(token) {
  const tokenHash = hashToken(token);
  const stored = refreshTokens.find((item) => item.tokenHash === tokenHash);
  if (!stored) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const user = users.find((item) => item.id === stored.userId);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const rotated = issueTokens(user);
  const index = refreshTokens.findIndex((item) => item.tokenHash === tokenHash);
  refreshTokens.splice(index, 1);
  return rotated;
}

function logout(token) {
  const tokenHash = hashToken(token);
  const index = refreshTokens.findIndex((item) => item.tokenHash === tokenHash);
  if (index >= 0) {
    refreshTokens.splice(index, 1);
  }
  return { message: 'Logged out' };
}

function getCurrentUserById(id) {
  const user = users.find((item) => item.id === id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return safeUser(user);
}

module.exports = { register, login, refresh, logout, getCurrentUserById };
