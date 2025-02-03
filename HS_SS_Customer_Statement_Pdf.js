function customerStatementPdf( type )
{
 

	var searchresults = nlapiSearchRecord( 'customer', 'customsearch_hs_customer_stmt_email');
	
	var resultLength = searchresults.length;
	
	for ( var i = 0; searchresults != null && i < searchresults.length; i++ )
	{
		var id = searchresults[i].getId();
		//nlapiLogExecution('DEBUG', 'ID = ' , id);
		
		var record =  nlapiLoadRecord('customer', id);
		
		var customerEmail = record.getFieldValue('email');
		
		var lineCount = record.getLineItemCount('submachine');
		
		var records = new Object();
		records['entity'] = id;
		
		var todayDate = new Date();
		
		//var dd = String(todayDate.getDate());
		//var mm = String(todayDate.getMonth() + 1); 
		var yyyy = todayDate.getFullYear() - 1;
		
		var startDate = '01/01/' + yyyy;
		var endDate = '12/31/'+ yyyy;
		//var today = '6/1/2021';
		//nlapiLogExecution('DEBUG', 'Today Date = ' , startDate);
		
		var fileArray = new Array();
		
		for(var z=1; z<=lineCount; z++){
		
			var customerSubsidiary = record.getLineItemValue('submachine','subsidiary', z);
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
		nlapiSendEmail(431967, customerEmail, 'Annual Statements',emailBody , null, null, records, fileArray);
		
		
		if (nlapiGetContext().getRemainingUsage() < 50) {
			nlapiYieldScript();
		}
	}
   
   
   
}