const primaryAttributesCost = 10; // Valor fijo, el costo base siempre es 10
const mainAttributesBasis = 10; // Valor fijo, siempre empiezan en 10
//const evento = new Event('contenidoActualizado');

// --------- Manejo de Atributos Principales ---------

let mainAttributes = document.getElementsByClassName("main_attribute");
let mainAttributesValues = document.getElementsByClassName("main_attribute_value");
let mainAttributesCost = document.querySelectorAll(".cost_value");
console.log(`10. Main Attributes: ${mainAttributes} | Cost Boxed Quantity: ${mainAttributesCost.length}`);

for (let i = 0; i < 8 /* Valor fijo, siempre son 8*/; i++) {
    // Se setean dinamicamente los valores de cada atributo
    let attibuteBasis = mainAttributesValues[i];
    console.log(`15. Attribute: ${attibuteBasis.innerHTML}`);
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
        console.log(`30. Atributo: ${attributeId} | Nuevo Valor: ${newValue} | Nuevo Cost: ${newPointCost}`)

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
    //console.log(`45. New Advantage Text: ${advantageText} | New Advantage Cost: ${advantageCost}`);

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
        //console.log(`60. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeAdvantageBtns.length; i++) {
            removeButton = removeAdvantageBtns[i];
            removeButton.addEventListener('click', (event) => {
                //console.log(`65. Event Target: ${event.target}`);
                event.target.parentElement.remove();
            });
        }
    }
});

// --------- Funciones ---------

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
    console.log(result);
    return result;
}

function updateTotalCost() {

    let finalCost = 0;
    let mainAttributesCost = document.querySelectorAll(".cost_value");
    //console.log(`93. Cost Boxed Quantity: ${mainAttributesCost.length}`);
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