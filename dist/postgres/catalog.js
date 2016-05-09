'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ForeignKey = exports.Enum = exports.Column = exports.Table = exports.Schema = exports.Catalog = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _lodash = require('lodash');

var _sql = require('sql');

var _sql2 = _interopRequireDefault(_sql);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

const replaceInsideUnderscores = (string, replacer) => {
  var _$exec = /^(_*)(.*?)(_*)$/.exec(string);

  var _$exec2 = _slicedToArray(_$exec, 4);

  const start = _$exec2[1];
  const substring = _$exec2[2];
  const finish = _$exec2[3];

  return `${ start }${ replacer(substring) }${ finish }`;
};

const camelCaseInsideUnderscores = string => replaceInsideUnderscores(string, _lodash.camelCase);

const pascalCaseInsideUnderscores = string => replaceInsideUnderscores(string, substring => (0, _lodash.upperFirst)((0, _lodash.camelCase)(substring)));

/**
 * A catalog of all objects relevant in the database to PostGraphQL.
 *
 * The `Catalog` class also contains a `pgConfig` object which allows it to
 * acquire clients from the `pg` connection pool at will.
 *
 * @member {Object} pgConfig
 * @member {Schema[]} schemas
 * @member {ForeignKey[]} foreignKeys
 */
class Catalog {

  constructor(_ref) {
    let pgConfig = _ref.pgConfig;
    this.schemas = [];
    this.foreignKeys = [];

    this.pgConfig = pgConfig;
  }

  /**
   * Gets the schema of a certain name.
   *
   * @param {string} schemaName
   * @returns {?Schema}
   */
  getSchema(schemaName) {
    return this.schemas.find(_ref2 => {
      let name = _ref2.name;
      return name === schemaName;
    });
  }

  /**
   * Gets a table in a schema.
   *
   * @param {string} schemaName
   * @param {string} tableName
   * @returns {?Table}
   */
  getTable(schemaName, tableName) {
    return this.getSchema(schemaName).getTable(tableName);
  }

  /**
   * Gets all tables in all of our schemas.
   *
   * @returns {Table[]}
   */
  getAllTables() {
    return (0, _lodash.flatten)(this.schemas.map(schema => schema.getAllTables()));
  }

  /**
   * Gets an enum in a schema.
   *
   * @param {string} schemaName
   * @param {string} enumName
   * @returns {?Enum}
   */
  getEnum(schemaName, enumName) {
    return this.getSchema(schemaName).getEnum(enumName);
  }

  /**
   * Gets all enums in all of our schemas.
   *
   * @returns {Enum[]}
   */
  getAllEnums() {
    return (0, _lodash.flatten)(this.schemas.map(_ref3 => {
      let enums = _ref3.enums;
      return enums;
    }));
  }

  /**
   * Gets the column of a table in a schema.
   *
   * @param {string} schemaName
   * @param {string} tableName
   * @param {string} columnName
   * @returns {?Column}
   */
  getColumn(schemaName, tableName, columnName) {
    return this.getSchema(schemaName).getTable(tableName).getColumn(columnName);
  }
}

exports.Catalog = Catalog; /**
                            * Represents a PostgreSQL schema.
                            *
                            * @member {Catalog} catalog
                            * @member {string} name
                            * @member {string} description
                            * @member {Table[]} tables
                            * @member {Enum[]} enums
                            */

class Schema {

  constructor(_ref4) {
    let _oid = _ref4._oid;
    let catalog = _ref4.catalog;
    let name = _ref4.name;
    let description = _ref4.description;
    this.tables = [];
    this.enums = [];

    this._oid = _oid;
    this.catalog = catalog;
    this.name = name;
    this.description = description;
  }

  /**
   * Gets the escaped name of the schema to be used as an identifier in SQL
   * queries.
   *
   * @returns {string}
   */
  getIdentifier() {
    return `"${ this.name }"`;
  }

  /**
   * Gets a table in this schema.
   *
   * @param {string} tableName
   * @returns {?Table}
   */
  getTable(tableName) {
    return this.tables.find(_ref5 => {
      let name = _ref5.name;
      return name === tableName;
    });
  }

  /**
   * Return all of our tables.
   *
   * @returns {Table[]}
   */
  getAllTables() {
    return this.tables;
  }

  /**
   * Gets an enum in this schema.
   *
   * @param {string} enumName
   * @returns {?Enum}
   */
  getEnum(enumName) {
    return this.enums.find(_ref6 => {
      let name = _ref6.name;
      return name === enumName;
    });
  }

