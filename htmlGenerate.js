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

function createSliders () {

    var categories = 
        ["released_year",
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

    var html = `<div>`

    categories.forEach(function(c) {

        var labelName = (c + 'Label').replace('%', '');
        var sliderName = (c + 'Slider').replace('%', '');

        html = html + `
                    <div>
                        <label for="${labelName}Label">${headerMapping[c]} Range:</label>
                        <input type="text" id="${labelName}" readonly style="border:0;
                        color:#f6931f; font-weight:bold;">
                        <div id="${sliderName}" class="slider-range"></div>
                    </div>
                    `

    })

    html = html + `</div>`
    
    document.getElementById('sliders').innerHTML = html;
    return html
}