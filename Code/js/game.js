// Modified from https://arghac14.github.io/Minesweeper/

var components = {
  num_of_rows: localStorage.getItem("gridSize"),
  num_of_cols: localStorage.getItem("gridSize"),
  num_of_bombs: 11,
  wickets: localStorage.getItem("wicketNum"),
  fall_of_wickets: [0],
  bomb: "../images/stumps.png",
  flag: "🚩",
  alive: true,
  colors: {
    1: "blue",
    2: "green",
    3: "red",
    4: "purple",
    5: "maroon",
    6: "turquoise",
    7: "black",
    8: "grey",
  },
  score: 0,
  streak: 0,
  max_streak: 0,
  reset_time: 1000,
  cells_clicked: 0,
};

function genRandomCell(nrows, ncols) {
  const i = Math.floor(Math.random() * nrows);
  const j = Math.floor(Math.random() * ncols);

  return [i, j];
}

function placeBombs() {
  var rows = [];

  for (let i = 0; i < components.num_of_rows; i++) {
    var emptyRow = [];

    for (let j = 0; j < components.num_of_cols; j++) {
      emptyRow.push(0);
    }

    rows.push(emptyRow);
  }

  let cells = new Set();
  while (cells.size < components.num_of_bombs) {
    const cell = genRandomCell(components.num_of_rows, components.num_of_cols);
    const cellString = cell.toString(); // Convert cell array to string for Set comparison
    cells.add(cellString);
  }

  cells.forEach((cellString) => {
    const cell = cellString.split(",").map(Number); // Convert cell string back to array

    // add bombs in these cells
    rows[cell[0]][cell[1]] = 1;
  });

  console.log(cells);

  components.bombs = rows;
}

function cellID(i, j) {
  return "cell-" + i + "-" + j;
}

function createField() {
  var table, row, td, i, j;
  table = document.createElement("table");

  for (i = 0; i < components.num_of_rows; i++) {
    row = document.createElement("tr");
    for (j = 0; j < components.num_of_cols; j++) {
      td = document.createElement("td");
      td.id = cellID(i, j);
      row.appendChild(td);
      addCellListeners(td, i, j);
    }
    table.appendChild(row);
  }
  document.getElementById("field").appendChild(table);
}

function createStats() {
  var table = document.createElement("table");
  const stats = generateStats();

  row = document.createElement("tr");
  th1 = document.createElement("th");
  th1.textContent = "Player Name";
  row.appendChild(th1);
  th2 = document.createElement("th");
  th2.textContent = "Runs Scored";
  row.appendChild(th2);
  table.appendChild(row);

  for (let i = 0; i < stats.length; i++) {
    row = document.createElement("tr");
    td1 = document.createElement("td");
    td1.textContent = "Player " + (i + 1);
    row.appendChild(td1);
    td2 = document.createElement("td");
    td2.textContent = stats[i];
    row.appendChild(td2);

    table.appendChild(row);
  }
  document.getElementById("stats").appendChild(table);

  var now = new Date().getTime();
  var distance = now - components.game_start;
  var seconds = Math.floor((distance % (1000 * 60)) / 1000);
  var lost_wickets = localStorage.getItem("wicketNum") - components.wickets;

  document.getElementById("statsintro").textContent = "Game Stats : Scored " + components.score + "/" + lost_wickets + " in " + seconds + "s";
  
}

function addCellListeners(td, i, j) {
  td.addEventListener("mousedown", function (event) {
    if (!components.alive) {
      return;
    }
    components.mousewhiches += event.which;
    if (event.which === 3) {
      return;
    }
    if (this.flagged) {
      return;
    }
    this.style.backgroundColor = "lightGrey";
  });

  td.addEventListener("mouseup", function (event) {
    if (!components.alive) {
      return;
    }

    if (this.clicked && components.mousewhiches == 4) {
      // performMassClick(this, i, j);
    }

    components.mousewhiches = 0;

    if (event.which === 3) {
      if (this.clicked) {
        return;
      }
      if (this.flagged) {
        this.flagged = false;
        this.textContent = "";
      } else {
        this.flagged = true;
        this.textContent = components.flag;
      }

      event.preventDefault();
      event.stopPropagation();

      return false;
    } else {
      handleCellClick(this, i, j);
    }
  });

  td.oncontextmenu = function () {
    return false;
  };
}

function getScore() {
  //console.log(components.last_click);
  const curr_date = new Date();
  //console.log(curr_date - components.last_click);
  const time_from_last = curr_date - components.last_click;

  if (time_from_last > components.reset_time) {
    components.streak = 0;
  } else {
    components.streak += 1;
  }

  components.max_streak = Math.max(components.max_streak, components.streak);

  components.last_click = curr_date;

  const arr = [1, 1, 2, 2, 3, 3, 4, 4];
  if (components.streak < arr.length) return arr[components.streak];
  else return 6;
}

