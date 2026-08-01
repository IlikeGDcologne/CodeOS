console.log("👾 CodeOS Runner Started");


const output = document.getElementById("output");


let code = localStorage.getItem("codeosProgram");

const loadingScreen = document.getElementById("loadingScreen");

const loadingFill = document.getElementById("loadingFill");


let variables = {};

const sprites = {};


const functions = {};



if(!code){

    output.style.display = "block";

    loadingScreen.style.display = "none";

    output.innerHTML = "😭 No program found";

}
else{

    boot();

}

async function boot(){

    loadingFill.style.width = "100%";

    await new Promise(resolve=>{

        setTimeout(resolve,2000);

    });

    loadingScreen.style.display = "none";

    output.style.display = "block";

    run(code);

}




async function run(code){


    output.style.display="block";


    let lines = code.split("\n");

    // 📚 Find all functions

// 📚 Scan functions

for(let i = 0; i < lines.length; i++){

    let line = lines[i].trim();

    if(line.startsWith("function ")){

        let name = line.substring(9).trim();

        let depth = 1;

        let end = i + 1;

        while(depth > 0){

            end++;

            let current = lines[end].trim();

            if(
                current.startsWith("function ") ||
                current.startsWith("if ") ||
                current.startsWith("repeat ") ||
                current.startsWith("while ") ||
                current === "forever"
            ){
                depth++;
            }

            if(current === "end"){
                depth--;
            }

        }

        functions[name] = {

            start: i + 1,
            end: end

        };

    }

}

let skipMode = false;
let ifRunning = false;
let ifPassed = false;
let elseChain = false;
let loopRunning = true;



    for(let i = 0; i < lines.length; i++){

    let line = lines[i];


        line=line.trim();


        if(line==="") continue;

        // 📦 FUNCTION DEFINITION

if(line.startsWith("function ")){

    while(lines[i].trim() !== "end"){
        i++;
    }

    continue;

}

 // ♾️ FOREVER LOOP

if(line==="forever"){

    let start=i+1;

    let end=start;


    while(lines[end].trim() !== "end"){

        end++;

    }


    while(true){

        await run(
            lines.slice(start,end).join("\n")
        );

    }


}

// 🧠 WHILE LOOP

if(line.startsWith("while ")){

    let start=i+1;

    let end=start;


    while(lines[end].trim() !== "end"){

        end++;

    }


    let condition=line.substring(6);


    while(checkCondition(condition)){


        await run(
            lines.slice(start,end).join("\n")
        );


    }


    i=end;

    continue;

}

// 🔁 REPEAT LOOP

if(line.startsWith("repeat ")){

    let amount = Number(
        line.replace("repeat ","")
    );


    let start = i + 1;


    let end = start;


    while(lines[end].trim() !== "end"){

        end++;

    }


    for(let x = 0; x < amount; x++){

        await run(
            lines.slice(start,end).join("\n")
        );

    }


    i = end;

    continue;

}

        // IF STATEMENT
if(line.startsWith("if ")){

    ifRunning = true;
    elseChain = true;


    let condition = line.substring(3);

    let parts = condition.split(" is ");

    let variable = parts[0].trim();

    let value = parts[1].trim();


    if(value.startsWith('"')){
        value=value.replaceAll('"',"");
    }
    else if(!isNaN(value)){
        value=Number(value);
    }


    if(variables[variable] == value){

        skipMode = false;
        ifPassed = true;

    }
    else{

        skipMode = true;
        ifPassed = false;

    }


    continue;

}



// ELSE IF
if(line.startsWith("else if ")){

    if(ifPassed){

        skipMode = true;

    }
    else{

        let condition=line.substring(8);

        let parts=condition.split(" is ");

        let variable=parts[0].trim();

        let value=parts[1].trim();


        if(value.startsWith('"')){
            value=value.replaceAll('"',"");
        }
        else if(!isNaN(value)){
            value=Number(value);
        }


        if(variables[variable] == value){

            skipMode=false;
            ifPassed=true;

        }
        else{

            skipMode=true;

        }

    }


    continue;

}



// ELSE
if(line==="else"){

    if(ifPassed){

        skipMode=true;

    }
    else{

        skipMode=false;
        ifPassed=true;

    }


    continue;

}



// END
if(line==="end"){

    skipMode=false;
    ifRunning=false;
    ifPassed=false;
    elseChain=false;


    continue;

}

        // SAY

        // SKIP FALSE IF BLOCKS
// SKIP FALSE IF BLOCKS
if(skipMode 
&& !line.startsWith("else")
&& line !== "end"){

    continue;

}

if(line.startsWith("say ")){

    let text = line.substring(4);


    let parts = text.match(/"[^"]*"|\S+/g);


    let result = "";


    parts.forEach(part=>{


        if(part.startsWith('"')){

            result += part.slice(1,-1) + " ";

        }

        else if(variables[part] !== undefined){

            result += variables[part] + " ";

        }

        else{

            result += part + " ";

        }


    });


    output.innerHTML += result.trim()+"<br>";

}

// 🖼 IMAGE

else if(line.startsWith("image is ")){

    let name =
    line.substring(9)
    .replaceAll('"',"")
    .trim();


    variables.image=name;


}

// SHOW IMAGE

else if(line==="show image"){

    let img=document.createElement("img");


    img.src=variables.image;


    img.style.width="200px";


    output.appendChild(img);

}

// 🎲 RANDOM NUMBER

else if(line.includes(" is random ")){

    let parts = line.split(" is random ");

    let name = parts[0].trim();


    let range = parts[1].split(" to ");


    let min = Number(range[0]);

    let max = Number(range[1]);


    variables[name] =
    Math.floor(
        Math.random() * (max-min+1)
    ) + min;


}

// 🚀 DO FUNCTION

else if(line.startsWith("do ")){

    let name = line.substring(3).trim();

    if(functions[name]){

        let func = functions[name];

if(func){

    await run(
        lines
            .slice(func.start, func.end)
            .join("\n")
    );

}
else{

    output.innerHTML +=
        "❌ Function not found: " + name + "<br>";

}

    }
    else{

        output.innerHTML +=
        "❌ Function not found: " + name + "<br>";

    }

}

// 👾 CREATE SPRITE

else if(line.startsWith("create sprite ")){

    let name = line.substring(14).trim();

    let div = document.createElement("img");

    div.style.position = "absolute";

    div.style.left = "0px";

    div.style.top = "0px";

    div.style.width = "64px";

    document.body.appendChild(div);

    sprites[name] = {

        element: div,

        x: 0,

        y: 0,

        image: ""

    };

}

// 🖼 PLAYER IMAGE

else if(line.includes(" image is ")){

    let parts = line.split(" image is ");

    let sprite = parts[0].trim();

    let image = parts[1]
        .replaceAll('"',"")
        .trim();

    if(sprites[sprite]){

        sprites[sprite].image = image;

        sprites[sprite].element.src = image;

    }

}

// 📍 POSITION

else if(line.includes(" x is ")){

    let parts=line.split(" x is ");

    let sprite=parts[0].trim();

    let x=Number(parts[1]);

    if(sprites[sprite]){

        sprites[sprite].x=x;

        sprites[sprite].element.style.left=x+"px";

    }

}

// 📍 Y

else if(line.includes(" y is ")){

    let parts=line.split(" y is ");

    let sprite=parts[0].trim();

    let y=Number(parts[1]);

    if(sprites[sprite]){

        sprites[sprite].y=y;

        sprites[sprite].element.style.top=y+"px";

    }

}



        // VARIABLE CREATION

        // COLOUR
else if(line.startsWith("colour is ")){

    let colour = line.substring(10).trim();

    output.style.color = colour;

}
        else if(
    line.includes(" is ")
    &&
    !line.includes(" plus ")
    &&
    !line.includes(" minus ")
){


            let parts=line.split(" is ");


            let name=parts[0].trim();


            let value=parts[1].trim();



            if(value.startsWith('"')){

                variables[name]=value.replaceAll('"',"");

            }

            else if(!isNaN(value)){

                variables[name]=Number(value);

            }

            else{

                variables[name]=value;

            }


        }





        // MATH
        // MATH
// 🧮 MATH COMMANDS

else if(
    line.includes(" is ")
    &&
    (
        line.includes(" plus ")
        ||
        line.includes(" minus ")
    )
){

    let parts=line.split(" is ");


    let name=parts[0].trim();


    let equation=parts[1].trim();


    let operation;


    if(equation.includes(" plus ")){
        operation="plus";
    }
    else{
        operation="minus";
    }



    let values=equation.split(
        " " + operation + " "
    );


    let first=values[0].trim();

    let second=values[1].trim();



    let firstValue =
    variables[first] !== undefined
    ? variables[first]
    : Number(first);



    let secondValue =
    variables[second] !== undefined
    ? variables[second]
    : Number(second);



    if(operation==="plus"){

        variables[name] =
        Number(firstValue)+Number(secondValue);

    }


    if(operation==="minus"){

        variables[name] =
        Number(firstValue)-Number(secondValue);

    }


}





        // WAIT
        else if(line.startsWith("wait for ")){

            let seconds =
            Number(
                line
                .replace("wait for ","")
                .replace(" seconds","")
            );


            await new Promise(resolve=>{

                setTimeout(resolve,seconds*1000);

            });


        }





        else{

            output.innerHTML +=
            "❌ I don't understand: "+line+"<br>";

        }


    }


}

function checkCondition(condition){


    if(condition.includes(" is not ")){

        let parts=condition.split(" is not ");


        let variable=parts[0].trim();

        let value=parts[1].trim();


        if(!isNaN(value)){

            value=Number(value);

        }


        return variables[variable] != value;


    }



    if(condition.includes(" is ")){

        let parts=condition.split(" is ");


        let variable=parts[0].trim();

        let value=parts[1].trim();



        if(!isNaN(value)){

            value=Number(value);

        }


        return variables[variable] == value;


    }


    return false;

}