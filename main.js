const docString = `
I'm just having fun here, trying to imitate Clojure Fulcro
in JavaScript. It may be interesting someday.

Basically the idea is to have graph DB, and data-based
query language, that allows to query it as deeply, and
having as many joins, as you want.

There are idents, and collections of this idents. Idents
allow queries to be implemented simply as obj access.

You make all operations on write, and then reads should be
super-duper fast

Next step is to add mutations mechanisms, and make DB
nicely observable (meaning it should inform about changes in it),
as every nice DB should be
`

const defaults = {
    string: Symbol('string'),
    number: Symbol('number'),
    obj: Symbol('obj'),
    arr: Symbol('arr'),
    map: Symbol('map'),
    set: Symbol('set'),
    symbol: Symbol('symbol')
}

const db = {
    uiPeople: [{personById: 1}, {personById: 2}, {personById: 3}, {personById: 4}],
    otherPeople: [{personById: 2}, {personById: 3}],
    personById: {
        1: {name: 'Zofia', ego: 'huge'},
        2: {name: 'Janek', ego: 'huge',
            friends: [{personById: 1}, {personById: 4}, {personById: 2}]},
        3: {name: 'Halyna', ego: 'medium'},
        4: {name: 'Duhast', ego: 'dope',
            friends: [{personById: 1}, {petById: 1}]},
    },
    petById: {
        1: {name: 'hello', race: 'dog'}
    },
    nicePets: [{petById: 1}, {petById: 2}]
}

const stop = Symbol('stop')

const notFound = Symbol('not-found')

const defaultRace = Symbol()

const query = {
    otherPeople: { name: defaults.string,
                   friends: { friends: { race: defaultRace, name: defaults.string, ego: defaults.number },
                              ego: defaults.number }
                 },
    nicePets: { race: defaultRace }
}

const notFoundCollection = {
    [defaults.string]: 'string that was not found',
    [defaultRace]: 'doggy dog'
}

const collectionsToData = (db, collections, notFoundCollection) => {
    return collections.map(
        ([collection, qKeys]) => {
            const result = collection.map(item => {
                const [key] = Object.keys(item)
                const [value] = Object.values(item)

                const collectionFromDb = db[key]
                const ret = collectionFromDb[value]

                if (!ret) {
                    console.error(`You've queried for item: { ${key}: ${value} }, that is not located in your DB`)

                    return notFound
                }

                const someShit = Object.keys(qKeys)
                      .map(qKey => [qKey, ret[qKey], qKeys[qKey]])

                return someShit
                    .reduce((acc, [q, k, qk]) => {
                        if (k) {
                            if (Array.isArray(k)) {
                                const stepFurther = collectionsToData(db, [[k].concat([qKeys[q]])], notFoundCollection)[0]

                                return Object.assign(acc, {[q]: stepFurther})
                            }

                            return Object.assign(acc, {[q]: k})
                        }

                        if (typeof qk === 'symbol') {
                            // we're quering for single value, and we did not found it
                            return Object.assign(acc, {[q]: notFoundCollection[qk] || qk})
                        }

                        // we're quering for collection, and we did not found it
                        return Object.assign(acc, {[q]: notFound})
                    }, {})
            })

            return result
        }
    )
}

const doQuery = (db, query, notFoundCollection) => {
    const keys = Object.keys(query)
    const collections = keys.map(k => [db[k], query[k]])

    return collectionsToData(db, collections, notFoundCollection)
}

doQuery(db, query, notFoundCollection)
