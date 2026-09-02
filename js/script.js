const form=document.getElementById("uploadForm");
const fileInput=document.getElementById("imageFile");
const preview=document.getElementById("preview");
const previewWrap=document.getElementById("previewWrap");
const result=document.getElementById("result");
const statusBox=document.getElementById("status");
const button=document.getElementById("submitButton");

fileInput.addEventListener("change",()=>{
  const file=fileInput.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=e=>{
    preview.src=e.target.result;
    previewWrap.classList.remove("hidden");
  };
  reader.readAsDataURL(file);
});

form.addEventListener("submit",async(e)=>{
  e.preventDefault();
  const file=fileInput.files[0];
  if(!file){statusBox.textContent="Please select an image.";return;}
  const formData=new FormData();
  formData.append("file",file);
  button.disabled=true;
  button.textContent="Classifying...";
  statusBox.textContent="";
  result.classList.add("hidden");

  try{
    const response=await fetch("/api/predict",{method:"POST",body:formData});
    const contentType=response.headers.get("content-type")||"";
    if(!contentType.includes("application/json")) throw new Error("Server returned an invalid response.");
    const data=await response.json();
    if(!response.ok) throw new Error(data.detail||"Prediction failed.");
    let html="<h2>Prediction Result</h2>";
    data.predictions.forEach(item=>{
      html+=`<div class="prediction"><span class="class-name">${item.class}</span><span class="confidence">${item.confidence}%</span></div>`;
    });
    result.innerHTML=html;
    result.classList.remove("hidden");
  }catch(err){
    statusBox.textContent=err.message;
  }finally{
    button.disabled=false;
    button.textContent="Classify Image";
  }
});
