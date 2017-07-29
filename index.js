'use strict';



(function() {



$(() => {
	$('#submitButton').click(() => {
		var result = MyForm.validate();
		if (result.isValid) {
			MyForm.submit();
		} else {
			setResult(RESULT_CLASS.ERROR, 'Wrong fields');
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

var RESULT_CLASS = {
	SUCCESS: 'success',
	PROGRESS: 'progress',
	ERROR: 'error'
};

function setResult(resultType, message) {
	var resultParagraph = $('#resultParagraph');
	var resultContainer = $('#resultContainer');
	if (!checkExists(resultParagraph, resultContainer)) {
		setResult('Internal error');
		throw new Error('Some fields are not found');
	}

	resultParagraph.css('visibility', 'visible');

	setRadioClass(resultContainer, Object.values(RESULT_CLASS), resultType);
	resultContainer.html(message);
}



const FIO_RE = /^\s*(\w+)\s+(\w+)\s+(\w+)\s*$/;

const EMAIL_RE = /^[\w\.\-]+@(?:ya\.ru|yandex\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$/;

const PHONE_RE = /^\+7\(\d\d\d\)\d\d\d-\d\d-\d\d$/;
function checkPhone(phone) {
	if (!PHONE_RE.test(phone)) {
		return false;
	}
	var summa = 0;
	for (let i = 0, n = phone.length; i < n; i++) {
		let c = phone[i];
		if (c >= '0' && c <= '9') {
			summa += Number(c);
		}
	}
	return summa <= 30;
}



window.MyForm = {

	validate: function() {
		const data = this.getData();
		
		const errorFields = [];

		{ // Validate fio
			if (!FIO_RE.test(data.fio)) {
				errorFields.push('fio');
			}
		}

		{ // validate email
			if (!EMAIL_RE.test(data.email)) {
				errorFields.push('email');
			}
		}

		{ // validate phone
			if (!checkPhone(data.phone)) {
				errorFields.push('phone');
			}
		}

		return {isValid: errorFields.length == 0, errorFields: errorFields};
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
		submitter.submit(data);
	}

};



var submitter = {

	submitCount: 0,

	submit: function(data) {
		var submitCount = ++this.submitCount;
		var progressCount = 1;
		var url = serverEmulator.getUrl();
		function submit2() {
			if (submitCount != this.submitCount) {
				return;
			}
			$.get(url, (data) => {
				var status = isNotNull(data.status) ? data.status.toLowerCase(data.status) : null;
				var resultType = "";
				var result = "";
				switch (data.status) {
					case 'success':
						resultType = RESULT_CLASS.SUCCESS;
						result = 'Success';
						break;
					case 'error':
						resultType = RESULT_CLASS.ERROR;
						result = 'Error: ' + data.reason;
						break;
					case 'progress':
						var timeout = data.timeout;
						resultType = RESULT_CLASS.PROGRESS;
						result = `In progress (${progressCount}): ${timeout}ms`;
						progressCount++;
						if (timeout) {
							setTimeout(submit2.bind(this), Number(timeout));
						}
						break;
					default:
						resultType = RESULT_CLASS.ERROR;
						result = 'Unknown status: ' + data.status;
						break;
				}
				setResult(resultType, entitifyString(result));
			}).fail((e) => {
				setResult(RESULT_CLASS.ERROR, 'Error in answer');
			});
		}
		submit2.call(this);
	}

};



var serverEmulator = {

	URL_SUCCESS:  '/data/success.json',
	URL_ERROR:    '/data/error.json',
	URL_PROGRESS: '/data/progress.json',
	URL_INVALID_1: '/data/invalid_1.json',

	getUrl: function() {
		return this.URL_SUCCESS;
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

function setRadioClass(jqElement, classes, klass) {
	classes.forEach((c) => {
		jqElement.removeClass(c);
	});
	jqElement.addClass(klass);
}



})();

