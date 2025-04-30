
document.addEventListener("DOMContentLoaded",function(){
    const toggleButton=document.querySelector(".toggleSidebar");
    const sidebar=document.querySelector(".flex-shrink-0");
    if(toggleButton&&sidebar){
        toggleButton.addEventListener("click",function(){
            sidebar.classList.toggle("d-none");
        });
    }
});