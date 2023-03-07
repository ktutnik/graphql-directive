## Validator.js Directives 

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


| Function | Description | Parameters |
| --- | --- | --- |
| `AFTER` | Checks if a date is after a specified date. | `value` (required): The date to validate. <br> `date` (optional): The date to compare `value` to. |
| `ALPHA` | Checks if a string contains only alphabetical characters. | `value` (required): The string to validate. <br> `locale` (optional): The locale to use for alphabet validation (defaults to `en-US`). |
| `ALPHANUMERIC` | Checks if a string contains only alphanumeric characters. | `value` (required): The string to validate. <br> `locale` (optional): The locale to use for alphabet validation (defaults to `en-US`). |
| `ASCII` | Checks if a string contains only ASCII characters. | `value` (required): The string to validate. |
| `BASE64` | Checks if a string is a valid base64-encoded string. | `value` (required): The string to validate. |
| `BEFORE` | Checks if a date is before a specified date. | `value` (required): The date to validate. <br> `date` (optional): The date to compare `value` to. |
| `BOOLEAN` | Checks if a value is a boolean (`true` or `false`). | `value` (required): The value to validate. |
| `CREDITCARD` | Checks if a string is a valid credit card number. | `value` (required): The credit card number to validate. |
| `CURRENCY` | Checks if a string is a valid currency amount. | `value` (required): The currency amount to validate. <br> `options` (optional): An object containing the following properties: <ul><li>`symbol`: The currency symbol to use (defaults to `$`).</li><li>`decimal`: The decimal separator to use (defaults to `.`).</li><li>`symbolPosition`: The position of the currency symbol (defaults to `left`).</li><li>`negativeSignBefore`: Whether to put the negative sign before or after the currency symbol (defaults to `false`).</li><li>`thousandsSeparator`: The thousands separator to use (defaults to `,`).</li><li>`allowNegative`: Whether to allow negative currency amounts (defaults to `false`).</li></ul> |
| `DATAURI` | Checks if a string is a valid data URI. | `value` (required): The string to validate. |
| `DECIMAL` | Checks if a string is a valid decimal number. | `value` (required): The string to validate. |
| `DIVISIBLEBY` | Checks if a number is divisible by another number. | `value` (required): The number to validate. <br> `num` (required): The number to divide `value` by. |
| `EMAIL` | Checks if a string is a valid email address. | `value` (required): The string to validate. <br> `options` (optional): An object containing the following properties: <ul><li>`allowDisplayName`: Whether to allow the use of display names (defaults to `false`).</li><li>`requireDisplayName`: Whether to require the use of display names (defaults to `false`).</li><li>`allowUtf8LocalPart`: Whether to allow non-ASCII characters in the local part of the email address (defaults to `false`).</li><li>`requireTld`: Whether to require a top-level domain (defaults to `true`).</li><li>`ignoreMaxLength`: Whether to ignore the maximum length of the email address (defaults to `false`).</li></ul> |
| `ETHEREUMADDRESS` | Checks if a string is a valid Ethereum address. | `value` (required): The string to validate. |
| `FQDN` | Checks if a string is a fully qualified domain name (FQDN). | `value` (required): The string to validate. <br> `options` (optional): An object containing the following properties: <ul><li>`requireTld`: Whether to require a top-level domain (defaults to `true`).</li><li>`allowUnderscores`: Whether to allow underscores in domain names (defaults to `false`).</li><li>`allowTrailingDot`: Whether to allow a trailing dot in domain names (defaults to `false`).</li></ul> |
| `FLOAT` | Checks if a string is a valid float. | `value` (required): The string to validate. <br> `options` (optional): An object containing the following properties: <ul><li>`min`: The minimum value the float can be (defaults to `Number.MIN_VALUE`).</li><li>`max`: The maximum value the float can be (defaults to `Number.MAX_VALUE`).</li><li>`gt`: The value the float must be greater than.</li><li>`lt`: The value the float must be less than.</li><li>`locale`: The locale to use for validation (defaults to `en-US`).</li></ul> |
| `FULLWIDTH` | Checks if a string contains any full-width characters. | `value` (required): The string to validate. |
| `HALFWIDTH` | Checks if a string contains any half-width characters. | `value` (required): The string to validate. |
| `HEXCOLOR` | Checks if a string is a valid hexadecimal color code. | `value` (required): The string to validate. |
| `HEXADECIMAL` | Checks if a string is a valid hexadecimal number. | `value` (required): The string to validate. |
| `IP` | Checks if a string is a valid IP address (version 4 or 6). | `value` (required): The string to validate. <br> `version` (optional): The IP version to validate against (`4` or `6`, defaults to `4`). |
| `IPRANGE` | Checks if a string is a valid IP range. | `value` (required): The string to validate. |
| `ISBN` | Checks if a string is a valid International Standard Book Number (ISBN). | `value` (required): The string to validate. <br> `version` (optional): The ISBN version to validate against (`10` or `13`, defaults to `13`). |
| `ISIN` | Checks if a string is a valid International Securities Identification Number (ISIN). | `value` (required): The string to validate. |
| `ISO8601` | Checks if a string is a valid ISO 8601 date. | `value` (required): The string to validate. |
| `ISO31661ALPHA2` | Checks if a string is a valid ISO 3166-1 alpha-2 country code. | `value` (required): The string to validate. |
| `ISO31661ALPHA3` | Checks if a string is a valid ISO 3166-1 alpha-3 country code. | `value` (required): The string to validate. |
| `ISRC` | Checks if a string is a valid International Standard Recording Code (ISRC). | `value` (required): The string to validate. |
| `ISSN` | Checks if a string is a valid International Standard Serial Number (ISSN). | `value` (required): The string to validate. |
| `JSON` | Checks if a string is valid JSON. | `value` (required): The string to validate. |
| `JWT` | Checks if a string is a valid JSON Web Token (JWT). | `value` (required): The string to validate. |
| `LATLONG` | Checks if a string is a valid latitude-longitude coordinate pair. | `value` (required): The string to validate. |
| `LENGTH` | Checks if a string's length is within a specified range. | `value` (required): The string to validate. <br> `options` (optional): An object that can contain the following properties: <br> `min` (optional): The minimum length of the string. <br> `max` (optional): The maximum length of the string. |
| `LOWERCASE` | Checks if a string is all lowercase. | `value` (required): The string to validate. |
| `MACADDRESS` | Checks if a string is a valid Media Access Control (MAC) address. | `value` (required): The string to validate. |
| `MIMETYPE` | Checks if a string is a valid MIME type. | `value` (required): The string to validate. |
| `MONGOID` | Checks if a string is a valid MongoDB ObjectId. | `value` (required): The string to validate. |
| `MULTIBYTE` | Checks if a string contains any multibyte characters. | `value` (required): The string to validate. |
| `NUMERIC` | Checks if a string is a valid number. | `value` (required): The string to validate. <br> `options` (optional): An object that can contain the following properties: <br> `no_symbols` (optional): If true, disallows symbols in the number (such as a leading plus or minus sign). Defaults to false. <br> `locale` (optional): The locale to use when validating the number. Can be a string (such as "en-US") or an array of strings (such as ["en-US", "de-DE"]). |
| `PORT` | Checks if a string is a valid port number. | `value` (required): The string to validate. |
| `POSTALCODE` | Checks if a string is a valid postal (ZIP) code for a given locale. | `value` (required): The string to validate. <br> `locale` (required): The locale to use when validating the postal code. |
| `matches` | Checks if a string matches a pattern. | `value` (required): The string to validate. <br> `pattern` (required): The pattern to match against. |
| `SLUG` | Checks if a string is a valid slug. | `value` (required): The string to validate. |
| `STRONGPASSWORD` | Checks if a string is a strong password. | `value` (required): The string to validate. <br> `options` (optional): An object that can contain the following properties: <br> `minLength` (optional): The minimum length of the password. Defaults to 8. <br> `minLowercase` (optional): The minimum number of lowercase letters. Defaults to 1. <br> `minUppercase` (optional): The minimum number of uppercase letters. Defaults to 1. <br> `minNumbers` (optional): The minimum number of digits. Defaults to 1. <br> `minSymbols` (optional): The minimum number of symbols. Defaults to 1. |
| `SURROGATEPAIR` | Checks if a string contains any surrogate pairs characters. | `value` (required): The string to validate. |
| `UPPERCASE` | Checks if a string is all uppercase. | `value` (required): The string to validate. |
| `URL` | Checks if a string is a valid URL. | `value` (required): The string to validate. <br> `options` (optional): An object that can contain the following properties: <br> `protocols` (optional): An array of valid protocols (such as `http` or `https`). Defaults to `['http', 'https', 'ftp']`. <br> `require_tld` (optional): If true, requires a top-level domain (such as `.com`). Defaults to true. <br> `require_protocol` (optional): If true, requires a protocol (such as `http`). Defaults to false. |
| `UUID` | Checks if a string is a valid UUID. | `value` (required): The string to validate. <br> `version` (optional): The UUID version to validate against (such as `3`, `4`, or `5`). Defaults to all versions. |
| `VARIABLEWIDTH` | Checks if a string contains any full-width characters. | `value` (required): The string to validate. |
| `WHITELISTED` | Checks if a string contains only whitelisted characters. | `value` (required): The string to validate. <br> `chars` (required): A string containing all allowed characters. |


