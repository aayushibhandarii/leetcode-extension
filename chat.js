
let messages = [];

const paragraphs = document.querySelectorAll('div.elfjS p');
const textContent = Array.from(paragraphs)
  .map(p => p.innerText.trim())
  .filter(text => text.length > 0);

console.log(textContent);
if (!document.getElementById("leetcode-helper-box")) {
  
  const div = document.createElement("div");
  div.className = "draggable-box";
  div.id = "leetcode-helper-box";
  div.innerHTML = `
        <div id="lh-header">
            <select id="lh-font">
                <option value="font-black">font-black</option>
                <option value="font-white">font-white</option>
            </select>
            <select id="lh-bg">
            <option value="bg-white">bg-white</option>
              <option value="bg-black">bg-black</option>
              
              <option value="bg-transparent">bg-transparent</option>
            </select>
        </div>
        <div id="lh-chat">
          <div id="lh-starter" style="text-align:center;opacity:.7;display:flex;align-items: center;justify-content: center;flex-direction: column;">
            <img src="https://leetcode.com/_next/static/images/logo-ff2b712834cf26bf50a5de58ee27bcef.png" width="32" height="32"><br>
            <p style="margin: 6px 0; font-size: 14px;">What's on your mind about the shown question?</p>
          </div>
        </div>
        
        <form id="lh-form">
            <input type="text" id="question-ask" placeholder="Ask" autocomplete="off">
            <button id="question-ask-submit" type="submit" title="Send">
                ➤
            </button>
        </form>
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

  document.getElementById("lh-font").onchange = e=>{
    div.classList.remove("font-white", "font-black");
    console.log(e.target.value);
    if (e.target.value) div.classList.add(e.target.value);
  };
  document.getElementById("lh-bg").onchange   = e=>{
    div.classList.remove("bg-black", "bg-white", "bg-transparent");
    console.log(e.target.value);
    if (e.target.value) div.classList.add(e.target.value);
  };

}

const button = document.getElementById("question-ask-submit");
button.addEventListener("click",async(e)=>{
  
    const input = document.getElementById("question-ask");
    const question = input.value.trim();

    if(!question)return;

    input.value = "";
    button.disabled = true;
    
    const result = document.getElementById("lh-chat");
    result.insertAdjacentHTML(
      "beforeend",
      `<div style="align-self: flex-end; background-color: var(--bubble-user); padding: 6px 10px; border-radius: 8px; max-width: 80%;">${question}</div>`
    );
    result.scrollTop = result.scrollHeight;
    messages.push({ role:"user", parts:[{ text:question }] });
    document.getElementById("lh-starter")?.remove();

    const ans = formatString(await getAnswer());
    
    if(ans){
      result.insertAdjacentHTML(
        "beforeend",
        `<pre style="align-self: flex-start; background-color: var(--bubble-ai); padding: 6px 10px; border-radius: 8px;max-width : 100%; white-space: pre-wrap;
    word-break: break-word;
    overflow-wrap: break-word;
    overflow: visible;">${ans}</pre>`
      );
      result.scrollTop = result.scrollHeight;
    }
    button.disabled = false;
})
async function getAnswer(){
  
  const systemInstruction = {
    parts: [{
      text: prompt.replace("{{problem}}",textContent)
    }]
  };
  if (!messages.length) {
    console.error("messages array is empty – add the user prompt first!");
    return;
  }

  const apiKey = await getGeminiApiKey();

  const payload = {
    systemInstruction,
    contents : messages
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  };
  try{
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        const modelText = data.candidates[0].content.parts[0].text;
        console.log(modelText);
        messages.push(
          {role:"model",parts : [{text:modelText}]}
        )
        
        return modelText

     }catch(e){
        console.log(e.message);
     }
  

  

}
async function getGeminiApiKey() {
  return new Promise((resolve) => {
    chrome.storage.sync.get(["geminiApiKey"], (result) => {
      resolve(result.geminiApiKey);
    });
  });
}

function formatString(str){
  const newstr = str.replaceAll("/n","\n").trim();
  console.log(newstr);
  return newstr;
  
}

const prompt = `You are an engaging and supportive coding assistant tasked with guiding the user through solving the following problem in an interactive and educational way:/n
---/n
📌 Problem:/n
{{problem}}/n
---/n

Your role is to act as a mentor, providing a step-by-step, hint-based approach to help the user solve the problem. Follow these guidelines to ensure a dynamic and enriching experience:/n

1. Do not provide the full solution or code unless the user explicitly requests it with phrases like “give full answer,” “show code,” or “I give up.”/n
2. Begin with a brief problem analysis to set the context, followed by an initial hint that nudges the user toward a solution, such as suggesting an algorithm, data structure, or key concept to explore./n
3. For subsequent hints, progressively deepen the guidance (e.g., outline pseudocode, discuss edge cases, or analyze time/space complexity) while keeping the user engaged with thought-provoking questions like:/n
   - "What approach could efficiently handle this input size?"/n
   - "How might you deal with edge cases like an empty input?"/n
   - "Can you think of a data structure to optimize this step?"/n
4. Maintain an interactive, encouraging, and enthusiastic tone. Make the user feel supported and motivated to explore ideas, even if they make mistakes./n
5. If the user struggles, offer creative analogies or relatable examples to clarify concepts without giving away the solution./n
6. Only share the complete solution or code when explicitly requested, ensuring it's clear, well-commented, and easy to understand./n
7. Tailor your hints to the user's progress, adapting to their responses to keep the guidance relevant and engaging./n

Your goal is to spark curiosity, foster problem-solving skills, and make the learning process enjoyable and rewarding!/n
---/n
📌 System Instructions:/n
- Ensure every new line in your response is indicated with /n./n
- Avoid using bold text, italics, or any complex formatting—just keep it as a simple string./n
- Add multiple emojis (like 🎉, 😊, 🌟) to make it fun and engaging!/n
- Start with a friendly greeting and include the problem or context I provide./n
Your mission is to create a delightful and supportive learning journey! 😄
`;
