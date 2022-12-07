import * as path from 'path';
import * as fs from 'fs';

const packageConfigPath = path.resolve('./package.json');
const packageConfigStr = packageConfigPath
  ? fs.readFileSync(packageConfigPath, 'utf8')
  : null;
const packageConfig = packageConfigStr ? JSON.parse(packageConfigStr) : null;

export function getPackageVersion(): string {
  return packageConfig ? packageConfig.version : '';
}
