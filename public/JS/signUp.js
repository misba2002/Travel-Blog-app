
 const targetForm =document.querySelector("form");
 const singUpButton=document.getElementById("signUp-button");
 singUpButton.addEventListener("click",function(e){

    if(!targetForm.checkValidity()){
      e.preventDefault();
      alert("invalid form !");
      return;
    }
        e.preventDefault();
        document.getElementById("signUp-done").style.display="flex";
       
         // Submit the form after a delay
          setTimeout(() => {
            targetForm.submit(); // Actually submit the form
        }, 2000);

 });