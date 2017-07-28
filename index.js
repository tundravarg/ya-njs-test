$(() => {
	console.log('Document loaded');
	$('#submitButton').click(() => {
		var result = MyForm.validate();
		if (result.isValid) {
			MyForm.submit();
		}
	});
});



function getFormFields() {
	var fioField = $('input[name="fio"]');
	var emailField = $('input[name="email"]');
	var phoneField = $('input[name="phone"]');
	if (!checkExists(fioField, emailField, phoneField)) {
		setResult('Internal error');
		throw new Error('Some fields are not found');
	}
	return {
		fioField: fioField,
		emailField: emailField,
		phoneField: phoneField
	};
};

function setResult(result) {
	var resultParagraph = $('#resultParagraph');
	var resultContainer = $('#resultContainer');
	if (!checkExists(resultParagraph, resultContainer)) {
		setResult('Internal error');
		throw new Error('Some fields are not found');
	}
	resultParagraph.css('visibility', 'visible');
	resultContainer.html(result);
}



function checkExists() {
	return Array.from(arguments).every(e => !!e && e.length);
}



MyForm = {

	validate: function() {
		return { isValid: true, errorFields: [] };
		// return { isValid: Boolean, errorFields: String[] }
	}, 
	
	getData: function() {
		var fields = getFormFields();
		return {
			fio:   fields.fioField.val(),
			email: fields.emailField.val(),
			phone: fields.phoneField.val()
		};
	},

	setData: function(data) {
		var fields = getFormFields();
		fields.fioField.val(data.fio);
		fields.emailField.val(data.email);
		fields.phoneField.val(data.phone);
	},
	
	submit: function() {
		var data = this.getData();
//		this.setData({ fio: data.fio + '-1', email: data.email + '-2', phone: data.phone + '-3' });
		$.get('/data/success.json', (data) => {
			console.log('---answer: ' + data);
			setResult('Success');
		}).fail((e) => {
			setResult('Error in answer');
		});
	}

};
