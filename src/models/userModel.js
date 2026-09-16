const { getDatabase } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserModel {
  /**
   * Find user by email address.
   */
  static async findByEmail(email) {
    const db = getDatabase();
    return await db.get('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
  }

  /**
   * Find user by ID (excludes password_hash).
   */
  static async findById(id) {
    const db = getDatabase();
    return await db.get(
      'SELECT id, username, email, created_at FROM users WHERE id = ?',
      [id]
    );
  }

  /**
   * Create a new user account.
   */
  static async create({ username, email, password }) {
    const db = getDatabase();
    const passwordHash = await bcrypt.hash(password, 10);

    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username.trim(), email.trim().toLowerCase(), passwordHash]
    );

    return await this.findById(result.lastID);
  }

  /**
   * Compare plaintext password against hashed password.
   */
  static async verifyPassword(plainPassword, passwordHash) {
    return await bcrypt.compare(plainPassword, passwordHash);
  }
}

module.exports = UserModel;
