
//CV 
import CV from './CV-file.json' with{type: 'json'};

function showCV(){  
    const article = document.getElementById("articles");
    article.innerHTML ="";

//Education
    const img = document.createElement("img");
    img.className = "yoda";
    img.src = CV.img;
    article.appendChild(img);

    const education_h2 = document.createElement("h2");
    education_h2.textContent = CV.education;
    article.appendChild(education_h2)

    CV.educationList.forEach(education => {        
        const section = document.createElement("section");
        section.id = "section";
        section.innerHTML =`<h4 id ="educationTitle">${education.educationTitle}</h4>
        <p id = "educationText">${education.educationText}</p>`
        article.appendChild(section);
        
    });
    const hr = document.createElement("hr");
    article.appendChild(hr);

//Jobs
    const jobs_h2 = document.createElement("h2");
    jobs_h2.textContent = CV.jobs;
    article.appendChild(jobs_h2)

    CV.jobsList.forEach(jobs => {        
        const section = document.createElement("section");       
        section.innerHTML =`<h4 id ="jobTitle">${jobs.jobTitle}</h4>
        <p id = "jobText">${jobs.jobText}</p>`
        article.appendChild(section);
    });
    const hr2 = document.createElement("hr");
    article.appendChild(hr2);

//Qualifications
const qualify_h2 = document.createElement("h2");
qualify_h2.textContent = CV.qualifications;
article.appendChild(qualify_h2);

CV.qualifyList.forEach(qualify => {
    const ul = document.createElement("ul");
    ul.className = "qualifyList"
    ul.innerHTML = `<li>${qualify.qualificationText}</li>`
    article.appendChild(ul);
});
const hr3 = document.createElement("hr");
article.appendChild(hr3);

//SpareTime
const spareTime_h2 = document.createElement("h2");
spareTime_h2.textContent = CV.spareTime;
article.appendChild(spareTime_h2);

CV.spareTimeList.forEach(spareItem =>{
    const section = document.createElement("section");
    section.innerHTML = `<p>${spareItem.sparetimeText}</p>`;
    article.appendChild(section);
});
};
showCV();

//Easteregg 1 
const hidBtn = document.getElementById("hidden-btn");
hidBtn.addEventListener("click",changeBackGroundColor)

function changeBackGroundColor(){
    const backGroundColor = ["Red","Blue"];
    backGroundColor.sort(function(){return 0.5 - Math.random()}); 
    document.body.style.backgroundColor = backGroundColor[0];
}

//Easteregg 2 
let keyStrokes = "";
const hiddenKey = "1337";
let easterEgg = document.getElementById("easter-modal");
const closeEaster = document.getElementsByClassName("close-btn")[0];

document.addEventListener("keydown", (event) =>{
    keyStrokes += event.key;

    keyStrokes = keyStrokes.slice(-hiddenKey.length)

    if(keyStrokes === hiddenKey){
        console.log(hiddenKey);
        easterEgg.style.display = "block";
    }
});

closeEaster.onclick = function(){
    easterEgg.style.display = "none";
}