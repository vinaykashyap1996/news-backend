const NewsModel=require('../model/News').newsModel;

exports.postnews=(req,res)=>{
    async.eachLimit(req.body.newsdetails, 2, function (singleNews, eachCallback) {
        async.waterfall([
            //Team Date
            function (innerWaterfallCb) {
                var NewsData = NewsModel({
                    url: singleNews.url,
                    source: singleNews.source,
                    claim: singleNews.claim,
                    claim_url:singleNews.claim_url,
                    label:singleNews.label,
                    date:singleNews.date,
                    author:singleNews.author
                });
                NewsData.save((err, results) => {
                    if (err) {
                        return innerWaterfallCb("Error while inserting employee project details.");
                    }
                    innerWaterfallCb(null);
                });
            }
        ], function (err) {
                if (err) {
                    return eachCallback(err);
                }
                eachCallback(null);
            })
        },function (err) {
            if (err) {
                return res.status(400).json({ message: err });
            }
            res.status(200).json({ message: "Successfully Processed" });
        })
        
}

exports.getnews=(req,res)=>{
    NewsModel.find({},(err,results)=>{
        if(err){
            return res.status(404).json({message:"Error in displaying the content"})
        } 
        res.status(200).json({message:"successfully fetched the data",results})
    })
}