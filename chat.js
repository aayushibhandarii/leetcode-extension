if (!document.getElementById("leetcode-helper-box")) {
  // Create style
  const style = document.createElement("style");
  document.head.appendChild(style);

  // Create box
  const div = document.createElement("div");
  div.className = "draggable-box";
  div.id = "leetcode-helper-box";
  div.innerHTML = `
    <div style="background-color: white; border: 2px gray solid; color: white; padding: 2px; display: flex; flex-direction: column; justify-content: center; align-items: center; width:100%;height:100%;gap: 20px;">
        <h1 style="color: black;">
            Enter your Gemini API Key
        </h1>
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
