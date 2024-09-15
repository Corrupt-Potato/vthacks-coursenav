let nodeW = 180;
let nodeH = 90;
/**
 * Stores a class node
 * @version 1.2
 * @author T.J. Nickerson
 */
class ClassNode {
    /**
     * 
     * @param {String} id The Course ID representing the class. Example: MATH 1226
     */
    constructor(id) {
        this.id = id;
        this.x = canvas.width / 2;
        this.y = canvas.height / 2;
        this.margin = 8;
        this.boxSize = 0;
        this.sat = []
        this.visible = true;
        //setup children
        this.children = []

        if (courseDict[id] === undefined) {
            console.log(id)
            return;
        }
        let prereqs = courseDict[this.id].prereq
        for (let i = 0; i < prereqs.length; i++) {
            this.children.push([])
            this.sat.push(false)
            let valid = true;
            for (let j = 0; j < prereqs[i].length; j++) {
                if ((prereqs[i][j]) in courseDict) {
                    this.children[this.children.length - 1].push(new ClassNode(prereqs[i][j]))
                }else{
                    valid = false;
                }
            }
            if (!valid) {
                this.children.pop()
                this.sat.pop()
            }
        }
    }
    /**
     * Updates the satisfiability array of the class node
     */
    updateSAT() {
        this.sat = []
        for (let i = 0; i < this.children.length; i++) {
            let SAT = true;
            for (let j = 0; j < this.children[i].length; j++) {
                if (!this.children[i][j].taken) {
                    SAT = false;
                }
            }
            this.sat.push(SAT)
        }
    }
    /**
     * Sets the visibility of the given node 
     * @param {Boolean} vis if the node should be visible
     */
    setVisible(vis) {
        this.visible = vis;
        this.setChildVisibility(vis)
    }
    /**
     * Sets the child visibility
     * @param {Boolean} vis if the children nodes should be visible
     */
    setChildVisibility(vis) {
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                this.children[i][j].setVisible(vis);
            }
        }
    }
    /**
     * Draws the lines to child nodes
     */
    drawLines() {
        let avgXL = []
        let minYL = []
        for (let i = 0; i < this.children.length; i++) {
            let avgX = 0
            let minY = this.children[i][0].y
            for (let j = 0; j < this.children[i].length; j++) {
                avgX += this.children[i][j].x;
                minY = Math.min(minY, this.children[i][j].y)
            }
            avgX /= this.children[i].length
            avgXL.push(avgX)
            minYL.push(minY)
        }
        ctx.lineCap = "round";
        let minClauses = this.getMinSatWidth()

        for (let i = 0; i < this.children.length; i++) {
            let clauseX = avgXL[i];
            let clauseY = (minYL[i] + this.y) / 2
            if (!this.sat.includes(true) || (this.sat[i] && minClauses == this.children[i].length)) {
                drawLine(clauseX, clauseY, this.x, this.y, Math.min(nodeW / 2, nodeH) / 5)
                for (let j = 0; j < this.children[i].length; j++) {
                    let child = this.children[i][j]
                    drawLine(clauseX, clauseY, child.x, child.y, Math.min(nodeW / 2, nodeH) / 5)
                }
                for (let j = 0; j < this.children[i].length; j++) {
                    let child = this.children[i][j]
                    if (child.taken) {
                        drawLine(clauseX, clauseY, child.x, child.y, Math.min(nodeW / 2, nodeH) / 10, "#0f0")
                    }
                }

                if (this.sat[i]) {
                    drawLine(clauseX, clauseY, this.x, this.y, Math.min(nodeW / 2, nodeH) / 10, "#0f0")
                }
                if (this.sat.includes(true)) {
                    break;
                }
            }
        }
    }
    /**
     * Draws the node and all elements regarding it
     */
    draw() {
        //draw a line to all children
        if (!this.taken) {
            this.drawLines();
        }
        //
        drawRect(this.x - nodeW / 2 - this.margin / 2, this.y - nodeH / 2 - this.margin / 2, nodeW + this.margin, nodeH + this.margin)
        let fillStyle = "#E5751F";
        if (hoveredCourse == this.id) {
            fillStyle = "#b0b0b0"
        }
        drawRect(this.x - nodeW / 2, this.y - nodeH / 2, nodeW, nodeH, fillStyle)

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

        this.updateSAT();
        if (!this.taken) {
            if (this.sat.includes(true)) {
                let cWidth = this.getMinSatWidth()
                let alreadyShown = false
                for (let i = 0; i < this.children.length; i++) {
                    if (cWidth == this.children[i].length && this.sat[i] && !alreadyShown) {
                        for (let j = 0; j < this.children[i].length; j++) {
                            this.children[i][j].draw()
                            this.children[i][j].setVisible(true)
                        }
                        alreadyShown = true;
                    } else {
                        for (let j = 0; j < this.children[i].length; j++) {
                            this.children[i][j].setVisible(false)
                        }
                    }
                }
            } else {
                this.setChildVisibility(true)
                for (let i = 0; i < this.children.length; i++) {
                    for (let j = 0; j < this.children[i].length; j++) {
                        this.children[i][j].draw()
                    }
                }
            }
        } else {
            this.setChildVisibility(false)
        }
    }
    getDepth() {
        let depth = 1;
        if (this.taken) {
            return depth;
        }
        let maxChildrenDepth = 0;
        this.updateSAT();
        if (!this.sat.includes(true)) {
            for (let i = 0; i < this.children.length; i++) {
                for (let j = 0; j < this.children[i].length; j++) {
                    let childDepth = this.children[i][j].getDepth()
                    if (childDepth > maxChildrenDepth) {
                        maxChildrenDepth = childDepth
                    }
                }
            }
        } else {
            maxChildrenDepth = 1
        }
        return depth + maxChildrenDepth;
    }
    getWidth() {
        let width = 1;
        if (this.taken) {
            return width;
        }
        let childrenWidth = 0;
        this.updateSAT();
        if (this.sat.includes(true)) {
            for (let i = 0; i < this.children.length; i++) {
                if (this.sat[i] && (this.children[i].length < childrenWidth || childrenWidth == 0)) {
                    childrenWidth = this.children[i].length
                }
            }
        } else {
            for (let i = 0; i < this.children.length; i++) {
                for (let j = 0; j < this.children[i].length; j++) {
                    childrenWidth += this.children[i][j].getWidth()
                }
            }
        }
        return Math.max(width, childrenWidth);
    }
    getMinSatWidth() {
        let width = 0;
        for (let i = 0; i < this.children.length; i++) {
            if (this.sat[i] && (this.children[i].length < width || width == 0)) {
                width = this.children[i].length
            }
        }
        return width
    }
    updatePosition(xOffset, yOffset, width, height) {
        if (width * 2 / 3 < nodeW && width != 0) {
            nodeW = width * 2 / 3;
        }
        if (height * 2 / 3 < nodeH && height != 0) {
            nodeH = height * 2 / 3;
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
        } else if (this.sat.includes(true)) {
            let cWidth = this.getMinSatWidth();
            for (let i = 0; i < this.children.length; i++) {
                if (this.sat[i] && cWidth == this.children[i].length) {
                    for (let j = 0; j < this.children[i].length; j++) {
                        let widthFactor = this.children[i][j].getWidth() / totalWidth
                        this.children[i][j].updatePosition(xOffset + deltaX, yOffset + deltaY, width * widthFactor, height - deltaY)
                        deltaX += width * widthFactor
                    }
                    break;
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
        if (!this.visible) {
            return;
        }
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