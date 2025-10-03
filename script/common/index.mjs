import path from 'node:path'
import { readFileSync } from 'node:fs'

export function getPackageJSON() {
    const content = readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8')
    try {
        const json = JSON.parse(content)
        return json
    } catch (error) {        
        console.warn('package.json 读取失败')
        console.warn(error)
        return {}
    }
}