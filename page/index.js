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
            render: function ( data, type, row) {
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

function renderCharts(toolData){
    const ctx = document.getElementById('countries');
    const countries = { }
    toolData.forEach(tool => {
       country = tool['Region']
       if(!countries[country]) {
        countries[country] = 1
       } else {
        countries[country] +=1
       }
    })
    console.log(countries)
    new Chart(ctx, {
    type: 'pie',
    data: {
        labels: Object.keys(countries),
        datasets: [{
        label: '# Tools by Country',
        data: Object.values(countries),
        borderWidth: 1
        }]
    }
    })
}


