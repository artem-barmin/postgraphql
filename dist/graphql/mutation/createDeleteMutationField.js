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
 * Creates a mutation which will delete a single existing row.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createDeleteMutationField = table => ({
  type: createPayloadType(table),
  description: `Deletes a single node of type ${ table.getMarkdownTypeName() }.`,

  args: {
    input: {
      type: new _graphql.GraphQLNonNull(createInputType(table))
    }
  },

  resolve: resolveDelete(table)
});

exports['default'] = createDeleteMutationField;


const createInputType = table => new _graphql.GraphQLInputObjectType({
  name: `Delete${ table.getTypeName() }Input`,
  description: `Locates the single ${ table.getMarkdownTypeName() } node to delete using ` + 'its required primary key fields.',
  fields: _extends({}, (0, _lodash.fromPairs)(table.getPrimaryKeyColumns().map(column => [column.getFieldName(), {
    type: getNonNullType((0, _getColumnType2['default'])(column)),
    description: `Matches the ${ column.getMarkdownFieldName() } field of the node.`
  }])), {
    clientMutationId: _clientMutationId.inputClientMutationId
  })
});

const createPayloadType = table => new _graphql.GraphQLObjectType({
  name: `Delete${ table.getTypeName() }Payload`,
  description: `Contains the ${ table.getMarkdownTypeName() } node deleted by the mutation.`,
  fields: {
    [table.getFieldName()]: {
      type: (0, _createTableType2['default'])(table),
      description: `The deleted ${ table.getMarkdownTypeName() }.`,
      resolve: source => source[table.name]
    },
    clientMutationId: _clientMutationId.payloadClientMutationId
  }
});

