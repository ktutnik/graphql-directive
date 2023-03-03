# Comprehensive List Of GraphQL Directives
[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg)](https://coveralls.io/github/ktutnik/graphql-directive)

Offers a collection of GraphQL directives for easy validation, authorization, and sanitation, simplifying the implementation of complex functionality in GraphQL APIs. It ensures secure and efficient GraphQL APIs with pre-built solutions.

## Motivation 
The motivation behind the creation of "graphql-directive" project is rooted in the desire to make the development of GraphQL APIs simpler, more efficient, and more secure. GraphQL is an increasingly popular technology for building APIs due to its flexibility and ability to handle complex queries, but it can be challenging to implement certain functionality, such as validation, authorization, and sanitation.

These challenges can lead to errors, security vulnerabilities, and inefficiencies in the development process, ultimately hindering the ability of developers to build high-quality, performant APIs. "graphql-directive" aims to solve this problem by providing a comprehensive set of pre-built directives that can be easily integrated into code, eliminating the need for developers to implement common functionality from scratch.

By using "graphql-directive," developers can focus on building their core business logic, rather than spending time and effort on implementing repetitive or complex functionality. Additionally, the project's directives have been thoroughly tested and validated, reducing the risk of security vulnerabilities and other errors in the code.

The benefits of "graphql-directive" are significant. The project can help developers to build better, more secure, and more efficient GraphQL APIs faster, reducing the time and effort required to complete projects. Furthermore, the project's open-source nature allows developers to contribute to the community and help improve the project over time, ensuring that it remains up-to-date and effective.

Overall, "graphql-directive" is a valuable resource for any developer looking to build high-quality GraphQL APIs. Its pre-built directives can help to simplify and streamline the development process, while reducing the risk of errors and security vulnerabilities. By using "graphql-directive," developers can focus on delivering better APIs faster, enabling them to stay competitive in an ever-changing technology landscape.

## Validation Directives 
Validation directive `@validate(method: METHOD[, OPTIONS])` is used to validate input values of GraphQL fields against specific rules defined in the directive. They are a way to ensure that the input data received by a GraphQL API meets certain criteria or constraints.

```TypeScript 
import val from "@graphql-directive/validator"
import { makeExecutableSchema } from "@graphql-tools/schema"
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone"

const typeDefs = `
    input UserInput {
        name: String!       @validate(method: LENGTH, max: 150)
        email: String!      @validate(method: EMAIL)
        dateOfBirth: Date!  @validate(method: BEFORE)
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

The `@validate` directive adds input validation rules to GraphQL fields. It specifies a validation method and parameters for the field, and performs the validation check during schema execution. If any validation rules fail, a validation error is returned. Below is list of validation method supported by the `@validate` directive


| Method           | Description                                                                                   |
| ---------------- | --------------------------------------------------------------------------------------------- |
| AFTER            | Check if date string is after the specified date.                                             |
| ALPHA            | Check if string contains only letters (a-zA-Z).                                               |
| ALPHANUMERIC     | Check if string contains only letters and numbers (a-zA-Z0-9).                                |
| ASCII            | Check if string contains ASCII characters only.                                               |
| BASE64           | Check if string is a valid Base64 encoded string.                                             |
| BEFORE           | Check if date string is before the specified date.                                            |
| BOOLEAN          | Check if value is a boolean.                                                                  |
| CREDIT_CARD      | Check if string is a valid credit card number.                                                |
| CURRENCY         | Check if string is a valid currency amount.                                                   |
| DATA_URI         | Check if string is a valid Data URI.                                                          |
| DECIMAL          | Check if string is a valid decimal number.                                                    |
| DIVISIBLE_BY     | Check if number is divisible by the specified number.                                         |
| EMAIL            | Check if string is a valid email address.                                                     |
| EMPTY            | Check if value is empty.                                                                      |
| ETHEREUM_ADDRESS | Check if string is a valid Ethereum address.                                                  |
| FLOAT            | Check if string is a valid floating point number.                                             |
| FQDN             | Check if string is a valid fully qualified domain name (FQDN).                                |
| FULLWIDTH        | Check if string contains any full-width characters.                                           |
| HALFWIDTH        | Check if string contains any half-width characters.                                           |
| HEX_COLOR        | Check if string is a valid hexadecimal color.                                                 |
| HEXADECIMAL      | Check if string is a valid hexadecimal number.                                                |
| IP               | Check if string is a valid IP (version 4 or 6) address.                                       |
| IP_RANGE         | Check if string is a valid IP range.                                                          |
| ISBN             | Check if string is a valid ISBN (version 10 or 13).                                           |
| ISIN             | Check if string is a valid ISIN (International Securities Identification Number).             |
| ISO31661_ALPHA2  | Check if string is a valid ISO 3166-1 alpha-2 country code.                                   |
| ISO31661_ALPHA3  | Check if string is a valid ISO 3166-1 alpha-3 country code.                                   |
| ISO8601          | Check if string is a valid ISO 8601 date.                                                     |
| ISRC             | Check if string is a valid International Standard Recording Code (ISRC).                      |
| ISSN             | Check if string is a valid International Standard Serial Number (ISSN).                       |
| JSON             | Check if string is a valid JSON string.                                                       |
| JWT              | Check if string is a valid JSON Web Token (JWT).                                              |
| LAT_LONG         | Check if string is a valid latitude-longitude coordinate in the format lat,long or lat, long. |
| LENGTH           | Check if string's length (in bytes) falls in a specified range.                               |
| LOWERCASE        | Check if string is lowercase.                                                                 |
| MAC_ADDRESS      | Check if string is a valid MAC address.                                                       |
| MIME_TYPE        | Check if string is a valid MIME type format.                                                  |
| MONGO_ID         | Check if string is a valid MongoDB ObjectID.                                                  |
| MULTIBYTE        | Check if string contains one or more multibyte chars.                                         |
| NUMERIC          | Check if string contains only numbers.                                                        |
| PORT             | Check if string is a valid port number.                                                       |
| POSTAL_CODE      | Check if string is a valid postal code.                                                       |
| REGEX            | Check if string is match with specified regex expression                                      |
| SURROGATE_PAIR   | Check if string contains any surrogate pairs chars.                                           |
| UPPERCASE        | Check if string is uppercase.                                                                 |
| URL              | Check if string is a valid URL.                                                               |
| UUID             | Check if string is a valid UUID (version 3, 4, or 5).                                         |
| VARIABLE_WIDTH   | Check if string contains a mixture of full and half-width chars.                              |
| WHITELISTED      | Check if string only contains characters from a whitelist.                                    |



