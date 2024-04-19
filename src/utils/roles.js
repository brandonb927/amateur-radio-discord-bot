import { User } from 'discord.js';

export class Role {
  BOT_ADMIN = 'HamBot Admin';
}

/**
 * Returns whether or not a given user has a specific "admin" role
 *
 * @param {User} user Discord user
 * @param {string} role Discord role
 * @returns {boolean}
 */
export function hasRole(user, role = Role.BOT_ADMIN) {
  return user.roles.cache.some((r) => r.name === role);
}
