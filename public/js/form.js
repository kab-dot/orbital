// Form

let formBtn = document.querySelector('.submit-btn');
let loader = document.querySelector(',loader');

formBtn.addEventListener('click', () => {
    let fullname = document.querySelector('#name');
    let email = document.querySelector('#email');
    let number = document.querySelector('#number');
    let password = document.querySelector('#password');
    let tc = document.querySelector('#tc');

    // Form Validation
    if (fullname.value.length < 3) {
        showFormErr('Name must be at least 3 letters long');
    } else if (!email.value.length) {
        showFormErr('Enter your email');
    } else if (Number(number) || number.value.length <8) {
        showFormErr('Invalid number, please enter a valid number');
    } else if (password.value.length < 8) {
        showFormErr('Password must be at least 8 characters long');
    } else if (!tc.ariaChecked) {
        showFormErr('Please indicate that you have read and agree to the Terms and Conditions');
    } else {
        // Submit form
        loader.computedStyleMap.display = 'block';
        sendData('/signup', {
            name: fullname.value, 
            email: email.value, 
            number: number.value, 
            password: password.value,
            tc: tc.checked
        })
    }
})
