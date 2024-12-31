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

for (let i = 0; i < 8; i++) {
    // Se setean dinamicamente los valores de cada atributo

    if (!isEmpty(mainAttributesValues[i].name)) {
        attributesNames.push(mainAttributesValues[i].name);
    }

    let attibuteBasis = mainAttributesValues[i];
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

        let skills = document.querySelectorAll('.skill_table_tbody_tr');

        if (skills.length > 0) {
            skills.forEach(element => {
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
        //console.log(`165. Error: ${e.message}`);
    }
}

async function loadCharacter() {
    try {
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if (!file) {
            Swal.fire({
                title: "JSON File Required",
                text: "Please Upload a .json Character File",
                icon: "warning"
            });
            return;
        }

        if (file.type !== "application/json") {
            Swal.fire({
                title: "Invalid File Type",
                text: "The uploaded file is not a valid .json file.",
                icon: "error"
            });
            return;
        }

        const loadValues = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const jsonContent = JSON.parse(event.target.result);
                    resolve(jsonContent); // Resolver la promesa con el contenido JSON
                } catch (error) {
                    reject(new Error("Invalid JSON format")); // Rechazar si el JSON no es válido
                }
            };
            reader.onerror = () => reject(new Error("Failed to read file"));
            reader.readAsText(file);
        }).catch((error) => {
            Swal.fire({
                title: "File Format Error",
                text: "Please verify that the uploaded file is a valid .json",
                icon: "error"
            });
            //console.error(`Error al leer el archivo: ${error.message}`);
            return null;
        });

        if (!loadValues) {
            return;
        }
        else {

            // Confirmación del usuario
            const saveConfirm = await Swal.fire({
                title: 'Are you sure you want to load your character?',
                text: 'This action will delete all the character information of your current session',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Yes',
                cancelButtonText: 'No'
            });

            if (saveConfirm.isConfirmed) {

                // Limpiar los campos actuales
                voidFields();

                // Asignar valores al personaje
                const charName = loadValues.name;
                const charPlayer = loadValues.player;
                document.getElementById('nombre_personaje').setAttribute('value', charName);
                document.getElementById('jugador').setAttribute('value', charPlayer);

                // Cargar atributos principales
                if (loadValues.main_attributes && loadValues.main_attributes.length > 0) {
                    for (const attribute of loadValues.main_attributes) {
                        const attributeElement = document.getElementById(attribute.id);
                        if (attributeElement) {
                            attributeElement.setAttribute('value', attribute.attribute_value);
                            const parentDiv = attributeElement.parentElement;
                            const pointsCostSon = parentDiv.querySelector('.cost_value');
                            if (pointsCostSon) {
                                pointsCostSon.innerHTML = attribute.cost_value;
                            }
                        }
                    }
                }

                // Cargar ventajas
                if (loadValues.advantages && loadValues.advantages.length > 0) {
                    for (const advantage of loadValues.advantages) {
                        addAdvantage(advantage.name, advantage.cost_value);
                    }
                }

                // Cargar desventajas
                if (loadValues.disadvantages && loadValues.disadvantages.length > 0) {
                    for (const disadvantage of loadValues.disadvantages) {
                        addDisadvantage(disadvantage.name, disadvantage.cost_value);
                    }
                }

                if (loadValues.skills && loadValues.skills.length > 0) {
                    for (const skill of loadValues.skills) {

                        let skillObj = {
                            label: skill.name,
                            attribute: skill.attribute,
                            difficulty: skill.difficulty
                        }

                        let skillCostValue = skill.cost_value;

                        addSkill(skillObj, skillDifficulties, attributesNames, skillCostValue);
                    }
                }

                // Actualizar el costo total
                updateTotalCost();
            }
            else {
                return;
            }
        }
    }
    catch (e) {
        //console.error(`Character Load Error: ${e.message}`);
    }
}


