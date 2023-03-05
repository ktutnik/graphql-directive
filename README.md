# Comprehensive List Of GraphQL Directives
[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg)](https://coveralls.io/github/ktutnik/graphql-directive)

Offers a collection of GraphQL directives for easy validation, authorization, and sanitation, simplifying the implementation of complex functionality in GraphQL APIs. It ensures secure and efficient GraphQL APIs with pre-built solutions.

## Validation Directive
Validation directives simplify the use of popular JavaScript validator libraries inside your GraphQL API. The main goal is to ensure that validation results are consistent across client-side and server-side applications. 

### Motivation
Ensuring consistency between the validation on the server side and the client side is a critical requirement when building any application. It helps to prevent errors and ensure that the application functions correctly.

For example, if there is a discrepancy in validation logic between the client and server, it can result in significant issues for the user experience of an application. Data that is accepted on the client side may be rejected on the server side and vice versa, leading to confusion and frustration for the user.

That is the primary motivation behind this validation directive. It provides a directive that wrap many popular validation libraries commonly used by the front-end, leading to a consistent validation process between server side and client side. And making it easy to use validation in a GraphQL schema.

### Usage
Validation methods are wrapped into a single directive `@validate(method: METHOD[, PARAMETERS])`. The available methods and parameters vary depending on the chosen validator plugin.

```typescript
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

You can use the validation directive with other directives by following the same process as described above.

### Available Plugins
The `@validate` directive provides a range of ready-to-use plugins, each of which is implemented using popular JavaScript validation libraries such as Yup, Validator.js, and Joi. These plugins enable you to easily apply various types of validation to your GraphQL schema.

- [x] Validator.js Plugin 
- [ ] Yup Plugin
- [ ] Join Plugin

### Custom Plugin 
The `@validate` directive is highly extensible, allowing you to create your own validation plugins using your preferred validation library. This flexibility enables you to add custom validation rules to your GraphQL schema, ensuring that your application data is properly validated.

