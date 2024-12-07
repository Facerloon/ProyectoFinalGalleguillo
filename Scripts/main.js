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
            alert('El valor mínimo de cada atributo es 20');
        } // 20 es el valor maximo
        else if (event.target.value < 1) {
            event.target.value = 1;
            alert('El valor mínimo de cada atributo es 1');
        } // 1 es el valor minimo

        let attributeId = event.target.id;
        let newValue = event.target.value;
        let newPointCost = sumValue(primaryAttributesCost, newValue, mainAttributesBasis);
        //console.log(`34. Atributo: ${attributeId} | Nuevo Valor: ${newValue} | Nuevo Cost: ${newPointCost}`)

        let attributeCostElement = mainAttributesCost[i];
        attributeCostElement.innerHTML = newPointCost;
        updateTotalCost();
    });
}

// --------- Manejo de Listas de Ventajas y Desventajas ---------

// Funcionalidad ventajas por UI

let addAdvantageBtn = document.getElementById("addAdvBtn");
addAdvantageBtn.addEventListener('click', (event) => {

    let advantageText = document.getElementById("advAddText");
    let advantageCost = document.getElementById("advAddCost");
    //console.log(`51. New Advantage Text: ${advantageText.value} | New Advantage Cost: ${advantageCost.value}`);

    if (!isEmpty(advantageCost.value) && !isEmpty(advantageText.value)) {
        addAdvantage(advantageText.value, advantageCost.value);
    }
});

// Funcionalidad desventajas por UI

let addDisadvantageBtn = document.getElementById("addDisadvBtn");
addDisadvantageBtn.addEventListener('click', (event) => {

    let disadvantageText = document.getElementById("disadvAddText");
    let disadvantageCost = document.getElementById("disadvAddCost");
    //console.log(`65. New Advantage Text: ${disadvantageText.value} | New Advantage Cost: ${disadvantageCost.value}`);

    if (!isEmpty(disadvantageText.value) && !isEmpty(disadvantageCost.value)) {
        addDisadvantage(disadvantageText.value, disadvantageCost.value);
    }
});

// --------- Funciones ---------

function voidFields() {

    try {

        let characterNameElement = document.getElementById('nombre_personaje');
        characterNameElement.setAttribute('value', '');
        let characterPlayerElement = document.getElementById('jugador');
        characterPlayerElement.setAttribute('value', '');

        let advantagesAndDisadvantages = document.querySelectorAll('.main_list_elementAdded');

        if (advantagesAndDisadvantages.length > 0) {
            advantagesAndDisadvantages.forEach(element => {
                element.remove();
            });
        }

        let mainAttributesValues = document.querySelectorAll(".main_attribute_value");

        if (mainAttributesValues.length > 0) {
            mainAttributesValues.forEach(element => {
                element.setAttribute('value', mainAttributesBasis);
            });
        }

        let costBoxed = document.querySelectorAll('.cost_value');

        if (costBoxed.length > 0) {
            costBoxed.forEach(element => {
                element.innerHTML = '0';
            });
        }

        updateTotalCost();
    }
    catch (e) {
        console.log(`110. Error: ${e.message}`);
    }
}

function loadCharacter() {

    try {

        let loadValues = localStorage.getItem('onlyCharacterForNow');

        if (!isEmpty(loadValues)) {

            let parsedValues = JSON.parse(loadValues);
            let charName = parsedValues.name;
            let loadConfirm = confirm(`Su personaje guardado es "${charName}" si lo carga perderá todos los cambios realizados hasta ahora.\n
                ¿Está seguro que quiere continuar?`);

            if (loadConfirm) {

                voidFields();
                console.log(`130. Personaje cargado: ${JSON.stringify(parsedValues)}`);

                let charPlayer = parsedValues.player;
                let characterNameElement = document.getElementById('nombre_personaje');
                characterNameElement.setAttribute('value', charName);
                let characterPlayerElement = document.getElementById('jugador');
                characterPlayerElement.setAttribute('value', charPlayer);

                let mainAttributes = parsedValues.main_attributes;
                let advantageList = parsedValues.advantages;
                let disadvantageList = parsedValues.disadvantages;

                if (mainAttributes.length > 0) {

                    for (let i = 0; i < mainAttributes.length; i++) {
                        //console.log(`145. Line: ${i} | Main Attribute: ${JSON.stringify(mainAttributes[i])}`);
                        let attributeElement = document.getElementById(mainAttributes[i].id);
                        attributeElement.setAttribute('value', mainAttributes[i].attribute_value);
                        let parentDiv = attributeElement.parentElement;
                        let pointsCostSon = parentDiv.querySelector('.cost_value');
                        pointsCostSon.innerHTML = mainAttributes[i].cost_value;
                    }

                }

                if (advantageList.length > 0) {
                    for (let i = 0; i < advantageList.length; i++) {
                        //console.log(`157. Line: ${i} | Advantage: ${JSON.stringify(advantageList[i])}`);
                        addAdvantage(advantageList[i].name, advantageList[i].cost_value);
                    }
                }

                if (disadvantageList.length > 0) {
                    for (let i = 0; i < disadvantageList.length; i++) {
                        //console.log(`164. Line: ${i} | Disadvantage: ${JSON.stringify(disadvantageList[i])}`);
                        addDisadvantage(disadvantageList[i].name, disadvantageList[i].cost_value);
                    }
                }

                updateTotalCost();
            }
        }
    }
    catch (e) {
        console.log(`174. ${e.message}`);
    }
}

