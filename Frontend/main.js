
//referncing key elements in variable for usage
const fileListElement = document.getElementById("file-list");
const folderPathElement = document.getElementById("folder-path");
const backButtonElement = document.getElementById("back-button");
const redContainerElement = document.querySelector(".red-container");
const checkboxElement = document.getElementById("myCheckbox");
const viewports = document.getElementsByClassName("viewport");
const homeButtonElement = document.getElementById("home-button");

//for url displaying
var URLtracker = ''

//keeps track of currentpath for usage in fetchFileList function
let currentPath ="/";

/*keeps track of previously visited paths
Popped when pressed back, pushed when new folder visited*/
let previousPaths = [];

//array holding the information of all stages in which the .mrc files will be loaded
const stages = []

//stageCounter variable. Main purpose is to use this for creating unique ids for each viewport-div
let stageCounter = 0

//function for rendering the fileList in the webpage
function renderFileList(fileList) {
  fileListElement.innerHTML = "";

  //iterate and display only mrc files
  for (let file of fileList.files) {
    if (file.name.endsWith(".mrc")) {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "list-group-item-action");
      li.innerText = file.name;
      /**
       * if an .mrc file is clicked, do the following
       * 1. Load the model
       * 2. Display a remove Model Button
       * 3. Have a Contour Model Slider
       * 4. Display the file Path so the loaded file can be identified
       */
      li.addEventListener('click',()=>{
        const newViewport =  document.createElement('div')
        newViewport.id = `viewport-${stageCounter}`
        newViewport.classList.add("viewport")
        redContainerElement.appendChild(newViewport)

        //slider creation
        var slider = document.createElement("input");
        slider.type = "range";
        slider.id = "contourSlider";
        slider.min = "0";
        slider.max = "1";
        slider.value = "0.018";
        slider.step = "0.0001";
        redContainerElement.appendChild(slider)

        //making new stage for loading file
        const newStage = new NGL.Stage(`viewport-${stageCounter}`);
        stages.push(newStage)

        //loading the file in the stage
        stages[stageCounter].loadFile(`http://localhost:5000/file${currentPath}/${file.name}`, {defaultRepresentation: true}).then((result)=>{
          var surface = result.addRepresentation("surface")

          /*add eventListener to the slider so that when the threshold is changed,
          new Model is rendered with a new threshold*/  

          slider.addEventListener("input", function(){
            var contourLevel = parseFloat(slider.value);
            surface.setParameters({isolevel: contourLevel})
          })
        })
        stageCounter+=1;
        //remove Model Button
        const button = document.createElement("button");
        button.classList.add("btn", "btn-danger");
        button.innerText = "Remove Model";

        //remove model functinoality
        /**
         * div deletion has not been added since it may cause anomalies while loading stages.
         * only visible eleements are removed
         */
        button.addEventListener("click",function(event){
          redContainerElement.removeChild(document.getElementById(newViewport.id)) 
          redContainerElement.removeChild(fileLabel) 
          redContainerElement.removeChild(button)
          redContainerElement.removeChild(slider)
          
        })
       
        redContainerElement.appendChild(button)

        //file label to identify the file
        const fileLabel = document.createElement("div");
        fileLabel.classList.add("render-label", "text-center", "mt-2");
        fileLabel.innerText = file.path.relative;
        redContainerElement.appendChild(fileLabel);
        
    })
      fileListElement.appendChild(li);
    }
  }
  //folder rendering and filtering so that hidden folders are not shwon
  for (let folder of fileList.folders) {
    if (!folder.name.startsWith(".")) {
      const li = document.createElement("li");
      li.classList.add("list-group-item", "list-group-item-action");
      li.innerText = folder.name;

      /**
       * re-render fileList element by calling fetchFileList
       * FetchfileLIst fetches the api with the latest path 
       * that has been requested
       */

      li.addEventListener("click", () => {
        previousPaths.push(currentPath);
        currentPath = "/" + folder.path.relative;
        fetchFileList();
      });
      fileListElement.appendChild(li);
    }
  }
  //To navigate in between the folders
  folderPathElement.innerHTML = urlFileList(fileList.path);
  
  document.title = "File Explorer - " + fileList.name;
}


/**
 * 1. call the backend api, 
 * 2. convert the response into json 
 * 3. display the json response in appropriate format 
 * by passing it through renderFileList
 * 4. Update URLTracker with current path's relative property
 */
function fetchFileList() {

  fetch(`http://localhost:5000${currentPath}`)
  .then(response => response.json())
  .then(data => {renderFileList(data)  
    URLtracker = data.path.relative; 
    
});
}

/**
 * Pop previousPaths array if there is more than one element. 
 * Re-render fetchfileList with currentPath
 */
