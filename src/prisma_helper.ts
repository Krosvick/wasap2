function excludeAttribute(obj : Object, key : string) {
    Object.values(obj).forEach(user => delete (user as any)[key])
}

export default excludeAttribute;