import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { defaultFieldResolver, GraphQLError, GraphQLFieldConfig, GraphQLInputFieldConfig, GraphQLInputType, GraphQLSchema } from "graphql"
import { Path } from "graphql/jsutils/Path"

import { DirectiveArgs, ErrorMessage, FieldConfig, Validator, TypeConfig, NativeValidator } from "./core"
import nativeValidators from "./validator"


const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
        EMAIL, ARRAY
    }
    directive @validate(
        method: ValidationMethod!, 
        min:Int, 
        max:Int
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

const transform = (schema: GraphQLSchema): GraphQLSchema => {
    const configurations: { [key: string]: TypeConfig } = {}

    const getValidateDirectives = (config: GraphQLInputFieldConfig | GraphQLFieldConfig<any, any>) => getDirective(schema, config, "validate") as DirectiveArgs[] ?? []

    const fixPath = (root: string, messages: ErrorMessage[]) =>
        messages.map<ErrorMessage>((e) => ({ path: [root, e.path].filter(x => x !== "").join("."), message: e.message }))

    const getDataType = (type: GraphQLInputType): { type: string, isArray: boolean } => {
        const data = type.toString().replace("!", "")
        return data.startsWith("[") ?
            { type: data.substring(1, data.length - 1), isArray: true } :
            { type: data, isArray: false }
    }

    const createValidatorByDirectives = (path:string, { method, ...config }: DirectiveArgs): Validator => {
        const val: NativeValidator = nativeValidators[method](config)
        return (value: any) => {
            const message = val(value)
            return message === true ? true : [{ message, path }]
        }
    }

    const createValidatorByField = (field: {name:string, isArray:boolean, dataType:string}) => {

    }


    const composeValidator = (path: string, ...validators: Validator[]): Validator => {
        const validate = (val: any) => {
            const messages: ErrorMessage[] = []
            for (const validator of validators) {
                const result = validator(path === "" ? val : val[path])
                if (result !== true) messages.push(...result)
            }
            return messages.length > 0 ? fixPath(path, messages) : true
        }
        const validateArray = (val: any) => {
            const messages = (val[path] as any[]).map(value => validate(value))
                .filter((x): x is ErrorMessage[] => x !== true)
                .flat();
            return messages.length > 0 ? fixPath(path, messages) : true
        }
        return isArray ? validateArray : validate
    }


    return mapSchema(schema, {
        [MapperKind.INPUT_OBJECT_FIELD]: (config, name, type, sch) => {
            const getParentConfig = (type: string) => configurations[type] ?? (configurations[type] = { fields: [], kind: "Type", name: type })
            const directives = getValidateDirectives(config)
            const dataType = getDataType(config.type)
            const dataTypeConfig = configurations[dataType.type]
            if (directives.length > 0 || !!dataTypeConfig) {
                const parent = getParentConfig(type)
                const fields = (dataTypeConfig && dataTypeConfig.fields) ?? []
                const validator = composeValidator(name, dataType.isArray,
                    ...directives.map(x => createValidatorByDirectives(x)),
                    ...fields.map(x => x.validator))
                parent.fields = [...parent.fields, { kind: "Field", name, validator }]
                return config
            }
        },
        [MapperKind.OBJECT_FIELD]: (config, fieldName, type, sch) => {
            const getPath = (path: Path | undefined): string => !!path ? `${getPath(path.prev)}.${path.key}` : ""
            const validators: FieldConfig[] = []
            for (const key in config.args) {
                const argConfig = config.args[key]
                const directives = getValidateDirectives(argConfig)
                const dataType = getDataType(argConfig.type)
                const name = argConfig.astNode!.name.value
                const dataTypeConfig = configurations[dataType.type]
                if (directives.length > 0 || !!dataTypeConfig) {
                    const fields = (dataTypeConfig && dataTypeConfig.fields) ?? []
                    const validator = composeValidator(name, dataType.isArray,
                        ...directives.map(x => createValidatorByDirectives(x)),
                        ...fields.map(x => x.validator))
                    validators.push({ kind: "Field", name, validator })
                }
            }
            if (validators.length > 0) {
                const validator = composeValidator("", false, ...validators.map(x => x.validator))
                const { resolve = defaultFieldResolver } = config
                return {
                    ...config,
                    resolve: (source, args, context, info) => {
                        const valid = validator(args)
                        if (valid !== true) {
                            const path = getPath(info.path).substring(1)
                            throw new GraphQLError("USER_INPUT_ERROR", { extensions: { error: fixPath(path, valid) } })
                        }
                        return resolve(source, args, context, info)
                    }
                }
            }
        }
    })
}

export default {
    typeDefs, transform
}
