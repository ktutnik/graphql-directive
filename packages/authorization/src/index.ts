import { MapperKind, mapSchema, SchemaMapper } from "@graphql-tools/utils"
import { getDirectiveValues, GraphQLInputObjectType, GraphQLInputObjectTypeConfig, GraphQLResolveInfo, GraphQLSchema, getNamedType, GraphQLInputFieldConfig, GraphQLArgumentConfig, GraphQLFieldConfigArgumentMap } from "graphql"

// ====================================================== //
// ======================== TYPES ======================= //
// ====================================================== //


interface InvocationContext {
    path: string
    parentValue: any
    resolverArgs: [any, any, any, GraphQLResolveInfo]
}

type Invocable = (value: any, ctx: InvocationContext) => Promise<any>

interface Invocation {
    invoke(value: any, ctx: InvocationContext): Promise<any>
}

class FieldInvocation implements Invocation {
    invoke(value: any, ctx: InvocationContext): Promise<any> {
        throw new Error("Method not implemented.")
    }
}

class TypeInvocation implements Invocation {
    constructor(private name: string) { }

    fields: Record<string, Invocation> = {}

    invoke(value: any, { path, parentValue, ...ctx }: InvocationContext): Promise<unknown> {
        const context = { path: path + "." + this.name, parentValue: value, ...ctx }
        return Promise.all(Object.keys(this.fields).map(key => this.fields[key].invoke(value[key], context)))
    }
}



export { GraphQLSchema }


// ====================================================== //
// ====================== FUNCTIONS ===================== //
// ====================================================== //

type MapperHook<T> = (config: GraphQLInputFieldConfig | GraphQLArgumentConfig, name: string, type: string, sch:GraphQLSchema) => T
type Invoker<T> = (args:GraphQLFieldConfigArgumentMap) => T

function createFieldArgumentInvoker<T>(hook:MapperHook<T>): [SchemaMapper, Invoker<T>] {
    return [{}, ()]
}

const transform = (schema: GraphQLSchema): GraphQLSchema => {
    const [mapper, invoke] = createFieldArgumentInvoker((config) => {

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
