var test_form = new Validator(".test_form", {
    name: "required|alphanum|min:3|max:64",
    ammount: "required|integer|min-value:30|max-value:40",
    text: "required|nofollow|alphanum|min:10|max:100"
});
test_form.setDebug(true);
test_form.setSpecificErrorMessageLocation("text", ".error-messages");
test_form.setCallback(function(type, name, field, validators, errors){
    if(type === "SUBMIT") {
        if (name === "text") {
            if (Object.keys(errors).length >= 1) {
                jQuery(".error-messages").fadeIn();
            }
            else {
                jQuery(".error-messages").fadeOut();
            }
        }
    }
});
