import val from "validator"
import { createTransformer } from "../src"


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

export default { typeDefs, transform: createTransformer() }