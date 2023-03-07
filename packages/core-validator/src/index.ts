import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { defaultFieldResolver, GraphQLError, GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLResolveInfo, GraphQLSchema } from "graphql"
import { Path } from "graphql/jsutils/Path"

// ====================================================== //
// ======================== TYPES ======================= //
// ====================================================== //

export type FieldValidator = (val: any, ctx: ValidatorContext) => Promise<ErrorMessage[] | true>

export type Validator = (val: any, ctx: ValidatorContext) => (string | true) | Promise<(string | true)>

export interface TypeValidationConfig {
    kind: "Type"
    name: String
    fields: FieldValidationConfig[]
}

export interface FieldValidationConfig {
    kind: "Field",
    name: string
    validator: FieldValidator
}

export interface DirectiveArgs {
    method: string,
    message: string,
    min: number,
    max: number
}

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

export interface ValidatorContext {
    /**
     * Contains options values of transformer
     */
    options: TransformerOptions,

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

    /**
     * Contains argument passed by the @validate directive. For example `@validate(method: LENGTH, min: 1, max: 150)`, the `args` parameter will contains `{ method: LENGTH, min: 1, max: 150 }`.
     */
    directiveArgs: any
}


export { GraphQLSchema }


// ====================================================== //
// ====================== FUNCTIONS ===================== //
// ====================================================== //

const transform = (schema: GraphQLSchema, options: TransformerOptions): GraphQLSchema => {
    type FieldInfo = { name: string, isArray: boolean, dataType: string }

    const configurations: { [key: string]: TypeValidationConfig } = {}

    const getValidateDirectives = (config: GraphQLInputFieldConfig | GraphQLFieldConfig<any, any>) => getDirective(schema, config, options.directive) as DirectiveArgs[] ?? []

    const getFieldInfo = (config: GraphQLInputFieldConfig | GraphQLFieldConfig<any, any>) => {
        const rawTypeName = config.type.toString().replace("!", "")
        const isArray = rawTypeName.startsWith("[")
        const dataType = isArray ? rawTypeName.substring(1, rawTypeName.length - 1) : rawTypeName
        const name = config.astNode!.name.value
        return { name, isArray, dataType }
    }

    const joinContext = (ctx: ValidatorContext, ...paths: string[]): ValidatorContext => ({ ...ctx, path: [ctx.path, ...paths].filter(x => x !== "").join(".") })

    const composeValidationResult = (results: (true | ErrorMessage[])[]) => {
        const messages = results.filter((x): x is ErrorMessage[] => x !== true).flat()
        return messages.length > 0 ? messages : true
    }

    const createValidatorByDirectives = (path: string, directives: DirectiveArgs[]): FieldValidator => {
        const fieldVal = (validator: Validator, args:any): FieldValidator => async (val, ctx) => {
            const message = await validator(val, {...ctx, directiveArgs: args})
            return message !== true ? [{ message, path: ctx.path }] : true
        }
        const validators = directives.map((args) =>
            fieldVal(options.plugins[args.method], args))
        return async (val: any, ctx: ValidatorContext) => {
            const results = await Promise.all(validators.map(v => v(val[path], joinContext(ctx, path))))
            return composeValidationResult(results)
        }
    }

    const createValidatorByField = (info: FieldInfo, fieldConfigs: FieldValidationConfig[]): FieldValidator => {
        const validator = composeValidator(...fieldConfigs.map(x => x.validator))
        return async (val: any, ctx: ValidatorContext) => {
            const value = val[info.name]
            if (info.isArray && Array.isArray(value)) {
                const values = await Promise.all(value.map((val, i) => validator(val, joinContext(ctx, info.name, i.toString()))))
                return composeValidationResult(values)
            }
            else return validator(value, joinContext(ctx, info.name))
        }
    }

    const composeValidator = (...validators: FieldValidator[]): FieldValidator => {
        return async (val: any, ctx: ValidatorContext) => {
            const results = await Promise.all(validators.map(v => v(val, ctx)))
            return composeValidationResult(results)
        }
    }


    return mapSchema(schema, {
        [MapperKind.INPUT_OBJECT_FIELD]: (config, name, type, sch) => {
            const getParentConfig = (type: string) => configurations[type] ?? (configurations[type] = { fields: [], kind: "Type", name: type })
            const directives = getValidateDirectives(config)
            const info = getFieldInfo(config)
            const dataTypeConfig = configurations[info.dataType]
            if (directives.length > 0 || !!dataTypeConfig) {
                const parent = getParentConfig(type)
                const fields = (dataTypeConfig && dataTypeConfig.fields) ?? []
                const validator = composeValidator(
                    createValidatorByDirectives(info.name, directives),
                    createValidatorByField(info, fields))
                parent.fields = [...parent.fields, { kind: "Field", name, validator }]
                return config
            }
        },
        [MapperKind.OBJECT_FIELD]: (config, fieldName, type, sch) => {
            const getPath = (path: Path | undefined): string => !!path ? `${getPath(path.prev)}.${path.key}` : ""
            const validators: FieldValidationConfig[] = []
            for (const key in config.args) {
                const argConfig = config.args[key]
                const directives = getValidateDirectives(argConfig)
                const info = getFieldInfo(argConfig)
                const dataTypeConfig = configurations[info.dataType]
                if (directives.length > 0 || !!dataTypeConfig) {
                    const fields = (dataTypeConfig && dataTypeConfig.fields) ?? []
                    const validator = composeValidator(
                        createValidatorByDirectives(info.name, directives),
                        createValidatorByField(info, fields))
                    validators.push({ kind: "Field", name: info.name, validator })
                }
            }
            if (validators.length > 0) {
                const validator = composeValidator(...validators.map(x => x.validator))
                const { resolve = defaultFieldResolver } = config
                return {
                    ...config,
                    resolve: async (parent, args, context, info) => {
                        const path = getPath(info.path).substring(1)
                        const error = await validator(args, {
                            path, options, args, info, parent,
                            contextValue: context,
                            directiveArgs: {}
                        })
                        if (error !== true) {
                            throw new GraphQLError("USER_INPUT_ERROR", { extensions: { error } })
                        }
                        return resolve(parent, args, context, info)
                    }
                }
            }
        }
    })
}

export const createTransformer = (option: TransformerOptions) =>
    (schema: GraphQLSchema, opt: { customValidators?: Plugins } = {}): GraphQLSchema => {
        const customValidatorsPlugin: Plugins = {
            CUSTOM: (val, ctx) => opt.customValidators![ctx.directiveArgs.validator](val, ctx)
        }
        const plugins: Plugins = { ...option.plugins, ...customValidatorsPlugin }
        return transform(schema, { ...option, ...opt, plugins })
    }