function saveCharacter() {

    let characterObj = { name: null, player: null, main_attributes: [], advantages: [], disadvantages: [], total_cost: 0 };

    try {

        let characterName = document.getElementById('nombre_personaje');
        //console.log(`185. Character Name: ${characterName.value}`);
        let characterCost = document.getElementById('puntos_totales');
        //console.log(`187. Character Total Points: ${characterCost.value}`);
        let characterPlayer = document.getElementById('jugador');

        if (!isEmpty(characterPlayer.value) && !isEmpty(characterName.value) && characterName.value !== " " && !isEmpty(characterCost.value)) {

            characterObj.name = characterName.value;
            characterObj.player = characterPlayer.value;
            characterObj.total_cost = characterCost.value;

            let attributesData = getMainAttributesData();
            //console.log(`197. Attributes Data (${attributesData.length}): ${JSON.stringify(attributesData)}`);

            if (attributesData.length > 0) {
                characterObj.main_attributes = attributesData;
            }

            let advantagesData = getAdvantagesAndDisadvantagesData('advantageList');
            //console.log(`204. Advantages Data (${advantagesData.length}): ${JSON.stringify(advantagesData)}`);

            if (advantagesData.length > 0) {
                characterObj.advantages = advantagesData;
            }

            let disadvantageData = getAdvantagesAndDisadvantagesData('disadvantageList');
            //console.log(`211. Disadvantages Data (${disadvantageData.length}): ${JSON.stringify(disadvantageData)}`);

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
                console.log(`226. Saved Character: ${JSON.stringify(characterObj)}`);
                localStorage.setItem('onlyCharacterForNow', JSON.stringify(characterObj));
                alert(`${characterObj.name} guardado correctamente!`);
            }
        }
        else {
            alert('Para guardar su perosnaje debe tener nombre e indicar a que jugador pertenece.')
        }
    }
    catch (e) {
        console.log(`236. Error: ${JSON.stringify(e)}`)
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
            //console.log(`253. Attribute: ${attributeId} | Cost Value: ${costValue} | Attribute Value: ${attributeValue}`);

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
        console.log(`269. Error: ${JSON.stringify(e.message)}`)
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

                    //console.log(`291. Advantage: ${advantageName} | Cost Value: ${advantageCost}`);
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
        console.log(`306. Error: ${JSON.stringify(e.message)}`)
    }

    return result;
}

function addAdvantage(advantageText, advantageCost) {

    try {

        let advantageList = document.getElementById("advantageList");
        let firstElement = advantageList.firstChild;

        let newElement = document.createElement('li');
        newElement.className = `main_list_elementAdded`;
        newElement.innerHTML = `<span class="main_list_elementAdded_text">${advantageText}</span> [<span class="cost_value">${advantageCost}</span>] <button type="button" class="main_list_elementAdded_rmvbtn">-</button>`;
        advantageList.insertBefore(newElement, firstElement);
        updateTotalCost();

        advantageText = '';
        advantageCost = '';

        let removeAdvantageBtns = document.querySelectorAll(".main_list_elementAdded_rmvbtn");
        //console.log(`329. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeAdvantageBtns.length; i++) {
            removeButton = removeAdvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                //console.log(`334. Event Target: ${event.target}`);
                event.target.parentElement.remove();
            });
        }

    }
    catch (e) {
        console.log(`341. Error: ${e.message}`);
    }
}

function addDisadvantage(disadvantageText, disadvantageCost) {

    try {
        let disadvantageList = document.getElementById("disadvantageList");
        let firstElement = disadvantageList.firstChild;

        let newElement = document.createElement('li');
        newElement.className = `main_list_elementAdded`;
        newElement.innerHTML = `<span class="main_list_elementAdded_text">${disadvantageText}</span> [<span class="cost_value">${disadvantageCost}</span>] <button type="button" class="main_list_elementAdded_rmvbtn">-</button>`;
        disadvantageList.insertBefore(newElement, firstElement);
        updateTotalCost();

        disadvantageText = '';
        disadvantageCost = '';

        let removeDisadvantageBtns = document.querySelectorAll(".main_list_elementAdded_rmvbtn");
        //console.log(`361. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeDisadvantageBtns.length; i++) {
            removeButton = removeDisadvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                //console.log(`366. Event Target: ${event.target}`);
                event.target.parentElement.remove();
            });
        }
    }
    catch (e) {
        console.log(`372. Error: ${e.message}`);
    }

}

function sumValue(cost, score, basis) {
    let result = (score - basis) * cost;
    //console.log(result);
    return result;
}

function updateTotalCost() {

    let finalCost = 0;
    let valuesCost = document.querySelectorAll(".cost_value");
    //console.log(`387. Cost Boxed Quantity: ${mainAttributesCost.length}`);
    let totalCost = document.getElementById("puntos_totales");

    for (let i = 0; i < valuesCost.length; i++) {
        //console.log(`391.  ${mainAttributesCost[i].innerHTML}`)
        let costValue = !isEmpty(valuesCost[i].innerHTML) ? parseFloat(valuesCost[i].innerHTML) : 0;
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