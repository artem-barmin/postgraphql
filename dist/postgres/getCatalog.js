'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _lodash = require('lodash');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _pg = require('pg');

var _pg2 = _interopRequireDefault(_pg);

var _catalog = require('./catalog.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new _bluebird2['default'](function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return _bluebird2['default'].resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const getRawSchemas = (0, _lodash.memoize)(client => client.queryAsync(`
    select
      n.oid as "_oid",
      n.nspname as "name",
      d.description as "description"
    from
      pg_catalog.pg_namespace as n
      left join pg_catalog.pg_description as d on d.objoid = n.oid and d.objsubid = 0
    where
      n.nspname not in ('pg_catalog', 'information_schema')
  `).then(_ref => {
  let rows = _ref.rows;
  return rows;
}));

/*
 * Selects rows for things to be treated as tables by PostGraphQL.
 *
 * Note that the `relkind in (…)` expression in the where clause of the
 * statement filters for the following:
 *
 * - 'r': Tables.
 * - 'v': Views.
 * - 'm': Materialized views.
 * - 'f': Foreign tables.
 */
const getRawTables = (0, _lodash.memoize)(client => client.queryAsync(`
    select
      c.oid as "_oid",
      n.nspname as "schemaName",
      c.relname as "name",
      d.description as "description"
    from
      pg_catalog.pg_class as c
      left join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
      left join pg_catalog.pg_description as d on d.objoid = c.oid and d.objsubid = 0
    where
      n.nspname not in ('pg_catalog', 'information_schema') and
      c.relkind in ('r', 'v', 'm', 'f')
  `).then(_ref2 => {
  let rows = _ref2.rows;
  return rows;
}));

const getRawColumns = (0, _lodash.memoize)(client => client.queryAsync(`
    select
      a.attnum as "_num",
      n.nspname as "schemaName",
      c.relname as "tableName",
      a.attname as "name",
      d.description as "description",
      a.atttypid as "type",
      not(a.attnotnull) as "isNullable",
      cp.oid is not null as "isPrimaryKey",
      a.atthasdef as "hasDefault"
    from
      pg_catalog.pg_attribute as a
      left join pg_catalog.pg_class as c on c.oid = a.attrelid
      left join pg_catalog.pg_namespace as n on n.oid = c.relnamespace
      left join pg_catalog.pg_description as d on d.objoid = c.oid and d.objsubid = a.attnum
      left join pg_catalog.pg_constraint as cp on
        cp.contype = 'p' and
        cp.conrelid = a.attrelid and
        cp.conkey::int[] @> array[a.attnum::int]
    where
      n.nspname not in ('pg_catalog', 'information_schema') and
      c.relkind in ('r', 'v', 'm', 'f') and
      a.attnum > 0 and
      not a.attisdropped
    order by
      n.nspname, c.relname, a.attnum;
  `).then(_ref3 => {
  let rows = _ref3.rows;
  return rows;
}));

const getRawEnums = (0, _lodash.memoize)(client => client.queryAsync(`
    select
      t.oid as "_oid",
      n.nspname as "schemaName",
      t.typname as "name",
      array(
        select
          e.enumlabel::text
        from
          pg_catalog.pg_enum as e
        where
          e.enumtypid = t.oid
      ) as "variants"
    from
      pg_catalog.pg_type as t
      left join pg_catalog.pg_namespace as n on n.oid = t.typnamespace
    where
      t.typtype = 'e';
  `).then(_ref4 => {
  let rows = _ref4.rows;
  return rows;
}));

const getRawForeignKeys = (0, _lodash.memoize)(client => client.queryAsync(`
    select
      c.conrelid as "nativeTableOid",
      c.conkey as "nativeColumnNums",
      c.confrelid as "foreignTableOid",
      c.confkey as "foreignColumnNums"
    from
      pg_catalog.pg_constraint as c
    where
      c.contype = 'f'
  `).then(_ref5 => {
  let rows = _ref5.rows;
  return rows;
}));

/**
 * Gets an instance of `Catalog` for the given PostgreSQL configuration.
 *
 * @param {Object} pgConfig
 * @returns {Catalog}
 */
const getCatalog = (() => {
  var ref = _asyncToGenerator(function* (pgConfig) {
    const client = yield _pg2['default'].connectAsync(pgConfig);
    const catalog = new _catalog.Catalog({ pgConfig });
    const schemas = yield getSchemas(client, catalog);
    catalog.schemas = schemas;
    const foreignKeys = yield getForeignKeys(client, catalog);
    catalog.foreignKeys = foreignKeys;
    client.end();
    return catalog;
  });

  return function getCatalog(_x) {
    return ref.apply(this, arguments);
  };
})();

exports['default'] = getCatalog;


const getSchemas = (client, catalog) =>
// Get the raw schemas.
getRawSchemas(client).map(row => new _catalog.Schema(_extends({ catalog }, row)))
// Get tables, set the tables property, return schema so that it is what
// actually gets resolved.
.map(schema => _bluebird2['default'].join(getTables(client, schema), getEnums(client, schema), (tables, enums) => (0, _lodash.assign)(schema, { tables, enums })));

const getTables = (client, schema) =>
// Get the raw tables. This function is cached because `getTables` will be
// called once for every `schema`.
getRawTables(client)
// Only get tables for the passed `schema`.
.filter(_ref6 => {
  let schemaName = _ref6.schemaName;
  return schema.name === schemaName;
}).map(row => new _catalog.Table(_extends({ schema }, row)))
// Get columns, set the columns property, return table so that it is what
// actually gets resolved.
.map(table => _bluebird2['default'].join(getColumns(client, table), columns => (0, _lodash.assign)(table, { columns })));

const getColumns = (client, table) =>
// Get the raw columns. This function is cached because `getColumns` will be
// called once for every `table`.
getRawColumns(client).filter(_ref7 => {
  let schemaName = _ref7.schemaName;
  let tableName = _ref7.tableName;
  return table.schema.name === schemaName && table.name === tableName;
}).map(row => new _catalog.Column(_extends({ table }, row)));

const getEnums = (client, schema) => getRawEnums(client).filter(_ref8 => {
  let schemaName = _ref8.schemaName;
  return schema.name === schemaName;
}).map(row => new _catalog.Enum(_extends({ schema }, row)));

const getForeignKeys = (client, catalog) => getRawForeignKeys(client).map(_ref9 => {
  let nativeTableOid = _ref9.nativeTableOid;
  let nativeColumnNums = _ref9.nativeColumnNums;
  let foreignTableOid = _ref9.foreignTableOid;
  let foreignColumnNums = _ref9.foreignColumnNums;

  const nativeTable = catalog.getAllTables().find(_ref10 => {
    let _oid = _ref10._oid;
    return _oid === nativeTableOid;
  });
  const foreignTable = catalog.getAllTables().find(_ref11 => {
    let _oid = _ref11._oid;
    return _oid === foreignTableOid;
  });

  return new _catalog.ForeignKey({
    catalog,
    nativeTable,
    foreignTable,
    nativeColumns: nativeColumnNums.map(num => nativeTable.columns.find(_ref12 => {
      let _num = _ref12._num;
      return _num === num;
    })),
    foreignColumns: foreignColumnNums.map(num => foreignTable.columns.find(_ref13 => {
      let _num = _ref13._num;
      return _num === num;
    }))
  });
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wb3N0Z3Jlcy9nZXRDYXRhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUE7O0FBQ0E7Ozs7QUFDQTs7OztBQUNBOzs7Ozs7QUFFQSxNQUFNLGdCQUFnQixxQkFBUSxVQUM1QixPQUFPLFVBQVAsQ0FBa0I7Ozs7Ozs7Ozs7RUFBQSxDQUFsQixFQVdDLElBWEQsQ0FXTTtBQUFBLE1BQUcsSUFBSCxRQUFHLElBQUg7QUFBQSxTQUFjLElBQWQ7QUFBQSxDQVhOLENBRG9CLENBQXRCOzs7Ozs7Ozs7Ozs7O0FBMEJBLE1BQU0sZUFBZSxxQkFBUSxVQUMzQixPQUFPLFVBQVAsQ0FBa0I7Ozs7Ozs7Ozs7Ozs7RUFBQSxDQUFsQixFQWNDLElBZEQsQ0FjTTtBQUFBLE1BQUcsSUFBSCxTQUFHLElBQUg7QUFBQSxTQUFjLElBQWQ7QUFBQSxDQWROLENBRG1CLENBQXJCOztBQWtCQSxNQUFNLGdCQUFnQixxQkFBUSxVQUM1QixPQUFPLFVBQVAsQ0FBa0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQUFBLENBQWxCLEVBNEJDLElBNUJELENBNEJNO0FBQUEsTUFBRyxJQUFILFNBQUcsSUFBSDtBQUFBLFNBQWMsSUFBZDtBQUFBLENBNUJOLENBRG9CLENBQXRCOztBQWdDQSxNQUFNLGNBQWMscUJBQVEsVUFDMUIsT0FBTyxVQUFQLENBQWtCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFBQSxDQUFsQixFQW1CQyxJQW5CRCxDQW1CTTtBQUFBLE1BQUcsSUFBSCxTQUFHLElBQUg7QUFBQSxTQUFjLElBQWQ7QUFBQSxDQW5CTixDQURrQixDQUFwQjs7QUF1QkEsTUFBTSxvQkFBb0IscUJBQVEsVUFDaEMsT0FBTyxVQUFQLENBQWtCOzs7Ozs7Ozs7O0VBQUEsQ0FBbEIsRUFXQyxJQVhELENBV007QUFBQSxNQUFHLElBQUgsU0FBRyxJQUFIO0FBQUEsU0FBYyxJQUFkO0FBQUEsQ0FYTixDQUR3QixDQUExQjs7Ozs7Ozs7QUFxQkEsTUFB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O0FBRUEsU0FBTyx3QkFBZTtBQUNwQixXQURvQjtBQUVwQixlQUZvQjtBQUdwQixnQkFIb0I7QUFJcEIsbUJBQWUsaUJBQWlCLEdBQWpCLENBQXFCLE9BQU8sWUFBWSxPQUFaLENBQW9CLElBQXBCLENBQXlCO0FBQUEsVUFBRyxJQUFILFVBQUcsSUFBSDtBQUFBLGFBQWMsU0FBUyxHQUF2QjtBQUFBLEtBQXpCLENBQTVCLENBSks7QUFLcEIsb0JBQWdCLGtCQUFrQixHQUFsQixDQUFzQixPQUFPLGFBQWEsT0FBYixDQUFxQixJQUFyQixDQUEwQjtBQUFBLFVBQUcsSUFBSCxVQUFHLElBQUg7QUFBQSxhQUFjLFNBQVMsR0FBdkI7QUFBQSxLQUExQixDQUE3QjtBQUxJLEdBQWYsQ0FBUDtBQU9ELENBWkQsQ0FERiIsImZpbGUiOiJnZXRDYXRhbG9nLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgbWVtb2l6ZSwgYXNzaWduIH0gZnJvbSAnbG9kYXNoJ1xuaW1wb3J0IFByb21pc2UgZnJvbSAnYmx1ZWJpcmQnXG5pbXBvcnQgcGcgZnJvbSAncGcnXG5pbXBvcnQgeyBDYXRhbG9nLCBTY2hlbWEsIFRhYmxlLCBDb2x1bW4sIEVudW0sIEZvcmVpZ25LZXkgfSBmcm9tICcuL2NhdGFsb2cuanMnXG5cbmNvbnN0IGdldFJhd1NjaGVtYXMgPSBtZW1vaXplKGNsaWVudCA9PlxuICBjbGllbnQucXVlcnlBc3luYyhgXG4gICAgc2VsZWN0XG4gICAgICBuLm9pZCBhcyBcIl9vaWRcIixcbiAgICAgIG4ubnNwbmFtZSBhcyBcIm5hbWVcIixcbiAgICAgIGQuZGVzY3JpcHRpb24gYXMgXCJkZXNjcmlwdGlvblwiXG4gICAgZnJvbVxuICAgICAgcGdfY2F0YWxvZy5wZ19uYW1lc3BhY2UgYXMgblxuICAgICAgbGVmdCBqb2luIHBnX2NhdGFsb2cucGdfZGVzY3JpcHRpb24gYXMgZCBvbiBkLm9iam9pZCA9IG4ub2lkIGFuZCBkLm9ianN1YmlkID0gMFxuICAgIHdoZXJlXG4gICAgICBuLm5zcG5hbWUgbm90IGluICgncGdfY2F0YWxvZycsICdpbmZvcm1hdGlvbl9zY2hlbWEnKVxuICBgKVxuICAudGhlbigoeyByb3dzIH0pID0+IHJvd3MpXG4pXG5cbi8qXG4gKiBTZWxlY3RzIHJvd3MgZm9yIHRoaW5ncyB0byBiZSB0cmVhdGVkIGFzIHRhYmxlcyBieSBQb3N0R3JhcGhRTC5cbiAqXG4gKiBOb3RlIHRoYXQgdGhlIGByZWxraW5kIGluICjigKYpYCBleHByZXNzaW9uIGluIHRoZSB3aGVyZSBjbGF1c2Ugb2YgdGhlXG4gKiBzdGF0ZW1lbnQgZmlsdGVycyBmb3IgdGhlIGZvbGxvd2luZzpcbiAqXG4gKiAtICdyJzogVGFibGVzLlxuICogLSAndic6IFZpZXdzLlxuICogLSAnbSc6IE1hdGVyaWFsaXplZCB2aWV3cy5cbiAqIC0gJ2YnOiBGb3JlaWduIHRhYmxlcy5cbiAqL1xuY29uc3QgZ2V0UmF3VGFibGVzID0gbWVtb2l6ZShjbGllbnQgPT5cbiAgY2xpZW50LnF1ZXJ5QXN5bmMoYFxuICAgIHNlbGVjdFxuICAgICAgYy5vaWQgYXMgXCJfb2lkXCIsXG4gICAgICBuLm5zcG5hbWUgYXMgXCJzY2hlbWFOYW1lXCIsXG4gICAgICBjLnJlbG5hbWUgYXMgXCJuYW1lXCIsXG4gICAgICBkLmRlc2NyaXB0aW9uIGFzIFwiZGVzY3JpcHRpb25cIlxuICAgIGZyb21cbiAgICAgIHBnX2NhdGFsb2cucGdfY2xhc3MgYXMgY1xuICAgICAgbGVmdCBqb2luIHBnX2NhdGFsb2cucGdfbmFtZXNwYWNlIGFzIG4gb24gbi5vaWQgPSBjLnJlbG5hbWVzcGFjZVxuICAgICAgbGVmdCBqb2luIHBnX2NhdGFsb2cucGdfZGVzY3JpcHRpb24gYXMgZCBvbiBkLm9iam9pZCA9IGMub2lkIGFuZCBkLm9ianN1YmlkID0gMFxuICAgIHdoZXJlXG4gICAgICBuLm5zcG5hbWUgbm90IGluICgncGdfY2F0YWxvZycsICdpbmZvcm1hdGlvbl9zY2hlbWEnKSBhbmRcbiAgICAgIGMucmVsa2luZCBpbiAoJ3InLCAndicsICdtJywgJ2YnKVxuICBgKVxuICAudGhlbigoeyByb3dzIH0pID0+IHJvd3MpXG4pXG5cbmNvbnN0IGdldFJhd0NvbHVtbnMgPSBtZW1vaXplKGNsaWVudCA9PlxuICBjbGllbnQucXVlcnlBc3luYyhgXG4gICAgc2VsZWN0XG4gICAgICBhLmF0dG51bSBhcyBcIl9udW1cIixcbiAgICAgIG4ubnNwbmFtZSBhcyBcInNjaGVtYU5hbWVcIixcbiAgICAgIGMucmVsbmFtZSBhcyBcInRhYmxlTmFtZVwiLFxuICAgICAgYS5hdHRuYW1lIGFzIFwibmFtZVwiLFxuICAgICAgZC5kZXNjcmlwdGlvbiBhcyBcImRlc2NyaXB0aW9uXCIsXG4gICAgICBhLmF0dHR5cGlkIGFzIFwidHlwZVwiLFxuICAgICAgbm90KGEuYXR0bm90bnVsbCkgYXMgXCJpc051bGxhYmxlXCIsXG4gICAgICBjcC5vaWQgaXMgbm90IG51bGwgYXMgXCJpc1ByaW1hcnlLZXlcIixcbiAgICAgIGEuYXR0aGFzZGVmIGFzIFwiaGFzRGVmYXVsdFwiXG4gICAgZnJvbVxuICAgICAgcGdfY2F0YWxvZy5wZ19hdHRyaWJ1dGUgYXMgYVxuICAgICAgbGVmdCBqb2luIHBnX2NhdGFsb2cucGdfY2xhc3MgYXMgYyBvbiBjLm9pZCA9IGEuYXR0cmVsaWRcbiAgICAgIGxlZnQgam9pbiBwZ19jYXRhbG9nLnBnX25hbWVzcGFjZSBhcyBuIG9uIG4ub2lkID0gYy5yZWxuYW1lc3BhY2VcbiAgICAgIGxlZnQgam9pbiBwZ19jYXRhbG9nLnBnX2Rlc2NyaXB0aW9uIGFzIGQgb24gZC5vYmpvaWQgPSBjLm9pZCBhbmQgZC5vYmpzdWJpZCA9IGEuYXR0bnVtXG4gICAgICBsZWZ0IGpvaW4gcGdfY2F0YWxvZy5wZ19jb25zdHJhaW50IGFzIGNwIG9uXG4gICAgICAgIGNwLmNvbnR5cGUgPSAncCcgYW5kXG4gICAgICAgIGNwLmNvbnJlbGlkID0gYS5hdHRyZWxpZCBhbmRcbiAgICAgICAgY3AuY29ua2V5OjppbnRbXSBAPiBhcnJheVthLmF0dG51bTo6aW50XVxuICAgIHdoZXJlXG4gICAgICBuLm5zcG5hbWUgbm90IGluICgncGdfY2F0YWxvZycsICdpbmZvcm1hdGlvbl9zY2hlbWEnKSBhbmRcbiAgICAgIGMucmVsa2luZCBpbiAoJ3InLCAndicsICdtJywgJ2YnKSBhbmRcbiAgICAgIGEuYXR0bnVtID4gMCBhbmRcbiAgICAgIG5vdCBhLmF0dGlzZHJvcHBlZFxuICAgIG9yZGVyIGJ5XG4gICAgICBuLm5zcG5hbWUsIGMucmVsbmFtZSwgYS5hdHRudW07XG4gIGApXG4gIC50aGVuKCh7IHJvd3MgfSkgPT4gcm93cylcbilcblxuY29uc3QgZ2V0UmF3RW51bXMgPSBtZW1vaXplKGNsaWVudCA9PlxuICBjbGllbnQucXVlcnlBc3luYyhgXG4gICAgc2VsZWN0XG4gICAgICB0Lm9pZCBhcyBcIl9vaWRcIixcbiAgICAgIG4ubnNwbmFtZSBhcyBcInNjaGVtYU5hbWVcIixcbiAgICAgIHQudHlwbmFtZSBhcyBcIm5hbWVcIixcbiAgICAgIGFycmF5KFxuICAgICAgICBzZWxlY3RcbiAgICAgICAgICBlLmVudW1sYWJlbDo6dGV4dFxuICAgICAgICBmcm9tXG4gICAgICAgICAgcGdfY2F0YWxvZy5wZ19lbnVtIGFzIGVcbiAgICAgICAgd2hlcmVcbiAgICAgICAgICBlLmVudW10eXBpZCA9IHQub2lkXG4gICAgICApIGFzIFwidmFyaWFudHNcIlxuICAgIGZyb21cbiAgICAgIHBnX2NhdGFsb2cucGdfdHlwZSBhcyB0XG4gICAgICBsZWZ0IGpvaW4gcGdfY2F0YWxvZy5wZ19uYW1lc3BhY2UgYXMgbiBvbiBuLm9pZCA9IHQudHlwbmFtZXNwYWNlXG4gICAgd2hlcmVcbiAgICAgIHQudHlwdHlwZSA9ICdlJztcbiAgYClcbiAgLnRoZW4oKHsgcm93cyB9KSA9PiByb3dzKVxuKVxuXG5jb25zdCBnZXRSYXdGb3JlaWduS2V5cyA9IG1lbW9pemUoY2xpZW50ID0+XG4gIGNsaWVudC5xdWVyeUFzeW5jKGBcbiAgICBzZWxlY3RcbiAgICAgIGMuY29ucmVsaWQgYXMgXCJuYXRpdmVUYWJsZU9pZFwiLFxuICAgICAgYy5jb25rZXkgYXMgXCJuYXRpdmVDb2x1bW5OdW1zXCIsXG4gICAgICBjLmNvbmZyZWxpZCBhcyBcImZvcmVpZ25UYWJsZU9pZFwiLFxuICAgICAgYy5jb25ma2V5IGFzIFwiZm9yZWlnbkNvbHVtbk51bXNcIlxuICAgIGZyb21cbiAgICAgIHBnX2NhdGFsb2cucGdfY29uc3RyYWludCBhcyBjXG4gICAgd2hlcmVcbiAgICAgIGMuY29udHlwZSA9ICdmJ1xuICBgKVxuICAudGhlbigoeyByb3dzIH0pID0+IHJvd3MpXG4pXG5cbi8qKlxuICogR2V0cyBhbiBpbnN0YW5jZSBvZiBgQ2F0YWxvZ2AgZm9yIHRoZSBnaXZlbiBQb3N0Z3JlU1FMIGNvbmZpZ3VyYXRpb24uXG4gKlxuICogQHBhcmFtIHtPYmplY3R9IHBnQ29uZmlnXG4gKiBAcmV0dXJucyB7Q2F0YWxvZ31cbiAqL1xuY29uc3QgZ2V0Q2F0YWxvZyA9IGFzeW5jIHBnQ29uZmlnID0+IHtcbiAgY29uc3QgY2xpZW50ID0gYXdhaXQgcGcuY29ubmVjdEFzeW5jKHBnQ29uZmlnKVxuICBjb25zdCBjYXRhbG9nID0gbmV3IENhdGFsb2coeyBwZ0NvbmZpZyB9KVxuICBjb25zdCBzY2hlbWFzID0gYXdhaXQgZ2V0U2NoZW1hcyhjbGllbnQsIGNhdGFsb2cpXG4gIGNhdGFsb2cuc2NoZW1hcyA9IHNjaGVtYXNcbiAgY29uc3QgZm9yZWlnbktleXMgPSBhd2FpdCBnZXRGb3JlaWduS2V5cyhjbGllbnQsIGNhdGFsb2cpXG4gIGNhdGFsb2cuZm9yZWlnbktleXMgPSBmb3JlaWduS2V5c1xuICBjbGllbnQuZW5kKClcbiAgcmV0dXJuIGNhdGFsb2dcbn1cblxuZXhwb3J0IGRlZmF1bHQgZ2V0Q2F0YWxvZ1xuXG5jb25zdCBnZXRTY2hlbWFzID0gKGNsaWVudCwgY2F0YWxvZykgPT5cbiAgLy8gR2V0IHRoZSByYXcgc2NoZW1hcy5cbiAgZ2V0UmF3U2NoZW1hcyhjbGllbnQpXG4gIC5tYXAocm93ID0+IG5ldyBTY2hlbWEoeyBjYXRhbG9nLCAuLi5yb3cgfSkpXG4gIC8vIEdldCB0YWJsZXMsIHNldCB0aGUgdGFibGVzIHByb3BlcnR5LCByZXR1cm4gc2NoZW1hIHNvIHRoYXQgaXQgaXMgd2hhdFxuICAvLyBhY3R1YWxseSBnZXRzIHJlc29sdmVkLlxuICAubWFwKHNjaGVtYSA9PlxuICAgIFByb21pc2Uuam9pbihcbiAgICAgIGdldFRhYmxlcyhjbGllbnQsIHNjaGVtYSksXG4gICAgICBnZXRFbnVtcyhjbGllbnQsIHNjaGVtYSksXG4gICAgICAodGFibGVzLCBlbnVtcykgPT4gYXNzaWduKHNjaGVtYSwgeyB0YWJsZXMsIGVudW1zIH0pXG4gICAgKVxuICApXG5cbmNvbnN0IGdldFRhYmxlcyA9IChjbGllbnQsIHNjaGVtYSkgPT5cbiAgLy8gR2V0IHRoZSByYXcgdGFibGVzLiBUaGlzIGZ1bmN0aW9uIGlzIGNhY2hlZCBiZWNhdXNlIGBnZXRUYWJsZXNgIHdpbGwgYmVcbiAgLy8gY2FsbGVkIG9uY2UgZm9yIGV2ZXJ5IGBzY2hlbWFgLlxuICBnZXRSYXdUYWJsZXMoY2xpZW50KVxuICAvLyBPbmx5IGdldCB0YWJsZXMgZm9yIHRoZSBwYXNzZWQgYHNjaGVtYWAuXG4gIC5maWx0ZXIoKHsgc2NoZW1hTmFtZSB9KSA9PlxuICAgIHNjaGVtYS5uYW1lID09PSBzY2hlbWFOYW1lXG4gIClcbiAgLm1hcChyb3cgPT4gbmV3IFRhYmxlKHsgc2NoZW1hLCAuLi5yb3cgfSkpXG4gIC8vIEdldCBjb2x1bW5zLCBzZXQgdGhlIGNvbHVtbnMgcHJvcGVydHksIHJldHVybiB0YWJsZSBzbyB0aGF0IGl0IGlzIHdoYXRcbiAgLy8gYWN0dWFsbHkgZ2V0cyByZXNvbHZlZC5cbiAgLm1hcCh0YWJsZSA9PlxuICAgIFByb21pc2Uuam9pbihcbiAgICAgIGdldENvbHVtbnMoY2xpZW50LCB0YWJsZSksXG4gICAgICBjb2x1bW5zID0+IGFzc2lnbih0YWJsZSwgeyBjb2x1bW5zIH0pXG4gICAgKVxuICApXG5cbmNvbnN0IGdldENvbHVtbnMgPSAoY2xpZW50LCB0YWJsZSkgPT5cbiAgLy8gR2V0IHRoZSByYXcgY29sdW1ucy4gVGhpcyBmdW5jdGlvbiBpcyBjYWNoZWQgYmVjYXVzZSBgZ2V0Q29sdW1uc2Agd2lsbCBiZVxuICAvLyBjYWxsZWQgb25jZSBmb3IgZXZlcnkgYHRhYmxlYC5cbiAgZ2V0UmF3Q29sdW1ucyhjbGllbnQpXG4gIC5maWx0ZXIoKHsgc2NoZW1hTmFtZSwgdGFibGVOYW1lIH0pID0+XG4gICAgdGFibGUuc2NoZW1hLm5hbWUgPT09IHNjaGVtYU5hbWUgJiZcbiAgICB0YWJsZS5uYW1lID09PSB0YWJsZU5hbWVcbiAgKVxuICAubWFwKHJvdyA9PiBuZXcgQ29sdW1uKHsgdGFibGUsIC4uLnJvdyB9KSlcblxuY29uc3QgZ2V0RW51bXMgPSAoY2xpZW50LCBzY2hlbWEpID0+XG4gIGdldFJhd0VudW1zKGNsaWVudClcbiAgLmZpbHRlcigoeyBzY2hlbWFOYW1lIH0pID0+XG4gICAgc2NoZW1hLm5hbWUgPT09IHNjaGVtYU5hbWVcbiAgKVxuICAubWFwKHJvdyA9PiBuZXcgRW51bSh7IHNjaGVtYSwgLi4ucm93IH0pKVxuXG5jb25zdCBnZXRGb3JlaWduS2V5cyA9IChjbGllbnQsIGNhdGFsb2cpID0+XG4gIGdldFJhd0ZvcmVpZ25LZXlzKGNsaWVudClcbiAgLm1hcCgoeyBuYXRpdmVUYWJsZU9pZCwgbmF0aXZlQ29sdW1uTnVtcywgZm9yZWlnblRhYmxlT2lkLCBmb3JlaWduQ29sdW1uTnVtcyB9KSA9PiB7XG4gICAgY29uc3QgbmF0aXZlVGFibGUgPSBjYXRhbG9nLmdldEFsbFRhYmxlcygpLmZpbmQoKHsgX29pZCB9KSA9PiBfb2lkID09PSBuYXRpdmVUYWJsZU9pZClcbiAgICBjb25zdCBmb3JlaWduVGFibGUgPSBjYXRhbG9nLmdldEFsbFRhYmxlcygpLmZpbmQoKHsgX29pZCB9KSA9PiBfb2lkID09PSBmb3JlaWduVGFibGVPaWQpXG5cbiAgICByZXR1cm4gbmV3IEZvcmVpZ25LZXkoe1xuICAgICAgY2F0YWxvZyxcbiAgICAgIG5hdGl2ZVRhYmxlLFxuICAgICAgZm9yZWlnblRhYmxlLFxuICAgICAgbmF0aXZlQ29sdW1uczogbmF0aXZlQ29sdW1uTnVtcy5tYXAobnVtID0+IG5hdGl2ZVRhYmxlLmNvbHVtbnMuZmluZCgoeyBfbnVtIH0pID0+IF9udW0gPT09IG51bSkpLFxuICAgICAgZm9yZWlnbkNvbHVtbnM6IGZvcmVpZ25Db2x1bW5OdW1zLm1hcChudW0gPT4gZm9yZWlnblRhYmxlLmNvbHVtbnMuZmluZCgoeyBfbnVtIH0pID0+IF9udW0gPT09IG51bSkpLFxuICAgIH0pXG4gIH0pXG4iXX0=