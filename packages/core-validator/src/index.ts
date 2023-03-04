import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { defaultFieldResolver, GraphQLError, GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLSchema } from "graphql"
import { Path } from "graphql/jsutils/Path"

// ====================================================== //
// ======================== TYPES ======================= //
// ====================================================== //

export interface TypeValidationConfig {
    kind: "Type"
    name: String
    fields: FieldValidationConfig[]
}

export interface FieldValidationConfig {
    kind: "Field",
    name: string
    validator: Validator
}

export interface DirectiveArgs {
    method: string,
    min: number,
    max: number
}

export interface ErrorMessage {
    path: string,
    message: string
}

export interface Plugins {
    [key: string]: (config: any) => NativeValidator
}

export interface TransformerOptions { 
    plugins: Plugins, 
    directive: string 
}

export type NativeValidator = (val: any) => string | true

export type Validator = (val: any) => ErrorMessage[] | true

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

    const fixErrorMessagePath = (messages: ErrorMessage[], root?: string) =>
        messages.map<ErrorMessage>((e) => ({ path: [root, e.path].filter(x => x !== "").join("."), message: e.message }))

    const composeValidationResult = (results: (true | ErrorMessage[])[], path: string = "") => {
        const messages: ErrorMessage[] = []
        for (const result of results) {
            if (result !== true) {
                messages.push(...result)
            }
        }
        return messages.length > 0 ? fixErrorMessagePath(messages, path) : true
    }

    const createValidatorByDirectives = (path: string, directives: DirectiveArgs[]): Validator => {
        const validators: NativeValidator[] = directives.map(({ method, ...config }) => options.plugins[method](config))
        return (value: any) => {
            const messages: ErrorMessage[] = []
            for (const validator of validators) {
                const message = validator(value[path])
                if (message !== true) messages.push({ message, path: "" })
            }
            return composeValidationResult([messages], path)
        }
    }

    const createValidatorByField = (info: FieldInfo, fieldConfigs: FieldValidationConfig[]) => {
        const validator = composeValidator(...fieldConfigs.map(x => x.validator))
        return (val: any) => {
            const value = val[info.name]
            if (info.isArray && Array.isArray(value)) {
                const result: ErrorMessage[] = []
                for (const [i, val] of value.entries()) {
                    const msg = validator(val)
                    if (msg !== true)
                        result.push(...fixErrorMessagePath(msg, i.toString()))
                }
                return composeValidationResult([result], info.name)
            }
            else return composeValidationResult([validator(value)], info.name)
        }
    }


    const composeValidator = (...validators: Validator[]): Validator => {
        return (val: any) => {
            const messages: ErrorMessage[] = []
            for (const validator of validators) {
                const result = validator(val)
                if (result !== true) messages.push(...result)
            }
            return composeValidationResult([messages])
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
                    resolve: (source, args, context, info) => {
                        const valid = validator(args)
                        if (valid !== true) {
                            const path = getPath(info.path).substring(1)
                            throw new GraphQLError("USER_INPUT_ERROR", { extensions: { error: fixErrorMessagePath(valid, path) } })
                        }
                        return resolve(source, args, context, info)
                    }
                }
            }
        }
    })
}

export const createTransformer = (option: TransformerOptions) => (schema: GraphQLSchema): GraphQLSchema => transform(schema, option)
