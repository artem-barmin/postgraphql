'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _graphql = require('graphql');

var _createQueryType = require('./query/createQueryType.js');

var _createQueryType2 = _interopRequireDefault(_createQueryType);

var _createMutationType = require('./mutation/createMutationType.js');

var _createMutationType2 = _interopRequireDefault(_createMutationType);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates a GraphQLSchema from a PostgreSQL schema.
 *
 * @param {Schema} schema
 * @returns {GrpahQLSchema}
 */
const createGraphqlSchema = schema => new _graphql.GraphQLSchema({
  query: (0, _createQueryType2['default'])(schema),
  mutation: (0, _createMutationType2['default'])(schema)
});

exports['default'] = createGraphqlSchema;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL2NyZWF0ZVNjaGVtYS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTs7QUFDQTs7OztBQUNBOzs7Ozs7Ozs7Ozs7QUFRQSxNQUFNLHNCQUF1QixNQUFELElBQVksMkJBQWtCO0FBQ3hELFNBQU8sa0NBQWdCLE1BQWhCLENBRGlEO0FBRXhELFlBQVUscUNBQW1CLE1BQW5CO0FBRjhDLENBQWxCLENBQXhDOztxQkFLZSxtQiIsImZpbGUiOiJjcmVhdGVTY2hlbWEuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBHcmFwaFFMU2NoZW1hIH0gZnJvbSAnZ3JhcGhxbCdcbmltcG9ydCBjcmVhdGVRdWVyeVR5cGUgZnJvbSAnLi9xdWVyeS9jcmVhdGVRdWVyeVR5cGUuanMnXG5pbXBvcnQgY3JlYXRlTXV0YXRpb25UeXBlIGZyb20gJy4vbXV0YXRpb24vY3JlYXRlTXV0YXRpb25UeXBlLmpzJ1xuXG4vKipcbiAqIENyZWF0ZXMgYSBHcmFwaFFMU2NoZW1hIGZyb20gYSBQb3N0Z3JlU1FMIHNjaGVtYS5cbiAqXG4gKiBAcGFyYW0ge1NjaGVtYX0gc2NoZW1hXG4gKiBAcmV0dXJucyB7R3JwYWhRTFNjaGVtYX1cbiAqL1xuY29uc3QgY3JlYXRlR3JhcGhxbFNjaGVtYSA9IChzY2hlbWEpID0+IG5ldyBHcmFwaFFMU2NoZW1hKHtcbiAgcXVlcnk6IGNyZWF0ZVF1ZXJ5VHlwZShzY2hlbWEpLFxuICBtdXRhdGlvbjogY3JlYXRlTXV0YXRpb25UeXBlKHNjaGVtYSksXG59KVxuXG5leHBvcnQgZGVmYXVsdCBjcmVhdGVHcmFwaHFsU2NoZW1hXG4iXX0=