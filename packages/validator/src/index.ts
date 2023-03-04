import { createTransformer, Plugins } from "@graphql-directive/core-validator"
import val from "validator"
import "graphql"

const typeDefs = /* GraphQL */ `
    enum ValidationMethod {
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

const createStrongPwdMessage = (opt: val.StrongPasswordOptions) => {
    const result = [
        !!opt.minLength ? `at least ${opt.minLength} chars` : false,
        !!opt.minLowercase ? `lowercase` : false,
        !!opt.minNumbers ? `number` : false,
        !!opt.minSymbols ? `symbol` : false,
        !!opt.minUppercase ? `uppercase` : false
    ].filter(x => typeof x === "string").join(",")
    return `Must have ${result}`
}

const formatDate = (date: string | undefined) => {
    return !!date ? new Date(date).toLocaleDateString() : "today"
}

const plugins: Plugins = {
    ["AFTER"]:
        (options: { date: string }) => (str) => val.isAfter(str, options.date)
            || `Must be a date after ${formatDate(options.date)}`,

    ["ALPHA"]:
        (options: { locale: val.AlphaLocale }) => (str) => val.isAlpha(str, options.locale)
            || 'Must only contain letters',

    ["ALPHANUMERIC"]:
        (options: { locale: val.AlphanumericLocale }) => (str) => val.isAlphanumeric(str, options.locale)
            || 'Must only contain letters and numbers',

    ["ASCII"]:
        () => (str) => val.isAscii(str)
            || 'Must only contain ASCII characters',

    ["BASE64"]:
        () => (str) => val.isBase64(str)
            || 'Must be a valid base64 encoded string',

    ["BEFORE"]:
        (options: { date: string }) => (str) => val.isBefore(str, options.date)
            || `Must be a date before ${formatDate(options.date)}`,

    ["BOOLEAN"]:
        () => (str) => val.isBoolean(str)
            || 'Must be a boolean',

    ["CREDIT_CARD"]:
        () => (str) => val.isCreditCard(str)
            || 'Must be a valid credit card number',

    ["CURRENCY"]:
        (options) => (str) => val.isCurrency(str, options)
            || 'Must be a valid currency amount',

    ["DATA_URI"]:
        () => (str) => val.isDataURI(str)
            || 'Must be a valid data URI',

    ["DECIMAL"]:
        (options: val.IsDecimalOptions) => (str) => val.isDecimal(str, options)
            || 'Must be a decimal number',

    ["DIVISIBLE_BY"]:
        (options: { number: number }) => (str) => val.isDivisibleBy(str, options.number)
            || `Must be a number that's divisible by ${options.number}`,

    ["EMAIL"]:
        (options:val.IsEmailOptions) => (str) => val.isEmail(str, options)
            || 'Must be a valid email address',

    ["ETHEREUM_ADDRESS"]:
        () => (str) => val.isEthereumAddress(str)
            || 'Must be a valid Ethereum address',

    ["FQDN"]:
        (options) => (str) => val.isFQDN(str, options)
            || 'Must be a valid fully qualified domain name',

    ["FLOAT"]:
        (options) => (str) => val.isFloat(str, options)
            || 'Must be a float number',

    ["FULL_WIDTH"]:
        () => (str) => val.isFullWidth(str)
            || 'Must contain full-width characters',

    ["HALF_WIDTH"]:
        () => (str) => val.isHalfWidth(str)
            || 'Must contain half-width characters',

    ["HEX_COLOR"]:
        () => (str) => val.isHexColor(str)
            || 'Must be a valid hex color code',

    ["HEXADECIMAL"]:
        () => (str) => val.isHexadecimal(str)
            || 'Must be a valid hexadecimal number',

    ["IP"]:
        (options: { version: val.IPVersion }) => (str) => val.isIP(str, options.version)
            || `Must be a valid ${options.version} IP address`,

    ["IP_RANGE"]:
        (options: { version: val.IPVersion }) => (str) => val.isIPRange(str, options.version)
            || 'Must be a valid IP range',

    ["ISBN"]:
        (options: { version: val.ISBNVersion }) => (str) => val.isISBN(str, options.version)
            || `Must be a valid ISBN ${options.version}`,

    ["ISIN"]:
        () => (str) => val.isISIN(str)
            || 'Must be a valid ISIN (International Securities Identification Number)',

    ["ISO8601"]:
        (options) => (str) => val.isISO8601(str, options)
            || 'Must be a valid ISO8601 date string',

    ["ISO31661_ALPHA2"]:
        () => (str) => val.isISO31661Alpha2(str)
            || 'Must be a valid ISO 3166-1 alpha-2 country code',

    ["ISO31661_ALPHA3"]:
        () => (str) => val.isISO31661Alpha3(str)
            || 'Must be a valid ISO 3166-1 alpha-3 country code',

    ["ISRC"]:
        () => (str) => val.isISRC(str)
            || 'Must be a valid International Standard Recording Code (ISRC)',

    ["ISSN"]:
        (options) => (str) => val.isISSN(str, options)
            || 'Must be a valid International Standard Serial Number (ISSN)',

    ["JSON"]:
        () => (str) => val.isJSON(str)
            || 'Must be a valid JSON string',

    ["JWT"]:
        () => (str) => val.isJWT(str)
            || 'Must be a valid JSON Web Token (JWT)',

    ["LAT_LONG"]:
        () => (str) => val.isLatLong(str)
            || 'Must be a valid latitude coordinate',

    ["LENGTH"]:
        (options) => (str) => val.isLength(str, options)
            || 'Must have a length within the specified range',

    ["LOWERCASE"]:
        () => (str) => val.isLowercase(str)
            || 'Must be all lowercase',

    ["MAC_ADDRESS"]:
        () => (str) => val.isMACAddress(str)
            || 'Must be a valid MAC address',

    ["MIME_TYPE"]:
        () => (str) => val.isMimeType(str)
            || 'Must be a valid MIME type',

    ["MONGO_ID"]:
        () => (str) => val.isMongoId(str)
            || 'Must be a valid MongoDB ObjectId',

    ["MULTIBYTE"]:
        () => (str) => val.isMultibyte(str)
            || 'Must contain one or more multibyte characters',

    ["NOT_EMPTY"]:
        (options) => (str) => !val.isEmpty(str, options)
            || 'Must not be empty',

    ["NUMERIC"]:
        (options) => (str) => val.isNumeric(str, options)
            || 'Must be a number',

    ["PORT"]:
        () => (str) => val.isPort(str)
            || 'Must be a valid port number',

    ["POSTAL_CODE"]:
        (options: { locale: val.PostalCodeLocale }) => (str) => val.isPostalCode(str, options.locale)
            || 'Must be a valid postal code',

    ["REGEX"]:
        (options: { pattern: string, modifier: string }) => (str) => val.matches(str, options.pattern, options.modifier)
            || 'Must be a valid postal code',

    ["SLUG"]:
        () => (str) => val.isSlug(str)
            || 'Must be a valid slug',

    ["STRONG_PASSWORD"]:
        (options: val.StrongPasswordOptions) => (str) => val.isStrongPassword(str, { ...options, returnScore: false })
            || createStrongPwdMessage(options),

    ["SURROGATE_PAIR"]:
        () => (str) => val.isSurrogatePair(str)
            || 'Must contain any surrogate pairs characters',

    ["UPPERCASE"]:
        () => (str) => val.isUppercase(str)
            || 'Must only contain uppercase characters',

    ["URL"]:
        (options) => (str) => val.isURL(str, options)
            || 'Must be a valid URL',

    ["UUID"]:
        (options: { version: val.UUIDVersion }) => (str) => val.isUUID(str, options.version)
            || 'Must be a valid UUID',

    ["VARIABLE_WIDTH"]:
        () => (str) => val.isVariableWidth(str)
            || 'Must contain a mixture of full and half-width characters',

    ["WHITELISTED"]:
        (options: { chars: string | string[] }) => (str) => val.isWhitelisted(str, options.chars)
            || `Must only contain characters from the whitelist: ${options.chars}`,

}

export default {
    typeDefs,
    transform: createTransformer({ plugins, directive: "validate" })
};