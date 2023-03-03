import val from "validator"
import { ValidationMethod, NativeValidator } from "./core"

type Validators = {
    [key: string]:
    (config: any) => NativeValidator

}

export default {
    [ValidationMethod.AFTER]:
        (options: { date: string }) => (str) => val.isAfter(str, options.date)
            || `Must be a date after ${new Date(options.date).toLocaleDateString()}`,

    [ValidationMethod.ALPHA]:
        (options: { locale: val.AlphaLocale }) => (str) => val.isAlpha(str, options.locale)
            || 'Must only contain letters',

    [ValidationMethod.ALPHANUMERIC]:
        (options: { locale: val.AlphanumericLocale }) => (str) => val.isAlphanumeric(str, options.locale)
            || 'Must only contain letters and numbers',

    [ValidationMethod.ASCII]:
        () => (str) => val.isAscii(str)
            || 'Must only contain ASCII characters',

    [ValidationMethod.BASE64]:
        () => (str) => val.isBase64(str)
            || 'Must be a valid base64 encoded string',

    [ValidationMethod.BEFORE]:
        (options: { date: string }) => (str) => val.isBefore(str, options.date)
            || `Must be a date before ${new Date(options.date).toLocaleDateString()}`,

    [ValidationMethod.BOOLEAN]:
        () => (str) => val.isBoolean(str)
            || 'Must be a boolean',

    [ValidationMethod.CREDIT_CARD]:
        () => (str) => val.isCreditCard(str)
            || 'Must be a valid credit card number',

    [ValidationMethod.CURRENCY]:
        (options) => (str) => val.isCurrency(str, options)
            || 'Must be a valid currency amount',

    [ValidationMethod.DATA_URI]:
        () => (str) => val.isDataURI(str)
            || 'Must be a valid data URI',

    [ValidationMethod.DECIMAL]:
        (options) => (str) => val.isDecimal(str, options)
            || 'Must be a decimal number',

    [ValidationMethod.DIVISIBLE_BY]:
        (options: { number: number }) => (str) => val.isDivisibleBy(str, options.number)
            || `Must be a number that's divisible by ${options.number}`,

    [ValidationMethod.EMAIL]:
        (options) => (str) => val.isEmail(str, options)
            || 'Must be a valid email address',

    [ValidationMethod.NOT_EMPTY]:
        (options) => (str) => !val.isEmpty(str, options)
            || 'Must not be empty',

    [ValidationMethod.ETHEREUM_ADDRESS]:
        () => (str) => val.isEthereumAddress(str)
            || 'Must be a valid Ethereum address',

    [ValidationMethod.FQDN]:
        (options) => (str) => val.isFQDN(str, options)
            || 'Must be a valid fully qualified domain name',

    [ValidationMethod.FLOAT]:
        (options) => (str) => val.isFloat(str, options)
            || 'Must be a float number',

    [ValidationMethod.FULL_WIDTH]:
        () => (str) => val.isFullWidth(str)
            || 'Must contain full-width characters',

    [ValidationMethod.HALF_WIDTH]:
        () => (str) => val.isHalfWidth(str)
            || 'Must contain half-width characters',

    [ValidationMethod.HEX_COLOR]:
        () => (str) => val.isHexColor(str)
            || 'Must be a valid hex color code',

    [ValidationMethod.HEXADECIMAL]:
        () => (str) => val.isHexadecimal(str)
            || 'Must be a valid hexadecimal number',

    [ValidationMethod.IP]:
        (options: { version: val.IPVersion }) => (str) => val.isIP(str, options.version)
            || `Must be a valid ${options.version} IP address`,

    [ValidationMethod.IP_RANGE]:
        () => (str) => val.isIPRange(str)
            || 'Must be a valid IP range',

    [ValidationMethod.ISBN]:
        (options: { version: val.ISBNVersion }) => (str) => val.isISBN(str, options.version)
            || `Must be a valid ISBN ${options.version}`,

    [ValidationMethod.ISIN]:
        () => (str) => val.isISIN(str)
            || 'Must be a valid ISIN (International Securities Identification Number)',

    [ValidationMethod.ISO8601]:
        (options) => (str) => val.isISO8601(str, options)
            || 'Must be a valid ISO8601 date string',

    [ValidationMethod.ISO31661_ALPHA2]:
        () => (str) => val.isISO31661Alpha2(str)
            || 'Must be a valid ISO 3166-1 alpha-2 country code',

    [ValidationMethod.ISO31661_ALPHA3]:
        () => (str) => val.isISO31661Alpha3(str)
            || 'Must be a valid ISO 3166-1 alpha-3 country code',

    [ValidationMethod.ISRC]:
        () => (str) => val.isISRC(str)
            || 'Must be a valid International Standard Recording Code (ISRC)',

    [ValidationMethod.ISSN]:
        (options) => (str) => val.isISSN(str, options)
            || 'Must be a valid International Standard Serial Number (ISSN)',

    [ValidationMethod.JSON]:
        () => (str) => val.isJSON(str)
            || 'Must be a valid JSON string',

    [ValidationMethod.JWT]:
        () => (str) => val.isJWT(str)
            || 'Must be a valid JSON Web Token (JWT)',

    [ValidationMethod.LAT_LONG]:
        () => (str) => val.isLatLong(str)
            || 'Must be a valid latitude coordinate',

    [ValidationMethod.LENGTH]:
        (options) => (str) => val.isLength(str, options)
            || 'Must have a length within the specified range',

    [ValidationMethod.LOWERCASE]:
        () => (str) => val.isLowercase(str)
            || 'Must be all lowercase',

    [ValidationMethod.MAC_ADDRESS]:
        () => (str) => val.isMACAddress(str)
            || 'Must be a valid MAC address',

    [ValidationMethod.MIME_TYPE]:
        () => (str) => val.isMimeType(str)
            || 'Must be a valid MIME type',

    [ValidationMethod.MONGO_ID]:
        () => (str) => val.isMongoId(str)
            || 'Must be a valid MongoDB ObjectId',

    [ValidationMethod.MULTIBYTE]:
        () => (str) => val.isMultibyte(str)
            || 'Must contain one or more multibyte characters',

    [ValidationMethod.NUMBER]:
        (options) => (str) => val.isNumeric(str, options)
            || 'Must be a number',

    [ValidationMethod.PORT]:
        () => (str) => val.isPort(str)
            || 'Must be a valid port number',

    [ValidationMethod.POSTAL_CODE]:
        (options: { locale: val.PostalCodeLocale }) => (str) => val.isPostalCode(str, options.locale)
            || 'Must be a valid postal code',

    [ValidationMethod.URL]:
        (options) => (str) => val.isURL(str, options)
            || 'Must be a valid URL',

    [ValidationMethod.UUID]:
        (options: { version: val.UUIDVersion }) => (str) => val.isUUID(str, options.version)
            || 'Must be a valid UUID',

    [ValidationMethod.VARIABLE_WIDTH]:
        () => (str) => val.isVariableWidth(str)
            || 'Must contain a mixture of full and half-width characters',

    [ValidationMethod.WHITELISTED]:
        (options: { chars: string | string[] }) => (str) => val.isWhitelisted(str, options.chars)
            || `Must only contain characters from the whitelist: ${options.chars}`,

    [ValidationMethod.SURROGATE_PAIR]:
        () => (str) => val.isSurrogatePair(str)
            || 'Must contain any surrogate pairs characters',

    [ValidationMethod.UPPERCASE]:
        () => (str) => val.isUppercase(str)
            || 'Must only contain uppercase characters',

} as Validators
