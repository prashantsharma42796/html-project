// ===== School Bus Route Management System =====
// All data is kept in arrays inside "data" and saved in the browser (localStorage), so it survives a refresh.

// ---------- 1. DATA ----------
var data = {
  drivers: [
    { id: 1, name: "Ramesh Kumar", phone: "9876543210" },
    { id: 2, name: "Sunil Singh", phone: "9123456780" }
  ],
  buses: [
    { id: 1, number: "JH-09-1234", capacity: 30, driverId: 1, status: "Active" },
    { id: 2, number: "JH-09-5678", capacity: 25, driverId: 2, status: "Active" }
  ],
  routes: [
    { id: 1, name: "Green Park Route", busId: 1, startTime: "07:00", endTime: "07:50", dropTime: "14:30" },
    { id: 2, name: "Lake View Route", busId: 2, startTime: "07:10", endTime: "08:00", dropTime: "14:45" }
  ],
  stops: [
    { id: 1, name: "Green Park Gate", routeId: 1, time: "07:10" },
    { id: 2, name: "Market Road", routeId: 1, time: "07:25" },
    { id: 3, name: "Lake View Chowk", routeId: 2, time: "07:20" }
  ],
  students: [
    { id: 1, name: "Aman", grade: "8", stopId: 1 },
    { id: 2, name: "Riya", grade: "6", stopId: 2 },
    { id: 3, name: "Kabir", grade: "9", stopId: 3 }
  ]
};

var nextId = 100;       // id for the next new item
var STORAGE_KEY = "schoolBusData";   // name under which everything is saved in the browser
var editingId = null;   // id of the item being edited (null means we are adding a new one)
var pages = ["dashboard", "routes", "stops", "buses", "drivers", "students", "schedule"];

// Which form box holds which saved value (used by Edit and by clearing the form)
var formFields = {
  drivers:  { driverName: "name", driverPhone: "phone" },
  buses:    { busNumber: "number", busCapacity: "capacity", busDriver: "driverId", busStatus: "status" },
  routes:   { routeName: "name", routeBus: "busId", routeStart: "startTime", routeEnd: "endTime", routeDrop: "dropTime" },
  stops:    { stopName: "name", stopRoute: "routeId", stopTime: "time" },
  students: { studentName: "name", studentClass: "grade", studentStop: "stopId" }
};

// Save everything (data + next id) in the browser
function saveToBrowser() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ data: data, nextId: nextId }));
  } catch (e) {
    console.log("Could not save data:", e);
  }
}

// Load the saved data (if any) when the page opens
function loadFromBrowser() {
  try {
    var saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      var parsed = JSON.parse(saved);
      if (parsed.data && parsed.data.routes) {
        data = parsed.data;
        nextId = parsed.nextId || nextId;
      }
    }
  } catch (e) {
    console.log("Could not load data:", e);
  }
}

// ---------- 2. HELPER FUNCTIONS ----------

// Read the text typed in an input box
function getValue(id) {
  return document.getElementById(id).value.trim();
}

// Find one item in a list using its id
function findItem(list, id) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id == id) {
      return list[i];
    }
  }
  return null;
}

// Get a field (like name) of an item, or "Not assigned" if the item does not exist
function nameOf(list, id, field) {
  var item = findItem(list, id);
  return item ? item[field] : "Not assigned";
}

// Count the students of a route (skipId is the student being edited, so we do not count him twice)
function countStudents(routeId, skipId) {
  var count = 0;
  data.students.forEach(s => {
    var stop = findItem(data.stops, s.stopId);
    if (stop && stop.routeId == routeId && s.id != skipId) {
      count++;
    }
  });
  return count;
}

// Change "14:30" into "2:30 PM" (we still save the 24 hour time)
function formatTime(time) {
  if (!time) return "Not set";
  var parts = time.split(":");
  var hour = Number(parts[0]);
  var ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  if (hour == 0) hour = 12;
  return hour + ":" + parts[1] + " " + ampm;
}

// Show one page and hide the others
function showPage(pageName) {
  for (var i = 0; i < pages.length; i++) {
    document.getElementById(pages[i]).style.display = "none";
  }
  document.getElementById(pageName).style.display = "block";
}

// Empty the form boxes of a list
function clearFields(listName) {
  var fields = formFields[listName];
  for (var fieldId in fields) {
    document.getElementById(fieldId).value = "";
  }
  document.getElementById("busStatus").value = "Active";
}

// Edit button: copy the saved values into the form and remember the id
function editItem(listName, id) {
  var item = findItem(data[listName], id);
  var fields = formFields[listName];
  for (var fieldId in fields) {
    document.getElementById(fieldId).value = item[fields[fieldId]];
  }
  editingId = id;
  alert("The details are now in the form. Change them and press Save.");
}

