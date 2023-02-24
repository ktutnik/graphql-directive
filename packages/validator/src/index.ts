import { getDirective, MapperKind, mapSchema } from "@graphql-tools/utils"
import { defaultFieldResolver, GraphQLFieldConfig, GraphQLFieldResolver, GraphQLInputFieldConfig, GraphQLInputObjectType, Kind, ListTypeNode, NamedTypeNode, NonNullTypeNode, TypeNode } from "graphql"

import { DirectiveArgs, FieldConfig, TypeConfig, Validator } from "./core"
import validators from "./validator"

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

const transform = (schema) => {
    const getValidateDirectives = (config: GraphQLInputFieldConfig) => getDirective(schema, config, "validate") ?? []

    const isDataTypeHasValidators = (config: GraphQLInputFieldConfig) => config.type instanceof GraphQLInputObjectType && configurations[config.type.name]

    const getTypeInfo = (node: TypeNode): string | [string] => {
        const getSingleName = (node: NamedTypeNode | NonNullTypeNode): string => {
            if (node.kind === Kind.NAMED_TYPE) return node.name.value
            else
                if (node.type.kind === Kind.NAMED_TYPE) return node.type.name.value
                else getCollectionName(node.type)
        }
        const getCollectionName = (node: ListTypeNode): [string] => {
            if (node.type.kind === Kind.NON_NULL_TYPE || node.type.kind === Kind.NAMED_TYPE)
                return [getSingleName(node.type)]
            else return getCollectionName(node.type)
        }
        if (node.kind === Kind.LIST_TYPE) return getCollectionName(node)
        else getTypeInfo(node)
    }

    return mapSchema(schema, {
        [MapperKind.INPUT_OBJECT_FIELD]: (config, name, type, sch) => {
            const directives = getValidateDirectives(config) as DirectiveArgs[]
            if (directives.length > 0 || isDataTypeHasValidators(config)) {
                const dataType = config.type.toString().replace("!", "")
                const parent = configurations[type] ?? (configurations[type] = { fields: [], kind: "Type", name: type })
                parent.fields = [...parent.fields, { kind: "Field", dataType, name, validators: directives, arguments: [] }]
                return config
            }
        },
        [MapperKind.ARGUMENT]: (config, name, type, sch) => {
            const directives = getValidateDirectives(config) as DirectiveArgs[]
            if (directives.length > 0 || isDataTypeHasValidators(config)) {
                const dataType = config.type.toString().replace("!", "")
                const parent = configurations[type] ?? (configurations[type] = { fields: [], kind: "Type", name: type })
                let field = parent.fields.find(x => x.name === name)
                if (!field) {
                    field = { kind: "Field", dataType, name, validators: directives, arguments: [] }
                    parent.fields = [...parent.fields, field]
                }
                const typ = getTypeInfo(config.astNode.type)
                field.arguments = [...field.arguments, { kind: "Argument", dataType: typ, name: config.astNode.name.value, validators: directives }]
                return config
            }
        },
        [MapperKind.OBJECT_FIELD]: (config, name, type, sch) => {
            if (name === "addUser") {
                const { resolve = defaultFieldResolver } = config
                return {
                    ...config,
                    resolve: (source, args, ctx, info) => {
                        const fields = info.parentType.getFields()
                        fields[0].args[0].name
                        return resolve(source, args, ctx, info)
                    }
                }
            }
        },
    })
}

const createValidator = (config: FieldConfig | TypeConfig): Validator => {

    const getValidatorFunctions = (config: FieldConfig) => config.validators.map<Validator>(({ method, ...config }) => validators[method](config))

    const composeValidators = (validators: Validator[]) => {
        return (value: any) => {
            const result = validators.map(validate => validate(value))
                .filter((x): x is string[] => x !== true)
                .flat()
            return result.length === 0 ? true : result
        }
    }

    if (config.kind === "Field")
        return composeValidators(getValidatorFunctions(config))
    else
        return composeValidators(config.fields.map(c => getValidatorFunctions(c)).flat())
}

const createResolver = (config: GraphQLFieldConfig<any, any>): GraphQLFieldResolver<any, any> => {
    const { resolve = defaultFieldResolver } = config
    return (parent, params, ctx, info) => {
        const fields = info.parentType.getFields()
        const args = fields[config.astNode.name.value].args
        // if(info.parentType.getFields())
        return resolve(parent, params, ctx, info)
    }
}

const resolver: GraphQLFieldResolver<any, any> = (parent, args, ctx, info) => {

}

export default {
    typeDefs, transform
}
