import { makeExecutableSchema } from "@graphql-tools/schema"
import { graphql } from "graphql"
import val from "../src"


describe("Custom Validator", () => {
    it("Should able to create your own validator", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
            
            type Mutation { 
                checkEmail(email:String! @validate(method: CUSTOM, validator: "email")):Boolean!
            }
        `
        const execSchema = makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    checkEmail: () => true
                }
            }
        })
        const schema = val.transform(execSchema, { customValidators: { email: (val, ctx) => "Always error" } })
        const err = await graphql({ schema, source: `mutation { checkEmail(email: "mail") }` })
        expect(err.errors![0].extensions).toMatchSnapshot()

        const success = await graphql({ schema, source: `mutation { checkEmail(email: "mail@mail.com") }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
    })

    it("Should able to access context from custom validator", async () => {
        const typeDefs = /* GraphQL */ `
            type Query { name:String! }
            
            type Mutation { 
                checkEmail(email:String! @validate(method: CUSTOM, validator: "email")):Boolean!
            }
        `
        const execSchema = makeExecutableSchema({
            typeDefs: [val.typeDefs, typeDefs],
            resolvers: {
                Mutation: {
                    checkEmail: () => true
                }
            }
        })
        const fn = jest.fn()
        const schema = val.transform(execSchema, {
            customValidators: {
                email: (val, { info, ...ctx }) => {
                    fn(val, ctx)
                    return "Always error"
                }
            }
        })
        const err = await graphql({ schema, source: `mutation { checkEmail(email: "mail") }` })
        expect(err.errors![0].extensions).toMatchSnapshot()
        expect(fn.mock.calls).toMatchSnapshot()
    })
})