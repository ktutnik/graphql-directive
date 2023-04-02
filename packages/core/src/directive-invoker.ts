import { getDirective } from "@graphql-tools/utils"
import { GraphQLArgumentConfig, GraphQLFieldConfigArgumentMap, GraphQLInputFieldConfig, GraphQLInputType, GraphQLResolveInfo, GraphQLSchema, getNamedType, isListType, isNonNullType } from "graphql"

export { GraphQLSchema }

export type ResolverArgs = [any, any, any, GraphQLResolveInfo]

export type InvocationContext = {
    /**
     * List all of directives arguments that is applied in the appropriate field
     */
    directives: Record<string, any>[]

    /**
     * The location of where validator applied from the root path through the GraphQL fields
     */
    path: string

    /**
     * An object shared across all resolvers that are executing for a particular operation. Use this to share per-operation state, including authentication information, dataloader instances, and anything else to track across resolvers.
     */
    contextValue: any

    /**
     * The return value of the resolver for this field's parent (i.e., the previous resolver in the resolver chain). 
     */
    parent: any

    /**
     * An object that contains all GraphQL arguments provided for this field.
     */
    args: any

    /**
     * Contains information about the operation's execution state, including the field name, the path to the field from the root, and more.
     */
    info: GraphQLResolveInfo

}

export type InvokerHook<T> = (value: any, ctx: InvocationContext) => Promise<T[]>


export type DirectiveInvoker<T> = {
    addInputField: (config: GraphQLInputFieldConfig, name: string, type: string, schema: GraphQLSchema) => GraphQLInputFieldConfig
    invoke: (value: any, path:string, argsConfig: GraphQLFieldConfigArgumentMap, resolverArgs: ResolverArgs) => Promise<T[]>
}

type FieldPipeline<T> = {
    name: string,
    proceed: (value: any, path: string, resolverArgs: ResolverArgs) => Promise<T[]>
}

type TypePipeLine<T> = FieldPipeline<T> & { children: FieldPipeline<T>[] }

const createTypePipeline = <T>(name: string): TypePipeLine<T> => {
    const children: TypePipeLine<T>[] = []
    return {
        name,
        children,
        proceed: async (value, path, resolverArgs) => {
            const result = await Promise.all(children.map(child => {
                return child.proceed(value[child.name], path + "." + child.name, resolverArgs)
            }))
            return result.flat()
        }
    }
}

const createChildPipeline = <T>(name: string, next: TypePipeLine<T> | [TypePipeLine<T>] | undefined, hook: InvokerHook<T>, directives: Record<string, any>[]): FieldPipeline<T> => {

    const proceed = async (next: TypePipeLine<T> | undefined, value: any, path: string, resolverArgs: ResolverArgs) => {
        if (value === null || value === undefined) return []
        const nextResult = !!next ? await next.proceed(value, path, resolverArgs) : []
        const [parent, args, contextValue, info] = resolverArgs
        const hookResult = directives.length > 0 ? await hook(value, { directives, parent, args, contextValue, info, path }) : []
        return [...nextResult, ...hookResult]
    }

    return {
        name,
        proceed: async (value, path, resolverArgs) => {
            if (value === null || value === undefined) return []
            if (Array.isArray(next)) {
                const result = await Promise.all((value as any[]).map((val, i) => {
                    return proceed(next[0], val, path + "." + i.toString(), resolverArgs)
                }))
                return result.flat()
            }
            else
                return proceed(next, value, path, resolverArgs)
        }
    }
}



export const createDirectiveInvoker = <T>(directive: string, hook: InvokerHook<T>): DirectiveInvoker<T> => {
    const pipelines: Record<string, TypePipeLine<T>> = {}

    const getPipelineByType = (type: GraphQLInputType): TypePipeLine<T> | [TypePipeLine<T>] | undefined => {
        const ast = getNamedType(type)
        const isList = isNonNullType(type) ? isListType(type.ofType) : isListType(type)
        const pipe = pipelines[ast.name]
        return isList ? [pipe] : pipe
    }

    return {
        addInputField: (config: GraphQLInputFieldConfig | GraphQLArgumentConfig, name: string, type: string, schema: GraphQLSchema) => {
            const directives = getDirective(schema, config, directive) ?? []
            const pipe = pipelines[type] ?? (pipelines[type] = createTypePipeline(type))
            const dataType = getPipelineByType(config.type)
            pipe.children.push(createChildPipeline(name, dataType, hook, directives))
            return config
        },
        invoke: async (value, initPath, configs, resolverArgs) => {
            const result = await Promise.all(Object.keys(configs).map(async (key) => {
                const config = configs[key]
                const dataType = getPipelineByType(config.type)
                const directives = getDirective(resolverArgs[3].schema, config, directive) ?? []
                const pipe = createChildPipeline(key, dataType, hook, directives)
                const path = [initPath, key].filter(Boolean).join(".")
                return pipe.proceed(value[key], path, resolverArgs)
            }))
            return result.flat()
        }
    }
}