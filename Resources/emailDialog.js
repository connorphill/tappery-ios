var emailDialog = Ti.UI.createEmailDialog();
emailDialog.subject = "Error/Bug Found in Campus Taps App";
emailDialog.toRecipients = ['contact@campustaps.com'];
emailDialog.messageBody = '<b></b>';
var f = Ti.Filesystem.getFile('cricket.wav');
emailDialog.addAttachment(f);
emailDialog.open();