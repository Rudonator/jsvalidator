/**
 * Created by Ruud on 4-12-2014.
 */

if(!Object.keys){
    Object.keys = (function(){
        'use strict';
        var hasOwnProperty = Object.prototype.hasOwnProperty,
            hasDontEnumBug = !({toString: null}).propertyIsEnumerable('toString'),
            dontEnums = [
                'toString',
                'toLocaleString',
                'valueOf',
                'hasOwnProperty',
                'isPrototypeOf',
                'propertyIsEnumerable',
                'constructor'
            ],
            dontEnumsLength = dontEnums.length;

        return function(obj){
            if(typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)){
                throw new TypeError('Object.keys called on non-object');
            }

            var result = [], prop, i;

            for(prop in obj){
                if(hasOwnProperty.call(obj, prop)){
                    result.push(prop);
                }
            }

            if(hasDontEnumBug){
                for(i = 0; i < dontEnumsLength; i++){
                    if(hasOwnProperty.call(obj, dontEnums[i])){
                        result.push(dontEnums[i]);
                    }
                }
            }
            return result;
        };
    }());
}

var Validator = function(form_name, inputs){

    var $this = this;
    this.form = jQuery(form_name);
    this.inputs = inputs;
    this.validators = [];
    this.messages = [];
    this.invalid = [];
    this.location = null;
    this.locations = [];
    this.debug = false;
    this.callback = null;
    this.wildcards = [];
    this.prevent_submit = false;

    this.addWildCard = function(name){
        this.wildcards.push(name);
    };

    this.setCallback = function(callback){
        this.callback = callback;
    };

    this.performCallback = function(type, name, field, validators, errors){
        if(this.callback !== undefined && this.callback !== null){
            this.callback(type, name, field, validators, errors);
        }
    };

    this.setDebug = function(debug){
        this.debug = debug;
    };

    this.setErrorMessageLocation = function(location){
        this.location = location;
    };

    this.setSpecificErrorMessageLocation = function(name, location){
        this.locations[name] = location;
    };

    this.addMessage = function(name, message){
        this.messages[name] = message;
    };

    this.addValidator = function(name, callback){
        this.validators[name] = callback;
    };

    this.getValidator = function(name, value, options, field){
        if(this.validators[name] === undefined){
            return false;
        }
        return this.validators[name](value, options, field);
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
            $para = "";
            $input = null;
            $type = null;
            if(key.indexOf(".") > -1){
                $type = key.split(".");
            }

            if(value.indexOf("array") > -1){
                $para = "[]";
                value.replace("array", "");
                if($type !== null){
                    $input = jQuery(form_name + " " + $type[0] + "[name=\"" + $type[1] + "[]\"]");
                }
                else{
                    $input = jQuery(form_name + " input[name=\"" + key + "[]\"]");
                }
            }
            else{
                if($type !== null){
                    $input = jQuery(form_name + " " + $type[0] + "[name=\"" + $type[1] + "\"]");
                }
                else{
                    $input = jQuery(form_name + " input[name=\"" + key + "\"]");
                }
                $input.data("validators", value);
            }

            if(!(value.indexOf("nofollow") > -1)){
                value.replace("nofollow", "");
                $input.on("keyup blur", $this.keyChange);
            }
        });
        this.form.on("submit", $this.submit);
    };

    this.keyChange = function(event){
        $input = jQuery(this);
        $this.validateInput($input, true, null, "KEYDOWN");
    };

    this.validateInput = function(input, show, v, type){
        if(input !== undefined && input !== null){
            $name = "";
            if(input[0] === undefined){
                $name = input.selector.substring(input.selector.indexOf("\"") + 1, input.selector.lastIndexOf("\"")).replace("[", "").replace("]", "");
            }
            else{
                $name = input[0].name;
            }

            if(v === null){
                if(input.data("validators") !== undefined && input.data("validators") !== null){
                    $validators = input.data("validators").split("|");
                }
                else{
                    $this.addInvalidInput($name);
                    return [];
                }
            }
            else{
                $validators = v.split("|");
            }
            $result = [];
            jQuery.each($validators, function(key, value){
                if(value.length > 0){
                    if(value.indexOf(":") > -1){
                        $options = value.split(":");
                        $result[value] = $this.getValidator($options[0], input.val(), $options[1], input);
                    }
                    else{
                        $result[value] = $this.getValidator(value, input.val(), null, input);
                    }
                }
            });

            $this.addValidInput($name);
            $errors = [];
            for(key in $result){
                $value = $result[key];
                if($value === false){
                    if(key.indexOf(":") > -1){
                        $options = key.split(":");
                        $errors[$options[0]] = $this.getMessage($options[0]).replace("{option}", $options[1]).replace("{value}", $options[0]).replace("{field}", $name);
                    }
                    else{
                        $errors[key] = $this.getMessage(key).replace("{field}", $name).replace("{value}", input.val());
                    }
                    $this.addInvalidInput($name);
                }
            }

            if($this.debug){
                console.log($errors);
            }
            if(show){
                if(Object.keys($errors).length === 0){
                    input.parents(".form-group").removeClass("has-error");
                }
                if($this.location === null){
                    if($this.locations[$name] === undefined){
                        input.parents(".form-group").find(".input-error").html("");
                    }
                    else{
                        jQuery($this.locations[$name].replace("{{fieldname}}", $name)).html("");
                    }
                }
                else{
                    jQuery($this.location.replace("{{fieldname}}", $name)).html("");
                }
                for(key in $errors){
                    $value = $errors[key];
                    if(!(typeof($value) == "string")) continue;
                    input.parents(".form-group").addClass("has-error");
                    if($this.location === null){
                        if($this.locations[$name] === undefined){
                            input.parents(".form-group").find(".input-error").append("<p>" + $value + "</p>");
                        }
                        else{
                            jQuery($this.locations[$name].replace("{{fieldname}}", $name)).append("<p>" + $value + "</p>");
                        }
                    }
                    else{
                        jQuery($this.location.replace("{{fieldname}}", $name)).append("<p>" + $value + "</p>");
                    }

                    if(key === "required"){
                        break;
                    }
                }
            }
            $this.performCallback(type, $name.replace("[", "").replace("]", ""), input, $validators, $errors);
            return $errors;
        }
        return [];
    };

    this.submit = function(event){
        if($this.wildcards.length >= 1){
            if($this.debug){
                for(var i = 0; i < $this.wildcards.length; i++){
                    console.log("WILDCARD: " + $this.wildcards[i]);
                }
            }

            $exists = false;
            for(var i = 0; i < $this.wildcards.length; i++){
                $type = null;
                if($this.wildcards[i].indexOf(".") > -1){
                    $type = $this.wildcards[i].split(".");
                }

                if($type !== null){
                    if(jQuery(form_name + " " + $type[0] + "[name=\"" + $type[1] + "\"]").length >= 1){
                        $exists = true;
                    }
                }
                else{
                    if(jQuery(form_name + " input[name=\"" + $this.wildcards[i] + "\"]").length >= 1){
                        $exists = true;
                    }
                }
            }

            if($exists){
                if($this.debug){
                    console.log("VALID WILDCARD SUBMIT (DEBUG)");
                    return false;
                }
                return true;
            }
            else{
                return $this.normal();
            }
        }
        else{
            return $this.normal();
        }
        return false;
    };

    this.normal = function(){
        $form = jQuery(this);
        $out = [];
        jQuery.each($this.inputs, function(key, value){
            $type = null;
            if(key.indexOf(".") > -1){
                $type = key.split(".");
            }

            $result = [];
            if(value.indexOf("array") > -1){
                if($type !== null){
                    $result = $this.validateInput(jQuery(form_name + " " + $type[0] + "[name=\"" + $type[1] + "[]\"]"), true, value, "SUBMIT");
                }
                else{
                    $result = $this.validateInput(jQuery(form_name + " input[name=\"" + key + "[]\"]"), true, value, "SUBMIT");
                }
            }
            else{
                if($type !== null){
                    $result = $this.validateInput(jQuery(form_name + " " + $type[0] + "[name=\"" + $type[1] + "\"]"), true, value, "SUBMIT");
                }
                else{
                    $result = $this.validateInput(jQuery(form_name + " input[name=\"" + key + "\"]"), true, value, "SUBMIT");
                }
            }

            if(Object.keys($result).length > 0){
                $out[key] = true;
            }
        });
        if(Object.keys($out).length >= 1){
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

    this.addValidator("required", function(value, options, field){
        return /\S/.test(value);
    });
    this.addMessage("required", "Dit veld is verplicht");

    this.addValidator("min", function(value, options, field){
        if(options === null){
            return false;
        }
        if(value == undefined){
            return false;
        }
        if(value.length >= options){
            return true;
        }
        return false;
    });
    this.addMessage("min", "Je moet minimaal {option} tekens hebben.");

    this.addValidator("max", function(value, options, field){
        if(options === null){
            return false;
        }
        if(value == undefined){
            return false;
        }
        if(value.length <= options){
            return true;
        }
        return false;
    });
    this.addMessage("max", "Je mag maximaal {option} tekens hebben.");

    this.addValidator("min-value", function(value, options, field){
        if(options === null){
            return false;
        }
        if(!(/^\d+$/.test(value))){
            return null;
        }
        if(parseInt(value) >= parseInt(options)){
            return true;
        }
        return false;
    });
    this.addMessage("min-value", "{field} moet meer zijn dan {option}.");

    this.addValidator("max-value", function(value, options, field){
        if(options === null){
            return false;
        }
        if(!(/^\d+$/.test(value))){
            return null;
        }
        if(parseInt(value) <= parseInt(options)){
            return true;
        }
        return false;
    });
    this.addMessage("max-value", "{field} mag niet meer zijn dan {option}.");

    this.addValidator("alpha", function(value, options, field){
        if(value == undefined){
            return false;
        }
        if(value.length >= 1){
            return /^[-_ a-zA-Z]+$/.test(value);
        }
        return true;
    });
    this.addMessage("alpha", "Je mag alleen alfabetische letters.");

    this.addValidator("email", function(value, options, field){
        return /^(\b[\w\.-]+@[\w\.-]+\.\w{2,4})+$/.test(value);
    });
    this.addMessage("email", "Dit moet een email zijn");

    this.addValidator("url_protocol", function(value, options, field){
        return /^(http(s)?):\/\/[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)+$/.test(value);
    });
    this.addMessage("url_protocol", "Dit moet een url zijn met protocol");

    this.addValidator("url", function(value, options, field){
        return /[(www\.)?a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-zA-Z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&\/\/=]*)+$/.test(value);
    });
    this.addMessage("url", "Dit moet een url zijn");

    this.addValidator("alphanum", function(value, options, field){
        return /^[0-9a-zA-Z ]+$/.test(value);
    });
    this.addMessage("alphanum", "Hier mogen alleen nummers en letters in.");

    this.addValidator("integer", function(value, options, field){
        return /^[0-9]+$/.test(value);
    });
    this.addMessage("integer", "Hier mogen alleen nummers in.");

    this.addValidator("equals", function(value, options, field){
        $type = null;
        if(options.indexOf(".") > -1){
            $type = options.split(".");
        }

        if($type !== null){
            $field = jQuery(form_name + " " + $type[0] + "[name=\"" + $type[1] + "\"]");
        }
        else{
            $field = jQuery(form_name + " input[name=\"" + options + "\"]");
        }

        if($field === undefined){
            return false;
        }
        if($field.val() === value){
            return true;
        }
        return false;
    });
    this.addMessage("equals", "Het veld {field} komt niet overeen met het veld {option}");

    this.addValidator("min-count", function(value, options, field){
        if(field.length >= options){
            return true;
        }
        return false;
    });
    this.addMessage("min-count", "Je moet minimaal {option} {field} hebben.");

    this.addValidator("array", function(value, options, field){
        return true;
    });
    this.addValidator("nofollow", function(value, options, field){
        return true;
    });
    this.addValidator("in", function(value, options, field){
        $options = options.split(",");
        for($i = 0; $i < $options.length; $i++){
            if($options[$i] === value){
                return true;
            }
        }
        return false;
    });
    this.addMessage("in", "Deze invoer is niet correct.");
    this.addValidator("postcode", function(value, options, field){
        return /^[1-9][0-9]{3}\h*[A-Z]{2}$/.test(value);
    });
    this.addMessage("postcode", "Dit moet een postcode zijn.");
    this.addValidator("btw", function(value, options, field){
        return /^NL[A-Z0-9]{9,9}B[A-Z0-9]{2,2}$/.test(value);
    });
    this.addMessage("btw", "Dit moet een btw nummer zijn.");
    this.addValidator("telephone", function(value, options, field){
        return /(^\+[0-9]{2}|^\+[0-9]{2}\(0\)|^\(\+[0-9]{2}\)\(0\)|^00[0-9]{2}|^0)([0-9]{9}$|[0-9\-\s]{10}$)/.test(value);
    });
    this.addMessage("telephone", "Dit moet een telefoon nummer zijn.");
    this.addValidator("checked", function(value, options, field){
        if(jQuery(field.selector + ":checked").length >= 1){
            return true;
        }
        return false;
    });
    this.addMessage("checked", "Dit veld moet aangevinkt zijn.");
};
