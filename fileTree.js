class folder {
    constructor(previous, content, name) {
        this.name = name;
        this.previous = previous;
        this.folders = [];
        this.content = content;
    }
}

class fileTree {
    constructor(treeObject) {

        this.currentFolder = new folder(
            null,
            treeObject.root.content,
            treeObject.root.name,
        );

        var fileStack = [];
        fileStack.push(this.currentFolder);

        while (fileStack.length > 0) {

            let currentDir = fileStack.pop();


            for (var i = 0; i < currentDir.content.length; i++) {

                if (Object.hasOwn(currentDir.content[i], "content")) {
                    var newfolder = new folder(
                        currentDir,
                        currentDir.content[i].content,
                        currentDir.content[i].name,
                    );

                    currentDir.folders.push(newfolder);
                    fileStack.push(newfolder);
                }
            }
        }
    }

    jumpUp() {
        if (this.currentFolder.previous != null) {
            this.currentFolder = this.currentFolder.previous;
            return;
        }
        console.log("Can't jump");
    }

    jumpTo(folderName) {
        let found = this.currentFolder.folders.find(element => element.name == folderName);
        if (found != null) {
            this.currentFolder = found;
            return true;
        }
        return false;
    }

    printDir() {
        for (var i = 0; i < this.currentFolder.content.length; i++) {
            console.log(this.currentFolder.content[i].name);
        }
    }
}