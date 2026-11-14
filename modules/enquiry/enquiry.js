// =====================================================
// TRIPTORA - ENQUIRY PAGE JAVASCRIPT
// =====================================================


// =====================================================
// EMAILJS CONFIGURATION
// =====================================================

const EMAILJS_PUBLIC_KEY = "n-a3TnWbFP4zoQbqQ";

const EMAILJS_SERVICE_ID = "service_5sbdzkj";

const EMAILJS_TEMPLATE_ID = "template_uixjlbx";



// =====================================================
// EMAILJS INITIALIZATION
// =====================================================

if (typeof emailjs !== "undefined") {

    emailjs.init({
        publicKey: EMAILJS_PUBLIC_KEY
    });

} else {

    console.error(
        "EmailJS library not loaded."
    );

}



// =====================================================
// GET ELEMENTS
// =====================================================

const enquiryForm =
    document.getElementById("enquiryForm");

const subjectSelect =
    document.getElementById("subject");

const otherSubjectGroup =
    document.getElementById("otherSubjectGroup");

const otherSubjectInput =
    document.getElementById("otherSubject");



// =====================================================
// OTHER SUBJECT SHOW / HIDE
// =====================================================

if (
    subjectSelect &&
    otherSubjectGroup &&
    otherSubjectInput
) {

    subjectSelect.addEventListener(
        "change",
        function () {

            if (this.value === "Other") {

                otherSubjectGroup.style.display =
                    "block";

                otherSubjectInput.required =
                    true;

                otherSubjectInput.focus();

            } else {

                otherSubjectGroup.style.display =
                    "none";

                otherSubjectInput.required =
                    false;

                otherSubjectInput.value =
                    "";

            }

        }
    );

}



// =====================================================
// FORM SUBMISSION
// =====================================================

if (enquiryForm) {

    enquiryForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();



            // ---------------------------------------------
            // CHECK EMAILJS
            // ---------------------------------------------

            if (typeof emailjs === "undefined") {

                alert(
                    "Email service is not available. Please refresh the page and try again."
                );

                return;

            }



            // ---------------------------------------------
            // GET VALUES
            // ---------------------------------------------

            const fullName =
                document
                    .getElementById("fullName")
                    .value
                    .trim();


            const email =
                document
                    .getElementById("email")
                    .value
                    .trim();


            const selectedSubject =
                subjectSelect.value;


            const message =
                document
                    .getElementById("message")
                    .value
                    .trim();



            // ---------------------------------------------
            // VALIDATION
            // ---------------------------------------------

            if (fullName === "") {

                alert(
                    "Please enter your full name."
                );

                document
                    .getElementById("fullName")
                    .focus();

                return;

            }



            if (email === "") {

                alert(
                    "Please enter your email address."
                );

                document
                    .getElementById("email")
                    .focus();

                return;

            }



            if (selectedSubject === "") {

                alert(
                    "Please select a subject."
                );

                subjectSelect.focus();

                return;

            }



            // ---------------------------------------------
            // FINAL SUBJECT
            // ---------------------------------------------

            let finalSubject =
                selectedSubject;


            if (selectedSubject === "Other") {

                const customSubject =
                    otherSubjectInput
                        .value
                        .trim();


                if (customSubject === "") {

                    alert(
                        "Please specify your subject."
                    );

                    otherSubjectInput.focus();

                    return;

                }


                finalSubject =
                    "Other: " + customSubject;

            }



            if (message === "") {

                alert(
                    "Please enter your message."
                );

                document
                    .getElementById("message")
                    .focus();

                return;

            }



            // =================================================
            // SUBMIT BUTTON
            // =================================================

            const submitButton =
                enquiryForm.querySelector(
                    ".submit-btn"
                );


            const originalButtonHTML =
                submitButton.innerHTML;


            submitButton.disabled =
                true;


            submitButton.innerHTML =
                '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';



            // =================================================
            // EMAILJS PARAMETERS
            // =================================================

            const templateParams = {

                name: fullName,

                email: email,

                subject: finalSubject,

                message: message

            };



            // =================================================
            // SEND EMAIL
            // =================================================

            emailjs
                .send(
                    EMAILJS_SERVICE_ID,
                    EMAILJS_TEMPLATE_ID,
                    templateParams
                )

                .then(
                    function (response) {

                        console.log(
                            "EmailJS Success:",
                            response.status,
                            response.text
                        );


                        // SUCCESS POPUP

                        alert(
                            "Your enquiry has been submitted successfully!"
                        );


                        // RESET FORM

                        enquiryForm.reset();


                        // HIDE OTHER SUBJECT

                        if (otherSubjectGroup) {

                            otherSubjectGroup.style.display =
                                "none";

                        }


                        if (otherSubjectInput) {

                            otherSubjectInput.required =
                                false;

                            otherSubjectInput.value =
                                "";

                        }


                        // RESTORE BUTTON

                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalButtonHTML;

                    }
                )

                .catch(
                    function (error) {

                        console.error(
                            "EmailJS Error:",
                            error
                        );


                        alert(
                            "Unable to submit enquiry. Please try again."
                        );


                        submitButton.disabled =
                            false;

                        submitButton.innerHTML =
                            originalButtonHTML;

                    }
                );

        }
    );

}