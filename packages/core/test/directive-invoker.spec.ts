import { makeExecutableSchema } from "@graphql-tools/schema"
import { MapperKind, mapSchema } from "@graphql-tools/utils"
import { GraphQLError, graphql } from "graphql"
import { GraphQLSchema, createDirectiveInvoker } from "../src"

const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
        EMAIL, LENGTH, CUSTOM
    }
    directive @test(
        min:Int,
        max:Int
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

const transform = (schema: GraphQLSchema): GraphQLSchema => {
    const invoker = createDirectiveInvoker("test", async (value, ctx) => {
        return [{ path: ctx.path, directives: ctx.directives }]
    })

    return mapSchema(schema, {
        "MapperKind.INPUT_OBJECT_FIELD": invoker.addInputField,
        [MapperKind.OBJECT_FIELD]: (config, fieldName, type, sch) => {
            if (fieldName === "addUser") {
                return {
                    ...config, resolve: async (source, args, context, info) => {
                        const error = await invoker.invoke(args, "", config.args!, [source, args, context, info])
                        throw new GraphQLError("USER_ERROR", { extensions: { error } })
                    }
                }
            }
        },
    })
}

const val = { typeDefs, transform }


describe("Primitive Type", () => {

    it("Should call directive with primitive type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            type Mutation { 
                addUser(email:String! @test(min: 1, max: 200)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(email: "ipsum@dolor.com") }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with array of primitive type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            type Mutation { 
                addUser(email:[String] @test(min: 1, max: 200)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(email: ["ipsum@dolor.com", "ipsum@dolor.com"]) }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with non nullable array of primitive type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            type Mutation { 
                addUser(email:[String]! @test(min: 1, max: 200)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(email: ["ipsum@dolor.com", "ipsum@dolor.com"]) }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with non nullable array of non nullable primitive type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            type Mutation { 
                addUser(email:[String!]! @test(min: 1, max: 200)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(email: ["ipsum@dolor.com", "ipsum@dolor.com"]) }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should able to set multiple directives", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            type Mutation { 
                addUser(email:String! @test(min: 1, max: 200) @test(min: 20)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(email: "ipsum@dolor.com") }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should should not calling directive when value is empty", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            type Mutation { 
                addUser(email:String @test(min: 1, max: 200)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(email:null) }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })
})

describe("Custom Type", () => {

    it("Should call directive with custom type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            input User {
                name:String! 
                email:String! @test(min: 1, max: 200)
                dob:String!
            }
            
            type Mutation { 
                addUser(user:User!):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(user: { name: "Lorem", email: "ipsum@dolor.com", dob: "2023-1-1" }) }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with array of custom type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            input User {
                name:String! 
                email:String! @test(min: 1, max: 200)
                dob:String!
            }
            
            type Mutation { 
                addUser(user:[User]!):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `
            mutation { 
                addUser(user: [
                    { name: "Lorem", email: "ipsum@dolor.com", dob: "2023-1-1" }, 
                    { name: "Lorem", email: "ipsum@dolor.com", dob: "2023-1-1" }
                ]) 
            }`})
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with multiple directive", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            input User {
                name:String! 
                email:String! @test(min: 1, max: 200) @test(min: 20)
                dob:String!
            }
            
            type Mutation { 
                addUser(user:User!):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { addUser(user: { name: "Lorem", email: "ipsum@dolor.com", dob: "2023-1-1" }) }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with with nested properties", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            input User {
                name:String! 
                email:String! @test(min: 1, max: 200)
                dob:String!
                partner: User
            }
            
            type Mutation { 
                addUser(user:User!):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({
            schema, source: `
            mutation { 
                addUser(user: { 
                    name: "Lorem", 
                    email: "ipsum@dolor.com", 
                    dob: "2023-1-1", 
                    partner: {
                        name: "Lorem", 
                        email: "ipsum@dolor.com", 
                        dob: "2023-1-1"
                    } 
                }) 
            }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should call directive with with nested array properties", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            input User {
                name:String! 
                email:String! @test(min: 1, max: 200)
                dob:String!
                partners: [User]
            }
            
            type Mutation { 
                addUser(user:User!):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({
            schema, source: `
            mutation { 
                addUser(user: { 
                    name: "Lorem", 
                    email: "ipsum@dolor.com", 
                    dob: "2023-1-1", 
                    partners: [{
                        name: "Lorem", 
                        email: "ipsum@dolor.com", 
                        dob: "2023-1-1"
                    }, {
                        name: "Lorem", 
                        email: "ipsum@dolor.com", 
                        dob: "2023-1-1"
                    }]
                }) 
            }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should not calling directive if provided null on nested properties", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
    
            input User {
                name:String! 
                email:String! @test(min: 1, max: 200)
                dob:String!
                partner: User
            }
            
            type Mutation { 
                addUser(user:User!):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: () => true
                }
            }
        }))
        const err = await graphql({
            schema, source: `
            mutation { 
                addUser(user: { 
                    name: "Lorem", 
                    email: "ipsum@dolor.com", 
                    dob: "2023-1-1"
                }) 
            }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })
})
