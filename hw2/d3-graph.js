var margin = { top: 20, right: 20, bottom: 30, left: 50 }
var width = 960 - margin.left - margin.right
var height = 500 - margin.left - margin.right
const radius = Math.min(width, height) / 2;

class Usage {
    constructor(age, usages) {
        this.age = age;
        this.usages = usages;
    }
}

function arcTween(a) {
        const i = d3.interpolate(this._current, a);
        this._current = i(1);
        return (t) => arc(i(t));
}

function midAngle(d){
    return d.startAngle + (d.endAngle - d.startAngle)/2;
}

const color = d3.scaleOrdinal(["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f"]);
    
const pie = d3.pie()
            .value(d => d.usages)
            .sort(null);

const arc = d3.arc()
    .innerRadius(0)
    .outerRadius(radius);

const outerArc = d3.arc()
    .innerRadius(radius * 0.9)
    .outerRadius(radius * 0.9);

function rental_code(a) {
    if (a == "member")
        return "일일(회원)"
    else if (a == "non-member")
        return "일일(비회원)"
    else if (a == "group") 
        return "단체"
    else if (a == "season")
        return "정기"
    else
        return ""
}

make_grpah()
agg_age_cnt("https://raw.githubusercontent.com/hi-space/data-visualization/master/hw2/data/bicycle_2019.csv")

var dropdownChange = function() {
    v = d3.select(this).property("value")

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

function update_graph(age_datasets, rental_datasets) {
    d3.select(".xaxis").remove()
    d3.select(".yaxis").remove()
    
    var x = d3.scaleLinear().rangeRound([0, width])
    var y = d3.scaleLinear().range([height, 0])

    x.domain(d3.extent(age_datasets, function(d) { return d.age }))
    y.domain([0, 10000000])
    
    var line = d3.line()
                .x(function (d) { return x(d.age); })
                .y(function (d) { return y(d.usages); })
                .curve(d3.curveMonotoneX)

    canvas.append("g")
        .attr("class", "xaxis")
        .attr("transform", "translate(0, " + height + ")")
        .call(d3.axisBottom(x));
    
    canvas.append("g")
        .attr("class", "yaxis")
        .call(d3.axisLeft(y))   

    var bars = canvas.selectAll(".bar").data(age_datasets);
    bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.age) - 20 })
        .attr("y", function(d) { return y(d.usages) })
        .attr("width", 40)
        .attr("height", function(d) { return height - y(d.usages); })

    bars.transition().duration(250)
        .attr("y", function(d) { return y(d.usages)})
        .attr("height", function(d) { return height - y(d.usages)})

    d3.select(".line").remove()
    canvas.append("path")
            .datum(age_datasets)
            .attr("class", "line")
            .attr("d", line);
    
    var dots = canvas.selectAll(".dot").data(age_datasets);
    dots.enter()
        .append("circle")
        .attr("class", "dot")
        .attr("cx", function(d) { return x(d.age) })
        .attr("cy", function(d) { return y(d.usages) })
        .attr("r", 5)

    dots.transition().duration(250)
        .attr("cx", function(d) { return x(d.age) })
        .attr("cy", function(d) { return y(d.usages) })
        .attr("r", 5)
    
    d3.selectAll(".label").remove()
    var labels = canvas.selectAll(".text").data(age_datasets)
    labels.enter()
        .append("text")
        .attr("class", "label")
        .attr("x", function(d) { return x(d.age) })
        .attr("y", function(d) { return y(d.usages) })
        .attr("dx", "-30")
        .attr("dy", "-5")
        .text(function(d) { return d.usages })

    // pie chart
    pie_chart = svg.selectAll("path").data(pie(rental_datasets))
    pie_chart.enter().append("path")
        .attr("fill", (d, i) => color(i))
        .attr("d", arc)
        .attr("stroke", "white")
        .attr("stroke-width", "6px")
        .each(function(d) { this._current = d; })
    pie_chart.transition().duration(250).attrTween("d", arcTween)

    pie_label = svg.selectAll("text").data(pie(rental_datasets))
    pie_label.enter().append("text")
                    .text(function(d, i) { return rental_code(rental_datasets[i].age) })
                    .attr("dy", ".75em")
                    .attr("transform", function(d) { return "translate(" + outerArc.centroid(d) + ")"; })
                    .style("text-anchor", "end")

    pie_label.transition().duration(250).attrTween("transform", function(d) {
        this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				var pos = outerArc.centroid(d2);
				pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
				return "translate("+ pos +")";
			};
		})
		.styleTween("text-anchor", function(d){
			this._current = this._current || d;
			var interpolate = d3.interpolate(this._current, d);
			this._current = interpolate(0);
			return function(t) {
				var d2 = interpolate(t);
				return midAngle(d2) < Math.PI ? "start":"end";
			};
        });
        

    var polyline = svg.selectAll("polyline").data(pie(rental_datasets));
    polyline.enter().append("polyline")
            .transition().duration(250)
		    .attrTween("points", function(d){
                this._current = this._current || d;
                var interpolate = d3.interpolate(this._current, d);
                this._current = interpolate(0);
                return function(t) {
                    var d2 = interpolate(t);
                    var pos = outerArc.centroid(d2);
                    pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                    return [arc.centroid(d2), outerArc.centroid(d2), pos];
                };			
		});
}

function make_grpah() {
    canvas = d3.select("#age-usages-chart")
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    
    svg = d3.select("#age-usages-chart")
                .append("svg")
                .attr("width", width)
                .attr("height", height)
                .append("g")
                .attr("transform", `translate(${width / 2}, ${height / 2})`);
    
}

function agg_age_cnt(filepath) {
    var data_list = new Array();

    d3.csv(filepath).then(function (data_list) {
        var rental_usages = {}
        var age_usages = {}
        data_list.forEach(function (data) {
            // rental code
            switch(data.rental_code) {
                case "일일(회원)":
                    field = "member"
                    break;
                case "일일(비회원)":
                    field = "non-member"
                    break;
                case "정기":
                    field = "season"
                    break;
                case "단체":
                    field = "group"
                    break;
                default:
                    field = ""
            }
            rental_usages[field] = (field in rental_usages) ? (rental_usages[field] += 1) : 0;

            // age 
            n = data.age.replace(/[^0-9]/g, '');
            age_usages[n] = (n in age_usages) ? (age_usages[n] += Number(data.usage)) : 0;
        });
        
        //rental
        var rental_datasets = []
        for (var rental_usage in rental_usages) {
            if (rental_usage != "")
                rental_datasets.push(new Usage(rental_usage, rental_usages[rental_usage]));
        }

        // age
        var age_datasets = []
        age_datasets.push(new Usage(0, 0));
        for (var age_usage in age_usages) {
            if (age_usage != "" && age_usage != 8)
                age_datasets.push(new Usage(age_usage * 10, age_usages[age_usage]));
        }

        age_datasets.sort(function(a, b) {
            return a.age < b.age ? -1 : a.age > b.age ? 1 : 0;
        })
        update_graph(age_datasets, rental_datasets)
    })
}

