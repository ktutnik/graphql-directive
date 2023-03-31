import { MapperKind, mapSchema, SchemaMapper } from "@graphql-tools/utils"
import { GraphQLArgumentConfig, GraphQLFieldConfigArgumentMap, GraphQLInputFieldConfig, GraphQLResolveInfo, GraphQLSchema } from "graphql"

// ====================================================== //
// ======================== TYPES ======================= //
// ====================================================== //


export { GraphQLSchema }


// ====================================================== //
// ====================== FUNCTIONS ===================== //
// ====================================================== //

interface InvocationContext {
    path: string
    parentValue: any
    mapperArgs: {
        config: GraphQLInputFieldConfig | GraphQLArgumentConfig, 
        name: string, 
        type: string, 
        schema: GraphQLSchema
    }
    resolverArgs: [any, any, any, GraphQLResolveInfo]
}

type MapperHook<T> = (value:any, ctx: InvocationContext) => T
type Invoker<T> = (args:GraphQLFieldConfigArgumentMap) => T

function createDirectiveInvoker<T>(hook:MapperHook<T>): [SchemaMapper, Invoker<T>] {

    return [{}, ()]
}

const transform = (schema: GraphQLSchema): GraphQLSchema => {
    const [mapper, invoke] = createDirectiveInvoker((value, ctx) => {

    })

    return mapSchema(schema, {
        ...mapper,
        [MapperKind.OBJECT_FIELD]: (config, fieldName, type, sch) => {
            if (fieldName === "addUser") {
                const result = await invoke(config.args!)
                return config
            }
        },

    })
}

export const createTransformer = () =>
    (schema: GraphQLSchema): GraphQLSchema => {
        return transform(schema)
    }
