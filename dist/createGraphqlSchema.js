'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getCatalog = require('./postgres/getCatalog.js');

var _getCatalog2 = _interopRequireDefault(_getCatalog);

var _createSchema = require('./graphql/createSchema.js');

var _createSchema2 = _interopRequireDefault(_createSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

/**
 * Creates a GraphQL schema from a PostgreSQL config and a PostgreSQL schema
 * name.
 *
 * @param {Object} pgConfig
 * @param {string} schemaName
 * @returns {GraphQLSchema}
 */
const createGraphqlSchema = (() => {
  var ref = _asyncToGenerator(function* (pgConfig, schemaName) {
    const pgCatalog = yield (0, _getCatalog2['default'])(pgConfig);
    const pgSchema = pgCatalog.getSchema(schemaName);
    if (!pgSchema) throw new Error(`No schema named '${ schemaName }' found.`);
    const graphqlSchema = (0, _createSchema2['default'])(pgSchema);
    return graphqlSchema;
  });

  return function createGraphqlSchema(_x, _x2) {
    return ref.apply(this, arguments);
  };
})();

exports['default'] = createGraphqlSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jcmVhdGVHcmFwaHFsU2NoZW1hLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7QUFVQSxNQUFNO0FBQUEsOEJBQXNCLFdBQU8sUUFBUCxFQUFpQixVQUFqQixFQUFnQztBQUMxRCxVQUFNLFlBQVksTUFBTSw2QkFBVyxRQUFYLENBQXhCO0FBQ0EsVUFBTSxXQUFXLFVBQVUsU0FBVixDQUFvQixVQUFwQixDQUFqQjtBQUNBLFFBQUksQ0FBQyxRQUFMLEVBQ0UsTUFBTSxJQUFJLEtBQUosQ0FBVSxDQUFDLGlCQUFELEdBQW9CLFVBQXBCLEVBQStCLFFBQS9CLENBQVYsQ0FBTjtBQUNGLFVBQU0sZ0JBQWdCLCtCQUFhLFFBQWIsQ0FBdEI7QUFDQSxXQUFPLGFBQVA7QUFDRCxHQVBLOztBQUFBO0FBQUE7QUFBQTtBQUFBLElBQU47O3FCQVNlLG1CIiwiZmlsZSI6ImNyZWF0ZUdyYXBocWxTY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgZ2V0Q2F0YWxvZyBmcm9tICcuL3Bvc3RncmVzL2dldENhdGFsb2cuanMnXG5pbXBvcnQgY3JlYXRlU2NoZW1hIGZyb20gJy4vZ3JhcGhxbC9jcmVhdGVTY2hlbWEuanMnXG5cbi8qKlxuICogQ3JlYXRlcyBhIEdyYXBoUUwgc2NoZW1hIGZyb20gYSBQb3N0Z3JlU1FMIGNvbmZpZyBhbmQgYSBQb3N0Z3JlU1FMIHNjaGVtYVxuICogbmFtZS5cbiAqXG4gKiBAcGFyYW0ge09iamVjdH0gcGdDb25maWdcbiAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWFOYW1lXG4gKiBAcmV0dXJucyB7R3JhcGhRTFNjaGVtYX1cbiAqL1xuY29uc3QgY3JlYXRlR3JhcGhxbFNjaGVtYSA9IGFzeW5jIChwZ0NvbmZpZywgc2NoZW1hTmFtZSkgPT4ge1xuICBjb25zdCBwZ0NhdGFsb2cgPSBhd2FpdCBnZXRDYXRhbG9nKHBnQ29uZmlnKVxuICBjb25zdCBwZ1NjaGVtYSA9IHBnQ2F0YWxvZy5nZXRTY2hlbWEoc2NoZW1hTmFtZSlcbiAgaWYgKCFwZ1NjaGVtYSlcbiAgICB0aHJvdyBuZXcgRXJyb3IoYE5vIHNjaGVtYSBuYW1lZCAnJHtzY2hlbWFOYW1lfScgZm91bmQuYClcbiAgY29uc3QgZ3JhcGhxbFNjaGVtYSA9IGNyZWF0ZVNjaGVtYShwZ1NjaGVtYSlcbiAgcmV0dXJuIGdyYXBocWxTY2hlbWFcbn1cblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlR3JhcGhxbFNjaGVtYVxuIl19