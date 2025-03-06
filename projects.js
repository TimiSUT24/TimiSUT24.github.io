const LoadingMessage = document.getElementById("projects");

async function getGithubProjects(){
    const gitUrl = `https://api.github.com/users/TimiSUT24/repos`; 
    try{
        LoadingMessage.innerHTML = "<p>Loading Github projects </p>";
        const response = await fetch(gitUrl)
        
        if(!response.ok){
            throw new Error(`HTTP error! status: ${response.status}`)
        }
        const projectsData = await response.json();


        const projectContainer = document.getElementById("projects");
        projectContainer.innerHTML = ""; 

        const tagH3 = document.createElement("h3");
        tagH3.innerHTML = `<h3 class ="pfh3">Projects</h3>`;
        projectContainer.appendChild(tagH3);

        const projectlist = document.createElement("ul");
        projectlist.className = "pful";
        projectContainer.appendChild(projectlist);

        projectsData.forEach(repos => {
            const element = document.createElement("li");
            element.className = "pf-item";
            element.innerHTML = `               
                ${repos.name} <a href="${repos.html_url}" target="_blank">Se på GitHub</a>
                `;
                projectlist.appendChild(element);
        })
    }catch(error){
        console.error("Something wrong happend when getting the projects", error);

    }
}

getGithubProjects();

