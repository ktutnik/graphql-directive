import { GraphQLSchema, defaultFieldResolver, graphql, GraphQLResolveInfo, GraphQLFieldConfig } from 'graphql'
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils'

/**
 * An object representing the context of a GraphQL directive.
 * @typedef {Object} DirectiveContext
 * @property {[any, any, any, GraphQLResolveInfo]} resolverArgs - Arguments passed to the resolver function as an array, in the order [parent, args, context, info]. See https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments for more information.
 * @property {any} directiveArgs - Arguments passed to the directive.
 * @property {GraphQLFieldConfig<any, any>} fieldConfig - The GraphQL field configuration for the field on which the directive is applied.
 */
type DirectiveContext = {
    /**
     * Arguments passed to the resolver function as an array, in the order [parent, args, context, info]. See https://www.apollographql.com/docs/apollo-server/data/resolvers/#resolver-arguments for more information.
     */
    resolverArgs: [any, any, any, GraphQLResolveInfo]

    /**
     * Arguments passed to the directive.
     */
    directiveArgs: any

    /**
     * The GraphQL field configuration for the field on which the directive is applied.
     */
    fieldConfig: GraphQLFieldConfig<any, any>
}

/**
 * A function that takes a GraphQL schema and returns a new GraphQL schema with modifications applied.
 * 
 * @typedef {Function} SchemaTransformer
 * @param {GraphQLSchema} schema - The GraphQL schema to modify.
 * @returns {GraphQLSchema} The modified GraphQL schema.
 */
type DirectiveResolver = () => Promise<unknown>

/**
 * A function that applies a directive handler to a field of an object.
 * 
 * @typedef {Function} DirectiveHandler
 * @param {DirectiveResolver} resolver - A resolver function that returns a Promise.
 * @param {DirectiveContext} ctx - An object containing information about the directive and the field on which it is applied.
 * @returns {unknown} The result of applying the directive handler to the resolver function.
 */
type DirectiveHandler = (resolver: DirectiveResolver, ctx: DirectiveContext) => unknown

/**
 * A function that takes a GraphQL schema and returns a new GraphQL schema with modifications applied.
 * 
 * @typedef {Function} SchemaTransformer
 * @param {GraphQLSchema} schema - The GraphQL schema to modify.
 * @returns {GraphQLSchema} The modified GraphQL schema.
 */
type SchemaTransformer = (schema: GraphQLSchema) => GraphQLSchema

/**
 * A function that returns a SchemaTransformer. A SchemaTransformer is a function that takes a GraphQL schema
 * and returns a new GraphQL schema with modifications applied. This particular SchemaTransformer applies a directive
 * handler function to any object field that has a specific directive.
 *
 * @param {string} directiveName - The name of the directive to apply the handler to.
 * @param {DirectiveHandler} handler - The handler function to apply to any object field with the specified directive.
 * @returns {SchemaTransformer} A SchemaTransformer that applies the specified directive handler to object fields with the specified directive.
 */
export const fieldDirective = (directiveName: string, handler: DirectiveHandler): SchemaTransformer => {
    return schema => mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: fieldConfig => {
            const upperDirective = getDirective(schema, fieldConfig, directiveName)?.[0]
            if (upperDirective) {
                const { resolve = defaultFieldResolver } = fieldConfig
                return {
                    ...fieldConfig,
                    resolve: async function (source, args, context, info) {
                        const dirResolver = async () => {
                            return resolve(source, args, context, info)
                        }
                        return handler(dirResolver, {
                            resolverArgs: [source, args, context, info],
                            directiveArgs: upperDirective ,
                            fieldConfig: fieldConfig
                        })
                    }
                }
            }
        }
    })
}

