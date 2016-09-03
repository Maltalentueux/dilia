export const customFormats = {
    'mongodbId': /^[a-fA-F0-9]{24}$/i,
    'alpha': /^[A-Z]+$/i,
    'alphanumeric': /^[0-9A-Z]+$/i,
    'numeric': /^[-+]?[0-9]+$/,
    'hexadecimal': /^[0-9A-F]+$/i,
    'hexcolor': /^#?([0-9A-F]{3}|[0-9A-F]{6})$/i,
    'decimal': /^[-+]?([0-9]+|\.[0-9]+|[0-9]+\.[0-9]+)$/,
    'float': /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/,
    'int': /^(?:[-+]?(?:0|[1-9][0-9]*))$/,
    'base64': /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i,
    'uuid': /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    'data-uri': /^\s*data:([a-z]+\/[a-z0-9\-\+]+(;[a-z\-]+\=[a-z0-9\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i
};
