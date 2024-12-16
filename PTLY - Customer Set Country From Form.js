/**
*@NApiVersion 2.1
*@NScriptType UserEventScript
*/
/*
* Author: Partnersly S.A
* Date: December 2024
* Details: Script encargado de setear campo pais tomando como referencia campo custom en el registro de direccion preferido de facturacion en registros de cliente
*/
define([`N/record`], function (record) {

    function beforeSubmit(context) {

        if (context.type === context.UserEventType.CREATE || context.type === context.UserEventType.EDIT) {

            const proceso = `PTLY - Customer Set Country From Online Form (UE)`; // Nombre de proceso para logs
            log.debug(proceso, `17. INICIO`);
            const newRecord = context.newRecord;
            const recId = newRecord.id;

            try {

                log.debug(proceso, `23. recId: ${recId} | Record: ${JSON.stringify(newRecord)}`);

                if (!isEmpty(newRecord)) {

                    let paisCustom = newRecord.getValue({
                        fieldId: 'custentity_ptly_country_bckp'
                    });

                    log.debug(proceso, `31. recId: ${recId} | Valor Campo Custom Pais (${paisCustom.length}): ${paisCustom}`);

                    if (!isEmpty(paisCustom)) {

                        const sublistID = `addressbook`;
                        
                        let lineCount = newRecord.getLineCount({
                            sublistId: sublistID
                        });

                        log.debug(proceso, `41. recId: ${recId} | Address Line Count: ${lineCount}`);

                        if (lineCount > 0) {

                            for (let i = 0; i < lineCount; i++) {

                                let addressDefaultBilling = newRecord.getSublistValue({
                                    sublistId: sublistID,
                                    fieldId: 'defaultbilling',
                                    line: i
                                });

                                log.debug(proceso, `53. recId: ${recId} | Line: ${i} | Default Billing: ${addressDefaultBilling}`);

                                if (addressDefaultBilling == true) {

                                    let addressSubRecord = newRecord.getSublistSubrecord({
                                        sublistId: sublistID,
                                        fieldId: 'addressbookaddress',
                                        line: i
                                    });

                                    log.debug(proceso, `63. recId: ${recId} | Line: ${i} | Address Subrecord: ${JSON.stringify(addressSubRecord)}`);

                                    addressSubRecord.setValue({
                                        fieldId: 'country',
                                        value: paisCustom
                                    });

                                    break;
                                }
                            }
                        }
                    }
                }
            }
            catch (e) {
                log.error(proceso, `80. Error: ${e.message}`);
            }

            log.debug(proceso, `83. FIN`);
        }
    }

    let isEmpty = (value) => {

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

    return {
        beforeSubmit: beforeSubmit
    }
});