let canvas;
let ctx;
let selectedCourse;
let courses = [];
let courseDict = {}
window.onload = function () {
    //alert('hi')
    //make request to data
    canvas = document.getElementById('courseCanvas');
    ctx = canvas.getContext('2d')
    interval = setInterval(render, 25);
    loadCourses()
    startTime = Date.now()
}
async function loadCourses() {
    let data = await (fetch("data.json").then(x => x.json()))
    courses = data["courses"]
    let dataElement = document.getElementById("courses")
    for (let i = 0; i < courses.length; i++) {
        let newData = document.createElement("option")
        newData.value = courses[i].id
        newData.innerText = courses[i].name
        dataElement.appendChild(newData)
        courseDict[courses[i].id] = courses[i]
    }
}
let startTime = 0;
function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#861F41"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#E5751F"
    ctx.lineWidth = 10;
    let runTime = Date.now() - startTime
    for (let i = (runTime / 50) % 100 - 50; i < canvas.height / 5 + canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i - canvas.height / 5, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke()
    }
    headNode.draw()
}

function navigate() {
    selectedCourse = null;
    let targetCourseID = document.getElementById("selectedCourse").value;
    for (let i = 0; i < courses.length; i++) {
        if(courses[i].id == targetCourseID){
            selectedCourse = courses[i]
        }
    }
    if(selectedCourse == null){
        //invalid entry
        return;
    }
    document.getElementById("overlay").hidden = true;
    document.getElementById("exitButton").hidden = false;
    setupNodes();
}
function exitNav(){
    selectedCourse = null;
    document.getElementById("selectedCourse").value = "";
    document.getElementById("overlay").hidden = false;
    document.getElementById("exitButton").hidden = true;
}
let interval;