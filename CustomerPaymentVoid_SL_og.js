/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 * @NModuleScope SameAccount
 */
define(['N/ui/serverWidget', 'N/log', 'N/search', 'N/record', 'N/redirect', 'N/runtime'],
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

            var PARAM_ID = 'custparam_id';

            try {
                var oRequestParameters = context.request.parameters;

                if (context.request.method === 'GET') {
                    var custPaymentId = oRequestParameters[PARAM_ID];
                    log.debug('Payment ID', custPaymentId);

                    var frm = serverWidget.createForm({ title: 'Approve Bill', hideNavBar: false });
                    frm.clientScriptModulePath = './CustomerPaymentVoid_CS.js';

                    var fldStatus = frm.addField({ id: FLD_STATUS, type: 'text', label: 'Status', container: null });
                    fldStatus.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                    var fldPaymentId = frm.addField({ id: FLD_PAYMENTID, type: 'text', label: 'Payment', container: null });
                    fldPaymentId.defaultValue = custPaymentId;
                    fldPaymentId.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });

                    var fldVoidReason = frm.addField({ id: FLD_REASON, type: 'select', source: 'customlist_ctr_voidreason', label: 'Void Reason', container: null });
                    fldVoidReason.isMandatory = true;

                    frm.addSubmitButton({ label: 'Void' });
                    frm.addButton({ id: BTN_CANCEL, label: 'Cancel', functionName: 'cancel' });
                    context.response.writePage(frm);
                }//-- End Get method
                else {
                    var refundId = '';
                    var idDepositAcct;
                    var custPaymentId = oRequestParameters[FLD_PAYMENTID];
                    var voidReasonId = oRequestParameters[FLD_REASON];
                    const authNetLocation = oRequestParameters[AUTHNET_LOCATION];
                    const authNetAccount = oRequestParameters[AUTHNET_ACCOUNT];
                    log.debug('>>>SUBMIT VOID', custPaymentId + ' ' + voidReasonId);

                    //New Behavior: redirect to refund page in edit mode
                    /*redirect.redirect({
                        url: '/app/accounting/transactions/custrfnd.nl?whence=',
                        parameters: {paymentid: custPaymentId, voidreasonid: voidReasonId}
                    });*/

                    var recCustPayment = record.load({ type: 'customerpayment', id: custPaymentId, isDynamic: false });
                    var subsidiaryId = recCustPayment.getValue({ fieldId: 'subsidiary' });
                    var refNumber = recCustPayment.getValue({ fieldId: 'checknum' });
                    var fileNumber = recCustPayment.getValue({ fieldId: FLD_CTR_FILENUMBER });
                    var fAmount = recCustPayment.getValue({ fieldId: 'payment' });
                    var refTranNum = getVoidNumber();
                    var refundMemo = 'Void Check ' + refNumber + ' ' + fileNumber;

                    //Get Deposit Account and make deposit if Payment is undeposited
                    var bUndepFunds = recCustPayment.getValue({ fieldId: 'undepfunds' });
                    var cashAcct = ACCT_UNDEPFUNDS;
                    var depAcctSearch;
                    var bDepositFound;
                    //log.debug('Custpayment bUndepFunds', 'bUndepFunds:' + bUndepFunds);

                    if (bUndepFunds == 'F') {
                        cashAcct = recCustPayment.getValue({ fieldId: 'account' });
                        //log.debug('Custpayment cashAcct', 'cashAcct:' + cashAcct);
                    }

                    if (cashAcct == ACCT_UNDEPFUNDS) {
                        var depAcctSearch = getPaymentDeposits(custPaymentId);
                        var bDepositFound = false;

                        if (depAcctSearch.length > 0) {
                            var depAcct = depAcctSearch[0].getValue({ name: 'accountmain', join: 'applyingtransaction' });
                            var depId = depAcctSearch[0].getValue({ name: 'applyingtransaction' });

                            if (depAcct && depAcct != '') {
                                cashAcct = depAcct;
                                bDepositFound = true;
                                log.debug('Deposit Found:' + depId, 'depAcct:' + depAcct);
                            }
                        }
                    }

                    //Load Customer Payment record to unapply any invoices
                    var recCustPayment = record.load({ type: 'customerpayment', id: custPaymentId, isDynamic: false });
                    var customerId = recCustPayment.getValue({ fieldId: 'customer' });
                    var subsidiaryId = recCustPayment.getValue({ fieldId: 'subsidiary' });
                    var refNumber = recCustPayment.getValue({ fieldId: 'checknum' });
                    var fileNumber = recCustPayment.getValue({ fieldId: FLD_CTR_FILENUMBER });
                    var arAcct = recCustPayment.getValue({ fieldId: 'aracct' });
                    var nLines = recCustPayment.getLineCount({ sublistId: 'apply' });

                    //Unapply invoices
                    if (nLines > 0) {
                        for (var i = 0; i < nLines; i++) {
                            recCustPayment.setSublistValue({ sublistId: 'apply', fieldId: 'apply', value: false, line: i, ignoreFieldChange: false, forceSyncSourcing: true });
                        }

                        //recCustPayment.setValue({fieldId: 'tranid', value: sTranId});
                        recCustPayment.save({ enableSourcing: false, ignoreMandatoryFields: true });
                        log.debug('customer payment invoices unappied', '');
                    }

                    //after choosing a void reason, the refund will be generated.
                    if (cashAcct && cashAcct != '') {
                        var refTranNum = getVoidNumber();
                        var refundMemo = 'Void Check ' + refNumber + ' ' + fileNumber;
                        var recRefund = record.create({ type: 'customerrefund', isDynamic: true });
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
                        var refundLines = recRefund.getLineCount({ sublistId: 'apply' });
                        log.debug('refundLines:' + refundLines, 'tranid:' + refTranNum);

                        for (var i = 0; i < refundLines; i++) {
                            var creditsLineId = recRefund.getSublistValue({ sublistId: 'apply', fieldId: 'internalid', line: i });
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

                    var sOutput = '<html><script>';
                    //sOutput += 'window.parent.document.getElementsByClassName("x-tool x-tool-close")[0].click();';
                    sOutput += 'window.parent.open("/app/accounting/transactions/custrfnd.nl?id=' + refundId + '&e=T", "_self");';
                    sOutput += '</script></html>';
                    context.response.write(sOutput);
                }
            }
            catch (e) {
                log.error('ERROR', e);
            }
        }

        function getVoidNumber() {
            var voidPrefix = 'Void-';
            var voidNumber = voidPrefix + 100000;

            var voidSearchOptions = new Object();
            voidSearchOptions['type'] = 'transaction';
            voidSearchOptions['filters'] = [
                ['type', 'anyof', 'CustRfnd'],
                'and',
                ['mainline', 'is', 'T'],
                'and',
                ['numbertext', 'startswith', 'Void-']
            ]

            voidSearchOptions['columns'] = [search.createColumn({ name: 'tranid', sort: search.Sort.DESC })];
            var voidSearch = getAllSearchResults(voidSearchOptions);
            //log.debug('voidSearch.length', voidSearch.length);

            if (voidSearch.length > 0) {
                var sTranId = voidSearch[0].getValue({ name: 'tranid' });
                var fVoidNum = parseFloat(sTranId.split('-')[1]) + 1;
                voidNumber = voidPrefix + (fVoidNum.toFixed(0));
                //log.debug('Current Void Number', sTranId);
            }

            //log.debug('Next voidNumber', voidNumber);
            return voidNumber;
        }

        function makeDeposit(idPayment, refundId, addtnlArgs = {}) {

            var idDeposit = '';
            var bLineFound = false;

            try {
                var subsidiaryLookUp = search.lookupFields({ type: 'customerpayment', id: idPayment, columns: ['subsidiary'] });
                //log.debug('makeDeposit', 'subsidiaryLookUp:' + subsidiaryLookUp + 'idPayment:' + idPayment + ' refundIs tId:' + refundId);
                const authnetAccount = addtnlArgs.authNetAccount;
                const authnetLocation = addtnlArgs.authnetLocation;
                var idSubsidiary = subsidiaryLookUp.subsidiary[0].value;
                var idDepAcct = authnetAccount ? authnetAccount : getDepositAccount(idSubsidiary);

                if (idDepAcct && idDepAcct != '') {
                    let recDeposit = null;

                    if (authnetLocation) {
                        recDeposit = record.create({
                            type: 'deposit',
                            isDynamic: true,
                            defaultValues: {
                                account: idDepAcct,
                                location: authnetLocation
                            }
                        });
                    } else {
                        recDeposit = record.create({
                            type: 'deposit',
                            isDynamic: true,
                            defaultValues: {
                                account: idDepAcct
                            }
                        });
                    }

                    const nLines = recDeposit.getLineCount({ sublistId: 'payment' });
                    const idDepLineIds = recDeposit.getCurrentSublistTexts({ sublistId: 'payment', fieldId: 'id', start: 0, end: nLines });

                    const paymentIndex = idDepLineIds.indexOf(idPayment);
                    if (paymentIndex !== -1) {
                        recDeposit.selectLine({ sublistId: 'payment', line: paymentIndex });
                        recDeposit.setCurrentSublistValue({ sublistId: 'payment', fieldId: 'deposit', value: true });
                        bLineFound = true;
                    } else {
                        const refundIndex = idDepLineIds.indexOf(refundId);
                        if (refundIndex !== -1) {
                            recDeposit.selectLine({ sublistId: 'payment', line: refundIndex });
                            recDeposit.setCurrentSublistValue({ sublistId: 'payment', fieldId: 'deposit', value: true });
                            bLineFound = true;
                        }
                    }

                    if (bLineFound) {
                        idDeposit = recDeposit.save({ enableSourcing: false, ignoreMandatoryFields: true });
                    }
                }
                //log.debug('Make Deposit', 'idDeposit:' + idDeposit + ' idDepAcct:' + idDepAcct);
            } catch (e) {
                log.error('makeDeposit error paymentID:' + idPayment, e);
            }

            return idDepAcct;
        }

        function getDepositAccount(idSubsidiary) {
            var depAcctSearchOptions = new Object();
            depAcctSearchOptions['type'] = 'account';
            depAcctSearchOptions['filters'] = [
                ['type', 'anyof', 'Bank'],
                'and',
                ['isinactive', 'is', 'F'],
                'and',
                ['subsidiary', 'anyof', idSubsidiary]
            ];
            depAcctSearchOptions['columns'] = ['subsidiary', search.createColumn({ name: 'number', sort: search.Sort.ASC })];
            var result = search.find(depAcctSearchOptions);

            if (result) {
                return result.id;
            }

            return null;
        }

        function getPaymentDeposits(custPaymentId) {
            var depAcctSearchOptions = new Object();
            depAcctSearchOptions['type'] = 'transaction';
            depAcctSearchOptions['filters'] = [
                ['internalid', 'anyof', custPaymentId],
                'and',
                ['mainline', 'is', 'T']
            ]
            depAcctSearchOptions['columns'] = ['transactionname', 'applyingtransaction', 'applyingtransaction.accountmain'];
            return getAllSearchResults(depAcctSearchOptions);
        }

        function getAllSearchResults(options) {
            var stRecordType = options.type;
            var stSavedSearch = options.searchId;
            var arrFilters = options.filters;
            var arrColumns = options.columns;
            var arrResults = [];
            var count = 1000;
            var start = 0;
            var end = 1000;
            var searchObj = (stSavedSearch) ? arrFilters ? search.load({ id: stSavedSearch, filters: arrFilters }) :
                search.load({ id: stSavedSearch }) :
                search.create({ type: stRecordType, filters: arrFilters, columns: arrColumns });
            var rs = searchObj.run();
            while (count == 1000) {
                var results = rs.getRange(start, end);
                arrResults = arrResults.concat(results);
                start = end;
                end += 1000;
                count = results.length;
            }
            return arrResults;
        }

        return {
            onRequest: onRequest
        };
    });