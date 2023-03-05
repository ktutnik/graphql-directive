import val from "validator"
import { createTransformer, Plugins } from "../src"


const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
        EMAIL, LENGTH
    }
    directive @validate(
        method: ValidationMethod!, 
        min:Int,
        max:Int
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

const plugins:Plugins = {
    ["EMAIL"]: () => (str) => val.isEmail(str)
        || `Must be a valid email address`,

    ["LENGTH"]: (options: { min?: number, max?: number }) => (str) => val.isLength(str, options)
        || `Must be a string or array between ${options?.min ?? 0} and ${options?.max}`,
} 


export default { typeDefs, transform: createTransformer({ plugins, directive: "validate" }) }