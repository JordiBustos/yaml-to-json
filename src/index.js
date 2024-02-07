import { readFileSync } from "fs";
import { stdin as input, stdout as output } from "node:process";
import * as readline from "node:readline/promises";
import {
  addKeyValue,
  getBeginningSpaces,
  parseValue,
  splitByFirstColon,
  saveJsonToDirectory,
} from "./utils.js";

// IIFE to read the yaml path from the user and call the main function
(async () => {
  const rl = readline.createInterface({ input, output });
  while (true) {
    const answer = await rl.question("Insert the yaml path to parse to JSON: ");
    const outputPath = await rl.question(
      "Insert the path where the JSON will be saved: ",
    );
    console.log("Parsing the yaml file...");
    main(answer, outputPath);
    const repeat = await rl.question(
      "Do you want to parse another yaml file? (y/n): ",
    );
    if (repeat.toLowerCase() === "n") {
      console.log("Goodbye...");
      break;
    }
  }
  rl.close();
})();

/**
 * Main function to read the yaml file and parse it to JSON
 * @param {string} filepath
 * @param {string} outputPath
 */
function main(filepath, outputPath) {
  try {
    const content = readFileSync(filepath, "utf8");
    const yaml_string = content.toString();
    const yaml_preprocessed = preprocess_yaml(yaml_string);
    const arrayOfJsons = new Array(yaml_preprocessed.length);
    yaml_preprocessed.forEach((yaml, i) => {
      const positionToParent = parseYaml(yaml);
      arrayOfJsons[i] = constructObject(yaml, positionToParent);
    });

    const allSuccess = arrayOfJsons
      .map((json, i) =>
        saveJsonToDirectory(`${outputPath}${i !== 0 ? i : ""}`, json),
      )
      .every((result) => result === true);
    if (allSuccess)
      console.log(
        "The yaml file was parsed successfully and saved to the output directory",
      );
  } catch (error) {
    console.error("Something went wrong while reading the file", error);
  }
}

/**
 * Preprocess the yaml string to remove any comments and whitelines
 * @param {string} yaml_string - The yaml string to preprocess
 * @return {string[]} - The preprocessed yaml string
 */
function preprocess_yaml(yaml_string) {
  if (!yaml_string || typeof yaml_string !== "string") {
    return "";
  }
  return yaml_string
    .split("---")
    .map((yamlDocument) =>
      yamlDocument
        .split("\n")
        .filter((line) => !line.startsWith("#") && line.trim() !== ""),
    )
    .filter((x) => x.length > 0);
}

/**
 * Parse the yaml string to get the index of the lines with the same indentation and the position of the parent of each line
 * @param {string[]} yamlArray - The preprocessed yaml string
 * @return {Array[]} - An array containing the index of the lines with the same indentation and the position of the parent of each line
 */
function parseYaml(yamlArray) {
  if (!Array.isArray(yamlArray) || yamlArray.length === 0) {
    return [];
  }
  const allWhitespaces = yamlArray.map(getBeginningSpaces);
  const positionToParent = new Array(yamlArray.length).fill(0);

  yamlArray.forEach((_, index) => {
    allWhitespaces[index] === 0
      ? (positionToParent[index] = -1)
      : getParent(index, positionToParent, allWhitespaces);
  });

  return positionToParent;
}

/**
 * Find the parent of the current line i.e the first line with less spaces than the current line going backwards
 * @param {number} i - The index of the current line
 * @param {number[]} positionToParent - The array to store the position of the parent
 * @param {number[]} allWhitespaces - The array containing the number of whitespaces at the beginning of each line
 * @returns {void}
 */
function getParent(i, positionToParent, allWhitespaces) {
  let j = i - 1;
  while (j >= 0) {
    if (allWhitespaces[j] < allWhitespaces[i]) {
      positionToParent[i] = j;
      break;
    }
    j--;
  }
}

/**
 * Construct the object from the yaml string array using the index of the lines with the same indentation and the position of the parent of each line
 * @param {string[]} lines - The preprocessed yaml string
 * @param {number[]} parents - The position of the parent of each line
 * @param {number[]} indexToIndent - The index of the lines with the same indentation *still not used*
 * @return {Object} - The object constructed from the yaml string
 */
function constructObject(lines, parents) {
  if (lines.length === 0) return {};
  if (lines.length !== parents.length) return {};

  const result = {};

  lines.forEach((line, i) => {
    const parentIndex = parents[i];
    let addArray = false;
    if (lines[i + 1] && lines[i + 1].includes("-")) addArray = true;
    let [key, value] = splitByFirstColon(line);

    if (parentIndex === -1) {
      value = parseValue(value);
      result[key] = !value ? (addArray ? [] : {}) : value;
    } else {
      const parent = splitByFirstColon(lines[parentIndex])[0].trim();

      if (line.includes("-")) {
        if (!line.includes(":")) {
          value = parseValue(line.replace("-", "").trim());
        } else {
          const tmpObj = {};
          value = parseValue(value.trim());
          tmpObj[key.replace("-", "").trim()] = value;
          value = tmpObj;
        }
      }
      addKeyValue(result, key.trim(), parent, value, addArray);
    }
  });

  return result;
}
