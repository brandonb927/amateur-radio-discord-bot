import { User } from 'discord.js';

/**
 * Returns whether or not a given user has a specific "admin" role
 *
 * @param {User} user Discord user
 * @param {string} role Discord role
 * @returns {boolean}
 */
export function hasRole(user, role = 'Bot Admin') {
  return user.roles.cache.some((r) => r.name === role);
}
