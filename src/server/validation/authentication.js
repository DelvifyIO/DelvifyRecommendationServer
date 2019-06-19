import validator from "validator";

const validate = (data) => {
    let errors = {};
    data.username = data.username || '';
    data.password = data.password || '';
    if (validator.isEmpty(data.username)) {
        errors.username = "Username is required";
    }
    if (validator.isEmpty(data.password)) {
        errors.password = "Password is required";
    }
    return { errors, isValid: _.isEmpty(errors) }
};

export default validate;