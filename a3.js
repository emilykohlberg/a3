var dataset;
var filteredData;
var xAxis = "released_year";

function cpy (a) {
    return JSON.parse(JSON.stringify(a));
}

var headerMapping = {
    "track_name": "Track Name",
    "artist(s)_name": "Artist Name",
    "artist_count": "Artist Count",
    "released_year": "Released Year",
    "released_month": "Released Month",
    "released_day": "Released Day",
    "in_spotify_playlists": "In Spotify Playlists",
    "in_spotify_charts": "In Spotify Charts",
    "streams": "Streams",
    "in_apple_playlists": "In Apple Playlists",
    "in_apple_charts": "In Apple Charts",
    "in_deezer_playlists": "In Deezer Playlists",
    "in_deezer_charts": "In Deezer Charts",
    "in_shazam_charts": "In Shazam Charts",
    "bpm": "Beats Per Minute",
    "key": "Key",
    "mode": "Mode",
    "danceability_%": "Danceability Percentage",
    "valence_%": "Valence Percentage",
    "energy_%": "Energy Percentage",
    "acousticness_%": "Acousticness Percentage",
    "instrumentalness_%": "Instrumentalness Percentage",
    "liveness_%": "Liveness Percentage",
    "speechiness_%": "Speechiness Percentage"
};

var filters = {
        "track_name": [],
        "artist(s)_name": [],
        "released_year": [],
        "artist_count": [], 
        "in_spotify_playlists": [],
        "in_spotify_charts": [],
        "streams": [],
        "in_apple_playlists": [],
        "in_apple_charts": [],
        "in_deezer_playlists": [],
        "in_deezer_charts": [],
        "in_shazam_charts": [],
        "bpm": [],
        "danceability_%": [],
        "valence_%" : [],
        "energy_%": [],
        "acousticness_%": [],
        "instrumentalness_%": [],
        "liveness_%": [],
        "speechiness_%": []
}

var xAxisOptions = 
            [ "released_year",
            "artist_count",
            "in_spotify_playlists",
            "in_spotify_charts",
            "streams",
            "in_apple_playlists",
            "in_apple_charts",
            "in_deezer_playlists",
            "in_deezer_charts",
            "in_shazam_charts",
            "bpm",
            "danceability_%",
            "valence_%",
            "energy_%",
            "acousticness_%",
            "instrumentalness_%",
            "liveness_%",
            "speechiness_%"]

var body = d3.select("body");

d3.csv("spotify-2023.csv").then(function(data) {

    dataset = dataCleaning(data);
    filteredData = cpy(dataset);

    populateFilters();
    renderGraph(filteredData);

});

function dataCleaning(originalData) {
    var cleanData = originalData.filter(function(d, i) {
        // row is messed up
        var row = d;
        xAxisOptions.forEach(function(element, index) {
            row[element] = parseInt(row[element]);
        })

        // console.log(row)

        if (d["artist(s)_name"] !== "Edison Lighthouse") {
            return row;
        }
    })
    return cleanData;
}

function populateFilters() {
    // x axis
    var xAxisDropdown = d3.select('#xAxisDropdown');
    
    xAxisDropdown.selectAll('option')
        .data(xAxisOptions)
        .enter()
        .append('option')
        .text(function (d) {
            return d;
        });

    // song
    var songDropdown = d3.select('#songDropdown');
    var songs = ['All', ...new Set(dataset.map(d => d["track_name"]))];
  
    songDropdown.selectAll('option')
        .data(songs)
        .enter()
        .append('option')
        .text(function (d) {
        return d;
        });

    filters["track_name"] = ["All"];

    // artists
    var artistDropdown = d3.select('#artistDropdown');
    var artists = ['All', ...new Set(dataset.map(d => d["artist(s)_name"]))];
  
    artistDropdown.selectAll('option')
        .data(artists)
        .enter()
        .append('option')
        .text(function (d) {
        return d;
        });

    filters["artist(s)_name"] = ["All"];

    // sliders
    (function() {

        xAxisOptions.forEach(function(c) {
            var tempData = dataset.map(function(row) {
                return parseInt(row[c]);
            });
            var tempMin = d3.min(tempData);
            var tempMax = d3.max(tempData);
            filters[c] = [tempMin, tempMax];

            $(`#${c}Slider`.replace('%', '')).slider({
                range: true,
                min: tempMin,
                max: tempMax,
                values: [tempMin, tempMax],
                slide: function(event, ui) {
                $(`#${c}Label`.replace('%', '')).val(ui.values[0] + " - " + ui.values[1]);
                setFilter(c, ui.values);
                }
            });
            $(`#${c}Label`.replace('%', '')).val($(`#${c}Slider`.replace('%', '')).slider("values", 0) +
                    " - " + $(`#${c}Slider`.replace('%', '')).slider("values", 1));
            })
        })();
  
}

