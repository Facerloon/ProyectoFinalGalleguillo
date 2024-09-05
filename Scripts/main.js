const listItems = document.querySelectorAll('.main_header_atributes_list li');

// Obtener la longitud máxima
let maxLength = 0;

for (let i = 0; i < listItems.length; i++) {

    console.log(`8. Line: ${i} | Text Content Length: ${listItems[i].textContent.length}`);

    if (listItems[i].textContent.length > maxLength) {
        maxLength = listItems[i].textContent.length;
    }
}

for (let i = 0; i < listItems.length; i++) {

    //console.log(`17. Line: ${i} | Text Content Length: ${listItems[i].textContent.length}`);
    let item = listItems[i]

    if (listItems[i].textContent.length < maxLength) {
        let spacesToAdd = maxLength - item.textContent.length;
        item.textContent = 'a'.repeat(spacesToAdd) + item.textContent;
    }
}

console.log(`26. Max LI Length: ${maxLength}`);
console.log(`27. List Items Length: ${listItems.length}`)