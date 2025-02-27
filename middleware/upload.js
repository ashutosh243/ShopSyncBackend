const multer= require('multer');

const upload=multer({storage:multer.diskStorage({
   
    destination: function(req,file,cb){
        return cb(null,"./upload/images")
    },
    filename: function(req,file,cb){
        return cb(null,`${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
})});

module.exports=upload;
