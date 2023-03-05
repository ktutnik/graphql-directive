# Core Validator

The core validator is a critical part of the validator directive in GraphQL that validates user-supplied values. It is highly extensible and enables effective validation of complex data structures. It also provides detailed error messages that aid in debugging.

## Extending Validation Logic
To create a custom validation directive, you need to provide two things: The plugin that is your own validation implementations to extend the validation core, and the directive schema. 

The plugins are a list of functions that will be used to validate the field value. It's important to note that the plugins don't need to provide the logic to traverse through the object fields because the core validator takes care of that. Instead, each plugin is responsible for validating a specific field or argument.

The directive schema, on the other hand, is used to define the custom validation directive itself. This includes specifying the directive name, its arguments, and the locations where it can be used. By defining the directive schema, you can ensure that your custom validation directive is integrated properly into your GraphQL schema.

## Example 
As an example, let's create a custom validation directive that leverage the functionality of the Validator.js library. In this example, we'll create a @validate directive with two methods: EMAIL and LENGTH. 

The EMAIL method will validate that a given field value is a valid email address, while the LENGTH method will validate that a given field value is a string with a length between a minimum and maximum value.

```typescript
import val from "validator"
import { createTransformer, Plugins } from "@graphql-directive/core-validator"

// plugins, the logic to validate field
const plugins:Plugins = {
    EMAIL: () => (str) => val.isEmail(str)
        || `Must be a valid email address`,

    LENGTH: (options: { min?: number, max?: number }) => (str) => val.isLength(str, options)
        || `Must be a string or array between ${options?.min ?? 0} and ${options?.max}`,
} 

// the validation directive schema
const typeDefs = `
    enum ValidationMethod {
        EMAIL, LENGTH
    }
    directive @validate(
        method: ValidationMethod!, 
        min:Number,
        max:Number
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

// transformer function that will glue the directive with the validation logic
const transform = createTransformer({ plugins, directive: "validate" })
```

The plugins are a key-value object consisting of plugin method names and their validation logic

```typescript
{
    METHOD: (options) => (value) => { /* logic */ }
}
```

The validation logic should return `true` or an error message. 

The directive schema should reflect the plugin functionalities such as the method name and its parameters. Like example above we providing the enum for the method and list of supported parameters. 

```graphql
enum ValidationMethod {
    EMAIL, LENGTH
}
directive @validate(
    method: ValidationMethod!, 
    # list of all plugin parameters
    min:Number,
    max:Number
) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
```

The last step is creating the transform function by calling the `createTransformer`. The first parameter is the plugins and the last parameter is the name of the directive in this case is `validate`.  