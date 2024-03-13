import { JSONFilePreset } from 'lowdb/node';

const defaultData = {
  notifications: [],
};

export const db = await JSONFilePreset('db.json', defaultData);

/**
 * Returns the next usable id in the given table by getting the greatest
 * key `id` value from array. https://stackoverflow.com/a/34087850
 *
 * @param {*} table lowdb table to query
 * @returns {number}
 */
export const getNextTableId = (table) =>
  table.reduce((prev, current) => (prev && prev.id > current.id ? prev : current)).id + 1;