async function saveCharacter() {

    let characterObj = { name: null, player: null, main_attributes: [], advantages: [], disadvantages: [], skills: [], total_cost: 0 };

    try {

        let characterName = document.getElementById('nombre_personaje');
        let characterCost = document.getElementById('puntos_totales');
        let characterPlayer = document.getElementById('jugador');

        if (!isEmpty(characterPlayer.value) && !isEmpty(characterName.value) && characterName.value !== " " && !isEmpty(characterCost.value)) {

            characterObj.name = characterName.value;
            characterObj.player = characterPlayer.value;
            characterObj.total_cost = characterCost.value;

            let attributesData = getMainAttributesData();

            if (attributesData.length > 0) {
                characterObj.main_attributes = attributesData;
            }

            let advantagesData = getAdvantagesAndDisadvantagesData('advantageList');

            if (advantagesData.length > 0) {
                characterObj.advantages = advantagesData;
            }

            let disadvantageData = getAdvantagesAndDisadvantagesData('disadvantageList');

            if (disadvantageData.length > 0) {
                characterObj.disadvantages = disadvantageData;
            }

            let skillsData = getSkillsData('skill_table');

            if (skillsData.length > 0) {
                characterObj.skills = skillsData;
            }

            let saveConfirm = await Swal.fire({
                title: 'Are you sure you want to save your character?',
                text: 'This action will download a JSON file containing your character information.',
                icon: 'question',
                showCancelButton: true,
            });

            if (isEmpty(saveConfirm.isConfirmed)) {
                saveConfirm = false;
            }

            if (saveConfirm.isConfirmed) {

                let jsonStr = JSON.stringify(characterObj);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');

                a.href = url;
                a.download = `${characterName.value}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        }
        else {

            const missingFieldAlert = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 3500,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            missingFieldAlert.fire({
                icon: "warning",
                title: "Character name and player name must have value to save the document."
            });
        }
    }
    catch (e) {
        //console.log(`326. Error: ${JSON.stringify(e.message)}`)
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
        //console.log(`359. Error: ${JSON.stringify(e.message)}`)
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
        //console.log(`396. Error: ${JSON.stringify(e.message)}`)
    }

    return result;
}

function getSkillsData(list) {

    let result = [];

    try {

        if (!isEmpty(list)) {

            let mainList = document.getElementById("skill_table");
            let listElements = mainList.querySelectorAll('.skill_table_tbody_tr');

            if (listElements.length > 0) {
                listElements.forEach((element) => {
                    let elementName = element.querySelector('.skill_table_tbody_tr_name').value;
                    let elementCost = element.querySelector('.cost_value').value;
                    let elementAttribute = element.querySelector('.skill_table_tbody_tr_att').value;
                    let elementDifficulty = element.querySelector('.skill_table_tbody_tr_dif').value;

                    if (!isEmpty(elementName) && !isEmpty(elementCost) && !isEmpty(elementAttribute) && !isEmpty(elementDifficulty)) {

                        let skillObj = {
                            name: elementName,
                            cost_value: elementCost,
                            attribute: elementAttribute,
                            difficulty: elementDifficulty
                        }

                        result.push(skillObj);
                    }
                });
            }
        }
    }
    catch (e) {
        //console.log(`436. Error: ${JSON.stringify(e.message)}`)
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

        for (let i = 0; i < removeAdvantageBtns.length; i++) {
            let removeButton = removeAdvantageBtns[i]; // Se le agrega el evento para borrar el elemento de la lista
            removeButton.addEventListener('click', (event) => {
                event.target.parentElement.remove();
                updateTotalCost();
            });
        }

    }
    catch (e) {
        //console.log(`472. Error: ${e.message}`);
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
        //console.log(`502. Error: ${e.message}`);
    }

}

function addSkill(skillData, skillDifficulties, attributesNames, skillCostValue) {

    try {

        let skillName = skillData.label;
        let skillAttribute = skillData.attribute;
        let skillDifficulty = skillData.difficulty;

        let table = document.getElementById("skill_table");
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
        let skillCost = !isEmpty(skillCostValue) ? skillCostValue : 1;
        costCell.innerHTML = `<input type="number" id="skillAddCost" class="cost_value" value="${skillCost}" placeholder="Cost">`;

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
        //console.error(`Error: ${e.message}`);
    }
}

function sumValue(cost, score, basis) {
    let result = (score - basis) * cost;
    return result;
}

function updateTotalCost() {

    let finalCost = 0;
    let valuesCost = document.querySelectorAll(".cost_value");
    let totalCost = document.getElementById("puntos_totales");

    for (let i = 0; i < valuesCost.length; i++) {
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
        //console.error(`Error loading JSON file: ${error}`);
    }
}