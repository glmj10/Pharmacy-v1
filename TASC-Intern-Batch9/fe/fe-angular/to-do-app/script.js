
let allToDoElement = document.querySelectorAll("li div h3")

var toDoList = Array.from(allToDoElement).map(item => item.textContent.trim())

const ul = document.querySelector(".to-do-selection ul");
const pendingTasks = document.querySelector("#pending-tasks")

function addEvent() {
    let input = document.querySelector("#to-do-input")
    let value = input.value.trim();
    toDoList.push(input.value.trim());


    const li = document.createElement("li");
    li.setAttribute("data-index", 0);

    const textDiv = document.createElement("div");
    const h3 = document.createElement("h3");
    h3.textContent = value;

    textDiv.appendChild(h3);

    const delDiv = document.createElement("div");
    delDiv.classList.add("delete-button");
    
    const icon = document.createElement("i");
    icon.classList.add("fa-solid", "fa-trash");

    delDiv.appendChild(icon);
    delDiv.addEventListener("click", () => {
        toDoList.splice(parseInt(li.getAttribute("data-index")), 1)
        li.remove();
        pendingTasks.textContent = toDoList.length;
    });

    li.appendChild(textDiv);
    li.appendChild(delDiv);

    ul.prepend(li);

    pendingTasks.textContent = toDoList.length;
    input.value = ""
}

function clearAll() {
    toDoList = [];
    pendingTasks.textContent = toDoList.length;
    ul.innerHTML = "";
}

document.querySelector(".add-button").addEventListener("click", addEvent)
document.querySelector(".clear-all-button").addEventListener("click", clearAll)