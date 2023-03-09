
import { makeExecutableSchema } from "@graphql-tools/schema"
import { graphql } from "graphql"
import val from "../src"


function run(directive: string, value: string) {
    const typeDefs = /* GraphQL */ `
        type Query { name:String! }
        
        type Mutation { 
            test(val:String! ${directive}):Boolean!
        }
    `

    const schema = val.transform(makeExecutableSchema({
        typeDefs: [val.typeDefs, typeDefs],
        resolvers: {
            Mutation: {
                test: () => true
            }
        }
    }))
    return graphql({ schema, source: `mutation { test(val: "${value}") }` })
}

it("Should validate date properly", async () => {
    const success = await run(`@validate(method: AFTER)`, new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString())
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: AFTER)`, "2001-1-1")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: AFTER, message: "Custom message")`, "2001-1-1")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate alphabetic string properly", async () => {
    const success = await run(`@validate(method: ALPHA)`, "abc")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ALPHA)`, "123")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ALPHA, message: "Custom message")`, "123")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate alphanumeric string properly", async () => {
    const success = await run(`@validate(method: ALPHANUMERIC)`, "abc123")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ALPHANUMERIC)`, "abc!@#")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ALPHANUMERIC, message: "Custom message")`, "abc!@#")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ASCII string properly", async () => {
    const success = await run(`@validate(method: ASCII)`, "Hello world")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ASCII)`, "你好世界")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ASCII, message: "Custom message")`, "你好世界")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate base64 string properly", async () => {
    const success = await run(`@validate(method: BASE64)`, "SGVsbG8gV29ybGQh")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: BASE64)`, "Not a base64 string!")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: BASE64, message: "Custom message")`, "Not a base64 string!")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate date before properly", async () => {
    const success = await run(`@validate(method: BEFORE, date: "2022-1-1")`, "2021-12-31")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: BEFORE, date: "2022-1-1")`, "2023-01-01")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: BEFORE, date: "2022-1-1", message: "Custom message")`, "2023-01-01")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate boolean properly", async () => {
    const success = await run(`@validate(method: BOOLEAN)`, "true")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: BOOLEAN)`, "notaboolean")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: BOOLEAN, message: "Custom message")`, "notaboolean")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate credit card properly", async () => {
    const success = await run(`@validate(method: CREDIT_CARD)`, "4111111111111111")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: CREDIT_CARD)`, "notacreditcardnumber")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: CREDIT_CARD, message: "Custom message")`, "notacreditcardnumber")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate currency properly", async () => {
    const success = await run(`@validate(method: CURRENCY)`, "$1.00")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: CURRENCY)`, "notacurrency")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: CURRENCY, message: "Custom message")`, "notacurrency")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate data URI properly", async () => {
    const success = await run(`@validate(method: DATA_URI)`, "data:image/png;base64,iVBORw")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: DATA_URI)`, "notadataURI")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: DATA_URI, message: "Custom message")`, "notadataURI")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate decimal properly", async () => {
    const success = await run(`@validate(method: DECIMAL)`, "1234.5678")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: DECIMAL)`, "1,234")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: DECIMAL, message: "Custom message")`, "1,234")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate divisible properly", async () => {
    const success = await run(`@validate(method: DIVISIBLE_BY, number: 3)`, "9")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: DIVISIBLE_BY, number: 3)`, "10")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: DIVISIBLE_BY, number: 3, message: "Custom message")`, "10")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate email properly", async () => {
    const success = await run(`@validate(method: EMAIL)`, "test@example.com")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: EMAIL)`, "notanemail")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: EMAIL, message: "Custom message")`, "notanemail")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate empty properly", async () => {
    const success = await run(`@validate(method: NOT_EMPTY)`, "hello")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: NOT_EMPTY)`, "")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: NOT_EMPTY, message: "Custom message")`, "")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate Ethereum address properly", async () => {
    const success = await run(`@validate(method: ETHEREUM_ADDRESS)`, "0x742d35Cc6634C0532925a3b844Bc454e4438f44e")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ETHEREUM_ADDRESS)`, "notanethereumaddress")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ETHEREUM_ADDRESS, message: "Custom message")`, "notanethereumaddress")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate domain name properly", async () => {
    const success = await run(`@validate(method: FQDN)`, "example.com")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: FQDN)`, "example")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: FQDN, message: "Custom message")`, "example")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate float properly", async () => {
    const success = await run(`@validate(method: FLOAT)`, "1.23")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: FLOAT)`, "invalidnumber")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: FLOAT, message: "Custom message")`, "invalidnumber")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate full-width string properly", async () => {
    const success = await run(`@validate(method: FULL_WIDTH)`, "ＨＥＬＬＯ")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: FULL_WIDTH)`, "hello")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: FULL_WIDTH, message: "Custom message")`, "hello")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate half-width string properly", async () => {
    const success = await run(`@validate(method: HALF_WIDTH)`, "hello")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: HALF_WIDTH)`, "ＨＥＬＬＯ")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: HALF_WIDTH, message: "Custom message")`, "ＨＥＬＬＯ")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate hexadecimal color code properly", async () => {
    const success = await run(`@validate(method: HEX_COLOR)`, "#ff0000")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: HEX_COLOR)`, "notacolorcode")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: HEX_COLOR, message: "Custom message")`, "notacolorcode")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate hexadecimal properly", async () => {
    const success = await run(`@validate(method: HEXADECIMAL)`, "deadbeef")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: HEXADECIMAL)`, "notahexadecimal")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: HEXADECIMAL, message: "Custom message")`, "notahexadecimal")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate IP address properly", async () => {
    const success = await run(`@validate(method: IP)`, "192.168.1.1")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: IP)`, "notanipaddress")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: IP, message: "Custom message")`, "notanipaddress")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate IP range properly", async () => {
    const success = await run(`@validate(method: IP_RANGE)`, "192.168.0.1/24")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: IP_RANGE)`, "notaniprange")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: IP_RANGE, message: "Custom message")`, "notaniprange")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISBN properly", async () => {
    const success = await run(`@validate(method: ISBN)`, "3-8362-2119-5")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISBN)`, "notanisbn")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISBN, message: "Custom message")`, "notanisbn")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISIN properly", async () => {
    const success = await run(`@validate(method: ISIN)`, "US0378331005")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISIN)`, "notanisin")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISIN, message: "Custom message")`, "notanisin")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISO8601 date properly", async () => {
    const success = await run(`@validate(method: ISO8601)`, "2022-03-02")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISO8601)`, "notaniso8601date")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISO8601, message: "Custom message")`, "notaniso8601date")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISO 3166-1 alpha-2 code properly", async () => {
    const success = await run(`@validate(method: ISO31661_ALPHA2)`, "US")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISO31661_ALPHA2)`, "notaniso31661alpha2code")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISO31661_ALPHA2, message: "Custom message")`, "notaniso31661alpha2code")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISO 3166-1 alpha-3 code properly", async () => {
    const success = await run(`@validate(method: ISO31661_ALPHA3)`, "USA")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISO31661_ALPHA3)`, "notaniso31661alpha3code")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISO31661_ALPHA3, message: "Custom message")`, "notaniso31661alpha3code")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISRC properly", async () => {
    const success = await run(`@validate(method: ISRC)`, "USRC17607839")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISRC)`, "notanisrc")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISRC, message: "Custom message")`, "notanisrc")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate ISSN properly", async () => {
    const success = await run(`@validate(method: ISSN)`, "0317-8471")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: ISSN)`, "notanissn")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: ISSN, message: "Custom message")`, "notanissn")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate JSON properly", async () => {
    const success = await run(`@validate(method: JSON)`, `{ \\"name\\": \\"John\\", \\"age\\": 30 }`)
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: JSON)`, "notajsonstring")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: JSON, message: "Custom message")`, "notajsonstring")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate JWT properly", async () => {
    const success = await run(`@validate(method: JWT)`, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: JWT)`, "notajwt")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: JWT, message: "Custom message")`, "notajwt")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate latitude and longitude properly", async () => {
    const success = await run(`@validate(method: LAT_LONG)`, "55.720923,-28.652344")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: LAT_LONG)`, "90.1000000, 180.000000")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: LAT_LONG, message: "Custom message")`, "90.1000000, 180.000000")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate length properly", async () => {
    const success = await run(`@validate(method: LENGTH, max: 5)`, "1234")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: LENGTH, max: 5)`, "123456")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: LENGTH, max: 5, message: "Custom message")`, "123456")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate lowercase properly", async () => {
    const success = await run(`@validate(method: LOWERCASE)`, "hello")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: LOWERCASE)`, "Hello")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: LOWERCASE, message: "Custom message")`, "Hello")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate MAC address properly", async () => {
    const success = await run(`@validate(method: MAC_ADDRESS)`, "01:23:45:67:89:ab")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: MAC_ADDRESS)`, "notamacaddress")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: MAC_ADDRESS, message: "Custom message")`, "notamacaddress")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate MIME type properly", async () => {
    const success = await run(`@validate(method: MIME_TYPE)`, "image/jpeg")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: MIME_TYPE)`, "notamimetype")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: MIME_TYPE, message: "Custom message")`, "notamimetype")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate MongoDB ObjectId properly", async () => {
    const success = await run(`@validate(method: MONGO_ID)`, "507f1f77bcf86cd799439011")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: MONGO_ID)`, "notamongodbobjectid")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: MONGO_ID, message: "Custom message")`, "notamongodbobjectid")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate multibyte characters properly", async () => {
    const success = await run(`@validate(method: MULTIBYTE)`, "こんにちは")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: MULTIBYTE)`, "hello")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: MULTIBYTE, message: "Custom message")`, "hello")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate numeric characters properly", async () => {
    const success = await run(`@validate(method: NUMERIC)`, "1234")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: NUMERIC)`, "notanumber")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: NUMERIC, message: "Custom message")`, "notanumber")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate port number properly", async () => {
    const success = await run(`@validate(method: PORT)`, "3000")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: PORT)`, "notaport")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: PORT, message: "Custom message")`, "notaport")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate postal code properly", async () => {
    const success = await run(`@validate(method: POSTAL_CODE, locale: "any")`, "94043")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: POSTAL_CODE, locale: "any")`, "notapostalcode")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: POSTAL_CODE, locale: "any", message: "Custom message")`, "notapostalcode")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
    
})

