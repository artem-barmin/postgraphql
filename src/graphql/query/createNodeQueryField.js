import { memoize } from 'lodash'
import { GraphQLNonNull, GraphQLID } from 'graphql'
import { NodeType, fromID } from '../types.js'
import resolveTableSingle from '../resolveTableSingle.js'

const createNodeQueryField = schema => ({
  type: NodeType,
  description: 'Fetches an object given its globally unique `ID`.',

  args: {
    id: {
      type: new GraphQLNonNull(GraphQLID),
      description: 'The `ID` of the node.',
    },
  },

  resolve: (source, args, context) => {
    const { id } = args
    const { tableName, values } = fromID(id)
    const table = schema.getTable(tableName)

    if (!table)
      throw new Error(`No table '${tableName}' in schema '${schema.name}'.`)

    return getResolver(table)({ values }, {}, context)
  },
})

export default createNodeQueryField

// This function will be called for every resolution, therefore it is (and
// must be) memoized.
const getResolver = memoize(table => resolveTableSingle(
  table,
  table.getPrimaryKeyColumns(),
  ({ values }) => values,
))
