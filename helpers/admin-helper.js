var db = require('../config/connection')
var collection = require('../config/collections');
var objectId = require('mongodb').ObjectId
var Handlebars = require('handlebars');
const { response } = require('express');

//index numbering for tables
Handlebars.registerHelper("inc", function (value, options) {
    return parseInt(value) + 1;
});

//exporting the functions
module.exports = {
    getAllUsers: () => {
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
    getAllSubCategory: () => {
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
                        Images: '$product.Images',
                        quantity: 1

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
                            status: 'Cancelled', cancel: true
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
    },
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
    addOfferCategory: (body, catId) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(catId) },
                {
                    $set: {
                        percentage: body.percentage,
                        offername: body.offername
                    }
                })
            resolve()
        })
    },
    getCurrentOrderAdmin: (orderId) => {
        return new Promise((resolve, reject) => {
            let orders = db.get()
                .collection(collection.ORDER_COLLECTION)
                .findOne({ _id: objectId(orderId) })
            resolve(orders)
        })
    },
    changeDeliveryStatus: (orderId, status) => {
        return new Promise((resolve, reject) => {
            db.get()
                .collection(collection.ORDER_COLLECTION)
                .updateOne({ _id: objectId(orderId) },
                    {
                        $set: { status: status }
                    })
            resolve()
        })
    },
    getPaymentMethodNums: (paymentMethod) => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.ORDER_COLLECTION).aggregate(
                [
                    {
                        $match: {
                            paymentMethod: paymentMethod
                        }
                    },
                    {
                        $count: "count"
                    }
                ]
            ).toArray();
            resolve(response);
        })
    },
    //not used
    getRevenue: (unit, count) => {
        return new Promise(async (resolve, reject) => {
            let response = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match:
                    {
                        $expr: {
                            $gt: ["$date", {
                                $dateSubtract:
                                    { startDate: "$$NOW", unit: unit, amount: count }
                            }]
                        }
                    }
                },
                { $group: { _id: null, sum: { $sum: '$totalAmount' } } },
            ]).toArray()
            resolve(response);
        })
    },
    getDeliveryStatusAdmin: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let deliveryvalue = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            resolve(deliveryvalue.status)
        })
    },
    changeOfferStatus: (catId, newoffer) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CATEGORY_COLLECTION).updateOne({ _id: objectId(catId) },
                {
                    $set: {
                        offer: newoffer
                    }
                })
            response.status = true
            resolve(response)
        })
    },
    activateCategoryOffer: (catId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { Category: objectId(catId) }
                },
                {
                    $project: {
                        Name: 1,
                        Category: 1,
                        Stock: 1,
                        Price: 1,
                        Cutprice: 1
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
                    $project: {
                        Name: 1,
                        Categoryoffername: '$Category.offername',
                        Categorypercentage: '$Category.percentage',
                        Stock: 1,
                        Price: 1,
                        Cutprice: 1
                    }
                }
            ]).toArray()

            //mapping
            products.map(async (prod) => {
                let Price = parseInt(prod.Cutprice)
                let discount = (Price * prod.Categorypercentage) / 100;
                Price = parseInt(Price - parseInt(discount));
                console.log("Price", Price);

                await db
                    .get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .updateMany(
                        { _id: objectId(prod._id) },
                        {
                            $set: {
                                Price: Price,
                                offername: prod.Categoryoffername,
                                discountprice: discount,
                                discountpercentage: prod.Categorypercentage,

                            }
                        }
                    );
            })
            resolve()
        })
    },
    deactivateCategoryOffer: (catId) => {
        return new Promise(async (resolve, reject) => {
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    $match: { Category: objectId(catId) }
                },
                {
                    $project: {
                        Name: 1,
                        Category: 1,
                        Stock: 1,
                        Price: 1,
                        Cutprice: 1
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
                    $project: {
                        Name: 1,
                        Categoryoffername: '$Category.offername',
                        Categorypercentage: '$Category.percentage',
                        Stock: 1,
                        Price: 1,
                        Cutprice: 1
                    }
                }
            ]).toArray()

            //mapping
            products.map(async (prod) => {
                let Price = parseInt(prod.Price)
                let discount = (prod.Cutprice * prod.Categorypercentage) / 100;
                Price = parseInt(Price + parseInt(discount));
                let discount1 = (Price * 5) / 100
                let Price1 = Price - discount1
                let defaultpercentage = "5"

                await db
                    .get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .updateMany(
                        { _id: objectId(prod._id) },
                        {
                            $set: {
                                Price: Price1,
                                offername: prod.Categoryoffername,
                                discountprice: discount1,
                                discountpercentage: [defaultpercentage],
                            }
                        }
                    );
            })
            resolve()
        })
    },
    adminIncreaseStock: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let order = await db.get().collection(collection.ORDER_COLLECTION).findOne({ _id: objectId(orderId) })
            let productData = order.products
            for (let i = 0; i < productData.length; i++) {
                db.get()
                    .collection(collection.PRODUCT_COLLECTION)
                    .updateOne(
                        { _id: objectId(productData[i].item) },
                        { $inc: { Stock: productData[i].quantity } }
                    );
            } resolve()
        });
    },
    //working on admin cancel fund to wallet no userid
    AdminCancelAmountWallet: (userId, total) => {
        console.log("userId", userId);
        total = parseInt(total)
        return new Promise((resolve, reject) => {
            db.get().collection(collection.USER_COLLECTION)
                .updateOne({ _id: objectId(userId) }, { $inc: { wallet: total } })
            resolve()
        })
    },
    getChartData: async (yearValue) => {
        yearValue=parseInt(yearValue)

        let data = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    cancel: false
                }
            }, {

                $group: {
                    _id: {
                        truncatedOrderDate: {
                            $dateTrunc: {
                                date: "$date",
                                unit: "month",
                                binSize: 1
                            }
                        }
                    },
                    sumQuantity: {
                        $sum: "$totalAmount"
                    }
                }
            },
            {
                $project: {
                    month: {
                        $month: "$_id.truncatedOrderDate"
                    },
                    year: { $year: "$_id.truncatedOrderDate" },
                    sumQuantity: 1
                }
            },
            {
                $match: {
                    year: yearValue
                }
            }, {
                $sort: {
                    month: 1
                }
            }
        ]).toArray()

        // console.log(data, '++++++++++++test data ', data.length, data[0].year)
        if (data.length < 12) {

            for (let i = 1; i <= 12; i++) {
                let datain = true;
                for (let j = 0; j < data.length; j++) {
                    if (data[j].month === i) {
                        datain = null;
                    }

                }

                if (datain) {
                    data.push({ sumQuantity: 0, month: i })
                }

            }
        }
        await data.sort(function (a, b) {
            return a.month - b.month
        });
        console.log("data", data);
        let linChartData = [];
        data.map((element) => {
            let a = element.sumQuantity
            linChartData.push(a)

        })
        // console.log("linechartdata", linChartData);
        return linChartData
    },
   
    getMonthlySalesReport: async (yearValue) => {
        // console.log("yearValuechange3",yearValue);
        yearValue=parseInt(yearValue)

        let report = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
            {
                $match: {
                    cancel: false
                }
            }, {

                $group: {
                    _id: {
                        truncatedOrderDate: {
                            $dateTrunc: {
                                date: "$date",
                                unit: "month",
                                binSize: 1
                            }
                        }
                    },
                    grandTotal: {
                        $sum: "$totalAmount"
                    }
                }
            },
            {
                $project: {
                    month: {
                        $month: "$_id.truncatedOrderDate"
                    },
                    year: { $year: "$_id.truncatedOrderDate" },
                    grandTotal: 1
                }
            },
            {
                $match: {
                    year: yearValue
                }
            },
             {
                $sort: {
                    month: 1
                }
            }
        ]).toArray()
        console.log("report11111",report);
        if (report.length < 12) {

            for (let i = 1; i <= 12; i++) {
                let datain = true;
                for (let j = 0; j < report.length; j++) {
                    if (report[j].month === i) {
                        datain = null;
                    }

                }

                if (datain) {
                    report.push({ grandTotal: 0, month: i })
                }

            }
        }
        await report.sort(function (a, b) {
            return a.month - b.month
        });
        return (report)
    },
    getYear:()=>{
        return new Promise(async(resolve,reject)=>{
            let listedYears= await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $group:{_id:{year:{$year:"$date"}}}
                },
                {
                    $project:{year:"$_id.year",_id:0}
                },
                {
                    $sort:{year:-1}
                }
            ]).toArray()
            console.log("listedYears",listedYears);
            resolve(listedYears)
        })
    },
    getUserCount:()=>{
        return new Promise(async(resolve,reject)=>{
          let userCount= await db.get().collection(collection.USER_COLLECTION).count()
            console.log("userCount",userCount);
            resolve(userCount)
        })
    }
   
}
