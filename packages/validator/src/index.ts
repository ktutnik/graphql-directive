import { createValidatorTransformer, Plugins } from "@graphql-directive/core"
import "graphql"
import val from "validator"

const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
        CUSTOM,

        AFTER,
        ALPHA,
        ALPHANUMERIC,
        ASCII,
        BASE64,
        BEFORE,
        BOOLEAN,
        CREDIT_CARD,
        CURRENCY,
        DATA_URI,
        DECIMAL,
        DIVISIBLE_BY,
        EMAIL,
        ETHEREUM_ADDRESS,
        FQDN,
        FLOAT,
        FULL_WIDTH,
        HALF_WIDTH,
        HEX_COLOR,
        HEXADECIMAL,
        IP,
        IP_RANGE,
        ISBN,
        ISIN,
        ISO8601,
        ISO31661_ALPHA2,
        ISO31661_ALPHA3,
        ISRC,
        ISSN,
        JSON,
        JWT,
        LAT_LONG,
        LENGTH,
        LOWERCASE,
        MAC_ADDRESS,
        MIME_TYPE,
        MONGO_ID,
        MULTIBYTE,
        NOT_EMPTY,
        NUMERIC,
        PORT,
        POSTAL_CODE,
        REGEX,
        SLUG,
        STRONG_PASSWORD,
        SURROGATE_PAIR,
        UPPERCASE,
        URL,
        UUID,
        VARIABLE_WIDTH,
        WHITELISTED,
    }
    directive @validate(
        method: ValidationMethod!, 
        validator: String,
        # custom message
        message: String,
        # FLOAT, LENGTH
        min:Int, 
        max:Int,
        # AFTER, BEFORE
        date: String,
        # ALPHA, ALPHANUMERIC, CURRENCY, DECIMAL, NUMERIC
        locale: String,
        # DECIMAL
        force_decimal: Boolean,
        decimal_digits: String,
        number: Float,
        # EMAIL
        allow_display_name: Boolean,
        require_display_name: Boolean,
        allow_utf8_local_part: Boolean,
        require_tld: Boolean,
        ignore_max_length: Boolean,
        allow_ip_domain: Boolean,
        domain_specific_validation: Boolean,
        host_blacklist: [String],
        blacklisted_chars: String,
        # FQDN
        allow_underscores: Boolean,
        allow_trailing_dot: Boolean,
        allow_numeric_tld: Boolean,
        allow_wildcard: Boolean,
        # FLOAT
        gt: Float,
        lt: Float,
        # IP, IP_RANGE, ISBN
        version: String,
        # ISO8061
        strict: Boolean,
        strictSeparator: Boolean,
        # ISSN
        case_sensitive: Boolean,
        require_hyphen: Boolean,
        # NOT_EMPTY
        ignore_whitespace: Boolean,
        # NUMERIC
        no_symbols: Boolean,
        # REGEX
        pattern: String,
        modifier: String
        # STRONG_PASSWORD
        minLength: Int,
        minLowercase: Int,
        minUppercase: Int,
        minNumbers: Int,
        minSymbols: Int,
        returnScore: Boolean,
        pointsPerUnique: Int,
        pointsPerRepeat: Int,
        pointsForContainingLower: Int,
        pointsForContainingUpper: Int,
        pointsForContainingNumber: Int,
        pointsForContainingSymbol: Int,
        # URL
        protocols: String,
        require_protocol: Boolean,
        require_host: Boolean,
        require_port: Boolean,
        require_valid_protocol: Boolean,
        host_whitelist: [String],
        allow_protocol_relative_urls: Boolean,
        disallow_auth: Boolean,
        allow_fragments: Boolean,
        allow_query_components: Boolean,
        # WHITELISTED
        chars: String
    ) repeatable on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
