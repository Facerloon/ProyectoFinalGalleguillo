const primaryAttributesCost = 10; // Valor fijo, el costo base siempre es 10
const mainAttributesBasis = 10; // Valor fijo, siempre empiezan en 10
//const evento = new Event('contenidoActualizado');

// --------- Manejo de Atributos Principales ---------

let mainAttributes = document.querySelectorAll(".main_attribute");
let mainAttributesValues = document.querySelectorAll(".main_attribute_value");
let mainAttributesCost = document.querySelectorAll(".cost_value");
console.log(`10. Main Attributes: ${mainAttributes} | Cost Boxed Quantity: ${mainAttributesCost.length}`);

for (let i = 0; i < 8 /* Valor fijo, siempre son 8*/; i++) {
    // Se setean dinamicamente los valores de cada atributo
    //console.log(`14. Attribute ID: ${mainAttributesValues[i].id}`);
    //console.log(`15. Attribute Cost: ${mainAttributesCost[i].innerHTML}`);

    let attibuteBasis = mainAttributesValues[i];
    //console.log(`18. Attribute: ${attibuteBasis.innerHTML}`);
    attibuteBasis.setAttribute('value', primaryAttributesCost);

    attibuteBasis.addEventListener('input', (event) => {

        if (event.target.value > 20) {
            event.target.value = 20;
        } // 20 es el valor maximo
        else if (event.target.value < 1) {
            event.target.value = 1;
        } // 1 es el valor minimo

        let attributeId = event.target.id;
        let newValue = event.target.value;
        let newPointCost = sumValue(primaryAttributesCost, newValue, mainAttributesBasis);
        //console.log(`33. Atributo: ${attributeId} | Nuevo Valor: ${newValue} | Nuevo Cost: ${newPointCost}`)

        let attributeCostElement = mainAttributesCost[i];
        attributeCostElement.innerHTML = newPointCost;
        updateTotalCost();
    });
}

// --------- Manejo de Listas de Ventajas y Desventajas ---------

let addAdvantageBtn = document.getElementById("addAdvBtn");
addAdvantageBtn.addEventListener('click', (event) => {

    let advantageText = document.getElementById("advAddText");
    let advantageCost = document.getElementById("advAddCost");
    //console.log(`48. New Advantage Text: ${advantageText.value} | New Advantage Cost: ${advantageCost.value}`);

    if (!isEmpty(advantageCost.value) && !isEmpty(advantageText.value)) {

        let advantageList = document.getElementById("advantageList");
        let firstElement = advantageList.firstChild;

        let newElement = document.createElement('li');
        newElement.innerHTML = `<span class="main_list_elementAdded_text">${advantageText.value}</span> [<span class="cost_value">${advantageCost.value}</span>] <button type="button" class="main_list_elementAdded_rmvbtn">-</button>`;
        advantageList.insertBefore(newElement, firstElement);
        updateTotalCost();

        advantageText.value = '';
        advantageCost.value = '';

        let removeAdvantageBtns = document.querySelectorAll(".main_list_elementAdded_rmvbtn");
        //console.log(`64. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeAdvantageBtns.length; i++) {
            removeButton = removeAdvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                //console.log(`69. Event Target: ${event.target}`);
                event.target.parentElement.remove();
            });
        }
    }
});

let addDisadvantageBtn = document.getElementById("addDisadvBtn");
addDisadvantageBtn.addEventListener('click', (event) => {

    let disadvantageText = document.getElementById("disadvAddText");
    let disadvantageCost = document.getElementById("disadvAddCost");
    //console.log(`81. New Advantage Text: ${disadvantageText.value} | New Advantage Cost: ${disadvantageCost.value}`);

    if (!isEmpty(disadvantageText.value) && !isEmpty(disadvantageCost.value)) {

        let disadvantageList = document.getElementById("disadvantageList");
        let firstElement = disadvantageList.firstChild;

        let newElement = document.createElement('li');
        newElement.innerHTML = `<span class="main_list_elementAdded_text">${disadvantageText.value}</span> [<span class="cost_value">${disadvantageCost.value}</span>] <button type="button" class="main_list_elementAdded_rmvbtn">-</button>`;
        disadvantageList.insertBefore(newElement, firstElement);
        updateTotalCost();

        disadvantageText.value = '';
        disadvantageCost.value = '';

        let removeDisadvantageBtns = document.querySelectorAll(".main_list_elementAdded_rmvbtn");
        //console.log(`97. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeDisadvantageBtns.length; i++) {
            removeButton = removeDisadvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                //console.log(`102. Event Target: ${event.target}`);
                event.target.parentElement.remove();
            });
        }
    }
});

// --------- Funciones ---------

function saveCharacter() {

    try {

        let characterSaveObj = {
            main_attributes: [],
            advantages: [],
            disadvantages: [],
            total_cost: 0
        }




    }
    catch (e) {
        console.log(`127. Error: ${JSON.stringify(e)}`)
    }
}

function getMainAttributesData() {

    try {

        let fieldGroups = document.querySelectorAll('.field-group-attribute');

        // Recorrer cada contenedor
        fieldGroups.forEach((group) => {
            let attributeId = group.querySelector('.main_attribute_value').id;
            let attributeValue = group.querySelector('.main_attribute_value').value;
            let costValue = group.querySelector('.cost_value').innerHTML;
            console.log(`142. Attribute: ${attributeId} | Cost Value: ${costValue} | Attribute Value: ${attributeValue}`);
        });

    }
    catch (e) {
        console.log(`147. Error: ${JSON.stringify(e.message)}`)
    }
}

function getAttributeData(attribute, cost) {

    let attributteObj = {
        attribute: attribute,
        cost: cost,
        value: null,
        points: 0
    }

    return attributteObj;
}

function sumValue(cost, score, basis) {
    let result = (score - basis) * cost;
    //console.log(result);
    return result;
}

function updateTotalCost() {

    let finalCost = 0;
    let mainAttributesCost = document.querySelectorAll(".cost_value");
    //console.log(`173. Cost Boxed Quantity: ${mainAttributesCost.length}`);
    let totalCost = document.getElementById("puntos_totales");

    for (let i = 0; i < mainAttributesCost.length; i++) {
        let costValue = !isEmpty(mainAttributesCost[i].innerHTML) ? parseFloat(mainAttributesCost[i].innerHTML) : 0;
        finalCost += costValue;
    }

    totalCost.setAttribute('value', finalCost);
}

function isEmpty(value) {

    if (value === ``)
        return true;

    if (value === null)
        return true;

    if (value === undefined)
        return true;

    if (value === `undefined`)
        return true;

    if (value === `null`)
        return true;

    return false;
}