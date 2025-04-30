function toggleText(event){
   const element=event.target;
   const paragraph=element.parentElement;
   const dot=paragraph.querySelector(".dot");
   const moreText=paragraph.querySelector(".more-text");
  

   const hidden=moreText.style.display==="none"||moreText.style.display==="";

   if(hidden){
    moreText.style.display="inline";
    element.textContent="see less";
    dot.style.display="none";
   }
   else{
    moreText.style.display="none";
    element.textContent="see more";
    dot.style.display="inline";
   }

}