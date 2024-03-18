function excludeAttrByMany(obj : object[], key : string) {
    Object.values(obj).forEach(data => delete (data as any)[key])
}

function excludeAttrByOne(obj : object, keyToDelete : string) {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => key !== keyToDelete));
}

export {excludeAttrByOne, excludeAttrByMany};