function changeXAxis() {
    xAxis = d3.select('#xAxisDropdown').node().value;
    renderGraph(filteredData);
}


function applyFilters() {

    filteredData = cpy(dataset);
    Object.entries(filters).forEach(function([key, value]) {

        
        if (key === "artist(s)_name" || key === "track_name") {
            if (value[0] !== 'All'){
                filteredData = cpy(filteredData).filter((d, i) => {
                   return d[key] === value[0]
                })
            }
        } 
        else {
            // filteredData.forEach((d, i) => {
            //     console.log(d[key] >= value[0] && d[key] <= value[1])
            // })
            filteredData = cpy(filteredData).filter((d, i) => {
                return (d[key] >= value[0] && d[key] <= value[1])
            })
        }
    });

    // console.log("here", filteredData)
    renderGraph(filteredData);
}

function filterSong() {
    var myA = d3.select('#songDropdown').node().value;
    setFilter("track_name", [myA]);
}

function filterArtist() {
    var myA = d3.select('#artistDropdown').node().value;
    setFilter("artist(s)_name", [myA]);
}

function setFilter(c, myVal) {
    filters[c] = myVal;
    applyFilters();
}

function renderTable(data) {

    d3.select('table').remove();

    // Create an HTML table
    const table = body.append('table');

    // Create table header
    const headers = Object.keys(data[0]);
    table.append('thead')
      .append('tr')
      .selectAll('th')
      .data(headers)
      .enter()
      .append('th')
      .text(function(d) {
        return headerMapping[d];
      });

    // Create table rows
    const rows = table.append('tbody')
      .selectAll('tr')
      .data(data)
      .enter()
      .append('tr');

    // Populate table cells with data
    rows.selectAll('td')
      .data(function(d) {
        return headers.map(function(header) {
          return d[header];
        });
      })
      .enter()
      .append('td')
      .text(function(d) {
        return d;
      });

}

function renderGraph(data) {

    var svgContainer = d3.select('#svgContainer');
    svgContainer.select('svg').remove();

    var svgWidth = 1200;
    var svgHeight = 600;

    // console.log(xAxis)
    // console.log(data)

    // console.log([d3.min(data, d => d[xAxis]) ,d3.max(data, d => d[xAxis])])

    var margin = { top: 20, right: 20, bottom: 50, left: 100 };
    var width = svgWidth - margin.left - margin.right;
    var height = svgHeight - margin.top - margin.bottom;

    var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0)
        .style("z-index", 2);

    svg = svgContainer.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g") // Create a group element for margins
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, d => d[xAxis]) ,d3.max(data, d => d[xAxis])]);

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d["streams"])]);

    svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[xAxis]))
        .attr("cy", d => yScale(d["streams"]))
        .attr("r", 2)
        .attr("fill", "steelblue")
        .on("mouseover", function(d) {
            var pt = d.target.__data__
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(pt["track_name"] + " by " + pt["artist(s)_name"] + ": " + pt["streams"] + " streams") 
              .style("left", (d.clientX - 125) + "px")
              .style("top", (d.clientY + 10) + "px");
        })
        .on("mouseout", function(d) {
        tooltip.transition()
            .duration(500)
            .style("opacity", 0);
        });

    // track_name": "Track Name",
    // "artist(s)_name"

    // Add X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add X Axis Label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 5) + ")")
        .style("text-anchor", "middle")
        .text(headerMapping[xAxis]);

    // Add Y Axis
    svg.append("g")
        .call( d3.axisLeft(yScale));

    // Add Y Axis Label
    svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Streams");
  
}
