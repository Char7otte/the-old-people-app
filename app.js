const express = require("express");
const path = require("path");
const sql = require("mssql");
const dotenv = require("dotenv");
const methodOverride = require("method-override");

dotenv.config();

//import functions from alertRoutes
const alertController = require("./alert/controllers/alertController");
const { validateAlert, validateAlertId } = require("./alert/middlewares/alertValidation");
//import functions from userRoutes
const userController = require("./users/controllers/userController");
const { validateUserInput, verifyJWT } = require("./users/middlewares/userValidation");



//Import chat functions
const chatController = require("./chat/controllers/chatController");
const chatMessageController = require("./chat/controllers/chatMessageController");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//routes for alerts
app.get("/alerts", alertController.getAllAlerts);
app.get("/alerts/:id", validateAlertId, alertController.getAlertById);
app.post("/alerts", validateAlert, alertController.createAlert);
app.put("/alerts/:id", validateAlertId, validateAlert, alertController.updateAlert);
app.delete("/alerts/:id", validateAlertId, alertController.deleteAlert);


//routes for users
app.post("/users/register",validateUserInput, userController.createUser);// User registration #okay
app.post("/users/login", userController.loginUser);// User login #okay
app.put("/users/changepassword/:id", verifyJWT, userController.changePassword); // Change user password #okay
//rotes for user management
app.get("/users",verifyJWT,userController.getAllUsers); // Get all users #okay
app.get("/users/username/:username",verifyJWT, userController.getUserByUsername); // Get user by username
app.put("/users/updatedetail/:id", verifyJWT, validateUserInput, userController.updateUser); // Update user details #okay
app.delete("/users/:id",verifyJWT, userController.deleteUser); //OKay

//Charlotte's Chat routes
app.get("/chats", chatController.getAllChats);
// app.get("/chats/:chatID", chatController.getChatByID);
app.post("/chats/create/:userID", chatController.createChat);
app.delete("/chats/:chatID", chatController.deleteChat);

app.get("/chats/:chatID", chatMessageController.getAllMessagesInAChat);
app.post("/chats/:chatID", chatMessageController.createMessage);
app.delete("/chats/:chatID", chatMessageController.deleteMessage);
app.patch("/chats/:chatID", chatMessageController.editMessage);


app.listen(port, () => {
    console.log("Server running on port " + port);
});

app.get("/", async (req, res) => {
    res.render("./index.html");
});

process.on("SIGINT", async () => {
    console.log("Server is gracefully shutting down");
    await sql.close();
    console.log("Database connections closed");
    process.exit(0);
}); 