import { MapperKind, mapSchema } from "@graphql-tools/utils"
import { GraphQLError, GraphQLSchema, defaultFieldResolver } from "graphql"
import { Path } from "graphql/jsutils/Path"
import { InvocationContext, createDirectiveInvokerPipeline } from "./directive-invoker"

// ====================================================== //
// ======================== TYPES ======================= //
// ====================================================== //

const errorCode = "GRAPHQL_VALIDATION_FAILED"

export type Validator = (val: any, ctx: ValidatorContext) => (string | true) | Promise<(string | true)>

export interface ErrorMessage {
    path: string,
    message: string,
}

export interface Plugins {
    [key: string]: Validator
}

export interface TransformerOptions {
    /**
     * List of plugins
     */
    plugins: Plugins,

    /**
     * Name of the directive
     */
    directive: string

    /**
     * List of custom validators
     */
    customValidators?: Plugins
}

export type ValidatorContext = Omit<InvocationContext, "directives"> & {
    /**
     * Contains options values of transformer
     */
    options: TransformerOptions,

    /**
     * Contains argument passed by the @validate directive. For example `@validate(method: LENGTH, min: 1, max: 150)`, the `args` parameter will contains `{ method: LENGTH, min: 1, max: 150 }`.
     */
    directiveArgs: any

}


// ====================================================== //
// ====================== FUNCTIONS ===================== //
// ====================================================== //

const transform = (schema: GraphQLSchema, options: TransformerOptions): GraphQLSchema => {
    const getPath = (path: Path | undefined): string => !!path ? [getPath(path.prev), path.key].filter(Boolean).join(".") : ""
    
    const invoker = createDirectiveInvokerPipeline("validate", async (value, { directives, ...ctx}) => {
        const result = await Promise.all(directives.map(directive => {
            return options.plugins[directive.method](value, { ...ctx, directiveArgs: directive, options })
        }))
        return result.filter((x): x is string => typeof x !== "boolean")
            .map(message => ({ message, path: ctx.path }))
    })

    return mapSchema(schema, {
        [MapperKind.INPUT_OBJECT_FIELD]: invoker.addInputField,
        [MapperKind.OBJECT_FIELD]: (config) => {
            const { resolve = defaultFieldResolver } = config
            return {
                ...config,
                resolve: async (parent, args, context, info) => {
                    const path = getPath(info.path)
                    const error = await invoker.invoke(args, path, config.args!, [parent, args, context, info])
                    if (error.length > 0) {
                        throw new GraphQLError(`Invalid value provided at ${path}`, { extensions: { code: errorCode, error } })
                    }
                    return resolve(parent, args, context, info)
                }
            }
        }
    })
}

export const createValidatorTransformer = (option: TransformerOptions) =>
    (schema: GraphQLSchema, opt: { customValidators?: Plugins } = {}): GraphQLSchema => {
        const customValidatorsPlugin: Plugins = {
            CUSTOM: (val, ctx) => opt.customValidators![ctx.directiveArgs.validator](val, ctx)
        }
        const plugins: Plugins = { ...option.plugins, ...customValidatorsPlugin }
        return transform(schema, { ...option, ...opt, plugins })
    }
