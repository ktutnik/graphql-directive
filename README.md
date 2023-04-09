# Comprehensive List Of GraphQL Directives
[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg?branch=master)](https://coveralls.io/github/ktutnik/graphql-directive?branch=master)

Offers a collection of GraphQL directives for easy validation, authorization, and sanitation, simplifying the implementation of complex functionality in GraphQL APIs. It ensures secure and efficient GraphQL APIs with pre-built solutions.

## Validator.js Directive
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
        role: String   @authorize(policy: "Admin")
    }

    type User {
        id: String!
        name: String!   
        email: String! @authorize(policy: "Authenticated")
        role: String   @authorize(policy: "Admin")
    }

    type Query {
        users: [User]!
    }

    type Mutation { 
        addUser(
            user:UserInput!
        ): Boolean!

        editUser(
            id:String!, 
            user:UserInput!
        ): Boolean!    @authorize(policy: "Authenticated")
    }
`
```

Define each policy logic like below

```typescript
import auth, { PolicyFunction } from "@graphql-directive/auth"
import { makeExecutableSchema } from "@graphql-tools/schema"

const policies: Record<string, PolicyFunction> = {
    admin: ({ contextValue }) => contextValue.user.role === "admin",
    isLogin: ({ contextValue }) => !!contextValue.user
}

const schema = auth.createTransformer({ policies })(makeExecutableSchema({
    typeDefs: [auth.typeDefs, typeDefs],
    resolvers: {
        /* list of resolvers */
    }
}))
```

`contextValue` is a context that is passed from the server. Its the same value that is passed by the third parameter of GraphQL resolver.

The transform function returns a GraphQL schema, which can be used directly with some GraphQL servers, such as Apollo Server.