function writeScore(prefix) {
  var lost_wickets = localStorage.getItem("wicketNum") - components.wickets;
  document.getElementById("total").innerHTML =
    prefix + components.score + " / " + lost_wickets;
}

function generateStats() {
  let player_scores = [];
  for (let i = 1; i < components.fall_of_wickets.length; i++) {
    player_scores.push(
      components.fall_of_wickets[i] - components.fall_of_wickets[i - 1]
    );
  }
  console.log(player_scores);
  return player_scores;
}

function handleCellClick(cell, i, j) {
  if (!components.alive) {
    return;
  }

  if (cell.flagged) {
    return;
  }

  if (cell.clicked) {
    return;
  }

  cell.clicked = true;

  if (components.bombs[i][j]) {
    cell.style.backgroundColor = "red";
    cell.innerHTML =
      "<img src='../images/stumps.png' style='width: 60%; height: 60%; object-fit: contain;'>";
    //console.log("wickst " + components.wickets);
    components.fall_of_wickets.push(components.score);
    components.wickets--;
    if (components.wickets <= 0) {
      gameOver("out");
    } else {
      writeScore("");
    }
  } else {
    cell.style.backgroundColor = "lightGrey";
    num_of_bombs = adjacentBombs(i, j);
    cell.style.color = components.colors[num_of_bombs];
    cell.textContent = num_of_bombs;

    const runs_scored = getScore();
    components.score += runs_scored;
    splashAddedRuns(runs_scored);

    //console.log(components.streak + ", " + runs_scored);
    writeScore("");
    document.getElementById("streak").innerHTML = components.streak;

    components.cells_clicked += 1;
    if (
      components.cells_clicked + components.num_of_bombs ==
      components.num_of_cols * components.num_of_rows
    )
      gameOver("end");
  }
}

function splashAddedRuns(runs_scored) {
  const textDiv = document.createElement("p");
  const targetDiv = document.getElementById("added");

  targetDiv.appendChild(textDiv);
  textDiv.style.transition = "opacity 1s ease";

  textDiv.innerHTML = "+ " + runs_scored;

  setTimeout(() => {
    textDiv.style.opacity = 0;
  }, 1000);

  setTimeout(() => {
    targetDiv.removeChild(textDiv);
  }, 1000);
}

function adjacentBombs(row, col) {
  var i, j, num_of_bombs;
  num_of_bombs = 0;

  for (i = -1; i < 2; i++) {
    for (j = -1; j < 2; j++) {
      if (components.bombs[row + i] && components.bombs[row + i][col + j]) {
        num_of_bombs++;
      }
    }
  }
  return num_of_bombs;
}

function adjacentFlags(row, col) {
  var i, j, num_flags;
  num_flags = 0;

  for (i = -1; i < 2; i++) {
    for (j = -1; j < 2; j++) {
      cell = document.getElementById(cellID(row + i, col + j));
      if (!!cell && cell.flagged) {
        num_flags++;
      }
    }
  }
  return num_flags;
}

function startGame() {
  placeBombs();
  createField();
  writeScore("");
}

function gameOver(ending) {
  components.alive = false;
  clearInterval(sectimer);
  writeScore("Game over : ");

  if (ending === "end") {
    startConfetti();
    setTimeout(stopConfetti, 5000);
  } else if (ending === "time") {
    document.getElementById("timer").innerHTML = "Time Up!";
  }

  document.getElementById("lost").style.display = "block";
  createStats();
}

function reload() {
  window.location.reload();
}

window.addEventListener("load", function () {
  document.getElementById("lost").style.display = "none";
  startGame();
  const date = new Date();
  components.last_click = date;
  components.game_start = date;
  console.log(date);
  var checkboxValue = localStorage.getItem("gameMode");
  console.log(checkboxValue);
  var gridSize = localStorage.getItem("gridSize");
  console.log(gridSize);
  document.documentElement.style.setProperty("--grid-size", gridSize);
  var wicketNum = localStorage.getItem("wicketNum");
  console.log(wicketNum);
});

var sectimer = setInterval(function () {
  var now = new Date().getTime();
  var distance = now - components.game_start;

  var seconds = 60 - Math.floor((distance % (1000 * 60)) / 1000);

  if (seconds >= 10) {
    document.getElementById("timer").innerHTML = "00:" + seconds;
  } else if (seconds > 0 && seconds < 10) {
    document.getElementById("timer").innerHTML = "00:0" + seconds;
  } else {
    gameOver("time");
  }
}, 500);
