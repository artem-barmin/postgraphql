#!/bin/bash

babel-watch --watch src \
  src/main.js -- postgres://postgres:postgres@localhost:5432/political --development -p 5000 -n 0.0.0.0
