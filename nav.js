const navArray = [
    {
        "name": "Matrix Layout",
        "pathname": "index.html"
    },
    {
        "name": "Conditional Graphics",
        "pathname": "index-csv-conditional-graphics.html"
    },
    {
        "name": "Procedure Displays",
        "pathname": "index-gen-from-prl.html"
    },
    {
        "name": "Stacked Views",
        "pathname": "index-csv-to-stacked-plot.html"
    },
    {
        "name": "Extract Telemetry",
        "pathname": "index-telemetry-extract.html"
    },
    {
        "name": "Legacy",
        "pathname": "index-legacy-displays.html"
    }
];

addNav = function () {
    let curPathname = window.location.pathname;
    if (curPathname === '/') {
        curPathname = 'index.html';
    }
    const navHolder = document.getElementById("nav");
    let navLink;

    for (let i = 0; i < navArray.length; i++) {
        navLink = document.createElement("a");
        navLink.href = navArray[i].pathname;
        if (curPathname.includes(navArray[i].pathname)) {
            navLink.classList.add('--is-current');
        }
        navLink.innerText = navArray[i].name;
        navHolder.appendChild(navLink);
    }
}