it("Should validate regex properly", async () => {
    const success = await run(`@validate(method: REGEX, pattern: "^[^\s@]+@[^\s@]+\.[^\s@]+$")`, "email@mail.com")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: REGEX, pattern: "^[^\s@]+@[^\s@]+\.[^\s@]+$")`, "notemail")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: REGEX, pattern: "^[^\s@]+@[^\s@]+\.[^\s@]+$", message: "Custom message")`, "notemail")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("Should validate slug properly", async () => {
    const success = await run(`@validate(method: SLUG)`, "example-slug")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: SLUG)`, "not a slug")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: SLUG, message: "Custom message")`, "not a slug")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("Should validate password properly", async () => {
    const success = await run(`@validate(method: STRONG_PASSWORD)`, "AbCdef35*")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: STRONG_PASSWORD)`, "AbcD3")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const failed2 = await run(`@validate(method: STRONG_PASSWORD, minLowercase: 0, minUppercase: 0, minNumbers: 0, minSymbols: 1)`, "abcdef")
    expect(failed2.data).toBe(null)
    expect(failed2.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: STRONG_PASSWORD, message: "Custom message")`, "AbcD3")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("Should validate URL properly", async () => {
    const success = await run(`@validate(method: URL)`, "https://example.com")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: URL)`, "notanurl")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: URL, message: "Custom message")`, "notanurl")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("Should validate UUID properly", async () => {
    const success = await run(`@validate(method: UUID)`, "f7eb504d-b7e3-4e3f-a87d-1d93b98df94d")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: UUID)`, "notauuid")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: UUID, message: "Custom message")`, "notauuid")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("should validate variable width characters", async () => {
    const success = await run(`@validate(method: VARIABLE_WIDTH)`, "ひらがなカタカナ漢字ABCDE")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: VARIABLE_WIDTH)`, "abcde")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: VARIABLE_WIDTH, message: "Custom message")`, "abcde")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("should validate whitelisted characters", async () => {
    const success = await run(`@validate(method: WHITELISTED, chars: "abcdefghijklmnopqrstuvwxyz")`, "abcdefghijklmnopqrstuvwxyz")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: WHITELISTED, chars: "abcdefghijklmnopqrstuvwxyz")`, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: WHITELISTED, chars: "abcdefghijklmnopqrstuvwxyz", message: "Custom message")`, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("should validate surrogate pairs", async () => {
    const success = await run(`@validate(method: SURROGATE_PAIR)`, "👨🏻")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: SURROGATE_PAIR)`, "")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: SURROGATE_PAIR, message: "Custom message")`, "")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

it("should validate uppercase characters", async () => {
    const success = await run(`@validate(method: UPPERCASE)`, "ABCDEFGHIJKLMNOPQRSTUVWXYZ")
    expect(success.data!.test).toBe(true)
    const failed = await run(`@validate(method: UPPERCASE)`, "abcdefghijklmnopqrstuvwxyz")
    expect(failed.data).toBe(null)
    expect(failed.errors![0].extensions).toMatchSnapshot()
    const message = await run(`@validate(method: UPPERCASE, message: "Custom message")`, "abcdefghijklmnopqrstuvwxyz")
    expect(message.data).toBe(null)
    expect(message.errors![0].extensions).toMatchSnapshot()
})

