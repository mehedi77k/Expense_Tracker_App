const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { QueryTypes } = require('sequelize');
const sequelize = require('../../config/database');
const { signAccessToken, signRefreshToken, hashToken } = require('../../utils/jwt');

function safeUser(user) {
  const { password_hash: _passwordHash, ...rest } = user;
  return rest;
}

function daysFromNow(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
}

async function findUserByEmail(email) {
  return sequelize.query(
    `SELECT id, name, email, password_hash, avatar_url, currency, timezone, is_verified,
            created_at, updated_at
       FROM users
      WHERE email = :email AND deleted_at IS NULL
      LIMIT 1`,
    {
      replacements: { email },
      type: QueryTypes.SELECT,
      plain: true,
    }
  );
}

async function findUserById(id) {
  return sequelize.query(
    `SELECT id, name, email, password_hash, avatar_url, currency, timezone, is_verified,
            created_at, updated_at
       FROM users
      WHERE id = :id AND deleted_at IS NULL
      LIMIT 1`,
    {
      replacements: { id },
      type: QueryTypes.SELECT,
      plain: true,
    }
  );
}

async function register(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const name = String(payload.name || '').trim();
  const password = String(payload.password || '');

  if (!name || !email || password.length < 6) {
    const error = new Error('Name, valid email, and at least 6 character password are required');
    error.status = 400;
    throw error;
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    const error = new Error('Email already in use');
    error.status = 409;
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [userId] = await sequelize.query(
    `INSERT INTO users (name, email, password_hash, currency, timezone, is_verified)
     VALUES (:name, :email, :passwordHash, :currency, :timezone, false)`,
    {
      replacements: {
        name,
        email,
        passwordHash,
        currency: payload.currency || 'USD',
        timezone: payload.timezone || 'UTC',
      },
      type: QueryTypes.INSERT,
    }
  );

  const user = await findUserById(userId);
  return issueTokens(user);
}

async function login(payload) {
  const email = String(payload.email || '').trim().toLowerCase();
  const password = String(payload.password || '');

  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    const error = new Error('Invalid credentials');
    error.status = 401;
    throw error;
  }

  return issueTokens(user);
}

async function issueTokens(user) {
  const jti = crypto.randomUUID();
  const accessToken = signAccessToken({ sub: user.id, email: user.email });
  const refreshToken = signRefreshToken({ sub: user.id, jti });

  await sequelize.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES (:userId, :tokenHash, :expiresAt)`,
    {
      replacements: {
        userId: user.id,
        tokenHash: hashToken(refreshToken),
        expiresAt: daysFromNow(7),
      },
      type: QueryTypes.INSERT,
    }
  );

  return {
    user: safeUser(user),
    accessToken,
    refreshToken,
  };
}

async function refresh(token) {
  if (!token) {
    const error = new Error('Refresh token is required');
    error.status = 400;
    throw error;
  }

  const tokenHash = hashToken(token);
  const stored = await sequelize.query(
    `SELECT id, user_id
       FROM refresh_tokens
      WHERE token_hash = :tokenHash AND expires_at > NOW()
      LIMIT 1`,
    {
      replacements: { tokenHash },
      type: QueryTypes.SELECT,
      plain: true,
    }
  );

  if (!stored) {
    const error = new Error('Invalid refresh token');
    error.status = 401;
    throw error;
  }

  const user = await findUserById(stored.user_id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  await sequelize.query('DELETE FROM refresh_tokens WHERE id = :id', {
    replacements: { id: stored.id },
    type: QueryTypes.DELETE,
  });

  return issueTokens(user);
}

async function logout(token) {
  if (token) {
    await sequelize.query('DELETE FROM refresh_tokens WHERE token_hash = :tokenHash', {
      replacements: { tokenHash: hashToken(token) },
      type: QueryTypes.DELETE,
    });
  }
  return { message: 'Logged out' };
}

async function getCurrentUserById(id) {
  const user = await findUserById(id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }
  return safeUser(user);
}

async function updateUser(id, payload) {
  const fields = [];
  const replacements = { id };

  ['name', 'avatar_url', 'currency', 'timezone'].forEach((field) => {
    if (payload[field] !== undefined) {
      fields.push(`${field} = :${field}`);
      replacements[field] = payload[field];
    }
  });

  if (!fields.length) return getCurrentUserById(id);

  await sequelize.query(
    `UPDATE users SET ${fields.join(', ')}, updated_at = NOW() WHERE id = :id AND deleted_at IS NULL`,
    { replacements, type: QueryTypes.UPDATE }
  );

  return getCurrentUserById(id);
}

async function changePassword(id, payload) {
  const user = await findUserById(id);
  if (!user) {
    const error = new Error('User not found');
    error.status = 404;
    throw error;
  }

  const ok = await bcrypt.compare(String(payload.currentPassword || ''), user.password_hash);
  if (!ok) {
    const error = new Error('Current password is incorrect');
    error.status = 400;
    throw error;
  }

  const newPassword = String(payload.newPassword || '');
  if (newPassword.length < 6) {
    const error = new Error('New password must be at least 6 characters');
    error.status = 400;
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await sequelize.query(
    'UPDATE users SET password_hash = :passwordHash, updated_at = NOW() WHERE id = :id',
    { replacements: { id, passwordHash }, type: QueryTypes.UPDATE }
  );

  await sequelize.query('DELETE FROM refresh_tokens WHERE user_id = :id', {
    replacements: { id },
    type: QueryTypes.DELETE,
  });

  return { message: 'Password changed. Please log in again.' };
}

async function deleteUser(id) {
  await sequelize.query('UPDATE users SET deleted_at = NOW() WHERE id = :id', {
    replacements: { id },
    type: QueryTypes.UPDATE,
  });
  await sequelize.query('DELETE FROM refresh_tokens WHERE user_id = :id', {
    replacements: { id },
    type: QueryTypes.DELETE,
  });
  return { message: 'Account deleted' };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  getCurrentUserById,
  updateUser,
  changePassword,
  deleteUser,
};
