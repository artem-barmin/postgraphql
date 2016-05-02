#!/bin/bash

babel-watch --watch src \
  src/main.js -- postgres://postgres:postgres@localhost:32769/postgres --schema forum_example --development 
