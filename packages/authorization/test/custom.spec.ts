import { makeExecutableSchema } from "@graphql-tools/schema"
import { graphql } from "graphql"
import val from "./harness"

it("Should validate argument with primitive type properly", async () => {
    const typeDefs = /* GraphQL */ `
        type Query { name:String! }

        input User {
            name:String!
            email:String!
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
                addUser: (a,b,c,d) => {
                    return true
                }
            }
        }
    }))
    const err = await graphql({ schema, source: `mutation { addUser(user: { name: "Lorem", email: "ipsum@dolor.com", dob: "2023-1-1" }) }` })
    expect(err.errors![0].extensions).toMatchSnapshot()
})