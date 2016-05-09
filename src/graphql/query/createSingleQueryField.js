import { GraphQLNonNull, GraphQLID } from 'graphql'
import { fromID } from '../types.js'
import createTableType from '../createTableType.js'
import resolveTableSingle from '../resolveTableSingle.js'

/**
 * Creates an object field for selecting a single row of a table.
 *
 * @param {Table} table
 * @returns {GraphQLFieldConfig}
 */
const createSingleQueryField = table => {
  const primaryKeyColumns = table.getPrimaryKeyColumns()

  // Can’t query a single node of a table if it does not have a primary key.
  if (primaryKeyColumns.length === 0)
    return null

  return {
    type: createTableType(table),
    description: `Queries a single ${table.getMarkdownTypeName()} using its primary keys.`,

    args: {
      id: {
        type: new GraphQLNonNull(GraphQLID),
      },
    },

    resolve: resolveTableSingle(
      table,
      primaryKeyColumns,
      (source, {id}) => {
        return [id]
      }
    ),
  }
}

export default createSingleQueryField