const resolveDelete = table => {
  const tableSql = table.sql();
  const primaryKeyColumns = table.getPrimaryKeyColumns();

  return (() => {
    var ref = _asyncToGenerator(function* (source, args, _ref) {
      let client = _ref.client;
      const input = args.input;
      const clientMutationId = input.clientMutationId;

      var _ref2 = yield client.queryAsync(tableSql['delete']().where((0, _lodash.fromPairs)(primaryKeyColumns.map(function (column) {
        return [column.name, input[column.getFieldName()]];
      }).filter(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        let value = _ref4[1];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9ncmFwaHFsL211dGF0aW9uL2NyZWF0ZURlbGV0ZU11dGF0aW9uRmllbGQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7OztBQUFBOztBQUNBOzs7O0FBQ0E7Ozs7QUFDQTs7QUFFQTs7Ozs7O0FBTUEsTUFBTSxpQkFBaUIsUUFBUywwQ0FBaUMsSUFBakMsR0FBd0MsNEJBQW1CLElBQW5CLENBQXhFOzs7Ozs7OztBQVFBLE1BQU0sNEJBQTRCLFVBQVU7QUFDMUMsUUFBTSxrQkFBa0IsS0FBbEIsQ0FEb0M7QUFFMUMsZUFBYSxDQUFDLDhCQUFELEdBQWlDLE1BQU0sbUJBQU4sRUFBakMsRUFBNkQsQ0FBN0QsQ0FGNkI7O0FBSTFDLFFBQU07QUFDSixXQUFPO0FBQ0wsWUFBTSw0QkFBbUIsZ0JBQWdCLEtBQWhCLENBQW5CO0FBREQ7QUFESCxHQUpvQzs7QUFVMUMsV0FBUyxjQUFjLEtBQWQ7QUFWaUMsQ0FBVixDQUFsQzs7cUJBYWUseUI7OztBQUVmLE1BQU0sa0JBQWtCLFNBQ3RCLG9DQUEyQjtBQUN6QixRQUFNLENBQUMsTUFBRCxHQUFTLE1BQU0sV0FBTixFQUFULEVBQTZCLEtBQTdCLENBRG1CO0FBRXpCLGVBQ0UsQ0FBQyxtQkFBRCxHQUFzQixNQUFNLG1CQUFOLEVBQXRCLEVBQWtELHNCQUFsRCxJQUNBLGtDQUp1QjtBQUt6Qix1QkFDSyx1QkFDRCxNQUFNLG9CQUFOLEdBQTZCLEdBQTdCLENBQWlDLFVBQVUsQ0FBQyxPQUFPLFlBQVAsRUFBRCxFQUF3QjtBQUNqRSxVQUFNLGVBQWUsZ0NBQWMsTUFBZCxDQUFmLENBRDJEO0FBRWpFLGlCQUFhLENBQUMsWUFBRCxHQUFlLE9BQU8sb0JBQVAsRUFBZixFQUE2QyxtQkFBN0M7QUFGb0QsR0FBeEIsQ0FBM0MsQ0FEQyxDQURMO0FBT0U7QUFQRjtBQUx5QixDQUEzQixDQURGOztBQWlCQSxNQUFNLG9CQUFvQixTQUN4QiwrQkFBc0I7QUFDcEIsUUFBTSxDQUFDLE1BQUQsR0FBUyxNQUFNLFdBQU4sRUFBVCxFQUE2QixPQUE3QixDQURjO0FBRXBCLGVBQWEsQ0FBQyxhQUFELEdBQWdCLE1BQU0sbUJBQU4sRUFBaEIsRUFBNEMsOEJBQTVDLENBRk87QUFHcEIsVUFBUTtBQUNOLEtBQUMsTUFBTSxZQUFOLEVBQUQsR0FBd0I7QUFDdEIsWUFBTSxrQ0FBZ0IsS0FBaEIsQ0FEZ0I7QUFFdEIsbUJBQWEsQ0FBQyxZQUFELEdBQWUsTUFBTSxtQkFBTixFQUFmLEVBQTJDLENBQTNDLENBRlM7QUFHdEIsZUFBUyxVQUFVLE9BQU8sTUFBTSxJQUFiO0FBSEcsS0FEbEI7QUFNTjtBQU5NO0FBSFksQ0FBdEIsQ0FERjs7QUFjQSxNQUFNLGdCQUFnQixTQUFTO0FBQzdCLFFBQU0sV0FBVyxNQUFNLEdBQU4sRUFBakI7QUFDQSxRQUFNLG9CQUFvQixNQUFNLG9CQUFOLEVBQTFCOztBQUVBO0FBQUEsZ0NBQU8sV0FBTyxNQUFQLEVBQWUsSUFBZixRQUFvQztBQUFBLFVBQWIsTUFBYSxRQUFiLE1BQWE7QUFBQSxZQUNqQyxLQURpQyxHQUN2QixJQUR1QixDQUNqQyxLQURpQztBQUFBLFlBRWpDLGdCQUZpQyxHQUVaLEtBRlksQ0FFakMsZ0JBRmlDOztBQUFBLGtCQUlqQixNQUFNLE9BQU8sVUFBUCxDQUM1QixxQkFFQyxLQUZELENBRU8sdUJBQ0wsa0JBQ0MsR0FERCxDQUNLO0FBQUEsZUFBVSxDQUFDLE9BQU8sSUFBUixFQUFjLE1BQU0sT0FBTyxZQUFQLEVBQU4sQ0FBZCxDQUFWO0FBQUEsT0FETCxFQUVDLE1BRkQsQ0FFUTtBQUFBOztBQUFBLFlBQUksS0FBSjtBQUFBLGVBQWUsS0FBZjtBQUFBLE9BRlIsQ0FESyxDQUZQLEVBT0MsU0FQRCxDQU9XLFNBQVMsSUFBVCxFQVBYLEVBUUMsT0FSRCxFQUQ0QixDQUpXOztBQUFBLDRDQUlqQyxJQUppQzs7QUFBQSxZQUkxQixHQUowQjs7O0FBZ0J6QyxhQUFPO0FBQ0wsU0FBQyxNQUFNLElBQVAsR0FBYyxNQUFNLG9CQUFPLEdBQVAsRUFBWSxFQUFFLEtBQUYsRUFBWixDQUFOLEdBQStCLElBRHhDO0FBRUw7QUFGSyxPQUFQO0FBSUQsS0FwQkQ7O0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFxQkQsQ0F6QkQiLCJmaWxlIjoiY3JlYXRlRGVsZXRlTXV0YXRpb25GaWVsZC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZyb21QYWlycywgYXNzaWduIH0gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IGdldENvbHVtblR5cGUgZnJvbSAnLi4vZ2V0Q29sdW1uVHlwZS5qcydcbmltcG9ydCBjcmVhdGVUYWJsZVR5cGUgZnJvbSAnLi4vY3JlYXRlVGFibGVUeXBlLmpzJ1xuaW1wb3J0IHsgaW5wdXRDbGllbnRNdXRhdGlvbklkLCBwYXlsb2FkQ2xpZW50TXV0YXRpb25JZCB9IGZyb20gJy4vY2xpZW50TXV0YXRpb25JZC5qcydcblxuaW1wb3J0IHtcbiAgR3JhcGhRTE5vbk51bGwsXG4gIEdyYXBoUUxPYmplY3RUeXBlLFxuICBHcmFwaFFMSW5wdXRPYmplY3RUeXBlLFxufSBmcm9tICdncmFwaHFsJ1xuXG5jb25zdCBnZXROb25OdWxsVHlwZSA9IHR5cGUgPT4gKHR5cGUgaW5zdGFuY2VvZiBHcmFwaFFMTm9uTnVsbCA/IHR5cGUgOiBuZXcgR3JhcGhRTE5vbk51bGwodHlwZSkpXG5cbi8qKlxuICogQ3JlYXRlcyBhIG11dGF0aW9uIHdoaWNoIHdpbGwgZGVsZXRlIGEgc2luZ2xlIGV4aXN0aW5nIHJvdy5cbiAqXG4gKiBAcGFyYW0ge1RhYmxlfSB0YWJsZVxuICogQHJldHVybnMge0dyYXBoUUxGaWVsZENvbmZpZ31cbiAqL1xuY29uc3QgY3JlYXRlRGVsZXRlTXV0YXRpb25GaWVsZCA9IHRhYmxlID0+ICh7XG4gIHR5cGU6IGNyZWF0ZVBheWxvYWRUeXBlKHRhYmxlKSxcbiAgZGVzY3JpcHRpb246IGBEZWxldGVzIGEgc2luZ2xlIG5vZGUgb2YgdHlwZSAke3RhYmxlLmdldE1hcmtkb3duVHlwZU5hbWUoKX0uYCxcblxuICBhcmdzOiB7XG4gICAgaW5wdXQ6IHtcbiAgICAgIHR5cGU6IG5ldyBHcmFwaFFMTm9uTnVsbChjcmVhdGVJbnB1dFR5cGUodGFibGUpKSxcbiAgICB9LFxuICB9LFxuXG4gIHJlc29sdmU6IHJlc29sdmVEZWxldGUodGFibGUpLFxufSlcblxuZXhwb3J0IGRlZmF1bHQgY3JlYXRlRGVsZXRlTXV0YXRpb25GaWVsZFxuXG5jb25zdCBjcmVhdGVJbnB1dFR5cGUgPSB0YWJsZSA9PlxuICBuZXcgR3JhcGhRTElucHV0T2JqZWN0VHlwZSh7XG4gICAgbmFtZTogYERlbGV0ZSR7dGFibGUuZ2V0VHlwZU5hbWUoKX1JbnB1dGAsXG4gICAgZGVzY3JpcHRpb246XG4gICAgICBgTG9jYXRlcyB0aGUgc2luZ2xlICR7dGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfSBub2RlIHRvIGRlbGV0ZSB1c2luZyBgICtcbiAgICAgICdpdHMgcmVxdWlyZWQgcHJpbWFyeSBrZXkgZmllbGRzLicsXG4gICAgZmllbGRzOiB7XG4gICAgICAuLi5mcm9tUGFpcnMoXG4gICAgICAgIHRhYmxlLmdldFByaW1hcnlLZXlDb2x1bW5zKCkubWFwKGNvbHVtbiA9PiBbY29sdW1uLmdldEZpZWxkTmFtZSgpLCB7XG4gICAgICAgICAgdHlwZTogZ2V0Tm9uTnVsbFR5cGUoZ2V0Q29sdW1uVHlwZShjb2x1bW4pKSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogYE1hdGNoZXMgdGhlICR7Y29sdW1uLmdldE1hcmtkb3duRmllbGROYW1lKCl9IGZpZWxkIG9mIHRoZSBub2RlLmAsXG4gICAgICAgIH1dKVxuICAgICAgKSxcbiAgICAgIGNsaWVudE11dGF0aW9uSWQ6IGlucHV0Q2xpZW50TXV0YXRpb25JZCxcbiAgICB9LFxuICB9KVxuXG5jb25zdCBjcmVhdGVQYXlsb2FkVHlwZSA9IHRhYmxlID0+XG4gIG5ldyBHcmFwaFFMT2JqZWN0VHlwZSh7XG4gICAgbmFtZTogYERlbGV0ZSR7dGFibGUuZ2V0VHlwZU5hbWUoKX1QYXlsb2FkYCxcbiAgICBkZXNjcmlwdGlvbjogYENvbnRhaW5zIHRoZSAke3RhYmxlLmdldE1hcmtkb3duVHlwZU5hbWUoKX0gbm9kZSBkZWxldGVkIGJ5IHRoZSBtdXRhdGlvbi5gLFxuICAgIGZpZWxkczoge1xuICAgICAgW3RhYmxlLmdldEZpZWxkTmFtZSgpXToge1xuICAgICAgICB0eXBlOiBjcmVhdGVUYWJsZVR5cGUodGFibGUpLFxuICAgICAgICBkZXNjcmlwdGlvbjogYFRoZSBkZWxldGVkICR7dGFibGUuZ2V0TWFya2Rvd25UeXBlTmFtZSgpfS5gLFxuICAgICAgICByZXNvbHZlOiBzb3VyY2UgPT4gc291cmNlW3RhYmxlLm5hbWVdLFxuICAgICAgfSxcbiAgICAgIGNsaWVudE11dGF0aW9uSWQ6IHBheWxvYWRDbGllbnRNdXRhdGlvbklkLFxuICAgIH0sXG4gIH0pXG5cbmNvbnN0IHJlc29sdmVEZWxldGUgPSB0YWJsZSA9PiB7XG4gIGNvbnN0IHRhYmxlU3FsID0gdGFibGUuc3FsKClcbiAgY29uc3QgcHJpbWFyeUtleUNvbHVtbnMgPSB0YWJsZS5nZXRQcmltYXJ5S2V5Q29sdW1ucygpXG5cbiAgcmV0dXJuIGFzeW5jIChzb3VyY2UsIGFyZ3MsIHsgY2xpZW50IH0pID0+IHtcbiAgICBjb25zdCB7IGlucHV0IH0gPSBhcmdzXG4gICAgY29uc3QgeyBjbGllbnRNdXRhdGlvbklkIH0gPSBpbnB1dFxuXG4gICAgY29uc3QgeyByb3dzOiBbcm93XSB9ID0gYXdhaXQgY2xpZW50LnF1ZXJ5QXN5bmMoXG4gICAgICB0YWJsZVNxbFxuICAgICAgLmRlbGV0ZSgpXG4gICAgICAud2hlcmUoZnJvbVBhaXJzKFxuICAgICAgICBwcmltYXJ5S2V5Q29sdW1uc1xuICAgICAgICAubWFwKGNvbHVtbiA9PiBbY29sdW1uLm5hbWUsIGlucHV0W2NvbHVtbi5nZXRGaWVsZE5hbWUoKV1dKVxuICAgICAgICAuZmlsdGVyKChbLCB2YWx1ZV0pID0+IHZhbHVlKVxuICAgICAgKSlcbiAgICAgIC5yZXR1cm5pbmcodGFibGVTcWwuc3RhcigpKVxuICAgICAgLnRvUXVlcnkoKVxuICAgIClcblxuICAgIHJldHVybiB7XG4gICAgICBbdGFibGUubmFtZV06IHJvdyA/IGFzc2lnbihyb3csIHsgdGFibGUgfSkgOiBudWxsLFxuICAgICAgY2xpZW50TXV0YXRpb25JZCxcbiAgICB9XG4gIH1cbn1cbiJdfQ==