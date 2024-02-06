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
  const allWhitespaces = yamlArray.map((x) => getBeginningSpaces(x));

  const maxIndent = new Set([...allWhitespaces]).size - 1;
  const indexToIndent = new Array(maxIndent + 1).fill().map(() => []);
  const positionToParent = new Array(yamlArray.length).fill(0);

  for (let i = 0; i < yamlArray.length; i++) {
    const indent = allWhitespaces[i];
    indexToIndent[indent / 2].push(i);

    if (indent === 0) {
      positionToParent[i] = 0;
    } else {
      getParent(i, positionToParent, allWhitespaces);
    }
  }

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
 * Get the number of spaces at the beginning of a string
 * @param {string} line - The string to get the number of spaces from
 * @return {number} - The number of spaces at the beginning of the string
 */
function getBeginningSpaces(line) {
  return line.search(/\S|$/);
}

function constructObject(lines, parents, indexToIndent) {
  const result = {};
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parentIndex = parents[i];
    const currentObject = {};

    if (parentIndex === 0) {
      const keyValue = line.split(":");
      result[keyValue[0]] =
        keyValue[1] === "" ? currentObject : keyValue[1].trim();
    } else {
      let addArray = false;
      if (lines[i + 1] && lines[i + 1].includes("-")) {
        addArray = true;
      }

      const parent = lines[parentIndex].split(":")[0].trim();
      const keyValue = line.split(":");
      let value = keyValue === "" ? "" : keyValue[1];

      if (line.includes("-") && !line.includes(":")) {
        value = line.replace("-", "").trim();
      } else if (line.includes("-")) {
        value = {};
        value[keyValue[0].replace("-", "").trim()] = keyValue[1].trim();
      }

      addKeyValue(result, keyValue[0].trim(), parent, value, addArray);
    }
  }

  return result;
}

function addKeyValue(object, key, target, value, addArray = false) {
  if (object.hasOwnProperty(target)) {
    if (Array.isArray(object[target])) {
      object[target].push(value);
    }
    object[target][key] = value || (addArray ? [] : {});
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
