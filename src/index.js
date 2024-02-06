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

function parseYaml(yamlArray) {
  const maxIndent =
    new Set([...yamlArray.map((x) => getBeginningSpaces(x))]).size - 1;
  const indexToIndent = new Array(maxIndent + 1).fill().map(() => []);
  const positionToParent = new Array(yamlArray.length).fill(0);

  for (let i = 0; i < yamlArray.length; i++) {
    const line = yamlArray[i];
    const indent = getBeginningSpaces(line);

    indexToIndent[indent / 2].push(i);

    if (indent === 0) {
      positionToParent[i] = 0;
      continue;
    }
    getParent(yamlArray, i, positionToParent);
  }

  return [indexToIndent, positionToParent];
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

function constructObject(lines, parents, indexToIndent) {
  const result = {};
  console.log(indexToIndent);
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const parentIndex = parents[i];

    const currentObject = {};

    if (parentIndex === 0) {
      const keyValue = line.split(":");
      result[keyValue[0]] =
        keyValue[1] === "" ? currentObject : keyValue[1].trim();
    } else {
      const parent = lines[parentIndex].split(":")[0].trim();
      const keyValue = line.split(":");
      let value = keyValue === "" ? "" : keyValue[1];

      agregarKeyValue(result, keyValue[0].trim(), parent, value);
    }
  }

  return result;
}

function agregarKeyValue(object, key, target, value) {
  if (object.hasOwnProperty(target)) {
    object[target][key] = value || {};
    return true;
  }

  for (const prop in object) {
    if (typeof object[prop] === "object") {
      if (agregarKeyValue(object[prop], key, target, value)) {
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
      indexToIndent
    );
    console.log(json);
  } catch (error) {
    console.error("Something went wrong while reading the file", error);
  }
}

main();
