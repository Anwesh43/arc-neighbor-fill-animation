const backColor : string = "#bdbdbd"
const nodes : number = 5
const arcs : number = 4
const scGap : number = 0.01
const strokeFactor : number = 90
const sizeFactor : number = 2.9
const foreColor : string = "#673AB7"
const w : number = window.innerWidth
const h : number = window.innerHeight 

class ArcNeighborAnimatorStage {

    context : CanvasRenderingContext2D
    canvas : HTMLCanvasElement = document.createElement('canvas')

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = backColor
        this.context.fillRect(0, 0, w, h)
    }

    handleTap() {
        this.canvas.onmousedown = () => {

        }
    }

    static init() {
        const stage : ArcNeighborAnimatorStage = new ArcNeighborAnimatorStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}
