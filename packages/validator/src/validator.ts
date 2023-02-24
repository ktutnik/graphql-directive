import val from "validator"
import { ValidationMethod, Validator } from "./core"

type Validators = { [key: string]: (config: any) => Validator }

export default {
    [ValidationMethod.EMAIL]: () => (str: string) => val.isEmail(str) || "Must a valid email address",
    [ValidationMethod.ARRAY]: ({ min, max }: { min?: number, max?: number }) => (arr: any[]) => {
        if (!arr) return true
        if (min && arr.length < min) return `Must have at least ${min} items`
        if (max && arr.length > max) return `Must have less than ${max} items`
        return true
    }
} as Validators
