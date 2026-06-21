/**
 * Runtime path alias for @sweetpos/shared-types
 * Redirects the workspace package import to its compiled JS output in dist
 */
const path = require('path');
const Module = require('module');

const SHARED_TYPES_DIST = path.resolve(
  __dirname,
  'dist',
  'packages',
  'shared-types',
  'src',
  'index.js'
);

const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (request === '@sweetpos/shared-types') {
    return SHARED_TYPES_DIST;
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