// Save button: replace the old item if editing, otherwise add a new item
function saveItem(listName, item) {
  if (editingId != null) {
    item.id = editingId;
    for (var i = 0; i < data[listName].length; i++) {
      if (data[listName][i].id == editingId) {
        data[listName][i] = item;
      }
    }
  } else {
    item.id = nextId;
    nextId++;
    data[listName].push(item);
  }
  editingId = null;
  clearFields(listName);
  showAll();
}

// Delete an item
function removeItem(listName, id) {
  if (confirm("Are you sure you want to delete this?") == false) {
    return;
  }
  data[listName] = data[listName].filter(item => item.id != id);
  if (listName == "routes") {
    data.stops = data.stops.filter(s => s.routeId != id);   // remove the route's stops too
  }
  editingId = null;
  showAll();
}



function addDriver() {
  var name = getValue("driverName");
  var phone = getValue("driverPhone");
  if (name == "" || phone.length != 10) {
    alert("Enter the driver name and a 10 digit phone number.");
    return;
  }
  saveItem("drivers", { name: name, phone: phone });
}

function addBus() {
  var number = getValue("busNumber");
  var capacity = Number(getValue("busCapacity"));
  var driverId = getValue("busDriver");
  if (number == "" || capacity < 1 || driverId == "") {
    alert("Enter the bus number, capacity (1 or more) and choose a driver.");
    return;
  }
  saveItem("buses", { number: number, capacity: capacity, driverId: driverId, status: getValue("busStatus") });
}

function addRoute() {
  var name = getValue("routeName");
  var busId = getValue("routeBus");
  var start = getValue("routeStart");
  var end = getValue("routeEnd");
  var drop = getValue("routeDrop");
  if (name == "" || busId == "" || start == "" || end == "" || drop == "") {
    alert("Please fill in all the route details.");
    return;
  }
  
  var sameBus = data.routes.filter(r => r.busId == busId && r.id != editingId);
  if (sameBus.length > 0) {
    alert("This bus is already used on another route.");
    return;
  }
  saveItem("routes", { name: name, busId: busId, startTime: start, endTime: end, dropTime: drop });
}

function addStop() {
  var name = getValue("stopName");
  var routeId = getValue("stopRoute");
  var time = getValue("stopTime");
  if (name == "" || routeId == "" || time == "") {
    alert("Please fill in all the stop details.");
    return;
  }
  saveItem("stops", { name: name, routeId: routeId, time: time });
}

function addStudent() {
  var name = getValue("studentName");
  var grade = getValue("studentClass");
  var stopId = getValue("studentStop");
  if (name == "" || grade == "" || stopId == "") {
    alert("Please fill in all the student details.");
    return;
  }
  // capacity check: find the stop, then its route, then its bus
  var stop = findItem(data.stops, stopId);
  var route = findItem(data.routes, stop.routeId);
  var bus = route ? findItem(data.buses, route.busId) : null;
  if (bus == null) {
    alert("This stop's route has no bus yet.");
    return;
  }
  if (countStudents(route.id, editingId) >= bus.capacity) {
    alert("This bus is full (" + bus.capacity + " seats). Choose a stop on another route.");
    return;
  }
  saveItem("students", { name: name, grade: grade, stopId: stopId });
}


function buttons(listName, id) {
  return '<button class="edit" onclick="editItem(\'' + listName + '\', ' + id + ')">Edit</button> ' +
    '<button class="del" onclick="removeItem(\'' + listName + '\', ' + id + ')">Delete</button>';
}


function setRows(id, html, columns) {
  if (html == "") {
    html = '<tr><td colspan="' + columns + '" class="empty">Nothing added yet.</td></tr>';
  }
  document.getElementById(id).innerHTML = html;
}


function fillSelect(id, list, field, firstText) {
  var html = '<option value="">' + firstText + "</option>";
  list.forEach(item => {
    html += '<option value="' + item.id + '">' + item[field] + "</option>";
  });
  document.getElementById(id).innerHTML = html;
}

function showDropdowns() {
  
  var activeBuses = data.buses.filter(b => b.status == "Active");

  
  var stopChoices = [];
  data.stops.forEach(s => {
    stopChoices.push({ id: s.id, label: nameOf(data.routes, s.routeId, "name") + " - " + s.name });
  });

  fillSelect("busDriver", data.drivers, "name", "-- Select driver --");
  fillSelect("routeBus", activeBuses, "number", "-- Select bus --");
  fillSelect("stopRoute", data.routes, "name", "-- Select route --");
  fillSelect("studentStop", stopChoices, "label", "-- Select stop --");
}

