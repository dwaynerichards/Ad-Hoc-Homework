/*
Tasks:
✓ Validate data entry (age is required and > 0, relationship is required)
✓ Add people to a growing household list
✓ Remove a previously added person from the list
✓ Display the household list in the HTML as it is modified
✓ Serialize the household as JSON upon form submission as a fake trip to the server
*/

(function(){

//our list of household members
var members = [];

//store commonly accessed DOM elements
var addButton = document.getElementsByClassName("add")[0];
var submitButton = document.getElementsByTagName("button")[1]; // not ideal. TODO: add class/id to submit button
var ageInput = document.getElementsByName("age")[0];
var relSelect = document.getElementsByName("rel")[0];
var smokerBox = document.getElementsByName("smoker")[0];
var debug = document.getElementsByClassName("debug")[0];
var display = document.getElementsByClassName("household")[0];



//helper functions
function show(elem) {
    elem.style.display = "initial";
}
function hide(elem) {
    elem.style.display = "none";
}


//create elements we need but that are not in the HTML
//-> error messages but default them to hidden
function addErrorMessageTo(message, addTo) {
    var error = document.createElement("span");
    error.appendChild(document.createTextNode(message));
    error.style = "color:red; margin-left: 20px";
    hide(error);
    addTo.parentElement.appendChild(error);
    return error;
}
var ageError = addErrorMessageTo("Age is required and must be a positive number", ageInput);
var relError = addErrorMessageTo("Relationship is required", relSelect);

//-> Div to show successful submission
var successMessage = document.createElement("div");
successMessage.appendChild(document.createTextNode("Your Household has been submitted. You may continue editing and submitting this household."));
successMessage.style = "color: green";
hide(successMessage);
display.parentElement.insertBefore(successMessage, display);



//functions responding to user actions

function getInputData() {
    return {
        age: parseInt(ageInput.value),
        rel: relSelect.value,
        smoker: smokerBox.checked
    };
}

function clearForm() {
    ageInput.value = null;
    relSelect.value = "";
    smokerBox.checked = false;
}

function clearErrors() {
    hide(ageError);
    hide(relError);
}

function validateData(data) {
    var valid = true;
    if(!data.age || data.age <= 0) {
        valid = false;
        show(ageError);
    }
    if(!data.rel || data.rel == "") {
        valid = false;
        show(relError);
    }
    return valid;
}

function updateMembersDisplay() {
    var listDisplay = "<ul>";
    for(var i = 0; i < members.length; i++) {
        var member = members[i];
        listDisplay += "<li> Age: " + member.age + ", Relationship: " + member.rel + ", smoker: " + (member.smoker ? "yes" : "no");
        listDisplay += "<br> <button onclick='householdBuilder.removeMember(" + i + ")'> Remove </button> </li>";
    }
    listDisplay += "</ul>";
    display.innerHTML = listDisplay;
}

window.householdBuilder = {};
window.householdBuilder.removeMember = function(index) {
    members.splice(index, 1);
    updateMembersDisplay();
};

//Click listeners for add and submit buttons

addButton.onclick = function(event) {
    clearErrors();
    //get household member data and try to validate it.
    var member = getInputData();
    if(validateData(member)) {
        //if successful, add the memeber to our display and clear the form
        members.push(member);
        updateMembersDisplay();
        clearForm();
    }
    //don't let the form do submit, etc.
    event.preventDefault();
};

//When submitting, show JSON data that would be submitted to API in debug element
//TODO: Change to use real API, promises, etc.
submitButton.onclick = function(event) {
    debug.innerHTML = JSON.stringify(members);
    show(debug);
    show(successMessage);
    //don't let the form do submit, etc.
    event.preventDefault();
};

})();