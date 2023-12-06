var dataset;
var filteredData;
var xAxis = "released_year";
var allGraphs = false;

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
        // "in_spotify_playlists": [],
        // "in_spotify_charts": [],
        "streams": [],
        // "in_apple_playlists": [],
        // "in_apple_charts": [],
        // "in_deezer_playlists": [],
        // "in_deezer_charts": [],
        // "in_shazam_charts": [],
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
            // "in_spotify_playlists",
            // "in_spotify_charts",
            // "streams",
            // "in_apple_playlists",
            // "in_apple_charts",
            // "in_deezer_playlists",
            // "in_deezer_charts",
            // "in_shazam_charts",
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

        Object.keys(filters).forEach(function(c) {
            if (c === "artist(s)_name" || c === "track_name"){
                return;
            }
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
    allGraphs = false;
    xAxis = d3.select('#xAxisDropdown').node().value;
    renderGraph(filteredData);
}

function viewAllGraphs() {
    allGraphs = true;
    renderGraph(filteredData)
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
    // console.log(d3.select('#artistDropdown').node().value)
    var myA = d3.select('#artistDropdown').node().value;
    setFilter("artist(s)_name", [myA]);
}

function setFilter(c, myVal) {
    filters[c] = myVal;
    applyFilters();
}

function adjustFilters(song){
    // console.log("adjust filters")
    console.log(song)
    Object.keys(filters).forEach(function(f) {
        if (f !== "artist(s)_name" && f !== "track_name" && f !== "streams" && f !== "artist_count" && f !== "released_year"){
            if(f === "artist_count"){
                var tempData = dataset.map(function(row) {
                    return parseInt(row[f]);
                });
                var absMin = d3.min(tempData);
                var absMax = d3.max(tempData);
                if (song[f] === 1){
                    var vals = [1, 2];
                }
                else {
                   var vals = [2, absMax]
                }
                console.log(f)
                $(`#${f}Slider`.replace('%', '')).slider({
                    range: true,
                    min: absMin,
                    max: absMax,
                    values: vals,
                    slide: function(event, ui) {
                    $(`#${f}Label`.replace('%', '')).val(ui.values[0] + " - " + ui.values[1]);
                    setFilter(f, ui.values);
                    }
                });
                $(`#${f}Label`.replace('%', '')).val($(`#${f}Slider`.replace('%', '')).slider("values", 0) +
                        " - " + $(`#${f}Slider`.replace('%', '')).slider("values", 1));
                // console.log(f)
                setFilter(f, vals);
            }
            else {
                if (f === "streams"){
                    var range = 100000;
                }
                else {
                    var range = 25;
                }
       
                var tempData = dataset.map(function(row) {
                    return parseInt(row[f]);
                });
                var absMin = d3.min(tempData);
                var absMax = d3.max(tempData);
                var vals = [Math.max(song[f] - range, absMin), Math.min(song[f] + range, absMax)]
                $(`#${f}Slider`.replace('%', '')).slider({
                    range: true,
                    min: absMin,
                    max: absMax,
                    values: vals,
                    slide: function(event, ui) {
                    $(`#${f}Label`.replace('%', '')).val(ui.values[0] + " - " + ui.values[1]);
                    setFilter(f, ui.values);
                    }
                });
                $(`#${f}Label`.replace('%', '')).val($(`#${f}Slider`.replace('%', '')).slider("values", 0) +
                        " - " + $(`#${f}Slider`.replace('%', '')).slider("values", 1));
                // console.log(f)
                setFilter(f, vals);
            }
        }
    })  

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
    svgContainer.selectAll('svg').remove();

    var tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("z-index", 2);

    if (allGraphs) {
       
        var svgWidth = 500;
        var svgHeight = 275;

        var margin = { top: 20, right: 20, bottom: 50, left: 100 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        xAxisOptions.forEach(function(graph) {
            drawGraph(filteredData, tooltip, svgContainer, svgWidth, svgHeight, margin, width, height, graph);
        })

    }
    else {
        
        var svgWidth = 1000;
        var svgHeight = 550;

        var margin = { top: 20, right: 20, bottom: 50, left: 100 };
        var width = svgWidth - margin.left - margin.right;
        var height = svgHeight - margin.top - margin.bottom;

        drawGraph(data, tooltip, svgContainer, svgWidth, svgHeight, margin, width, height, xAxis);
    }
    
}


function drawGraph(data, tooltip, svgContainer, svgWidth, svgHeight, margin, width, height, xAx) {
    
    svg = svgContainer.append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight)
        .append("g") // Create a group element for margins
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    var xScale = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, d => d[xAx]) ,d3.max(data, d => d[xAx])]);

    var yScale = d3.scaleLinear()
        .range([height, 0])
        .domain([0, d3.max(data, d => d["streams"])]);

    // brushing and linking
    var brush = d3.brush()
        .extent([[0, -margin.top], [svgWidth, svgHeight - margin.bottom]])
        .on("brush end", updateChart)
        .on("end", brushFilter);

    svg.append("g")
        .attr("class", "brush")
        .call(brush);

    var points = svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d[xAx]))
        .attr("cy", d => yScale(d["streams"]))
        .attr("r", 2)
        .attr("fill", "steelblue")
        .on("mouseover", function(d) {
            var pt = d.target.__data__;
            var tloc = findTooltipLoc(d.clientX, d.clientY);
            tooltip.transition()
              .duration(200)
              .style("opacity", 0.9);
            tooltip.html(tooltipHTML(pt)) 
              .style("left", tloc[0] + "px")
              .style("top", tloc[1] + "px");
        })
        .on("mouseout", function(d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", handleClick);

    // Add X Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    // Add X Axis Label
    svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 5) + ")")
        .style("text-anchor", "middle")
        .text(headerMapping[xAx]);

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

    function updateChart() {
        var brush = d3.brushSelection(this);

        points.attr("class", function(d) {
            var x = xScale(d[xAx]);
            var y = yScale(d["streams"]);
            return brush && brush[0][0] <= x && x <= brush[1][0] &&
                    brush[0][1] <= y && y <= brush[1][1] ? "selected" : "";
        });
    }

    function brushFilter() {

        var tempDataX = dataset.map(function(row) {
            return parseInt(row[xAx]);
        });

        var absMinX = d3.min(tempDataX);
        var absMaxX = d3.max(tempDataX);

        var tempDataY = dataset.map(function(row) {
            return parseInt(row["streams"]);
        });

        var absMinY = d3.min(tempDataY);
        var absMaxY = d3.max(tempDataY);

        var selectedPoints = points.filter(".selected").data();
        var selectedDataX = selectedPoints.map(function(row) {
            return parseInt(row[xAx]);
        });

        var selectedDataY = selectedPoints.map(function(row) {
            return parseInt(row["streams"]);
        });

        var selectedMinX = d3.min(selectedDataX);
        var selectedMaxX = d3.max(selectedDataX);

        var selectedMinY = d3.min(selectedDataY);
        var selectedMaxY = d3.max(selectedDataY);

        var valsX = [selectedMinX, selectedMaxX];
        var valsY = [selectedMinY, selectedMaxY];

        $(`#${xAx}Slider`.replace('%', '')).slider({
            range: true,
            min: absMinX,
            max: absMaxX,
            values: valsX,
            slide: function(event, ui) {
            $(`#${xAx}Label`.replace('%', '')).val(ui.values[0] + " - " + ui.values[1]);
            setFilter(xAx, ui.values);
            }
        });
        $(`#${xAx}Label`.replace('%', '')).val($(`#${xAx}Slider`.replace('%', '')).slider("values", 0) +
                " - " + $(`#${xAx}Slider`.replace('%', '')).slider("values", 1));
        setFilter(xAx, valsX);

        $(`#streamsSlider`.replace('%', '')).slider({
            range: true,
            min: absMinY,
            max: absMaxY,
            values: valsY,
            slide: function(event, ui) {
            $(`#streamsLabel`.replace('%', '')).val(ui.values[0] + " - " + ui.values[1]);
            setFilter("streams", ui.values);
            }
        });
        $(`#streamsLabel`.replace('%', '')).val($(`#streamsSlider`.replace('%', '')).slider("values", 0) +
                " - " + $(`#streamsSlider`.replace('%', '')).slider("values", 1));
        setFilter("streams", valsY);

        
    }


    function handleClick(event, d) {
        // console.log(event);
        // console.log(d);

        var dstats = [
            d["released_year"],
            d["artist_count"],
            d["bpm"],
            d["danceability_%"],
            d["valence_%"],
            d["energy_%"],
            d["acousticness_%"],
            d["instrumentalness_%"],
            d["liveness_%"],
            d["speechiness_%"]
        ]

        songsWithMSE = dataset.map(function (song) {
            var otherstats = 
            [
                song["released_year"],
                song["artist_count"],
                song["bpm"],
                song["danceability_%"],
                song["valence_%"],
                song["energy_%"],
                song["acousticness_%"],
                song["instrumentalness_%"],
                song["liveness_%"],
                song["speechiness_%"]
            ]

            var mse = MSE(dstats, otherstats)

            songData = cpy(song);

            songData["MSE"] = mse

            return songData;
        })

        songsWithMSE.sort((a, b) => a.MSE - b.MSE);

        var html = `<div>
            <h2>Since you like "${d["track_name"]}" by ${d["artist(s)_name"]}, try:</h2>
        `

        for (var i = 1; i < 11; i++){
            if(i >= songsWithMSE.length){
                break;
            }
            var songRec = songsWithMSE[i];
            html += `
            <div class="songRec">
                ${i}: "${songRec["track_name"]}" by ${songRec["artist(s)_name"]}
            </div>
            `

        }

        html = html + `
        </div>`

        document.getElementById('songRecommendations').innerHTML = html;

        var button = d3.select("#songRecommendations").append("button")
            .text("Adjust Filters to See Similar Songs")
            .on("click", function() {adjustFilters(d)})
     
        // console.log(songsWithMSE);

    }

    function findTooltipLoc(x, y) {
        
        var tx = (x - 260);
        var ty;
        if (y < 100) {
            ty = y;
        }
        else if (y < 200) {
            ty = y - 100;
        }
        else if (y < 300) {
            ty = y - 200
        }
        else if (y < 400) {
            ty = y - 300
        }
        else {
            ty = y - 400;
        }

        return [tx, ty]

    }
}

