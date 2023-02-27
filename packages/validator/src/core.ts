
export interface TypeConfig {
    kind: "Type"
    name: String
    fields: FieldConfig[]
}

export interface FieldConfig {
    kind: "Field",
    name: string
    validator: ObjectValidator
}

export enum ValidationMethod {
    EMAIL = "EMAIL",
    ARRAY = "ARRAY"
}

export interface DirectiveArgs {
    method: ValidationMethod,
    min: number,
    max: number
}

export interface ErrorMessage {
    path: string,
    message: string[]
}

export type Validator = (val: any) => string[] | true

export type ObjectValidator = (val: any) => ErrorMessage[] | true