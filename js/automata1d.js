function Automaton(options) {
    let running = false
    let breeder = -1

    this.startBreeding = function () {
        let lastGeneration = null
        for (let i = 0; i < options.generations; i++) {
            lastGeneration = breedNextGeneration(lastGeneration)
            options.render(lastGeneration)
        }
        if (options.continuous) {
            running = true
            breeder = setInterval(function () {
                if (running) {
                    lastGeneration = breedNextGeneration(lastGeneration)
                    options.removeFirst()
                    options.render(lastGeneration)
                }
                else {
                    clearInterval(breeder)
                    breeder = -1
                }
            }, 50)
        }
    }

    this.stopBreeding = function () {
        running = false
    }

    function breedNextGeneration(lastGeneration) {
        if (!lastGeneration)
            if (options.randomize)
                return getRandomCells(options.cells)
            else
                return toggleCenter(options.cells)
        else {
            let generation = []
            for (let i = 0; i < lastGeneration.length; i++) {
                let center = lastGeneration[i];
                let left = !i ? lastGeneration[lastGeneration.length - 1] : lastGeneration[i - 1]
                let right = i === lastGeneration.length - 1 ? lastGeneration[0] : lastGeneration[i + 1]
                let genes = '' + left + center + right
                let cell = options.rules[genes] ? 1 : 0
                generation.push(cell)
            }
            return generation
        }
    }

    function getRandomCells(cells) {
        let row = []
        for (let i = 0; i < cells; i++)
            row.push(Math.round(Math.random()))
        return row
    }

    function toggleCenter(cells) {
        let row = new Array(cells).fill(0)
        let center = Math.round(cells / 2)
        row[center] = 1
        return row
    }
}

function renderRow(cellSize, row) {
    let div = document.createElement('div')
    div.className = 'row'
    document.querySelector('.board').appendChild(div)
    for (let i = 0; i < row.length; i++) {
        let cell = document.createElement('div');
        cell.className = row[i] ? 'cell active' : 'cell inactive'
        cell.style['font-size'] = cellSize + 'px'
        cell.style['line-height'] = cellSize + 'px'
        cell.style['width'] = cellSize + 'px'
        cell.style['height'] = cellSize + 'px'
        div.appendChild(cell)
    }
}

function removeFirstRow() {
    let board = document.querySelector('.board')
    board.removeChild(board.firstChild)
}

function getBoardSize() {
    let height = document.querySelector('.board').clientHeight
    let width = document.querySelector('.board').offsetWidth
    return { height: height, width: width }
}

function generateBoard() {
    if (board !== null)
        board.stopBreeding()
    document.querySelector('.board').innerHTML = null

    let size = getBoardSize()
    const cellSize = parseInt(document.getElementById('cellsize').value)
    const ruleNumber = parseInt(document.getElementById('rule').value)
    const continuous = document.querySelector('input[name="mode"]:checked').value.toString().toLowerCase() === 'true';
    const randomize = document.querySelector('input[name="randomize"]').checked;

    let rule = []
    for (let i = 0; i < 8; i++)
        rule.push(((ruleNumber & 255) >> i) & 1)

    let options = {
        generations: Math.floor(size.height / cellSize),
        cells: Math.floor(size.width / cellSize),
        render: renderRow.bind(null, cellSize),
        randomize: randomize,
        continuous: continuous,
        removeFirst: removeFirstRow,
        rules: {
            '111': rule[7],
            '110': rule[6],
            '101': rule[5],
            '100': rule[4],
            '011': rule[3],
            '010': rule[2],
            '001': rule[1],
            '000': rule[0]
        }
    }

    document.querySelector('.board').innerHTML = ''
    board = new Automaton(options)
    board.startBreeding()
    if (continuous)
        document.getElementById('options').classList.add('running')
}

function stopAutomata() {
    board.stopBreeding()
    document.getElementById('options').classList.remove('running')
}

// UI Handling
function checkGenerationMode() {
    const continuous = document.querySelector('input[name="mode"]:checked').value.toString().toLowerCase() === 'true';
    if (continuous)
        document.getElementById('options').classList.add('endless')
    else
        document.getElementById('options').classList.remove('endless')
}

let board = null