console.log("💻 Workspace Loaded!");

const renameModal=document.getElementById("renameModal");
const renameInput=document.getElementById("renameInput");

let renameIndex=-1;

let files = [

{
    name:"main.cdx",
    icon:"📄",
    content:'say("Hello World")',
    folder:null
},

{
    name:"player.cdx",
    icon:"📄",
    content:"",
    folder:null
},

{
    name:"logo.png",
    icon:"🖼",
    content:"",
    folder:null
}

];

const commands = [

{
    icon:"🚀",
    name:"Launch Workspace",
    action:()=>openWorkspace()
},

{
    icon:"📂",
    name:"Open Workspace",
    action:()=>openWorkspace()
},

{
    icon:"✨",
    name:"New Workspace",
    action:()=>openWorkspace()
},

{
    icon:"⚙",
    name:"Settings",
    action:()=>alert("Settings Coming Soon!")
},

{
    icon:"🤖",
    name:"Ask AI",
    action:()=>alert("AI Coming Soon!")
},

{
    icon:"📖",
    name:"Documentation",
    action:()=>alert("Documentation Coming Soon!")
},

{
    icon:"🕒",
    name:"Timeline",
    action:()=>alert("Timeline Coming Soon!")
}

];

let folders = [];

function getWorkspaces(){

    return JSON.parse(
        localStorage.getItem("codeosWorkspaces")
        || "[]"
    );

}

function saveWorkspace(name){

    let list = getWorkspaces();

    let project = {

        name,
        files,
        folders,
        openTabs,
        selectedFile,
        date: Date.now()

    };

    let existing = list.findIndex(
        w => w.name === name
    );

    if(existing >= 0){

        list[existing] = project;

    }
    else{

        list.push(project);

    }

    localStorage.setItem(
        "codeosWorkspaces",
        JSON.stringify(list)
    );

}

const fileList=document.getElementById("fileList");

let hoveringFolder = false;

let selectedFile = 0;

let openTabs=[0];

const editor = document.querySelector("textarea");

const imagePreview=document.getElementById("imagePreview");

editor.addEventListener("input",()=>{

    files[selectedFile].content = editor.value;

});

const tab = document.querySelector(".tab");

const tabs=document.getElementById("tabs");

const saveProjectBtn=document.getElementById("saveProjectBtn");
const loadProjectBtn=document.getElementById("loadProjectBtn");
const projectPicker=document.getElementById("projectPicker");

function renderFiles(){

    fileList.innerHTML="";

    folders.forEach(folder=>{

    const div=document.createElement("div");

    div.className="file";

    div.innerHTML=`${folder.open ? "📂" : "📁"} ${folder.name}`;

    div.onclick=()=>{

        folder.open=!folder.open;

        renderFiles();

    };

    div.addEventListener("dragover",(e)=>{

    e.preventDefault();

    hoveringFolder = true;

});

div.addEventListener("dragleave",()=>{

    hoveringFolder = false;

});

div.addEventListener("drop",(e)=>{

    e.preventDefault();

    if(window.draggedFile===undefined) return;

    files[window.draggedFile].folder=folder.name;

    renderFiles();

});

    fileList.appendChild(div);

    if(folder.open){

        const rootDrop=document.createElement("div");

rootDrop.style.height="8px";

rootDrop.style.marginBottom="6px";

rootDrop.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

rootDrop.addEventListener("drop",()=>{

    if(window.draggedFile===undefined) return;

    files[window.draggedFile].folder=null;

    hoveringFolder = false;

    window.draggedFile=undefined;

    renderFiles();

});

fileList.appendChild(rootDrop);

    files.forEach((file,index)=>{

        if(file.folder!==folder.name) return;

        const child=document.createElement("div");

child.className="file";

child.draggable=true;

child.dataset.index=index;

child.addEventListener("dragstart",()=>{

    window.draggedFile=index;

});

        child.style.paddingLeft="28px";

        if(index===selectedFile){

            child.classList.add("active");

        }

        child.innerHTML=`${file.icon} ${file.name}`;

        child.onclick=()=>{

            selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

            if(file.icon==="🖼"){

    editor.style.display="none";

    showImage(file.content);

}else{

    imagePreview.style.display="none";
    editor.style.display="block";

    editor.value=file.content;

}

            renderFiles();

        };

        child.ondblclick=()=>{

            renameIndex=index;

            const dot=file.name.lastIndexOf(".");

            renameInput.value=file.name.substring(0,dot);

            renameModal.classList.remove("hidden");

            renameInput.focus();

            renameInput.select();

        };

        fileList.appendChild(child);

    });

}

});

    files.forEach((file,index)=>{

        if(file.folder!==null){

    return;

}

        const div=document.createElement("div");

div.className="file";

div.draggable=true;

div.dataset.index=index;

div.addEventListener("dragstart",()=>{

    window.draggedFile=index;

});

        if(index===selectedFile){

            div.classList.add("active");

        }

        div.innerHTML=`${file.icon} ${file.name}`;

        div.onclick=()=>{

    selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

    if(files[index].icon==="🖼"){

    editor.style.display="none";

    showImage(files[index].content);

}else{

    imagePreview.style.display="none";

    editor.style.display="block";

    editor.value=files[index].content;

}

    renderFiles();

};

div.ondblclick=()=>{

    renameIndex=index;

    const dot=files[index].name.lastIndexOf(".");

    renameInput.value=files[index].name.substring(0,dot);

    renameModal.classList.remove("hidden");

    renameInput.focus();

    renameInput.select();

};

        fileList.appendChild(div);

    });

}

