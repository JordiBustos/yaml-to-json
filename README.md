# JavaScript algorithm to convert valid .yml file into json object.

## Example

```yml
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
      - build: l
      - test: l
```

## TODO

- Support to repeated keys based on indentation.
