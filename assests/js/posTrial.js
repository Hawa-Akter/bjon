const { remote, app, ipcRenderer, ipcMain } = require("electron");
const BrowserWindow = remote.BrowserWindow;

const test = document.getElementById("test");

const myList = document.getElementById("myItemList");
const my_list = document.getElementById("myList");
const category_ul = document.getElementById("category_ul");
const customer_type_dropdown = document.getElementById("c_type_dropdown");
const food_varient_table = document.getElementById("food_varient_datas");
const food_availability_table = document.getElementById(
  "food_availability_datas"
);
const allList = document.getElementById("allCategoryByList");
const all_food_category_list = document.getElementById("food_category_list");

document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("allFoodInfo");
});
ipcRenderer.on("replySentALlFoods", (evt, results) => {
  console.log("Foodssssssssss", results);
});

//different tabs
function pos(evt, posSytem) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(posSytem).style.display = "block";
  evt.currentTarget.className += " active";
}

function getFoodId(id) {
  console.log("Getting food id", id);

  let win = new BrowserWindow({
    height: 400,
    width: 820,
    maximizable: false,

    title: "Select food and addon",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
  });
  win.loadFile("assests/html/cartProduct.html");

  win.webContents.openDevTools();
  const knex = require("knex")({
    client: "sqlite3",
    connection: {
      filename: "./database.sqlite",
    },
    useNullAsDefault: true,
  });

  let addTocartItems = knex("foods")
    .join("varient", "varient.food_id", "foods.id")

    .select("foods.product_name", "varient.name", "varient.price")
    .where("foods.id", id);
  //console.log("CartItems", addTocartItems);
  addTocartItems.then(function (rows) {
    win.webContents.send("foodVarientResultSent", rows);
    console.log("Food rows", rows);
  });

  // win.setMenuBarVisibility(false);

  let addOnItems = knex("add_on")
    .join("add_on_assign", "add_on_assign.add_on_id", "add_on.id")
    .join("foods", "add_on_assign.food_id", "foods.id")
    .distinct("add_on.add_on_name")
    .select("add_on.add_on_name", "add_on.price")
    .where("foods.id", id);

  addOnItems.then(function (rows) {
    win.webContents.send("addOnResultSent", rows);
  });

  win.on("closed", () => {
    win = null;
  });
}

function getCategoryId(id) {
  console.log("Getting the category id", id);
  ipcRenderer.send("eachCategoryIdSent", id);
}

ipcRenderer.on("replySentFromEachCategoryId", (evt, results) => {
  all_food_category_list.innerHTML = "";
  var div = "";

  results.forEach((x) => {
    div += `
    <div class="card col-md-3" style="width: 12rem; height: 170px; margin: 4px;">
    <img src="${x.product_image}" height="100" width="206" class="card-img-top">
      <div><p><a href="#" style="text-decoration:none; color:black; text-align: center;" id=${x.id} onclick = {getFoodId(${x.id})}>
      ${x.product_name}
        </a></p>
      </div>
    </div>`;
  });

  all_food_category_list.innerHTML += div;
});

// Getting customer type dropdown data
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("customerTypeDropdownLoaded");
});

ipcRenderer.on("replySentCustomerTypeDropdown", function (evt, results) {
  customer_type_dropdown.innerHTML = "";
  var option = "";

  results.forEach((x) => {
    option += '<option value="3">' + x.type_name + "</option>";
  });

  customer_type_dropdown.innerHTML += option;
});

//loading the data when window loaded
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("allCategoryListLoaded");
});

ipcRenderer.on("replySentAllCategory", function (evt, results) {
  all_food_category_list.innerHTML = "";

  var div = "";

  results.forEach((x) => {
    div +=
      '<div class="card col-md-3" style="width: 12rem; height: 170px; margin: 4px;">';
    div +=
      '<img src="' +
      x.product_image +
      '" height="100" width="206" class="card-img-top">';
    div += '<div class="card-body">';
    div +=
      `<p><a href="#" style="text-decoration:none; color:black; text-align: center;" id=${x.id} onclick = {getFoodId(${x.id})}>` +
      x.product_name +
      "</a></p>";
    div += "</div>";

    div += "</div>";
  });

  all_food_category_list.innerHTML += div;
});

//getting category data when clicked all
allList.addEventListener("click", () => {
  ipcRenderer.send("allCategoryListLoaded");
});

ipcRenderer.on("replySentAllCategory", function (evt, results) {
  all_food_category_list.innerHTML = "";

  var div = "";

  results.forEach((x) => {
    div += `
    <div class="col-md-3 d-flex">
      <div class="card  flex-fill w-100 ">
      <img src="${x.product_image}" height="100" width="206" class="card-img-top">
        <div class="card-body">
          <p><a href="#" style="text-decoration:none; color:black; text-align: center;" id=${x.id} onclick = {getFoodId(${x.id})}> 
          ${x.product_name}
          </a></p>
        </div>
      </div> 
      </div>
      `;
  });

  all_food_category_list.innerHTML += div;
});

//creating dynamic category in new order result page
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("newOrderCategoryItemLoaded");
});

ipcRenderer.on("replySentCategoryListResult", function (event, results) {
  // Create an unordered list
  var list = document.createElement("ul");

  // Create a list item for each wizard
  // and append it to the list
  results.forEach(function (result) {
    var li = document.createElement("li");
    var a = document.createElement("a");

    a.textContent = result.name;
    li.appendChild(a);
    li.onclick = () => getCategoryId(result.id);

    list.appendChild(li);
  });

  // Inject into the DOM
  myList.appendChild(list);
});

// ipcRenderer.on("replySentCategoryListResult", function (event, results) {
//   category_ul.innerHTML = "";
//   var li = "";

//   results.forEach((x) => {
//     // li +=
//     //   `<li class="list-group-item" name = ${x.id} onclick = {getCategoryId(${x.id})}>` +
//     //   x.name +
//     //   "</li>";

//     li +=
//       `<li class="list-group-item" name = ${x.id} onclick = ()=>id=x.id>` +
//       x.name +
//       "</li>";
//   });
//   category_ul.innerHTML += li;
// });

//foods varient result
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("foodVarientWindow");
});
ipcRenderer.on("resultSentFromFoodsVarient", function (event, result) {
  food_varient_table.innerHTML = "";
  var tr = "";
  result.forEach((x) => {
    tr += "<tr>";
    tr +=
      "<td>" +
      x.id +
      "</td>" +
      "<td>" +
      x.name +
      "</td>" +
      "<td>" +
      x.product_name +
      "</td>";
    tr += "</tr>";
  });
  food_varient_table.innerHTML += tr;
});

//foods availability result
document.addEventListener("DOMContentLoaded", () => {
  ipcRenderer.send("foodAvailabilityWindow");
});
ipcRenderer.on("resultSentFromFoodAvailability", function (event, result) {
  food_availability_table.innerHTML = "";
  var tr = "";
  result.forEach((x) => {
    tr += "<tr>";
    tr +=
      "<td>" +
      x.id +
      "</td>" +
      "<td>" +
      x.product_name +
      "</td>" +
      "<td>" +
      x.avail_day +
      "</td>" +
      "<td>" +
      x.avail_time +
      "</td>";
    tr += "</tr>";
  });
  food_availability_table.innerHTML += tr;
  food_availability_table.style.fontSize = "12px";
});
