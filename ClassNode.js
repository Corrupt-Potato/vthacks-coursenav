let nodeW = 180;
let nodeH = 90;
class ClassNode {
    constructor(id) {
        this.id = id;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.margin = 8;
        this.boxSize = 0;
        //setup children
        this.children = []
        if (courseDict[id] === undefined) {
            return;
        }
        let prereqs = courseDict[id].prereq
        for (let i = 0; i < prereqs.length; i++) {
            this.children.push([])
            for (let j = 0; j < prereqs[i].length; j++) {
                this.children[i].push(new ClassNode(prereqs[i][j]))
            }
        }
    }
    draw() {
        //draw a line to all children
        if (!this.taken) {
            let satisfied = []
            let avgXL = []
            let minYL = []
            for (let i = 0; i < this.children.length; i++) {
                let SAT = false;
                let avgX = 0
                let minY = this.children[i][0].y
                for (let j = 0; j < this.children[i].length; j++) {
                    avgX += this.children[i][j].x;
                    if (this.children[i][j].taken) {
                        SAT = true;
                    }
                    minY = Math.min(minY, this.children[i][j].y)
                }
                avgX /= this.children[i].length
                avgXL.push(avgX)
                minYL.push(minY)
                satisfied.push(SAT)
            }
            ctx.lineCap = "round";
            for (let i = 0; i < this.children.length; i++) {
                let clauseX = avgXL[i];
                let clauseY = (minYL[i] + this.y) / 2

                ctx.strokeStyle = "#000000"
                ctx.lineWidth = Math.min(nodeW / 2, nodeH) / 5
                ctx.beginPath()
                ctx.moveTo(clauseX, clauseY)
                ctx.lineTo(this.x, this.y)
                ctx.stroke()
                for (let j = 0; j < this.children[i].length; j++) {
                    let child = this.children[i][j]
                    ctx.strokeStyle = "#000000"
                    ctx.lineWidth = Math.min(nodeW / 2, nodeH) / 5
                    ctx.beginPath()
                    ctx.moveTo(clauseX, clauseY)
                    ctx.lineTo(child.x, child.y)
                    ctx.stroke()
                }

                for (let j = 0; j < this.children[i].length; j++) {
                    let child = this.children[i][j]
                    if (child.taken) {
                        ctx.strokeStyle = "#0f0"
                        ctx.lineWidth = Math.min(nodeW / 2, nodeH) / 10
                        ctx.beginPath()
                        ctx.moveTo(clauseX, clauseY)
                        ctx.lineTo(child.x, child.y)
                        ctx.stroke()
                    }
                }

                if (satisfied[i]) {
                    ctx.strokeStyle = "#0f0"
                    ctx.lineWidth = Math.min(nodeW / 2, nodeH) / 10
                    ctx.beginPath()
                    ctx.moveTo(clauseX, clauseY)
                    ctx.lineTo(this.x, this.y)
                    ctx.stroke()
                }
            }
        }
        //
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x - nodeW / 2 - this.margin / 2, this.y - nodeH / 2 - this.margin / 2, nodeW + this.margin, nodeH + this.margin)
        ctx.fillStyle = "#E5751F";
        if (hoveredCourse == this.id) {
            ctx.fillStyle = "#b0b0b0"
        }
        ctx.fillRect(this.x - nodeW / 2, this.y - nodeH / 2, nodeW, nodeH)

        //draw course ID
        ctx.fillStyle = "#000000";
        let txtMeasure = ctx.measureText(this.id)
        let scaleFactor = Math.min(3 / 5 * nodeW / txtMeasure.width, nodeH / 3 / (txtMeasure.actualBoundingBoxAscent + txtMeasure.actualBoundingBoxDescent))
        ctx.font = `${scaleFactor * parseFloat(ctx.font)}px Arial`
        ctx.textAlign = "center";
        txtMeasure = ctx.measureText(this.id)
        ctx.fillText(this.id, this.x, this.y - nodeH / 3 + txtMeasure.actualBoundingBoxAscent)

        //draw course title
        ctx.fillStyle = "#000000";
        txtMeasure = ctx.measureText(courseDict[this.id].name)
        scaleFactor = Math.min(9 / 10 * nodeW / txtMeasure.width, nodeH / 3 / (txtMeasure.actualBoundingBoxAscent + txtMeasure.actualBoundingBoxDescent))
        ctx.font = `${scaleFactor * parseFloat(ctx.font)}px Arial`
        ctx.textAlign = "center";
        txtMeasure = ctx.measureText(courseDict[this.id].name)
        ctx.fillText(courseDict[this.id].name, this.x, this.y + nodeH / 3)

        let tgtSize = Math.min(nodeW / 8, nodeH / 4);
        if (!this.taken) {
            tgtSize = 0;
        }
        this.boxSize = 0.8 * this.boxSize + 0.2 * tgtSize
        ctx.drawImage(document.getElementById('checkbox'), this.x + nodeW / 2 - this.boxSize, this.y - nodeH / 2, this.boxSize, this.boxSize);

        if (this.taken) {
            return;
        }
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                this.children[i][j].draw()
            }
        }

    }
    getDepth() {
        let depth = 1;
        if (this.taken) {
            return depth;
        }
        let maxChildrenDepth = 0;
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                let childDepth = this.children[i][j].getDepth()
                if (childDepth > maxChildrenDepth) {
                    maxChildrenDepth = childDepth
                }
            }
        }
        return depth + maxChildrenDepth;
    }
    getWidth() {
        let width = 1;
        if (this.taken) {
            return width;
        }
        let childrenWidth = 0;
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                childrenWidth += this.children[i][j].getWidth()
            }
        }
        return Math.max(width, childrenWidth);
    }
    updatePosition(xOffset, yOffset, width, height) {
        if (width / 2 < nodeW && width != 0) {
            nodeW = width / 2;
        }
        if (height / 2 < nodeH && height != 0) {
            nodeH = height / 2;
        }
        this.targetx = xOffset + width / 2;
        this.targety = yOffset + height / this.getDepth() / 2;
        let deltaY = height / this.getDepth();
        let totalWidth = this.getWidth()
        let deltaX = 0
        this.x = (this.x) * 0.9 + (this.targetx * 0.1)
        this.y = (this.y) * 0.9 + (this.targety * 0.1)
        if (this.taken) {

            for (let i = 0; i < this.children.length; i++) {
                for (let j = 0; j < this.children[i].length; j++) {
                    let widthFactor = this.children[i][j].getWidth() / totalWidth
                    this.children[i][j].updatePosition(this.x, this.y, 0, 0)
                    deltaX += width * widthFactor
                }
            }
        } else {

            for (let i = 0; i < this.children.length; i++) {
                for (let j = 0; j < this.children[i].length; j++) {
                    let widthFactor = this.children[i][j].getWidth() / totalWidth
                    this.children[i][j].updatePosition(xOffset + deltaX, yOffset + deltaY, width * widthFactor, height - deltaY)
                    deltaX += width * widthFactor
                }
            }
        }
    }
    updateHoveredCourse() {
        if (mouseX > this.x - nodeW / 2 && mouseX < this.x + nodeW / 2 && mouseY > this.y - nodeH / 2 && mouseY < this.y + nodeH / 2) {
            hoveredCourse = this.id;
            return;
        }
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                this.children[i][j].updateHoveredCourse()
            }
        }
    }
    get taken() {
        return takenClasses.includes(this.id)
    }
}
function setupNodes() {
    takenClasses = []
    headNode = new ClassNode(selectedCourse.id)
    headNode.updatePosition(0, 0, canvas.width, canvas.height)

}