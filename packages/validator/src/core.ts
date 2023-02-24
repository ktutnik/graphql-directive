
export interface TypeConfig {
    kind: "Type"
    name: String
    fields: FieldConfig[]
}

export interface FieldConfig {
    kind: "Field",
    name: string
    dataType: string| [string]
    validators: DirectiveArgs[]
    arguments: ArgumentConfig[]
}

export interface ArgumentConfig {
    kind: "Argument",
    name:string
    dataType:string | [string]
    validators: DirectiveArgs[]
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

export type Validator = (val:any) => string[] | true