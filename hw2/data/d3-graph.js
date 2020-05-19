var margin = { top: 20, right: 20, bottom: 30, left: 50 }
var width = 960 - margin.left - margin.right
var height = 500 - margin.left - margin.right
class AgeUsage {
    constructor(age, usages) {
        this.age = age;
        this.usages = usages;
    }
}

agg_age_cnt("https://raw.githubusercontent.com/hi-space/data-visualization/master/hw2/data/bicycle_2019.csv")

var dropdownChange = function() {
    v = d3.select(this).property("value")

    console.log(v)

    url = ""
    if (v == "2017")
        url = "https://raw.githubusercontent.com/hi-space/data-visualization/master/hw2/data/bicycle_2017.csv"
    else if (v == "2018")
        url = "https://raw.githubusercontent.com/hi-space/data-visualization/master/hw2/data/bicycle_2018_1.csv"
    else if (v == "2019")
        url = "https://raw.githubusercontent.com/hi-space/data-visualization/master/hw2/data/bicycle_2019.csv"

    agg_age_cnt(url)
}

var dropdown = d3.select("#age-usages-chart")
                .insert("select", "svg")
                .on("change", dropdownChange)

dropdown.selectAll("option")
        .data(["2019", "2018", "2017"])
        .enter().append("option")
        .attr("value", function(d) { return d;} )
        .text(function(d) {
            return d
        })

function agg_age_cnt(filepath) {
    var data_list = new Array();                   

    var x = d3.scaleLinear().rangeRound([0, width])
    var y = d3.scaleLinear().range([height, 0])
            
    var line = d3.line()
                .x(function (d) { return x(d.age); })
                .y(function (d) { return y(d.usages); })
                .curve(d3.curveMonotoneX)
    
    d3.select("svg").remove();                
    var svg = d3.select("#age-usages-chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")") 

    d3.csv(filepath).then(function (data) {
        for (var idx = 0; idx < data.length; idx++) {
            data_list.push(data[idx])
        }

        console.log(data_list)
        var age_usages = {}
        data_list.forEach(function (data) {
            n = data.age.replace(/[^0-9]/g, '');
            age_usages[n] = (n in age_usages) ? (age_usages[n] += Number(data.usage)) : 0;
        });

        var datasets = []
        datasets.push(new AgeUsage(0, 0));
        for (var age_usage in age_usages) {
            item = new AgeUsage();
            if (age_usage != "" && age_usage != 8) {
                datasets.push(new AgeUsage(age_usage * 10, age_usages[age_usage]));
            }
        }

        datasets.sort(function(a, b) {
            return a.age < b.age ? -1 : a.age > b.age ? 1 : 0;
        })
        
        console.log(datasets)
  
        x.domain(d3.extent(datasets, function(d) { return d.age }))
        y.domain([0, d3.max(datasets, function(d) { return d.usages })])
         
        svg.selectAll(".bar")
            .data(datasets)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function(d) { return x(d.age) - 20 })
            .attr("y", function(d) { return y(d.usages) })
            .attr("width", 40)
            .attr("height", function(d) { return height - y(d.usages); })

        svg.append("path")
            .datum(datasets)
            .attr("class", "line")
            .attr("d", line);
        
        svg.selectAll(".dot")
            .data(datasets)
            .enter()
            .append("circle")
            .attr("class", "dot")
            .attr("cx", function(d) { return x(d.age) })
            .attr("cy", function(d) { return y(d.usages) })
            .attr("r", 5)


        svg.selectAll(".text")
            .data(datasets)
            .enter()
            .append("text")
            .attr("class", "label")
            .attr("x", function(d) { return x(d.age) })
            .attr("y", function(d) { return y(d.usages) })
            .attr("dx", "-30")
            .attr("dy", "-5")
            .text(function(d) { return d.usages })
        
        svg.append("g")
            .attr("transform", "translate(0, " + height + ")")
            .call(d3.axisBottom(x));
        
        svg.append("g")
            .call(d3.axisLeft(y))
        
    })
}

