


const targetForm =document.querySelector("form");
const logoutButton=document.getElementById("LogOut-button");
logoutButton.addEventListener("click",function(e){
    e.preventDefault();

   if(!targetForm.checkValidity()){
     alert("invalid data !");
     return;
   }
      
       
    const formData=new FormData(targetForm);
    const formDataObj = new URLSearchParams(formData);
    fetch("/logOut",{
        method:"POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body:formDataObj,
    })
    .then(response=>{
        response.json().then(data=>{
            console.log("Server response:", data);
            if(data.success){
                 const elem=document.getElementById("LogOut-done");
                 elem.style.display="flex";
                setTimeout(()=>{
                  window.location.href="/";
                },2000);
            }
            else{
                alert(data.message || "Logging off failed, please try again later!");
            }
        });
    })
    .catch((err)=>{
        console.log("server side error pls try again:"+err);
         alert("Server error. Please try again later.");
         

    });

   
    

    

       

});