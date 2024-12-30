const primaryAttributesCost = 10; // Valor fijo, el costo base siempre es 10
const mainAttributesBasis = 10; // Valor fijo, siempre empiezan en 10
const skillDifficulties = ['E', 'A', 'H', 'VH'] // Dificultades de las habilidades

const SKILLDIFFICULTYCHART = {
    "E": 0,
    "A": -1,
    "H": -2,
    "VH": -3
}

let attributesNames = [];

// --------- Manejo de Atributos Principales ---------

let mainAttributes = document.querySelectorAll(".main_attribute");
let mainAttributesValues = document.querySelectorAll(".main_attribute_value");
let mainAttributesCost = document.querySelectorAll(".cost_value");
//console.log(`19. Main Attributes: ${mainAttributesValues} | Cost Boxed Quantity: ${mainAttributesCost.length}`);

for (let i = 0; i < 8; i++) {
    // Se setean dinamicamente los valores de cada atributo
    //console.log(`23. Attribute ID: ${mainAttributesValues[i].name}`);
    //console.log(`24. Attribute Cost: ${mainAttributesCost[i].innerHTML}`);

    if (!isEmpty(mainAttributesValues[i].name)) {
        attributesNames.push(mainAttributesValues[i].name);
    }

    let attibuteBasis = mainAttributesValues[i];
    //console.log(`31. Attribute: ${attibuteBasis.innerHTML}`);
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
        //console.log(`48. Atributo: ${attributeId} | Nuevo Valor: ${newValue} | Nuevo Cost: ${newPointCost}`)

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
    //console.log(`65. New Advantage Text: ${advantageText.value} | New Advantage Cost: ${advantageCost.value}`);

    if (!isEmpty(advantageCost.value) && !isEmpty(advantageText.value)) {
        addAdvantage(advantageText.value, advantageCost.value);
        advantageText.value = '';
        advantageCost.value = '';
    }
});

// Funcionalidad desventajas por UI

let addDisadvantageBtn = document.getElementById("addDisadvBtn");
addDisadvantageBtn.addEventListener('click', (event) => {

    let disadvantageText = document.getElementById("disadvAddText");
    let disadvantageCost = document.getElementById("disadvAddCost");

    if (!isEmpty(disadvantageText.value) && !isEmpty(disadvantageCost.value)) {
        addDisadvantage(disadvantageText.value, disadvantageCost.value);
        disadvantageText.value = '';
        disadvantageCost.value = '';
    }
});

// ---------- Manejo de lista de Skills ----------

//console.log(`91. Skill Difficulties: ${JSON.stringify(skillDifficulties)} | Skill Attributes: ${JSON.stringify(attributesNames)}`);
let skillsList = null;
let skillListData = loadSkills('/JSONs/skill_list.json').then(data => {

    skillsList = data;

    if (skillsList !== null && skillsList.length > 0) {

        let htmlSkillList = document.getElementById('skillList');

        for (let i = 0; i < skillsList.length; i++) {
            let newOption = document.createElement('option');
            newOption.setAttribute('value', skillsList[i].id);
            newOption.innerHTML = skillsList[i].label;
            htmlSkillList.appendChild(newOption);
        }

        let addSkillBtn = document.getElementById("addSkillBtn");
        addSkillBtn.addEventListener('click', (event) => {

            let skillText = document.getElementById("skillList");

            if (!isEmpty(skillText.value)) {

                let skillDataFilter = skillsList.filter(element => element.id == skillText.value);
                console.log(`116. Skill Data Filter: ${JSON.stringify(skillDataFilter)}`);

                if (skillDataFilter.length > 0) {
                    addSkill(skillDataFilter[0], skillDifficulties, attributesNames);
                    skillText.value = '';
                }
            }

        });
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
        console.log(`166. Error: ${e.message}`);
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
                console.log(`186. Personaje cargado: ${JSON.stringify(parsedValues)}`);

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
                        //console.log(`201. Line: ${i} | Main Attribute: ${JSON.stringify(mainAttributes[i])}`);
                        let attributeElement = document.getElementById(mainAttributes[i].id);
                        attributeElement.setAttribute('value', mainAttributes[i].attribute_value);
                        let parentDiv = attributeElement.parentElement;
                        let pointsCostSon = parentDiv.querySelector('.cost_value');
                        pointsCostSon.innerHTML = mainAttributes[i].cost_value;
                    }

                }

                if (advantageList.length > 0) {
                    for (let i = 0; i < advantageList.length; i++) {
                        //console.log(`213. Line: ${i} | Advantage: ${JSON.stringify(advantageList[i])}`);
                        addAdvantage(advantageList[i].name, advantageList[i].cost_value);
                    }
                }

                if (disadvantageList.length > 0) {
                    for (let i = 0; i < disadvantageList.length; i++) {
                        //console.log(`220. Line: ${i} | Disadvantage: ${JSON.stringify(disadvantageList[i])}`);
                        addDisadvantage(disadvantageList[i].name, disadvantageList[i].cost_value);
                    }
                }

                updateTotalCost();
            }
        }
    }
    catch (e) {
        console.log(`230. ${e.message}`);
    }
}

