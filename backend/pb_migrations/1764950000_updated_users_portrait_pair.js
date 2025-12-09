/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

    // add field
    collection.fields.addAt(11, new Field({
        "hidden": false,
        "id": "bool_portrait_pair",
        "name": "slideshow_portrait_pair",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
    }))

    return app.save(collection)
}, (app) => {
    const collection = app.findCollectionByNameOrId("_pb_users_auth_")

    // remove field
    collection.fields.removeByName("slideshow_portrait_pair")

    return app.save(collection)
})
