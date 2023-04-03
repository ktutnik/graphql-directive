import { getDirective } from "@graphql-tools/utils"
import { GraphQLArgumentConfig, GraphQLFieldConfigArgumentMap, GraphQLInputFieldConfig, GraphQLInputType, GraphQLResolveInfo, GraphQLSchema, getNamedType, isListType, isNonNullType } from "graphql"

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

export type DirectiveInvokerPipeline<T> = {
    addInputField: (config: GraphQLInputFieldConfig, name: string, type: string, schema: GraphQLSchema) => GraphQLInputFieldConfig
    invoke: (value: any, path:string, argsConfig: GraphQLFieldConfigArgumentMap, resolverArgs: ResolverArgs) => Promise<T[]>
}

type FieldPipeline<T> = {
    name: string,
    invoke: (value: any, path: string, resolverArgs: ResolverArgs) => Promise<T[]>
}

type TypePipeLine<T> = FieldPipeline<T> & { children: FieldPipeline<T>[] }

const createMemberInvoker = <T>(name: string): TypePipeLine<T> => {
    const children: TypePipeLine<T>[] = []
    return {
        name,
        children,
        invoke: async (value, path, resolverArgs) => {
            const result = await Promise.all(children.map(child => {
                return child.invoke(value[child.name], path + "." + child.name, resolverArgs)
            }))
            return result.flat()
        }
    }
}

export const createDirectiveInvoker = <T>(name: string, hook: InvokerHook<T>, directives: Record<string, any>[], next: TypePipeLine<T> | [TypePipeLine<T>] | undefined): FieldPipeline<T> => {

    const proceed = async (next: TypePipeLine<T> | undefined, value: any, path: string, resolverArgs: ResolverArgs) => {
        const nextResult = !!next ? await next.invoke(value, path, resolverArgs) : []
        const [parent, args, contextValue, info] = resolverArgs
        const hookResult = directives.length > 0 ? await hook(value, { directives, parent, args, contextValue, info, path }) : []
        return [...nextResult, ...hookResult]
    }

    return {
        name,
        invoke: async (value, path, resolverArgs) => {
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

export const createDirectiveInvokerPipeline = <T>(directive: string, hook: InvokerHook<T>): DirectiveInvokerPipeline<T> => {
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
            const pipe = pipelines[type] ?? (pipelines[type] = createMemberInvoker(type))
            const dataType = getPipelineByType(config.type)
            pipe.children.push(createDirectiveInvoker(name, hook, directives, dataType))
            return config
        },
        invoke: async (value, initPath, configs, resolverArgs) => {
            const result = await Promise.all(Object.keys(configs).map(async (key) => {
                const config = configs[key]
                const dataType = getPipelineByType(config.type)
                const directives = getDirective(resolverArgs[3].schema, config, directive) ?? []
                const pipe = createDirectiveInvoker(key, hook, directives, dataType)
                const path = [initPath, key].filter(Boolean).join(".")
                return pipe.invoke(value[key], path, resolverArgs)
            }))
            return result.flat()
        }
    }
}