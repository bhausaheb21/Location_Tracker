const { default: mongoose } = require("mongoose");


 exports.connectDB = async () => {
    await mongoose.connect(process.env.DATABASE_URL)
    console.clear()
    console.log("<======================Application Started==========================>");
    console.log("Database Connected");
}