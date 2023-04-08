# GraphQL Authorization Directive

[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg?branch=master)](https://coveralls.io/github/ktutnik/graphql-directive?branch=master)

A TypeScript/JavaScript library that provides an easy way to add authorization logic to your Node.js GraphQL API using directives. 

The authorization directive allows you to define authorization policies that determine whether a user is authorized to access certain fields or arguments in your GraphQL schema. These policies can be applied at the field or argument level, giving you granular control over who can access what data. By using the authorization directive, you can ensure that only authenticated users with the appropriate permissions are able to access sensitive data in your GraphQL API. This helps to improve the security of your application and protect user data.

The authorization directive also simplifies your code and makes it easier to review. By defining authorization policies once, you can apply them consistently across your entire GraphQL schema. This reduces the amount of code you need to write and makes it easier to maintain and update your API. Additionally, the authorization policies are easy to understand and review, making it easier for other developers to understand how your application works and how data is protected. Overall, the authorization directive is a powerful tool for securing your GraphQL API and ensuring that your users' data is protected.

## Example Usage
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

## Query Resolution
Query resolution is how the query resolved based on user authorization. There are two resolution logic provided: `ThrowError` and `Filter`.

By default the query resolution used is `Filter`, its mean that if a user doesn't have access to protected field, server will filter the value by returning `null`. Based on example above, below query will behave differently based on user role.

```graphql
query {
    users { name, email, role }
}
```

For `Admin`, above query will return a complete result including the `role`. But for other user the `role` field will be `null`. 

> Important to note that when query resolution set to `Filter`, make sure the data type of the filed where the directive applied must be nullable. An informative error will be thrown if its not satisfied.

`ThrowError` provide stricter authorization resolution by throwing an error when user doesn't have access to specific field. This is the best option when you strictly not allowed `null` in your schema. Based on previous example query, non admin user will get `GraphQLError` when requesting the `role` field. The error returned contains information of forbidden field path. 

```json
{
  "data": {},
  "errors": [
    {
      "message": "AUTHORIZATION_ERROR",
      "extensions": {
        "paths": [
          "users.role"
        ],
        "code": "INTERNAL_SERVER_ERROR",
        "stacktrace": [ ]
      }
    }
  ]
}
```

## API Documentation

### createTransformer
The `createTransformer` function is a higher-order function that returns a function to transform a `GraphQLSchema`. The returned function takes a `GraphQLSchema` and returns a new transformed schema.



#### Arguments
* `options` (optional): An object that can contain the following properties:
    * `policies`: A record of policy functions. Each policy function takes an AuthorizeContext object as an argument and returns a boolean or a promise that resolves to a boolean. Default is an empty object.
    * `queryResolution`: A string that specifies how the result will be resolved when unauthorized user access a field. Possible values are `"ThrowError"` and `"Filter"`. Default is `"Filter"`. `ThrowError` 
#### Return value
The `createTransformer` function returns a transformer function that takes a `GraphQLSchema` and returns a new transformed schema.

### Policies
`policies` property is a key-value object consist of authorization policy logic. It takes an `AuthorizeContext` object as input and returns a `boolean` or a `Promise<boolean>` that resolves to a boolean indicating whether the user is authorized to perform the requested operation.

```typescript
type PolicyFunction = (ctx: AuthorizationContext) => boolean | Promise<boolean>
```

The `AuthorizeContext` object has the following properties:


* `path`: The location of where validator applied from the root path through the GraphQL fields

* `contextValue`: An object shared across all resolvers that are executing for a particular operation. Use this to share per-operation state, including authentication information, dataloader instances, and anything else to track across resolvers.

* `parent`: The return value of the resolver for this field's parent (i.e., the previous resolver in the resolver chain). 

* `args`: An object that contains all GraphQL arguments provided for this field.

* `info`: Contains information about the operation's execution state, including the field name, the path to the field from the root, and more.

* `directiveArgs`: Object that is passed into the directive, for example if the directive is `@authorize(policy: "Admin, User")`, the value is `{ policy: "Admin, User" }`
