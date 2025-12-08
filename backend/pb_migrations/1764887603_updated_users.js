/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number2849551107",
    "max": 3600,
    "min": 5,
    "name": "slideshow_interval",
    "onlyInt": false,
    "presentable": false,
    "required": true,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "select3569772305",
    "maxSelect": 1,
    "name": "slideshow_fit",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "cover",
      "contain"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("number2849551107")

  // remove field
  collection.fields.removeById("select3569772305")

  return app.save(collection)
})