function saveCharacter() {

    let characterObj = { name: null, player: null, main_attributes: [], advantages: [], disadvantages: [], total_cost: 0 };

    try {

        let characterName = document.getElementById('nombre_personaje');
        //console.log(`241. Character Name: ${characterName.value}`);
        let characterCost = document.getElementById('puntos_totales');
        //console.log(`243. Character Total Points: ${characterCost.value}`);
        let characterPlayer = document.getElementById('jugador');

        if (!isEmpty(characterPlayer.value) && !isEmpty(characterName.value) && characterName.value !== " " && !isEmpty(characterCost.value)) {

            characterObj.name = characterName.value;
            characterObj.player = characterPlayer.value;
            characterObj.total_cost = characterCost.value;

            let attributesData = getMainAttributesData();
            //console.log(`253. Attributes Data (${attributesData.length}): ${JSON.stringify(attributesData)}`);

            if (attributesData.length > 0) {
                characterObj.main_attributes = attributesData;
            }

            let advantagesData = getAdvantagesAndDisadvantagesData('advantageList');
            //console.log(`260. Advantages Data (${advantagesData.length}): ${JSON.stringify(advantagesData)}`);

            if (advantagesData.length > 0) {
                characterObj.advantages = advantagesData;
            }

            let disadvantageData = getAdvantagesAndDisadvantagesData('disadvantageList');
            //console.log(`267. Disadvantages Data (${disadvantageData.length}): ${JSON.stringify(disadvantageData)}`);

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
                console.log(`282. Saved Character: ${JSON.stringify(characterObj)}`);
                localStorage.setItem('onlyCharacterForNow', JSON.stringify(characterObj));
                alert(`${characterObj.name} guardado correctamente!`);
            }
        }
        else {
            alert('Para guardar su perosnaje debe tener nombre e indicar a que jugador pertenece.')
        }
    }
    catch (e) {
        console.log(`292. Error: ${JSON.stringify(e)}`)
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
            //console.log(`309. Attribute: ${attributeId} | Cost Value: ${costValue} | Attribute Value: ${attributeValue}`);

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
        console.log(`325. Error: ${JSON.stringify(e.message)}`)
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

                    //console.log(`347. Advantage: ${advantageName} | Cost Value: ${advantageCost}`);
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
        console.log(`362. Error: ${JSON.stringify(e.message)}`)
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
        //console.log(`385. Remove Buttons Quantity: ${removeAdvantageBtns.length}: ${removeAdvantageBtns}`);

        for (let i = 0; i < removeAdvantageBtns.length; i++) {
            let removeButton = removeAdvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                //console.log(`390. Event Target: ${event.target}`);
                event.target.parentElement.remove();
                updateTotalCost();
            });
        }

    }
    catch (e) {
        console.log(`398. Error: ${e.message}`);
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

        for (let i = 0; i < removeDisadvantageBtns.length; i++) {
            let removeButton = removeDisadvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                event.target.parentElement.remove();
                updateTotalCost();
            });
        }
    }
    catch (e) {
        console.log(`428. Error: ${e.message}`);
    }

}

