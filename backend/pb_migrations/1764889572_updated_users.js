/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // add field
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "select4051275711",
    "maxSelect": 1,
    "name": "slideshow_order",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": [
      "newest",
      "oldest",
      "random",
      "random_daily",
      "random_hourly"
    ]
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("_pb_users_auth_")

  // remove field
  collection.fields.removeById("select4051275711")

  return app.save(collection)
})
