'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _graphql = require('graphql');

var _types = require('./types.js');

var _getColumnType = require('./getColumnType.js');

var _getColumnType2 = _interopRequireDefault(_getColumnType);

var _resolveTableSingle = require('./resolveTableSingle.js');

var _resolveTableSingle2 = _interopRequireDefault(_resolveTableSingle);

var _createConnectionType = require('./createConnectionType.js');

var _createConnectionType2 = _interopRequireDefault(_createConnectionType);

var _createConnectionArgs = require('./createConnectionArgs.js');

var _createConnectionArgs2 = _interopRequireDefault(_createConnectionArgs);

var _resolveConnection = require('./resolveConnection.js');

var _resolveConnection2 = _interopRequireDefault(_resolveConnection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/**
 * Creates the `GraphQLObjectType` for a table.
 *
 * This function is memoized because it will be called often for the same
 * table. Think that both the single and list fields need an instance of the
 * table type. Instead of passing the table type around as a parameter, it is
 * more functional to just memoize this function.
 *
 * @param {Client} client
 * @param {Table} table
 * @returns {GraphQLObjectType}
 */
const createTableType = (0, _lodash.memoize)(table => {
  // If we have no fields, GraphQL will be sad. Make sure we have meaningful
  // fields by erroring if there are no columns.
  if (table.columns.length === 0) {
    throw new Error(`PostgreSQL schema '${ table.schema.name }' contains table '${ table.name }' ` + 'which does not have any columns. To generate a GraphQL schema all ' + 'tables must have at least one column.');
  }

  const primaryKeyColumns = table.getPrimaryKeyColumns();
  const isNode = primaryKeyColumns.length !== 0;

  return new _graphql.GraphQLObjectType({
    // Creates a new type where the name is a PascalCase version of the table
    // name and the description is the associated comment in PostgreSQL.
    name: table.getTypeName(),
    description: table.description,

    // If the table has no primary keys, it shouldn’t implement `Node`.
    interfaces: isNode ? [_types.NodeType] : [],

    isTypeOf: value => value.table === table,

    // Make sure all of our columns have a corresponding field. This is a thunk
    // because `createForeignKeyField` may have a circular dependency.
    fields: () => _extends({}, isNode ? {
      id: {
        type: _graphql.GraphQLID,
        description: `The globally unique identifier for this ${ table.getMarkdownTypeName() }.`,
        resolve: source => (0, _types.toID)(table.name, primaryKeyColumns.map(column => source[column.name]))
      }
    } : {}, (0, _lodash.fromPairs)(table.columns.map(column => [column.getFieldName(), createColumnField(column)])), (0, _lodash.fromPairs)(table.getForeignKeys().map(foreignKey => {
      const columnNames = foreignKey.nativeColumns.map(_ref => {
        let name = _ref.name;
        return name;
      });
      const name = `${ foreignKey.foreignTable.name }_by_${ columnNames.join('_and_') }`;
      return [(0, _lodash.camelCase)(name), createForeignKeyField(foreignKey)];
    })), (0, _lodash.fromPairs)(table.getReverseForeignKeys().map(foreignKey => {
      const columnNames = foreignKey.nativeColumns.map(_ref2 => {
        let name = _ref2.name;
        return name;
      });
      const name = `${ foreignKey.nativeTable.name }_nodes_by_${ columnNames.join('_and_') }`;
      return [(0, _lodash.camelCase)(name), createForeignKeyReverseField(foreignKey)];
    })))
  });
});

exports['default'] = createTableType;

/**
 * Creates a field to be used with `GraphQLObjectType` from a column.
 *
 * @param {Column} column
 * @returns {GraphQLFieldConfig}
 */

const createColumnField = column => ({
  type: (0, _getColumnType2['default'])(column),
  description: column.description,
  resolve: source => source[column.name]
});

/**
 * Creates a field for use with a table type to select a single object
 * referenced by a foreign key.
 *
 * @param {ForeignKey} foreignKey
 * @returns {GraphQLFieldConfig}
 */
const createForeignKeyField = _ref3 => {
  let nativeTable = _ref3.nativeTable;
  let nativeColumns = _ref3.nativeColumns;
  let foreignTable = _ref3.foreignTable;
  let foreignColumns = _ref3.foreignColumns;
  return {
    type: createTableType(foreignTable),
    description: `Queries a single ${ foreignTable.getMarkdownTypeName() } node related to ` + `the ${ nativeTable.getMarkdownTypeName() } type.`,

    resolve: (0, _resolveTableSingle2['default'])(foreignTable, foreignColumns, source => nativeColumns.map(_ref4 => {
      let name = _ref4.name;
      return source[name];
    }))
  };
};

/**
 * Creates a field to be used for selecting a foreign key in the reverse. This
 * will return a connection.
 *
 * @param {ForeignKey} foreignKey
 * @returns {GraphQLFieldConfig}
 */
const createForeignKeyReverseField = _ref5 => {
  let nativeTable = _ref5.nativeTable;
  let nativeColumns = _ref5.nativeColumns;
  let foreignTable = _ref5.foreignTable;
  let foreignColumns = _ref5.foreignColumns;
  return {
    type: (0, _createConnectionType2['default'])(nativeTable),
    description: `Queries and returns a set of ${ nativeTable.getMarkdownTypeName() } ` + `nodes that are related to the ${ foreignTable.getMarkdownTypeName() } source ` + 'node.',

    args: (0, _createConnectionArgs2['default'])(nativeTable, nativeColumns),

    resolve: (0, _resolveConnection2['default'])(nativeTable, source => (0, _lodash.fromPairs)(foreignColumns.map((_ref6, i) => {
      let name = _ref6.name;
      return [nativeColumns[i].name, source[name]];
    })))
  };
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9ncmFwaHFsL2NyZWF0ZVRhYmxlVHlwZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7OztBQUFBOztBQUNBOztBQUNBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7O0FBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWNBLE1BQU0sa0JBQWtCLHFCQUFRLFNBQVM7OztBQUd2QyxNQUFJLE1BQU0sT0FBTixDQUFjLE1BQWQsS0FBeUIsQ0FBN0IsRUFBZ0M7QUFDOUIsVUFBTSxJQUFJLEtBQUosQ0FDSixDQUFDLG1CQUFELEdBQXNCLE1BQU0sTUFBTixDQUFhLElBQW5DLEVBQXdDLGtCQUF4QyxHQUE0RCxNQUFNLElBQWxFLEVBQXVFLEVBQXZFLElBQ0Esb0VBREEsR0FFQSx1Q0FISSxDQUFOO0FBS0Q7O0FBRUQsUUFBTSxvQkFBb0IsTUFBTSxvQkFBTixFQUExQjtBQUNBLFFBQU0sU0FBUyxrQkFBa0IsTUFBbEIsS0FBNkIsQ0FBNUM7O0FBRUEsU0FBTywrQkFBc0I7OztBQUczQixVQUFNLE1BQU0sV0FBTixFQUhxQjtBQUkzQixpQkFBYSxNQUFNLFdBSlE7OztBQU8zQixnQkFBWSxTQUFTLGlCQUFULEdBQXNCLEVBUFA7O0FBUzNCLGNBQVUsU0FBUyxNQUFNLEtBQU4sS0FBZ0IsS0FUUjs7OztBQWEzQixZQUFRLG1CQUdGLFNBQVM7QUFDWCxVQUFJO0FBQ0YsZ0NBREU7QUFFRixxQkFBYSxDQUFDLHdDQUFELEdBQTJDLE1BQU0sbUJBQU4sRUFBM0MsRUFBdUUsQ0FBdkUsQ0FGWDtBQUdGLGlCQUFTLFVBQVUsaUJBQUssTUFBTSxJQUFYLEVBQWlCLGtCQUFrQixHQUFsQixDQUFzQixVQUFVLE9BQU8sT0FBTyxJQUFkLENBQWhDLENBQWpCO0FBSGpCO0FBRE8sS0FBVCxHQU1BLEVBVEUsRUFVSCx1QkFDRCxNQUFNLE9BQU4sQ0FDQyxHQURELENBQ0ssVUFBVSxDQUFDLE9BQU8sWUFBUCxFQUFELEVBQXdCLGtCQUFrQixN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QU8sSUFBUCxDQUF4QixDQUFqQjtBQUFBLEtBQW5CLENBQVYsQ0FGSDtBQVQ2RixHQUFuRTtBQUFBLENBQXJDIiwiZmlsZSI6ImNyZWF0ZVRhYmxlVHlwZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IG1lbW9pemUsIGZyb21QYWlycywgY2FtZWxDYXNlIH0gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IHsgR3JhcGhRTE9iamVjdFR5cGUsIEdyYXBoUUxJRCB9IGZyb20gJ2dyYXBocWwnXG5pbXBvcnQgeyBOb2RlVHlwZSwgdG9JRCB9IGZyb20gJy4vdHlwZXMuanMnXG5pbXBvcnQgZ2V0Q29sdW1uVHlwZSBmcm9tICcuL2dldENvbHVtblR5cGUuanMnXG5pbXBvcnQgcmVzb2x2ZVRhYmxlU2luZ2xlIGZyb20gJy4vcmVzb2x2ZVRhYmxlU2luZ2xlLmpzJ1xuaW1wb3J0IGNyZWF0ZUNvbm5lY3Rpb25UeXBlIGZyb20gJy4vY3JlYXRlQ29ubmVjdGlvblR5cGUuanMnXG5pbXBvcnQgY3JlYXRlQ29ubmVjdGlvbkFyZ3MgZnJvbSAnLi9jcmVhdGVDb25uZWN0aW9uQXJncy5qcydcbmltcG9ydCByZXNvbHZlQ29ubmVjdGlvbiBmcm9tICcuL3Jlc29sdmVDb25uZWN0aW9uLmpzJ1xuXG4vKipcbiAqIENyZWF0ZXMgdGhlIGBHcmFwaFFMT2JqZWN0VHlwZWAgZm9yIGEgdGFibGUuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBpcyBtZW1vaXplZCBiZWNhdXNlIGl0IHdpbGwgYmUgY2FsbGVkIG9mdGVuIGZvciB0aGUgc2FtZVxuICogdGFibGUuIFRoaW5rIHRoYXQgYm90aCB0aGUgc2luZ2xlIGFuZCBsaXN0IGZpZWxkcyBuZWVkIGFuIGluc3RhbmNlIG9mIHRoZVxuICogdGFibGUgdHlwZS4gSW5zdGVhZCBvZiBwYXNzaW5nIHRoZSB0YWJsZSB0eXBlIGFyb3VuZCBhcyBhIHBhcmFtZXRlciwgaXQgaXNcbiAqIG1vcmUgZnVuY3Rpb25hbCB0byBqdXN0IG1lbW9pemUgdGhpcyBmdW5jdGlvbi5cbiAqXG4gKiBAcGFyYW0ge0NsaWVudH0gY2xpZW50XG4gKiBAcGFyYW0ge1RhYmxlfSB0YWJsZVxuICogQHJldHVybnMge0dyYXBoUUxPYmplY3RUeXBlfVxuICovXG5jb25zdCBjcmVhdGVUYWJsZVR5cGUgPSBtZW1vaXplKHRhYmxlID0+IHtcbiAgLy8gSWYgd2UgaGF2ZSBubyBmaWVsZHMsIEdyYXBoUUwgd2lsbCBiZSBzYWQuIE1ha2Ugc3VyZSB3ZSBoYXZlIG1lYW5pbmdmdWxcbiAgLy8gZmllbGRzIGJ5IGVycm9yaW5nIGlmIHRoZXJlIGFyZSBubyBjb2x1bW5zLlxuICBpZiAodGFibGUuY29sdW1ucy5sZW5ndGggPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgUG9zdGdyZVNRTCBzY2hlbWEgJyR7dGFibGUuc2NoZW1hLm5hbWV9JyBjb250YWlucyB0YWJsZSAnJHt0YWJsZS5uYW1lfScgYCArXG4gICAgICAnd2hpY2ggZG9lcyBub3QgaGF2ZSBhbnkgY29sdW1ucy4gVG8gZ2VuZXJhdGUgYSBHcmFwaFFMIHNjaGVtYSBhbGwgJyArXG4gICAgICAndGFibGVzIG11c3QgaGF2ZSBhdCBsZWFzdCBvbmUgY29sdW1uLidcbiAgICApXG4gIH1cblxuICBjb25zdCBwcmltYXJ5S2V5Q29sdW1ucyA9IHRhYmxlLmdldFByaW1hcnlLZXlDb2x1bW5zKClcbiAgY29uc3QgaXNOb2RlID0gcHJpbWFyeUtleUNvbHVtbnMubGVuZ3RoICE9PSAwXG5cbiAgcmV0dXJuIG5ldyBHcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgLy8gQ3JlYXRlcyBhIG5ldyB0eXBlIHdoZXJlIHRoZSBuYW1lIGlzIGEgUGFzY2FsQ2FzZSB2ZXJzaW9uIG9mIHRoZSB0YWJsZVxuICAgIC8vIG5hbWUgYW5kIHRoZSBkZXNjcmlwdGlvbiBpcyB0aGUgYXNzb2NpYXRlZCBjb21tZW50IGluIFBvc3RncmVTUUwuXG4gICAgbmFtZTogdGFibGUuZ2V0VHlwZU5hbWUoKSxcbiAgICBkZXNjcmlwdGlvbjogdGFibGUuZGVzY3JpcHRpb24sXG5cbiAgICAvLyBJZiB0aGUgdGFibGUgaGFzIG5vIHByaW1hcnkga2V5cywgaXQgc2hvdWxkbuKAmXQgaW1wbGVtZW50IGBOb2RlYC5cbiAgICBpbnRlcmZhY2VzOiBpc05vZGUgPyBbTm9kZVR5cGVdIDogW10sXG5cbiAgICBpc1R5cGVPZjogdmFsdWUgPT4gdmFsdWUudGFibGUgPT09IHRhYmxlLFxuXG4gICAgLy8gTWFrZSBzdXJlIGFsbCBvZiBvdXIgY29sdW1ucyBoYXZlIGEgY29ycmVzcG9uZGluZyBmaWVsZC4gVGhpcyBpcyBhIHRodW5rXG4gICAgLy8gYmVjYXVzZSBgY3JlYXRlRm9yZWlnbktleUZpZWxkYCBtYXkgaGF2ZSBhIGNpcmN1bGFyIGRlcGVuZGVuY3kuXG4gICAgZmllbGRzOiAoKSA9PiAoe1xuICAgICAgLy8gSWYgdGhlIHRhYmxlIGlzIGEgbm9kZSwgYWRkIHRoZSBgaWRgIGZpZWxkLiBPdGhlcndpc2UgZG9u4oCZdCBhZGRcbiAgICAgIC8vIGFueXRoaW5nLlxuICAgICAgLi4uKGlzTm9kZSA/IHtcbiAgICAgICAgaWQ6IHtcbiAgICAgICAgICB0eXBlOiBHcmFwaFFMSUQsXG4gICAgICAgICAgZGVzY3JpcHRpb246IGBUaGUgZ2xvYmFsbHkgdW5pcXVlIGlkZW50aWZpZXIgZm9yIHRoaXMgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9LmAsXG4gICAgICAgICAgcmVzb2x2ZTogc291cmNlID0+IHRvSUQodGFibGUubmFtZSwgcHJpbWFyeUtleUNvbHVtbnMubWFwKGNvbHVtbiA9PiBzb3VyY2VbY29sdW1uLm5hbWVdKSksXG4gICAgICAgIH0sXG4gICAgICB9IDoge30pLFxuICAgICAgLi4uZnJvbVBhaXJzKFxuICAgICAgICB0YWJsZS5jb2x1bW5zXG4gICAgICAgIC5tYXAoY29sdW1uID0+IFtjb2x1bW4uZ2V0RmllbGROYW1lKCksIGNyZWF0ZUNvbHVtbkZpZWxkKGNvbHVtbildKVxuICAgICAgKSxcbiAgICAgIC4uLmZyb21QYWlycyhcbiAgICAgICAgdGFibGUuZ2V0Rm9yZWlnbktleXMoKVxuICAgICAgICAubWFwKGZvcmVpZ25LZXkgPT4ge1xuICAgICAgICAgIGNvbnN0IGNvbHVtbk5hbWVzID0gZm9yZWlnbktleS5uYXRpdmVDb2x1bW5zLm1hcCgoeyBuYW1lIH0pID0+IG5hbWUpXG4gICAgICAgICAgY29uc3QgbmFtZSA9IGAke2ZvcmVpZ25LZXkuZm9yZWlnblRhYmxlLm5hbWV9X2J5XyR7Y29sdW1uTmFtZXMuam9pbignX2FuZF8nKX1gXG4gICAgICAgICAgcmV0dXJuIFtjYW1lbENhc2UobmFtZSksIGNyZWF0ZUZvcmVpZ25LZXlGaWVsZChmb3JlaWduS2V5KV1cbiAgICAgICAgfSlcbiAgICAgICksXG4gICAgICAuLi5mcm9tUGFpcnMoXG4gICAgICAgIHRhYmxlLmdldFJldmVyc2VGb3JlaWduS2V5cygpXG4gICAgICAgIC5tYXAoZm9yZWlnbktleSA9PiB7XG4gICAgICAgICAgY29uc3QgY29sdW1uTmFtZXMgPSBmb3JlaWduS2V5Lm5hdGl2ZUNvbHVtbnMubWFwKCh7IG5hbWUgfSkgPT4gbmFtZSlcbiAgICAgICAgICBjb25zdCBuYW1lID0gYCR7Zm9yZWlnbktleS5uYXRpdmVUYWJsZS5uYW1lfV9ub2Rlc19ieV8ke2NvbHVtbk5hbWVzLmpvaW4oJ19hbmRfJyl9YFxuICAgICAgICAgIHJldHVybiBbY2FtZWxDYXNlKG5hbWUpLCBjcmVhdGVGb3JlaWduS2V5UmV2ZXJzZUZpZWxkKGZvcmVpZ25LZXkpXVxuICAgICAgICB9KVxuICAgICAgKSxcbiAgICB9KSxcbiAgfSlcbn0pXG5cbmV4cG9ydCBkZWZhdWx0IGNyZWF0ZVRhYmxlVHlwZVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmaWVsZCB0byBiZSB1c2VkIHdpdGggYEdyYXBoUUxPYmplY3RUeXBlYCBmcm9tIGEgY29sdW1uLlxuICpcbiAqIEBwYXJhbSB7Q29sdW1ufSBjb2x1bW5cbiAqIEByZXR1cm5zIHtHcmFwaFFMRmllbGRDb25maWd9XG4gKi9cbmNvbnN0IGNyZWF0ZUNvbHVtbkZpZWxkID0gY29sdW1uID0+ICh7XG4gIHR5cGU6IGdldENvbHVtblR5cGUoY29sdW1uKSxcbiAgZGVzY3JpcHRpb246IGNvbHVtbi5kZXNjcmlwdGlvbixcbiAgcmVzb2x2ZTogc291cmNlID0+IHNvdXJjZVtjb2x1bW4ubmFtZV0sXG59KVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmaWVsZCBmb3IgdXNlIHdpdGggYSB0YWJsZSB0eXBlIHRvIHNlbGVjdCBhIHNpbmdsZSBvYmplY3RcbiAqIHJlZmVyZW5jZWQgYnkgYSBmb3JlaWduIGtleS5cbiAqXG4gKiBAcGFyYW0ge0ZvcmVpZ25LZXl9IGZvcmVpZ25LZXlcbiAqIEByZXR1cm5zIHtHcmFwaFFMRmllbGRDb25maWd9XG4gKi9cbmNvbnN0IGNyZWF0ZUZvcmVpZ25LZXlGaWVsZCA9ICh7IG5hdGl2ZVRhYmxlLCBuYXRpdmVDb2x1bW5zLCBmb3JlaWduVGFibGUsIGZvcmVpZ25Db2x1bW5zIH0pID0+ICh7XG4gIHR5cGU6IGNyZWF0ZVRhYmxlVHlwZShmb3JlaWduVGFibGUpLFxuICBkZXNjcmlwdGlvbjpcbiAgICBgUXVlcmllcyBhIHNpbmdsZSAke2ZvcmVpZ25UYWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IG5vZGUgcmVsYXRlZCB0byBgICtcbiAgICBgdGhlICR7bmF0aXZlVGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfSB0eXBlLmAsXG5cbiAgcmVzb2x2ZTogcmVzb2x2ZVRhYmxlU2luZ2xlKFxuICAgIGZvcmVpZ25UYWJsZSxcbiAgICBmb3JlaWduQ29sdW1ucyxcbiAgICBzb3VyY2UgPT4gbmF0aXZlQ29sdW1ucy5tYXAoKHsgbmFtZSB9KSA9PiBzb3VyY2VbbmFtZV0pXG4gICksXG59KVxuXG4vKipcbiAqIENyZWF0ZXMgYSBmaWVsZCB0byBiZSB1c2VkIGZvciBzZWxlY3RpbmcgYSBmb3JlaWduIGtleSBpbiB0aGUgcmV2ZXJzZS4gVGhpc1xuICogd2lsbCByZXR1cm4gYSBjb25uZWN0aW9uLlxuICpcbiAqIEBwYXJhbSB7Rm9yZWlnbktleX0gZm9yZWlnbktleVxuICogQHJldHVybnMge0dyYXBoUUxGaWVsZENvbmZpZ31cbiAqL1xuY29uc3QgY3JlYXRlRm9yZWlnbktleVJldmVyc2VGaWVsZCA9ICh7IG5hdGl2ZVRhYmxlLCBuYXRpdmVDb2x1bW5zLCBmb3JlaWduVGFibGUsIGZvcmVpZ25Db2x1bW5zIH0pID0+ICh7XG4gIHR5cGU6IGNyZWF0ZUNvbm5lY3Rpb25UeXBlKG5hdGl2ZVRhYmxlKSxcbiAgZGVzY3JpcHRpb246XG4gICAgYFF1ZXJpZXMgYW5kIHJldHVybnMgYSBzZXQgb2YgJHtuYXRpdmVUYWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IGAgK1xuICAgIGBub2RlcyB0aGF0IGFyZSByZWxhdGVkIHRvIHRoZSAke2ZvcmVpZ25UYWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IHNvdXJjZSBgICtcbiAgICAnbm9kZS4nLFxuXG4gIGFyZ3M6IGNyZWF0ZUNvbm5lY3Rpb25BcmdzKG5hdGl2ZVRhYmxlLCBuYXRpdmVDb2x1bW5zKSxcblxuICByZXNvbHZlOiByZXNvbHZlQ29ubmVjdGlvbihcbiAgICBuYXRpdmVUYWJsZSxcbiAgICBzb3VyY2UgPT4gZnJvbVBhaXJzKGZvcmVpZ25Db2x1bW5zLm1hcCgoeyBuYW1lIH0sIGkpID0+IFtuYXRpdmVDb2x1bW5zW2ldLm5hbWUsIHNvdXJjZVtuYW1lXV0pKVxuICApLFxufSlcbiJdfQ==