function addSkill(skillData, skillDifficulties, attributesNames, skillDifChart) {

    try {

        let skillName = skillData.label;
        let skillAttribute = skillData.attribute;
        let skillDifficulty = skillData.difficulty;
        //console.log(`440. Skill Name: ${skillName} | Attribute: ${skillAttribute} | Difficulty: ${skillDifficulty}`);

        let table = document.getElementById("skillTable");
        let newRow = table.insertRow();
        newRow.className = 'skill_table_tbody_tr';

        let nameCell = newRow.insertCell(0);
        nameCell.setAttribute('colspan', 4);
        nameCell.innerHTML = `<input type="text" id="skillAddText" class="skill_table_tbody_tr_name" value="${skillName}" placeholder="Skill">`

        let mainAttributeValue = document.getElementById(skillAttribute).value;

        let currentLevel = parseFloat(mainAttributeValue) + SKILLDIFFICULTYCHART[skillDifficulty];

        if (currentLevel == 0 || currentLevel < 0) {
            currentLevel = 0;
        }

        let levelCell = newRow.insertCell(1);
        levelCell.innerHTML = `<input type="number" id="skillAddLevel" class="skill_table_tbody_tr_level" value="${currentLevel}" placeholder="Level">`

        let difficultyCell = newRow.insertCell(2);

        let attributeSelect = document.createElement("select");
        attributeSelect.className = `skill_table_tbody_tr_att`;
        attributesNames.forEach(attribute => {
            let option = document.createElement("option");
            option.value = attribute;
            option.text = attribute;
            attributeSelect.appendChild(option);
        });
        difficultyCell.appendChild(attributeSelect);
        attributeSelect.value = skillAttribute;

        let separator = document.createTextNode("/");
        difficultyCell.appendChild(separator);

        let difficultySelect = document.createElement("select");
        difficultySelect.className = `skill_table_tbody_tr_dif`;
        skillDifficulties.forEach(difficulty => {
            let option = document.createElement("option");
            option.value = difficulty;
            option.text = difficulty;
            difficultySelect.appendChild(option);
        });
        difficultyCell.appendChild(difficultySelect);
        difficultySelect.value = skillDifficulty;

        let costCell = newRow.insertCell(3);
        costCell.innerHTML = `<input type="number" id="skillAddCost" class="cost_value" value="1" placeholder="Cost">`;

        let skillCostsElements = document.querySelectorAll('.skill_table_tbody_tr .cost_value');
        
        for (let i = 0; i < skillCostsElements.length; i++) {
            let costValues = skillCostsElements[i]; // Se le agrega el evento para borrar el elemento de la lista
            costValues.addEventListener('change', (event) => {
                updateTotalCost();
            });
        }

        let removeBtnCell = newRow.insertCell(4);
        removeBtnCell.innerHTML = `<button type="button" class="skill_table_tbody_tr_rmvbtn">-</button>`;

        let removeBtns = document.querySelectorAll(".skill_table_tbody_tr_rmvbtn");

        for (let i = 0; i < removeBtns.length; i++) {
            let removeButton = removeBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                event.target.parentElement.parentElement.remove();
                updateTotalCost();
            });
        }

        updateTotalCost();
    }
    catch (e) {
        console.error(`Error: ${e.message}`);
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
    //console.log(`522. Cost Boxed Quantity: ${mainAttributesCost.length}`);
    let totalCost = document.getElementById("puntos_totales");

    for (let i = 0; i < valuesCost.length; i++) {
        //console.log(`526.  ${mainAttributesCost[i].innerHTML}`)
        let costValue = !isEmpty(valuesCost[i].innerHTML) ? parseFloat(valuesCost[i].innerHTML) : null;
    
        if (costValue == null) {
            costValue = !isEmpty(valuesCost[i].value) ? parseFloat(valuesCost[i].value) : 0;
        }

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

async function loadSkills(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error loading JSON file: ${error}`);
    }
}