  /**
   * Gets a column in a table in the schema.
   *
   * @param {string} tableName
   * @param {string} columnName
   * @returns {?Column}
   */
  getColumn(tableName, columnName) {
    return this.getTable(tableName).getColumn(columnName);
  }
}

exports.Schema = Schema; /**
                          * Represents a PostgreSQL table.
                          *
                          * @member {Schema} schema
                          * @member {string} name
                          * @member {string} description
                          * @member {Column[]} columns
                          */

class Table {

  constructor(_ref7) {
    let _oid = _ref7._oid;
    let schema = _ref7.schema;
    let name = _ref7.name;
    let description = _ref7.description;
    this.columns = [];

    this._oid = _oid;
    this.schema = schema;
    this.name = name;
    this.description = description;
  }

  getFieldName() {
    return camelCaseInsideUnderscores(this.name);
  }

  getTypeName() {
    return pascalCaseInsideUnderscores(this.name);
  }

  getMarkdownTypeName() {
    return `\`${ this.getTypeName() }\``;
  }

  /**
   * Returns a table type from the `sql` module based off of this table. This
   * is so we can use the superior capabilities of the `sql` module to
   * construct SQL queries with our table type.
   *
   * @returns {SqlTable}
   */
  sql() {
    return _sql2['default'].define({
      schema: this.schema.name,
      name: this.name,
      columns: this.columns.map(_ref8 => {
        let name = _ref8.name;
        return name;
      })
    });
  }

  /**
   * Gets a column in the table.
   *
   * @param {string} columnName
   * @returns {?Column}
   */
  getColumn(columnName) {
    return this.columns.find(_ref9 => {
      let name = _ref9.name;
      return name === columnName;
    });
  }

  /**
   * Gets the primary key columns for this table. If there is no primary key
   * this will return an array with a length of 0.
   *
   * @returns {Column[]}
   */
  getPrimaryKeyColumns() {
    return this.columns.filter(_ref10 => {
      let isPrimaryKey = _ref10.isPrimaryKey;
      return isPrimaryKey;
    });
  }

  /**
   * Gets the foreign keys for this table.
   *
   * @returns {ForeignKey[]}
   */
  getForeignKeys() {
    return this.schema.catalog.foreignKeys.filter(_ref11 => {
      let nativeTable = _ref11.nativeTable;
      return this === nativeTable;
    });
  }

  /**
   * Gets foreign keys in the opposite direction for this table.
   *
   * @returns {ForeignKey[]}
   */
  getReverseForeignKeys() {
    return this.schema.catalog.foreignKeys.filter(_ref12 => {
      let foreignTable = _ref12.foreignTable;
      return this === foreignTable;
    });
  }
}

exports.Table = Table; /**
                        * Represents a PostgreSQL column.
                        *
                        * @member {Table} table
                        * @member {string} name
                        * @member {string} description
                        * @member {number} type
                        * @member {boolean} isNullable
                        * @member {boolean} isPrimaryKey
                        * @member {boolean} hasDefault
                        */

class Column {
  constructor(_ref13) {
    let _num = _ref13._num;
    let table = _ref13.table;
    let name = _ref13.name;
    let description = _ref13.description;
    let type = _ref13.type;
    var _ref13$isNullable = _ref13.isNullable;
    let isNullable = _ref13$isNullable === undefined ? true : _ref13$isNullable;
    let isPrimaryKey = _ref13.isPrimaryKey;
    var _ref13$hasDefault = _ref13.hasDefault;
    let hasDefault = _ref13$hasDefault === undefined ? false : _ref13$hasDefault;

    this._num = _num;
    this.table = table;
    this.name = name;
    this.description = description;
    this.type = type;
    this.isNullable = isNullable;
    this.isPrimaryKey = isPrimaryKey;
    this.hasDefault = hasDefault;
  }

  getFieldName() {
    return camelCaseInsideUnderscores(this.name);
  }

  getMarkdownFieldName() {
    return `\`${ this.getFieldName() }\``;
  }

  /**
   * Gets an enum based on the column’s type. If there is no enum for the
   * column’s type, null is returned.
   *
   * @returns {?Enum}
   */
  getEnum() {
    return this.table.schema.catalog.getAllEnums().find(_ref14 => {
      let _oid = _ref14._oid;
      return _oid === this.type;
    });
  }
}

