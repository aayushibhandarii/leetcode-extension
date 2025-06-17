if (!document.getElementById("gemini-api-key")) {

  // Create box
  const div = document.createElement("div");
  div.className = "draggable-box";
  div.id = "gemini-api-key";
  div.innerHTML = `
    <div style="background-color: white; border: 2px gray solid; color: white; padding: 2px; display: flex; flex-direction: column; justify-content: center; align-items: center; width:100%;height:100%;gap: 20px;">
        <img 
        src="https://leetcode.com/_next/static/images/logo-ff2b712834cf26bf50a5de58ee27bcef.png"
        width="30px" 
        height="30px"
        />
        <h1 style="color: black;">
            Enter your Gemini API Key
        </h1>
        <form>
                <input 
                type="text" 
                id="enter-gemini-api-key" 
                placeholder="Enter Gemini API Key"
                >
                <button id="gemini-key-submit" type="submit" >
                    Submit
                </button>
        </form>
        
        <p id="result-text"></p>
        <script src="options.js"></script>
    </div>
  `;
  document.body.appendChild(div);

  // Drag logic
  let isDragging = false;
  let offsetX = 0;
  let offsetY = 0;
  
  div.addEventListener("mousedown", function (e) {
    isDragging = true;
    offsetX = e.clientX - div.getBoundingClientRect().left;
    offsetY = e.clientY - div.getBoundingClientRect().top;
    div.style.cursor = "grabbing";
  });

  document.addEventListener("mousemove", function (e) {
    if (!isDragging) return;

    let newLeft = e.clientX - offsetX;
    let newTop = e.clientY - offsetY;

    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - div.offsetWidth));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - div.offsetHeight));

    div.style.left = `${newLeft}px`;
    div.style.top = `${newTop}px`;
  });

  document.addEventListener("mouseup", function () {
    isDragging = false;
    div.style.cursor = "move";
  });
}

const submitButton = document.getElementById("gemini-key-submit");
submitButton.addEventListener("click",async(e)=>{
    const apiKey = document.getElementById("enter-gemini-api-key").value.trim();

    const result = document.getElementById("result-text");
    submitButton.disabled = true;
    result.textContent = "Validating Your API Key...";
    const isValid = await isValidGeminiKey(apiKey);
    if(isValid){
        chrome.storage.sync.set({ geminiApiKey: apiKey });
        chrome.runtime.sendMessage({ action: "startChat" });
        document.getElementById("gemini-api-key").hidden = true;
    }else{
        alert("API KEY Is wrong");
        submitButton.disabled = false;
    }
})
async function  isValidGeminiKey(apiKey){
    console.log("vaidatingg....")
     try{
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}` , {
                method : "POST",
                headers : {
                    "Content-Type": "application/json"
                },
                body : JSON.stringify({
                        contents : [
                                {
                                        parts : [
                                                {
                                                        text:"hello"
                                                }
                                        ]
                                }
                        ]
                })
        });
        const data = await res.json();
        console.log(data);
        return !data.error;

     }catch(e){
        console.log(e.message);
     }
}