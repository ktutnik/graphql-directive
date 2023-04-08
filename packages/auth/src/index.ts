import { InvocationContext, InvokerHook, createDirectiveInvokerPipeline, createDirectiveInvoker } from "@graphql-directive/core"
import { MapperKind, mapSchema, getDirective } from "@graphql-tools/utils"
import { GraphQLError, GraphQLSchema, OperationTypeNode, defaultFieldResolver, isNonNullType } from "graphql"
import { Path } from "graphql/jsutils/Path"

const typeDefs = /* GraphQL */ `
    directive @authorize(
        policy: String!
    ) on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION | FIELD_DEFINITION
`

export type AuthorizeContext = Omit<InvocationContext, "directives"> & { directiveArgs: any }

export type PolicyFunction = (ctx: AuthorizeContext) => boolean | Promise<boolean>

export type AuthorizeOptions = {
    policies: Record<string, PolicyFunction>
    queryResolution: "ThrowError" | "Filter"
}

const transform = (schema: GraphQLSchema, options: AuthorizeOptions): GraphQLSchema => {
    const directiveName = "authorize"
    const getPath = (path: Path | undefined): string => !!path ? [getPath(path.prev), path.key].filter(Boolean).join(".") : ""

    const hook: InvokerHook<string> = async (value, { directives, ...ctx }) => {
        const policies = (directives[0].policy as string).split(",").map(x => x.trim())
        const result = await Promise.all(policies.map(name => {
            const policy = options.policies[name]
            if (!policy) throw Error(`Unknown policy "${name}" on ${ctx.path}`)
            return policy({ ...ctx, directiveArgs: policy })
        }))
        return result.some(v => v) ? [] : [ctx.path]
    }

    const pipeline = createDirectiveInvokerPipeline(directiveName, hook)

    return mapSchema(schema, {
        [MapperKind.INPUT_OBJECT_FIELD]: pipeline.addInputField,
        [MapperKind.OBJECT_FIELD]: (config, name, type, schema) => {
            const isNotNull = isNonNullType(config.type)
            const directives = getDirective(schema, config, directiveName) ?? []
            if (directives.length > 0 && options.queryResolution === "Filter" && type !== "Mutation" && isNotNull)
                throw new Error(`Nullable data type is required on ${type}.${name} when Filter resolution enable`)
            const invoker = createDirectiveInvoker(name, hook, directives, undefined)
            const { resolve = defaultFieldResolver } = config
            return {
                ...config,
                resolve: async (parent, args, context, info) => {
                    const operation = info.operation.operation
                    const path = getPath(info.path)
                    const [inputError, fieldError] = await Promise.all([
                        pipeline.invoke(args, path, config.args!, [parent, args, context, info]),
                        invoker.invoke(args, path, [parent, args, context, info])
                    ]);
                    if (inputError.length > 0) {
                        throw new GraphQLError("AUTHORIZATION_ERROR", { extensions: { paths: inputError } })
                    }
                    if (fieldError.length === 0) {
                        return resolve(parent, args, context, info)
                    }
                    if (operation === OperationTypeNode.MUTATION) {
                        throw new GraphQLError("AUTHORIZATION_ERROR", { extensions: { paths: fieldError } })
                    }
                    if (options.queryResolution === "ThrowError") {
                        throw new GraphQLError("AUTHORIZATION_ERROR", { extensions: { paths: fieldError } })
                    }
                    return undefined
                }
            }
        }
    })
}

const createTransformer = (options: Partial<AuthorizeOptions>) => {
    return (schema: GraphQLSchema) => transform(schema, { ... { policies: {}, queryResolution: "Filter" }, ...options })
}

export default {
    typeDefs, createTransformer, 
}