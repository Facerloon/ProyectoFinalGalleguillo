const primaryAttributesCost = 10; // Valor fijo, el costo base siempre es 10
const mainAttributesBasis = 10; // Valor fijo, siempre empiezan en 10

// --------- Manejo de Atributos Principales ---------

let mainAttributes = document.querySelectorAll(".main_attribute");
let mainAttributesValues = document.querySelectorAll(".main_attribute_value");
let mainAttributesCost = document.querySelectorAll(".cost_value");
console.log(`9. Main Attributes: ${mainAttributes} | Cost Boxed Quantity: ${mainAttributesCost.length}`);

for (let i = 0; i < 8 /* Valor fijo, siempre son 8*/; i++) {
    // Se setean dinamicamente los valores de cada atributo
    //console.log(`13. Attribute ID: ${mainAttributesValues[i].id}`);
    //console.log(`14. Attribute Cost: ${mainAttributesCost[i].innerHTML}`);

    let attibuteBasis = mainAttributesValues[i];
    //console.log(`17. Attribute: ${attibuteBasis.innerHTML}`);
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
        //console.log(`32. Atributo: ${attributeId} | Nuevo Valor: ${newValue} | Nuevo Cost: ${newPointCost}`)

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
    //console.log(`47. New Advantage Text: ${advantageText.value} | New Advantage Cost: ${advantageCost.value}`);

    if (!isEmpty(advantageCost.value) && !isEmpty(advantageText.value)) {

        let advantageList = document.getElementById("advantageList");
        let firstElement = advantageList.firstChild;

        let newElement = document.createElement('li');
        newElement.className = `main_list_elementAdded`;
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
        newElement.className = `main_list_elementAdded`;
        newElement.innerHTML = `<span class="main_list_elementAdded_text">${disadvantageText.value}</span> [<span class="cost_value">${disadvantageCost.value}</span>] <button type="button" class="main_list_elementAdded_rmvbtn">-</button>`;
        disadvantageList.insertBefore(newElement, firstElement);
        updateTotalCost();

        disadvantageText.value = '';
        disadvantageCost.value = '';

        let removeDisadvantageBtns = document.querySelectorAll(".main_list_elementAdded_rmvbtn");
        //console.log(`98. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeDisadvantageBtns.length; i++) {
            removeButton = removeDisadvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                //console.log(`103. Event Target: ${event.target}`);
                event.target.parentElement.remove();
            });
        }
    }
});

// --------- Funciones ---------

function loadCharacter() {

    try {

        let loadValues = localStorage.getItem('onlyCharacterForNow');

        if (!isEmpty(loadValues)) {

            let parsedValues = JSON.parse(loadValues);

        }
    }
    catch (e) {
        console.log(`118. ${e.message}`);
    }
}

function saveCharacter() {

    let characterObj = { name: null, main_attributes: [], advantages: [], disadvantages: [], total_cost: 0 };

    try {

        let characterName = document.getElementById('nombre_personaje');
        console.log(`129. Character Name: ${characterName.value}`);
        let characterCost = document.getElementById('puntos_totales');
        console.log(`131. Character Total Points: ${characterCost.value}`);

        if (!isEmpty(characterName.value) && characterName.value !== " " && !isEmpty(characterCost.value)) {

            characterObj.name = characterName.value;
            characterObj.total_cost = characterCost.value;

            let attributesData = getMainAttributesData();
            //console.log(`139. Attributes Data (${attributesData.length}): ${JSON.stringify(attributesData)}`);

            if (attributesData.length > 0) {
                characterObj.main_attributes = attributesData;
            }

            let advantagesData = getAdvantagesAndDisadvantagesData('advantageList');
            //console.log(`146. Advantages Data (${advantagesData.length}): ${JSON.stringify(advantagesData)}`);

            if (advantagesData.length > 0) {
                characterObj.advantages = advantagesData;
            }

            let disadvantageData = getAdvantagesAndDisadvantagesData('disadvantageList');
            //console.log(`153. Disadvantages Data (${disadvantageData.length}): ${JSON.stringify(disadvantageData)}`);

            if (disadvantageData.length > 0) {
                characterObj.disadvantages = disadvantageData;
            }

            let confirmSave = confirm(`En la versión gratuita solo se puede guardar 1 personaje. Si guarda se perdera cualquier otro personaje que haya creado.\n
                ¿Está seguro que quiere guardar su personaje?`);

            if (isEmpty(confirmSave)) {
                confirmSave = false;
            }

            if (confirmSave) {
                localStorage.clear();
                console.log(`168. Saved Character: ${JSON.stringify(characterObj)}`);
                localStorage.setItem('onlyCharacterForNow', JSON.stringify(characterObj));
            }
        }
    }
    catch (e) {
        console.log(`174. Error: ${JSON.stringify(e)}`)
    }
}

function getMainAttributesData() {

    let result = [];

    try {

        let fieldGroups = document.querySelectorAll('.field-group-attribute');

        // Recorrer cada contenedor
        fieldGroups.forEach((group) => {
            let attributeId = group.querySelector('.main_attribute_value').id;
            let attributeValue = group.querySelector('.main_attribute_value').value;
            let costValue = group.querySelector('.cost_value').innerHTML;
            //console.log(`193. Attribute: ${attributeId} | Cost Value: ${costValue} | Attribute Value: ${attributeValue}`);

            if (!isEmpty(costValue) && !isEmpty(attributeId) && !isEmpty(attributeValue)) {

                let attObj = {
                    id: attributeId,
                    cost_value: costValue,
                    attribute_value: attributeValue
                }

                result.push(attObj);
            }
        });

    }
    catch (e) {
        console.log(`209. Error: ${JSON.stringify(e.message)}`)
    }

    return result;
}

function getAdvantagesAndDisadvantagesData(list) {

    let result = [];

    try {

        if (!isEmpty(list)) {

            let mainList = document.getElementById(`${list}`);
            let listElements = mainList.querySelectorAll('.main_list_elementAdded');

            if (listElements.length > 0) {
                listElements.forEach((element) => {
                    let elementName = element.querySelector('.main_list_elementAdded_text').innerHTML;
                    let elementCost = element.querySelector('.cost_value').innerHTML;

                    //console.log(`231. Advantage: ${advantageName} | Cost Value: ${advantageCost}`);
                    if (!isEmpty(elementName) && !isEmpty(elementCost)) {

                        let advObj = {
                            name: elementName,
                            cost_value: elementCost
                        }

                        result.push(advObj);
                    }
                });
            }
        }
    }
    catch (e) {
        console.log(`246. Error: ${JSON.stringify(e.message)}`)
    }

    return result;
}


function sumValue(cost, score, basis) {
    let result = (score - basis) * cost;
    //console.log(result);
    return result;
}

function updateTotalCost() {

    let finalCost = 0;
    let mainAttributesCost = document.querySelectorAll(".cost_value");
    //console.log(`263. Cost Boxed Quantity: ${mainAttributesCost.length}`);
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