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
let scaleFactor = 1;
let headNode;
let takenClasses = []
let hoveredCourse = null;
let distMoved = 0;
let mouseDown = false;

let scrollVal = 0;

window.onload = function () {
    //credit

    document.body.onwheel = function (event) {
        scrollVal += event.deltaY;
        if (scrollVal < -1000) {
            scrollVal = -1000;
        }
        if (scrollVal > 1000) {
            scrollVal = 1000;
        }
        let oldCenterX = (graphXOffset + canvas.width / 2) / scaleFactor;

        scaleFactor = Math.pow(1.001, scrollVal)

        graphXOffset = oldCenterX * scaleFactor - canvas.width / 2
        // graphXOffset * scaleFactor + scaleFactor * canvas.width / 2 = graphXOffset * scaleFactor + graphXOffset * canvas.width / 2
    }
    //manage mouse states
    document.body.onmousedown = function () {
        mouseDown = true;
        distMoved = 0;
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
            let deltaX = mouseX - event.pageX
            let deltaY = mouseY - event.pageY
            distMoved += Math.abs(deltaY) + Math.abs(deltaX)
            graphXOffset += deltaX
            graphYOffset += deltaY;
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
        drawLine(i - canvas.height / 5, 0, i, canvas.height, 10, "#ab4343")
    }
    if (headNode) {
        hoveredCourse = null;
        nodeW = nodeW * 0.9 + 18;
        nodeH = nodeH * 0.9 + 9;
        graphWidth = headNode.getWidth() * 240 * scaleFactor;
        graphHeight = headNode.getDepth() * 100 * scaleFactor;
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
 * 
 */
function updateCourseReccs() {

    let currString = document.getElementById("selectedCourse").value.toLowerCase()
    if (currString.length > 1) {
        let courseElement = document.getElementById("courses");
        courseElement.innerHTML = "";
        let addedCount = 0;
        for (let i = 0; i < courses.length; i++) {
            if (courses[i].name.toLowerCase().includes(currString) || courses[i].id.toLowerCase().includes(currString)) {
                addedCount++;
                let newData = document.createElement("option")
                newData.value = courses[i].id
                newData.innerText = courses[i].name
                courseElement.appendChild(newData)

                if (addedCount >= 3) {
                    break;
                }
            }
        }
    }
}
/**
 * Toggles the currently hovered course
 */
function toggleCourse() {
    if (hoveredCourse && distMoved < 30) {
        document.getElementById("tutorialText").hidden = true;
        if (takenClasses.includes(hoveredCourse)) {
            takenClasses.splice(takenClasses.indexOf(hoveredCourse), 1);
        } else {
            takenClasses.push(hoveredCourse);
        }
    }
}
/**
 * Recenters the graph
 */
function reCenter() {
    graphXOffset = headNode.getWidth() * 120 * scaleFactor - canvas.width / 2;
    graphYOffset = 0;
}
/**
 * Initializes the head node and resets data
 */
function setupNodes() {
    takenClasses = [];
    headNode = new ClassNode(selectedCourse.id);
    headNode.updatePosition(0, 0, canvas.width, canvas.height);
    scaleFactor = 1;
    reCenter()
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
    document.getElementById("navigatorOverlay").hidden = false;
    document.getElementById("logo").hidden = true;
    setupNodes();
}
function exitNav() {
    selectedCourse = null;
    headNode = null;
    document.getElementById("selectedCourse").value = "";
    document.getElementById("overlay").hidden = false;
    document.getElementById("navigatorOverlay").hidden = true;
    document.getElementById("logo").hidden = false;
}
function drawLine(x1, y1, x2, y2, width, color = "#000") {
    if ((x1 < 0 && x2 < 0) || (x1 > canvas.width && x2 > canvas.width)) {
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
    if (x + width < 0 || y + height < 0 || x > canvas.width || y > canvas.height) {
        return
    }
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height)

}
let interval;