function showDrivers() {
  var html = "";
  data.drivers.forEach(d => {
    html += "<tr><td>" + d.name + "</td><td>" + d.phone + "</td><td>" + buttons("drivers", d.id) + "</td></tr>";
  });
  setRows("driverRows", html, 3);
}

function showBuses() {
  var html = "";
  data.buses.forEach(b => {
    // seats used = students of the route that uses this bus
    var used = 0;
    data.routes.forEach(r => {
      if (r.busId == b.id) used = countStudents(r.id, null);
    });
    html += "<tr><td>" + b.number + "</td><td>" + b.capacity + "</td><td>" +
      nameOf(data.drivers, b.driverId, "name") + "</td><td>" + b.status + "</td><td>" +
      used + " / " + b.capacity + "</td><td>" + buttons("buses", b.id) + "</td></tr>";
  });
  setRows("busRows", html, 6);
}

function showRoutes() {
  var html = "";
  data.routes.forEach(r => {
    var stopCount = data.stops.filter(s => s.routeId == r.id).length;
    html += "<tr><td>" + r.name + "</td><td>" + nameOf(data.buses, r.busId, "number") + "</td><td>" +
      formatTime(r.startTime) + "</td><td>" + formatTime(r.endTime) + "</td><td>" +
      formatTime(r.dropTime) + "</td><td>" + stopCount + "</td><td>" + buttons("routes", r.id) + "</td></tr>";
  });
  setRows("routeRows", html, 7);
}

function showStops() {
  var html = "";
  data.stops.forEach(s => {
    html += "<tr><td>" + s.name + "</td><td>" + nameOf(data.routes, s.routeId, "name") + "</td><td>" +
      formatTime(s.time) + "</td><td>" + buttons("stops", s.id) + "</td></tr>";
  });
  setRows("stopRows", html, 4);
}

function showStudents() {
  var html = "";
  data.students.forEach(s => {
    var stop = findItem(data.stops, s.stopId);
    var routeName = stop ? nameOf(data.routes, stop.routeId, "name") : "Not assigned";
    html += "<tr><td>" + s.name + "</td><td>" + s.grade + "</td><td>" + routeName + "</td><td>" +
      nameOf(data.stops, s.stopId, "name") + "</td><td>" + buttons("students", s.id) + "</td></tr>";
  });
  setRows("studentRows", html, 5);
}

function showSchedule() {
  var html = "";
  data.routes.forEach(r => {
    
    var routeStops = data.stops.filter(s => s.routeId == r.id);
    routeStops.sort((a, b) => (a.time > b.time ? 1 : -1));

    html += "<h3>" + r.name + "</h3><p>Bus: " + nameOf(data.buses, r.busId, "number") +
      "<br>Morning: departs " + formatTime(r.startTime) + ", reaches school " + formatTime(r.endTime) +
      "<br>Afternoon: leaves school " + formatTime(r.dropTime) + "</p><ol>";
    routeStops.forEach(s => {
      html += "<li>" + formatTime(s.time) + " - " + s.name + "</li>";
    });
    if (routeStops.length == 0) {
      html += '<li class="empty">No stops added yet.</li>';
    }
    html += "</ol>";
  });
  if (html == "") {
    html = '<p class="empty">No routes added yet.</p>';
  }
  document.getElementById("scheduleList").innerHTML = html;
}

function showDashboard() {
  document.getElementById("statRows").innerHTML = "<tr><td>" + data.routes.length + "</td><td>" +
    data.stops.length + "</td><td>" + data.buses.length + "</td><td>" + data.drivers.length +
    "</td><td>" + data.students.length + "</td></tr>";

 
  var html = "";
  data.routes.forEach(r => {
    var bus = findItem(data.buses, r.busId);
    var capacity = bus ? bus.capacity : 0;
    var used = countStudents(r.id, null);
    var percent = capacity > 0 ? used / capacity * 100 : 0;
    if (percent > 100) percent = 100;
    var barClass = percent == 100 ? "fullfill" : "fill";
    var driver = bus ? nameOf(data.drivers, bus.driverId, "name") : "Not assigned";

    html += "<tr><td>" + r.name + "</td><td>" + nameOf(data.buses, r.busId, "number") + "</td><td>" +
      driver + "</td><td>" + formatTime(r.startTime) + "</td><td>" + used + " / " + capacity +
      '<div class="bar"><div class="' + barClass + '" style="width:' + percent + '%"></div></div></td></tr>';
  });
  setRows("dashRows", html, 5);
}


function showAll() {
  saveToBrowser();
  showDashboard();
  showRoutes();
  showStops();
  showBuses();
  showDrivers();
  showStudents();
  showSchedule();
  showDropdowns();
}


loadFromBrowser();
showAll();
showPage("dashboard");
