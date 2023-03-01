import val from "validator"
import { ValidationMethod, NativeValidator } from "./core"

type Validators = {
    [key: string]:
    (config: any) => NativeValidator

}

export default {
    [ValidationMethod.AFTER]:
        (options: { date: string }) => (str) => val.isAfter(str, options.date)
            || `Must be a date after ${options.date}`,

    [ValidationMethod.ALPHA]:
        (options: { locale: val.AlphaLocale }) => (str) => val.isAlpha(str, options.locale)
            || 'Must only contain letters',

    [ValidationMethod.ALPHANUMERIC]:
        (locale) => (str) => val.isAlphanumeric(str, locale)
            || 'Must only contain letters and numbers',

    [ValidationMethod.ASCII]:
        () => (str) => val.isAscii(str)
            || 'Must only contain ASCII characters',

    [ValidationMethod.BASE64]:
        () => (str) => val.isBase64(str)
            || 'Must be a valid base64 encoded string',

    [ValidationMethod.BEFORE]:
        (options: { date: string }) => (str) => val.isBefore(str, options.date)
            || `Must be a date before ${options.date}`,

    [ValidationMethod.BOOLEAN]:
        () => (str) => val.isBoolean(str)
            || 'Must be a boolean',

    [ValidationMethod.BYTE_LENGTH]:
        (options: { min?: number, max?: number }) => (str) => val.isByteLength(str, options)
            || 'Must have a length (in bytes) within the specified range',

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
        (number) => (str) => val.isDivisibleBy(str, number)
            || `Must be a number that's divisible by ${number}`,

    [ValidationMethod.EMAIL]:
        (options) => (str) => val.isEmail(str, options)
            || 'Must be a valid email address',

    [ValidationMethod.EMPTY]:
        (options) => (str) => val.isEmpty(str, options)
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

    [ValidationMethod.HEX_DECIMAL]:
        () => (str) => val.isHexadecimal(str)
            || 'Must be a valid hexadecimal number',

    [ValidationMethod.IP]:
        (version) => (str) => val.isIP(str, version)
            || `Must be a valid ${version} IP address`,

    [ValidationMethod.IP_RANGE]:
        () => (str) => val.isIPRange(str)
            || 'Must be a valid IP range',

    [ValidationMethod.ISBN]:
        (version) => (str) => val.isISBN(str, version)
            || `Must be a valid ISBN ${version}`,

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
        (locale) => (str) => val.isPostalCode(str, locale)
            || 'Must be a valid postal code',

    [ValidationMethod.URL]:
        (options) => (str) => val.isURL(str, options)
            || 'Must be a valid URL',

    [ValidationMethod.UUID]:
        (version) => (str) => val.isUUID(str, version)
            || 'Must be a valid UUID',

    [ValidationMethod.VARIABLE_WIDTH]:
        () => (str) => val.isVariableWidth(str)
            || 'Must contain a mixture of full and half-width characters',

    [ValidationMethod.WHITELISTED]:
        (chars) => (str) => val.isWhitelisted(str, chars)
            || `Must only contain characters from the whitelist: ${chars}`,

    [ValidationMethod.SURROGATE_PAIR]:
        () => (str) => val.isSurrogatePair(str)
            || 'Must contain any surrogate pairs characters',

    [ValidationMethod.UPPERCASE]:
        () => (str) => val.isUppercase(str)
            || 'Must only contain uppercase characters',

    [ValidationMethod.ARRAY]:
        ({ min, max }: { min?: number, max?: number }) => (arr: any[]) => {

            if (!arr) return true
            if (min && arr.length < min) return `Must have at least ${min} items`
            if (max && arr.length > max) return `Must have less than ${max} items`
            return true
        }
} as Validators
