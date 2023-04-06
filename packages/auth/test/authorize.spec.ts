import auth from "../src"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { GraphQLSchema, graphql } from "graphql"

function createSchema(def: string, resolver: any = { Mutation: { test: () => true } }, queryResolution: "ThrowError" | "Filter" = "ThrowError") {
    const typeDefs = /* GraphQL */ `
        type Query { name: String }
    `
    const transform = auth.createTransformer({
        policies: {
            admin: ({ contextValue }) => contextValue?.user?.role === "admin",
            user: ({ contextValue }) => contextValue?.user?.role === "user",
            authenticated: ({ contextValue }) => !!contextValue?.user
        },
        queryResolution
    })
    return transform(makeExecutableSchema({
        typeDefs: [auth.typeDefs, typeDefs, def],
        resolvers: {
            ...resolver
        }
    }))
}

describe("Mutation authorization", () => {
    describe("On field argument", () => {
        const test = (schema: GraphQLSchema, role: string, source?: string) => {
            return graphql({
                schema, source: source ?? `mutation { test(name: "Wayan Koster", role: "admin") }`,
                contextValue: { user: { role } }
            })
        }
        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String @authorize(policy: "admin")): Boolean!
                }`)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should allow unauthorized user when not providing value", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String @authorize(policy: "admin")): Boolean!
                }`)
            expect((await test(schema, "admin", `mutation { test(name: "Wayan Koster") }`)).data!.test).toBe(true)
        })

        it("Should work on array type", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: [String] @authorize(policy: "admin")): Boolean!
                }`)
            const source = `mutation { test(name: "Wayan Koster", role: ["admin", "user"]) }`
            expect((await test(schema, "admin", source)).data!.test).toBe(true)
            expect((await test(schema, "user", source)).errors![0].extensions).toMatchSnapshot()
        })

        it("Should able to apply multiple directives", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String @authorize(policy: "admin, user")): Boolean!
                }`)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBe(true)
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should throw error when specify invalid policy name", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String @authorize(policy: "superadmin")): Boolean!
                }`)
            expect((await test(schema, "user")).errors![0]).toMatchSnapshot()
        })
    })

    describe("On mutation field", () => {
        const test = (schema: GraphQLSchema, role: string, source?: string) => {
            return graphql({
                schema, source: source ?? `mutation { test(name: "Wayan Koster", role: "admin") }`,
                contextValue: { user: { role } }
            })
        }
        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String): Boolean! @authorize(policy: "admin")
                }`)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should able to apply multiple directives", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String): Boolean! @authorize(policy: "admin, user")
                }`)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBe(true)
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should throw error when specify invalid policy name", async () => {
            const schema = createSchema(`
                type Mutation { 
                    test(name:String!, role: String): Boolean! @authorize(policy: "superadmin")
                }`)
            expect((await test(schema, "admin")).errors![0]).toMatchSnapshot()
        })
    })

    describe("On input type field", () => {
        const test = (schema: GraphQLSchema, role: string, source?: string) => {
            return graphql({
                schema, source: source ?? `mutation { test(user: { name: "Wayan Koster", role: "admin" }) }`,
                contextValue: { user: { role } }
            })
        }
        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                input User {
                    name:String!
                    role:String @authorize(policy: "admin")
                }
                type Mutation { 
                    test(user:User!): Boolean!
                }`)

            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should pass if provided no value", async () => {
            const schema = createSchema(`
                input User {
                    name:String!
                    role:String @authorize(policy: "admin")
                }
                type Mutation { 
                    test(user:User!): Boolean!
                }`)
            expect((await test(schema, "user", `mutation { test(user: { name: "Wayan Koster" }) }`)).data?.test).toBe(true)
        })

        it("Should able to apply multiple directives", async () => {
            const schema = createSchema(`
                input User {
                    name:String!
                    role:String @authorize(policy: "admin, user") 
                }
                type Mutation { 
                    test(user:User!): Boolean!
                }`)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBe(true)
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should able to apply in array type", async () => {
            const schema = createSchema(`
                input User {
                    name:String!
                    role:String @authorize(policy: "admin") 
                }
                type Mutation { 
                    test(user:[User]!): Boolean!
                }`)
            const source = `mutation { test(user: [{ name: "Wayan Koster", role: "admin" }, { name: "Wayan Koster", role: "admin" }]) }`
            const sourceVariation = `mutation { test(user: [{ name: "Wayan Koster", role: "admin" }, { name: "Wayan Koster" }]) }`
            expect((await test(schema, "admin", source)).data!.test).toBe(true)
            expect((await test(schema, "authenticated", source)).errors![0].extensions).toMatchSnapshot()
            expect((await test(schema, "authenticated", sourceVariation)).errors![0].extensions).toMatchSnapshot()
        })

        it("Should throw error when specify invalid policy name", async () => {
            const schema = createSchema(`
                input User {
                    name:String!
                    role:String @authorize(policy: "superadmin")
                }
                type Mutation { 
                    test(user:User!): Boolean!
                }`)

            expect((await test(schema, "admin")).errors![0]).toMatchSnapshot()
        })
    })
})

