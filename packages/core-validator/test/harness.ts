import val from "validator"
import { createTransformer, Plugins } from "../src"


const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
        EMAIL, ARRAY
    }
    directive @validate(
        method: ValidationMethod!, 
        date:String,
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

const plugins = {
    ["AFTER"]: (options: { date: string }) => (str) => val.isAfter(str, options.date)
        || `Must be a date after ${new Date(options.date).toLocaleDateString()}`,
    ["EMAIL"]: () => (str) => val.isEmail(str)
        || `Must be a valid email address`,
} as Plugins


export default { typeDefs, transform: createTransformer({ plugins, directive: "validate" }) }