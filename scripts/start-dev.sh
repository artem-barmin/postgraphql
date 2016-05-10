#!/bin/bash

babel-watch --watch src \
  src/main.js -- postgres://postgres:postgres@localhost:5432/postgraph_test --development -p 5000 -n 0.0.0.0
