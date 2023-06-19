// Modified from https://www.w3schools.com/howto/howto_js_rangeslider.asp 

var slider1 = document.getElementById("gridRange");
var output1 = document.getElementById("gridSize");

// Retrieve the value from localStorage or use the default value
const gridSize = localStorage.getItem("gridSize");
slider1.value = gridSize !== null ? gridSize : slider1.value;
output1.innerHTML = slider1.value; // Display the slider1 value

// Update the current slider1 value (each time you drag the slider1 handle)
slider1.oninput = function () {
  output1.innerHTML = this.value;
  localStorage.setItem("gridSize", this.value);
};

var slider2 = document.getElementById("wicketRange");
var output2 = document.getElementById("wicketNum");

// Retrieve the value from localStorage or use the default value
const wicketNum = localStorage.getItem("wicketNum");
slider2.value = wicketNum !== null ? wicketNum : slider2.value;
output2.innerHTML = slider2.value; // Display the slider2 value

// Update the current slider2 value (each time you drag the slider2 handle)
slider2.oninput = function () {
  output2.innerHTML = this.value;
  localStorage.setItem("wicketNum", this.value);
};
