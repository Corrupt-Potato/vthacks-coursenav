let canvas;
let ctx;
let courses = [];
window.onload = function(){
    //alert('hi')
    //make request to data
    canvas = document.getElementById('courseCanvas');
    ctx = canvas.getContext('2d')
    interval = setInterval(render,25);
    loadCourses()
}
async function loadCourses(){
    let data = await (fetch("data.json").then(x => x.json()))
    courses = data["courses"]
    let dataElement = document.getElementById("courses")
    for(let i = 0; i<courses.length; i++){
        let newData = document.createElement("option")
        newData.value = courses[i].id
        newData.innerText = courses[i].name
        dataElement.appendChild(newData)
    }
}
function render(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#ff0000"
    ctx.fillRect(0,0,canvas.width,canvas.height)
}
let interval;