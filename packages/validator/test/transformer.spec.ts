import val from "../src"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { graphql } from "graphql"


it("Should execute validator on field argument", async () => {
    const typeDefs = /* GraphQL */ `
        type Query { name:String! }
        input User {
            name: String!
            email: String! @validate(method: EMAIL)
        }
        type Mutation { 
            addUser(user:User):String!
        }
    `
    const schema = val.transform(makeExecutableSchema({
        typeDefs: [val.typeDefs, typeDefs], 
        resolvers: {
            Mutation: {
                addUser: (_, args) => {
                    return args.user
                }
            }
        } 
    }))
    const result = await graphql({ schema, source: `mutation { addUser({ name: "John", email: "mail@mail.com" }) }`})
    expect(result.data).toBe(10)
})