const YAML = jsyaml

function showDiv(id) {
    Array.from(document.getElementsByClassName('content')).forEach(element => {
        element.style.visibility = 'hidden'
        element.style.display = 'none'
    })
    document.getElementById(id).style.visibility = 'visible'
    document.getElementById(id).style.display = 'block' 
}

function showData(dataArray){
    const table = $('#data-table').DataTable({
        data: dataArray,
        fixedHeader: true,
        pageLength : 100,
        //CHANGE THE TABLE HEADINGS BELOW TO MATCH WITH YOUR SELECTED DATA RANGE
        columns: [
            {"title":"Name"},
            {"title":"Description"},
            {"title":"Found in"},
            {"title":"Documentation"},
            {"title":"Implementation Language(s)"},
            {"title":"Type of Tool"},
            {"title":"Tests?"},
            {"title":"Source Code"},
            {"title":"License"},
            {"title":"Last Update"},
            {"title":"Year of Update"},
            {"title":"Logic Solver Approach"},
            {"title":"Region"},
            {"title":"Bibtex Entry", "className": "bibtex"},
            {"title":"Argumentation Approach"},
            {"title":"URL",
            render: function (data) {
                if(data === 'NA') return data
                return '<a href="'+data+'" target="_blank">'+data+'</a>';
            }},
            //{"title":"Maintainers"},
            {"title":"Bug Tracker"},
            {"title":"Application"},
            {"title":"Dependencies"},
            {"title":"Continuous Integration"},
            {"title":"Empirical (Runtime) Evaluation"},
            {"title":"Benchmarks"}
            //{"title":"Primary Paper or Technical Report"}
            //{"title":"Secondary Paper(s)"},
            //{"title":"Comments"}
        ]
    })
}
$(document).ready(function(){
    document.getElementById('analysis').style.visibility = 'hidden'
    document.getElementById('analysis').style.display = 'none' 
    Promise.all(
        tools.map(
            tool => fetch(`../tools/${tool}.yaml`)
        )).then(
            responses =>
            Promise.all(responses.map(res => res.text()))
        ).then(yTools => {
            const jTools = yTools.map(yTool => {
                return Object.values(YAML.load(yTool))
            })
            renderCharts(yTools.map(yTool => YAML.load(yTool)))
            showData(jTools)
        })
})

const UMU_BLUE = '#2a4765'
const UMU_GRAY = '#c8c8c8'
const INK_MUTED = '#5c5c5c'
const GRID = '#eaeaea'

