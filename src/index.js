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

function parseYaml(yamlArr) {}

function getBeginningSpaces(line) {
  return line.search(/\S|$/);
}

function main() {
  try {
    const filepath = "src/yamls/example.yml";
    const content = readFileSync(filepath, "utf8");
    const yaml_string = content.toString();
    const yaml_preprocessed = preprocess_yaml(yaml_string);
    const parsedYaml = parseYaml(yaml_preprocessed);
    console.log(parsedYaml);
  } catch (error) {
    console.error("Something went wrong while reading the file", error);
  }
}

main();