exports.Column = Column; /**
                          * Represents a user defined enum PostgreSQL column.
                          *
                          * @member {Schema} schema
                          * @member {string} name
                          * @member {string[]} variants
                          */

class Enum {
  constructor(_ref15) {
    let _oid = _ref15._oid;
    let schema = _ref15.schema;
    let name = _ref15.name;
    let variants = _ref15.variants;

    this._oid = _oid;
    this.schema = schema;
    this.name = name;
    this.variants = variants;
  }
}

exports.Enum = Enum; /**
                      * A foreign key describing a reference between one table and another.
                      *
                      * @member {Catalog} catalog
                      * @member {Table} nativeTable
                      * @member {Column[]} nativeColumns
                      * @member {Table} foreignTable
                      * @member {Column[]} foreignColumns
                      */

class ForeignKey {
  constructor(_ref16) {
    let catalog = _ref16.catalog;
    let nativeTable = _ref16.nativeTable;
    let nativeColumns = _ref16.nativeColumns;
    let foreignTable = _ref16.foreignTable;
    let foreignColumns = _ref16.foreignColumns;

    this.catalog = catalog;
    this.nativeTable = nativeTable;
    this.nativeColumns = nativeColumns;
    this.foreignTable = foreignTable;
    this.foreignColumns = foreignColumns;
  }
}
exports.ForeignKey = ForeignKey;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9wb3N0Z3Jlcy9jYXRhbG9nLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7OztBQUFBOztBQUNBOzs7Ozs7QUFFQSxNQUFNLDJCQUEyQixDQUFDLE1BQUQsRUFBUyxRQUFULEtBQXNCO0FBQUEsZUFDaEIsa0JBQWtCLElBQWxCLENBQXVCLE1BQXZCLENBRGdCOztBQUFBOztBQUFBLFFBQzVDLEtBRDRDO0FBQUEsUUFDckMsU0FEcUM7QUFBQSxRQUMxQixNQUQwQjs7QUFFckQsU0FBTyxDQUFDLEFBQUQsR0FBRyxLQUFILEVBQVMsQUFBVCxHQUFXLFNBQVMsU0FBVCxDQUFYLEVBQStCLEFBQS9CLEdBQWlDLE1BQWpDLEVBQXdDLEFBQXhDLENBQVA7QUFDRCxDQUhEOztBQUtBLE1BQU0sNkJBQTZCLFVBQVUseUJBQXlCLE1BQXpCLG9CQUE3Qzs7QUFFQSxNQUFNLDhCQUE4QixVQUFVLHlCQUM1QyxNQUQ0QyxFQUU1QyxhQUFhLHdCQUFXLHVCQUFVLFNBQVYsQ0FBWCxDQUYrQixDQUE5Qzs7Ozs7Ozs7Ozs7O0FBZU8sTUFBTSxPQUFOLENBQWM7O0FBSW5CLG9CQUEyQjtBQUFBLFFBQVosUUFBWSxRQUFaLFFBQVk7QUFBQSxTQUgzQixPQUcyQixHQUhqQixFQUdpQjtBQUFBLFNBRjNCLFdBRTJCLEdBRmIsRUFFYTs7QUFDekIsU0FBSyxRQUFMLEdBQWdCLFFBQWhCO0FBQ0Q7Ozs7Ozs7O0FBUUQsWUFBVyxVQUFYLEVBQXVCO0FBQ3JCLFdBQU8sS0FBSyxPQUFMLENBQWEsSUFBYixDQUFrQjtBQUFBLFVBQUcsSUFBSCxTQUFHLElBQUg7QUFBQSxhQUFjLFNBQVMsVUFBdkI7QUFBQSxLQUFsQixDQUFQO0FBQ0Q7Ozs7Ozs7OztBQVNELFdBQVUsVUFBVixFQUFzQixTQUF0QixFQUFpQztBQUMvQixXQUFPLEtBQUssU0FBTCxDQUFlLFVBQWYsRUFBMkIsUUFBM0IsQ0FBb0MsU0FBcEMsQ0FBUDtBQUNEOzs7Ozs7O0FBT0QsaUJBQWdC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LFFBQWhCO0FBQ0Q7QUFOZTs7UUFBTCxJLEdBQUEsSTs7Ozs7Ozs7OztBQWtCTixNQUFNLFVBQU4sQ0FBaUI7QUFDdEIsc0JBQW9GO0FBQUEsUUFBckUsT0FBcUUsVUFBckUsT0FBcUU7QUFBQSxRQUE1RCxXQUE0RCxVQUE1RCxXQUE0RDtBQUFBLFFBQS9DLGFBQStDLFVBQS9DLGFBQStDO0FBQUEsUUFBaEMsWUFBZ0MsVUFBaEMsWUFBZ0M7QUFBQSxRQUFsQixjQUFrQixVQUFsQixjQUFrQjs7QUFDbEYsU0FBSyxPQUFMLEdBQWUsT0FBZjtBQUNBLFNBQUssV0FBTCxHQUFtQixXQUFuQjtBQUNBLFNBQUssYUFBTCxHQUFxQixhQUFyQjtBQUNBLFNBQUssWUFBTCxHQUFvQixZQUFwQjtBQUNBLFNBQUssY0FBTCxHQUFzQixjQUF0QjtBQUNEO0FBUHFCO1FBQVgsVSxHQUFBLFUiLCJmaWxlIjoiY2F0YWxvZy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGZsYXR0ZW4sIGNhbWVsQ2FzZSwgdXBwZXJGaXJzdCB9IGZyb20gJ2xvZGFzaCdcbmltcG9ydCBzcWwgZnJvbSAnc3FsJ1xuXG5jb25zdCByZXBsYWNlSW5zaWRlVW5kZXJzY29yZXMgPSAoc3RyaW5nLCByZXBsYWNlcikgPT4ge1xuICBjb25zdCBbLCBzdGFydCwgc3Vic3RyaW5nLCBmaW5pc2hdID0gL14oXyopKC4qPykoXyopJC8uZXhlYyhzdHJpbmcpXG4gIHJldHVybiBgJHtzdGFydH0ke3JlcGxhY2VyKHN1YnN0cmluZyl9JHtmaW5pc2h9YFxufVxuXG5jb25zdCBjYW1lbENhc2VJbnNpZGVVbmRlcnNjb3JlcyA9IHN0cmluZyA9PiByZXBsYWNlSW5zaWRlVW5kZXJzY29yZXMoc3RyaW5nLCBjYW1lbENhc2UpXG5cbmNvbnN0IHBhc2NhbENhc2VJbnNpZGVVbmRlcnNjb3JlcyA9IHN0cmluZyA9PiByZXBsYWNlSW5zaWRlVW5kZXJzY29yZXMoXG4gIHN0cmluZyxcbiAgc3Vic3RyaW5nID0+IHVwcGVyRmlyc3QoY2FtZWxDYXNlKHN1YnN0cmluZykpXG4pXG5cbi8qKlxuICogQSBjYXRhbG9nIG9mIGFsbCBvYmplY3RzIHJlbGV2YW50IGluIHRoZSBkYXRhYmFzZSB0byBQb3N0R3JhcGhRTC5cbiAqXG4gKiBUaGUgYENhdGFsb2dgIGNsYXNzIGFsc28gY29udGFpbnMgYSBgcGdDb25maWdgIG9iamVjdCB3aGljaCBhbGxvd3MgaXQgdG9cbiAqIGFjcXVpcmUgY2xpZW50cyBmcm9tIHRoZSBgcGdgIGNvbm5lY3Rpb24gcG9vbCBhdCB3aWxsLlxuICpcbiAqIEBtZW1iZXIge09iamVjdH0gcGdDb25maWdcbiAqIEBtZW1iZXIge1NjaGVtYVtdfSBzY2hlbWFzXG4gKiBAbWVtYmVyIHtGb3JlaWduS2V5W119IGZvcmVpZ25LZXlzXG4gKi9cbmV4cG9ydCBjbGFzcyBDYXRhbG9nIHtcbiAgc2NoZW1hcyA9IFtdXG4gIGZvcmVpZ25LZXlzID0gW11cblxuICBjb25zdHJ1Y3RvciAoeyBwZ0NvbmZpZyB9KSB7XG4gICAgdGhpcy5wZ0NvbmZpZyA9IHBnQ29uZmlnXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgc2NoZW1hIG9mIGEgY2VydGFpbiBuYW1lLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1hTmFtZVxuICAgKiBAcmV0dXJucyB7P1NjaGVtYX1cbiAgICovXG4gIGdldFNjaGVtYSAoc2NoZW1hTmFtZSkge1xuICAgIHJldHVybiB0aGlzLnNjaGVtYXMuZmluZCgoeyBuYW1lIH0pID0+IG5hbWUgPT09IHNjaGVtYU5hbWUpXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHRhYmxlIGluIGEgc2NoZW1hLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gc2NoZW1hTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFibGVOYW1lXG4gICAqIEByZXR1cm5zIHs/VGFibGV9XG4gICAqL1xuICBnZXRUYWJsZSAoc2NoZW1hTmFtZSwgdGFibGVOYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NoZW1hKHNjaGVtYU5hbWUpLmdldFRhYmxlKHRhYmxlTmFtZSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFsbCB0YWJsZXMgaW4gYWxsIG9mIG91ciBzY2hlbWFzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7VGFibGVbXX1cbiAgICovXG4gIGdldEFsbFRhYmxlcyAoKSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4odGhpcy5zY2hlbWFzLm1hcChzY2hlbWEgPT4gc2NoZW1hLmdldEFsbFRhYmxlcygpKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIGFuIGVudW0gaW4gYSBzY2hlbWEuXG4gICAqXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBzY2hlbWFOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBlbnVtTmFtZVxuICAgKiBAcmV0dXJucyB7P0VudW19XG4gICAqL1xuICBnZXRFbnVtIChzY2hlbWFOYW1lLCBlbnVtTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdldFNjaGVtYShzY2hlbWFOYW1lKS5nZXRFbnVtKGVudW1OYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYWxsIGVudW1zIGluIGFsbCBvZiBvdXIgc2NoZW1hcy5cbiAgICpcbiAgICogQHJldHVybnMge0VudW1bXX1cbiAgICovXG4gIGdldEFsbEVudW1zICgpIHtcbiAgICByZXR1cm4gZmxhdHRlbih0aGlzLnNjaGVtYXMubWFwKCh7IGVudW1zIH0pID0+IGVudW1zKSlcbiAgfVxuXG4gIC8qKlxuICAgKiBHZXRzIHRoZSBjb2x1bW4gb2YgYSB0YWJsZSBpbiBhIHNjaGVtYS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHNjaGVtYU5hbWVcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhYmxlTmFtZVxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29sdW1uTmFtZVxuICAgKiBAcmV0dXJucyB7P0NvbHVtbn1cbiAgICovXG4gIGdldENvbHVtbiAoc2NoZW1hTmFtZSwgdGFibGVOYW1lLCBjb2x1bW5OYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0U2NoZW1hKHNjaGVtYU5hbWUpLmdldFRhYmxlKHRhYmxlTmFtZSkuZ2V0Q29sdW1uKGNvbHVtbk5hbWUpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgUG9zdGdyZVNRTCBzY2hlbWEuXG4gKlxuICogQG1lbWJlciB7Q2F0YWxvZ30gY2F0YWxvZ1xuICogQG1lbWJlciB7c3RyaW5nfSBuYW1lXG4gKiBAbWVtYmVyIHtzdHJpbmd9IGRlc2NyaXB0aW9uXG4gKiBAbWVtYmVyIHtUYWJsZVtdfSB0YWJsZXNcbiAqIEBtZW1iZXIge0VudW1bXX0gZW51bXNcbiAqL1xuZXhwb3J0IGNsYXNzIFNjaGVtYSB7XG4gIHRhYmxlcyA9IFtdXG4gIGVudW1zID0gW11cblxuICBjb25zdHJ1Y3RvciAoeyBfb2lkLCBjYXRhbG9nLCBuYW1lLCBkZXNjcmlwdGlvbiB9KSB7XG4gICAgdGhpcy5fb2lkID0gX29pZFxuICAgIHRoaXMuY2F0YWxvZyA9IGNhdGFsb2dcbiAgICB0aGlzLm5hbWUgPSBuYW1lXG4gICAgdGhpcy5kZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgZXNjYXBlZCBuYW1lIG9mIHRoZSBzY2hlbWEgdG8gYmUgdXNlZCBhcyBhbiBpZGVudGlmaWVyIGluIFNRTFxuICAgKiBxdWVyaWVzLlxuICAgKlxuICAgKiBAcmV0dXJucyB7c3RyaW5nfVxuICAgKi9cbiAgZ2V0SWRlbnRpZmllciAoKSB7XG4gICAgcmV0dXJuIGBcIiR7dGhpcy5uYW1lfVwiYFxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSB0YWJsZSBpbiB0aGlzIHNjaGVtYS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IHRhYmxlTmFtZVxuICAgKiBAcmV0dXJucyB7P1RhYmxlfVxuICAgKi9cbiAgZ2V0VGFibGUgKHRhYmxlTmFtZSkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlcy5maW5kKCh7IG5hbWUgfSkgPT4gbmFtZSA9PT0gdGFibGVOYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybiBhbGwgb2Ygb3VyIHRhYmxlcy5cbiAgICpcbiAgICogQHJldHVybnMge1RhYmxlW119XG4gICAqL1xuICBnZXRBbGxUYWJsZXMgKCkge1xuICAgIHJldHVybiB0aGlzLnRhYmxlc1xuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gZW51bSBpbiB0aGlzIHNjaGVtYS5cbiAgICpcbiAgICogQHBhcmFtIHtzdHJpbmd9IGVudW1OYW1lXG4gICAqIEByZXR1cm5zIHs/RW51bX1cbiAgICovXG4gIGdldEVudW0gKGVudW1OYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZW51bXMuZmluZCgoeyBuYW1lIH0pID0+IG5hbWUgPT09IGVudW1OYW1lKVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb2x1bW4gaW4gYSB0YWJsZSBpbiB0aGUgc2NoZW1hLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gdGFibGVOYW1lXG4gICAqIEBwYXJhbSB7c3RyaW5nfSBjb2x1bW5OYW1lXG4gICAqIEByZXR1cm5zIHs/Q29sdW1ufVxuICAgKi9cbiAgZ2V0Q29sdW1uICh0YWJsZU5hbWUsIGNvbHVtbk5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRUYWJsZSh0YWJsZU5hbWUpLmdldENvbHVtbihjb2x1bW5OYW1lKVxuICB9XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIFBvc3RncmVTUUwgdGFibGUuXG4gKlxuICogQG1lbWJlciB7U2NoZW1hfSBzY2hlbWFcbiAqIEBtZW1iZXIge3N0cmluZ30gbmFtZVxuICogQG1lbWJlciB7c3RyaW5nfSBkZXNjcmlwdGlvblxuICogQG1lbWJlciB7Q29sdW1uW119IGNvbHVtbnNcbiAqL1xuZXhwb3J0IGNsYXNzIFRhYmxlIHtcbiAgY29sdW1ucyA9IFtdXG5cbiAgY29uc3RydWN0b3IgKHsgX29pZCwgc2NoZW1hLCBuYW1lLCBkZXNjcmlwdGlvbiB9KSB7XG4gICAgdGhpcy5fb2lkID0gX29pZFxuICAgIHRoaXMuc2NoZW1hID0gc2NoZW1hXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvblxuICB9XG5cbiAgZ2V0RmllbGROYW1lICgpIHtcbiAgICByZXR1cm4gY2FtZWxDYXNlSW5zaWRlVW5kZXJzY29yZXModGhpcy5uYW1lKVxuICB9XG5cbiAgZ2V0VHlwZU5hbWUgKCkge1xuICAgIHJldHVybiBwYXNjYWxDYXNlSW5zaWRlVW5kZXJzY29yZXModGhpcy5uYW1lKVxuICB9XG5cbiAgZ2V0TWFya2Rvd25UeXBlTmFtZSAoKSB7XG4gICAgcmV0dXJuIGBcXGAke3RoaXMuZ2V0VHlwZU5hbWUoKX1cXGBgXG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHRhYmxlIHR5cGUgZnJvbSB0aGUgYHNxbGAgbW9kdWxlIGJhc2VkIG9mZiBvZiB0aGlzIHRhYmxlLiBUaGlzXG4gICAqIGlzIHNvIHdlIGNhbiB1c2UgdGhlIHN1cGVyaW9yIGNhcGFiaWxpdGllcyBvZiB0aGUgYHNxbGAgbW9kdWxlIHRvXG4gICAqIGNvbnN0cnVjdCBTUUwgcXVlcmllcyB3aXRoIG91ciB0YWJsZSB0eXBlLlxuICAgKlxuICAgKiBAcmV0dXJucyB7U3FsVGFibGV9XG4gICAqL1xuICBzcWwgKCkge1xuICAgIHJldHVybiBzcWwuZGVmaW5lKHtcbiAgICAgIHNjaGVtYTogdGhpcy5zY2hlbWEubmFtZSxcbiAgICAgIG5hbWU6IHRoaXMubmFtZSxcbiAgICAgIGNvbHVtbnM6IHRoaXMuY29sdW1ucy5tYXAoKHsgbmFtZSB9KSA9PiBuYW1lKSxcbiAgICB9KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYSBjb2x1bW4gaW4gdGhlIHRhYmxlLlxuICAgKlxuICAgKiBAcGFyYW0ge3N0cmluZ30gY29sdW1uTmFtZVxuICAgKiBAcmV0dXJucyB7P0NvbHVtbn1cbiAgICovXG4gIGdldENvbHVtbiAoY29sdW1uTmFtZSkge1xuICAgIHJldHVybiB0aGlzLmNvbHVtbnMuZmluZCgoeyBuYW1lIH0pID0+IG5hbWUgPT09IGNvbHVtbk5hbWUpXG4gIH1cblxuICAvKipcbiAgICogR2V0cyB0aGUgcHJpbWFyeSBrZXkgY29sdW1ucyBmb3IgdGhpcyB0YWJsZS4gSWYgdGhlcmUgaXMgbm8gcHJpbWFyeSBrZXlcbiAgICogdGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSB3aXRoIGEgbGVuZ3RoIG9mIDAuXG4gICAqXG4gICAqIEByZXR1cm5zIHtDb2x1bW5bXX1cbiAgICovXG4gIGdldFByaW1hcnlLZXlDb2x1bW5zICgpIHtcbiAgICByZXR1cm4gdGhpcy5jb2x1bW5zLmZpbHRlcigoeyBpc1ByaW1hcnlLZXkgfSkgPT4gaXNQcmltYXJ5S2V5KVxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgdGhlIGZvcmVpZ24ga2V5cyBmb3IgdGhpcyB0YWJsZS5cbiAgICpcbiAgICogQHJldHVybnMge0ZvcmVpZ25LZXlbXX1cbiAgICovXG4gIGdldEZvcmVpZ25LZXlzICgpIHtcbiAgICByZXR1cm4gdGhpcy5zY2hlbWEuY2F0YWxvZy5mb3JlaWduS2V5cy5maWx0ZXIoKHsgbmF0aXZlVGFibGUgfSkgPT4gdGhpcyA9PT0gbmF0aXZlVGFibGUpXG4gIH1cblxuICAvKipcbiAgICogR2V0cyBmb3JlaWduIGtleXMgaW4gdGhlIG9wcG9zaXRlIGRpcmVjdGlvbiBmb3IgdGhpcyB0YWJsZS5cbiAgICpcbiAgICogQHJldHVybnMge0ZvcmVpZ25LZXlbXX1cbiAgICovXG4gIGdldFJldmVyc2VGb3JlaWduS2V5cyAoKSB7XG4gICAgcmV0dXJuIHRoaXMuc2NoZW1hLmNhdGFsb2cuZm9yZWlnbktleXMuZmlsdGVyKCh7IGZvcmVpZ25UYWJsZSB9KSA9PiB0aGlzID09PSBmb3JlaWduVGFibGUpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgUG9zdGdyZVNRTCBjb2x1bW4uXG4gKlxuICogQG1lbWJlciB7VGFibGV9IHRhYmxlXG4gKiBAbWVtYmVyIHtzdHJpbmd9IG5hbWVcbiAqIEBtZW1iZXIge3N0cmluZ30gZGVzY3JpcHRpb25cbiAqIEBtZW1iZXIge251bWJlcn0gdHlwZVxuICogQG1lbWJlciB7Ym9vbGVhbn0gaXNOdWxsYWJsZVxuICogQG1lbWJlciB7Ym9vbGVhbn0gaXNQcmltYXJ5S2V5XG4gKiBAbWVtYmVyIHtib29sZWFufSBoYXNEZWZhdWx0XG4gKi9cbmV4cG9ydCBjbGFzcyBDb2x1bW4ge1xuICBjb25zdHJ1Y3RvciAoe1xuICAgIF9udW0sXG4gICAgdGFibGUsXG4gICAgbmFtZSxcbiAgICBkZXNjcmlwdGlvbixcbiAgICB0eXBlLFxuICAgIGlzTnVsbGFibGUgPSB0cnVlLFxuICAgIGlzUHJpbWFyeUtleSxcbiAgICBoYXNEZWZhdWx0ID0gZmFsc2UsXG4gIH0pIHtcbiAgICB0aGlzLl9udW0gPSBfbnVtXG4gICAgdGhpcy50YWJsZSA9IHRhYmxlXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMuZGVzY3JpcHRpb24gPSBkZXNjcmlwdGlvblxuICAgIHRoaXMudHlwZSA9IHR5cGVcbiAgICB0aGlzLmlzTnVsbGFibGUgPSBpc051bGxhYmxlXG4gICAgdGhpcy5pc1ByaW1hcnlLZXkgPSBpc1ByaW1hcnlLZXlcbiAgICB0aGlzLmhhc0RlZmF1bHQgPSBoYXNEZWZhdWx0XG4gIH1cblxuICBnZXRGaWVsZE5hbWUgKCkge1xuICAgIHJldHVybiBjYW1lbENhc2VJbnNpZGVVbmRlcnNjb3Jlcyh0aGlzLm5hbWUpXG4gIH1cblxuICBnZXRNYXJrZG93bkZpZWxkTmFtZSAoKSB7XG4gICAgcmV0dXJuIGBcXGAke3RoaXMuZ2V0RmllbGROYW1lKCl9XFxgYFxuICB9XG5cbiAgLyoqXG4gICAqIEdldHMgYW4gZW51bSBiYXNlZCBvbiB0aGUgY29sdW1u4oCZcyB0eXBlLiBJZiB0aGVyZSBpcyBubyBlbnVtIGZvciB0aGVcbiAgICogY29sdW1u4oCZcyB0eXBlLCBudWxsIGlzIHJldHVybmVkLlxuICAgKlxuICAgKiBAcmV0dXJucyB7P0VudW19XG4gICAqL1xuICBnZXRFbnVtICgpIHtcbiAgICByZXR1cm4gdGhpcy50YWJsZS5zY2hlbWEuY2F0YWxvZy5nZXRBbGxFbnVtcygpLmZpbmQoKHsgX29pZCB9KSA9PiBfb2lkID09PSB0aGlzLnR5cGUpXG4gIH1cbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGEgdXNlciBkZWZpbmVkIGVudW0gUG9zdGdyZVNRTCBjb2x1bW4uXG4gKlxuICogQG1lbWJlciB7U2NoZW1hfSBzY2hlbWFcbiAqIEBtZW1iZXIge3N0cmluZ30gbmFtZVxuICogQG1lbWJlciB7c3RyaW5nW119IHZhcmlhbnRzXG4gKi9cbmV4cG9ydCBjbGFzcyBFbnVtIHtcbiAgY29uc3RydWN0b3IgKHsgX29pZCwgc2NoZW1hLCBuYW1lLCB2YXJpYW50cyB9KSB7XG4gICAgdGhpcy5fb2lkID0gX29pZFxuICAgIHRoaXMuc2NoZW1hID0gc2NoZW1hXG4gICAgdGhpcy5uYW1lID0gbmFtZVxuICAgIHRoaXMudmFyaWFudHMgPSB2YXJpYW50c1xuICB9XG59XG5cbi8qKlxuICogQSBmb3JlaWduIGtleSBkZXNjcmliaW5nIGEgcmVmZXJlbmNlIGJldHdlZW4gb25lIHRhYmxlIGFuZCBhbm90aGVyLlxuICpcbiAqIEBtZW1iZXIge0NhdGFsb2d9IGNhdGFsb2dcbiAqIEBtZW1iZXIge1RhYmxlfSBuYXRpdmVUYWJsZVxuICogQG1lbWJlciB7Q29sdW1uW119IG5hdGl2ZUNvbHVtbnNcbiAqIEBtZW1iZXIge1RhYmxlfSBmb3JlaWduVGFibGVcbiAqIEBtZW1iZXIge0NvbHVtbltdfSBmb3JlaWduQ29sdW1uc1xuICovXG5leHBvcnQgY2xhc3MgRm9yZWlnbktleSB7XG4gIGNvbnN0cnVjdG9yICh7IGNhdGFsb2csIG5hdGl2ZVRhYmxlLCBuYXRpdmVDb2x1bW5zLCBmb3JlaWduVGFibGUsIGZvcmVpZ25Db2x1bW5zIH0pIHtcbiAgICB0aGlzLmNhdGFsb2cgPSBjYXRhbG9nXG4gICAgdGhpcy5uYXRpdmVUYWJsZSA9IG5hdGl2ZVRhYmxlXG4gICAgdGhpcy5uYXRpdmVDb2x1bW5zID0gbmF0aXZlQ29sdW1uc1xuICAgIHRoaXMuZm9yZWlnblRhYmxlID0gZm9yZWlnblRhYmxlXG4gICAgdGhpcy5mb3JlaWduQ29sdW1ucyA9IGZvcmVpZ25Db2x1bW5zXG4gIH1cbn1cbiJdfQ==