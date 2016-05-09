'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _graphql = require('graphql');

var _createNodeQueryField = require('./createNodeQueryField.js');

var _createNodeQueryField2 = _interopRequireDefault(_createNodeQueryField);

var _createQueryFields = require('./createQueryFields.js');

var _createQueryFields2 = _interopRequireDefault(_createQueryFields);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates the Query type for the entire schema. To see the fields created for
 * singular tables refer to `createQueryFields`.
 *
 * @param {Schema} schema
 * @returns {GraphQLObjectType}
 */
const createQueryType = (schema, userSchema) => new _graphql.GraphQLObjectType({
  name: 'RootQuery',
  description: schema.description || 'The entry type for GraphQL queries.',
  fields: _extends({}, schema.tables.map(table => (0, _createQueryFields2['default'])(table)).reduce((0, _lodash.ary)(_lodash.assign, 2), {}))
});

exports['default'] = createQueryType;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL3F1ZXJ5L2NyZWF0ZVF1ZXJ5VHlwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7QUFTQSxNQUFNLGtCQUFrQixDQUFDLE1BQUQsRUFBUyxVQUFULEtBQXdCLCtCQUFzQjtBQUNwRSxRQUFNLFdBRDhEO0FBRXBFLGVBQWEsT0FBTyxXQUFQLElBQXNCLHFDQUZpQztBQUdwRSx1QkFFRSxPQUFPLE1BQVAsQ0FDTyxHQURQLENBQ1csU0FBUyxvQ0FBa0IsS0FBbEIsQ0FEcEIsRUFFTyxNQUZQLENBRWMsaUNBQVksQ0FBWixDQUZkLEVBRThCLEVBRjlCLENBRkY7QUFIb0UsQ0FBdEIsQ0FBaEQ7O3FCQVllLGUiLCJmaWxlIjoiY3JlYXRlUXVlcnlUeXBlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgYXJ5LCBhc3NpZ24gfSBmcm9tICdsb2Rhc2gnXG5pbXBvcnQgeyBHcmFwaFFMT2JqZWN0VHlwZSB9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgY3JlYXRlTm9kZVF1ZXJ5RmllbGQgZnJvbSAnLi9jcmVhdGVOb2RlUXVlcnlGaWVsZC5qcydcbmltcG9ydCBjcmVhdGVRdWVyeUZpZWxkcyBmcm9tICcuL2NyZWF0ZVF1ZXJ5RmllbGRzLmpzJ1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIFF1ZXJ5IHR5cGUgZm9yIHRoZSBlbnRpcmUgc2NoZW1hLiBUbyBzZWUgdGhlIGZpZWxkcyBjcmVhdGVkIGZvclxuICogc2luZ3VsYXIgdGFibGVzIHJlZmVyIHRvIGBjcmVhdGVRdWVyeUZpZWxkc2AuXG4gKlxuICogQHBhcmFtIHtTY2hlbWF9IHNjaGVtYVxuICogQHJldHVybnMge0dyYXBoUUxPYmplY3RUeXBlfVxuICovXG5jb25zdCBjcmVhdGVRdWVyeVR5cGUgPSAoc2NoZW1hLCB1c2VyU2NoZW1hKSA9PiBuZXcgR3JhcGhRTE9iamVjdFR5cGUoe1xuICBuYW1lOiAnUm9vdFF1ZXJ5JyxcbiAgZGVzY3JpcHRpb246IHNjaGVtYS5kZXNjcmlwdGlvbiB8fCAnVGhlIGVudHJ5IHR5cGUgZm9yIEdyYXBoUUwgcXVlcmllcy4nLFxuICBmaWVsZHM6IHtcbiAgICAuLi4oXG4gICAgc2NoZW1hLnRhYmxlc1xuICAgICAgICAgIC5tYXAodGFibGUgPT4gY3JlYXRlUXVlcnlGaWVsZHModGFibGUpKVxuICAgICAgICAgIC5yZWR1Y2UoYXJ5KGFzc2lnbiwgMiksIHt9KVxuICAgICksXG4gIH0sXG59KVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVRdWVyeVR5cGVcbiJdfQ==