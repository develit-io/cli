import * as fs from "fs"
import * as p from '@clack/prompts'

export const checkTargetDirectory = async (targetDir: string) => {
    const shouldVerify = fs.existsSync(targetDir)

    if (!shouldVerify)
        return true

    return await p.confirm({
        message: `The directory ${targetDir} already exists. Override its content ?`,
    })
}