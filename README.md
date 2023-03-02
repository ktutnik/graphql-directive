# Comprehensive List Of GraphQL Directives
[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)

Offers a collection of GraphQL directives for easy validation, authorization, and sanitation, simplifying the implementation of complex functionality in GraphQL APIs. It ensures secure and efficient GraphQL APIs with pre-built solutions.

## Motivation 
The motivation behind the creation of "graphql-directive" project is rooted in the desire to make the development of GraphQL APIs simpler, more efficient, and more secure. GraphQL is an increasingly popular technology for building APIs due to its flexibility and ability to handle complex queries, but it can be challenging to implement certain functionality, such as validation, authorization, and sanitation.

These challenges can lead to errors, security vulnerabilities, and inefficiencies in the development process, ultimately hindering the ability of developers to build high-quality, performant APIs. "graphql-directive" aims to solve this problem by providing a comprehensive set of pre-built directives that can be easily integrated into code, eliminating the need for developers to implement common functionality from scratch.

By using "graphql-directive," developers can focus on building their core business logic, rather than spending time and effort on implementing repetitive or complex functionality. Additionally, the project's directives have been thoroughly tested and validated, reducing the risk of security vulnerabilities and other errors in the code.

The benefits of "graphql-directive" are significant. The project can help developers to build better, more secure, and more efficient GraphQL APIs faster, reducing the time and effort required to complete projects. Furthermore, the project's open-source nature allows developers to contribute to the community and help improve the project over time, ensuring that it remains up-to-date and effective.

Overall, "graphql-directive" is a valuable resource for any developer looking to build high-quality GraphQL APIs. Its pre-built directives can help to simplify and streamline the development process, while reducing the risk of errors and security vulnerabilities. By using "graphql-directive," developers can focus on delivering better APIs faster, enabling them to stay competitive in an ever-changing technology landscape.

## Validation Directives 
Validation directives are used to validate input values of GraphQL fields against specific rules defined in the directive. They are a way to ensure that the input data received by a GraphQL API meets certain criteria or constraints.

```TypeScript 
import val from "@graphql-directive/validator"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone"


const typeDefs = `
    input UserInput {
        name: String! @validate(method: LENGTH, max: 150)
        email: String! @validate(method: EMAIL)
        dateOfBirth: Date! @validate(method: BEFORE, date: "2000-1-1")
    }
    type Mutation { 
        addUser(user:UserInput!): Boolean!
    }
`

const schema = val.transform(makeExecutableSchema({
    typeDefs: [val.typeDefs, typeDefs],
    resolvers: { /* resolvers */ }
}))

const server = new ApolloServer({ schema })
const { url } = await startStandaloneServer(server)
console.log(`Server running at ${url}`)
```