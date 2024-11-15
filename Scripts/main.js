const primaryAttributesCost = 10;
const secondaryAttributesCost = 5;
let costoTotal = 0;

let strength = null;
let dexterity = null;
let inteligence = null;
let health = null;
let hitpoints = null;
let perception = null;
let will = null;
let fatigue = null;

while (isEmpty(strength)) {
    
    let newValue = prompt("Indique el valor de fuerza que quiera asignarle a su personaje. Debe ser un numero entre 1 y 20");

    if (!isEmpty(newValue)) {

        if (!isNaN(newValue)) {
            newValue = parseInt(newValue);

            if (newValue > 0 && newValue <= 20) {
                console.log(`43. Nuevo valor de fuerza cargado correctamente: ${newValue}`);
                strength = newValue;
                costoTotal += sumValue(primaryAttributesCost, newValue, 10);
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

console.log(`59. Fuerza: ${strength} | Costo total: ${costoTotal}`);

// Funciones

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