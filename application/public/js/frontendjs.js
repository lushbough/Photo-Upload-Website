
//for fade out of error message
//frontend.js.js
function setFlashMessageFadeOut(){
    setTimeout(() => {
        let currentOpacity =1.0;
        let timer = setInterval(() => {
            if(currentOpacity < .05) {
                clearInterval(timer);
                flashElement.remove();
            }
            currentOpacity = currentOpacity -.05;
            flashElement.style.opacity = currentOpacity;}, 50);}, 4000);
}
let flashElement = document.getElementById('flash-message');
if(flashElement){
    setFlashMessageFadeOut();
}