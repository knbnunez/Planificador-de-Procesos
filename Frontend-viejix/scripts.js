// const { response } = require("express");

document.addEventListener("click", () => {
    fetch('http://localhost:3000/upload')
    .then(response => response.json())
    .then(data => {
        
    });
    
});

