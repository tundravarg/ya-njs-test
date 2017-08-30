'use strict';


(function() {



$.ajaxSetup({
	cache: false
});



$(() => {
	initComponents();
	window.MyForm = {
		validate: validate, 
		getData: getData,
		setData: setData,
		submit: submit,
	};
});



const FORM_ID = 'myForm';
const FIO_FIELD_NAME = 'fio';
const EMAIL_FIELD_NAME = 'email';
const PHONE_FIELD_NAME = 'phone';
const SUBMIT_BUTTON_ID = 'submitButton';
const RESULT_PANEL_ID = 'resultParagraph';
const RESULT_FIELD_ID = 'resultContainer';

const RESULT_CLASS_SUCCESS = 'success';
const RESULT_CLASS_PROGRESS = 'progress';
const RESULT_CLASS_ERROR = 'error';



const components = {
	fioField: null,
	emailField: null,
	phoneField: null,
	submitButton: null,
	resultField: null,
};

function initComponents() {
	components.form = $('#' + FORM_ID);
	components.fioField = $('input[name="' + FIO_FIELD_NAME + '"]');
	components.emailField = $('input[name="' + EMAIL_FIELD_NAME + '"]');
	components.phoneField = $('input[name="' + PHONE_FIELD_NAME + '"]');
	components.submitButton = $('#' + SUBMIT_BUTTON_ID);
	components.resultPanel = $('#' + RESULT_PANEL_ID);
	components.resultField = $('#' + RESULT_FIELD_ID);

	components.submitButton.click(() => {
		var result = MyForm.validate();
		setFieldsState(result);
		if (result.isValid) {
			submit();
		}
	});
}



function getData() {
	return {
		fio:   components.fioField.val(),
		email: components.emailField.val(),
		phone: components.phoneField.val()
	};
}

function setData(data) {
	components.fioField.val(data.fio);
	components.emailField.val(data.email);
	components.phoneField.val(data.phone);
}



function validate() {
	const data = getData();

	const errorFields = [];
	if (!validateFIO(data.fio)) {
		errorFields.push(FIO_FIELD_NAME);
	}
	if (!validateEMail(data.email)) {
		errorFields.push(EMAIL_FIELD_NAME);
	}
	if (!validatePhone(data.phone)) {
		errorFields.push(PHONE_FIELD_NAME);
	}

	return {
		isValid: errorFields.length == 0,
		errorFields: errorFields
	};
}

function validateFIO(fio) {
	return /^\s*(\w+)\s+(\w+)\s+(\w+)\s*$/.test(fio);
}

function validateEMail(email) {
	return /^[\w\.\-]+@(?:ya\.ru|yandex\.ru|yandex\.ua|yandex\.by|yandex\.kz|yandex\.com)$/.test(email);
}

function validatePhone(phone) {
	if (!/^\+7\(\d\d\d\)\d\d\d-\d\d-\d\d$/.test(phone)) {
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



function setFieldsState(result) {
	setInputFieldsState(result);
	if (result.isValid) {
		setOutputFieldsState(null);
	} else {
		setOutputFieldsState(RESULT_CLASS_ERROR, 'Wrong fields');
	}
}

function setInputFieldsState(result) {
	function setErrorClass(component, error) {
		if (error) {
			component.addClass('error');
		} else {
			component.removeClass('error');
		}
	}

	const errorFields = result.errorFields;
	function checkAndSetErrorClass(component) {
		const error = errorFields.some(n => n == component.attr('name'));
		setErrorClass(component, error);
	}

	checkAndSetErrorClass(components.fioField);
	checkAndSetErrorClass(components.emailField);
	checkAndSetErrorClass(components.phoneField);
}

function setOutputFieldsState(result, message) {
	components.submitButton.attr('disabled', result == RESULT_CLASS_PROGRESS ? 'true' : false)
	components.resultPanel.css('visibility', result ? 'visible' : "invisible");

	const resultField = components.resultField;
	[RESULT_CLASS_SUCCESS, RESULT_CLASS_PROGRESS, RESULT_CLASS_ERROR].forEach(c => {
		if (c == result) {
			resultField.addClass(c);
		} else {
			resultField.removeClass(c);
		}
	});
	resultField[0].textContent = message || '';
}



const submitter = {

	submitCount: 0,

	submit: function(data) {
		var submitCount = ++this.submitCount;
		var progressCount = 1;
		components.submitButton.attr('disabled', 'true')
		function submit2() {
			if (submitCount != this.submitCount) {
				return;
			}
			var url = components.form.attr('action')
			$.get(url, (data) => {
				try {
					var status = data.status ? data.status.toLowerCase(data.status) : '';
					var resultType = "";
					var result = "";
					switch (status) {
						case 'success':
							resultType = RESULT_CLASS_SUCCESS;
							result = 'Success';
							break;
						case 'error':
							throw new Error(data.reason || 'Error');
							break;
						case 'progress':
							var timeout = Number(data.timeout);
							if (!timeout || timeout < 0) {
								throw new Error('Invalid timeout: ' + data.timeout);
							}
							resultType = RESULT_CLASS_PROGRESS;
							result = `In progress (${progressCount}): ${timeout}ms`;
							progressCount++;
							if (timeout) {
								setTimeout(submit2.bind(this), Number(timeout));
							}
							break;
						default:
							throw new Error('Unknown status: ' + data.status);
					}
					setOutputFieldsState(resultType, result);
				} catch (ex) {
					error(ex.message);
				}
			}).fail((r, s, m) => {
				error('Error in answer: ' + m)
			});
		}
		function error(message) {
			setOutputFieldsState(RESULT_CLASS_ERROR, message || '');
		}
		submit2.call(this);
	}

};

function submit() {
	submitter.submit(getData());
}



})();