`

const createStrongPwdMessage = (option: val.StrongPasswordOptions) => {
    const opt = { minLength: 8, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1, ...option }
    const firstPhrase = [
        "Must have",
        !!opt.minLength ? `at least ${opt.minLength} chars` : ""
    ].filter(x => x !== "").join(" ")
    const secondPhrase = [
        !!opt.minLowercase ? `lowercase` : "",
        !!opt.minNumbers ? `number` : "",
        !!opt.minSymbols ? `symbol` : "",
        !!opt.minUppercase ? `uppercase` : "",
    ].filter(x => x !== "").join(" ")
    return [firstPhrase, secondPhrase].filter(x => x !== "").join(" and combination of ")
}

const formatDate = (date: string | undefined) => {
    return !!date ? new Date(date).toLocaleDateString() : "today"
}

const plugins: Plugins = {
    AFTER: (str, { directiveArgs: options }) => val.isAfter(str, options.date)
        || options.message
        || `Must be a date after ${formatDate(options.date)}`,

    ALPHA: (str, { directiveArgs: options }) => val.isAlpha(str, options.locale)
        || options.message
        || 'Must only contain letters',

    ALPHANUMERIC: (str, { directiveArgs: options }) => val.isAlphanumeric(str, options.locale)
        || options.message
        || 'Must only contain letters and numbers',

    ASCII: (str, { directiveArgs: options }) => val.isAscii(str)
        || options.message
        || 'Must only contain ASCII characters',

    BASE64: (str, { directiveArgs: options }) => val.isBase64(str)
        || options.message
        || 'Must be a valid base64 encoded string',

    BEFORE: (str, { directiveArgs: options }) => val.isBefore(str, options.date)
        || `Must be a date before ${formatDate(options.date)}`,

    BOOLEAN: (str, { directiveArgs: options }) => val.isBoolean(str)
        || options.message
        || 'Must be a boolean',

    CREDIT_CARD: (str, { directiveArgs: options }) => val.isCreditCard(str)
        || options.message
        || 'Must be a valid credit card number',

    CURRENCY: (str, { directiveArgs: options }) => val.isCurrency(str, options)
        || options.message
        || 'Must be a valid currency amount',

    DATA_URI: (str, { directiveArgs: options }) => val.isDataURI(str)
        || options.message
        || 'Must be a valid data URI',

    DECIMAL: (str, { directiveArgs: options }) => val.isDecimal(str, options)
        || options.message
        || 'Must be a decimal number',

    DIVISIBLE_BY: (str, { directiveArgs: options }) => val.isDivisibleBy(str, options.number)
        || options.message
        || `Must be a number that's divisible by ${options.number}`,

    EMAIL: (str, { directiveArgs: options }) => val.isEmail(str, options)
        || options.message
        || 'Must be a valid email address',

    ETHEREUM_ADDRESS: (str, { directiveArgs: options }) => val.isEthereumAddress(str)
        || options.message
        || 'Must be a valid Ethereum address',

    FQDN: (str, { directiveArgs: options }) => val.isFQDN(str, options)
        || options.message
        || 'Must be a valid fully qualified domain name',

    FLOAT: (str, { directiveArgs: options }) => val.isFloat(str, options)
        || options.message
        || 'Must be a float number',

    FULL_WIDTH: (str, { directiveArgs: options }) => val.isFullWidth(str)
        || options.message
        || 'Must contain full-width characters',

    HALF_WIDTH: (str, { directiveArgs: options }) => val.isHalfWidth(str)
        || options.message
        || 'Must contain half-width characters',

    HEX_COLOR: (str, { directiveArgs: options }) => val.isHexColor(str)
        || options.message
        || 'Must be a valid hex color code',

    HEXADECIMAL: (str, { directiveArgs: options }) => val.isHexadecimal(str)
        || options.message
        || 'Must be a valid hexadecimal number',

    IP: (str, { directiveArgs: options }) => val.isIP(str, options.version)
        || options.message
        || `Must be a valid ${options.version} IP address`,

    IP_RANGE: (str, { directiveArgs: options }) => val.isIPRange(str, options.version)
        || options.message
        || 'Must be a valid IP range',

    ISBN: (str, { directiveArgs: options }) => val.isISBN(str, options.version)
        || options.message
        || `Must be a valid ISBN ${options.version}`,

    ISIN: (str, { directiveArgs: options }) => val.isISIN(str)
        || options.message
        || 'Must be a valid ISIN (International Securities Identification Number)',

    ISO8601: (str, { directiveArgs: options }) => val.isISO8601(str, options)
        || 'Must be a valid ISO8601 date string',

    ISO31661_ALPHA2: (str, { directiveArgs: options }) => val.isISO31661Alpha2(str)
        || options.message
        || 'Must be a valid ISO 3166-1 alpha-2 country code',

    ISO31661_ALPHA3: (str, { directiveArgs: options }) => val.isISO31661Alpha3(str)
        || options.message
        || 'Must be a valid ISO 3166-1 alpha-3 country code',

    ISRC: (str, { directiveArgs: options }) => val.isISRC(str)
        || options.message
        || 'Must be a valid International Standard Recording Code (ISRC)',

    ISSN: (str, { directiveArgs: options }) => val.isISSN(str, options)
        || options.message
        || 'Must be a valid International Standard Serial Number (ISSN)',

    JSON: (str, { directiveArgs: options }) => val.isJSON(str)
        || options.message
        || 'Must be a valid JSON string',

    JWT: (str, { directiveArgs: options }) => val.isJWT(str)
        || options.message
        || 'Must be a valid JSON Web Token (JWT)',

    LAT_LONG: (str, { directiveArgs: options }) => val.isLatLong(str)
        || options.message
        || 'Must be a valid latitude coordinate',

    LENGTH: (str, { directiveArgs: options }) => val.isLength(str, options)
        || options.message
        || 'Must have a length within the specified range',

    LOWERCASE: (str, { directiveArgs: options }) => val.isLowercase(str)
        || options.message
        || 'Must be all lowercase',

    MAC_ADDRESS: (str, { directiveArgs: options }) => val.isMACAddress(str)
        || options.message
        || 'Must be a valid MAC address',

    MIME_TYPE: (str, { directiveArgs: options }) => val.isMimeType(str)
        || options.message
        || 'Must be a valid MIME type',

    MONGO_ID: (str, { directiveArgs: options }) => val.isMongoId(str)
        || options.message
        || 'Must be a valid MongoDB ObjectId',

    MULTIBYTE: (str, { directiveArgs: options }) => val.isMultibyte(str)
        || options.message
        || 'Must contain one or more multibyte characters',

    NOT_EMPTY: (str, { directiveArgs: options }) => !val.isEmpty(str, options)
        || options.message
        || 'Must not be empty',

    NUMERIC: (str, { directiveArgs: options }) => val.isNumeric(str, options)
        || options.message
        || 'Must be a number',

    PORT: (str, { directiveArgs: options }) => val.isPort(str)
        || options.message
        || 'Must be a valid port number',

    POSTAL_CODE: (str, { directiveArgs: options }) => val.isPostalCode(str, options.locale)
        || options.message
        || 'Must be a valid postal code',

    REGEX: (str, { directiveArgs: options }) => val.matches(str, options.pattern, options.modifier)
        || options.message
        || 'Must be a valid postal code',

    SLUG: (str, { directiveArgs: options }) => val.isSlug(str)
        || options.message
        || 'Must be a valid slug',

    STRONG_PASSWORD: (str, { directiveArgs: options }) => val.isStrongPassword(str, { ...options, returnScore: false })
        || options.message
        || createStrongPwdMessage(options),

    SURROGATE_PAIR: (str, { directiveArgs: options }) => val.isSurrogatePair(str)
        || options.message
        || 'Must contain any surrogate pairs characters',

    UPPERCASE: (str, { directiveArgs: options }) => val.isUppercase(str)
        || options.message
        || 'Must only contain uppercase characters',

    URL: (str, { directiveArgs: options }) => val.isURL(str, options)
        || options.message
        || 'Must be a valid URL',

    UUID: (str, { directiveArgs: options }) => val.isUUID(str, options.version)
        || options.message
        || 'Must be a valid UUID',

    VARIABLE_WIDTH: (str, { directiveArgs: options }) => val.isVariableWidth(str)
        || options.message
        || 'Must contain a mixture of full and half-width characters',

    WHITELISTED: (str, { directiveArgs: options }) => val.isWhitelisted(str, options.chars)
        || options.message
        || `Must only contain characters from the whitelist: ${options.chars}`,
}

export default {
    typeDefs,
    transform: createValidatorTransformer({ plugins, directive: "validate" })
};