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

function renderCharts(toolData){
    /* COUNTRIES */
    const countryCtx = document.getElementById('countries');
    countries = aggregatePie(toolData, 'Region')
    new Chart(countryCtx, {
    type: 'bar',
    data: {
        labels: Object.keys(countries),
        datasets: [{
        label: '# Tools by Country',
        data: Object.values(countries),
        borderWidth: 1
        }]
    }
    })

    /* DOCUMENTATION */
    const documentationCtx = document.getElementById('documentation');
    documentations = aggregateDocumentationData(toolData, 'Documentation')
    new Chart(documentationCtx, {
    type: 'pie',
    data: {
        labels: Object.keys(documentations),
        datasets: [{
        label: '# Tools by Documentation Availability',
        data: Object.values(documentations),
        borderWidth: 1
        }]
    }
    })

    /* LICENSE */
    const licenseCtx = document.getElementById('license');
    licenses = aggregatePie(toolData, 'License')
    new Chart(licenseCtx, {
    type: 'bar',
    data: {
        labels: Object.keys(licenses),
        datasets: [{
        label: '# Tools by License',
        data: Object.values(licenses),
        borderWidth: 1
        }]
    }
    })

}

function aggregatePie(toolData, id) {
    const aggregate = { }
    toolData.forEach(tool => {
       value = tool[id]
       if(!aggregate[value]) {
        aggregate[value] = 1
       } else {
        aggregate[value] +=1
       }
    })
    return aggregate
}

function aggregateDocumentationData(toolData, id) {
    const YES = "Yes";
    const NO = "No";
    const aggregate = { [YES]: 0, [NO]: 0 };
    
    const isValidUrl = str => {
        try { new URL(str); return true; } catch { return false; }
    };
    
    toolData.forEach(tool => {
        const value = tool[id];
        if      (typeof value === "string" && isValidUrl(value))             aggregate[YES]++;
        else if (typeof value === "string" && value.toLowerCase() === "yes") aggregate[YES]++;
        else                                                                 aggregate[NO]++;
    });
    
    return aggregate;
}