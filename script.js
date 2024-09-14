let canvas;
let ctx;
let selectedCourse;
let courses = [];
let courseDict = {}
let mouseX = 0;;
let mouseY = 0;
let headNode
let takenClasses = []
let hoveredCourse = null;
window.onload = function () {
    //alert('hi')
    //make request to data
    canvas = document.getElementById('courseCanvas');
    ctx = canvas.getContext('2d')
    interval = setInterval(render, 25);
    loadCourses()
    startTime = Date.now();
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        mouseX = event.pageX;
        mouseY = event.pageY;
    }
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
    if (headNode) {
        hoveredCourse = null;
        headNode.updateHoveredCourse()
        headNode.draw()
        nodeW = nodeW * 0.9 + 18;
        nodeH = nodeH * 0.9 + 9;
        headNode.updatePosition(0, 0, canvas.width, canvas.height)
    }
}
function toggleCourse() {
    if (hoveredCourse) {
        if (takenClasses.includes(hoveredCourse)) {
            takenClasses.splice(takenClasses.indexOf(hoveredCourse), 1)
        } else {
            takenClasses.push(hoveredCourse)
        }
    }
}
function navigate() {
    selectedCourse = null;
    let targetCourseID = document.getElementById("selectedCourse").value;
    for (let i = 0; i < courses.length; i++) {
        if (courses[i].id == targetCourseID) {
            selectedCourse = courses[i]
        }
    }
    if (selectedCourse == null) {
        //invalid entry
        return;
    }
    document.getElementById("overlay").hidden = true;
    document.getElementById("exitButton").hidden = false;
    setupNodes();
}
function exitNav() {
    selectedCourse = null;
    document.getElementById("selectedCourse").value = "";
    document.getElementById("overlay").hidden = false;
    document.getElementById("exitButton").hidden = true;
}
function drawLine(x1, y1, x2, y2, width, color = "#000") {
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}
function drawRect(x, y, width, height, color = "#000") {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)

}
let interval;