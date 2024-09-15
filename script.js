let canvas;
let ctx;
let selectedCourse;
let courses = [];
let courseDict = {}
let mouseX = 0;
let mouseY = 0;
let graphXOffset = 0;
let graphYOffset = 0;
let graphWidth = 0;
let graphHeight = 0;
let headNode;
let takenClasses = []
let hoveredCourse = null;
let mouseDown = false;
window.onload = function () {
    document.body.onmousedown = function () {
        mouseDown = true;
    }
    document.body.onmouseup = function () {
        mouseDown = false;
    }
    //alert('hi')
    //make request to data
    canvas = document.getElementById('courseCanvas');
    ctx = canvas.getContext('2d')
    interval = setInterval(render, 25);
    //use data
    loadCourses()
    document.onmousemove = handleMouseMove;
    function handleMouseMove(event) {
        if (mouseDown) {
            graphXOffset += mouseX - event.pageX;
            graphYOffset += mouseY - event.pageY;
        }
        mouseX = event.pageX;
        mouseY = event.pageY;
    }
}
async function loadCourses() {
    let data = await (fetch("prerequisite_matrices.json").then(x => x.json()))
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
function render() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drawRect(0, 0, canvas.width, canvas.height, "#861F41")
    let runTime = Date.now()
    for (let i = (runTime / 50) % 100 - 50; i < canvas.height / 5 + canvas.width; i += 50) {
        drawLine(i - canvas.height / 5, 0, i, canvas.height, 10, "#f5953F")
    }
    if (headNode) {
        hoveredCourse = null;
        nodeW = nodeW * 0.9 + 18;
        nodeH = nodeH * 0.9 + 9;
        graphWidth = headNode.getWidth() * 240;
        graphHeight = headNode.getDepth() * 100;
        if (graphWidth < canvas.width) {
            graphWidth = canvas.width;
            graphXOffset = 0;
        }
        if (graphHeight < canvas.height) {
            graphHeight = canvas.height;
            graphYOffset = 0;
        }
        if (graphXOffset < 0) {
            graphXOffset = 0;
        }
        if (graphYOffset < 0) {
            graphYOffset = 0;
        }
        if (graphXOffset > graphWidth - canvas.width) {
            graphXOffset = graphWidth - canvas.width;
        }
        if (graphYOffset > graphHeight - canvas.height) {
            graphYOffset = graphHeight - canvas.height;
        }
        headNode.updatePosition(-graphXOffset, -graphYOffset, graphWidth, graphHeight)
        headNode.updateHoveredCourse();
        headNode.draw();
        headNode.updateHoveredCourse();
        headNode.draw();
    }
}
/**
 * Toggles the currently hovered course
 */
function toggleCourse() {
    if (hoveredCourse) {
        if (takenClasses.includes(hoveredCourse)) {
            takenClasses.splice(takenClasses.indexOf(hoveredCourse), 1);
        } else {
            takenClasses.push(hoveredCourse);
        }
        graphXOffset = headNode.getWidth() * 120 - canvas.width / 2;

    }
}
/**
 * Initializes the head node and resets data
 */
function setupNodes() {
    takenClasses = [];
    headNode = new ClassNode(selectedCourse.id);
    headNode.updatePosition(0, 0, canvas.width, canvas.height);
    graphXOffset = headNode.getWidth() * 120 - canvas.width / 2;
    console.log(graphXOffset);
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
    document.getElementById("logo").hidden = true;
    setupNodes();
}
function exitNav() {
    selectedCourse = null;
    document.getElementById("selectedCourse").value = "";
    document.getElementById("overlay").hidden = false;
    document.getElementById("exitButton").hidden = true;
    document.getElementById("logo").hidden = false;
}
function drawLine(x1, y1, x2, y2, width, color = "#000") {
    if((x1 < 0 && x2 < 0) || (x1 > canvas.width && x2 > canvas.width)){
        return
    }
    ctx.lineWidth = width
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}
function drawRect(x, y, width, height, color = "#000") {
    if(x + width < 0 || y + height < 0 || x > canvas.width || y > canvas.height){
        return
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)
    
}
let interval;