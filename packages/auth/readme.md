# GraphQL Authorization Directive

[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg?branch=master)](https://coveralls.io/github/ktutnik/graphql-directive?branch=master)

A TypeScript/JavaScript library that provides an easy way to add authorization logic to your Node.js GraphQL API using directives. 

## Motivation
GraphQL Authorization Directive aims to simplify the process of adding authorization to your GraphQL API. By using directives, you can easily apply authorization logic to your schema without having to manually implement complex middleware functions.

## Example Usage
```javascript
import auth from "@graphql-directive/auth"
import { ApolloServer } from "@apollo/server"
import { startStandaloneServer } from "@apollo/server/standalone"
import { makeExecutableSchema } from "@graphql-tools/schema"

const typeDefs = `
    type User {
        name: String!
        email: String!
        role: String @authorize(policy: "admin")
    }
    input UserInput {
        name: String!
        email: String! 
        role: String @authorize(policy: "admin")
    }
    type Query {
        getUsers: [User]!
    }
    type Mutation {
        addUser(user:UserInput!): Boolean!
        modifyUser(user: UserInput!): Boolean!
    }
`

const transform = auth.createTransformer({
    policies: {
        admin: ({ contextValue }) => contextValue.user.role === "admin",
        isLogin: ({ contextValue }) => !!contextValue.user
    }
})

const schema = transform(makeExecutableSchema({
    typeDefs: [auth.typeDefs, typeDefs],
    resolvers: {
        Query: { getUsers: () => ([]) },
        Mutation: {
            addUser: () => true,
            modifyUser: ()=> true
        }
    }
}))

const server = new ApolloServer({ schema })
startStandaloneServer(server, { context: async ({ req, res }) => ({}) }).then(x => console.log(x.url))
```

## API Documentation
