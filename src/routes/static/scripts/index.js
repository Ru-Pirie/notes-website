// setting the correct stylesheet on page load using localstorage
if (localStorage.getItem("darkModeState") != null) {
    darkModeState = localStorage.getItem("darkModeState")
} else {
    darkModeState = "true"
    localStorage.setItem("darkModeState", darkModeState)
}
if (darkModeState === "true") {
    let stylesheet = document.getElementById("mainStyle")
    stylesheet.href = "/static/css/dark-index.css"
} else {
    let stylesheet = document.getElementById("mainStyle")
    stylesheet.href = "/static/css/index.css"
}

// toggling dark mode using the button on the page
function toggleDarkMode() {
    let darkModeState = localStorage.getItem("darkModeState")

    if (darkModeState === "true") {
        darkModeState = "false"
        let toggleBtn = document.getElementById("themeIcon")
        toggleBtn.className = "fa-solid fa-moon"
        let stylesheet = document.getElementById("mainStyle")
        stylesheet.href = "/static/css/index.css"
    } 
    else {
        darkModeState = "true"
        let stylesheet = document.getElementById("mainStyle")
        let toggleBtn = document.getElementById("themeIcon")
        toggleBtn.className = "fa-solid fa-sun"

        stylesheet.href = "/static/css/dark-index.css"        
    }

    localStorage.setItem("darkModeState", darkModeState)
}

