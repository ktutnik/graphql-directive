import { createCoverageMap } from 'istanbul-lib-coverage';
import { readFileSync, writeFileSync } from 'fs';
import {globSync} from 'glob';
import path from 'path'
import mkdirp from 'mkdirp'

const coverageFilesPattern = 'packages/**/coverage-final.json';
const outputFile = 'coverage/coverage-final.json'

const coverageFiles = globSync(coverageFilesPattern);

const mergedCoverageMap = createCoverageMap({})

coverageFiles.forEach(file => {
  const coverage = JSON.parse(readFileSync(file, 'utf8'));
  mergedCoverageMap.merge(coverage)
});

const output = path.resolve(outputFile);
mkdirp.sync(path.dirname(output));

writeFileSync(output, JSON.stringify(mergedCoverageMap));

console.log('Coverage files merged successfully');