renderFiles();

const modal=document.getElementById("fileModal");
const fileName=document.getElementById("fileName");
const fileType=document.getElementById("fileType");
const imagePicker=document.getElementById("imagePicker");

let uploadedImage=null;

imagePicker.addEventListener("change",()=>{

    const file=imagePicker.files[0];

    if(!file){

        fileType.value="cdx";

        return;

    }

    uploadedImage=file;

    fileName.value=file.name.replace(/\.[^/.]+$/,"");

});

document.getElementById("newFileBtn").onclick=()=>{

    modal.classList.remove("hidden");

    fileName.value="";

    fileName.focus();

};

document.getElementById("cancelFile").onclick=()=>{

    modal.classList.add("hidden");

};


document.getElementById("createFile").onclick=()=>{

    const name=fileName.value.trim();

    if(!name) return;

    const type=fileType.value;

    let icon="📄";
    let content="";

    if(type==="image"){

    if(!uploadedImage){

        alert("Choose an image first.");

        return;

    }

    files.push({

        name:uploadedImage.name,

        icon:"🖼",

        folder:null,

        content:URL.createObjectURL(uploadedImage)

    });

    uploadedImage=null;

    modal.classList.add("hidden");

    renderFiles();

    return;

}

    switch(type){

        case "html":
            content=`<!DOCTYPE html>
<html>
<head>

</head>
<body>

</body>
</html>`;
            break;

        case "css":
            content=`body{

}`;
            break;

        case "js":
            content=`console.log("Hello World");`;
            break;

        case "json":
            content=`{

}`;
            break;

        case "cdx":
            content=`say("Hello World")`;
            break;

    }

    if(type==="html") icon="🌐";
    if(type==="css") icon="🎨";
    if(type==="js") icon="🟨";
    if(type==="json") icon="🟫";

    files.push({

        name:name+"."+type,

        icon,

        content,

        folder:null

    });

    renderFiles();

    modal.classList.add("hidden");

};

// =============================
// RESIZABLE EXPLORER
// =============================

const explorer = document.querySelector(".explorer");
const divider = document.querySelector(".divider");

let resizing = false;

divider.addEventListener("mousedown", () => {

    resizing = true;

    document.body.style.cursor = "ew-resize";

});

document.addEventListener("mousemove", (e) => {

    if(!resizing) return;

    let width = e.clientX;

    width = Math.max(180, width);
    width = Math.min(500, width);

    explorer.style.width = width + "px";

});

document.addEventListener("mouseup", () => {

    resizing = false;

    document.body.style.cursor = "default";

});

// Open the first file on startup

editor.value = files[selectedFile].content;

const lessonCode = localStorage.getItem("lessonWorkspaceCode");

if(lessonCode){

    files.push({

        name: "Lesson.cdx",

        icon: "📄",

        content: lessonCode,

        folder: null

    });

    selectedFile = files.length - 1;

    if(!openTabs.includes(selectedFile)){
        openTabs.push(selectedFile);
    }

    editor.value = lessonCode;

    renderFiles();
    renderTabs();

    localStorage.removeItem("lessonWorkspaceCode");

}

document.getElementById("deleteFileBtn").onclick=()=>{

    if(files.length===1){

        alert("You must have at least one file.");

        return;

    }

    const confirmed=confirm(`Delete "${files[selectedFile].name}"?`);

    if(!confirmed) return;

    files.splice(selectedFile,1);

    if(selectedFile>=files.length){

        selectedFile=files.length-1;

    }

    editor.value=files[selectedFile].content;

    renderFiles();

};

document.getElementById("cancelRename").onclick=()=>{

    renameModal.classList.add("hidden");

};

document.getElementById("homeButton").onclick = () => {

    window.location.href = "index.html";

};

document.addEventListener("keydown",(e)=>{

    // Open Palette
    if(e.ctrlKey && e.shiftKey && e.key.toLowerCase()==="k"){

        e.preventDefault();

        overlay.classList.add("show");

        selectedIndex = 0;

        input.value = "";

        renderCommands();

        input.focus();

        return;

    }

    // Ignore everything if palette isn't open
    if(!overlay.classList.contains("show")) return;

    const filtered = commands.filter(c =>
        c.name.toLowerCase().includes(input.value.toLowerCase())
    );

    if(e.key==="Escape"){

        overlay.classList.remove("show");

        input.value="";

        return;

    }

    if(e.key==="ArrowDown"){

        e.preventDefault();

        selectedIndex = (selectedIndex + 1) % filtered.length;

        renderCommands(input.value);

    }

    if(e.key==="ArrowUp"){

        e.preventDefault();

        selectedIndex--;

        if(selectedIndex < 0){

            selectedIndex = filtered.length - 1;

        }

        renderCommands(input.value);

    }

    if(e.key==="Enter"){

        e.preventDefault();

        filtered[selectedIndex].action();

        overlay.classList.remove("show");

        input.value="";

    }

});

