const fs = require('node:fs')
const path = require('node:path')
const yaml = require('yaml')

const toolList = eval(fs.readFileSync('./page/meta_model/tools.js').toString().split('=').pop())
const countries = eval(fs.readFileSync('./page/meta_model/countries.js').toString().split('=').pop())
const languages = eval(fs.readFileSync('./page/meta_model/languages.js').toString().split('=').pop())
const licenses = eval(fs.readFileSync('./page/meta_model/licenses.js').toString().split('=').pop())
const solverApproaches = eval(fs.readFileSync('./page/meta_model/solverApproaches.js').toString().split('=').pop())
const toolTypes = eval(fs.readFileSync('./page/meta_model/toolTypes.js').toString().split('=').pop())
const venues = eval(fs.readFileSync('./page/meta_model/venues.js').toString().split('=').pop())
const approaches = eval(fs.readFileSync('./page/meta_model/argumentationApproaches.js').toString().split('=').pop())
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

const isHttpUrl = string => {
    /**
     * Checks if string is valid HTTP URL
     */
  let url  
  try {
    const url = new URL(string)
  } catch (_) {
    return false
  }
  return true
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
        expect([...licenses, 'NA']).toContain(license)
    })
})

test('Any entry of "Implementation Language(s)" should be in the list of languages', () => {
    testFiles(data => {
        let toolLanguages = yaml.parse(data)['Implementation Language(s)']
        if (toolLanguages !== 'NA') {
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

test('Any entry of "Found in" should be in the list of venues/channel', () => {
    testFiles(data => {
        const venue = yaml.parse(data)['Found in']
        expect(venues).toContain(venue)
    })
})

test('Any entry of "Tests?" should be either "Yes" or "NA"', () => {
    testFiles(data => {
        const tests = yaml.parse(data)['Tests?']
        expect(['Yes', 'NA']).toContain(tests)
    })
})

test('Any entry of "Continuous Integration" should be either "Yes" or "NA"', () => {
    testFiles(data => {
        const ci = yaml.parse(data)['Continuous Integration']
        expect(['Yes', 'NA']).toContain(ci)
    })
})

test('If "Continuous Integration" is "Yes" then "Tests?" should be "Yes", too.', () => {
    testFiles(data => {
        if (yaml.parse(data)['Continuous Integration'] === 'Yes') {
            const tests = yaml.parse(data)['Tests?']
            expect(tests).toEqual("Yes")
         }
    })
})

test('Year of update should be parse-able as a number between 2000 and the current year', () => {
    testFiles(data => {
        const year = parseInt(yaml.parse(data)['Year of Update'])
        expect(year).toBeLessThanOrEqual(new Date().getFullYear())
    })
})

test('Date of update should, if available, be parse-able as a date between 01.01.2000 and the current date', () => {
    testFiles(data => {
        if (yaml.parse(data)['Last Update'] !== 'NA') {
            const date = Date.parse(yaml.parse(data)['Last Update'])
            expect(Number(date)).toBeLessThanOrEqual(Number(new Date()))
        }
    })
})

test('Date of update and year of update should be consistent', () => {
    testFiles(data => {
         if (yaml.parse(data)['Last Update'] !== 'NA') {
            const year = parseInt(yaml.parse(data)['Year of Update'])
            const date = new Date(Date.parse(yaml.parse(data)['Last Update']))
            expect(date.getFullYear()).toEqual(year)
         }
    })
})

test('Bug tracker should be "NA" or valid HTTP url', () => {
    testFiles(data => {
        const bugTracker = yaml.parse(data)['Bug Tracker']
        if (bugTracker !== 'NA') {
            expect(isHttpUrl(bugTracker)).toBe(true)
        }
    })
})

test('Every tool should have a name', () => {
    testFiles(data => {
        const name = yaml.parse(data).Name
        expect(typeof name).toEqual('string')
    })
})

test('Any entry of "Argumentation Approach" should be a sublist of the list of argumentation approaches', () => {
    testFiles(data => {
        let argumentationApproaches = yaml.parse(data)['Argumentation Approach']
        if (argumentationApproaches !=='NA') {
            argumentationApproaches = Array.isArray(argumentationApproaches) ? argumentationApproaches : [argumentationApproaches]
            argumentationApproaches.forEach(approach => expect(approaches).toContain(approach))
        }
    })
})

test('Any entry of "Solver Approach" should be in the list of solver approaches', () => {
     testFiles(data => {
        const solverApproach = yaml.parse(data)['Solver Approach']
        expect([...solverApproaches , 'NA']).toContain(solverApproach)
    })
})

