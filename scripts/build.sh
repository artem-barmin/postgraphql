#!/bin/bash

babel src --out-dir dist
cp -v node_modules/ng-admin/build/ng-admin.min.js public/admin/ng-admin.min.js
cp -v node_modules/ng-admin/build/ng-admin.min.css public/admin/ng-admin.min.css