document.getElementById("confirmRename").onclick=renameFile;

renameInput.addEventListener("keydown",(e)=>{

    if(e.key==="Enter"){

        renameFile();

    }

    if(e.key==="Escape"){

        renameModal.classList.add("hidden");

    }

});

function renameFile(){

    if(renameIndex===-1) return;

    const newName=renameInput.value.trim();

    if(!newName) return;

    const dot=files[renameIndex].name.lastIndexOf(".");

    const extension=files[renameIndex].name.substring(dot);

    files[renameIndex].name=newName+extension;

    renameModal.classList.add("hidden");

    renderFiles();

}

document.getElementById("newFolderBtn").onclick=()=>{

    const name=prompt("Folder name");

    if(!name) return;

    folders.push({

    name:name.trim(),

    open:true

});

    renderFiles();

};

document.getElementById("moveFileBtn").onclick=()=>{

    if(folders.length===0){

        alert("Create a folder first.");

        return;

    }

    const names=folders.map(f=>f.name).join("\n");

    const choice=prompt(
`Move "${files[selectedFile].name}" to:

${names}

(Type the folder name exactly)`
    );

    if(!choice) return;

    const folder=folders.find(f=>
        f.name.toLowerCase()===choice.toLowerCase()
    );

    if(!folder){

        alert("Folder not found.");

        return;

    }

    files[selectedFile].folder=folder.name;

    renderFiles();

};

fileList.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

fileList.addEventListener("drop",()=>{

    if(window.draggedFile===undefined) return;

    if(hoveringFolder) return;

    files[window.draggedFile].folder = null;

    window.draggedFile = undefined;

    renderFiles();

    renderTabs();

});

function renderTabs(){

    tabs.innerHTML="";

    openTabs.forEach(index=>{

        const t=document.createElement("div");

        t.draggable=true;

        t.className="tab";

t.addEventListener("dragstart",()=>{

    window.draggedTab=index;

});

t.addEventListener("dragover",(e)=>{

    e.preventDefault();

});

t.addEventListener("drop",()=>{

    if(window.draggedTab===undefined) return;

    const from=openTabs.indexOf(window.draggedTab);
    const to=openTabs.indexOf(index);

    if(from===-1 || to===-1) return;

    const moving=openTabs.splice(from,1)[0];

    openTabs.splice(to,0,moving);

    renderTabs();

});

t.addEventListener("dragend",()=>{

    window.draggedTab=undefined;

});

        if(index===selectedFile){

            t.classList.add("active");

        }

        t.innerHTML=`
            ${files[index].icon}
            ${files[index].name}
            <span class="tabClose">✕</span>
        `;

        t.onclick=()=>{

            selectedFile=index;

if(!openTabs.includes(index)){

    openTabs.push(index);

}

renderTabs();

            editor.value=files[index].content;

            renderFiles();  

        };

        t.querySelector(".tabClose").onclick=(e)=>{

            e.stopPropagation();

            if(openTabs.length===1) return;

            openTabs=openTabs.filter(i=>i!==index);

            if(selectedFile===index){

                selectedFile=openTabs[0];

                editor.value=files[selectedFile].content;

            }

            renderTabs();

        };

        tabs.appendChild(t);

    });

}

fileType.addEventListener("change",()=>{

    if(fileType.value==="image"){

        imagePicker.click();

    }

});

function showImage(src){

    imagePreview.src=src;

    imagePreview.style.display="block";

}

saveProjectBtn.onclick=()=>{

    const project={

        files,
        folders,
        openTabs,
        selectedFile

    };

    const json=JSON.stringify(project,null,2);

    const blob=new Blob([json],{

        type:"application/json"

    });

    const a=document.createElement("a");

    a.href=URL.createObjectURL(blob);

    a.download="MyProject.codeos";

    a.click();

    URL.revokeObjectURL(a.href);

};

loadProjectBtn.onclick=()=>{

    projectPicker.click();

};

projectPicker.addEventListener("change",(e)=>{

    const file=e.target.files[0];

    if(!file) return;

    const reader=new FileReader();

    reader.onload=()=>{

        const project=JSON.parse(reader.result);

        files=project.files||[];

        folders=project.folders||[];

        openTabs=project.openTabs||[0];

        selectedFile=project.selectedFile||0;

        editor.value=files[selectedFile].content;

        renderFiles();

        renderTabs();

    };

    reader.readAsText(file);

});

function compileCode(code){

    let lines = code.split("\n");

    let compiled="";


    lines.forEach(line=>{


        line=line.trim();


        if(line==="") return;


        // comments

        if(line.startsWith("//")){

            return;

        }


        // say()

        if(line.startsWith("say(")){


            compiled += line + ";\n";


        }


    });


    return compiled;

}

document.getElementById("runBtn").onclick=()=>{

    console.log(editor.value);

    localStorage.setItem(
        "codeosProgram",
        editor.value
    );


    window.location.href="run.html";

};
