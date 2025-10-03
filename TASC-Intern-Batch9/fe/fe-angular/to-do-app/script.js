
let allToDoElement = document.querySelectorAll("li div h3")

var toDoList = Array.from(allToDoElement).map(item => item.textContent.trim())

const ul = document.querySelector(".to-do-selection ul");
const pendingTasks = document.querySelector("#pending-tasks")
let input = document.querySelector("#to-do-input")
const validateValue = document.querySelector(".input-validating")
let index = 0;
function addEvent() {
    let value = input.value.trim();
    
    if(value.length == 0) {
        validateValue.textContent = "Thông tin không được để trống";
        return;
    }

    if(toDoList.includes(value)) {
        validateValue.textContent = "Công việc đã tồn tại";
        return;
    }

    console.log(toDoList.includes(value))

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
    validateValue.textContent = "";
}

function clearAll() {
    toDoList = [];
    pendingTasks.textContent = toDoList.length;
    ul.innerHTML = "";
}

function searchToDo(search) {
    const allLi = ul.querySelectorAll("li");
    allLi.forEach(li => {
        const text = li.querySelector("h3").textContent.toLowerCase();
        if (text.includes(search.toLowerCase())) {
            li.style.display = ""; 
        } else {
            li.style.display = "none";
        }
    });
}



document.querySelector("#input-search").addEventListener("keyup", (event) => {
    searchToDo(event.target.value.trim());
})
document.querySelector(".add-button").addEventListener("click", addEvent)
document.querySelector(".clear-all-button").addEventListener("click", clearAll)
document.querySelector("#to-do-input").addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
        addEvent();
    }
})