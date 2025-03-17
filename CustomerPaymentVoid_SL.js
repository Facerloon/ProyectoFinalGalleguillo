/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/log', 'N/search', 'N/record', 'N/redirect', `N/runtime`],
    function (serverWidget, log, search, record, redirect, runtime) {
        /**
         * Definition of the Suitelet script trigger point.
         *
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         * @Since 2015.2
         */
        function onRequest(context) {
            const proceso = `CustomerPaymentVoid - Debug`;
            const curScript = runtime.getCurrentScript();
            const FLD_CTR_FILENUMBER = 'custbody_ctr_hs_file_number';
            const FLD_CTR_VOIDREASON = 'custbody_ctr_voidreason';
            const FLD_FORELECBANKPAYMENTDD = 'custbody_9997_is_for_ep_dd'; //FOR ELECTRONIC BANK PAYMENT (DIRECT DEBIT)
            const FLD_FORELECBANKPAYMENT = 'custbody_9997_is_for_ep_eft'; //FOR ELECTRONIC BANK PAYMENT

            const BTN_CANCEL = 'custpage_btncancel';
            const FLD_PAYMENTID = 'custpage_fldpaymentid';
            const FLD_STATUS = 'custpage_fldstatus';
            const FLD_REASON = 'custpage_fldreason';
            const AUTHNET_LOCATION = 'authnet_location';
            const AUTHNET_ACCOUNT = 'authnet_account';
            const ACCT_UNDEPFUNDS = '122';
            const PAYMETHOD_PAYMENTVOID = '16';

            let PARAM_ID = 'custparam_id';

            log.debug(proceso, `35. START`);

            try {
                let oRequestParameters = context.request.parameters;
                log.debug(proceso, `39. On Request Parameters: ${JSON.stringify(oRequestParameters)}`);

                if (context.request.method === 'GET') {
                    let custPaymentId = oRequestParameters[PARAM_ID];
                    log.debug('Payment ID', custPaymentId);

                    let frm = serverWidget.createForm({ title: 'Approve Bill', hideNavBar: false });
                    frm.clientScriptModulePath = './CustomerPaymentVoid_CS.js';

                    let fldStatus = frm.addField({ id: FLD_STATUS, type: 'text', label: 'Status', container: null });
                    fldStatus.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                    let fldPaymentId = frm.addField({ id: FLD_PAYMENTID, type: 'text', label: 'Payment', container: null });
                    fldPaymentId.defaultValue = custPaymentId;
                    fldPaymentId.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                    let fldVoidReason = frm.addField({ id: FLD_REASON, type: 'select', source: 'customlist_ctr_voidreason', label: 'Void Reason', container: null });
                    fldVoidReason.isMandatory = true;

                    frm.addSubmitButton({ label: 'Void' });
                    frm.addButton({ id: BTN_CANCEL, label: 'Cancel', functionName: 'cancel' });
                    context.response.writePage(frm);
                }//-- End Get method
                else {
                    let refundId = '';
                    let idDepositAcct;
                    let custPaymentId = oRequestParameters[FLD_PAYMENTID];
                    let voidReasonId = oRequestParameters[FLD_REASON];
                    const authNetLocation = oRequestParameters[AUTHNET_LOCATION];
                    const authNetAccount = oRequestParameters[AUTHNET_ACCOUNT];
                    log.debug(proceso, '66. ' + custPaymentId + ' ' + voidReasonId);
                    log.debug(proceso, `70. Location Parameter: ${authNetLocation} | Account Parameter: ${authNetAccount}`);

                    //New Behavior: redirect to refund page in edit mode
                    /*redirect.redirect({
                        url: '/app/accounting/transactions/custrfnd.nl?whence=',
                        parameters: { paymentid: custPaymentId, voidreasonid: voidReasonId }
                    });*/

                    let recCustPayment = record.load({ type: 'customerpayment', id: custPaymentId, isDynamic: false });
                    let subsidiaryId = recCustPayment.getValue({ fieldId: 'subsidiary' });
                    let refNumber = recCustPayment.getValue({ fieldId: 'checknum' });
                    let fileNumber = recCustPayment.getValue({ fieldId: FLD_CTR_FILENUMBER });
                    let fAmount = recCustPayment.getValue({ fieldId: 'payment' });
                    let refTranNum = getVoidNumber();
                    log.debug(proceso, `84. Ref Number: ${refTranNum}`);
                    //log.debug(proceso, `85. Script Remaining Usage: ${curScript.getRemainingUsage()}`);
                    let refundMemo = 'Void Check ' + refNumber + ' ' + fileNumber;

                    //Get Deposit Account and make deposit if Payment is undeposited
                    let bUndepFunds = recCustPayment.getValue({ fieldId: 'undepfunds' });
                    let cashAcct = ACCT_UNDEPFUNDS;
                    let depAcctSearch;
                    let bDepositFound;
                    log.debug(proceso, `93. Custpayment bUndepFunds: ${bUndepFunds}`);

                    if (bUndepFunds == 'F' || bUndepFunds == false) {
                        cashAcct = recCustPayment.getValue({ fieldId: 'account' });
                        //log.debug('Custpayment cashAcct', 'cashAcct:' + cashAcct);
                    }

                    if (cashAcct == ACCT_UNDEPFUNDS) {
                        let depAcctSearch = getPaymentDeposits(custPaymentId);
                        log.debug(proceso, `102. depAcctSearch: ${JSON.stringify(depAcctSearch)}`);
                        log.debug(proceso, `103. Script Remaining Usage: ${curScript.getRemainingUsage()}`);
                        let bDepositFound = false;

                        if (depAcctSearch.length > 0) {
                            let depAcct = depAcctSearch[0].accountmain;
                            let depId = depAcctSearch[0].applyingtransaction;

                            if (depAcct && depAcct != '') {
                                cashAcct = depAcct;
                                bDepositFound = true;
                                log.debug('Deposit Found:' + depId, 'depAcct:' + depAcct);
                            }
                        }
                    }

                    //Load Customer Payment record to unapply any invoices
                    recCustPayment = record.load({ type: 'customerpayment', id: custPaymentId, isDynamic: false });
                    let customerId = recCustPayment.getValue({ fieldId: 'customer' });
                    subsidiaryId = recCustPayment.getValue({ fieldId: 'subsidiary' });
                    refNumber = recCustPayment.getValue({ fieldId: 'checknum' });
                    fileNumber = recCustPayment.getValue({ fieldId: FLD_CTR_FILENUMBER });
                    let arAcct = recCustPayment.getValue({ fieldId: 'aracct' });
                    let nLines = recCustPayment.getLineCount({ sublistId: 'apply' });
                    //log.debug(proceso, `126. Script Remaining Usage: ${curScript.getRemainingUsage()}`);

                    //Unapply invoices
                    if (nLines > 0) {
                        for (let i = 0; i < nLines; i++) {
                            recCustPayment.setSublistValue({ sublistId: 'apply', fieldId: 'apply', value: false, line: i, ignoreFieldChange: false, forceSyncSourcing: true });
                        }

                        //recCustPayment.setValue({fieldId: 'tranid', value: sTranId});
                        recCustPayment.save({ enableSourcing: false, ignoreMandatoryFields: true });
                        log.debug('customer payment invoices unappied', '');
                    }

                    //after choosing a void reason, the refund will be generated.
                    if (cashAcct && cashAcct != '') {
                        let refTranNum = getVoidNumber();
                        //log.debug(proceso, `142. Script Remaining Usage: ${curScript.getRemainingUsage()}`);
                        let refundMemo = 'Void Check ' + refNumber + ' ' + fileNumber;
                        let recRefund = record.create({ type: 'customerrefund', isDynamic: true });
                        recRefund.setValue('customer', customerId);
                        recRefund.setValue('subsidiary', subsidiaryId);
                        if (authNetLocation) {
                            recRefund.setValue('location', authNetLocation);
                        }
                        recRefund.setValue('paymentmethod', PAYMETHOD_PAYMENTVOID);
                        recRefund.setValue('account', cashAcct); //cash account used in the deposit must be the cash account used in the refund
                        recRefund.setValue('aracct', arAcct); //AR account used in the payment/ invoice must be the AR account used in the refund
                        recRefund.setValue(FLD_CTR_VOIDREASON, voidReasonId); //create a field in refund page that will house the void reason selected on the popup box
                        recRefund.setValue('memo', refundMemo); //Memo on the refund should be "Void Check (Reference #) (File Number)"
                        recRefund.setValue('tranid', refTranNum);

                        recRefund.setValue(FLD_FORELECBANKPAYMENT, false);
                        recRefund.setValue(FLD_FORELECBANKPAYMENTDD, false);

                        //refund should be applied to the customer payment after everything
                        let refundLines = recRefund.getLineCount({ sublistId: 'apply' });
                        log.debug('refundLines:' + refundLines, 'tranid:' + refTranNum);

                        for (let i = 0; i < refundLines; i++) {
                            let creditsLineId = recRefund.getSublistValue({ sublistId: 'apply', fieldId: 'internalid', line: i });
                            //log.debug('creditsLineId', i + ' ' + creditsLineId);

                            if (custPaymentId == creditsLineId) {
                                recRefund.selectLine({ sublistId: 'apply', line: i });
                                recRefund.setCurrentSublistValue({ sublistId: 'apply', fieldId: 'apply', value: true, ignoreFieldChange: false, forceSyncSourcing: true });
                            }
                        }

                        refundId = recRefund.save({ enableSourcing: false, ignoreMandatoryFields: true });
                        log.audit('Submit Refund', 'refundId:' + refundId);

                        //invoked this after creating the customer refund so payment event is not generated
                        /*record.submitFields({
                            type: 'customerrefund',
                            id: refundId,
                            //values: { 'paymentmethod': PAYMETHOD_PAYMENTVOID, 'tranid':  refTranNum, 'account': cashAcct},
                            values: { 'paymentmethod': PAYMETHOD_PAYMENTVOID, 'tranid':  refTranNum},
                            options: { enableSourcing: false, ignoreMandatoryFields: true }
                        });*/

                        if (!bDepositFound && cashAcct == ACCT_UNDEPFUNDS) {
                            idDepositAcct = makeDeposit(custPaymentId, refundId, {
                                authnetLocation: authNetLocation || '',
                                authNetAccount: authNetAccount || ''
                            });
                            //cashAcct = idDepositAcct;
                            log.audit('cashAcct:' + cashAcct, depAcctSearch + ' idDepositAcct:' + idDepositAcct);
                        }
                    }

                    log.debug(proceso, `196. Script Remaining Usage: ${curScript.getRemainingUsage()}`);

                    let sOutput = '<html><script>';
                    //sOutput += 'window.parent.document.getElementsByClassName("x-tool x-tool-close")[0].click();';
                    sOutput += 'window.parent.open("/app/accounting/transactions/custrfnd.nl?id=' + refundId + '&e=T", "_self");';
                    sOutput += '</script></html>';
                    context.response.write(sOutput);
                }
            }
            catch (e) {
                log.error('ERROR', e);
            }

            log.debug(proceso, `209. END`);
        }

        function getVoidNumber() {
            let voidPrefix = 'Void-';
            let voidNumber = voidPrefix + 100000;

            let voidSearchOptions = new Object();
            voidSearchOptions['type'] = 'transaction';
            voidSearchOptions['filters'] = [
                ['type', 'anyof', 'CustRfnd'],
                'and',
                ['mainline', 'is', 'T'],
                'and',
                ['numbertext', 'startswith', 'Void-'],
            ]

            voidSearchOptions['columns'] = [search.createColumn({ name: 'tranid', sort: search.Sort.DESC })];
            let voidSearch = getAllSearchResults2(voidSearchOptions, true);
            //log.debug('voidSearch.length', `228. Void Search (${voidSearch.length}): ${JSON.stringify(voidSearch)}`);

            if (voidSearch.length > 0) {
                let sTranId = voidSearch[0].tranid;
                let fVoidNum = parseFloat(sTranId.split('-')[1]) + 1;
                voidNumber = voidPrefix + (fVoidNum.toFixed(0));
                //log.debug('Current Void Number', sTranId);
            }

            //log.debug('Next voidNumber', voidNumber);
            return voidNumber;
        }

        function makeDeposit(idPayment, refundId, addtnlArgs = {}) {

            let idDeposit = '';
            let bLineFound = false;
            let dLineFound = false;
            let idDepAcct = null;

            try {
                let subsidiaryLookUp = search.lookupFields({ type: 'customerpayment', id: idPayment, columns: ['subsidiary'] });
                //log.debug('makeDeposit', 'subsidiaryLookUp:' + subsidiaryLookUp + 'idPayment:' + idPayment + ' refundIs tId:' + refundId);
                const authnetAccount = addtnlArgs.authNetAccount;
                const authnetLocation = addtnlArgs.authnetLocation;
                const sublistId = `payment`;
                let idSubsidiary = subsidiaryLookUp.subsidiary[0].value;
                idDepAcct = authnetAccount;
                let depAccSearch = !isEmpty(authnetAccount) ? authnetAccount : getDepositAccount(idSubsidiary);

                if (depAccSearch.length > 0 && isEmpty(authnetAccount)) {
                    idDepAcct = depAccSearch[0].internalid;
                }

                log.debug('makeDeposit', `262. idDepAcct: ${idDepAcct} | authnetAccount: ${authnetAccount} |  idLocation: ${authnetLocation} | idPayment: ${idPayment} | idRefund: ${refundId}`);

                if (idDepAcct && idDepAcct != '') {

                    let recDeposit = record.create({
                        type: 'deposit',
                        isDynamic: true,
                        defaultValues: {
                            account: idDepAcct
                        }
                    });

                    if (!isEmpty(authnetLocation)) {
                        recDeposit.setValue({
                            fieldId: 'location',
                            value: authnetLocation
                        });
                    }

                    let sublists = recDeposit.getSublists();
                    log.debug(recDeposit, `282. Record Sublists: ${JSON.stringify(sublists)}`);

                    let currentAccountValue = recDeposit.getValue({
                        fieldId: 'account'
                    });

                    let currentDateValue = recDeposit.getValue({
                        fieldId: 'trandate'
                    });

                    log.debug('makeDeposit', `292. Current Record Values | Date: ${currentDateValue} | Account: ${currentAccountValue}`);

                    let lineCount = 0;

                    for (let c = 0; c < 1000; c++) {

                        lineCount = recDeposit.getLineCount({
                            sublistId: sublistId
                        });

                        if (lineCount > 0) {
                            break;
                        }
                    }

                    log.debug('makeDeposit', `307. Deposit Line Count: ${lineCount}`);
                    //const idDepLineIds = recDeposit.getCurrentSublistTexts({ sublistId: 'payment', fieldId: 'id', start: 0, end: nLines });
                    let lineIds = [];

                    for (let i = 0; i < lineCount; i++) {

                        recDeposit.selectLine({
                            sublistId: sublistId,
                            line: i
                        });

                        let lineId = recDeposit.getCurrentSublistValue({
                            sublistId: sublistId,
                            fieldId: 'id'
                        });

                        //log.debug('makeDeposit', `323. Line ID: ${lineId}`);

                        if (!isEmpty(lineId)) {

                            lineIds.push(lineId);

                            if (lineId == idPayment) {

                                recDeposit.setCurrentSublistValue({
                                    sublistId: sublistId,
                                    fieldId: 'deposit',
                                    value: true
                                });

                                bLineFound = true;

                                recDeposit.commitLine({
                                    sublistId: sublistId,
                                });
                            }
                            else if (lineId == refundId) {

                                recDeposit.setCurrentSublistValue({
                                    sublistId: sublistId,
                                    fieldId: 'deposit',
                                    value: true
                                });

                                recDeposit.commitLine({
                                    sublistId: sublistId,
                                });

                                dLineFound = true;
                            }

                            if (dLineFound && bLineFound) {
                                break;
                            }
                        }
                    }

                    let depositAmount = recDeposit.getValue({
                        fieldId: 'total'
                    });

                    log.emergency('makeDeposit', `368. Payment Line Found: ${bLineFound} | Refund Line Found: ${dLineFound} | Deposit Amount: ${depositAmount}`);
                    idDeposit = recDeposit.save({ enableSourcing: false, ignoreMandatoryFields: true });
                    log.emergency('makeDeposit', `370. Id Deposit: ${idDeposit}`);
                }
                else {
                    log.error(`makeDeposit`, `373. Deposit Account Not Found.`);
                }
                //log.debug('Make Deposit', 'idDeposit:' + idDeposit + ' idDepAcct:' + idDepAcct);
            } catch (e) {
                //log.error('makeDeposit error paymentID:' + idPayment, `377. ${e}`);
                log.error('makeDeposit error paymentID:' + idPayment, `378. ${e.message}`);
            }

            return idDepAcct;
        }
        async function waitForLineCount(recDeposit, sublistId, timeout = 5000) {
            const startTime = Date.now();

            return new Promise((resolve, reject) => {
                (function checkLineCount() {
                    recDeposit.getLineCount({ sublistId: sublistId }).then(lineCount => {
                        if (lineCount > 0 || Date.now() - startTime > timeout) {
                            resolve(lineCount);
                        } else {
                            setTimeout(checkLineCount, 100); // Revisa cada 100ms
                        }
                    }).catch(reject);
                })();
            });
        }

        function getPaymentDeposits(custPaymentId) {
            let depAcctSearchOptions = new Object();
            depAcctSearchOptions['type'] = 'transaction';
            depAcctSearchOptions['filters'] = [
                ['internalid', 'anyof', custPaymentId],
                'and',
                ['mainline', 'is', 'T']
            ]
            depAcctSearchOptions['columns'] = ['transactionname', 'applyingtransaction', 'applyingtransaction.accountmain'];
            return getAllSearchResults2(depAcctSearchOptions);
        }

        /*function getAllSearchResults(options) {
            const curScript = runtime.getCurrentScript();
            log.debug(`getAllSearchResults`, `413. Script Remaining Usage: ${curScript.getRemainingUsage()}`);
            let stRecordType = options.type;
            let stSavedSearch = options.searchId;
            let arrFilters = options.filters;
            let arrColumns = options.columns;
            let arrResults = [];
            let count = 1000;
            let start = 0;
            let end = 1000;
            let searchObj = (stSavedSearch) ? arrFilters ? search.load({ id: stSavedSearch, filters: arrFilters }) :
                search.load({ id: stSavedSearch }) :
                search.create({ type: stRecordType, filters: arrFilters, columns: arrColumns });
            let rs = searchObj.run();
            while (count == 1000) {
                let results = rs.getRange(start, end);
                arrResults = arrResults.concat(results);
                start = end;
                end += 1000;
                count = results.length;
            }
            log.debug(`getAllSearchResults`, `433. Script Remaining Usage: ${curScript.getRemainingUsage()}`);
            log.debug(`getAllSearchResults`, `434. Search Results (${arrResults.length}): ${JSON.stringify(arrResults)}`);
            return arrResults;
        }*/

        let getAllSearchResults2 = (options, voidSearch) => {
            const curScript = runtime.getCurrentScript();
            //log.debug(`getAllSearchResults`, `440. INICIO - Script Remaining Usage: ${curScript.getRemainingUsage()}`);
            const functionProcess = `getAllSearchResults2()`;

            let data = [];

            try {

                let searchObj = null;
                let stRecordType = options.type;
                let stSavedSearch = options.searchId;
                let arrFilters = options.filters;
                let arrColumns = options.columns;

                searchObj = (stSavedSearch) ? arrFilters ? search.load({ id: stSavedSearch, filters: arrFilters }) :
                    search.load({ id: stSavedSearch }) :
                    search.create({ type: stRecordType, filters: arrFilters, columns: arrColumns });

                if (!isEmpty(searchObj)) {

                    let resultSearch = searchObj.run();
                    let completeResultSet = [];
                    let resultIndex = 0;
                    let resultStep = 1000; // Number of records returned in one step (maximum is 1000)
                    let result; // temporary variable used to store the result set

                    do {
                        // fetch one result set
                        result = resultSearch.getRange({
                            start: resultIndex,
                            end: resultIndex + resultStep
                        });
                        if (!isEmpty(result) && result.length > 0) {
                            if (resultIndex == 0) completeResultSet = result;
                            else completeResultSet = completeResultSet.concat(result);
                        }
                        // increase pointer
                        resultIndex = resultIndex + resultStep;
                        // once no records are returned we already got all of them

                        if (voidSearch == true) {
                            if (completeResultSet.length > 0)
                                break;
                        }

                    } while (!isEmpty(result) && result.length > 0 && result.length == 1000)

                    for (let j = 0; j < completeResultSet.length; j++) {
                        let obj = {};

                        for (let k = 0; k < resultSearch.columns.length; k++) {
                            obj[`${resultSearch.columns[k].name}`] = completeResultSet[j].getValue(resultSearch.columns[k]);
                        }

                        data.push(obj)
                    }
                }
            }
            catch (e) {
                log.error(functionProcess, `498. Error: ${e.message}`);
            }

            //log.debug(`getAllSearchResults`, `501. FIN - Script Remaining Usage: ${curScript.getRemainingUsage()}`);
            return data;
        }

        let getDepositAccount = (idSubsidiary) => {

            const functionProcess = `PTLY - getDepositAccount()`

            let result = null;
            let data = [];

            try {

                let filters = [
                    ['type', 'anyof', 'Bank'],
                    'and',
                    ['isinactive', 'is', 'F'],
                    'and',
                    ['subsidiary', 'anyof', idSubsidiary]
                ];
                let columns = ['internalid', 'subsidiary', 'name', search.createColumn({ name: 'number', sort: search.Sort.ASC })];

                let searchObj = search.create({
                    type: 'account',
                    columns: columns,
                    filters: filters
                });

                let resultSearch = searchObj.run();
                let completeResultSet = [];
                let resultIndex = 0;
                let resultStep = 1000; // Number of records returned in one step (maximum is 1000)
                let result; // temporary variable used to store the result set

                do {
                    // fetch one result set
                    result = resultSearch.getRange({
                        start: resultIndex,
                        end: resultIndex + resultStep
                    });
                    if (!isEmpty(result) && result.length > 0) {
                        if (resultIndex == 0) completeResultSet = result;
                        else completeResultSet = completeResultSet.concat(result);
                    }
                    // increase pointer
                    resultIndex = resultIndex + resultStep;
                    // once no records are returned we already got all of them
                } while (!isEmpty(result) && result.length > 0 && result.length == 1000)

                for (let j = 0; j < completeResultSet.length; j++) {
                    let obj = {};

                    for (let k = 0; k < resultSearch.columns.length; k++) {
                        obj[`${resultSearch.columns[k].name}`] = completeResultSet[j].getValue(resultSearch.columns[k]);
                    }

                    data.push(obj)
                }

                log.debug(functionProcess, `560. Deposit Accounts Result (${data.length}): ${JSON.stringify(data)}`);
            }
            catch (e) {
                log.error(functionProcess, `563. Error: ${e.message}`);
            }

            //log.debug(functionProcess, `566. Result: ${result}`);
            return data;
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
            onRequest: onRequest
        };
    });