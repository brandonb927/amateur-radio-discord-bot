import { JSONFilePreset } from 'lowdb/node';
import config from './config.js';

const defaultData = {
  scheduledMessages: [],
};

export const db = await JSONFilePreset(`db/${config.db_file}`, defaultData);

/**
 * Returns the next usable id in the given table by getting the greatest
 * key `id` value from array. https://stackoverflow.com/a/34087850
 *
 * @param {*} table lowdb table to query
 * @returns {number}
 */
export const getNextTableId = (table) =>
  table.reduce((prev, current) => (prev && prev.id > current.id ? prev : current)).id + 1;
