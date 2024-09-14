class ClassNode {
    constructor(id) {
        this.id = id;
        this.w = 180;
        this.h = 90;
        this.margin = 8;
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
        ctx.strokeStyle = "#000000"
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                let child = this.children[i][j]
                ctx.beginPath()
                ctx.moveTo(this.x,this.y)
                ctx.lineTo(child.x,child.y)
                ctx.stroke()
            }
        }
        ctx.fillStyle = "#000000";
        ctx.fillRect(this.x - this.w / 2 - this.margin / 2, this.y - this.h / 2 - this.margin / 2, this.w + this.margin, this.h + this.margin)
        ctx.fillStyle = "#E5751F";
        ctx.fillRect(this.x - this.w / 2, this.y - this.h / 2, this.w, this.h)

        ctx.fillStyle = "#000000";
        ctx.font = `${10}px Arial`
        ctx.textAlign = "center";
        ctx.fillText(this.id, this.x, this.y)

        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                this.children[i][j].draw()
            }
        }
    }
    getDepth() {
        this.depth = 1;
        let maxChildrenDepth = 0;
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                let childDepth = this.children[i][j].getDepth()
                if (childDepth > maxChildrenDepth) {
                    maxChildrenDepth = childDepth
                }
            }
        }
        return this.depth + maxChildrenDepth;
    }
    getWidth() {
        this.width = 1;
        let childrenWidth = 0;
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                childrenWidth += this.children[i][j].getWidth()
            }
        }
        return Math.max(this.width, childrenWidth);
    }
    updatePosition(xOffset, yOffset, width, height) {
        this.x = xOffset + width / 2;
        this.y = yOffset + height / this.getDepth() / 2;
        let deltaY = height / this.getDepth();
        let totalWidth = this.getWidth()
        let deltaX = 0
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                let widthFactor = this.children[i][j].getWidth() / totalWidth
                this.children[i][j].updatePosition(xOffset + deltaX, yOffset + deltaY, width * widthFactor, height - deltaY)
                deltaX += width * widthFactor
            }
        }
    }
    getDescendants() {
        let desc = []
        for (let i = 0; i < this.children.length; i++) {
            for (let j = 0; j < this.children[i].length; j++) {
                desc.push(this.children[i][j])
                let secondGen = this.children[i][j].getDescendants()
                for (let k = 0; k < secondGen.length; k++) {
                    desc.push(secondGen[k])
                }
            }
        }
        return desc;
    }
}
let headNode
function setupNodes() {
    headNode = new ClassNode(selectedCourse.id)
    headNode.updatePosition(0, 0, canvas.width, canvas.height)
}