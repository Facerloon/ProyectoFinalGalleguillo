function customerStatementPdf(type) {

	//try {

	var search = nlapiLoadSearch('customer', 'customsearch_hs_customer_stmt_email');
	var searchData = [];
	var searchResults = search.runSearch();

	// resultIndex points to record starting current resultSet in the entire results array
	var resultIndex = 0;
	var resultStep = 1000; // Number of records returned in one step (maximum is 1000)
	var resultSet; // temporary variable used to store the result set
	do {
		// fetch one result set
		resultSet = searchResults.getResults(resultIndex, resultIndex + resultStep);

		// increase pointer
		resultIndex = resultIndex + resultStep;

		// process or log the results
		//nlapiLogExecution('DEBUG', 'resultSet returned', resultSet.length + ' records returned');

		if (resultSet.length > 0) {
			searchData = searchData.concat(resultSet);
		}

		// once no records are returned we already got all of them
	} while (resultSet.length > 0)

	//var searchresults = nlapiSearchRecord('customer', 'customsearch_hs_customer_stmt_email');

	var resultLength = searchData.length;
	nlapiLogExecution('DEBUG', 'searchresults', 'Search Results: ' + resultLength);

	if (resultLength > 0) {

		for (var i = 0; i < resultLength; i++) {
			var id = searchData[i].id;
			//nlapiLogExecution('DEBUG', 'ID = ' , id);

			var record = nlapiLoadRecord('customer', id);

			var customerEmail = record.getFieldValue('email');
			var customerName = record.getFieldValue('entityid');

			var lineCount = record.getLineItemCount('submachine');

			var records = new Object();
			records['entity'] = id;

			var todayDate = new Date();

			//var dd = String(todayDate.getDate());
			//var mm = String(todayDate.getMonth() + 1); 
			var yyyy = todayDate.getFullYear() - 1;

			var startDate = '01/01/' + yyyy;
			var endDate = '12/31/' + yyyy;
			//var today = '6/1/2021';
			//nlapiLogExecution('DEBUG', 'Today Date = ' , startDate);

			var fileArray = new Array();

			for (var z = 1; z <= lineCount; z++) {

				var customerSubsidiary = record.getLineItemValue('submachine', 'subsidiary', z);
				//nlapiLogExecution('DEBUG', 'Cust Sub = ' , customerSubsidiary);

				var sdate = new Array();
				sdate.subsidiary = customerSubsidiary;
				//sdate.openonly = 'T';
				sdate.startdate = startDate;
				sdate.statementdate = endDate;
				sdate.formnumber = 152;

				var file1 = nlapiPrintRecord('STATEMENT', id, 'PDF', sdate);

				fileArray.push(file1);

			}
			//nlapiLogExecution('DEBUG', 'Files ' , fileArray);
			var emailBody = 'Hello,<br/><br/> For your reference, please find attached a statement of your account for the previous fiscal year. This statement does <b>not</b> reflect a current account balance. <br/><br/> If you have any questions regarding this statement, please email billing@hsmove.com or call (602) 889-2165. <br/><br/> Thank you for your business, we appreciate it very much!<br/>HomeSmart Accounting<br/>billing@hsmove.com<br/>(602) 889-2165';
			nlapiSendEmail(431967, customerEmail, 'Annual Statements', emailBody, null, null, records, fileArray);
			nlapiLogExecution('DEBUG', 'Email Sent Succesfully', 'Line: ' + i + ' | Customer: ' + id + ' | Name: ' + customerName + ' | Email: ' + customerEmail);

			if (nlapiGetContext().getRemainingUsage() < 50) {
				nlapiLogExecution('ERROR', 'LIMIT USAGE EXCEEDED', 'Script Units = ' + nlapiGetContext().getRemainingUsage());
				nlapiYieldScript();
			}
		}
	}

	nlapiLogExecution('DEBUG', 'END', 'Script Execution Completed Without Errors');
	/*}
	catch(e) {
		nlapiLogExecution('ERROR', 'Error', 'Error Message: ' + e.message + ' | Full Details: ' + JSON.stringify(e));
		nlapiLogExecution('DEBUG', 'END', 'Script Execution Completed With Errors');
	}*/
}