$(() => {
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

		var url = serverEmulator.getUrl();
		$.get(url, (data) => {
			var status = isNotNull(data.status) ? data.status.toLowerCase(data.status) : null;
			var result = "";
			switch (data.status) {
				case 'success':
					result = 'Success';
					break;
				case 'error':
					result = 'Error: ' + data.reason;
					break;
				case 'progress':
					var timeout = data.timeout;
					result = `In progress (${++this._progressCount}): ${timeout}ms`;
					if (timeout) {
						setTimeout(this.submit.bind(this), Number(timeout));
					}
					break;
				default:
					result = 'Unknown status: ' + data.status;
					break;
			}
			if (!status == 'progress') {
				this._progressCount = 0;
			}
			setResult(entitifyString(result));
		}).fail((e) => {
			setResult('Error in answer');
		});
	},

	_progressCount: 0

};



var serverEmulator = {

	URL_SUCCESS:  '/data/success.json',
	URL_ERROR:    '/data/error.json',
	URL_PROGRESS: '/data/progress.json',
	URL_INVALID_1: '/data/invalid_1.json',

	getUrl: function() {
		return this.URL_PROGRESS;
	}

};



function checkExists() {
	return Array.from(arguments).every(e => !!e && e.length);
}

function isNotNull(obj) {
	return typeof obj !== 'undefined' && obj != null;
}

function entitifyString(str) {
	var p = document.createElement("p");
	p.textContent = str;
	return p.innerHTML;
}
