import { makeAutoObservable, runInAction } from "mobx";
import { BlockStatus, BlockT,GameStatus,MinesObject,initParam } from "./types";

class BoardStore {
    blockArray: BlockT[][]= []
    minesObject:MinesObject  = {}
    gameStatus:GameStatus = 0
    clickTimes:number=0
    flagCount:number = 0
    constructor() {
        makeAutoObservable(this);
    }
    init = async({mineNumber, width, height}:initParam) => {

        await this.setBoard(height, width);
        await this.setMine(mineNumber, height, width);
        this.setNumber(width);
        runInAction(()=>{
            this.gameStatus = GameStatus.WaitForStart
            this.flagCount = mineNumber
        })
    }
    reset=()=>{
        this.blockArray= []
        this.minesObject  = {}
        this.gameStatus = 0
        this.clickTimes=0
        this.flagCount = 0
    }
    // 初始化表格
    setBoard = (height:number,width:number)=>{
        this.blockArray = Array.from({ length: height }, () => []);
        for(let i = 0; i < height; i++){      
            for(let j = 0; j < width; j++){
                this.blockArray[i][j] = { x:i, y:j, isOpen:false, blockStatus:BlockStatus.Block, text:'0'}
            }
        }
    }
    // 布置炸彈
    setMine = (mineNumber:number, width:number, height:number) => {
        const boardSize = width * height
        while(Object.keys(this.minesObject).length < mineNumber){
            const minePosition = Math.floor(Math.random() * boardSize)
            if(!this.minesObject[minePosition]){
                this.minesObject[minePosition] = true
            }
        }

    }
    setNumber=(width:number)=>{
        Object.keys(this.minesObject).forEach((position)=>{
            const minePosition = Number(position)
            const y = minePosition%width
            const x = (minePosition-y)/width

            for(let i = -1; i<=1; i++){
                for(let j = -1; j<=1; j++){
                    if (this.blockArray[x+i] && this.blockArray[x+i][y+j] ) {
                        let number = Number(this.blockArray[x+i][y+j].text)
                        number++
                        this.blockArray[x+i][y+j].text = String(number)
                    }
                }
            }
        })          
    }

    // 點擊左鍵
    leftClick = (x:number,y:number,width:number) => {
        if(this.gameStatus === GameStatus.WaitForStart){
            this.gameStatus = GameStatus.Playing
        }
        if(this.blockArray[x][y].blockStatus === BlockStatus.Flag) return
        this.checkLose(x,y,width)
        if(!this.blockArray[x][y].isOpen){
            this.blockArray[x][y].isOpen =true
            this.clickTimes++
            const revealOpen =(x:number,y:number)=>{
                const nearlyBlock = this.getNearlyBlock(x,y)
                nearlyBlock.forEach((data)=>{
                    if(this.minesObject[data.x * width + data.y]) return
                    if(!this.blockArray[data.x][data.y].isOpen){
                        this.clickTimes++
                    }
                    this.blockArray[data.x][data.y].isOpen = true
                    if(data.text ==='0') return revealOpen(data.x,data.y)
                })
            }
            revealOpen(x,y)
        }
        this.checkWin(width,this.blockArray.length)
    }
    leftDoubleClick = (x:number,y:number,width:number) => {
        const nearlyArray = this.getNearlyBlock(x, y);
        let flagCounter = 0;
        nearlyArray.forEach((data) => {
            if (data.blockStatus === BlockStatus.Flag) {
                flagCounter++;
            }
        });
        if (this.blockArray[x][y].text === flagCounter.toString()) {
            nearlyArray.forEach((data) => {
                if (data.blockStatus !== BlockStatus.Flag && !data.isOpen) {
                    data.isOpen = true;
                    this.checkLose(data.x, data.y, width);
                    runInAction(() => {
                        this.clickTimes++;
                    });
                    this.checkWin(width, this.blockArray.length);
                }
            });
        }
    }
    // 點擊右鍵
    rightClick = (x:number,y:number) =>{
        if(this.blockArray[x][y].blockStatus === BlockStatus.Block && !this.blockArray[x][y].isOpen && this.flagCount >= 1){
            this.flagCount--
            return this.blockArray[x][y].blockStatus = BlockStatus.Flag
        }
        if(this.blockArray[x][y].blockStatus === BlockStatus.Flag && !this.blockArray[x][y].isOpen){
            this.flagCount++
            return this.blockArray[x][y].blockStatus = BlockStatus.Block
        }
    }
    checkWin =(width:number,height:number)=>{
        if(width * height - Object.keys(this.minesObject).length === this.clickTimes){
            this.gameStatus = GameStatus.Win
            this.showAllMine(width)
        }
    }
    checkLose=(x:number,y:number,width:number)=>{
        if(this.minesObject[x * width + y]){
            this.gameStatus = GameStatus.Lose
            this.showAllMine(width)
        }
    }
    showAllMine=(width:number)=>{
        Object.keys(this.minesObject).forEach((position)=>{
            const positionNumber = Number(position)
            const y = positionNumber%width
            const x = (positionNumber-y)/width
            this.blockArray[x][y].isOpen= true
        })
    }
    getNearlyBlock=(x:number,y:number)=>{
        const array = []
        for(let i = -1; i<=1; i++){
           for(let j = -1; j<=1; j++){
                if(this.blockArray[x+i] && this.blockArray[x+i][y+j] && !this.blockArray[x+i][y+j].isOpen && !(x + i === x && y + j === y) ){
                    array.push(this.blockArray[x+i][y+j])
                }
            }
        }
        return array
    }
}

const store = new BoardStore();
export default store;