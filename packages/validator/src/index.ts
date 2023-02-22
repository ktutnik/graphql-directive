import { GraphQLSchema, defaultFieldResolver, graphql, GraphQLResolveInfo, GraphQLFieldConfig, Kind, GraphQLFieldResolver } from 'graphql'
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'


interface TypeConfig {
    kind: "Type" 
    name: String
    properties: FieldConfig[]
}

interface FieldConfig {
    kind: "Field",
    parentType:string
    name: string
    dataType: string
    validators: any[]
}

interface ArgumentConfig {
    kind: "ArgumentConfig"
    dataType: string
    field: string
    name: string
    validators: any[]
}

const types: { [key: string]: { property: string, type: string }[] } = {}

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

const transform = (schema) => mapSchema(schema, {
    [MapperKind.INPUT_OBJECT_FIELD]: (config, name, type, sch) => {
        const upperDirective = getDirective(schema, config, "validate")
        if ((upperDirective?.length ?? 0) > 0) {
            const returnType = config.astNode?.type
            if (returnType?.kind === Kind.NON_NULL_TYPE && returnType.type.kind === Kind.NAMED_TYPE) {
                types[type] = types[type] ?? []
                types[type].push({ property: name, type: returnType.type.name.value })
            }
            return config
        }
    },
    [MapperKind.ARGUMENT]: (config, name, type, sch) => {
        const upperDirective = getDirective(sch, config, "validate")
        if ((upperDirective?.length ?? 0) > 0) {
            return config
        }
    },
    [MapperKind.OBJECT_FIELD]: (config, name, type, sch) => {
        types[type] = types[type] ?? []
        types[type].push({ property: name, type: "Abc" })
        if (name === "addUser") {
            const { resolve = defaultFieldResolver } = config
            return {
                ...config,
                resolve: (source, args, ctx, info) => {
                    return resolve(source, args, ctx, info)
                }
            }
        }
    },
})



const resolver:GraphQLFieldResolver<any, any> = (parent, args, ctx, info) => {

}

export default {
    typeDefs, transform
}
