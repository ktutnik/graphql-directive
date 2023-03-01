
export interface TypeConfig {
    kind: "Type"
    name: String
    fields: FieldConfig[]
}

export interface FieldConfig {
    kind: "Field",
    name: string
    validator: Validator
}

export enum ValidationMethod {
    AFTER = "AFTER",
    ALPHA = "ALPHA",
    ALPHANUMERIC = "ALPHANUMERIC",
    ARRAY = "ARRAY",
    ASCII = "ASCII",
    BASE64 = "BASE64",
    BEFORE = "BEFORE",
    BOOLEAN = "BOOLEAN",
    BYTE_LENGTH = "BYTE_LENGTH",
    CREDIT_CARD = "CREDIT_CARD",
    CURRENCY = "CURRENCY",
    DATA_URI = "DATA_URI",
    DECIMAL = "DECIMAL",
    DIVISIBLE_BY = "DIVISIBLE_BY",
    EMAIL = "EMAIL",
    EMPTY = "EMPTY",
    ETHEREUM_ADDRESS = "ETHEREUM_ADDRESS",
    FQDN = "FQDN",
    FLOAT = "FLOAT",
    FULL_WIDTH = "FULL_WIDTH",
    HALF_WIDTH = "HALF_WIDTH",
    HEX_COLOR = "HEX_COLOR",
    HEX_DECIMAL = "HEX_DECIMAL",
    IP = "IP",
    IP_RANGE = "IP_RANGE",
    ISBN = "ISBN",
    ISIN = "ISIN",
    ISO8601 = "ISO8601",
    ISO31661_ALPHA2 = "ISO31661_ALPHA2",
    ISO31661_ALPHA3 = "ISO31661_ALPHA3",
    ISRC = "ISRC",
    ISSN = "ISSN",
    JSON = "JSON",
    JWT = "JWT",
    LAT_LONG = "LAT_LONG",
    LENGTH = "LENGTH",
    LOWERCASE = "LOWERCASE",
    MAC_ADDRESS = "MAC_ADDRESS",
    MIME_TYPE = "MIME_TYPE",
    MONGO_ID = "MONGO_ID",
    MULTIBYTE = "MULTIBYTE",
    NUMBER = "NUMBER",
    PORT = "PORT",
    POSTAL_CODE = "POSTAL_CODE",
    REGEX = "REGEX",
    SURROGATE_PAIR = "SURROGATE_PAIR",
    UPPERCASE = "UPPERCASE",
    URL = "URL",
    UUID = "UUID",
    VARIABLE_WIDTH = "VARIABLE_WIDTH",
    WHITELISTED = "WHITELISTED",
}

export interface DirectiveArgs {
    method: ValidationMethod,
    min: number,
    max: number
}

export interface ErrorMessage {
    path: string,
    message: string
}

export type NativeValidator = (val: any) => string | true

export type Validator = (val: any) => ErrorMessage[] | true