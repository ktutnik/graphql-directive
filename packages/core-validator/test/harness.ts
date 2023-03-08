import val from "validator"
import { createTransformer, Plugins } from "../src"


const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
        EMAIL, LENGTH, CUSTOM
    }
    directive @validate(
        method: ValidationMethod!, 
        validator:String,
        min:Int,
        max:Int
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

const plugins: Plugins = {
    EMAIL: (str, ctx) => val.isEmail(str)
        || `Must be a valid email address`,

    LENGTH: (str, ctx) => val.isLength(str, ctx.directiveArgs)
        || `Must be a string or array between ${ctx.directiveArgs?.min ?? 0} and ${ctx.directiveArgs?.max}`,

}

export default { typeDefs, transform: createTransformer({ plugins, directive: "validate" }) }