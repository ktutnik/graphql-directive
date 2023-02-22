import validator from "validator"

export const array = (arr:any[], min?:number, max?:number) => {
    if(!arr) return true
    if(min && arr.length < min) return `Must have at least ${min} items` 
    if(max && arr.length > max) return `Must have less than ${max} items`
    return true
}

export const email = (str:string) => validator.isEmail(str) || "Must a valid email address"


