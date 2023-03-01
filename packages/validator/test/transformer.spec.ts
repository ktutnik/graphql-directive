import val from "../src"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { graphql } from "graphql"


describe("Mutation Validation", () => {
    it("Should validate argument with primitive type properly", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
            
            type Mutation { 
                checkEmail(email:String! @validate(method: EMAIL)):Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    checkEmail: () => true
                }
            }
        }))
        const err = await graphql({ schema, source: `mutation { checkEmail(email: "mail") }` })
        expect(err.errors![0].extensions).toMatchSnapshot()

        const success = await graphql({ schema, source: `mutation { checkEmail(email: "mail@mail.com") }` })
        expect(success.data).toMatchSnapshot()
    })

    it("Should validate argument inside custom type property", async () => {
        const typeDefs = /* GraphQL */ `
        type Query { name:String! }
        input User {
            name: String!
            email: String! @validate(method: EMAIL)
        }
        
        type Mutation { 
            addUser(user:User!):Boolean!
        }
    `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: (_, args) => true
                }
            }
        }))
        const source = (email:string) => `
        mutation { 
            addUser(user: { 
                name: "John", email: "${email}" 
            }) 
        }
        `
        const err = await graphql({ schema, source: source("mail") })
        expect(err.errors![0].extensions).toMatchSnapshot()

        const success = await graphql({ schema, source: source("mail@mail.com") })
        expect(success.data).toMatchSnapshot()
    })

    it("Should validate argument inside nested custom type property", async () => {
        const typeDefs = /* GraphQL */ `
        type Query { name:String! }
        input User {
            name: String!
            email: String! @validate(method: EMAIL)
            suppose: User
        }
        
        type Mutation { 
            addUser(user:User!):Boolean!
        }
    `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: (_, args) => true
                }
            }
        }))
        const source = (mail:string) => `
        mutation { 
            addUser(user: { 
                name: "John", 
                email: "mail@mail.com", 
                suppose: { 
                    name: "Jane", 
                    email: "${mail}" 
                } 
            }) 
        }`
        const err = await graphql({ schema, source: source("mail")  })
        expect(err.errors![0].extensions).toMatchSnapshot()

        const success = await graphql({ schema, source: source("mail@mail.com") })
        expect(success.data).toMatchSnapshot()
    })

    it("Should validate argument inside array of custom type property", async () => {
        const typeDefs = /* GraphQL */ `
        type Query { name:String! }
        input User {
            name: String!
            email: String! @validate(method: EMAIL)
        }
        
        type Mutation { 
            addUser(user:[User]!):Boolean!
        }
    `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    addUser: (_, args) => true
                }
            }
        }))
        const source = (email:string) => `
        mutation { 
            addUser(user: [{
                name: "Jane", email: "jane@mail.com"
            }, { 
                name: "John", email: "${email}" 
            }]) 
        }
        `
        const err = await graphql({ schema, source: source("mail") })
        expect(err.errors![0].extensions).toMatchSnapshot()

        const success = await graphql({ schema, source: source("mail@mail.com") })
        expect(success.data).toMatchSnapshot()
    })
})

describe("Custom Type Validation", () => {
    it("Should validate argument with primitive type on Custom Type", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { email:CheckEmail }
    
            type CheckEmail {
                checkEmail(email:String! @validate(method: EMAIL)): Boolean!
            }
        `
        const schema = val.transform(makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Query: {
                    email: () => ({})
                },
                CheckEmail: {
                    checkEmail: (_, args) => true
                }
            }
        }))
        const err = await graphql({ schema, source: `{ email { checkEmail(email: "mail") } }` })
        expect(err.errors![0].extensions).toMatchSnapshot()

        const success = await graphql({ schema, source: `{ email { checkEmail(email: "mail@mail.com") } }` })
        expect(success.data).toMatchSnapshot()
    })
})


