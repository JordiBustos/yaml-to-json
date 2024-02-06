import { parseValue, getBeginningSpaces, addKeyValue } from "./utils.js";
import { readFileSync } from "fs";

/**
 * Preprocess the yaml string to remove any comments and whitelines
 * @param {string} yaml_string - The yaml string to preprocess
 * @return {String[]} - The preprocessed yaml string
 */
function preprocess_yaml(yaml_string) {
  if (!yaml_string || typeof yaml_string !== "string") {
    return "";
  }
  return yaml_string
    .split("\n")
    .filter((line) => !line.startsWith("#") && line.trim() !== "");
}

/**
 * Parse the yaml string to get the index of the lines with the same indentation and the position of the parent of each line
 * @param {String[]} yamlArray - The preprocessed yaml string
 * @return {Array[]} - An array containing the index of the lines with the same indentation and the position of the parent of each line
 */
function parseYaml(yamlArray) {
  if (!Array.isArray(yamlArray) || yamlArray.length === 0) {
    return [];
  }

  const allWhitespaces = yamlArray.map((x) => getBeginningSpaces(x));
  const ammountOfIndentationLevels = new Set([...allWhitespaces]).size;
  const indexToIndent = new Array(ammountOfIndentationLevels)
    .fill()
    .map(() => []);
  const positionToParent = new Array(yamlArray.length).fill(0);

  yamlArray.forEach((_, index) => {
    const indent = allWhitespaces[index];
    indexToIndent[indent / 2].push(index);

    indent === 0
      ? (positionToParent[index] = 0)
      : getParent(index, positionToParent, allWhitespaces);
  });

  return [indexToIndent, positionToParent];
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
 * @param {String[]} lines - The preprocessed yaml string
 * @param {number[]} parents - The position of the parent of each line
 * @param {number[]} indexToIndent - The index of the lines with the same indentation *still not used*
 * @return {Object} - The object constructed from the yaml string
 */
function constructObject(lines, parents, indexToIndent) {
  const result = {};
  lines.forEach((line, i) => {
    const parentIndex = parents[i];
    let addArray = false;
    if (lines[i + 1] && lines[i + 1].includes("-")) addArray = true;
    let [key, value] = line.split(/:(.*)/s); // split by the first colon

    if (parentIndex === 0) {
      value = parseValue(value);
      result[key] = !value ? (addArray ? [] : {}) : value;
    } else {
      const parent = lines[parentIndex].split(/:(.*)/s)[0].trim();
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

function main() {
  try {
    const filepath = "src/yamls/example.yml";
    const content = readFileSync(filepath, "utf8");
    const yaml_string = content.toString();
    const yaml_preprocessed = preprocess_yaml(yaml_string);
    const [indexToIndent, positionToParent] = parseYaml(yaml_preprocessed);
    const json = constructObject(
      yaml_preprocessed,
      positionToParent,
      indexToIndent,
    );
    console.log(JSON.stringify(json, null, 2));
  } catch (error) {
    console.error("Something went wrong while reading the file", error);
  }
}

main();
