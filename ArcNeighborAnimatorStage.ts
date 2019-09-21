const backColor : string = "#bdbdbd"
const nodes : number = 5
const arcs : number = 4
const scGap : number = 0.01
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#673AB7"
const w : number = window.innerWidth
const h : number = window.innerHeight
const rFactor : number = 3

class ScaleUtil {

    static maxScale(scale : number, i : number, n : number) : number {
        return Math.max(0, scale - i / n)
    }

    static divideScale(scale : number, i : number, n : number) : number {
        return Math.min(1 / n, ScaleUtil.maxScale(scale, i, n)) * n
    }
}

class DrawingUtil {

    static drawLine(context : CanvasRenderingContext2D, x1 : number, y1 : number, x2 : number, y2 : number) {
        if (x1 == x2 && y1 == y2) {
            return
        }
        context.beginPath()
        context.moveTo(x1, y1)
        context.lineTo(x2, y2)
        context.stroke()
    }

    static drawCircle(context : CanvasRenderingContext2D, x : number, y : number, r : number, sc : number) {
        context.save()
        context.translate(x, y)
        context.beginPath()
        context.moveTo(0, 0)
        for (var i = 0; i <= 360 * sc; i++) {
            const xr : number = r * Math.cos(i * Math.PI / 180)
            const yr : number = r * Math.sin(i * Math.PI / 180)
            context.lineTo(xr, yr)
        }
        context.fill()
        context.restore()
    }

    static drawArcNeighbors(context : CanvasRenderingContext2D, size : number, scale : number) {
        const sc1 : number = ScaleUtil.divideScale(scale, 0, 3)
        const sc2 : number = ScaleUtil.divideScale(scale, 1, 3)
        const sc3 : number = ScaleUtil.divideScale(scale, 2, 3)
        const r : number = size / rFactor
        context.save()
        DrawingUtil.drawCircle(context, 0, 0, size / rFactor, sc1)
        for (var i = 0; i < arcs; i++) {
            context.save()
            context.rotate(Math.PI / 2 * i)
            DrawingUtil.drawCircle(context, size, 0, r, sc3)
            DrawingUtil.drawLine(context, 0, 0, 0, size * sc2)
            context.restore()
        }
        context.restore()
    }

    static drawANANode(context : CanvasRenderingContext2D, i : number, scale : number) {
        const gap : number = w / (nodes + 1)
        const size : number = gap / sizeFactor
        context.strokeStyle = foreColor
        context.fillStyle = foreColor
        context.lineCap = 'round'
        context.lineWidth = Math.min(w, h) / strokeFactor
        context.save()
        context.translate(gap * (i + 1), h / 2)
        DrawingUtil.drawArcNeighbors(context, size, scale)
        context.restore()
    }
}

class ArcNeighborAnimatorStage {

    context : CanvasRenderingContext2D
    canvas : HTMLCanvasElement = document.createElement('canvas')
    renderer : Renderer = new Renderer()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
        this.renderer.render(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.renderer.handleTap(() => {
                this.render()
            })
        }
    }

    static init() {
        const stage : ArcNeighborAnimatorStage = new ArcNeighborAnimatorStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {

    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += scGap * this.dir
        console.log(this.scale)
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb()
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {

    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class ANANode {

    next : ANANode
    prev : ANANode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new ANANode(this.i + 1)
            this.next.prev = this
        }
    }

    draw(context : CanvasRenderingContext2D) {
        DrawingUtil.drawANANode(context, this.i, this.state.scale)
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }

    getNext(dir : number, cb : Function) : ANANode {
        var curr : ANANode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }
}

class ArcNeighborAnimator {

    curr : ANANode = new ANANode(0)
    dir : number = 1

    draw(context : CanvasRenderingContext2D) {
        this.curr.draw(context)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}

class Renderer {

    ana : ArcNeighborAnimator = new ArcNeighborAnimator()
    animator : Animator = new Animator()

    render(context : CanvasRenderingContext2D) {
        this.ana.draw(context)
    }

    handleTap(cb : Function) {
        this.ana.startUpdating(() => {
            this.animator.start(() => {
                cb()
                this.ana.update(() => {
                    this.animator.stop()
                    cb()
                })
            })
        })
    }
}
