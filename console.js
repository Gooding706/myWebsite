const ignored = new Set([16, 91, 9, 18, 17, 37, 39, 27, 20, 3, 12, 21, 25, 28, 29, 33, 34, 35, 41, 42, 43, 44, 45]); //Keycodes to ignore, if I forgor one nothing breaks it might just confuse the user

const greeting = "Hello welcome to my website\n don't be intimidated this isn't a real console. I'm a big fan of retro computing so I built my website to \"mimic\" the unix shell. For a list of commands you can use to navigate this site type \"help\""; //custom greeting




function getPrefix(directoryName) {
    const username = "user"; //name of user
    const device = "Owen's-Portfolio"; //name of device
    return username + "@" + device + " " + directoryName + " % ";
}

var terminal = { lineText: "", directory: new fileTree(dirs), commandHistory: [], historyIndex: -1, prefix: getPrefix("~") };

var content = document.getElementById("Content");
var previousInput = document.getElementById("previous");


content.textContent = terminal.prefix;
addEventListener("keydown", writeKey)
printToConsole(greeting, previousInput);

function printToConsole(content, contentDiv, color = "white") {
    var split = content.split("\n");


    for (var i = 0; i < split.length; i++) {
        var line = document.createElement("h1");
        line.style.color = color;
        line.textContent = split[i];
        contentDiv.appendChild(line);
    }

}

function printLinkToConsole(content, contentDiv, link, color = "white") {
    var split = content.split("\n");


    for (var i = 0; i < split.length; i++) {
        var line = document.createElement("a");
        line.style.color = color;
        line.href = link;
        line.target = "_blank";
        line.textContent = split[i];
        contentDiv.appendChild(line);
    }

}

function printCmds() {
    printToConsole("Available Commands:", previousInput);
    printToConsole("help: displays available commands and their uses", previousInput);
    printToConsole("clear: clears the terminal's content", previousInput);
    printToConsole("ls: lists the current working directory", previousInput);
    printToConsole("cd [directory]: change to a given directory", previousInput);
}

function printDir() {
    let folderContent = terminal.directory.currentFolder.content;

    for (var i = 0; i < folderContent.length; i++) {
        if (Object.hasOwn(folderContent[i], "link")) {
            printLinkToConsole(folderContent[i].name, previousInput, folderContent[i].link, "#2970ff")
        } else {
            printToConsole(folderContent[i].name, previousInput, "DodgerBlue");
        }

    }
}

function changeDir(commandString) {
    if (commandString.length != 2) {
        printToConsole(`can't find directory "${commandString[1]}"`, previousInput, "Crimson");
        return;
    }

    let path = commandString[1].split("/");
    for (var i = 0; i < path.length; i++) {
        if (path[i] == "..") {
            terminal.directory.jumpUp();
        }
        else if (path[i] == "." || path[i] == "") {
            continue;
        } else {
            let response = terminal.directory.jumpTo(path[i]);
            if (!response) { printToConsole(`can't find directory "${commandString[1]}"`, previousInput, "Crimson"); }
        }
    }

    terminal.prefix = getPrefix(terminal.directory.currentFolder.name);
}

function parseLine(line) {
    let lowered = line.toLowerCase();

    let command = lowered.split(" ");


    switch (command[0]) {
        case "clear":
            previousInput.replaceChildren();
            break;
        case "help":
            printCmds();
            break;
        case "ls":
            printDir();
            break;
        case "cd":
            changeDir(command);
            break
        default:
            printToConsole(`command not found: \"${line}\"`, previousInput, "crimson");
    }

}

function arrowUp() {
    if (terminal.historyIndex > 0) {
        terminal.historyIndex--;
        terminal.lineText = terminal.commandHistory[terminal.historyIndex];
        content.textContent = terminal.prefix + terminal.lineText;
    }
    else if (terminal.historyIndex == 0) {
        terminal.historyIndex = terminal.commandHistory.length - 1;
        terminal.lineText = terminal.commandHistory[terminal.historyIndex];
        content.textContent = terminal.prefix + terminal.lineText;
    }
}

function arrowDown() {
    if (terminal.historyIndex < terminal.commandHistory.length - 1) {
        terminal.historyIndex++;
        terminal.lineText = terminal.commandHistory[terminal.historyIndex];
        content.textContent = terminal.prefix + terminal.lineText;
    }
    else if (terminal.historyIndex == terminal.commandHistory.length - 1) {
        terminal.lineText = "";
        content.textContent = terminal.prefix + terminal.lineText;
    }
}

function backspace()
{
    if (terminal.lineText.length > 0) {
        terminal.lineText = terminal.lineText.slice(0, terminal.lineText.length - 1);
        content.textContent = terminal.prefix + terminal.lineText;
    }
}

function enter()
{
    printToConsole(content.textContent, previousInput);
    terminal.commandHistory.push(terminal.lineText)
    parseLine(terminal.lineText);

    terminal.historyIndex = terminal.commandHistory.length;

    terminal.lineText = "";
    content.textContent = terminal.prefix;
}

function writeKey(key) {

    if (ignored.has(key.keyCode)) { return; }

    switch(key.keyCode)
    {
        case 38:
            arrowUp();
            break;
        case 40:
            arrowDown();
            break;
        case 8:
            backspace()
            break;
        case 13:
            enter()
            break;
        default:   
            content.textContent += `${key.key}`
            terminal.lineText += `${key.key}`;
            break;
    }
}