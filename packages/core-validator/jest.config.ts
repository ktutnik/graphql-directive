import {Config} from "jest"

const config:Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: ["src/*"],
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  moduleNameMapper: {
    "@graphql-directive/(.*)": "<rootDir>/../$1/src"
  }
}

export default config