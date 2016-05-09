'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _getColumnType = require('../getColumnType.js');

var _getColumnType2 = _interopRequireDefault(_getColumnType);

var _createTableType = require('../createTableType.js');

var _createTableType2 = _interopRequireDefault(_createTableType);

var _clientMutationId = require('./clientMutationId.js');

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const getNonNullType = type => type instanceof _graphql.GraphQLNonNull ? type : new _graphql.GraphQLNonNull(type);

/**
 * Creates a mutation which will update a single existing row.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createUpdateMutationField = table => ({
  type: createPayloadType(table),
  description: `Updates a single node of type ${ table.getMarkdownTypeName() }.`,

  args: {
    input: {
      type: new _graphql.GraphQLNonNull(createInputType(table))
    }
  },

  resolve: resolveUpdate(table)
});

exports['default'] = createUpdateMutationField;


const createInputType = table => new _graphql.GraphQLInputObjectType({
  name: `Update${ table.getTypeName() }Input`,
  description: `Locates the ${ table.getMarkdownTypeName() } node to update and specifies some ` + 'new field values. Primary key fields are required to be able to locate ' + 'the node to update.',
  fields: _extends({}, (0, _lodash.fromPairs)(table.getPrimaryKeyColumns().map(column => [column.getFieldName(), {
    type: getNonNullType((0, _getColumnType2['default'])(column)),
    description: `Matches the ${ column.getMarkdownFieldName() } field of the node.`
  }])), (0, _lodash.fromPairs)(table.columns.map(column => [`new${ (0, _lodash.upperFirst)(column.getFieldName()) }`, {
    type: (0, _graphql.getNullableType)((0, _getColumnType2['default'])(column)),
    description: `Updates the node’s ${ column.getMarkdownFieldName() } field with this new value.`
  }])), {
    // And the client mutation id…
    clientMutationId: _clientMutationId.inputClientMutationId
  })
});

const createPayloadType = table => new _graphql.GraphQLObjectType({
  name: `Update${ table.getTypeName() }Payload`,
  description: `Contains the ${ table.getMarkdownTypeName() } node updated by the mutation.`,
  fields: {
    [table.getFieldName()]: {
      type: (0, _createTableType2['default'])(table),
      description: `The updated ${ table.getMarkdownTypeName() }.`,
      resolve: source => source[table.name]
    },
    clientMutationId: _clientMutationId.payloadClientMutationId
  }
});

const resolveUpdate = table => {
  // We use our SQL builder here instead of a prepared statement/data loader
  // solution because this query can get super dynamic.
  const tableSql = table.sql();
  const primaryKeyColumns = table.getPrimaryKeyColumns();

  return (() => {
    var ref = _asyncToGenerator(function* (source, args, _ref) {
      let client = _ref.client;
      const input = args.input;
      const clientMutationId = input.clientMutationId;

      var _ref2 = yield client.queryAsync(tableSql.update((0, _lodash.fromPairs)(table.columns.map(function (column) {
        return [column.name, input[`new${ (0, _lodash.upperFirst)(column.getFieldName()) }`]];
      }).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        let value = _ref4[1];
        return value;
      }))).where((0, _lodash.fromPairs)(primaryKeyColumns.map(function (column) {
        return [column.name, input[column.getFieldName()]];
      }).filter(function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        let value = _ref6[1];
        return value;
      }))).returning(tableSql.star()).toQuery());

      var _ref2$rows = _slicedToArray(_ref2.rows, 1);

      const row = _ref2$rows[0];


      return {
        [table.name]: row ? (0, _lodash.assign)(row, { table }) : null,
        clientMutationId
      };
    });

    return function (_x, _x2, _x3) {
      return ref.apply(this, arguments);
    };
  })();
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL211dGF0aW9uL2NyZWF0ZVVwZGF0ZU11dGF0aW9uRmllbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7Ozs7O0FBT0EsTUFBTSxpQkFBaUIsUUFBUywwQ0FBaUMsSUFBakMsR0FBd0MsNEJBQW1CLElBQW5CLENBQXhFOzs7Ozs7OztBQVFBLE1BQU0sNEJBQTRCLFVBQVU7QUFDMUMsUUFBTSxrQkFBa0IsS0FBbEIsQ0FEb0M7QUFFMUMsZUFBYSxDQUFDLDhCQUFELEdBQWlDLE1BQU0sbUJBQU4sRUFBakMsRUFBNkQsQ0FBN0QsQ0FGNkI7O0FBSTFDLFFBQU07QUFDSixXQUFPO0FBQ0wsWUFBTSw0QkFBbUIsZ0JBQWdCLEtBQWhCLENBQW5CO0FBREQ7QUFESCxHQUpvQzs7QUFVMUMsV0FBUyxjQUFjLEtBQWQ7QUFWaUMsQ0FBVixDQUFsQzs7cUJBYWUseUI7OztBQUVmLE1BQU0sa0JBQWtCLFNBQ3RCLG9DQUEyQjtBQUN6QixRQUFNLENBQUMsTUFBRCxHQUFTLE1BQU0sV0FBTixFQUFULEVBQTZCLEtBQTdCLENBRG1CO0FBRXpCLGVBQ0UsQ0FBQyxZQUFELEdBQWUsTUFBTSxtQkFBTixFQUFmLEVBQTJDLG1DQUEzQyxJQUNBLHlFQURBLEdBRUEscUJBTHVCO0FBTXpCLHVCQUVLLHVCQUNELE1BQU0sb0JBQU4sR0FBNkIsR0FBN0IsQ0FBaUMsVUFBVSxDQUFDLE9BQU8sWUFBUCxFQUFELEVBQXdCO0FBQ2pFLFVBQU0sZUFBZSxnQ0FBYyxNQUFkLENBQWYsQ0FEMkQ7QUFFakUsaUJBQWEsQ0FBQyxZQUFELEdBQWUsT0FBTyxvQkFBUCxFQUFmLEVBQTZDLG1CQUE3QztBQUZvRCxHQUF4QixDQUEzQyxDQURDLENBRkwsRUFTSyx1QkFDRCxNQUFNLE9BQU4sQ0FBYyxHQUFkLENBQWtCLFVBQVUsQ0FBQyxDQUFDLEdBQUQsR0FBTSx3QkFBVyxPQUFPLFlBQVAsRUFBWCxDQUFOLEVBQXdDLEFBQXhDLENBQUQsRUFBNEM7QUFDdEUsVUFBTSw4QkFBZ0IsZ0NBQWMsTUFBZCxDQUFoQixDQURnRTtBQUV0RSxpQkFBYSxDQUFDLG1CQUFELEdBQXNCLE9BQU8sb0JBQVAsRUFBdEIsRUFBb0QsMkJBQXBEO0FBRnlELEdBQTVDLENBQTVCLENBREMsQ0FUTDs7QUFnQkU7QUFoQkY7QUFOeUIsQ0FBM0IsQ0FERjs7QUEyQkEsTUFBTSxvQkFBb0IsU0FDeEIsK0JBQXNCO0FBQ3BCLFFBQU0sQ0FBQyxNQUFELEdBQVMsTUFBTSxXQUFOLEVBQVQsRUFBNkIsT0FBN0IsQ0FEYztBQUVwQixlQUFhLENBQUMsYUFBRCxHQUFnQixNQUFNLG1CQUFOLEVBQWhCLEVBQTRDLDhCQUE1QyxDQUZPO0FBR3BCLFVBQVE7QUFDTixLQUFDLE1BQU0sWUFBTixFQUFELEdBQXdCO0FBQ3RCLFlBQU0sa0NBQWdCLEtBQWhCLENBRGdCO0FBRXRCLG1CQUFhLENBQUMsWUFBRCxHQUFlLE1BQU0sbUJBQU4sRUFBZixFQUEyQyxDQUEzQyxDQUZTO0FBR3RCLGVBQVMsVUFBVSxPQUFPLE1BQU0sSUFBYjtBQUhHLEtBRGxCO0FBTU47QUFOTTtBQUhZLENBQXRCLENBREY7O0FBY0EsTUFBTSxnQkFBZ0IsU0FBUzs7O0FBRzdCLFFBQU0sV0FBVyxNQUFNLEdBQU4sRUFBakI7QUFDQSxRQUFNLG9CQUFvQixNQUFNLG9CQUFOLEVBQTFCOztBQUVBO0FBQUEsZ0NBQU8sV0FBTyxNQUFQLEVBQWUsSUFBZixRQUFvQztBQUFBLFVBQWIsTUFBYSxRQUFiLE1BQWE7QUFBQSxZQUNqQyxLQURpQyxHQUN2QixJQUR1QixDQUNqQyxLQURpQztBQUFBLFlBRWpDLGdCQUZpQyxHQUVaLEtBRlksQ0FFakMsZ0JBRmlDOztBQUFBLGtCQUlqQixNQUFNLE9BQU8sVUFBUCxDQUM1QixTQUNDLE1BREQsQ0FDUSx1QkFDTixNQUFNLE9BQU4sQ0FDQyxHQURELENBQ0s7QUFBQSxlQUFVLENBQUMsT0FBTyxJQUFSLEVBQWMsTUFBTSxDQUFDLEdBQUQsR0FBTSx3QkFBVyxPQUFPLFlBQVAsRUFBWCxDQUFOLEVBQXdDLEFBQXhDLENBQU4sQ0FBZCxDQUFWO0FBQUEsT0FETCxFQUVDLE1BRkQsQ0FFUTtBQUFBOztBQUFBLFlBQUksS0FBSjtBQUFBLGVBQWUsS0FBZjtBQUFBLE9BRlIsQ0FETSxDQURSLEVBTUMsS0FORCxDQU1PLHVCQUNMLGtCQUNDLEdBREQsQ0FDSztBQUFBLGVBQVUsQ0FBQyxPQUFPLElBQVIsRUFBYyxNQUFNLE9BQU8sWUFBUCxFQUFOLENBQWQsQ0FBVjtBQUFBLE9BREwsRUFFQyxNQUZELENBRVE7QUFBQTs7QUFBQSxZQUFJLEtBQUo7QUFBQSxlQUFlLEtBQWY7QUFBQSxPQUZSLENBREssQ0FOUCxFQVdDLFNBWEQsQ0FXVyxTQUFTLElBQVQsRUFYWCxFQVlDLE9BWkQsRUFENEIsQ0FKVzs7QUFBQSw0Q0FJakMsSUFKaUM7O0FBQUEsWUFJMUIsR0FKMEI7OztBQW9CekMsYUFBTztBQUNMLFNBQUMsTUFBTSxJQUFQLEdBQWMsTUFBTSxvQkFBTyxHQUFQLEVBQVksRUFBRSxLQUFGLEVBQVosQ0FBTixHQUErQixJQUR4QztBQUVMO0FBRkssT0FBUDtBQUlELEtBeEJEOztBQUFBO0FBQUE7QUFBQTtBQUFBO0FBeUJELENBL0JEIiwiZmlsZSI6ImNyZWF0ZVVwZGF0ZU11dGF0aW9uRmllbGQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBmcm9tUGFpcnMsIHVwcGVyRmlyc3QsIGFzc2lnbiB9IGZyb20gJ2xvZGFzaCdcbmltcG9ydCBnZXRDb2x1bW5UeXBlIGZyb20gJy4uL2dldENvbHVtblR5cGUuanMnXG5pbXBvcnQgY3JlYXRlVGFibGVUeXBlIGZyb20gJy4uL2NyZWF0ZVRhYmxlVHlwZS5qcydcbmltcG9ydCB7IGlucHV0Q2xpZW50TXV0YXRpb25JZCwgcGF5bG9hZENsaWVudE11dGF0aW9uSWQgfSBmcm9tICcuL2NsaWVudE11dGF0aW9uSWQuanMnXG5cbmltcG9ydCB7XG4gIGdldE51bGxhYmxlVHlwZSxcbiAgR3JhcGhRTE5vbk51bGwsXG4gIEdyYXBoUUxPYmplY3RUeXBlLFxuICBHcmFwaFFMSW5wdXRPYmplY3RUeXBlLFxufSBmcm9tICdncmFwaHFsJ1xuXG5jb25zdCBnZXROb25OdWxsVHlwZSA9IHR5cGUgPT4gKHR5cGUgaW5zdGFuY2VvZiBHcmFwaFFMTm9uTnVsbCA/IHR5cGUgOiBuZXcgR3JhcGhRTE5vbk51bGwodHlwZSkpXG5cbi8qKlxuICogQ3JlYXRlcyBhIG11dGF0aW9uIHdoaWNoIHdpbGwgdXBkYXRlIGEgc2luZ2xlIGV4aXN0aW5nIHJvdy5cbiAqXG4gKiBAcGFyYW0ge1RhYmxlfSB0YWJsZVxuICogQHJldHVybnMge0dyYXBoUUxGaWVsZENvbmZpZ31cbiAqL1xuY29uc3QgY3JlYXRlVXBkYXRlTXV0YXRpb25GaWVsZCA9IHRhYmxlID0+ICh7XG4gIHR5cGU6IGNyZWF0ZVBheWxvYWRUeXBlKHRhYmxlKSxcbiAgZGVzY3JpcHRpb246IGBVcGRhdGVzIGEgc2luZ2xlIG5vZGUgb2YgdHlwZSAke3RhYmxlLmdldE1hcmtkb3duVHlwZU5hbWUoKX0uYCxcblxuICBhcmdzOiB7XG4gICAgaW5wdXQ6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChjcmVhdGVJbnB1dFR5cGUodGFibGUpKSxcbiAgICB9LFxuICB9LFxuXG4gIHJlc29sdmU6IHJlc29sdmVVcGRhdGUodGFibGUpLFxufSlcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlVXBkYXRlTXV0YXRpb25GaWVsZFxuXG5jb25zdCBjcmVhdGVJbnB1dFR5cGUgPSB0YWJsZSA9PlxuICBuZXcgR3JhcGhRTElucHV0T2JqZWN0VHlwZSh7XG4gICAgbmFtZTogYFVwZGF0ZSR7dGFibGUuZ2V0VHlwZU5hbWUoKX1JbnB1dGAsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICBgTG9jYXRlcyB0aGUgJHt0YWJsZS5nZXRNYXJrZG93blR5cGVOYW1lKCl9IG5vZGUgdG8gdXBkYXRlIGFuZCBzcGVjaWZpZXMgc29tZSBgICtcbiAgICAgICduZXcgZmllbGQgdmFsdWVzLiBQcmltYXJ5IGtleSBmaWVsZHMgYXJlIHJlcXVpcmVkIHRvIGJlIGFibGUgdG8gbG9jYXRlICcgK1xuICAgICAgJ3RoZSBub2RlIHRvIHVwZGF0ZS4nLFxuICAgIGZpZWxkczoge1xuICAgICAgLy8gV2UgaW5jbHVkZSBwcmltYXJ5IGtleSBjb2x1bW5zIHRvIHNlbGVjdCBhIHNpbmdsZSByb3cgdG8gdXBkYXRlLlxuICAgICAgLi4uZnJvbVBhaXJzKFxuICAgICAgICB0YWJsZS5nZXRQcmltYXJ5S2V5Q29sdW1ucygpLm1hcChjb2x1bW4gPT4gW2NvbHVtbi5nZXRGaWVsZE5hbWUoKSwge1xuICAgICAgICAgIHR5cGU6IGdldE5vbk51bGxUeXBlKGdldENvbHVtblR5cGUoY29sdW1uKSksXG4gICAgICAgICAgZGVzY3JpcHRpb246IGBNYXRjaGVzIHRoZSAke2NvbHVtbi5nZXRNYXJrZG93bkZpZWxkTmFtZSgpfSBmaWVsZCBvZiB0aGUgbm9kZS5gLFxuICAgICAgICB9XSlcbiAgICAgICksXG4gICAgICAvLyBXZSBpbmNsdWRlIGFsbCB0aGUgb3RoZXIgY29sdW1ucyB0byBhY3R1YWxseSBhbGxvdyB1c2VycyB0byB1cGRhdGUgYSB2YWx1ZS5cbiAgICAgIC4uLmZyb21QYWlycyhcbiAgICAgICAgdGFibGUuY29sdW1ucy5tYXAoY29sdW1uID0+IFtgbmV3JHt1cHBlckZpcnN0KGNvbHVtbi5nZXRGaWVsZE5hbWUoKSl9YCwge1xuICAgICAgICAgIHR5cGU6IGdldE51bGxhYmxlVHlwZShnZXRDb2x1bW5UeXBlKGNvbHVtbikpLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBgVXBkYXRlcyB0aGUgbm9kZeKAmXMgJHtjb2x1bW4uZ2V0TWFya2Rvd25GaWVsZE5hbWUoKX0gZmllbGQgd2l0aCB0aGlzIG5ldyB2YWx1ZS5gLFxuICAgICAgICB9XSksXG4gICAgICApLFxuICAgICAgLy8gQW5kIHRoZSBjbGllbnQgbXV0YXRpb24gaWTigKZcbiAgICAgIGNsaWVudE11dGF0aW9uSWQ6IGlucHV0Q2xpZW50TXV0YXRpb25JZCxcbiAgICB9LFxuICB9KVxuXG5jb25zdCBjcmVhdGVQYXlsb2FkVHlwZSA9IHRhYmxlID0+XG4gIG5ldyBHcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgbmFtZTogYFVwZGF0ZSR7dGFibGUuZ2V0VHlwZU5hbWUoKX1QYXlsb2FkYCxcbiAgICBkZXNjcmlwdGlvbjogYENvbnRhaW5zIHRoZSAke3RhYmxlLmdldE1hcmtkb3duVHlwZU5hbWUoKX0gbm9kZSB1cGRhdGVkIGJ5IHRoZSBtdXRhdGlvbi5gLFxuICAgIGZpZWxkczoge1xuICAgICAgW3RhYmxlLmdldEZpZWxkTmFtZSgpXToge1xuICAgICAgICB0eXBlOiBjcmVhdGVUYWJsZVR5cGUodGFibGUpLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFRoZSB1cGRhdGVkICR7dGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfS5gLFxuICAgICAgICByZXNvbHZlOiBzb3VyY2UgPT4gc291cmNlW3RhYmxlLm5hbWVdLFxuICAgICAgfSxcbiAgICAgIGNsaWVudE11dGF0aW9uSWQ6IHBheWxvYWRDbGllbnRNdXRhdGlvbklkLFxuICAgIH0sXG4gIH0pXG5cbmNvbnN0IHJlc29sdmVVcGRhdGUgPSB0YWJsZSA9PiB7XG4gIC8vIFdlIHVzZSBvdXIgU1FMIGJ1aWxkZXIgaGVyZSBpbnN0ZWFkIG9mIGEgcHJlcGFyZWQgc3RhdGVtZW50L2RhdGEgbG9hZGVyXG4gIC8vIHNvbHV0aW9uIGJlY2F1c2UgdGhpcyBxdWVyeSBjYW4gZ2V0IHN1cGVyIGR5bmFtaWMuXG4gIGNvbnN0IHRhYmxlU3FsID0gdGFibGUuc3FsKClcbiAgY29uc3QgcHJpbWFyeUtleUNvbHVtbnMgPSB0YWJsZS5nZXRQcmltYXJ5S2V5Q29sdW1ucygpXG5cbiAgcmV0dXJuIGFzeW5jIChzb3VyY2UsIGFyZ3MsIHsgY2xpZW50IH0pID0+IHtcbiAgICBjb25zdCB7IGlucHV0IH0gPSBhcmdzXG4gICAgY29uc3QgeyBjbGllbnRNdXRhdGlvbklkIH0gPSBpbnB1dFxuXG4gICAgY29uc3QgeyByb3dzOiBbcm93XSB9ID0gYXdhaXQgY2xpZW50LnF1ZXJ5QXN5bmMoXG4gICAgICB0YWJsZVNxbFxuICAgICAgLnVwZGF0ZShmcm9tUGFpcnMoXG4gICAgICAgIHRhYmxlLmNvbHVtbnNcbiAgICAgICAgLm1hcChjb2x1bW4gPT4gW2NvbHVtbi5uYW1lLCBpbnB1dFtgbmV3JHt1cHBlckZpcnN0KGNvbHVtbi5nZXRGaWVsZE5hbWUoKSl9YF1dKVxuICAgICAgICAuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlKVxuICAgICAgKSlcbiAgICAgIC53aGVyZShmcm9tUGFpcnMoXG4gICAgICAgIHByaW1hcnlLZXlDb2x1bW5zXG4gICAgICAgIC5tYXAoY29sdW1uID0+IFtjb2x1bW4ubmFtZSwgaW5wdXRbY29sdW1uLmdldEZpZWxkTmFtZSgpXV0pXG4gICAgICAgIC5maWx0ZXIoKFssIHZhbHVlXSkgPT4gdmFsdWUpXG4gICAgICApKVxuICAgICAgLnJldHVybmluZyh0YWJsZVNxbC5zdGFyKCkpXG4gICAgICAudG9RdWVyeSgpXG4gICAgKVxuXG4gICAgcmV0dXJuIHtcbiAgICAgIFt0YWJsZS5uYW1lXTogcm93ID8gYXNzaWduKHJvdywgeyB0YWJsZSB9KSA6IG51bGwsXG4gICAgICBjbGllbnRNdXRhdGlvbklkLFxuICAgIH1cbiAgfVxufVxuIl19