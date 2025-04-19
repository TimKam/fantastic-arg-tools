const fs = require('node:fs')
const path = require('node:path')
const yaml = require('yaml')

const toolList = eval(fs.readFileSync('./page/meta_model/tools.js').toString().split('=').pop())
const countries = eval(fs.readFileSync('./page/meta_model/countries.js').toString().split('=').pop())
const languages = eval(fs.readFileSync('./page/meta_model/languages.js').toString().split('=').pop())
const licenses = eval(fs.readFileSync('./page/meta_model/licenses.js').toString().split('=').pop())
const toolTypes = eval(fs.readFileSync('./page/meta_model/toolTypes.js').toString().split('=').pop())
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

test('Any entry of "Region" should be in the list of countries', () => {
    testFiles(data => {
        const region = yaml.parse(data).Region
        expect(countries).toContain(region)
    })
})

test('Any entry of "License" should be in the list of licenses', () => {
    testFiles(data => {
        const license = yaml.parse(data).License
        expect(licenses + ['NA']).toContain(license)
    })
})

test('Any entry of "Implementation Language(s)" should be in the list of languages', () => {
    testFiles(data => {
        let toolLanguages = yaml.parse(data)['Implementation Language(s)']
        if (toolLanguages !== "NA") {
            toolLanguages = Array.isArray(toolLanguages) ? toolLanguages : [toolLanguages]
            toolLanguages.forEach(language => expect(languages).toContain(language))
        }
    })
})

test('Any entry of "Type of Tool" should be in the list of tool types', () => {
    testFiles(data => {
        let types = yaml.parse(data)['Type of Tool']
        types = Array.isArray(types) ? types : [types]
        types.forEach(type => expect(toolTypes).toContain(type))
        if(types.includes['Utility']) expect(types.length).toEqual(1)
    })
})
