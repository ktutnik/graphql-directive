# Comprehensive List Of GraphQL Directives
[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg?branch=master)](https://coveralls.io/github/ktutnik/graphql-directive?branch=master)

Offers a collection of GraphQL directives for easy validation, authorization, and sanitation, simplifying the implementation of complex functionality in GraphQL APIs. It ensures secure and efficient GraphQL APIs with pre-built solutions.

## Validation Directive
Refer to the [project documentation](./packages/validator/readme.md) for more detail documentation.

Validation directives simplify the use of popular JavaScript validator libraries inside your GraphQL API. The main goal is to ensure that validation results are consistent across client-side and server-side applications. 

### Usage
Validation method wrapped into a single directive `@validate(method: METHOD[, PARAMETERS])`. 

```graphql
const typeDefs = `
    input UserInput {
        name: String!   @validate(method: LENGTH, min:1, max: 150)
        email: String!  @validate(method: EMAIL)
    }
    type Mutation { 
        addUser(user:UserInput!): Boolean!
    }
`
```

In order to use the `@validate` directive, you must transform the GraphQL schema using the provided transform function like below.

```typescript
import val from "@graphql-directive/validator"
import { makeExecutableSchema } from "@graphql-tools/schema"

const schema = val.transform(makeExecutableSchema({
    typeDefs: [
        val.typeDefs, // @validate type definition
        typeDefs      // your type definition
    ],
    resolvers: { /* resolvers */ }
}))
```

The transform function returns a GraphQL schema, which can be used directly with some GraphQL servers, such as Apollo Server.

```typescript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone"

const server = new ApolloServer({ schema })
const { url } = await startStandaloneServer(server)
console.log(`Server running at ${url}`)
```

## Authorization Directive
Refer to the [project documentation](./packages/auth/readme.md) for more detail documentation.

The authorization directive is a library that allows you to easily secure your GraphQL API by defining authorization policies. It simplifies your code and makes it easier to review by applying policies at the field or argument level.

## Usage

Authorization method wrapped into single directive `@authorize(policy: "list, of, policy")` like example below.

```graphql
const typeDefs = `
    input UserInput {
        name: String!   
        email: String! 
        # role only can be set by Admin 
        role: String   @authorize(policy: "Admin")
    }

    input User {
        id: String!
        name: String!   
        # email only visible by authenticated user
        email: String! @authorize(policy: "Authenticated")
        # role only visible by Admin
        role: String   @authorize(policy: "Admin")
    }

    type Query {
        users: [User]!
    }

    type Mutation { 

        # anyone can register user
        # but can not specify role (except Admin)
        addUser(
            user:UserInput!
        ): Boolean!

        # Authenticated user can modify user 
        # but can not modify role
        editUser(
            id:String!, 
            user:UserInput!
        ): Boolean!    @authorize(policy: "Authenticated")
    }
`
```

On above code, we applied several `@authorize` directive with `Authenticated` and `Admin` policy. We can define the policy like below.

* `Authenticated` any user with a valid JWT token.
* `Admin` any user which the token claims contains `role: Admin`

Register above policy while creating the schema transformer like below.

```typescript
import auth from "@graphql-directive/auth"

const transform = auth.createTransformer({
    policies: {
        Admin: ({ contextValue }) => contextValue.user.role === "Admin",
        Authenticated: ({ contextValue }) => !!contextValue.user
    }
})
```

`contextValue` is a context that is passed from the server. Its the same value that is passed by the third parameter of GraphQL resolver.

Next step is to use the `transform` function created above to transform your GraphQL schema.

```typescript
import auth from "@graphql-directive/auth"
import { makeExecutableSchema } from "@graphql-tools/schema"

const schema = transform(makeExecutableSchema({
    typeDefs: [auth.typeDefs, typeDefs],
    resolvers: {
        /* list of resolvers */
    }
}))
```

You can use executable schema above on any GraphQL server. In this example we use Apollo GraphQL

```typescript
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone"

const server = new ApolloServer({ schema })
const { url } = await startStandaloneServer(server, {
    // the main logic to create contextValue that is used when creating auth policy
    context: async ({ req, res }) => {
        // read JWT token (Bearer <token>)
        const token = req.headers["authorization"]
        if (!token || !token.toLowerCase().startsWith("Bearer")) return {}
        const user = verify(token.split(" ")[1], "lorem")
        if (typeof user === "string") return {}
        return user 
    }
})
console.log(`Server running at ${url}`)
```