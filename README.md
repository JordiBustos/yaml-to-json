# YAML to JSON converter

# Run

node src/index.js

## JavaScript algorithm to convert valid .yml file into json object.

This JavaScript algorithm converts a valid .yml file into a JSON object. It assumes the input file is valid YAML and can be converted into JSON.

## Example Input

```yaml
version: 2.1

# Define the jobs we want to run for this project
jobs:
  build:
    docker:
      - image: cimg/base2023.03
    steps:
      - checkout: l
      - run: echo "this is the build job"
  test:
    docker2:
      - image: cimg/base
    steps2:
      - checkout: l
      - run: echo "this is the test job"

# Orchestrate our job run sequence
workflows:
  build_and_test:
    jobs2:
      - build
      - test

numbers_and_letters:
  - b
  - 55
```

## Example output

```json
{
  "version": 2.1,
  "jobs": {
    "build": {
      "docker": [
        {
          "image": "cimg/base:2023.03"
        }
      ],
      "steps": [
        "checkout",
        {
          "run": "echo \"this is the build job\""
        }
      ]
    },
    "test": {
      "docker2": [
        {
          "image": "cimg/base:2023.03"
        }
      ],
      "steps2": [
        "checkout",
        {
          "run": "echo \"this is the test job\""
        }
      ]
    }
  },
  "workflows": {
    "build_and_test": {
      "jobs2": ["build", "test"]
    }
  },
  "numbers_and_letters": ["b", 55]
}
```

## TODO

- Support for repeated keys based on indentation.
