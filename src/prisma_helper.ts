function excludeAttrByMany(obj : Object[], key : string) {
    Object.values(obj).forEach(user => delete (user as any)[key])
}

function excludeAttrByOne(obj : Object, keyToDelete : string) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== keyToDelete));
}

export {excludeAttrByOne, excludeAttrByMany};