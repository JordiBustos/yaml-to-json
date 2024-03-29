import { writeFile } from "fs";

/**
 * Function to check if a string is a valid number
 * @param {string} str - The string to check if it is a number
 * @return {boolean} - True if the string is a number
 */
export function isNumeric(str) {
  if (typeof str != "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str));
}

/**
 * Get the number of spaces at the beginning of a string
 * @param {string} line - The string to get the number of spaces from
 * @return {number} - The number of spaces at the beginning of the string
 */
export function getBeginningSpaces(line) {
  return line.search(/\S|$/);
}

/**
 * Add a key-value pair into a nested object it is assumed that the key is unique. Otherwise it is added to the first instance of the key
 * @param {object} object - The object to add the key-value pair to
 * @param {string} key - The key to add to the object
 * @param {string} target - The key to add the value to i.e the parent
 * @param {string || object} value - The value to add to the object
 * @retuns {boolean} - True if the key-value pair was added to the object
 */
export function addKeyValue(object, key, target, value, addArray = false) {
  if (object.hasOwnProperty(target)) {
    if (Array.isArray(object[target])) {
      object[target].push(value);
    } else {
      object[target][key] = value || (addArray ? [] : {});
    }
    return true;
  }

  for (const prop in object) {
    if (typeof object[prop] === "object") {
      if (addKeyValue(object[prop], key, target, value, addArray)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Receives a string and returns a boolean, number, or string depending on the input
 * @param {string} value - The string to parse
 * @return {boolean || number || string} - The parsed value
 */
export function parseValue(value) {
  if (value === "true") return true;
  if (value === "false") return false;
  if (isNumeric(value)) return Number(value);
  return value;
}

/**
 * Split a string by the first colon
 * @param {string} line - The string to split
 * @return {string[]} - The string split by the first colon
 */
export function splitByFirstColon(line) {
  return line.split(/:(.*)/s);
}

/**
 * Save the json object to a file
 * @param {string} outputPath - The path to save the json file to
 * @param {Object} json - The json object to save
 * @return {boolean} - True if the json was saved successfully
 */
export function saveJsonToDirectory(outputPath, json) {
  let success = true;
  writeFile(outputPath, JSON.stringify(json, null, 2), (err) => {
    if (err) {
      console.error(err);
      success = false;
    }
  });
  return success;
}
