var stap_2 = new Validator(".stap_2_form", {
    groep: "required|integer",
    naam: "required|alphanum|min:3|max:64",
    vraag: "required|min:3|max:25",
    link: "required|min:7|max:255|url",
    naam_link: "required|min:3|max:35",
    tekst: "required|min:3|max:35",
    actie: "required|min:3|max:35",
    zoekwoorden: "required|nofollow|array|min-count:1"
});
stap_2.setDebug(true);
stap_2.setSpecificErrorMessageLocation("zoekwoorden", ".page-info.bg-error > .data");
stap_2.setCallback(function(type, name, field, validators, errors){
    if(type === "SUBMIT") {
        if (name === "zoekwoorden") {
            if (Object.keys(errors).length >= 1) {
                jQuery(".page-info.bg-error").fadeIn();
            }
            else {
                jQuery(".page-info.bg-error").fadeOut();
            }
        }
    }
});
