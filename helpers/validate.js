const validator = require('validator');

const validate = (params) => {
    let validateParams = [];

    let name = !validator.isEmpty(params.name) &&
        validator.isLength(params.name, { min: 3 }) &&
        validator.isAlpha(params.name, 'es-ES');

        validateParams.push({
            field: 'name',
            isValid: name,
            error: 'El campo name no puede estar vacio, debe tener minimo 3 caracteres y tener caracteres entre [Aa-zZ]'
        }) ;   

    let surname = !validator.isEmpty(params.surname) &&
        validator.isLength(params.surname, { min: 3 }) &&
        validator.isAlpha(params.surname, 'es-ES');

        validateParams.push({
            field: 'surname',
            isValid: surname,
            error: 'El campo surname no puede estar vacio, debe tener minimo 3 caracteres y tener caracteres entre [Aa-zZ]'   
        }) ;    

    let nick = !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 3 });

    validateParams.push({
        field: 'nick',
        isValid: nick,
        error: 'El campo nick debe no puede estar vacio, debe tener minimo 3 caracteres'
    }) ; 
    
    
    let email = !validator.isEmpty(params.email) &&
    validator.isLength(params.email, { min: 3 }) &&
    validator.isEmail(params.email);

    validateParams.push({
        field: 'email',
        isValid: email,
        error: 'El campo email no puede estar vacio, debe tener minimo 3 caracteres y debe ser un email valido'
    }) ; 

    let password = !validator.isEmpty(params.password);

    validateParams.push({
        field: 'password',
        isValid: password,
        error: 'El campo password debe tener: No puede estar vacio'
    }) ;

    if(params.bio){
        let bio = validator.isLength(params.bio, { max: 255 });

        validateParams.push({
            field: 'bio',
            isValid: bio,
            error: 'El campo bio no puede tener mas de 255 caracteres'
        }) ;
    }

    /** Función para validar resultados y ejecutar excepción en caso de error */
    validateFields(validateParams);
}

const validateFields = (fields) => {
    let errors = "";
    let separador = "";

    fields.forEach(field => {
        if(!field.isValid){
            errors += separador + field.error;
            separador = `  
            `;
        }
    })

    if(errors){
        throw new Error(errors);
    }
}

module.exports = validate;
