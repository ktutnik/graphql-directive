import {Config} from "jest"

const config:Config = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  moduleNameMapper: {
    "@graphql-directive/(.*)": "<rootDir>/../$1/src"
  }
}

export default config