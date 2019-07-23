var copy = function (obj, struct) {
    //logger.info(typeof obj);

    const propNames = Object.getOwnPropertyNames(struct);
    propNames.forEach(function (name) {
        const desc = Object.getOwnPropertyDescriptor(struct, name);
        Object.defineProperty(obj, name, desc);
    });
    return obj;
}





module.exports = {
    copy: copy,
}