describe("Query authorization", () => {
    const test = (schema: GraphQLSchema, role: string) => {
        return graphql({
            schema, source: `query { test(name: "Wayan Koster", role: "admin") }`,
            contextValue: { user: { role } }
        })
    }
    const resolver = { Query: { test: () => true } }

    describe("Applied on query field argument", () => {
        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test(name:String!, role: String @authorize(policy: "admin")): Boolean!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should able to apply multiple directives", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test(name:String!, role: String @authorize(policy: "admin, user")): Boolean!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBe(true)
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })
        it("Should throw error when specify invalid policy name", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test(name:String!, role: String @authorize(policy: "superadmin")): Boolean!
                }`, resolver)
            expect((await test(schema, "admin")).errors![0]).toMatchSnapshot()
        })
    })
})

describe("Query authorization ThrowError mode", () => {

    describe("Applied on query field with primitive type", () => {
        const resolver = { Query: { test: () => true } }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test: Boolean! @authorize(policy: "admin")
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test: Boolean! @authorize(policy: "admin, user")
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBe(true)
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })
    })

    describe("Applied on complex type property", () => {
        const resolver = {
            Query: {
                test: () => ({ name: "Wayan Koster", role: "admin" })
            }
        }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test { name, role } }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin")
                }
                extend type Query { 
                    test: User!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin, user")
                }
                extend type Query { 
                    test: User!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })
    })

    describe("Applied on nested complex type property", () => {
        const resolver = {
            Query: {
                test: () => ({ name: "Wayan Koster", role: "admin", partner: { name: "Wayan Koster", role: "admin" } })
            }
        }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test { name, partner { name, role } } }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin")
                    partner: User!
                }
                extend type Query { 
                    test: User!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin, user")
                    partner: User!
                }
                extend type Query { 
                    test: User!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })
    })

    describe("Applied on array of complex type property", () => {
        const resolver = {
            Query: {
                test: () => ([
                    { name: "Wayan Koster", role: "admin" },
                    { name: "Wayan Koster", role: "admin" }
                ])
            }
        }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test { name, role } }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin")
                }
                extend type Query { 
                    test: [User]!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).errors![0].extensions).toMatchSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin, user") 
                }
                extend type Query { 
                    test: [User]!
                }`, resolver)
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
            expect((await test(schema, "authenticated")).errors![0].extensions).toMatchSnapshot()
        })
    })
})


describe("Query authorization Filter mode", () => {

    describe("Applied on query field with primitive type", () => {
        const resolver = { Query: { test: () => true } }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test: Boolean @authorize(policy: "admin")
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBeNull()
        })

        it("Should throw error when provided non null type", async () => {
            expect(() => createSchema(`
                extend type Query { 
                    test: Boolean! @authorize(policy: "admin")
                }`, resolver, "Filter")).toThrowErrorMatchingSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                extend type Query { 
                    test: Boolean @authorize(policy: "admin, user") 
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toBe(true)
            expect((await test(schema, "user")).data!.test).toBe(true)
            expect((await test(schema, "authenticated")).data!.test).toBeNull()
        })
    })

    describe("Applied on complex type property", () => {
        const resolver = {
            Query: {
                test: () => ({ name: "Wayan Koster", role: "admin" })
            }
        }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test { name, role } }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String @authorize(policy: "admin")
                }
                extend type Query { 
                    test: User!
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
        })

        it("Should throw error when applied on non nullable type", async () => {
            expect(() => createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin")
                }
                extend type Query { 
                    test: User!
                }`, resolver, "Filter")).toThrowErrorMatchingSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String @authorize(policy: "admin, user") 
                }
                extend type Query { 
                    test: User!
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
            expect((await test(schema, "authenticated")).data!.test).toMatchSnapshot()
        })
    })

    describe("Applied on nested complex type property", () => {
        const resolver = {
            Query: {
                test: () => ({ name: "Wayan Koster", role: "admin", partner: { name: "Wayan Koster", role: "admin" } })
            }
        }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test { name, role, partner { name, role } } }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String @authorize(policy: "admin")
                    partner: User!
                }
                extend type Query { 
                    test: User!
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
        })

        it("Should throw error when applied on non nullable type", async () => {
            expect(() => createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin")
                    partner: User!
                }
                extend type Query { 
                    test: User!
                }`, resolver, "Filter")).toThrowErrorMatchingSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String @authorize(policy: "admin, user") 
                    partner: User!
                }
                extend type Query { 
                    test: User!
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
            expect((await test(schema, "authenticated")).data!.test).toMatchSnapshot()
        })
    })

    describe("Applied on array of complex type property", () => {
        const resolver = {
            Query: {
                test: () => ([
                    { name: "Wayan Koster", role: "admin" },
                    { name: "Wayan Koster", role: "admin" }
                ])
            }
        }
        const test = (schema: GraphQLSchema, role: string) => {
            return graphql({
                schema, source: `query { test { name, role } }`,
                contextValue: { user: { role } }
            })
        }

        it("Should authorize with proper role", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String @authorize(policy: "admin")
                }
                extend type Query { 
                    test: [User]!
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
        })

        it("Should throw error when applied on non nullable type", async () => {
            expect(() => createSchema(`
                type User {
                    name:String!
                    role:String! @authorize(policy: "admin")
                }
                extend type Query { 
                    test: [User]!
                }`, resolver, "Filter")).toThrowErrorMatchingSnapshot()
        })

        it("Should authorize with multiple directives", async () => {
            const schema = createSchema(`
                type User {
                    name:String!
                    role:String @authorize(policy: "admin, user") 
                }
                extend type Query { 
                    test: [User]!
                }`, resolver, "Filter")
            expect((await test(schema, "admin")).data!.test).toMatchSnapshot()
            expect((await test(schema, "user")).data!.test).toMatchSnapshot()
            expect((await test(schema, "authenticated")).data!.test).toMatchSnapshot()
        })
    })
})