function renderCharts(toolData){
    Chart.defaults.font.family = '"HCo Gotham SSm", "Montserrat", Verdana, sans-serif'
    Chart.defaults.color = INK_MUTED

    /* COUNTRIES */
    barChart('countries', topN(aggregateValues(toolData, 'Region'), 10))

    /* DOCUMENTATION */
    const documentations = aggregateDocumentationData(toolData, 'Documentation')
    new Chart(document.getElementById('documentation'), {
        type: 'doughnut',
        plugins: [ChartDataLabels],
        data: {
            labels: ['Available', 'Not available'],
            datasets: [{
            label: '# Tools',
            data: Object.values(documentations),
            backgroundColor: [UMU_BLUE, UMU_GRAY],
            borderColor: '#fff',
            borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '55%',
            plugins: {
                legend: { position: 'bottom' },
                datalabels: { color: ['#fff', '#262626'], font: { size: 13, weight: 500 } }
            }
        },
    })

    /* LICENSE */
    barChart('license', topN(aggregateValues(toolData, 'License'), 10))

    /* TYPE OF TOOL */
    barChart('toolTypes', sortDesc(aggregateValues(toolData, 'Type of Tool')))

    /* IMPLEMENTATION LANGUAGE */
    barChart('languages', topN(aggregateValues(toolData, 'Implementation Language(s)'), 10))

    /* ARGUMENTATION APPROACH */
    barChart('argumentationApproaches', topN(aggregateValues(toolData, 'Argumentation Approach'), 8))

    /* SOLVER APPROACH */
    barChart('solverApproaches', topN(aggregateValues(toolData, 'Solver Approach'), 8))

    /* YEAR OF LAST UPDATE */
    barChart('years', aggregateYears(toolData, 'Year of Update'), { horizontal: false })

    /* SOFTWARE ENGINEERING PRACTICES */
    const practices = {
        'Source code': 'Source Code',
        'Documentation': 'Documentation',
        'Tests': 'Tests?',
        'Bug tracker': 'Bug Tracker',
        'Continuous integration': 'Continuous Integration',
        'Benchmarks': 'Benchmarks',
        'Runtime evaluation': 'Empirical (Runtime) Evaluation'
    }
    const shares = { }
    Object.entries(practices).forEach(([label, id]) => {
        const count = toolData.filter(tool => isAvailable(tool[id])).length
        shares[label] = Math.round(100 * count / toolData.length)
    })
    barChart('practices', sortDesc(shares), { percent: true })
}

function barChart(id, aggregate, { horizontal = true, percent = false } = { }) {
    const valueAxis = horizontal ? 'x' : 'y'
    const categoryAxis = horizontal ? 'y' : 'x'
    const format = value => percent ? value + '%' : value
    return new Chart(document.getElementById(id), {
        type: 'bar',
        plugins: [ChartDataLabels],
        data: {
            labels: Object.keys(aggregate),
            datasets: [{
            label: percent ? '% of tools' : '# Tools',
            data: Object.values(aggregate),
            backgroundColor: UMU_BLUE,
            borderRadius: 4,
            borderSkipped: 'start',
            maxBarThickness: 18
            }]
        },
        options: {
            indexAxis: categoryAxis,
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: horizontal ? { left: 6, right: 28 } : { top: 18 } },
            scales: {
                [valueAxis]: {
                    beginAtZero: true,
                    max: percent ? 100 : undefined,
                    grid: { color: GRID },
                    border: { display: false },
                    ticks: { precision: 0, callback: format }
                },
                [categoryAxis]: {
                    grid: { display: false },
                    ticks: horizontal
                        ? { autoSkip: false, font: { size: 11 }, callback: function (value) { return wrapLabel(this.getLabelForValue(value)) } }
                        : { autoSkip: true, maxRotation: 0 }
                }
            },
            plugins: {
                legend: { display: false },
                tooltip: { callbacks: { label: ctx => format(ctx.raw) + (percent ? ' of tools' : ' tools') } },
                datalabels: {
                    anchor: 'end',
                    align: 'end',
                    offset: 2,
                    color: INK_MUTED,
                    font: { size: 11 },
                    formatter: value => value ? format(value) : ''
                }
            }
        },
    })
}

/* Splits long axis labels into lines of roughly maxLength characters */
function wrapLabel(label, maxLength = 22) {
    const lines = []
    String(label).split(' ').forEach(word => {
        const last = lines[lines.length - 1]
        if (last && (last + ' ' + word).length <= maxLength) lines[lines.length - 1] = last + ' ' + word
        else lines.push(word)
    })
    return lines
}

/* Counts tools per value; tools with several values (YAML lists) count once per value */
function aggregateValues(toolData, id) {
    const aggregate = { }
    toolData.forEach(tool => {
        const raw = tool[id]
        const values = Array.isArray(raw) ? raw : [raw]
        new Set(values.map(value => normalizeValue(value))).forEach(value => {
            aggregate[value] = (aggregate[value] || 0) + 1
        })
    })
    return aggregate
}

function normalizeValue(value) {
    const text = value === undefined || value === null ? '' : String(value).trim()
    return text === '' ? 'NA' : text
}

function sortDesc(aggregate) {
    return Object.fromEntries(Object.entries(aggregate).sort((a, b) => b[1] - a[1]))
}

/* Keeps the n most frequent values and folds the rest into "Other" */
function topN(aggregate, n) {
    const entries = Object.entries(sortDesc(aggregate))
    if (entries.length <= n + 1) return Object.fromEntries(entries)
    const top = entries.slice(0, n)
    const other = entries.slice(n).reduce((sum, [, count]) => sum + count, 0)
    return Object.fromEntries([...top, ['Other', other]])
}

/* Counts per year, chronologically, including years without updates */
function aggregateYears(toolData, id) {
    const counts = aggregateValues(toolData, id)
    const years = Object.keys(counts).map(Number).filter(Number.isInteger)
    const aggregate = { }
    for (let year = Math.min(...years); year <= Math.max(...years); year++) {
        aggregate[year] = counts[year] || 0
    }
    if (counts['NA']) aggregate['NA'] = counts['NA']
    return aggregate
}

const isValidUrl = str => {
    try { new URL(str); return true; } catch { return false; }
};

function isAvailable(value) {
    return typeof value === "string" && (isValidUrl(value) || value.toLowerCase() === "yes")
}

function aggregateDocumentationData(toolData, id) {
    const YES = "Yes";
    const NO = "NA";
    const aggregate = { [YES]: 0, [NO]: 0 };

    toolData.forEach(tool => {
        if (isAvailable(tool[id])) aggregate[YES]++;
        else                       aggregate[NO]++;
    });

    return aggregate;
}
