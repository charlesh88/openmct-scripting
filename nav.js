const navArray = [
    {
        "name": "Displays from CSV",
        "pathname": "/"
    },
    {
        "name": "Matrix Layout from CSV",
        "pathname": "/index-csv-to-matrix.html"
    },
    {
        "name": "Procedure Displays",
        "pathname": "/index-gen-from-prl.html"
    },
    {
        "name": "Extract Telemetry",
        "pathname": "/index-telemetry-extract.html"
    }
];

function addNav() {
    const curPathname = window.location.pathname;
    const navHolder = document.getElementById("nav");
    // console.log(navArray);
    // console.log("curPathname", curPathname);
    let navLink;

    for (let i = 0; i < navArray.length; i++) {
        navLink = document.createElement("a");
        navLink.href = navArray[i].pathname;
        if (curPathname === navArray[i].pathname) {
            navLink.classList.add('--is-current');
        }
        navLink.innerText = navArray[i].name;
        navHolder.appendChild(navLink);
    }
}

document.body.onload = addNav();
