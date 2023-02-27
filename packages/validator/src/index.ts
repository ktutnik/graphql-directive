import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { defaultFieldResolver, GraphQLError, GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLFieldResolver, GraphQLInputFieldConfig, GraphQLInputObjectType, GraphQLInputType, GraphQLSchema, Kind, ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from "graphql"

import { DirectiveArgs, ErrorMessage, FieldConfig, ObjectValidator, TypeConfig, Validator } from "./core"
import nativeValidators from "./validator"

const configurations: { [key: string]: TypeConfig } = {}

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
    const getValidateDirectives = (config: GraphQLInputFieldConfig | GraphQLFieldConfig<any, any>) => getDirective(schema, config, "validate") as DirectiveArgs[] ?? []


    const createFieldValidator = (path: string, directives: DirectiveArgs[]): ObjectValidator => {
        const fieldValidator = directives.map<Validator>(({ method, ...config }) => nativeValidators[method](config))
        const validator: ObjectValidator = (val) => {
            if (val === null || val === undefined) return true
            // validate field
            const fieldError = fieldValidator.map(v => v(val))
                .filter((x): x is string[] => x !== true)
                .flat()
            return fieldError.length > 0 ? [{ path, message: fieldError }] : true
        }
        return validator
    }

    const createObjectValidator = (path: string, fields: FieldConfig[]): ObjectValidator => {
        const validator: ObjectValidator = (val) => {
            if (val === null || val === undefined) return true
            const messages = fields.map(v => v.validator(val[v.name]))
                .filter((x): x is ErrorMessage[] => x !== true)
                .flat()
                .map<ErrorMessage>(e => ({
                    message: e.message,
                    path: [path, e.path].filter(x => x !== "").join(".")
                }))
            return messages.length > 0 ? messages : true
        }
        return validator
    }

    const composeValidator = (...validators: ObjectValidator[]): ObjectValidator => {
        return (val: any) => {
            const messages = validators.map(v => v(val))
                .filter((x): x is ErrorMessage[] => x !== true)
                .flat();
            return messages.length > 0 ? messages : true
        }
    }


    return mapSchema(schema, {
        [MapperKind.INPUT_OBJECT_FIELD]: (config, name, type, sch) => {
            const getParentConfig = (type: string) => configurations[type] ?? (configurations[type] = { fields: [], kind: "Type", name: type })
            const directives = getValidateDirectives(config)
            const dataType = config.type.toString().replace("!", "")
            const dataTypeConfig = configurations[dataType]
            if (directives.length > 0 || !!dataTypeConfig) {
                const parent = getParentConfig(type)
                const fields = (dataTypeConfig && dataTypeConfig.fields) ?? []
                const validator = composeValidator(
                    createFieldValidator(name, directives),
                    createObjectValidator(name, fields))
                parent.fields = [...parent.fields, { kind: "Field", name, validator }]
                return config
            }
        },
        [MapperKind.OBJECT_FIELD]: (config, fieldName, type, sch) => {
            const validators: FieldConfig[] = []
            for (const key in config.args) {
                const argConfig = config.args[key]
                const directives = getValidateDirectives(argConfig)
                const dataType = argConfig.type.toString().replace("!", "")
                const name = argConfig.astNode!.name.value
                const dataTypeConfig = configurations[dataType]
                if (directives.length > 0 || !!dataTypeConfig) {
                    const fields = (dataTypeConfig && dataTypeConfig.fields) ?? []
                    const validator = composeValidator(
                        createFieldValidator(name, directives),
                        createObjectValidator(name, fields))
                    validators.push({ kind: "Field", name, validator })
                }
            }
            if (validators.length > 0) {
                const validator = createObjectValidator("", validators)
                const { resolve = defaultFieldResolver } = config
                return {
                    ...config,
                    resolve: (source, args, context, info) => {
                        const error = validator(args)
                        if (error !== true) throw new GraphQLError("USER_INPUT_ERROR", { extensions: { error } })
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
