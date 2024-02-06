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

function parseYaml(yamlArray) {
  const positionToParent = new Array(yamlArray.length).fill(0);

  for (let i = 0; i < yamlArray.length; i++) {
    const line = yamlArray[i];
    const indent = getBeginningSpaces(line);

    if (indent === 0) {
      positionToParent[i] = 0;
      continue;
    }
    getParent(yamlArray, i, positionToParent);
  }

  return positionToParent;
}

function getParent(arr, i, positionToParent) {
  let j = i - 1;
  while (j >= 0) {
    if (getBeginningSpaces(arr[j]) < getBeginningSpaces(arr[i])) {
      positionToParent[i] = j;
      break;
    }
    j--;
  }
}

function getBeginningSpaces(line) {
  return line.search(/\S|$/);
}

function constructObject(lines, parents) {
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
      const parent = lines[parentIndex].split(":");
      const keyValue = line.split(":");
      let value = keyValue === "" ? "" : keyValue[1];
      agregarKeyValue(result, keyValue[0].trim(), parent[0].trim(), value);
    }
  }

  return result;
}

function agregarKeyValue(objeto, key, target, value) {
  if (objeto.hasOwnProperty(target)) {
    objeto[target][key] = value || {};
    return true;
  }

  for (const prop in objeto) {
    if (typeof objeto[prop] === "object") {
      if (agregarKeyValue(objeto[prop], key, target, value)) {
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
    const positionToParent = parseYaml(yaml_preprocessed);
    const json = constructObject(yaml_preprocessed, positionToParent);
    console.log(json);
  } catch (error) {
    console.error("Something went wrong while reading the file", error);
  }
}

main();
