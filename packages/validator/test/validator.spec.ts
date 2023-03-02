import { ValidationMethod } from "../src/core"

import val from "../src/validator"


describe("Validator", () => {


    it("Should validate date properly", () => {
        const validate = val[ValidationMethod.AFTER]({ date: "2003-1-1" })

        expect(validate("2004-1-1")).toBe(true);
        expect(validate("2001-1-1")).toMatchSnapshot();
    });

    it("Should validate alphabetic string properly", () => {
        const validate = val[ValidationMethod.ALPHA]({})

        expect(validate("abc")).toBe(true);
        expect(validate("123")).toMatchSnapshot()
    });

    it("Should validate alphanumeric string properly", () => {
        const validate = val[ValidationMethod.ALPHANUMERIC]({})

        expect(validate("abc123")).toBe(true);
        expect(validate("abc!@#")).toMatchSnapshot()
    });

    it("Should validate ASCII string properly", () => {
        const validate = val[ValidationMethod.ASCII]({})

        expect(validate("Hello world")).toBe(true);
        expect(validate("你好世界")).toMatchSnapshot()
    });

    it("Should validate base64 string properly", () => {
        const validate = val[ValidationMethod.BASE64]({})

        expect(validate("SGVsbG8gV29ybGQh")).toBe(true);
        expect(validate("Not a base64 string!")).toMatchSnapshot()
    });

    it("Should validate date before properly", () => {
        const validate = val[ValidationMethod.BEFORE]({ date: "2023-01-01" })

        expect(validate("2022-12-31")).toBe(true);
        expect(validate("2023-01-01")).toMatchSnapshot()
    });

    it("Should validate boolean properly", () => {
        const validate = val[ValidationMethod.BOOLEAN]({})

        expect(validate("true")).toBe(true);
        expect(validate("false")).toBe(true);
        expect(validate("notaboolean")).toMatchSnapshot()
    });

    it("Should validate credit card properly", () => {
        const validate = val[ValidationMethod.CREDIT_CARD]({})

        expect(validate("4111111111111111")).toBe(true);
        expect(validate("notacreditcardnumber")).toMatchSnapshot()
    });

    it("Should validate currency properly", () => {
        const validate = val[ValidationMethod.CURRENCY]({})

        expect(validate("$1.00")).toBe(true);
        expect(validate("notacurrency")).toMatchSnapshot()
    });

    it("Should validate data URI properly", () => {
        const validate = val[ValidationMethod.DATA_URI]({})

        expect(validate("data:image/png;base64,iVBORw")).toBe(true);
        expect(validate("notadataURI")).toMatchSnapshot()
    });

    it("Should validate decimal properly", () => {
        const validate = val[ValidationMethod.DECIMAL]({})

        expect(validate("1234.5678")).toBe(true);
        expect(validate("1,234")).toMatchSnapshot()
    });

    it("Should validate divisible properly", () => {
        const validate = val[ValidationMethod.DIVISIBLE_BY]({ number: 3 })

        expect(validate("9")).toBe(true);
        expect(validate("10")).toMatchSnapshot()
    });

    it("Should validate email properly", () => {
        const validate = val[ValidationMethod.EMAIL]({})

        expect(validate("test@example.com")).toBe(true);
        expect(validate("notanemail")).toMatchSnapshot()
    });

    it("Should validate empty properly", () => {
        const validate = val[ValidationMethod.EMPTY]({})

        expect(validate("")).toBe(true);
        expect(validate("hello")).toMatchSnapshot()
    });

    it("Should validate Ethereum address properly", () => {
        const validate = val[ValidationMethod.ETHEREUM_ADDRESS]({})

        expect(validate("0x742d35Cc6634C0532925a3b844Bc454e4438f44e")).toBe(true);
        expect(validate("notanethereumaddress")).toMatchSnapshot()
    });


    it("Should validate domain name properly", () => {
        const validate = val[ValidationMethod.FQDN]({})

        expect(validate("example.com")).toBe(true);
        expect(validate("example")).toMatchSnapshot()
    });

    it("Should validate float properly", () => {
        const validate = val[ValidationMethod.FLOAT]({})

        expect(validate("1.23")).toBe(true);
        expect(validate("invalidnumber")).toMatchSnapshot()
    });

    it("Should validate full-width string properly", () => {
        const validate = val[ValidationMethod.FULL_WIDTH]({})

        expect(validate("ＨＥＬＬＯ")).toBe(true);
        expect(validate("hello")).toMatchSnapshot()
    });

    it("Should validate half-width string properly", () => {
        const validate = val[ValidationMethod.HALF_WIDTH]({})

        expect(validate("hello")).toBe(true);
        expect(validate("ＨＥＬＬＯ")).toMatchSnapshot()
    });

    it("Should validate hexadecimal color code properly", () => {
        const validate = val[ValidationMethod.HEX_COLOR]({})

        expect(validate("#ff0000")).toBe(true);
        expect(validate("notacolorcode")).toMatchSnapshot()
    });

    it("Should validate hexadecimal properly", () => {
        const validate = val[ValidationMethod.HEXADECIMAL]({})

        expect(validate("deadbeef")).toBe(true);
        expect(validate("notahexadecimal")).toMatchSnapshot()
    });

    it("Should validate IP address properly", () => {
        const validate = val[ValidationMethod.IP]({ version: 4 })

        expect(validate("192.168.1.1")).toBe(true);
        expect(validate("notanipaddress")).toMatchSnapshot()
    });


    it("Should validate IP range properly", () => {
        const validate = val[ValidationMethod.IP_RANGE]({})

        expect(validate("192.168.0.1/24")).toBe(true);
        expect(validate("notaniprange")).toMatchSnapshot()
    });

    it("Should validate ISBN properly", () => {
        const validate = val[ValidationMethod.ISBN]({ version: 10 })

        expect(validate("3-8362-2119-5")).toBe(true);
        expect(validate("notanisbn")).toMatchSnapshot()
    });

    it("Should validate ISIN properly", () => {
        const validate = val[ValidationMethod.ISIN]({})

        expect(validate("US0378331005")).toBe(true);
        expect(validate("notanisin")).toMatchSnapshot()
    });

    it("Should validate ISO8601 date properly", () => {
        const validate = val[ValidationMethod.ISO8601]({})

        expect(validate("2022-03-02")).toBe(true);
        expect(validate("notaniso8601date")).toMatchSnapshot()
    });

    it("Should validate ISO 3166-1 alpha-2 code properly", () => {
        const validate = val[ValidationMethod.ISO31661_ALPHA2]({})

        expect(validate("US")).toBe(true);
        expect(validate("notaniso31661alpha2code")).toMatchSnapshot()
    });

    it("Should validate ISO 3166-1 alpha-3 code properly", () => {
        const validate = val[ValidationMethod.ISO31661_ALPHA3]({})

        expect(validate("USA")).toBe(true);
        expect(validate("notaniso31661alpha3code")).toMatchSnapshot()
    });

    it("Should validate ISRC properly", () => {
        const validate = val[ValidationMethod.ISRC]({})

        expect(validate("USRC17607839")).toBe(true);
        expect(validate("notanisrc")).toMatchSnapshot()
    });

    it("Should validate ISSN properly", () => {
        const validate = val[ValidationMethod.ISSN]({})

        expect(validate("0317-8471")).toBe(true);
        expect(validate("notanissn")).toMatchSnapshot()
    });

    it("Should validate JSON properly", () => {
        const validate = val[ValidationMethod.JSON]({})

        expect(validate('{"name":"John","age":30}')).toBe(true);
        expect(validate("notajsonstring")).toMatchSnapshot()
    });


    it("Should validate JWT properly", () => {
        const validate = val[ValidationMethod.JWT]({})

        expect(
            validate(
                "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
            )
        ).toBe(true);
        expect(validate("notajwt")).toMatchSnapshot()
    });

    it("Should validate latitude and longitude properly", () => {
        const validate = val[ValidationMethod.LAT_LONG]({})

        expect(validate("55.720923,-28.652344")).toBe(true);
        expect(validate("90.1000000, 180.000000")).toMatchSnapshot()
    });

    it("Should validate length properly", () => {
        const validate = val[ValidationMethod.LENGTH]({ min: 3, max: 5 })

        expect(validate("1234")).toBe(true);
        expect(validate("123456")).toMatchSnapshot()
    });

    it("Should validate lowercase properly", () => {
        const validate = val[ValidationMethod.LOWERCASE]({})

        expect(validate("hello")).toBe(true);
        expect(validate("Hello")).toMatchSnapshot()
    });

    it("Should validate MAC address properly", () => {
        const validate = val[ValidationMethod.MAC_ADDRESS]({})

        expect(validate("01:23:45:67:89:ab")).toBe(true);
        expect(validate("notamacaddress")).toMatchSnapshot()
    });

    it("Should validate MIME type properly", () => {
        const validate = val[ValidationMethod.MIME_TYPE]({})

        expect(validate("image/jpeg")).toBe(true);
        expect(validate("notamimetype")).toMatchSnapshot()
    });

    it("Should validate MongoDB ObjectId properly", () => {
        const validate = val[ValidationMethod.MONGO_ID]({})

        expect(validate("507f1f77bcf86cd799439011")).toBe(true);
        expect(validate("notamongodbobjectid")).toMatchSnapshot()
    });

    it("Should validate multibyte characters properly", () => {
        const validate = val[ValidationMethod.MULTIBYTE]({})

        expect(validate("こんにちは")).toBe(true);
        expect(validate("hello")).toMatchSnapshot()
    });

    it("Should validate numeric characters properly", () => {
        const validate = val[ValidationMethod.NUMBER]({})

        expect(validate("1234")).toBe(true);
        expect(validate("notanumber")).toMatchSnapshot()
    });

    it("Should validate port number properly", () => {
        const validate = val[ValidationMethod.PORT]({})

        expect(validate("3000")).toBe(true);
        expect(validate("notaport")).toMatchSnapshot()
    });

    it("Should validate postal code properly", () => {
        const validate = val[ValidationMethod.POSTAL_CODE]({ locale: "US" })

        expect(validate("94043")).toBe(true);
        expect(validate("notapostalcode")).toMatchSnapshot()
    });

    it("Should validate URL properly", () => {
        const validate = val[ValidationMethod.URL]({})

        expect(validate("https://example.com")).toBe(true);
        expect(validate("notanurl")).toMatchSnapshot()
    });

    it("Should validate UUID properly", () => {
        const validate = val[ValidationMethod.UUID]({ version: "all" })

        expect(validate("f7eb504d-b7e3-4e3f-a87d-1d93b98df94d")).toBe(true);
        expect(validate("notauuid")).toMatchSnapshot()
    });


    it('should validate variable width characters', () => {
        const validate = val[ValidationMethod.VARIABLE_WIDTH]({})

        expect(validate('ひらがなカタカナ漢字ABCDE')).toBe(true);
        expect(validate('12345')).toMatchSnapshot()
        expect(validate('abcde')).toMatchSnapshot()
    });

    it('should validate whitelisted characters', () => {
        const validate = val[ValidationMethod.WHITELISTED]({ chars: 'abcdefghijklmnopqrstuvwxyz' })

        expect(validate('abcdefghijklmnopqrstuvwxyz')).toBe(true);
        expect(validate('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toMatchSnapshot()
        expect(validate('0123456789')).toMatchSnapshot()
        expect(validate('aBc123')).toMatchSnapshot()
        expect(validate('')).toBe(true);
    });

    it('should validate surrogate pairs', () => {
        const validate = val[ValidationMethod.SURROGATE_PAIR]({})
        expect(validate('\uD83D\uDC68\uD83C\uDFFB')).toBe(true);
        expect(validate('')).toMatchSnapshot()
    });

    it('should validate uppercase characters', () => {
        const validate = val[ValidationMethod.UPPERCASE]({})
        expect(validate('ABCDEFGHIJKLMNOPQRSTUVWXYZ')).toBe(true);
        expect(validate('abcdefghijklmnopqrstuvwxyz')).toMatchSnapshot()
        expect(validate('aBcDeF')).toMatchSnapshot()
    });


})