function tooltipHTML (pt) {
    return `<div>
        <p>
        ${pt["track_name"]} by ${pt["artist(s)_name"]}
        </p>
        <p>
        ${pt["streams"]} streams
        </p>
        <p>
        Released on ${pt["released_month"]}/${pt["released_day"]}/${pt["released_year"]}
        </p>
        <p>
        BPM: ${pt["bpm"]}
        </p>
        <p>
        Key: ${pt["key"]}
        </p>
        <p>
        Mode: ${pt["mode"]}
        </p>
        <p>
        Danceability: ${pt["danceability_%"]}%
        </p>
        <p>
        Valence: ${pt["valence_%"]}%
        </p>
        <p>
        Energy: ${pt["energy_%"]}%
        </p>
        <p>
        Acousticness: ${pt["acousticness_%"]}%
        </p>
        <p>
        Instrumentalness: ${pt["instrumentalness_%"]}%
        </p>
        <p>
        Liveness: ${pt["liveness_%"]}%
        </p>
        <p>
        Speechiness: ${pt["speechiness_%"]}%
        </p>
    </div>`
}

function MSE(actual, pred) {
    if (actual.length !== pred.length) {
      throw new Error('Length mismatch between actual and predicted values.');
    }
  
    var sumSquaredDiff = 0;
    var n = actual.length;
  
    for (var i = 0; i < n; i++) {
      var squaredDiff = Math.pow(actual[i] - pred[i], 2);
      sumSquaredDiff += squaredDiff;
    }
  
    var mse = sumSquaredDiff / n;
    return mse;
}
