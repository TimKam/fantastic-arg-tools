const fs = require('node:fs')
const path = require('node:path')
const yaml = require('yaml')

const toolList = eval(fs.readFileSync('./page/tools.js').toString().split('=').pop())
const countries = eval(fs.readFileSync('./page/countries.js').toString().split('=').pop())
const toolsFolder = './tools'


const testFiles = condition => {
    fs.readdirSync(toolsFolder).forEach(file => {
        const filePath = path.join(toolsFolder, file)
        fs.readFile(filePath, 'utf8', (error, data) => {
            if(error) console.error(error)
            try {
                condition(data, file)
            } catch(error) {
                console.error(file)
                console.error(data)
                throw error
            }
          })
    })
}

test('Any entry of "Region" should be in the list of countries', () => {
    testFiles(data => {
        const region = yaml.parse(data).Region
        expect(countries).toContain(region)
    })
})

test('Any file in the tools folder should be in the tool list', () => {
    testFiles((_, file) => {
        expect(toolList).toContain(path.parse(file).name)
    })
})

test('Any tool in the tool list should be in the tools folder', () => {
    const toolsFolderList = fs.readdirSync(toolsFolder).map(file => path.parse(file).name)
    toolList.forEach(tool => {
        expect(toolsFolderList).toContain(tool)
    })
})