function goBack() {
  if (previousPaths.length > 0) {
    currentPath = previousPaths.pop();
    fetchFileList();
  }
}
//go to home button functionality
function goHome(){
  URLtracker = ''
  previousPaths= []
  fetch(`http://localhost:5000`)
  .then(response => response.json())
  .then(data => {renderFileList(data)  
    URLtracker = data.path.relative; 
});
}
//adding functionality to the Go Back Button
backButtonElement.addEventListener("click", goBack);
homeButtonElement.addEventListener("click", goHome);
//calling FetchFileList when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  fetchFileList();
  
});

/**
 * 1. Receive the current path
 * 2. Destrucutre it to get the relative path
 * 3. Create Divs with unique ids for each element of relative path
 * Note: Each element of relative path is a folder
 */
function urlFileList(path){
  const {relative, absolute} = path;
  
  const urlPath =  relative.split('/')
  let returnable = ''
  for(let i = 0; i<urlPath.length; i++ ){
    returnable += ' > ' + `<div class='urlPath' id=${i} onclick="serialize(event)"> ${urlPath[i]} </div>`
  } 
  return `<div style="display: flex;"> ${returnable}</div>`
}


function serialize(event){
  let currentFolderPath = URLtracker.split('/'); 
  let clickedFolder = document.getElementById(event.target.id).innerText
  let baseFolderPath = 'http://localhost:5000'
  let finalString =''
  for(i=0;i<currentFolderPath.length; i++){
    if(currentFolderPath[i]===clickedFolder){
      finalString += '/' + currentFolderPath[i]
      break
    }  
    finalString += '/' + currentFolderPath[i]
  }
  if (previousPaths.length > 0) {
   previousPaths.pop()  
  }
  if(finalString === '/.'){
    fetch(baseFolderPath)
    .then(response => response.json())
    .then(data => {renderFileList(data)  
      URLtracker = data.path.relative;     
    })
  }else{
    fetch(baseFolderPath+finalString)
    .then(response => response.json())
    .then(data => {renderFileList(data)  
      URLtracker = data.path.relative;     
    })
  }
}

/**
 * Add eventListeners to each of the viewport divs so that
 * mouse movement can be replicated through all of them
 */
function handleCheckBox(){
  //if checkbox is checked, as in yes to clone movement, add Event Listeners

  if(checkboxElement.checked){
    for (var i = 0; i < viewports.length; i++) {
      var viewport = viewports[i];
      viewport.addEventListener("mousedown", handleMouseDown);
      viewport.addEventListener("mousemove", handleMouseMove);
      viewport.addEventListener("mouseup", handleMouseUp);
      viewport.addEventListener("wheel", handleMouseWheel);
    }
  }
  //if checkbox is unchecked as in no to clone movement, remove the event listeners
  else{
    for (var i = 0; i < viewports.length; i++) {
      var viewport = viewports[i];
      viewport.removeEventListener("mousedown", handleMouseDown);
      viewport.removeEventListener("mousemove", handleMouseMove);
      viewport.removeEventListener("mouseup", handleMouseUp);
      viewport.removeEventListener("wheel", handleMouseWheel);
    }
  }
}

var isDragging = false;
var startX, startY;
var zoomFactor = 1;

// Function to handle mousedown event
function handleMouseDown(event) {
  event.preventDefault();
  isDragging = true;
}

// Function to handle mousemove event
function handleMouseMove(event) {
  event.preventDefault();
  //dragging only when mouse is down and moving
  if (isDragging) {
/**
 * 1. Identify Current Viewport/Stage/Div on which mouse movement is detected
 * 2. Copy the Orientation matrix of the model loaded in that stage
 * 3. Set the Orientation matrix of that in all other models in all other stages
 * 4. Ignore re-setting the matrix for the orignial model as it will cause double rendering
 */
  var currentViewPort = event.currentTarget.id;
  var currentStageNumber = parseInt(currentViewPort.match(/\d+/)[0])

  //get current Stage Orientation
  var currentStageOrientation = stages[currentStageNumber].viewerControls.getOrientation()
  for(let i=0; i<stages.length; i++){
    //if not current Stage
    if(i!==currentStageNumber){
      stages[i].viewerControls.orient(currentStageOrientation)
    }
  }
  }
}

// Function to handle mouseup event
function handleMouseUp(event) {
  event.preventDefault();
  isDragging = false;
  
}

// Function to handle mousewheel event (scroll up/down)
function handleMouseWheel(event) {
  event.preventDefault();

  /**
 * 1. Identify Current Viewport/Stage/Div on which mouse movement is detected
 * 2. Copy the Orientation matrix of the model loaded in that stage
 * 3. Set the Orientation matrix of that in all other models in all other stages
 * 4. Ignore re-setting the matrix for the orignial model as it will cause double rendering
 */

  var currentViewPort = event.currentTarget.id;
  var currentStageNumber = parseInt(currentViewPort.match(/\d+/)[0])
  var currentStageOrientation = stages[currentStageNumber].viewerControls.getOrientation()
  for(let i=0; i<stages.length; i++){
    if(i!==currentStageNumber){
      stages[i].viewerControls.orient(currentStageOrientation)
    }
  } 
}




