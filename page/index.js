const YAML = jsyaml

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
    Promise.all(
        tools.map(
            tool => fetch(`../tools/${tool}.yaml`)
        )).then(
            responses =>
            Promise.all(responses.map(res => res.text()))
        ).then(yTools => {
            const jTools = yTools.map(yTool => {
                console.log(Object.values(YAML.load(yTool)).length)
                return Object.values(YAML.load(yTool))
            }
            )
            showData(jTools)
        })
})

