var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId
var Handlebars = require('handlebars');

//index numbering for tables
Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

//exporting the functions
module.exports = {
    getAllUsers: (usrId) => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    blockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        status1: false
                    }
                })
            resolve()
        })
    },
    unblockUser: (userId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION).updateOne({ _id: objectId(userId) },
                {
                    $set: {
                        status1: true
                    }
                })
            resolve()
        })
    },
    addCategory: (catData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).insertOne(catData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    deleteCategory: (catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).deleteOne({ _id: objectId(catId) }).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ Category: objectId(catId) }).then(() => {
                    resolve()
                })
            })
        })
    },
    addSubCategory: (subCatData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUB_CATEGORY_COLLECTION).insertOne(subCatData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllSubCategory: (subcatg) => {
        return new Promise(async (resolve, reject) => {
            let subcategory = await db.get().collection(collection.SUB_CATEGORY_COLLECTION).find().toArray()
            resolve(subcategory)
        })
    },
    deleteSubCategory: (subId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.SUB_CATEGORY_COLLECTION).deleteOne({ _id: objectId(subId) }).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ SubCategory: objectId(subId) }).then(() => {
                    resolve()
                })
            })
        })
    },
    addBrands: (brandsData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).insertOne(brandsData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllBrands: () => {
        return new Promise(async (resolve, reject) => {
            let brands = await db.get().collection(collection.BRAND_COLLECTION).find().toArray()
            resolve(brands)
        })
    },
    deleteBrands: (brandId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BRAND_COLLECTION).deleteOne({ _id: objectId(brandId) }).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ Brands: objectId(brandId) }).then(() => {
                    resolve()
                })
            })
        })
    },
    getAllOrders: () => {
        return new Promise(async (resolve, reject) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION)
                .find().toArray()
            console.log(orders);
            resolve(orders)
        })
    }, getOrderProductsAdmin: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        Name: '$product.Name',
                        Category: '$product.Category',
                        subcategory: '$product.SubCategory',
                        Brands: '$product.Brands',
                        Price: '$product.Price',
                        Images: '$product.Images'

                    }
                },
                {
                    $lookup: {
                        from: collection.CATEGORY_COLLECTION,
                        localField: 'Category',
                        foreignField: '_id',
                        as: 'Category'
                    }
                },
                {
                    $lookup: {
                        from: collection.SUB_CATEGORY_COLLECTION,
                        localField: 'SubCategory',
                        foreignField: '_id',
                        as: 'SubCategory'
                    }
                },
                {
                    $lookup: {
                        from: collection.BRAND_COLLECTION,
                        localField: 'Brands',
                        foreignField: '_id',
                        as: 'Brands'
                    }
                },
                {
                    $unwind: '$Images'
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }, Name: 1, Category: '$Category.Name', SubCategory: 'SubCategory.Name', Brands: '$Brands.Name', Images: 1, Price: 1
                    }
                }
            ]).toArray()
            console.log(orderItems);
            resolve(orderItems)
        })
    },
    adminCancelOrder: (orderId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: {
                            status: 'cancelled'
                        }
                    }).then((response) => {
                        resolve(response)
                    })
        })
    },
    addBanner: (body) => {
        return new Promise((resolve, reject) => {
            let proObj = {
                Name: body.Name,
                Images: body.Images
            }
            db.get().collection(collection.BANNER_COLLECTION).insertOne(proObj).then(() => {
                resolve()
            })
        })
    },
    getAllBanner: () => {
        return new Promise(async (resolve, reject) => {
            let banner = await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
            resolve(banner)
        })
    },
    deleteBanner: (bannerData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.BANNER_COLLECTION).deleteOne({ _id: objectId(bannerData) }).then(() => {
                resolve()
            })
        })
    },//chart section
    getGraphDetails: () => {
        return new Promise(async (resolve, reject) => {
            let week = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    timeStamp: {
                        $gte: new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000),
                    },
                })
                .sort({ timeStamp: -1 })
                .toArray();

            resolve(week);
        });
    },

    getMonthDetails: () => {
        return new Promise(async (resolve, reject) => {
            let month = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    timeStamp: {
                        $gte: new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000),
                    },
                })
                .sort({ timeStamp: -1 })
                .toArray();

            resolve(month);
        });
    },

    getYearDetails: () => {
        return new Promise(async (resolve, reject) => {
            let month = await db
                .get()
                .collection(collection.ORDER_COLLECTION)
                .find({
                    timeStamp: {
                        $gte: new Date(new Date().getTime() - 365 * 24 * 60 * 60 * 1000),
                    },
                })
                .sort({ timeStamp: -1 })
                .toArray();

            resolve(month);
        });
    },
    getLastweekOrders: (orderId, status) => {
        return new Promise(async (resolve, reject) => {
          await db
            .get()
            .collection(collections.ORDER_COLLECTION)
            .find({
              timeStamp: {
                $gte: new Date(new Date() - 7 * 60 * 60 * 24 * 1000),
              },
            })
            .toArray()
            .then((data) => {
              resolve(data);
            });
        });
      },
    
      codTotal: () => {
        return new Promise(async (resolve, reject) => {
          var codTotal = await db
            .get()
            .collection(collections.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { paymentMethod: "COD" },
              },
              {
                $unwind: "$products",
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: { $toInt: "$totalAmount" },
                  },
                },
              },
            ])
            .toArray();
          resolve(codTotal[0]);
        });
      },
    
      razorTotal: () => {
        return new Promise(async (resolve, reject) => {
          var codTotal = await db
            .get()
            .collection(collections.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { paymentMethod: "RazorPay" },
              },
              {
                $unwind: "$products",
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: { $toInt: "$totalAmount" },
                  },
                },
              },
            ])
            .toArray();
          resolve(codTotal[0]);
        });
      },
    
      paypalTotal: () => {
        return new Promise(async (resolve, reject) => {
          var codTotal = await db
            .get()
            .collection(collections.ORDER_COLLECTION)
            .aggregate([
              {
                $match: { paymentMethod: "PayPal"},
              },
              {
                $unwind: "$products",
              },
              {
                $group: {
                  _id: null,
                  total: {
                    $sum: { $toInt: "$totalAmount" },
                  },
                },
              },
            ])
            .toArray();
          resolve(codTotal[0]);
        });
      },
    //chart section end

    //coupon section start
    addCoupon: (couponData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllCoupon: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    deleteCoupon: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponId) }).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ Category: objectId(couponId) }).then(() => {
                    resolve()
                })
            })
        })
    },
    //categoryoffer start
    addOfferCategory: (couponData) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).insertOne(couponData).then((data) => {
                resolve(data.insertedId)
            })
        })
    },
    getAllCategoryOffer: () => {
        return new Promise(async (resolve, reject) => {
            let coupon = await db.get().collection(collection.COUPON_COLLECTION).find().toArray()
            resolve(coupon)
        })
    },
    deleteOfferCategory: (couponId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.COUPON_COLLECTION).deleteOne({ _id: objectId(couponId) }).then(() => {
                db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ Category: objectId(couponId) }).then(() => {
                    resolve()
                })
            })
        })
    }
}
