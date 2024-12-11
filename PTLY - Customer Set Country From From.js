/**
*@NApiVersion 2.1
*@NScriptType UserEventScript
*/
/*
* Author: Partnersly S.A
* Date: December 2024
* Details: 
*/
define([`N/record`], function (record) {

    function beforeSubmit(context) {

        const proceso = `PTLY - Nombre Proceso`; // Nombre de proceso para logs
        log.debug(proceso, `INICIO`);

        try {

        }
        catch (e) {
            log.error(proceso, `Error: ${e.message}`);
        }

        log.debug(proceso, `FIN`);
    }

    return {
        beforeSubmit: beforeSubmit
    }
});