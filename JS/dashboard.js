document.addEventListener("DOMContentLoaded", function() { 
    //LocalStorage
    const note = document.getElementById("note")   
    const titles = document.getElementById("dashboard-title");
    note.innerText = JSON.parse(localStorage.getItem("notes")) || "";
    titles.value = JSON.parse(localStorage.getItem("title")) || "";

    function saveNote(){
        localStorage.setItem("notes",JSON.stringify(note.innerText))  
        localStorage.setItem("title", JSON.stringify(titles.value));     
    }
    note.addEventListener("input",saveNote);    
    titles.addEventListener("input", saveNote);    

    //Date
    function updateDate(){
        const currentDate = new Date();
        const dateOrder = {day: 'numeric', month: 'long', year: 'numeric'}
        const formatDate = currentDate.toLocaleDateString("sv-SE",dateOrder);
        const formatTime = currentDate.toLocaleTimeString("sv-SE", {hour: '2-digit', minute: '2-digit'});
        document.getElementById("formatTime").textContent = `${formatTime}`;
        document.getElementById("formatDate").textContent = `${formatDate}`;
    }
    setInterval(updateDate,1000);
    updateDate();

    // Edit Title
    function editTitle(){
        const editTitle = document.getElementById("dashboard-title")
        editTitle.addEventListener("keydown", function(e){
            if(e.key === "Enter"){
                e.preventDefault();
            }
        })     
    }
    editTitle();
    
    // Add Links

    function saveLinks(links){
        localStorage.setItem("storedLinks", JSON.stringify(links))
    }

    function loadLinks(){
        const storedLinks = JSON.parse(localStorage.getItem("storedLinks")) || []
        storedLinks.forEach(link => addElements(link.url,link.title))
    }
    loadLinks();

    function addLink(){
        const addLinks = document.getElementById("add-link")
        addLinks.addEventListener("click",function(){
            let userLink = prompt("Enter link", "");
            let linkTitle = prompt("Enter name", "");

            if(userLink && linkTitle){

                addElements(userLink,linkTitle)
                let links = JSON.parse(localStorage.getItem("storedLinks")) || []
                links.push({url: userLink, title: linkTitle})
                saveLinks(links);
            }         
        })         
    }
    addLink();

    function addElements(userLink,linkTitle){

        if(userLink){
            if(!userLink.startsWith("http://")&& !userLink.startsWith("https://")){
                userLink = "https://" + userLink;
            }
            const linkSection = document.createElement("section")             
            linkSection.className = "links";
            document.getElementById("link-section").appendChild(linkSection);
                       
            const newLink = document.createElement("a")
            newLink.href = userLink; 
            newLink.textContent = linkTitle;
            newLink.className = "link-item"
            linkSection.appendChild(newLink);

            const newDel = document.createElement("button")
            newDel.className = "delete-link";
            newDel.textContent = "-";
            newDel.addEventListener("click", function(){
                linkSection.remove();
                let links = JSON.parse(localStorage.getItem("storedLinks")) || []
                const index  = links.filter(link => link.url !== userLink);
            
                if (index !== -1) {
                    links.splice(index, 1);
                    saveLinks(links); 
                }
            })       
            linkSection.appendChild(newDel);    
            
        }
    }
  
    //Get Weather
    async function getWeather() {
          
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                //const forecast = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey2}&q=${latitude} ${longitude}&days=3&aqi=no&alerts=no&lang=sv`
                //const current = `https://api.weatherapi.com/v1/current.json?key=${apiKey2}&q=${latitude} ${longitude}&lang=sv`
                //const sporturl = `http://api.weatherapi.com/v1/sports.json?key=${apiKey2}&q=England`
                try {
                    //const currentResponse = await fetch(current);
                    //const forecastResponse = await fetch(forecast)
                    //const sportResponse = await fetch(sporturl)
                    const currentResponse = await fetch(`https://backend-dashboard-mcb4.onrender.com/api/weather/current?lat=${latitude}&lon=${longitude}`)
                    const forecastResponse = await fetch(`https://backend-dashboard-mcb4.onrender.com/api/weather/forecast?lat=${latitude}&lon=${longitude}`)
                    const sportResponse = await fetch(`https://backend-dashboard-mcb4.onrender.com/api/weather/sports`)
                    if(!currentResponse.ok || !forecastResponse.ok || !sportResponse.ok){
                        throw new Error(`HTTP error! Status: 
                            Current weather: ${currentResponse.status},
                            Forecast: ${forecastResponse.status},
                            Sports: ${sportResponse.status}`)
                    }
                  
                    const weatherData = await currentResponse.json();
                    const forecastData = await forecastResponse.json();
                    const sportsData = await sportResponse.json();
                    console.log(weatherData);
                    console.log(forecastData)
                    console.log(sportsData)

                    //Current weather
                    const icon = weatherData.current.condition.icon
                    document.getElementById("weather-icon").src = icon

                    const temperature = weatherData.current.temp_c
                    document.getElementById("celsius").textContent = temperature + "°C"

                    const description = weatherData.current.condition.text
                    document.getElementById("desc").textContent = description

                    //forecast weather                                  
                    forecastData.forecast.forecastday.forEach((dayData, index) => {
                        if (index === 0) return; 
        
                        const dayIndex = index + 1;
                        document.getElementById(`weather-icon${dayIndex}`).src = dayData.day.condition.icon;
                        document.getElementById(`celsius${dayIndex}`).textContent = `${dayData.day.avgtemp_c}°C`;
                        document.getElementById(`desc${dayIndex}`).textContent = dayData.day.condition.text;
                        document.getElementById(`current-day${dayIndex}`).textContent = getDateName(dayData.date);
                    });
            
                    //Sports news 

                    sportsData.football.slice(0,2).forEach((matches,index) => {

                        const matchIndex = index + 1;                    
                        document.getElementById(`match${matchIndex}`).textContent = matches.match
                        document.getElementById(`tournament${matchIndex}`).textContent = matches.tournament
                        document.getElementById(`start${matchIndex}`).textContent = matches.start
                        document.getElementById(`stadium${matchIndex}`).textContent = matches.stadium
                        document.getElementById(`land${matchIndex}`).textContent = matches.country
                    })         
                } catch (error) {
                    console.error("Error fetching weather data:", error);
                }
            }, (error) => {
                console.error("Error getting geolocation:", error);
            });
        } else {
            console.error("Geolocation is not supported by this browser.");
        }
    }
    
    getWeather();

    function getDateName(dateString){
        const date = new Date(dateString)
        const options = {weekday: "long"}
        const day = date.toLocaleDateString("sv-SE",options)
        return day.charAt(0).toLocaleUpperCase() + day.slice(1)      
    }
     
       
        document.getElementById("picture-gen").addEventListener("click",async function(){
            try{
                //const randomPic = Math.floor(Math.random() * 100) + 1;
                //const pictureurl = `https://api.pexels.com/v1/curated?per_page=${randomPic}page&page=${randomPic}`
                
                /*const response = await fetch(pictureurl,{
                    method: 'GET',
                    headers: {
                        'Authorization': pictureApi
                    }
                })*/
               const response = await fetch("https://backend-dashboard-mcb4.onrender.com/api/photos")
             
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                
                const pictureData = await response.json()
                if(pictureData.photos.length > 0){
                    
                    pictureData.photos.forEach(photo => {
                        const image = photo.src.original                        
                        document.getElementById("background").style.backgroundImage = `url('${image}')`                                         
                    })
                }else{
                    console.log("no photos")
                }
            }catch(error){
                console.log(error)
            }

        }) 
});



