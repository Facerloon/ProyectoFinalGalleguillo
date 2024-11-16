const primaryAttributesCost = 10; // Valor fijo, siempre cuestan 10
const mainAttributesBasis = 10; // Valor fijo, siempre empiezan en 10
let finalCost = 0;
let mainAttributesData = ["strength", "dexterity", "intelligence", "health"];
let mainAttributesResult = [];

for (let i = 0; i < mainAttributesData.length; i++) {

    let attributeName = mainAttributesData[i];
    let getData = getAttributeData(attributeName, primaryAttributesCost);

    if (!isEmpty(getData)) {
        finalCost += getData.points;
        mainAttributesResult.push(getData);
    }
    else {
        console.log(`17. Line: ${i} | Error inesperado en atributo ${attributeName}`);
        break;
    }
}

let responseMessage = ``;

for (let i = 0; i < mainAttributesResult.length; i++) {

    let attributeName = mainAttributesResult[i].attribute;
    let attributevalue = mainAttributesResult[i].value;
    let attributePoints = mainAttributesResult[i].points;

    if (i !== 0) {
        responseMessage += `\n`;
    }

    responseMessage += `Atributo: ${attributeName} | Valor: ${attributevalue} | Puntos Utilizados: ${attributePoints}`;
}

console.log(`37. Costo total: ${finalCost}\n\nInformacion de Atributos:\n${responseMessage}`);
alert(`Costo total: ${finalCost}\n\nInformacion de Atributos:\n${responseMessage}`);

// Funciones

function getAttributeData(attribute, cost) {

    let attributteObj = {
        attribute: attribute,
        cost: cost,
        value: null,
        points: 0
    }

    while (isEmpty(attributteObj.value)) {

        let newValue = prompt(`Indique el valor de ${attribute} que quiera asignarle a su personaje. Debe ser un numero entre 1 y 20`);

        if (!isEmpty(newValue)) {

            if (!isNaN(newValue)) {
                newValue = parseInt(newValue);

                if (newValue > 0 && newValue <= 20) {

                    attributteObj.value = newValue;
                    attributteObj.points += sumValue(primaryAttributesCost, newValue, mainAttributesBasis);
                    console.log(`62. Nuevo valor de ${attribute} cargado correctamente: ${newValue}`);

                }
                else {
                    alert(`El valor del atributo debe ser un numero entre 1 y 20`);
                }
            }
            else {
                alert(`Por favor, ingrese un valor numerico.`);
            }
        }
        else {
            alert(`Por favor, ingrese el valor a asignar.`);
        }
    }

    return attributteObj;
}

function sumValue(cost, score, basis) {
    let result = (score - basis) * cost;
    console.log(result);
    return result;
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