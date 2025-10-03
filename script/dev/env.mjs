import { getPackageJSON } from '../common/index.mjs'

const pkgJSON = getPackageJSON()

export default {
    APP_VERSION: pkgJSON.version,
    ENV_NOW: 'dev',
}