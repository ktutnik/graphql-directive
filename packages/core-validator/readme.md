# Core Validator

[![Node.js CI](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml/badge.svg)](https://github.com/ktutnik/graphql-directive/actions/workflows/test.yml)
[![Coverage Status](https://coveralls.io/repos/github/ktutnik/graphql-directive/badge.svg?branch=master)](https://coveralls.io/github/ktutnik/graphql-directive?branch=master)

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
    EMAIL: (str, { directiveArgs: args }) => val.isEmail(str)
        || args.message
        || `Must be a valid email address`,

    LENGTH: (str, { directiveArgs: args }) => val.isLength(str, ctx.directiveArgs)
        || args.message
        || `Must be a string or array between ${args?.min ?? 0} and ${args?.max}`,
} 

// the validation directive schema
const typeDefs = `
    enum ValidationMethod {
        EMAIL, LENGTH
    }
    directive @validate(
        method: ValidationMethod!, 
        message: String,
        validator: String,
        min:Int,
        max:Int
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

// transformer function that will glue the directive with the validation logic
const transform = createTransformer({ plugins, directive: "validate" })
```

The plugins are a key-value object consisting of plugin method names and their validation logic

```typescript
{
    METHOD: (value, ctx) => isValid(value) 
        || ctx.directiveArgs.message 
        || "The error message"
}
```


`args` : Is the argument passed from the `@validate` directive, for example `@validate(method: LENGTH, min: 1, max: 150)`, the `args` parameter will contains `{ min: 1, max: 150 }`. 

`option`: Is the transformer options, contains some useful information such as list of plugins, directive name (for custom directive name), and list of custom functions. 

Validator is a function with signature like above with below parameters:

* `value`: Is the value that will be validate

* `ctx`: Is the validation context, it contains more detail information required for custom validation.
    * `options` : Contains options values of transformer
    * `path` : The location of where validator applied from the root path through the GraphQL fields
    * `contextValue` : An object shared across all resolvers that are executing for a particular operation. Use this to share per-operation state, including authentication information, dataloader instances, and anything else to track across resolvers.
    * `parent` : The return value of the resolver for this field's parent (i.e., the previous resolver in the resolver chain). 
    * `args` : An object that contains all GraphQL arguments provided for this field.
    * `info` : Contains information about the operation's execution state, including the field name, the path to the field from the root, and more.
    * `directiveArgs` : Contains argument passed by the @validate directive. For example `@validate(method: LENGTH, min: 1, max: 150)`, the `args` parameter will contains `{ min: 1, max: 150 }`.  


The return value is `true | string`


The directive schema should reflect the plugin functionalities such as the method name and its parameters. Like example above we providing the enum for the method and list of supported parameters. 

```graphql
enum ValidationMethod {
    CUSTOM, EMAIL, LENGTH
}
directive @validate(
    # the method name
    method: ValidationMethod!, 
    # the custom validator
    validator: String,
    # for custom message
    message: String,
    # list of all plugin parameters
    min:Int,
    max:Int
) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
```

The last step is creating the transform function by calling the `createTransformer`. The first parameter is the plugins and the last parameter is the name of the directive in this case is `validate`.  

> IMPORTANT
>
> * `CUSTOM` on `ValidationMethod` is required
> * Top 3 parameters (`method`, `validator`, `message`) are required to add.