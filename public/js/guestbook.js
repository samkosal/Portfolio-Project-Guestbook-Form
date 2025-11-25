document.getElementById('guestbook-form').onsubmit = () => {

    clearErrors();

    // Flag variable to determine if form data is valid
    let isValid = true;

    // Validate first name
    let fname = document.getElementById('fname').value.trim();
    if (!fname) {
        document.getElementById("err-fname").style.display = "block";
        isValid = false;
    }

    // Validate last name
    let lname = document.getElementById('lname').value.trim();
    if (!lname) {
        document.getElementById("err-lname").style.display = "block";
        isValid = false;
    }
    // Validate email: if it exist and it does not contain any @ and .
    let email = document.getElementById('email').value.trim();
    if (email && (email.indexOf("@") === -1 || email.indexOf(".") === -1)) {
        document.getElementById("err-email").style.display = "block";
        isValid = false;
    }
    // validate email checkbox
    let emailCheckbox = document.getElementById('mail');
    let emailFormat = document.querySelector('input[name="method"]:checked');
    if (emailCheckbox.checked) {
        
        // Checkbox is checked, then check for email input
        if (!email || (email.indexOf("@") === -1 || email.indexOf(".") === -1)) {
            document.getElementById("err-email").style.display = "block";
            isValid = false;
        }
        
        //check if email format is selected after checkbox
        if (!emailFormat) {
            document.getElementById("err-pick-email-format").style.display = "block";
            isValid = false;
        }
    }
    // Validate linkedin
    let linkedin = document.getElementById('linkedin').value.trim();
    if (linkedin && linkedin.indexOf("https://linkedin.com/in/") === -1) {
        document.getElementById("err-linkedin").style.display = "block";
        isValid = false;
    }
    // Validate "how we met"
    let meet = document.getElementById('meet').value;
    if (meet === "none") {
        document.getElementById("err-meet").style.display = "block";
        isValid = false;
    }
    


    // Return isValid flag
    return isValid;
}
function clearErrors() {
    let errors = document.getElementsByClassName("error");
    for (let i=0; i<errors.length; i++) {
        errors[i].style.display = "none";
    }
}


// toggle the email checkbox
let emailCheckbox = document.getElementById('mail');
emailCheckbox.addEventListener('change', function() {
    if (this.checked) {
        // emailCheckbox.value = "Yes";
        // console.log(emailCheckbox.value);
        // Add any other actions to perform when toggle is ON
        document.getElementById("pick-email-format").style.display = "block";
        console.log('Toggle is ON');
        
        
    } else {
        // emailCheckbox.value = "No";
        // console.log(emailCheckbox.value);
        // Add any other actions to perform when toggle is OFF
        document.getElementById("pick-email-format").style.display = "none";
        console.log('Toggle is OFF');
    }
});
// toggle the "Other (please specify)"
const meet = document.getElementById('meet');
meet.addEventListener('change', function() {
    if (this.value === "other") {
        document.getElementById("other-input").style.display = "block";
    } else {
        document.getElementById("other-input").style.display = "none";
    }
});
