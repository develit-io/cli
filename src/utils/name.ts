export const transformNameToClassName = (name: string):string => {
    return name.split('-').map((split) => split.replace(split[0], split[0].toUpperCase())).join('')
}