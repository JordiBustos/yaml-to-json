import { readFileSync } from "fs";
import { get } from "http";

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

function getIndentationReferences(yamlArray) {
  const references = {};
  let currentParent = yamlArray[0];

  for (let i = 0; i < yamlArray.length; i++) {
    if (
      !yamlArray[i].includes("-") &&
      !yamlArray[i].endsWith(":") &&
      countWhitespaces(yamlArray[i].split(":")[0]) === 0
    ) {
      const splitted = yamlArray[i].split(":");
      references[splitted[0]] = splitted[1].trim();
      continue;
    }

    const line = yamlArray[i];
    const indentation = countWhitespaces(line);
    const [key, value] = getKeyValueFromLine(line);
    if (indentation === 0) {
      currentParent = key;
      references[currentParent] = {};
    } else {
      references[currentParent][key] = value;
    }
  }

  return references;
}

/**
 * Get the key value pair from the line
 * @param {string} line - The line to get the key value pair
 * @return {string[]} - The key value pair
 */
function getKeyValueFromLine(line) {
  const [key, value] = line.split(":");
  return [key.trim(), value];
}

/**
 * Count the number of whitespaces in the line
 * @param {string} line - The line to count the whitespaces
 * @return {number} - The number of whitespaces
 */
function countWhitespaces(line) {
  return line
    .split(":")[0]
    .split("")
    .filter((char) => char === " ").length;
}

function main() {
  try {
    const filepath = "src/yamls/example.yml";
    const content = readFileSync(filepath, "utf8");
    const yaml_string = content.toString();
    const yaml_preprocessed = preprocess_yaml(yaml_string);
    console.log(getIndentationReferences(yaml_preprocessed));
  } catch (error) {
    console.error("Something went wrong while reading the file", error);
  }
}

main();
