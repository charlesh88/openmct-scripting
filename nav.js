const navArray = [
    {
        "name": "Displays from CSV",
        "pathname": "index.html"
    },
    {
        "name": "Matrix Layout from CSV",
        "pathname": "index-csv-to-matrix.html"
    },
    {
        "name": "Stacked Plot from CSV",
        "pathname": "index-csv-to-stacked-plot.html"
    },
    {
        "name": "Procedure Displays",
        "pathname": "index-gen-from-prl.html"
    },
    {
        "name": "Extract Telemetry",
        "pathname": "index-telemetry-extract.html"
    }
];

function addNav() {
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

document.body.onload = addNav();
