/**
 * Created by Ruud on 4-12-2014.
 */

var Validator = function(form_name, inputs){

    var $this = this;
    this.form = jQuery(form_name);
    this.inputs = inputs;
    this.validators = [];
    this.messages = [];
    this.invalid = [];
    this.location = null;
    this.debug = false;

    this.setDebug = function(debug){
        this.debug = debug;
    };

    this.setErrorMessageLocation = function(location){
        this.location = location;
    };

    this.addMessage = function(name, message){
        this.messages[name] = message;
    };

    this.addValidator = function(name, callback){
        this.validators[name] = callback;
    };

    this.getValidator = function(name, value, options){
        if(this.validators[name] === undefined){
            return false;
        }
        return this.validators[name](value, options);
    };

    this.getMessage = function(name){
        if(this.messages[name] === undefined){
            return "";
        }
        return this.messages[name];
    };

    this.addInvalidInput = function(name){
        this.invalid[name] = true;
    };

    this.addValidInput = function(name){
        this.invalid[name] = false;
    };

    this.init = function(){
        jQuery.each(this.inputs, function(key, value){
            $input = jQuery(form_name + " input[name=\"" + key + "\"]");
            $input.data("validators", value);
            $input.on("keyup blur", $this.keyChange);
        });
        this.form.on("submit", $this.submit);
    };

    this.keyChange = function(event){
        $input = jQuery(this);
        $this.validateInput($input, true);
    };

    this.validateInput = function(input, show){
        if(input !== undefined && input !== null) {
            $validators = input.data("validators").split("|");
            $result = [];
            jQuery.each($validators, function (key, value) {
                if (value.indexOf(":") > -1) {
                    $options = value.split(":");
                    $result[value] = $this.getValidator($options[0], input.val(), $options[1]);
                }
                else {
                    $result[value] = $this.getValidator(value, input.val(), null);
                }
            });

            $this.addValidInput($input[0].name);
            $errors = [];
            for (key in $result) {
                $value = $result[key];
                if ($value === false) {
                    if (key.indexOf(":") > -1) {
                        $options = key.split(":");
                        $errors[key] = $this.getMessage($options[0]).replace("{option}", $options[0]).replace("{value}", $options[1]).replace("{field}", input[0].name);
                    }
                    else {
                        $errors[key] = $this.getMessage(key).replace("{field}", input[0].name).replace("{value}", input.val());
                    }
                    $this.addInvalidInput(input[0].name);
                }
            }

            if ($this.debug) {
                console.log($errors);
                console.log(input.parents(".form-group").find(".input-error"));
            }
            if (show) {
                if (Object.keys($errors).length === 0) {
                    input.parents(".form-group").removeClass("has-error");
                }
                if ($this.location === null) {
                    input.parents(".form-group").find(".input-error").html("");
                }
                else {
                    jQuery($this.location).html("");
                }
                for (key in $errors) {
                    $value = $errors[key];
                    input.parents(".form-group").addClass("has-error");
                    if ($this.location === null) {
                        input.parents(".form-group").find(".input-error").append("<p>" + $value + "</p>");
                    }
                    else {
                        jQuery($this.location).append("<p>" + $value + "</p>");
                    }

                    if (key === "required") {
                        break;
                    }
                }
            }
            return $errors;
        }
        return [];
    };

    this.submit = function(event){
        $form = jQuery(this);
        $out = [];
        jQuery.each($this.inputs, function(key, value){
            $result = $this.validateInput(jQuery(form_name + " input[name=\"" + key + "\"]"), true);
            if(Object.keys($result).length > 0){
                $out[key] = true;
            }
        });
        if(Object.keys($out).length > 1){
            jQuery(form_name + " input[type=\"submit\"]").blur();
            return false;
        }
        if($this.debug){
            console.log("VALID SUBMIT (DEBUG)");
            return false;
        }
        return true;
    };

    this.init();

    this.addValidator("required", function(value, options){
        return /\S/.test(value);
    });
    this.addMessage("required", "Dit veld is verplicht");

    this.addValidator("min", function(value, options){
        if(options === null) return false;
        if(value.length > options){
            return true;
        }
        return false;
    });
    this.addMessage("min", "Je moet minimaal {value} tekens hebben.");

    this.addValidator("max", function(value, options){
        if(options === null) return false;
        if(value.length <= options){
            return true;
        }
        return false;
    });
    this.addMessage("max", "Je mag maximaal {value} tekens hebben.");

    this.addValidator("min-value", function(value, options){
        if(options === null) return false;
        if(!(/^\d+$/.test(value))) return null;
        if(parseInt(value) >= parseInt(options)){
            return true;
        }
        return false;
    });
    this.addMessage("min-value", "{field} moet meer zijn dan {value}.");

    this.addValidator("max-value", function(value, options){
        if(options === null) return false;
        if(!(/^\d+$/.test(value))) return null;
        console.log(value + ", " + options);
        if(parseInt(value) <= parseInt(options)){
            return true;
        }
        return false;
    });
    this.addMessage("max-value", "{field} mag niet meer zijn dan {value}.");

    this.addValidator("alpha", function(value, options){
        return /^[-_ a-zA-Z]+$/.test(value);
    });
    this.addMessage("alpha", "Je mag alleen alfabetische letters.");

    this.addValidator("email", function(value, options){
        return /\b[\w\.-]+@[\w\.-]+\.\w{2,4}\b/.test(value);
    });
    this.addMessage("email", "Dit moet een email zijn");

    this.addValidator("url", function(value, options){
        return /[(http(s)?):\/\/(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)/.test(value);
    });
    this.addMessage("url", "Dit moet een url zijn");

    this.addValidator("alphanum", function(value, options){
        return /^[0-9a-zA-Z+]+$/.test(value);
    });
    this.addMessage("alphanum", "Hier mogen alleen nummers en letters in.");

    this.addValidator("integer", function(value, options){
        return /([0-9]+)$/.test(value);
    });
    this.addMessage("integer", "Hier mogen alleen nummers in.");

    this.addValidator("equals", function(value, options){
        $field = jQuery(form_name + " input[name=\"" + options + "\"]");
        if($field === undefined) return false;
        if($field.val() === value){
            return true;
        }
        return false;
    });
    this.addMessage("equals", "Het veld {field} komt niet overeen met het veld {option}");
};
